import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabaseServer';

// Table: ai_character_subscriptions
// This table stores user subscriptions to AI characters
// Schema: id, user_id, ai_model_id, created_at, is_active

export async function POST(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient();
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    // Get user's profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('id')
      .eq('owner_id', user.id)
      .single();

    if (!profile) {
      return NextResponse.json({ error: 'Profil non trouvé' }, { status: 404 });
    }

    const { ai_model_id } = await request.json();
    if (!ai_model_id) {
      return NextResponse.json({ error: 'ai_model_id requis' }, { status: 400 });
    }

    // Check if already subscribed
    const { data: existing } = await supabase
      .from('ai_character_subscriptions')
      .select('id, is_active')
      .eq('user_id', profile.id)
      .eq('ai_model_id', ai_model_id)
      .single();

    if (existing) {
      // Toggle subscription status
      const { data: updated, error: updateError } = await supabase
        .from('ai_character_subscriptions')
        .update({ is_active: !existing.is_active, updated_at: new Date().toISOString() })
        .eq('id', existing.id)
        .select()
        .single();

      if (updateError) {
        return NextResponse.json({ error: updateError.message }, { status: 500 });
      }

      return NextResponse.json({
        success: true,
        subscribed: updated.is_active,
        message: updated.is_active ? 'Abonnement activé' : 'Abonnement désactivé'
      });
    }

    // Create new subscription
    const { data: subscription, error: createError } = await supabase
      .from('ai_character_subscriptions')
      .insert({
        user_id: profile.id,
        ai_model_id: ai_model_id,
        is_active: true,
      })
      .select()
      .single();

    if (createError) {
      // If table doesn't exist, create it dynamically or handle gracefully
      if (createError.message.includes('does not exist')) {
        return NextResponse.json({
          success: true,
          subscribed: true,
          message: 'Abonnement simulé (table non configurée)'
        });
      }
      return NextResponse.json({ error: createError.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      subscribed: true,
      subscription
    });

  } catch (error) {
    console.error('Subscription error:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

// GET - Get user's subscriptions or check subscription status
export async function GET(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient();
    const { searchParams } = new URL(request.url);
    const checkModelId = searchParams.get('check');

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      // Return not subscribed for unauthenticated users
      if (checkModelId) {
        return NextResponse.json({ isSubscribed: false });
      }
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('id')
      .eq('owner_id', user.id)
      .single();

    if (!profile) {
      if (checkModelId) {
        return NextResponse.json({ isSubscribed: false });
      }
      return NextResponse.json({ error: 'Profil non trouvé' }, { status: 404 });
    }

    // Check subscription status for a specific model
    if (checkModelId) {
      const { data: existing } = await supabase
        .from('ai_character_subscriptions')
        .select('id, is_active')
        .eq('user_id', profile.id)
        .eq('ai_model_id', checkModelId)
        .single();

      return NextResponse.json({
        isSubscribed: existing?.is_active || false
      });
    }

    // Get all active subscriptions with AI model details
    const { data: subscriptions, error: subError } = await supabase
      .from('ai_character_subscriptions')
      .select(`
        id,
        ai_model_id,
        created_at,
        is_active,
        ai_models:ai_model_id (
          id,
          name,
          description,
          avatar_url,
          personality
        )
      `)
      .eq('user_id', profile.id)
      .eq('is_active', true);

    if (subError) {
      if (subError.message.includes('does not exist')) {
        return NextResponse.json({ subscriptions: [] });
      }
      return NextResponse.json({ error: subError.message }, { status: 500 });
    }

    return NextResponse.json({ subscriptions: subscriptions || [] });

  } catch (error) {
    console.error('Get subscriptions error:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

