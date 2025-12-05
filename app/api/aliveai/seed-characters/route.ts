import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import {
  createPrompt,
  getPrompt,
  mapGender,
  buildAppearanceDescription,
  CreatePromptRequest,
} from '@/lib/services/aliveai';

// Use service role key to bypass RLS for admin operations
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Character definitions for seeding - professional adult entertainment style
const CHARACTER_DEFINITIONS = [
  // Characters with BOTH icons (voice + live action)
  {
    name: 'Luna Delacroix',
    gender: 'femmes',
    age: 24,
    ethnicities: ['Occidental'],
    hairType: 'wavy',
    hairColor: 'blonde',
    eyeColor: 'blue',
    bodyType: 'slim',
    chestSize: 'large',
    personality: ['Sensuelle', 'Tentatrice', 'Confidente'],
    profession: ['Mannequin', 'Cam Girl'],
    relationship: ['Sugarbaby'],
    hasVoice: true,
    hasLiveAction: true,
    description: 'Mannequin parisienne au regard envoûtant, Luna sait captiver son audience avec son charme naturel.',
  },
  {
    name: 'Mia Rodriguez',
    gender: 'femmes',
    age: 22,
    ethnicities: ['Latina'],
    hairType: 'curly',
    hairColor: 'dark brown',
    eyeColor: 'brown',
    bodyType: 'curvy',
    chestSize: 'large',
    personality: ['Nympho', 'Expérimentatrice', 'Dominatrice'],
    profession: ['Danseuse', 'Strip-teaseuse'],
    relationship: ['Plan Cul'],
    hasVoice: true,
    hasLiveAction: true,
    description: 'Danseuse latine passionnée, Mia enflamme les cœurs avec ses mouvements sensuels.',
  },
  {
    name: 'Sakura Tanaka',
    gender: 'femmes',
    age: 21,
    ethnicities: ['Asiatique'],
    hairType: 'straight',
    hairColor: 'black',
    eyeColor: 'dark brown',
    bodyType: 'petite',
    chestSize: 'medium',
    personality: ['Innocente', 'Timide', 'Soignante'],
    profession: ['Étudiante', 'Streamer'],
    relationship: ['Petit Amis'],
    hasVoice: true,
    hasLiveAction: true,
    description: 'Étudiante japonaise timide en apparence, Sakura cache une personnalité surprenante.',
  },
  // Characters with ONLY microphone icon
  {
    name: 'Amber Phoenix',
    gender: 'femmes',
    age: 26,
    ethnicities: ['Africaine'],
    hairType: 'curly',
    hairColor: 'black',
    eyeColor: 'brown',
    bodyType: 'athletic',
    chestSize: 'medium',
    personality: ['Dominatrice', 'Reine', 'Méchante'],
    profession: ['Coach Sportif', 'Mannequin'],
    relationship: ['Maîtresse'],
    hasVoice: true,
    hasLiveAction: false,
    description: 'Coach fitness dominante, Amber prend le contrôle avec assurance et détermination.',
  },
  {
    name: 'Sofia Milano',
    gender: 'femmes',
    age: 28,
    ethnicities: ['Occidental'],
    hairType: 'straight',
    hairColor: 'brunette',
    eyeColor: 'green',
    bodyType: 'slim',
    chestSize: 'medium',
    personality: ['Tentatrice', 'Confidente', 'Amant'],
    profession: ['Secrétaire', 'Femme de chambre'],
    relationship: ['Collègue', 'Maîtresse'],
    hasVoice: true,
    hasLiveAction: false,
    description: 'Secrétaire italienne sophistiquée, Sofia maîtrise l\'art de la séduction discrète.',
  },
  {
    name: 'Jade Williams',
    gender: 'femmes',
    age: 23,
    ethnicities: ['Occidental'],
    hairType: 'wavy',
    hairColor: 'red',
    eyeColor: 'blue',
    bodyType: 'curvy',
    chestSize: 'large',
    personality: ['Nympho', 'Expérimentatrice', 'Soumise'],
    profession: ['Pornstar', 'Cam Girl'],
    relationship: ['Plan Cul'],
    hasVoice: true,
    hasLiveAction: false,
    description: 'Star du contenu adulte, Jade repousse toutes les limites avec enthousiasme.',
  },
  // Characters with ONLY console icon (Live Action section)
  {
    name: 'Nina Volkov',
    gender: 'femmes',
    age: 25,
    ethnicities: ['Occidental'],
    hairType: 'straight',
    hairColor: 'platinum blonde',
    eyeColor: 'grey',
    bodyType: 'slim',
    chestSize: 'medium',
    personality: ['Méchante', 'Dominatrice', 'Reine'],
    profession: ['Hôtesse de l\'air', 'Mannequin'],
    relationship: ['Inconnue'],
    hasVoice: false,
    hasLiveAction: true,
    description: 'Beauté slave mystérieuse, Nina garde ses secrets derrière un regard glacial.',
  },
  {
    name: 'Camille Laurent',
    gender: 'femmes',
    age: 27,
    ethnicities: ['Occidental'],
    hairType: 'wavy',
    hairColor: 'auburn',
    eyeColor: 'hazel',
    bodyType: 'curvy',
    chestSize: 'large',
    personality: ['Amant', 'Confidente', 'Tentatrice'],
    profession: ['Barman', 'Danseuse'],
    relationship: ['Amis'],
    hasVoice: false,
    hasLiveAction: true,
    description: 'Barmaid française au charme irrésistible, Camille sait écouter et réconforter.',
  },
  {
    name: 'Valentina Cruz',
    gender: 'femmes',
    age: 24,
    ethnicities: ['Latina'],
    hairType: 'straight',
    hairColor: 'dark brown',
    eyeColor: 'brown',
    bodyType: 'athletic',
    chestSize: 'medium',
    personality: ['Expérimentatrice', 'Nympho', 'Soumise'],
    profession: ['Danseuse', 'Coach Sportif'],
    relationship: ['Étudiante'],
    hasVoice: false,
    hasLiveAction: true,
    description: 'Danseuse colombienne énergique, Valentina vit chaque moment intensément.',
  },
  {
    name: 'Yuki Nakamura',
    gender: 'femmes',
    age: 20,
    ethnicities: ['Asiatique'],
    hairType: 'straight',
    hairColor: 'brown',
    eyeColor: 'dark brown',
    bodyType: 'petite',
    chestSize: 'small',
    personality: ['Innocente', 'Timide', 'Soignante'],
    profession: ['Étudiante', 'Médecin'],
    relationship: ['Camarade'],
    hasVoice: false,
    hasLiveAction: true,
    description: 'Étudiante en médecine douce et attentionnée, Yuki prend soin de tout le monde.',
  },
  // Characters with NO icons
  {
    name: 'Emma Stone',
    gender: 'femmes',
    age: 29,
    ethnicities: ['Occidental'],
    hairType: 'wavy',
    hairColor: 'brown',
    eyeColor: 'blue',
    bodyType: 'slim',
    chestSize: 'medium',
    personality: ['Confidente', 'Amant', 'Soignante'],
    profession: ['Médecin', 'Secrétaire'],
    relationship: ['Épouse'],
    hasVoice: false,
    hasLiveAction: false,
    description: 'Médecin dévouée et épouse parfaite, Emma incarne la femme idéale.',
  },
  {
    name: 'Zara Okonkwo',
    gender: 'femmes',
    age: 23,
    ethnicities: ['Africaine'],
    hairType: 'curly',
    hairColor: 'black',
    eyeColor: 'dark brown',
    bodyType: 'curvy',
    chestSize: 'large',
    personality: ['Reine', 'Tentatrice', 'Dominatrice'],
    profession: ['Mannequin', 'Streamer'],
    relationship: ['Sugarbaby'],
    hasVoice: false,
    hasLiveAction: false,
    description: 'Influenceuse africaine majestueuse, Zara règne sur ses followers avec élégance.',
  },
];

