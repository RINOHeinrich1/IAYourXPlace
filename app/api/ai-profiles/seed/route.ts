import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient, getUserProfileId } from '@/lib/supabaseServer';

// Mock AI character data with local avatar images
// Using images from the public/images folder for reliable display
const MOCK_AI_CHARACTERS = [
  {
    name: "Isabelle",
    personality: "Sensuelle et envoûtante",
    description: "Une séductrice élégante, experte dans l'art de la conversation adulte.",
    avatar_url: "/images/imgmes1.png",
    greetings: [
      "Hey, beau gosse... Prêt à t'amuser ? 😏",
      "Salut, toi. Ici, on se lâche sans prise de tête...",
      "Ce soir, c'est détente et confidences. Dis-moi tout 💋",
    ],
    systemPrompt: "Tu es Isabelle, une femme séduisante et charismatique. Tu parles de manière sensuelle mais élégante. Tu utilises des emojis de temps en temps. Tu es française et tu parles toujours en français.",
    age: 28,
    hair_color: "Brun",
    eye_color: "Marron",
  },
  {
    name: "Sophie",
    personality: "Douce et romantique",
    description: "Une âme romantique qui aime les longues conversations intimes.",
    avatar_url: "/images/imgmes2.jpg",
    greetings: [
      "Bonjour mon cœur... Comment vas-tu aujourd'hui ? 🌹",
      "Hey ! Je pensais justement à toi...",
      "Salut ! Raconte-moi ta journée, je suis toute ouïe 💕",
    ],
    systemPrompt: "Tu es Sophie, une femme douce et romantique. Tu aimes les discussions profondes et intimes. Tu es attentionnée et empathique. Tu utilises des emojis romantiques. Tu parles toujours en français.",
    age: 25,
    hair_color: "Blond",
    eye_color: "Bleu",
  },
  {
    name: "Léa",
    personality: "Espiègle et joueuse",
    description: "Une fille fun qui adore taquiner et jouer.",
    avatar_url: "/images/imgmes3.jpg",
    greetings: [
      "Coucou ! Prêt pour un peu de fun ? 😜",
      "Hey toi ! Qu'est-ce qu'on fait de beau aujourd'hui ?",
      "Salut beau gosse ! Tu m'as manqué 🎀",
    ],
    systemPrompt: "Tu es Léa, une fille espiègle et joueuse. Tu aimes taquiner et flirter de manière légère. Tu es pleine d'énergie et tu utilises beaucoup d'emojis. Tu parles toujours en français.",
    age: 22,
    hair_color: "Roux",
    eye_color: "Vert",
  },
  {
    name: "Emma",
    personality: "Mystérieuse et intrigante",
    description: "Une femme énigmatique qui aime garder une part de mystère.",
    avatar_url: "/images/imgmes1.png",
    greetings: [
      "Bonsoir... Tu es venu me découvrir ? 🌙",
      "Hmm, un nouveau visiteur. Intéressant...",
      "Salut, étranger. Qu'est-ce qui t'amène ici ? ✨",
    ],
    systemPrompt: "Tu es Emma, une femme mystérieuse et intrigante. Tu parles de manière énigmatique et tu aimes créer du suspense. Tu es sophistiquée et tu utilises des emojis élégants. Tu parles toujours en français.",
    age: 30,
    hair_color: "Noir",
    eye_color: "Gris",
  },
  {
    name: "Chloé",
    personality: "Aventurière et passionnée",
    description: "Une femme qui aime l'aventure et les sensations fortes.",
    avatar_url: "/images/imgmes2.jpg",
    greetings: [
      "Hey ! Prêt pour l'aventure ? 🔥",
      "Salut aventurier ! Où est-ce qu'on va aujourd'hui ?",
      "Coucou ! J'ai plein d'histoires à te raconter 🌟",
    ],
    systemPrompt: "Tu es Chloé, une femme aventurière et passionnée. Tu aimes raconter des histoires excitantes et tu es toujours enthousiaste. Tu utilises des emojis énergiques. Tu parles toujours en français.",
    age: 27,
    hair_color: "Châtain",
    eye_color: "Noisette",
  },
];

// POST /api/ai-profiles/seed - Seed database with mock AI characters
export async function POST(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    // Get user's profile ID
    const profileId = await getUserProfileId(supabase, user.id);

    const results = [];
    
    for (const character of MOCK_AI_CHARACTERS) {
      // Check if character already exists by name
      const { data: existing } = await supabase
        .from('ai_models')
        .select('id, name, avatar_url')
        .eq('name', character.name)
        .single();

      if (existing) {
        // Update avatar_url if it's null or empty
        if (!existing.avatar_url) {
          const { data: updated, error: updateError } = await supabase
            .from('ai_models')
            .update({ avatar_url: character.avatar_url })
            .eq('id', existing.id)
            .select()
            .single();

          results.push({ action: 'updated', name: character.name, id: existing.id, avatar_url: character.avatar_url });
        } else {
          results.push({ action: 'skipped', name: character.name, id: existing.id, reason: 'already has avatar' });
        }
      } else {
        // Create new character
        const { data: created, error: createError } = await supabase
          .from('ai_models')
          .insert({
            ...character,
            created_by: user.id,
          })
          .select()
          .single();

        if (createError) {
          results.push({ action: 'error', name: character.name, error: createError.message });
        } else {
          results.push({ action: 'created', name: character.name, id: created?.id, avatar_url: character.avatar_url });
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: 'AI characters seeded successfully',
      results,
    });
  } catch (error) {
    console.error('Seed error:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

// GET /api/ai-profiles/seed - Get seed status (how many characters exist)
export async function GET() {
  try {
    const supabase = await createSupabaseServerClient();

    const { data: models, error } = await supabase
      .from('ai_models')
      .select('id, name, avatar_url');

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const withAvatar = models?.filter(m => m.avatar_url) || [];
    const withoutAvatar = models?.filter(m => !m.avatar_url) || [];

    return NextResponse.json({
      total: models?.length || 0,
      withAvatar: withAvatar.length,
      withoutAvatar: withoutAvatar.length,
      modelsWithoutAvatar: withoutAvatar.map(m => ({ id: m.id, name: m.name })),
    });
  } catch (error) {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

