import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Use service role key to bypass RLS for admin operations
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// The 12 original characters we want to restore
const TARGET_CHARACTERS = [
  'Luna Delacroix', 'Mia Rodriguez', 'Sakura Tanaka', 'Amber Phoenix',
  'Sofia Milano', 'Jade Williams', 'Nina Volkov', 'Camille Laurent',
  'Valentina Cruz', 'Yuki Nakamura', 'Emma Stone', 'Zara Okonkwo'
];

// Character metadata for database insertion
const CHARACTER_METADATA: Record<string, {
  description: string;
  personality: string;
  gender: string;
  age: number;
  ethnicities: string[];
  hairType: string;
  hairColor: string;
  eyeColor: string;
  bodyType: string;
  chestSize: string;
  relationship: string[];
  profession: string[];
  hasVoice: boolean;
  hasLiveAction: boolean;
}> = {
  'Luna Delacroix': { description: 'Mannequin parisienne au regard envoûtant', personality: 'Sensuelle, Tentatrice, Confidente', gender: 'femmes', age: 24, ethnicities: ['Occidental'], hairType: 'wavy', hairColor: 'blonde', eyeColor: 'blue', bodyType: 'slim', chestSize: 'large', relationship: ['Sugarbaby'], profession: ['Mannequin', 'Cam Girl'], hasVoice: true, hasLiveAction: true },
  'Mia Rodriguez': { description: 'Danseuse latine passionnée', personality: 'Nympho, Expérimentatrice, Dominatrice', gender: 'femmes', age: 22, ethnicities: ['Latina'], hairType: 'curly', hairColor: 'dark brown', eyeColor: 'brown', bodyType: 'curvy', chestSize: 'large', relationship: ['Plan Cul'], profession: ['Danseuse', 'Strip-teaseuse'], hasVoice: true, hasLiveAction: true },
  'Sakura Tanaka': { description: 'Étudiante japonaise timide', personality: 'Innocente, Timide, Soignante', gender: 'femmes', age: 21, ethnicities: ['Asiatique'], hairType: 'straight', hairColor: 'black', eyeColor: 'dark brown', bodyType: 'petite', chestSize: 'medium', relationship: ['Petit Amis'], profession: ['Étudiante', 'Streamer'], hasVoice: true, hasLiveAction: true },
  'Amber Phoenix': { description: 'Coach fitness dominante', personality: 'Dominatrice, Reine, Méchante', gender: 'femmes', age: 26, ethnicities: ['Africaine'], hairType: 'curly', hairColor: 'black', eyeColor: 'brown', bodyType: 'athletic', chestSize: 'medium', relationship: ['Maîtresse'], profession: ['Coach Sportif', 'Mannequin'], hasVoice: true, hasLiveAction: false },
  'Sofia Milano': { description: 'Secrétaire italienne sophistiquée', personality: 'Tentatrice, Confidente, Amant', gender: 'femmes', age: 28, ethnicities: ['Occidental'], hairType: 'straight', hairColor: 'brunette', eyeColor: 'green', bodyType: 'slim', chestSize: 'medium', relationship: ['Collègue', 'Maîtresse'], profession: ['Secrétaire', 'Femme de chambre'], hasVoice: true, hasLiveAction: false },
  'Jade Williams': { description: 'Star du contenu adulte', personality: 'Nympho, Expérimentatrice, Soumise', gender: 'femmes', age: 23, ethnicities: ['Occidental'], hairType: 'wavy', hairColor: 'red', eyeColor: 'blue', bodyType: 'curvy', chestSize: 'large', relationship: ['Plan Cul'], profession: ['Pornstar', 'Cam Girl'], hasVoice: true, hasLiveAction: false },
  'Nina Volkov': { description: 'Beauté slave mystérieuse', personality: 'Méchante, Dominatrice, Reine', gender: 'femmes', age: 25, ethnicities: ['Occidental'], hairType: 'straight', hairColor: 'platinum blonde', eyeColor: 'grey', bodyType: 'slim', chestSize: 'medium', relationship: ['Inconnue'], profession: ['Hôtesse de l\'air', 'Mannequin'], hasVoice: false, hasLiveAction: true },
  'Camille Laurent': { description: 'Barmaid française au charme irrésistible', personality: 'Amant, Confidente, Tentatrice', gender: 'femmes', age: 27, ethnicities: ['Occidental'], hairType: 'wavy', hairColor: 'auburn', eyeColor: 'hazel', bodyType: 'curvy', chestSize: 'large', relationship: ['Amis'], profession: ['Barman', 'Danseuse'], hasVoice: false, hasLiveAction: true },
  'Valentina Cruz': { description: 'Danseuse colombienne énergique', personality: 'Expérimentatrice, Nympho, Soumise', gender: 'femmes', age: 24, ethnicities: ['Latina'], hairType: 'straight', hairColor: 'dark brown', eyeColor: 'brown', bodyType: 'athletic', chestSize: 'medium', relationship: ['Étudiante'], profession: ['Danseuse', 'Coach Sportif'], hasVoice: false, hasLiveAction: true },
  'Yuki Nakamura': { description: 'Étudiante en médecine douce', personality: 'Innocente, Timide, Soignante', gender: 'femmes', age: 20, ethnicities: ['Asiatique'], hairType: 'straight', hairColor: 'brown', eyeColor: 'dark brown', bodyType: 'petite', chestSize: 'small', relationship: ['Camarade'], profession: ['Étudiante', 'Médecin'], hasVoice: false, hasLiveAction: true },
  'Emma Stone': { description: 'Actrice américaine célèbre', personality: 'Confidente, Amant, Soignante', gender: 'femmes', age: 29, ethnicities: ['Occidental'], hairType: 'wavy', hairColor: 'brown', eyeColor: 'blue', bodyType: 'slim', chestSize: 'medium', relationship: ['Célébrité'], profession: ['Actrice', 'Mannequin'], hasVoice: false, hasLiveAction: false },
  'Zara Okonkwo': { description: 'Mannequin africaine audacieuse', personality: 'Reine, Tentatrice, Dominatrice', gender: 'femmes', age: 23, ethnicities: ['Africaine'], hairType: 'curly', hairColor: 'black', eyeColor: 'dark brown', bodyType: 'curvy', chestSize: 'large', relationship: ['Inconnue'], profession: ['Mannequin', 'Influenceuse'], hasVoice: false, hasLiveAction: false },
};

