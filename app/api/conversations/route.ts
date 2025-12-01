import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient, getUserProfileId } from '@/lib/supabaseServer';

// GET /api/conversations - Get all AI conversations for the current user
// Uses existing conversations table with model_id for AI chats
export async function GET(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    console.log('[GET /api/conversations] Auth user:', user?.id || 'none', 'Error:', authError?.message || 'none');

    if (authError || !user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    // Get user's profile ID
    const profileId = await getUserProfileId(supabase, user.id);
    console.log('[GET /api/conversations] User profile ID:', profileId || 'NOT FOUND');

    if (!profileId) {
      // Return empty conversations instead of 404 - profile might not exist yet
      console.log('[GET /api/conversations] Profile not found for user:', user.id);
      return NextResponse.json({ conversations: [] });
    }

    // Fetch conversations where user is sender AND there's an AI model (model_id is not null)
    const { data: conversations, error } = await supabase
      .from('conversations')
      .select(`
        id,
        title,
        last_message_at,
        is_archived,
        is_pinned,
        created_at,
        model_id,
        sender_id,
        ai_model:ai_models (
          id,
          name,
          avatar_url,
          personality,
          systemPrompt
        )
      `)
      .eq('sender_id', profileId)
      .not('model_id', 'is', null) // Only AI conversations
      .or('is_archived.is.null,is_archived.eq.false') // Handle null or false
      .order('is_pinned', { ascending: false, nullsFirst: false })
      .order('last_message_at', { ascending: false, nullsFirst: false });

    if (error) {
      console.error('Error fetching conversations:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Get last message for each conversation
    const conversationsWithLastMessage = await Promise.all(
      (conversations || []).map(async (conv) => {
        const { data: lastMessage } = await supabase
          .from('messages')
          .select('id, content, role, created_at, content_type')
          .eq('conversation_id', conv.id)
          .or('is_deleted.is.null,is_deleted.eq.false') // Handle null or false
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

        return {
          ...conv,
          last_message: lastMessage || null,
          // Provide ai_profile alias for backward compatibility
          ai_profile: conv.ai_model,
        };
      })
    );

    return NextResponse.json({ conversations: conversationsWithLastMessage });
  } catch (error) {
    console.error('Server error:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

// POST /api/conversations - Create a new AI conversation
// Uses existing conversations table with model_id
export async function POST(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    // Get user's profile ID
    const profileId = await getUserProfileId(supabase, user.id);
    if (!profileId) {
      return NextResponse.json({ error: 'Profil non trouvé' }, { status: 404 });
    }

    const body = await request.json();
    // Support both model_id and ai_profile_id for backward compatibility
    const model_id = body.model_id || body.ai_profile_id;
    const { title } = body;

    if (!model_id) {
      return NextResponse.json({ error: 'model_id est requis' }, { status: 400 });
    }

    // FIRST check if conversation already exists for this user and AI model
    // This avoids hitting the unique constraint error on model_id
    const { data: existing } = await supabase
      .from('conversations')
      .select(`
        id,
        title,
        last_message_at,
        is_archived,
        is_pinned,
        created_at,
        model_id,
        ai_model:ai_models (
          id,
          name,
          avatar_url,
          personality,
          systemPrompt
        )
      `)
      .eq('sender_id', profileId)
      .eq('model_id', model_id)
      .single();

    if (existing) {
      console.log('[POST /api/conversations] Returning existing conversation:', existing.id);
      return NextResponse.json({
        conversation: {
          ...existing,
          ai_profile: existing.ai_model,
        }
      });
    }

    // Create new conversation only if none exists
    const { data: conversation, error } = await supabase
      .from('conversations')
      .insert({
        sender_id: profileId,
        model_id,
        title,
      })
      .select(`
        id,
        title,
        last_message_at,
        is_archived,
        is_pinned,
        created_at,
        model_id,
        ai_model:ai_models (
          id,
          name,
          avatar_url,
          personality,
          systemPrompt
        )
      `)
      .single();

    if (error) {
      console.error('[POST /api/conversations] Error creating conversation:', error);
      // One more check in case of race condition (another request created it)
      const { data: retryExisting } = await supabase
        .from('conversations')
        .select('id')
        .eq('sender_id', profileId)
        .eq('model_id', model_id)
        .single();

      if (retryExisting) {
        return NextResponse.json({ conversation: retryExisting });
      }
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    console.log('[POST /api/conversations] Created new conversation:', conversation.id);

    return NextResponse.json({
      conversation: {
        ...conversation,
        ai_profile: conversation.ai_model, // backward compatibility
      }
    }, { status: 201 });
  } catch (error) {
    console.error('Server error:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

// DELETE /api/conversations - Delete a conversation
// Uses existing conversations table
export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    // Get user's profile ID
    const profileId = await getUserProfileId(supabase, user.id);
    if (!profileId) {
      return NextResponse.json({ error: 'Profil non trouvé' }, { status: 404 });
    }

    const { searchParams } = new URL(request.url);
    const conversation_id = searchParams.get('id');

    if (!conversation_id) {
      return NextResponse.json({ error: 'conversation_id est requis' }, { status: 400 });
    }

    // Delete conversation - only if user is the sender
    // Note: FK cascade will delete related messages
    const { error } = await supabase
      .from('conversations')
      .delete()
      .eq('id', conversation_id)
      .eq('sender_id', profileId);

    if (error) {
      console.error('Error deleting conversation:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Server error:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

