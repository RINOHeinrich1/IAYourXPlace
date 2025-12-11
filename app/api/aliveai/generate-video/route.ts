import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabaseServer';
import {
  createImageToVideo,
  getPrompt,
  CreateImageToVideoRequest,
} from '@/lib/services/aliveai';

/**
 * POST /api/aliveai/generate-video
 * 
 * Generate a video from an image using the AliveAI API.
 * Requires a mediaId from a previously generated image.
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
      mediaId,
      text,
      videoLength = 'SHORT', // Default to SHORT (5 seconds)
      videoFrameRate = 'LOW', // Default to LOW for faster processing
    } = body;

    // Validate required fields
    if (!mediaId) {
      return NextResponse.json(
        { error: 'mediaId est requis (ID de l\'image source)' },
        { status: 400 }
      );
    }

    if (!text || text.trim().length === 0) {
      return NextResponse.json(
        { error: 'text est requis (description de la vidéo)' },
        { status: 400 }
      );
    }

    if (text.length > 300) {
      return NextResponse.json(
        { error: 'text ne doit pas dépasser 300 caractères' },
        { status: 400 }
      );
    }

    console.log('[AliveAI Video] Creating video from image:', mediaId);
    console.log('[AliveAI Video] Text prompt:', text);

    // Create AliveAI video request
    const videoRequest: CreateImageToVideoRequest = {
      mediaId,
      text: text.trim(),
      videoLength,
      videoFrameRate,
    };

    console.log('[AliveAI Video] Full request:', JSON.stringify(videoRequest, null, 2));

    // Create the video prompt with AliveAI
    const response = await createImageToVideo(videoRequest);

    return NextResponse.json({
      success: true,
      promptId: response.promptId,
      seed: response.seed,
      message: 'Génération de vidéo en cours... Cela peut prendre plusieurs minutes.',
    });

  } catch (error) {
    console.error('AliveAI generate-video error:', error);

    const errorMessage = error instanceof Error ? error.message : 'Erreur serveur';

    // Check for rate limiting errors from AliveAI API
    if (errorMessage.includes('Max pending creations') ||
        errorMessage.includes('Too many requests') ||
        errorMessage.includes('rate limit')) {
      return NextResponse.json(
        {
          error: 'Le service de génération de vidéos est temporairement surchargé. Veuillez réessayer dans quelques minutes.',
          code: 'RATE_LIMITED',
          retryAfter: 120, // Videos take longer, suggest 2 minutes
        },
        { status: 429 }
      );
    }

    // Check for authentication errors
    if (errorMessage.includes('401') || errorMessage.includes('Unauthorized')) {
      return NextResponse.json(
        {
          error: 'Erreur d\'authentification avec le service de génération de vidéos.',
          code: 'AUTH_ERROR',
        },
        { status: 503 }
      );
    }

    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}

/**
 * GET /api/aliveai/generate-video?promptId=xxx
 *
 * Check the status of a video generation prompt.
 * Returns the generated video URL when complete.
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
      console.warn('[AliveAI Video] Error fetching prompt status:', apiError);
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
        message: 'Génération de vidéo en cours... (reconnexion)',
        retryable: true,
      });
    }

    // Check if the API returned an error status
    if (result.isError) {
      return NextResponse.json({
        success: false,
        status: 'failed',
        isComplete: true,
        error: result.errorMessage || 'La génération de vidéo a échoué',
        promptId: result.promptId,
      });
    }

    // Check if we have video media results
    const videoMedia = result.medias?.find(m => m.mediaType === 'VIDEO');

    if (videoMedia) {
      return NextResponse.json({
        success: true,
        status: 'completed',
        isComplete: true,
        videoUrl: videoMedia.mediaUrl,
        mediaId: videoMedia.id,
        promptId: result.promptId,
      });
    }

    // Still processing
    return NextResponse.json({
      success: true,
      status: 'processing',
      isComplete: false,
      promptId: result.promptId,
      message: 'Génération de vidéo en cours...',
    });

  } catch (error) {
    console.error('AliveAI get-video-prompt error:', error);
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

