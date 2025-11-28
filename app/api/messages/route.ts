import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient, getUserProfileId } from '@/lib/supabaseServer';
import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({});
const MODEL_NAME = "gemini-2.5-flash";

// GET /api/messages - Get messages for a conversation
// Uses existing messages table
export async function GET(request: NextRequest) {
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
    const conversation_id = searchParams.get('conversation_id');
    const limit = parseInt(searchParams.get('limit') || '50');
    const before = searchParams.get('before');

    if (!conversation_id) {
      return NextResponse.json({ error: 'conversation_id est requis' }, { status: 400 });
    }

    // Verify user owns this conversation (sender_id matches their profile)
    const { data: conv } = await supabase
      .from('conversations')
      .select('id')
      .eq('id', conversation_id)
      .eq('sender_id', profileId)
      .single();

    if (!conv) {
      return NextResponse.json({ error: 'Conversation non trouvée' }, { status: 404 });
    }

    let query = supabase
      .from('messages')
      .select(`
        id,
        sender_id,
        role,
        content,
        content_type,
        reply_to_id,
        reaction,
        is_deleted,
        created_at,
        updated_at
      `)
      .eq('conversation_id', conversation_id)
      .or('is_deleted.is.null,is_deleted.eq.false') // Handle null or false
      .order('created_at', { ascending: true })
      .limit(limit);

    if (before) {
      query = query.lt('created_at', before);
    }

    const { data: messages, error } = await query;

    if (error) {
      console.error('Error fetching messages:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      messages: messages || [],
      has_more: (messages?.length || 0) === limit
    });
  } catch (error) {
    console.error('Server error:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

// POST /api/messages - Send a message and get AI response
// Uses existing messages and conversations tables
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
    const { conversation_id, content, content_type = 'text', reply_to_id } = body;

    if (!content?.trim()) {
      return NextResponse.json({ error: 'Le contenu est requis' }, { status: 400 });
    }

    let convId = conversation_id;

    // If no conversation_id, create a new conversation
    if (!convId && model_id) {
      const { data: newConv, error: convError } = await supabase
        .from('conversations')
        .insert({ sender_id: profileId, model_id })
        .select('id')
        .single();

      if (convError) {
        // Check if conversation already exists (unique constraint)
        const { data: existing } = await supabase
          .from('conversations')
          .select('id')
          .eq('sender_id', profileId)
          .eq('model_id', model_id)
          .single();

        if (existing) {
          convId = existing.id;
        } else {
          return NextResponse.json({ error: convError.message }, { status: 500 });
        }
      } else {
        convId = newConv.id;
      }
    }

    if (!convId) {
      return NextResponse.json({ error: 'conversation_id ou model_id requis' }, { status: 400 });
    }

    // Get conversation with AI model
    const { data: conversation, error: convFetchError } = await supabase
      .from('conversations')
      .select(`
        id,
        ai_model:ai_models (
          id,
          name,
          personality,
          systemPrompt
        )
      `)
      .eq('id', convId)
      .eq('sender_id', profileId)
      .single();

    if (convFetchError || !conversation) {
      return NextResponse.json({ error: 'Conversation non trouvée' }, { status: 404 });
    }

    // Save user message
    // sender_id is the user's profile ID for user messages
    const { data: userMessage, error: userMsgError } = await supabase
      .from('messages')
      .insert({
        conversation_id: convId,
        sender_id: profileId, // User's profile ID
        role: 'user',
        content: content.trim(),
        content_type,
        reply_to_id,
      })
      .select()
      .single();

    if (userMsgError) {
      return NextResponse.json({ error: userMsgError.message }, { status: 500 });
    }

    // Get recent messages for context
    const { data: recentMessages } = await supabase
      .from('messages')
      .select('role, content')
      .eq('conversation_id', convId)
      .or('is_deleted.is.null,is_deleted.eq.false')
      .order('created_at', { ascending: false })
      .limit(10);

    // Build AI context
    // Handle the joined ai_model data (Supabase returns array for joins)
    const aiModelArray = conversation.ai_model as unknown as { name: string; personality: string; systemPrompt?: string }[];
    const aiModel = aiModelArray?.[0];

    // Build system prompt from AI model data
    // Note: personality is a text field in existing schema (not array)
    const systemPrompt = aiModel?.systemPrompt ||
      `Tu es ${aiModel?.name || 'une IA'}, une IA amicale avec la personnalité suivante: ${aiModel?.personality || 'amicale et serviable'}. Réponds de manière naturelle et engageante avec des emojis. 😊💕`;

    const introMessage = { role: 'user', parts: [{ text: systemPrompt }] };

    const contents = [
      introMessage,
      ...(recentMessages || []).reverse().map(msg => ({
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: msg.content || '' }]
      }))
    ];

    // Generate AI response
    let assistantContent = "Je suis désolée, je n'ai pas pu répondre. 😔";

    try {
      if (process.env.GEMINI_API_KEY) {
        const response = await ai.models.generateContent({
          model: MODEL_NAME,
          contents,
          config: { temperature: 0.7 }
        });
        assistantContent = response.text || assistantContent;
      }
    } catch (aiError) {
      console.error('AI Error:', aiError);
    }

    // Save assistant message
    // sender_id is null for AI messages (no user profile)
    const { data: assistantMessage, error: assistantMsgError } = await supabase
      .from('messages')
      .insert({
        conversation_id: convId,
        sender_id: null, // AI messages have no sender_id
        role: 'assistant',
        content: assistantContent,
        content_type: 'text',
      })
      .select()
      .single();

    if (assistantMsgError) {
      return NextResponse.json({ error: assistantMsgError.message }, { status: 500 });
    }

    return NextResponse.json({
      user_message: userMessage,
      assistant_message: assistantMessage,
      conversation_id: convId,
    });
  } catch (error) {
    console.error('Server error:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

