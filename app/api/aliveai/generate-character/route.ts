import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabaseServer';
import {
  createPrompt,
  getPrompt,
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

    // Build appearance description from character attributes
    const baseAppearance = buildAppearanceDescription({
      gender,
      age: Number(age),
      ethnicities: Array.isArray(ethnicities) ? ethnicities : [ethnicities],
      hairType: hairType || 'straight',
      hairColor: hairColor || 'brown',
      eyeColor: eyeColor || 'brown',
      bodyType: bodyType || 'slim',
      chestSize: chestSize || 'medium',
    });

    // Build full appearance: base + personality + custom prompt
    let fullAppearance = baseAppearance;
    if (personality) {
      const personalityStr = Array.isArray(personality) ? personality.join(', ') : personality;
      fullAppearance += `, ${personalityStr} expression`;
    }

    // Add custom prompt if provided - this allows for more creative/improvised generations
    if (customPrompt && typeof customPrompt === 'string' && customPrompt.trim()) {
      fullAppearance += `, ${customPrompt.trim()}`;
    }

    // Create AliveAI prompt request
    const promptRequest: CreatePromptRequest = {
      name,
      appearance: fullAppearance,
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
    };

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
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erreur serveur' },
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
    const result = await getPrompt(promptId);

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

    // Still processing
    return NextResponse.json({
      success: true,
      status: 'processing',
      isComplete: false,
      promptId: result.promptId,
      message: 'Génération en cours...',
    });

  } catch (error) {
    console.error('AliveAI get-prompt error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erreur serveur' },
      { status: 500 }
    );
  }
}