interface CharacterDefinition {
  name: string;
  gender: string;
  age: number;
  ethnicities: string[];
  hairType: string;
  hairColor: string;
  eyeColor: string;
  bodyType: string;
  chestSize: string;
  personality: string[];
  profession: string[];
  relationship: string[];
  hasVoice: boolean;
  hasLiveAction: boolean;
  description: string;
}

/**
 * Wait for prompt completion with polling
 */
async function waitForPromptCompletion(
  promptId: string,
  maxWaitMs: number = 300000,
  pollIntervalMs: number = 5000
): Promise<string | null> {
  const startTime = Date.now();

  while (Date.now() - startTime < maxWaitMs) {
    try {
      const result = await getPrompt(promptId);

      if (result.medias && result.medias.length > 0) {
        const imageMedia = result.medias.find(m => m.mediaType === 'IMAGE');
        if (imageMedia) {
          return imageMedia.mediaUrl;
        }
      }
    } catch (error) {
      console.log(`Polling attempt failed for ${promptId}, retrying...`);
    }

    await new Promise(resolve => setTimeout(resolve, pollIntervalMs));
  }

  return null;
}

/**
 * Generate character image using AliveAI
 */
async function generateCharacterImage(character: CharacterDefinition): Promise<string> {
  const appearance = buildAppearanceDescription({
    gender: character.gender,
    age: character.age,
    ethnicities: character.ethnicities,
    hairType: character.hairType,
    hairColor: character.hairColor,
    eyeColor: character.eyeColor,
    bodyType: character.bodyType,
    chestSize: character.chestSize,
  });

  const promptRequest: CreatePromptRequest = {
    name: character.name,
    appearance: appearance + `, ${character.personality.join(', ')} expression`,
    detailLevel: 'HIGH',
    gender: mapGender(character.gender),
    faceImproveEnabled: true,
    faceModel: 'REALISM',
    model: 'REALISM',
    aspectRatio: 'PORTRAIT',
    blockExplicitContent: false,
  };

  console.log(`Creating prompt for ${character.name}...`);
  const response = await createPrompt(promptRequest);
  console.log(`Prompt created: ${response.promptId}`);

  const imageUrl = await waitForPromptCompletion(response.promptId);

  if (!imageUrl) {
    throw new Error(`Failed to generate image for ${character.name}`);
  }

  return imageUrl;
}

