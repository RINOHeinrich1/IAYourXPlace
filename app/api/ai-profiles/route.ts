import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabaseServer';

// GET /api/ai-profiles - Get all AI models (or user's own, or admin-only)
// Uses existing ai_models table
export async function GET(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient();
    const { searchParams } = new URL(request.url);
    const ownOnly = searchParams.get('own') === 'true';
    const adminOnly = searchParams.get('adminOnly') === 'true';

    let query = supabase
      .from('ai_models')
      .select('*')
      .order('created_at', { ascending: false });

    if (ownOnly) {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        query = query.eq('created_by', user.id);
      }
    } else if (adminOnly) {
      // Fetch AI models created by admin users only
      const { data: adminProfiles } = await supabase
        .from('profiles')
        .select('owner_id')
        .eq('role', 'admin');

      const adminUserIds = (adminProfiles || [])
        .map((p: { owner_id: string | null }) => p.owner_id)
        .filter((id): id is string => id !== null);

      if (adminUserIds.length > 0) {
        query = query.in('created_by', adminUserIds);
      } else {
        // No admin users found, return empty array
        return NextResponse.json({
          profiles: [],
          models: []
        });
      }
    }

    const { data: models, error } = await query;

    if (error) {
      console.error('Error fetching AI models:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Add avatar alias for compatibility with admin-YourXplace interface
    const modelsWithAvatar = (models || []).map((model: { avatar_url?: string }) => ({
      ...model,
      avatar: model.avatar_url 
    }));

    // Return as 'profiles' for backward compatibility and 'models' for new code
    return NextResponse.json({
      profiles: modelsWithAvatar,
      models: modelsWithAvatar
    });
  } catch (error) {
    console.error('Server error:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

// POST /api/ai-profiles - Create a new AI model
// Uses existing ai_models table
export async function POST(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const body = await request.json();
    const {
      // Core required fields (matching AICharacter from admin-YourXplace)
      name,
      personality,
      avatar, 
      avatar_url, 
      description,
      greetings = [],
      systemPrompt,
      age,
      ethnicities = [],
      hair_type,
      hair_color,
      eye_color,
      body_type,
      chest_size,
      relationship = [],
      profession = [],
      sexual_preferences = [],
      voice,
    } = body;

    // Validation of required fields
    if (!name?.trim()) {
      return NextResponse.json({ error: 'Le nom est requis' }, { status: 400 });
    }
    if (!personality?.trim()) {
      return NextResponse.json({ error: 'La personnalité est requise' }, { status: 400 });
    }
    if (!description?.trim()) {
      return NextResponse.json({ error: 'La description est requise' }, { status: 400 });
    }
    if (!greetings || greetings.length === 0) {
      return NextResponse.json({ error: 'Les salutations sont requises' }, { status: 400 });
    }
    if (!systemPrompt?.trim()) {
      return NextResponse.json({ error: 'Le system prompt est requis' }, { status: 400 });
    }

    // Use avatar or avatar_url (avatar takes precedence for new interface)
    const resolvedAvatarUrl = avatar || avatar_url;

    const { data: model, error } = await supabase
      .from('ai_models')
      .insert({
        name: name.trim(),
        description,
        personality,
        avatar_url: resolvedAvatarUrl, // Database column name
        greetings,
        systemPrompt,
        // Extended columns (optional)
        age,
        ethnicities,
        hair_type,
        hair_color,
        eye_color,
        body_type,
        chest_size,
        relationship,
        profession,
        sexual_preferences,
        voice,
        created_by: user.id,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating AI model:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Add avatar alias for compatibility with admin-YourXplace interface
    const modelWithAvatar = model ? {
      ...model,
      avatar: model.avatar_url 
    } : model;

    return NextResponse.json({
      profile: modelWithAvatar, 
      model: modelWithAvatar
    }, { status: 201 });
  } catch (error) {
    console.error('Server error:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

// DELETE /api/ai-profiles - Delete an AI model
// Uses existing ai_models table
export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'id est requis' }, { status: 400 });
    }

    // Only allow deleting own AI models
    const { error } = await supabase
      .from('ai_models')
      .delete()
      .eq('id', id)
      .eq('created_by', user.id);

    if (error) {
      console.error('Error deleting AI model:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Server error:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

