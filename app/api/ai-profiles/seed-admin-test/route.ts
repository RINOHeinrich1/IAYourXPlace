import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createSupabaseServerClient } from '@/lib/supabaseServer';

// Create service role client for admin operations (bypasses RLS)
// Only used if SUPABASE_SERVICE_ROLE_KEY is available
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

// POST /api/ai-profiles/seed-admin-test - Create a test admin AI model
// This endpoint requires the current user to be an admin
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function POST(_request: NextRequest) {
  try {
    // Try service role first (bypasses RLS)
    const serviceClient = getServiceRoleClient();
    const regularClient = await createSupabaseServerClient();

    // Use service role if available, otherwise use regular client
    const supabase = serviceClient || regularClient;

    // Step 1: Find an admin profile
    const { data: adminProfile, error: profileError } = await supabase
      .from('profiles')
      .select('id, owner_id, role')
      .eq('role', 'admin')
      .limit(1)
      .single();

    if (profileError || !adminProfile) {
      return NextResponse.json({
        error: 'Aucun profil admin trouvé. Créez d\'abord un utilisateur admin.'
      }, { status: 404 });
    }

    // Step 2: Check if testIAadmin already exists
    const { data: existingModel } = await supabase
      .from('ai_models')
      .select('id, name, avatar_url, created_by')
      .eq('name', 'testIAadmin')
      .single();

    if (existingModel) {
      // Update the existing model to be owned by admin if needed
      if (existingModel.created_by !== adminProfile.owner_id && serviceClient) {
        await serviceClient
          .from('ai_models')
          .update({ created_by: adminProfile.owner_id })
          .eq('id', existingModel.id);
      }

      return NextResponse.json({
        success: true,
        message: 'testIAadmin existe déjà et est assigné à un admin',
        model: existingModel,
        adminProfile: { id: adminProfile.id, role: adminProfile.role }
      });
    }

    // Step 3: If no service role key, check if current user is admin
    if (!serviceClient) {
      const { data: { user } } = await regularClient.auth.getUser();
      if (!user) {
        return NextResponse.json({
          error: 'Non autorisé. Connectez-vous en tant qu\'admin pour créer un test AI.'
        }, { status: 401 });
      }

      // Check if current user is admin
      const { data: currentProfile } = await regularClient
        .from('profiles')
        .select('role')
        .eq('owner_id', user.id)
        .single();

      if (currentProfile?.role !== 'admin') {
        return NextResponse.json({
          error: 'Seuls les administrateurs peuvent créer des modèles de test. Votre rôle: ' + (currentProfile?.role || 'inconnu'),
          hint: 'Connectez-vous avec un compte admin ou configurez SUPABASE_SERVICE_ROLE_KEY'
        }, { status: 403 });
      }
    }

    // Step 4: Create testIAadmin model
    const testAIModel = {
      name: 'testIAadmin',
      description: 'Test AI model created by admin for verification',
      personality: 'Friendly and helpful',
      avatar_url: '/images/A.jpg',
      greetings: ['Bonjour! Je suis testIAadmin, créé par un administrateur.'],
      systemPrompt: 'Tu es testIAadmin, un modèle de test créé par un administrateur.',
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
      return NextResponse.json({
        error: `Erreur lors de la création du modèle: ${createError.message}`,
        hint: serviceClient ? 'Service role utilisé' : 'Client régulier utilisé - RLS peut bloquer'
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'testIAadmin créé avec succès!',
      model: createdModel,
      adminProfile: { id: adminProfile.id, role: adminProfile.role, owner_id: adminProfile.owner_id }
    });

  } catch (error) {
    console.error('Seed admin test error:', error);
    return NextResponse.json({ error: 'Erreur serveur', details: String(error) }, { status: 500 });
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

