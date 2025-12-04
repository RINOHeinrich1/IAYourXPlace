import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createSupabaseServerClient } from '@/lib/supabaseServer';

// Create service role client for admin operations (bypasses RLS)
function getServiceRoleClient() {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceRoleKey) {
    return null;
  }
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    serviceRoleKey
  );
}

// 10 sample AI characters to create
const sampleCharacters = [
  { name: 'Bessie', description: 'Une IA douce et attentionnée', personality: 'Gentille et attentive', avatar_url: '/images/A.jpg', age: 24, hair_color: 'Blonde', eye_color: 'Bleu' },
  { name: 'Luna', description: 'Mystérieuse et envoûtante', personality: 'Mystérieuse et séduisante', avatar_url: '/images/B.jpg', age: 22, hair_color: 'Noir', eye_color: 'Vert' },
  { name: 'Sophie', description: 'Intelligente et curieuse', personality: 'Brillante et curieuse', avatar_url: '/images/D.jpg', age: 26, hair_color: 'Châtain', eye_color: 'Marron' },
  { name: 'Emma', description: 'Joyeuse et spontanée', personality: 'Joyeuse et amusante', avatar_url: '/images/E.jpg', age: 23, hair_color: 'Roux', eye_color: 'Bleu' },
  { name: 'Chloé', description: 'Élégante et raffinée', personality: 'Élégante et sophistiquée', avatar_url: '/images/F.jpg', age: 27, hair_color: 'Brun', eye_color: 'Noisette' },
  { name: 'Léa', description: 'Aventurière et audacieuse', personality: 'Aventurière et courageuse', avatar_url: '/images/G.jpg', age: 25, hair_color: 'Blonde', eye_color: 'Gris' },
  { name: 'Jade', description: 'Calme et sereine', personality: 'Paisible et réfléchie', avatar_url: '/images/H.jpg', age: 28, hair_color: 'Noir', eye_color: 'Vert' },
  { name: 'Mia', description: 'Énergique et dynamique', personality: 'Énergique et passionnée', avatar_url: '/images/I.jpg', age: 21, hair_color: 'Châtain', eye_color: 'Bleu' },
  { name: 'Rose', description: 'Romantique et rêveuse', personality: 'Romantique et poétique', avatar_url: '/images/J.jpg', age: 24, hair_color: 'Roux', eye_color: 'Vert' },
  { name: 'Camille', description: 'Créative et artistique', personality: 'Créative et inspirée', avatar_url: '/images/K.jpg', age: 26, hair_color: 'Brun', eye_color: 'Marron' },
];

// POST /api/ai-profiles/seed-admin-test - Create test admin AI models
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function POST(request: NextRequest) {
  try {
    const serviceClient = getServiceRoleClient();
    const regularClient = await createSupabaseServerClient();
    const supabase = serviceClient || regularClient;

    // Check URL params for action
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    // Step 1: Find admin profiles
    const { data: adminProfiles, error: profileError } = await supabase
      .from('profiles')
      .select('id, owner_id, role')
      .eq('role', 'admin');

    if (profileError || !adminProfiles || adminProfiles.length === 0) {
      return NextResponse.json({
        error: 'Aucun profil admin trouvé.'
      }, { status: 404 });
    }

    // If action=seed10, create 10 characters
    if (action === 'seed10') {
      const createdModels = [];
      const errors = [];

      for (let i = 0; i < sampleCharacters.length; i++) {
        const char = sampleCharacters[i];
        // Alternate between admin users
        const adminProfile = adminProfiles[i % adminProfiles.length];

        // Check if already exists
        const { data: existing } = await supabase
          .from('ai_models')
          .select('id, name')
          .eq('name', char.name)
          .single();

        if (existing) {
          createdModels.push({ ...existing, status: 'already_exists' });
          continue;
        }

        const aiModel = {
          name: char.name,
          description: char.description,
          personality: char.personality,
          avatar_url: char.avatar_url,
          greetings: [`Bonjour! Je suis ${char.name}. ${char.description}`],
          systemPrompt: `Tu es ${char.name}, une IA ${char.personality.toLowerCase()}.`,
          created_by: adminProfile.owner_id,
          age: char.age,
          hair_color: char.hair_color,
          eye_color: char.eye_color,
        };

        const { data: created, error: createError } = await supabase
          .from('ai_models')
          .insert(aiModel)
          .select()
          .single();

        if (createError) {
          errors.push({ name: char.name, error: createError.message });
        } else {
          createdModels.push({ ...created, status: 'created' });
        }
      }

      return NextResponse.json({
        success: true,
        message: `${createdModels.filter(m => m.status === 'created').length} modèles créés`,
        models: createdModels,
        errors: errors.length > 0 ? errors : undefined
      });
    }

    // Default: create single testIAadmin
    const adminProfile = adminProfiles[0];
    const { data: existingModel } = await supabase
      .from('ai_models')
      .select('id, name, avatar_url, created_by')
      .eq('name', 'testIAadmin')
      .single();

    if (existingModel) {
      return NextResponse.json({
        success: true,
        message: 'testIAadmin existe déjà',
        model: existingModel
      });
    }

    if (!serviceClient) {
      const { data: { user } } = await regularClient.auth.getUser();
      if (!user) {
        return NextResponse.json({ error: 'Non autorisé.' }, { status: 401 });
      }
    }

    const testAIModel = {
      name: 'testIAadmin',
      description: 'Test AI model created by admin',
      personality: 'Friendly and helpful',
      avatar_url: '/images/A.jpg',
      greetings: ['Bonjour! Je suis testIAadmin.'],
      systemPrompt: 'Tu es testIAadmin.',
      created_by: adminProfile.owner_id,
      age: 25,
      hair_color: 'Brun',
      eye_color: 'Bleu',
    };

    const { data: createdModel, error: createError } = await supabase
      .from('ai_models')
      .insert(testAIModel)
      .select()
      .single();

    if (createError) {
      return NextResponse.json({ error: createError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, model: createdModel });
  } catch (error) {
    console.error('Seed error:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

// GET /api/ai-profiles/seed-admin-test - Check current admin AI status
export async function GET() {
  try {
    // Use service role if available, otherwise use regular client
    const serviceClient = getServiceRoleClient();
    const supabase = serviceClient || await createSupabaseServerClient();

    // Get admin profiles
    const { data: adminProfiles, error: profileError } = await supabase
      .from('profiles')
      .select('id, owner_id, role, username')
      .eq('role', 'admin');

    if (profileError) {
      return NextResponse.json({ error: profileError.message }, { status: 500 });
    }

    const adminUserIds = (adminProfiles || [])
      .map(p => p.owner_id)
      .filter((id): id is string => id !== null);

    // Get AI models created by admins
    let adminModels: unknown[] = [];
    if (adminUserIds.length > 0) {
      const { data: models, error: modelsError } = await supabase
        .from('ai_models')
        .select('id, name, avatar_url, created_by')
        .in('created_by', adminUserIds);

      if (!modelsError) {
        adminModels = models || [];
      }
    }

    return NextResponse.json({
      adminProfiles: adminProfiles || [],
      adminCount: adminProfiles?.length || 0,
      adminUserIds,
      adminAIModels: adminModels,
      adminAICount: adminModels.length,
      serviceRoleAvailable: !!serviceClient,
    });

  } catch (error) {
    console.error('Get admin test status error:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