interface AliveAIPrompt {
  promptId: string;
  originalPrompt: { name: string };
  medias: Array<{ mediaUrl: string; mediaType: string }>;
}

async function fetchAllAliveAIPrompts(): Promise<AliveAIPrompt[]> {
  const token = process.env.ALIVEAI_API_TOKEN;
  const allPrompts: AliveAIPrompt[] = [];
  
  for (let page = 0; page < 10; page++) {
    const response = await fetch(`https://api.aliveai.app/prompts?page=${page}&limit=20`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) break;
    
    const data = await response.json();
    const prompts = data.prompts || [];
    if (prompts.length === 0) break;
    
    allPrompts.push(...prompts);
    if (!data.hasNextPage) break;
  }
  
  return allPrompts;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const adminUserId = body.adminUserId || '8980403d-cc3b-4014-b65d-38e657c652d9';

    console.log('Fetching existing AliveAI prompts...');
    const allPrompts = await fetchAllAliveAIPrompts();
    console.log(`Found ${allPrompts.length} total prompts`);

    // Find the most recent prompt for each target character
    const characterPrompts = new Map<string, AliveAIPrompt>();
    for (const prompt of allPrompts) {
      const name = prompt.originalPrompt?.name;
      if (TARGET_CHARACTERS.includes(name) && prompt.medias?.length > 0) {
        if (!characterPrompts.has(name)) {
          characterPrompts.set(name, prompt);
        }
      }
    }

    console.log(`Found ${characterPrompts.size} of ${TARGET_CHARACTERS.length} target characters`);

    // Delete existing AI models
    console.log('Deleting existing AI models...');
    await supabaseAdmin.from('ai_models').delete().neq('id', '00000000-0000-0000-0000-000000000000');

    // Insert characters with fresh URLs
    const results: Array<{ name: string; success: boolean; error?: string }> = [];
    
    for (const name of TARGET_CHARACTERS) {
      const prompt = characterPrompts.get(name);
      const metadata = CHARACTER_METADATA[name];
      
      if (!prompt || !metadata) {
        results.push({ name, success: false, error: 'No AliveAI image found' });
        continue;
      }

      const avatarUrl = prompt.medias[0].mediaUrl;
      const systemPrompt = `Tu es ${name}, une femme de ${metadata.age} ans. ${metadata.description}. Ta personnalité: ${metadata.personality}.`;

      const insertData = {
        name,
        description: metadata.description,
        personality: metadata.personality,
        avatar_url: avatarUrl,
        systemPrompt,
        greetings: [`Salut ! Je suis ${name}, ravie de te rencontrer ! 💕`],
        gender: metadata.gender,
        ethnicities: metadata.ethnicities,
        age: metadata.age,
        hair_type: metadata.hairType,
        hair_color: metadata.hairColor,
        eye_color: metadata.eyeColor,
        body_type: metadata.bodyType,
        chest_size: metadata.chestSize,
        relationship: metadata.relationship,
        profession: metadata.profession,
        sexual_preferences: [],
        voice: 'Voix 1',
        created_by: adminUserId,
        status: 'active',
        is_public: true,
        has_voice: metadata.hasVoice,
        has_live_action: metadata.hasLiveAction,
      };

      const { error } = await supabaseAdmin.from('ai_models').insert(insertData);
      results.push({ name, success: !error, error: error?.message });
    }

    const successCount = results.filter(r => r.success).length;
    return NextResponse.json({
      success: true,
      message: `Restored ${successCount}/${TARGET_CHARACTERS.length} characters`,
      results,
    });
  } catch (error) {
    console.error('Restore error:', error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