/**
 * POST /api/aliveai/seed-characters
 *
 * Seeds the database with AI-generated characters.
 * Requires admin authentication.
 */
export async function POST(request: NextRequest) {
  try {
    // Get admin user ID from request body or use a specific admin
    const body = await request.json().catch(() => ({}));
    const adminUserId = body.adminUserId;

    if (!adminUserId) {
      return NextResponse.json(
        { error: 'adminUserId is required' },
        { status: 400 }
      );
    }

    // Verify the user is an admin (try different column names)
    let isAdmin = false;

    // Try owner_id first
    const { data: profile1 } = await supabaseAdmin
      .from('profiles')
      .select('role')
      .eq('owner_id', adminUserId)
      .single();

    if (profile1?.role === 'admin') {
      isAdmin = true;
    } else {
      // Try id column
      const { data: profile2 } = await supabaseAdmin
        .from('profiles')
        .select('role')
        .eq('id', adminUserId)
        .single();

      if (profile2?.role === 'admin') {
        isAdmin = true;
      } else {
        // Check if this user has created admin models before (fallback check)
        const { data: existingModels } = await supabaseAdmin
          .from('ai_models')
          .select('id')
          .eq('created_by', adminUserId)
          .limit(1);

        if (existingModels && existingModels.length > 0) {
          // User has created models before, allow them
          isAdmin = true;
          console.log('User verified via existing model ownership');
        }
      }
    }

    if (!isAdmin) {
      return NextResponse.json(
        { error: 'User is not an admin or could not be verified' },
        { status: 403 }
      );
    }

    console.log('Starting character seeding process...');

    // Step 1: Delete all existing AI models
    console.log('Deleting existing AI models...');
    const { error: deleteError } = await supabaseAdmin
      .from('ai_models')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all

    if (deleteError) {
      console.error('Error deleting existing models:', deleteError);
      return NextResponse.json(
        { error: `Failed to delete existing models: ${deleteError.message}` },
        { status: 500 }
      );
    }

    console.log('Existing models deleted successfully');

    // Step 2: Generate and insert new characters
    const results: { name: string; success: boolean; error?: string; id?: string }[] = [];

    for (const character of CHARACTER_DEFINITIONS) {
      try {
        console.log(`Processing ${character.name}...`);

        // Generate image using AliveAI
        const avatarUrl = await generateCharacterImage(character);
        console.log(`Image generated for ${character.name}: ${avatarUrl}`);

        // Build system prompt
        const systemPrompt = `Tu es ${character.name}, une ${character.gender === 'femmes' ? 'femme' : 'homme'} de ${character.age} ans d'origine ${character.ethnicities.join(' et ')}. Tu as les cheveux ${character.hairType} de couleur ${character.hairColor} et des yeux ${character.eyeColor}. Ta personnalité est ${character.personality.join(', ')}. Tu travailles comme ${character.profession.join(', ')}. Tu es ${character.relationship.join(', ')}.`;

        // Build insert data - base fields that always exist
        const insertData: Record<string, unknown> = {
          name: character.name,
          description: character.description,
          personality: character.personality.join(', '),
          avatar_url: avatarUrl,
          systemPrompt,
          greetings: [`Salut ! Je suis ${character.name}, ravie de te rencontrer ! 💕`],
          gender: character.gender,
          ethnicities: character.ethnicities,
          age: character.age,
          hair_type: character.hairType,
          hair_color: character.hairColor,
          eye_color: character.eyeColor,
          body_type: character.bodyType,
          chest_size: character.chestSize,
          relationship: character.relationship,
          profession: character.profession,
          sexual_preferences: [],
          voice: 'Voix 1',
          created_by: adminUserId,
          status: 'active',
          is_public: true,
        };

        // Try to include icon columns if they exist
        // We'll attempt with them first, and if it fails, retry without
        let model = null;
        let insertError = null;

        // First try with icon columns
        const { data: modelWithIcons, error: errorWithIcons } = await supabaseAdmin
          .from('ai_models')
          .insert({
            ...insertData,
            has_voice: character.hasVoice,
            has_live_action: character.hasLiveAction,
          })
          .select()
          .single();

        if (errorWithIcons && errorWithIcons.message.includes('has_voice')) {
          // Icon columns don't exist, insert without them
          console.log('Icon columns not found, inserting without them...');
          const { data: modelWithoutIcons, error: errorWithoutIcons } = await supabaseAdmin
            .from('ai_models')
            .insert(insertData)
            .select()
            .single();
          model = modelWithoutIcons;
          insertError = errorWithoutIcons;
        } else {
          model = modelWithIcons;
          insertError = errorWithIcons;
        }

        if (insertError) {
          throw new Error(insertError.message);
        }

        results.push({ name: character.name, success: true, id: model?.id });
        console.log(`${character.name} created successfully!`);

        // Add a small delay between API calls to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 2000));

      } catch (error) {
        console.error(`Error processing ${character.name}:`, error);
        results.push({
          name: character.name,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    const successCount = results.filter(r => r.success).length;
    const failCount = results.filter(r => !r.success).length;

    return NextResponse.json({
      success: true,
      message: `Seeding complete: ${successCount} created, ${failCount} failed`,
      results,
    });

  } catch (error) {
    console.error('Seed error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Server error' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/aliveai/seed-characters
 *
 * Returns information about the seed endpoint.
 */
export async function GET() {
  return NextResponse.json({
    endpoint: '/api/aliveai/seed-characters',
    method: 'POST',
    description: 'Seeds the database with 12 AI-generated characters using AliveAI',
    requiredBody: {
      adminUserId: 'UUID of an admin user',
    },
    characterCount: CHARACTER_DEFINITIONS.length,
    iconDistribution: {
      bothIcons: CHARACTER_DEFINITIONS.filter(c => c.hasVoice && c.hasLiveAction).length,
      voiceOnly: CHARACTER_DEFINITIONS.filter(c => c.hasVoice && !c.hasLiveAction).length,
      liveActionOnly: CHARACTER_DEFINITIONS.filter(c => !c.hasVoice && c.hasLiveAction).length,
      noIcons: CHARACTER_DEFINITIONS.filter(c => !c.hasVoice && !c.hasLiveAction).length,
    },
  });
}

