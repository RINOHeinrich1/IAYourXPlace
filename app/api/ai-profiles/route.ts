import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabaseServer';

// GET /api/ai-profiles - Get all AI models (or user's own)
// Uses existing ai_models table
export async function GET(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient();
    const { searchParams } = new URL(request.url);
    const ownOnly = searchParams.get('own') === 'true';

    let query = supabase
      .from('ai_models')
      .select('*')
      .order('created_at', { ascending: false });

    if (ownOnly) {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        query = query.eq('created_by', user.id);
      }
    }

    const { data: models, error } = await query;

    if (error) {
      console.error('Error fetching AI models:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Return as 'profiles' for backward compatibility and 'models' for new code
    return NextResponse.json({
      profiles: models || [],
      models: models || []
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
      name,
      description,
      personality, // text in existing schema
      avatar_url,
      greetings = [],
      systemPrompt, // camelCase in existing schema
      // Extended columns (from migration)
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

    if (!name?.trim()) {
      return NextResponse.json({ error: 'Le nom est requis' }, { status: 400 });
    }

    const { data: model, error } = await supabase
      .from('ai_models')
      .insert({
        name: name.trim(),
        description,
        personality, // text field
        avatar_url,
        greetings,
        systemPrompt,
        // Extended columns
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

    return NextResponse.json({
      profile: model, // backward compatibility
      model
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

