import { NextRequest, NextResponse } from 'next/server';
import {
  createPrompt,
  getPrompt,
  mapGender,
  mapEthnicityToLocation,
  buildAppearanceDescription,
  CreatePromptRequest,
} from '@/lib/services/aliveai';

/* =========================================================
   POST → Lancer la génération AliveAI
========================================================= */
export async function POST(request: NextRequest) {
  try {
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
      customPrompt,
    } = body;

    if (!name || !gender || !age || !ethnicities?.length) {
      return NextResponse.json(
        { error: 'Champs requis manquants' },
        { status: 400 }
      );
    }

    // Construire le prompt visuel
    const appearance = buildAppearanceDescription({
      gender,
      age: Number(age),
      ethnicities,
      hairType: hairType ?? 'straight',
      hairColor: hairColor ?? 'black',
      eyeColor: eyeColor ?? 'brown',
      bodyType: bodyType ?? 'slim',
      chestSize: chestSize ?? 'medium',
      customPrompt,
    });

    const finalAppearance = personality
      ? appearance.replace(
          ', high quality, photorealistic',
          `, ${personality} expression, high quality, photorealistic`
        )
      : appearance;

    const promptRequest: CreatePromptRequest = {
      name,
      appearance: finalAppearance,
      detailLevel: 'HIGH',
      gender: mapGender(gender),
      fromLocation: mapEthnicityToLocation(ethnicities),
      faceImproveEnabled: true,
      faceModel: 'REALISM',
      model: 'REALISM',
      aspectRatio: 'PORTRAIT',
      blockExplicitContent: false,
      scene: customPrompt?.trim() || undefined,
    };

    console.log('[AliveAI] Prompt envoyé:', promptRequest);

    const result = await createPrompt(promptRequest);

    return NextResponse.json({
      success: true,
      promptId: result.promptId,
      seed: result.seed,
    });

  } catch (error: any) {
    console.error('[AliveAI POST ERROR]', error);
    return NextResponse.json(
      { error: error.message || 'Erreur serveur AliveAI' },
      { status: 500 }
    );
  }
}

/* =========================================================
   GET → Vérifier l’état de la génération et retourner l’image
========================================================= */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const promptId = searchParams.get('promptId');

    if (!promptId) {
      return NextResponse.json(
        { error: 'promptId requis' },
        { status: 400 }
      );
    }

    const result = await getPrompt(promptId);

    const image = result.medias?.find(
      (m) => m.mediaType === 'IMAGE' && m.mediaUrl
    );

    if (!image) {
      return NextResponse.json({
        success: true,
        isComplete: false,
        status: 'processing',
      });
    }

    return NextResponse.json({
      success: true,
      isComplete: true,
      imageUrl: image.mediaUrl,
      promptId,
    });

  } catch (error: any) {
    console.error('[AliveAI GET ERROR]', error);
    return NextResponse.json(
      { error: error.message || 'Erreur récupération image' },
      { status: 500 }
    );
  }
}
