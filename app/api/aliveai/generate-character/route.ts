import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabaseServer';
import {
  createPrompt,
  getPrompt,
  getPromptQueueStatus,
  mapGender,
  mapEthnicityToLocation,
  buildAppearanceDescription,
  CreatePromptRequest,
} from '@/lib/services/aliveai';

/**
 * POST /api/aliveai/generate-character
 * 
 * Generate an AI character image using the AliveAI API.
 * This endpoint creates a prompt and returns the promptId for tracking.
 * The client can then poll for completion or use WebSocket for real-time updates.
 */
export async function POST(request: NextRequest) {
  try {
    // Authenticate user
    const supabase = await createSupabaseServerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    // Parse request body
    const body = await request.json();
    const {
      name,
      gender,
      age,
      ethnicities,
      hairType,
      hairColor,
      eyeColor,
      bodyType,
      chestSize,
      personality,
      customPrompt, // New: user's custom prompt for the image
    } = body;

    // Validate required fields
    if (!name || !gender || !age || !ethnicities?.length) {
      return NextResponse.json(
        { error: 'Champs requis manquants: name, gender, age, ethnicities' },
        { status: 400 }
      );
    }

    // Build appearance description with custom prompt included
    const fullAppearance = buildAppearanceDescription({
      gender,
      age: Number(age),
      ethnicities: Array.isArray(ethnicities) ? ethnicities : [ethnicities],
      hairType: hairType || 'straight',
      hairColor: hairColor || 'brown',
      eyeColor: eyeColor || 'brown',
      bodyType: bodyType || 'slim',
      chestSize: chestSize || 'medium',
      customPrompt: customPrompt, // Include custom prompt in appearance
    });

    // Add personality expression if provided
    let appearanceWithPersonality = fullAppearance;
    if (personality) {
      const personalityStr = Array.isArray(personality) ? personality.join(', ') : personality;
      appearanceWithPersonality = fullAppearance.replace(
        ', high quality, photorealistic',
        `, ${personalityStr} expression, high quality, photorealistic`
      );
    }

    console.log('[AliveAI] Full appearance prompt:', appearanceWithPersonality);
    console.log('[AliveAI] Custom prompt received:', customPrompt);

    // Create AliveAI prompt request
    // Use custom prompt in BOTH appearance AND scene fields for maximum effect
    const promptRequest: CreatePromptRequest = {
      name,
      appearance: appearanceWithPersonality,
      detailLevel: 'HIGH',
      gender: mapGender(gender),
      fromLocation: mapEthnicityToLocation(
        Array.isArray(ethnicities) ? ethnicities : [ethnicities]
      ),
      faceImproveEnabled: true,
      faceModel: 'REALISM',
      model: 'REALISM',
      aspectRatio: 'PORTRAIT',
      blockExplicitContent: false,
      // Set scene field with custom prompt for additional context
      scene: customPrompt && customPrompt.trim() ? customPrompt.trim() : undefined,
    };

    console.log('[AliveAI] Full request:', JSON.stringify(promptRequest, null, 2));

    // Create the prompt with AliveAI
    const response = await createPrompt(promptRequest);

    return NextResponse.json({
      success: true,
      promptId: response.promptId,
      seed: response.seed,
      message: 'Génération d\'image en cours...',
    });

  } catch (error) {
    console.error('AliveAI generate-character error:', error);

    const errorMessage = error instanceof Error ? error.message : 'Erreur serveur';

    // Check for rate limiting errors from AliveAI API
    if (errorMessage.includes('Max pending creations') ||
        errorMessage.includes('Too many requests') ||
        errorMessage.includes('rate limit')) {
      return NextResponse.json(
        {
          error: 'Le service de génération d\'images est temporairement surchargé. Veuillez réessayer dans quelques minutes.',
          code: 'RATE_LIMITED',
          retryAfter: 60, // Suggest retry after 60 seconds
        },
        { status: 429 }
      );
    }

    // Check for authentication errors
    if (errorMessage.includes('401') || errorMessage.includes('Unauthorized')) {
      return NextResponse.json(
        {
          error: 'Erreur d\'authentification avec le service de génération d\'images.',
          code: 'AUTH_ERROR',
        },
        { status: 503 }
      );
    }

    // Generic server error
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}

/**
 * GET /api/aliveai/generate-character?promptId=xxx
 *
 * Check the status of a character generation prompt.
 * Returns the generated image URL when complete.
 */
export async function GET(request: NextRequest) {
  try {
    // Authenticate user
    const supabase = await createSupabaseServerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    // Get promptId from query params
    const { searchParams } = new URL(request.url);
    const promptId = searchParams.get('promptId');

    if (!promptId) {
      return NextResponse.json(
        { error: 'promptId requis' },
        { status: 400 }
      );
    }

    // Get prompt status from AliveAI
    let result;
    try {
      result = await getPrompt(promptId);
    } catch (apiError) {
      // Log but don't fail - treat as "still processing" for transient errors
      console.warn('[AliveAI] Error fetching prompt status:', apiError);
      const errorMessage = apiError instanceof Error ? apiError.message : 'Unknown error';

      // Check if it's a permanent error (e.g., prompt not found)
      if (errorMessage.includes('404') || errorMessage.includes('not found')) {
        return NextResponse.json({
          success: false,
          status: 'failed',
          isComplete: true,
          error: 'Prompt non trouvé',
          message: 'Le prompt n\'existe pas ou a expiré',
        });
      }

      // For other errors (network, timeout, etc.), return as still processing
      // so the client can retry
      return NextResponse.json({
        success: true,
        status: 'processing',
        isComplete: false,
        promptId: promptId,
        message: 'Génération en cours... (reconnexion)',
        retryable: true,
      });
    }

    // Check if the API returned an error status
    if (result.isError) {
      return NextResponse.json({
        success: false,
        status: 'failed',
        isComplete: true,
        error: result.errorMessage || 'La génération a échoué',
        promptId: result.promptId,
      });
    }

    // Check if we have media results
    const imageMedia = result.medias?.find(m => m.mediaType === 'IMAGE');

    if (imageMedia) {
      return NextResponse.json({
        success: true,
        status: 'completed',
        isComplete: true,
        imageUrl: imageMedia.mediaUrl,
        mediaId: imageMedia.id,
        promptId: result.promptId,
      });
    }

    // Still processing - get queue status for better progress info
    let queueInfo = null;
    try {
      queueInfo = await getPromptQueueStatus(promptId);
    } catch (queueError) {
      console.warn('[AliveAI] Could not get queue status:', queueError);
    }

    return NextResponse.json({
      success: true,
      status: 'processing',
      isComplete: false,
      promptId: result.promptId,
      message: queueInfo?.inQueue
        ? `En file d'attente (position ${queueInfo.queuePosition + 1})...`
        : 'Génération en cours...',
      queuePosition: queueInfo?.queuePosition ?? -1,
      progress: queueInfo?.progress ?? 0,
      inQueue: queueInfo?.inQueue ?? true,
    });

  } catch (error) {
    console.error('AliveAI get-prompt error:', error);
    // Return as processing with retryable flag instead of 500
    // This allows the client to continue polling
    return NextResponse.json({
      success: true,
      status: 'processing',
      isComplete: false,
      message: 'Erreur temporaire, nouvelle tentative...',
      retryable: true,
      error: error instanceof Error ? error.message : 'Erreur serveur',
    });
  }
}

