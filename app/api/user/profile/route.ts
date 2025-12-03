import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabaseServer';

// GET /api/user/profile - Get current user's profile including role
export async function GET() {
  try {
    const supabase = await createSupabaseServerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Non autorisé', isAuthenticated: false }, { status: 401 });
    }

    // Get user's profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id, role, nom, prenom, username, avatar_url, email')
      .eq('owner_id', user.id)
      .single();

    if (profileError) {
      // Profile doesn't exist, create one with default consumer role
      const { data: newProfile, error: createError } = await supabase
        .from('profiles')
        .insert({
          owner_id: user.id,
          role: 'consumer',
          email: user.email,
        })
        .select('id, role, nom, prenom, username, avatar_url, email')
        .single();

      if (createError) {
        console.error('Error creating profile:', createError);
        return NextResponse.json({ error: createError.message }, { status: 500 });
      }

      return NextResponse.json({
        profile: newProfile,
        isAdmin: newProfile?.role === 'admin',
        isAuthenticated: true,
        userId: user.id,
      });
    }

    return NextResponse.json({
      profile,
      isAdmin: profile?.role === 'admin',
      isAuthenticated: true,
      userId: user.id,
    });
  } catch (error) {
    console.error('Server error:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

