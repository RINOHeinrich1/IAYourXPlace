import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

// Helper function to get user's profile ID from auth user
async function getUserProfileId(userId: string): Promise<string | null> {
  const { data: profile } = await supabase
    .from('profiles')
    .select('id')
    .eq('owner_id', userId)
    .single();
  return profile?.id || null;
}

// DELETE /api/messages/[id] - Delete a specific message
// Uses existing messages table with sender_id (profile ID)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    // Get user's profile ID
    const profileId = await getUserProfileId(user.id);
    if (!profileId) {
      return NextResponse.json({ error: 'Profil non trouvé' }, { status: 404 });
    }

    const { id } = await params;

    // Verify message belongs to user's conversation (check sender_id on conversation)
    const { data: message } = await supabase
      .from('messages')
      .select(`
        id,
        conversation:conversations!inner (
          sender_id
        )
      `)
      .eq('id', id)
      .single();

    if (!message) {
      return NextResponse.json({ error: 'Message non trouvé' }, { status: 404 });
    }

    // Check if user owns the conversation (sender_id matches their profile)
    const convArray = message.conversation as unknown as { sender_id: string }[];
    const conv = convArray[0];
    if (!conv || conv.sender_id !== profileId) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
    }

    // Soft delete the message
    const { error } = await supabase
      .from('messages')
      .update({
        is_deleted: true,
        deleted_at: new Date().toISOString()
      })
      .eq('id', id);

    if (error) {
      console.error('Error deleting message:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Server error:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

// PATCH /api/messages/[id] - Update message (reaction, etc.)
// Uses existing messages table
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    // Get user's profile ID
    const profileId = await getUserProfileId(user.id);
    if (!profileId) {
      return NextResponse.json({ error: 'Profil non trouvé' }, { status: 404 });
    }

    const { id } = await params;
    const body = await request.json();
    const { reaction } = body;

    // Verify message belongs to user's conversation (check sender_id on conversation)
    const { data: message } = await supabase
      .from('messages')
      .select(`
        id,
        conversation:conversations!inner (
          sender_id
        )
      `)
      .eq('id', id)
      .single();

    if (!message) {
      return NextResponse.json({ error: 'Message non trouvé' }, { status: 404 });
    }

    // Check if user owns the conversation (sender_id matches their profile)
    const convArray = message.conversation as unknown as { sender_id: string }[];
    const conv = convArray[0];
    if (!conv || conv.sender_id !== profileId) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
    }

    // Update the message
    const updateData: { reaction?: string | null } = {};
    if (reaction !== undefined) {
      updateData.reaction = reaction || null; // null to remove reaction
    }

    const { data: updatedMessage, error } = await supabase
      .from('messages')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating message:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ message: updatedMessage });
  } catch (error) {
    console.error('Server error:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

