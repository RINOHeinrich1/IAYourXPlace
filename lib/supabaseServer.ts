import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

/**
 * Creates a Supabase client for server-side operations (API routes, Server Components)
 * This client can access the user's session from cookies
 */
export async function createSupabaseServerClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing user sessions.
          }
        },
      },
    }
  );
}

/**
 * Helper function to get user's profile ID from auth user
 * If profile doesn't exist, creates one automatically
 * Reusable across API routes
 */
export async function getUserProfileId(supabase: ReturnType<typeof createServerClient>, userId: string): Promise<string | null> {
  // First, try to find existing profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('id')
    .eq('owner_id', userId)
    .single();

  if (profile?.id) {
    return profile.id;
  }

  // If no profile exists, create one
  console.log('[getUserProfileId] No profile found for user:', userId, 'Creating one...');

  const { data: newProfile, error: createError } = await supabase
    .from('profiles')
    .insert({
      owner_id: userId,
      role: 'consumer', // Default role
    })
    .select('id')
    .single();

  if (createError) {
    console.error('[getUserProfileId] Error creating profile:', createError);
    return null;
  }

  console.log('[getUserProfileId] Created new profile:', newProfile?.id);
  return newProfile?.id || null;
}

