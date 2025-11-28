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
 * Reusable across API routes
 */
export async function getUserProfileId(supabase: ReturnType<typeof createServerClient>, userId: string): Promise<string | null> {
  const { data: profile } = await supabase
    .from('profiles')
    .select('id')
    .eq('owner_id', userId)
    .single();
  return profile?.id || null;
}

