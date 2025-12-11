/**
 * AliveAI API Service
 * 
 * This module provides functions to interact with the AliveAI API for AI character
 * image generation. It handles authentication, prompt creation, and progress tracking.
 * 
 * API Documentation: https://api-doc.aliveai.app/
 */

// AliveAI API Configuration
const ALIVEAI_API_URL = process.env.ALIVEAI_API_URL || 'https://api.aliveai.app';
const ALIVEAI_SERVER_ID = process.env.ALIVEAI_SERVER_ID || 'r9orK';

// Type definitions based on AliveAI API documentation
export type Gender = 'MALE' | 'FEMALE' | 'TRANS';
export type Model = 'DEFAULT' | 'REALISM' | 'ANIME' | 'TEMPORARY';
export type DetailLevel = 'MEDIUM' | 'HIGH';
export type AspectRatio = 'DEFAULT' | 'SQUARE' | 'PORTRAIT' | 'LANDSCAPE';
export type FaceModel = 'REALISM' | 'CREATIVE';
export type VideoLength = 'SHORT' | 'MEDIUM'; // SHORT = 5s, MEDIUM = 10s
export type VideoFrameRate = 'LOW' | 'MEDIUM' | 'HIGH';

export interface CreatePromptRequest {
  // Required fields
  name: string;
  appearance: string;
  detailLevel: DetailLevel;
  // Optional fields
  seed?: string;
  gender?: Gender;
  background?: string;
  fromLocation?: string;
  faceDetails?: string;
  faceImproveEnabled?: boolean;
  faceModel?: FaceModel;
  faceImproveStrength?: number;
  negativeDetails?: string;
  scene?: string;
  model?: Model;
  blockExplicitContent?: boolean;
  aspectRatio?: AspectRatio;
  cfg?: number;
}

export interface CreatePromptResponse {
  promptId: string;
  seed: string;
  promptContainer?: PromptContainer;
}

export interface MediaResponse {
  mediaUrl: string;
  mediaType: 'IMAGE' | 'VIDEO';
  id: string;
}

export interface PromptContainer {
  promptId: string;
  medias: MediaResponse[];
  isFavorite?: boolean;
  // Error handling fields that AliveAI API may return
  isError?: boolean;
  errorMessage?: string;
  status?: string;
}

export interface PromptProgressResponse {
  promptId: string;
  progress: number;
  isComplete: boolean;
  promptContainer?: PromptContainer;
  isError?: boolean;
  message?: string;
  queuePosition: number;
}

/**
 * Request to create a video from an image
 * API Endpoint: POST /prompts/image-to-video
 */
export interface CreateImageToVideoRequest {
  mediaId: string;         // Required: ID of the source image
  text: string;            // Required: Motion/action description (1-300 chars)
  seed?: string;           // Optional: Seed for reproducibility
  lastFrameMediaId?: string;
  customImage?: boolean;
  scene?: string;
  createdFromPromptId?: string;
  videoLength?: VideoLength;     // SHORT (5s) or MEDIUM (10s)
  videoFrameRate?: VideoFrameRate; // LOW, MEDIUM, or HIGH
}

/**
 * Get the AliveAI API token from environment variables
 */
function getApiToken(): string {
  const token = process.env.ALIVEAI_API_TOKEN;
  if (!token) {
    throw new Error('ALIVEAI_API_TOKEN is not configured');
  }
  return token;
}

/**
 * Helper function to fetch with retries for handling intermittent connection timeouts
 * @param url - The URL to fetch
 * @param options - Fetch options
 * @param maxRetries - Maximum number of retry attempts
 * @returns The fetch response
 */
async function fetchWithRetry(
  url: string,
  options: RequestInit,
  maxRetries: number = 3
): Promise<Response> {
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`[AliveAI] Attempt ${attempt}/${maxRetries} for ${options.method} ${url}`);
      const response = await fetch(url, options);
      return response;
    } catch (error) {
      lastError = error as Error;
      console.log(`[AliveAI] Attempt ${attempt} failed: ${lastError.message}`);

      // Check if it's a connection timeout error
      const isTimeoutError = lastError.message.includes('fetch failed') ||
                             lastError.cause?.toString().includes('ConnectTimeoutError');

      if (isTimeoutError && attempt < maxRetries) {
        // Wait before retrying (exponential backoff: 2s, 4s, 8s...)
        const waitTime = Math.pow(2, attempt) * 1000;
        console.log(`[AliveAI] Waiting ${waitTime}ms before retry...`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
        continue;
      }

      // If not a timeout error or last attempt, throw immediately
      throw lastError;
    }
  }

  throw lastError || new Error('All retry attempts failed');
}

