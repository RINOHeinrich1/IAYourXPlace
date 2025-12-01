import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabaseServer';

// Local avatar images in the public/images folder
const LOCAL_AVATAR_IMAGES = [
  '/images/imgmes1.png',
  '/images/imgmes2.jpg',
  '/images/imgmes3.jpg',
];

// Predefined avatar configurations for known characters using local images
const CHARACTER_AVATARS: Record<string, string> = {
  'Isabelle': '/images/imgmes1.png',
  'Sophie': '/images/imgmes2.jpg',
  'Léa': '/images/imgmes3.jpg',
  'Lea': '/images/imgmes3.jpg',
  'Emma': '/images/imgmes1.png',
  'Chloé': '/images/imgmes2.jpg',
  'Chloe': '/images/imgmes2.jpg',
};

// Generate avatar URL using local images
// Assigns one of the 3 local images based on the character name
function generateAvatarUrl(name: string): string {
  if (CHARACTER_AVATARS[name]) {
    return CHARACTER_AVATARS[name];
  }

  // Generate a consistent index based on name hash
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const imageIndex = Math.abs(hash) % LOCAL_AVATAR_IMAGES.length;

  return LOCAL_AVATAR_IMAGES[imageIndex];
}

// POST /api/ai-profiles/update-avatars - Update all AI models without avatar URLs
export async function POST(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    // Check if force update is requested (updates ALL models, not just those without avatars)
    const { searchParams } = new URL(request.url);
    const forceUpdate = searchParams.get('force') === 'true';

    // Get AI models to update
    let query = supabase.from('ai_models').select('id, name, avatar_url');

    if (!forceUpdate) {
      // Only get models without avatar_url or with old UI Avatars URLs
      query = query.or('avatar_url.is.null,avatar_url.eq.,avatar_url.ilike.%ui-avatars.com%');
    }

    const { data: modelsToUpdate, error: fetchError } = await query;

    if (fetchError) {
      return NextResponse.json({ error: fetchError.message }, { status: 500 });
    }

    if (!modelsToUpdate || modelsToUpdate.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'All AI models already have DiceBear avatars',
        updated: 0,
      });
    }

    const results = [];

    for (const model of modelsToUpdate) {
      const avatarUrl = generateAvatarUrl(model.name);

      const { error: updateError } = await supabase
        .from('ai_models')
        .update({ avatar_url: avatarUrl })
        .eq('id', model.id);

      if (updateError) {
        results.push({ id: model.id, name: model.name, status: 'error', error: updateError.message });
      } else {
        results.push({ id: model.id, name: model.name, status: 'updated', avatar_url: avatarUrl });
      }
    }

    const successCount = results.filter(r => r.status === 'updated').length;

    return NextResponse.json({
      success: true,
      message: `Updated ${successCount} AI models with DiceBear avatars`,
      updated: successCount,
      results,
    });
  } catch (error) {
    console.error('Update avatars error:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

// GET /api/ai-profiles/update-avatars - Preview what would be updated
export async function GET() {
  try {
    const supabase = await createSupabaseServerClient();

    // Get all AI models
    const { data: models, error } = await supabase
      .from('ai_models')
      .select('id, name, avatar_url')
      .order('name');

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const modelsWithStatus = (models || []).map(model => ({
      id: model.id,
      name: model.name,
      hasAvatar: !!model.avatar_url,
      currentAvatar: model.avatar_url,
      proposedAvatar: model.avatar_url ? null : generateAvatarUrl(model.name),
    }));

    const needsUpdate = modelsWithStatus.filter(m => !m.hasAvatar);

    return NextResponse.json({
      total: models?.length || 0,
      needsUpdate: needsUpdate.length,
      models: modelsWithStatus,
    });
  } catch (error) {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