/**
 * Create a new AI character image prompt
 *
 * @param request - The prompt creation request
 * @returns The created prompt response with promptId
 */
export async function createPrompt(request: CreatePromptRequest): Promise<CreatePromptResponse> {
  const token = getApiToken();

  const url = new URL('/prompts', ALIVEAI_API_URL);
  url.searchParams.set('serverId', ALIVEAI_SERVER_ID);

  const response = await fetchWithRetry(url.toString(), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      `AliveAI API error: ${response.status} - ${errorData.detail || errorData.message || response.statusText}`
    );
  }

  return response.json();
}

/**
 * Get the status and result of a prompt
 *
 * @param promptId - The ID of the prompt to check
 * @returns The prompt container with media results
 */
export async function getPrompt(promptId: string): Promise<PromptContainer> {
  const token = getApiToken();

  const response = await fetchWithRetry(`${ALIVEAI_API_URL}/prompts/${promptId}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      `AliveAI API error: ${response.status} - ${errorData.detail || errorData.message || response.statusText}`
    );
  }

  return response.json();
}

/**
 * Create a video from an existing image using AliveAI
 *
 * @param request - The video creation request with mediaId and text prompt
 * @returns The created prompt response with promptId
 */
export async function createImageToVideo(request: CreateImageToVideoRequest): Promise<CreatePromptResponse> {
  const token = getApiToken();

  const url = new URL('/prompts/image-to-video', ALIVEAI_API_URL);
  url.searchParams.set('serverId', ALIVEAI_SERVER_ID);

  const response = await fetchWithRetry(url.toString(), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      `AliveAI API error: ${response.status} - ${errorData.detail || errorData.message || response.statusText}`
    );
  }

  return response.json();
}

/**
 * Response from the pending queue endpoint
 */
export interface PendingQueueResponse {
  queue: Array<{
    promptId: string;
    queuePosition: number;
    video: boolean;
    progress: number;
  }>;
}

/**
 * Get the pending prompts queue from AliveAI
 *
 * @returns The pending queue with positions and progress
 */
export async function getPendingQueue(): Promise<PendingQueueResponse> {
  const token = getApiToken();

  const response = await fetchWithRetry(`${ALIVEAI_API_URL}/prompts/pending`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      `AliveAI API error: ${response.status} - ${errorData.detail || errorData.message || response.statusText}`
    );
  }

  return response.json();
}

/**
 * Get the queue position and progress for a specific prompt
 *
 * @param promptId - The ID of the prompt to check
 * @returns The queue position and progress, or null if not in queue (completed or not found)
 */
export async function getPromptQueueStatus(promptId: string): Promise<{
  queuePosition: number;
  progress: number;
  inQueue: boolean;
} | null> {
  try {
    const pendingQueue = await getPendingQueue();
    const promptInQueue = pendingQueue.queue.find(p => p.promptId === promptId);

    if (promptInQueue) {
      return {
        queuePosition: promptInQueue.queuePosition,
        progress: promptInQueue.progress,
        inQueue: true,
      };
    }

    return { queuePosition: -1, progress: 100, inQueue: false };
  } catch (error) {
    console.warn('[AliveAI] Error fetching queue status:', error);
    return null;
  }
}

/**
 * Get the WebSocket URL for tracking prompt progress
 *
 * @param promptId - The ID of the prompt to track
 * @returns The WebSocket URL
 */
export function getPromptWebSocketUrl(promptId: string): string {
  return `wss://api.aliveai.app/ws/prompts/${promptId}`;
}

/**
 * Map our app's ethnicity values to AliveAI fromLocation
 */
export function mapEthnicityToLocation(ethnicities: string[]): string {
  const locationMap: Record<string, string> = {
    'Occidental': 'EUROPE',
    'Asiatique': 'ASIA',
    'Africaine': 'AFRICA',
    'Latina': 'LATIN_AMERICA',
  };

  // Return the first mapped location or a default
  for (const ethnicity of ethnicities) {
    if (locationMap[ethnicity]) {
      return locationMap[ethnicity];
    }
  }
  return 'EUROPE';
}

/**
 * Map our app's gender values to AliveAI Gender type
 */
export function mapGender(gender: string): Gender {
  if (gender === 'hommes') return 'MALE';
  if (gender === 'femmes') return 'FEMALE';
  return 'FEMALE';
}

/**
 * Build an appearance description from character attributes
 *
 * @param params - Character physical attributes
 * @param customPrompt - Optional custom prompt for accessories, clothing, pose, etc.
 * @returns Formatted appearance description for AliveAI API
 */
export function buildAppearanceDescription(params: {
  gender: string;
  age: number;
  ethnicities: string[];
  hairType: string;
  hairColor: string;
  eyeColor: string;
  bodyType: string;
  chestSize: string;
  customPrompt?: string;
}): string {
  const genderWord = params.gender === 'femmes' ? 'woman' : 'man';
  const ethnicityDesc = params.ethnicities.join(' and ');

  const parts = [
    `A beautiful ${ethnicityDesc} ${genderWord}`,
    `${params.age} years old`,
    `${params.hairType} ${params.hairColor} hair`,
    `${params.eyeColor} eyes`,
    `${params.bodyType} body type`,
  ];

  if (params.gender === 'femmes' && params.chestSize) {
    parts.push(`${params.chestSize} chest`);
  }

  // Add custom prompt BEFORE the quality modifiers so it's more prominent
  if (params.customPrompt && params.customPrompt.trim()) {
    parts.push(params.customPrompt.trim());
  }

  return parts.join(', ') + ', high quality, photorealistic';
}

/**
 * Poll for prompt completion with timeout
 *
 * @param promptId - The ID of the prompt to poll
 * @param maxWaitMs - Maximum time to wait in milliseconds (default: 5 minutes)
 * @param pollIntervalMs - Interval between polls in milliseconds (default: 3 seconds)
 * @returns The completed prompt container with media
 */
export async function waitForPromptCompletion(
  promptId: string,
  maxWaitMs: number = 300000,
  pollIntervalMs: number = 3000
): Promise<PromptContainer> {
  const startTime = Date.now();

  while (Date.now() - startTime < maxWaitMs) {
    const result = await getPrompt(promptId);

    // Check if we have media results
    if (result.medias && result.medias.length > 0) {
      return result;
    }

    // Wait before next poll
    await new Promise(resolve => setTimeout(resolve, pollIntervalMs));
  }

  throw new Error('Timeout waiting for AI image generation');
}

/**
 * Create an AI character image and wait for completion
 *
 * This is a convenience function that combines createPrompt and waitForPromptCompletion
 */
export async function generateCharacterImage(params: {
  name: string;
  gender: string;
  age: number;
  ethnicities: string[];
  hairType: string;
  hairColor: string;
  eyeColor: string;
  bodyType: string;
  chestSize: string;
  personality?: string;
}): Promise<{ promptId: string; imageUrl: string }> {
  const appearance = buildAppearanceDescription({
    gender: params.gender,
    age: params.age,
    ethnicities: params.ethnicities,
    hairType: params.hairType,
    hairColor: params.hairColor,
    eyeColor: params.eyeColor,
    bodyType: params.bodyType,
    chestSize: params.chestSize,
  });

  const request: CreatePromptRequest = {
    name: params.name,
    appearance,
    detailLevel: 'HIGH',
    gender: mapGender(params.gender),
    fromLocation: mapEthnicityToLocation(params.ethnicities),
    faceImproveEnabled: true,
    faceModel: 'REALISM',
    model: 'REALISM',
    aspectRatio: 'PORTRAIT',
  };

  // Create the prompt
  const createResponse = await createPrompt(request);

  // Wait for completion
  const result = await waitForPromptCompletion(createResponse.promptId);

  // Get the first image URL
  const imageMedia = result.medias.find(m => m.mediaType === 'IMAGE');
  if (!imageMedia) {
    throw new Error('No image generated');
  }

  return {
    promptId: createResponse.promptId,
    imageUrl: imageMedia.mediaUrl,
  };
}

