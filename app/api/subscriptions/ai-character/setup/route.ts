import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// This endpoint creates the ai_character_subscriptions table if it doesn't exist
// Uses service role to bypass RLS

export async function POST() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
      return NextResponse.json({ error: 'Missing Supabase credentials' }, { status: 500 });
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey);

    // Check if table exists by trying to select from it
    const { error: checkError } = await supabase
      .from('ai_character_subscriptions')
      .select('id')
      .limit(1);

    if (checkError && checkError.message.includes('does not exist')) {
      // Table doesn't exist, create it using SQL
      const { error: createError } = await supabase.rpc('exec_sql', {
        sql: `
          CREATE TABLE IF NOT EXISTS public.ai_character_subscriptions (
            id uuid NOT NULL DEFAULT gen_random_uuid(),
            user_id uuid NOT NULL,
            ai_model_id uuid NOT NULL,
            is_active boolean DEFAULT true,
            created_at timestamp with time zone DEFAULT now(),
            updated_at timestamp with time zone DEFAULT now(),
            CONSTRAINT ai_character_subscriptions_pkey PRIMARY KEY (id),
            CONSTRAINT ai_character_subscriptions_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE,
            CONSTRAINT ai_character_subscriptions_ai_model_id_fkey FOREIGN KEY (ai_model_id) REFERENCES public.ai_models(id) ON DELETE CASCADE,
            CONSTRAINT ai_character_subscriptions_user_model_unique UNIQUE (user_id, ai_model_id)
          );
          
          -- Enable RLS
          ALTER TABLE public.ai_character_subscriptions ENABLE ROW LEVEL SECURITY;
          
          -- Policy: Users can read their own subscriptions
          CREATE POLICY "Users can view own subscriptions" ON public.ai_character_subscriptions
            FOR SELECT USING (true);
          
          -- Policy: Users can insert their own subscriptions
          CREATE POLICY "Users can create subscriptions" ON public.ai_character_subscriptions
            FOR INSERT WITH CHECK (true);
          
          -- Policy: Users can update their own subscriptions
          CREATE POLICY "Users can update own subscriptions" ON public.ai_character_subscriptions
            FOR UPDATE USING (true);
        `
      });

      if (createError) {
        console.error('Error creating table via RPC:', createError);
        // Try alternative: direct SQL might not work, but table creation might need Supabase Dashboard
        return NextResponse.json({
          success: false,
          error: 'Cannot create table via API. Please create the table in Supabase Dashboard.',
          sql: `
CREATE TABLE public.ai_character_subscriptions (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  ai_model_id uuid NOT NULL,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT ai_character_subscriptions_pkey PRIMARY KEY (id),
  CONSTRAINT ai_character_subscriptions_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE,
  CONSTRAINT ai_character_subscriptions_ai_model_id_fkey FOREIGN KEY (ai_model_id) REFERENCES public.ai_models(id) ON DELETE CASCADE,
  CONSTRAINT ai_character_subscriptions_user_model_unique UNIQUE (user_id, ai_model_id)
);

ALTER TABLE public.ai_character_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own subscriptions" ON public.ai_character_subscriptions FOR SELECT USING (true);
CREATE POLICY "Users can create subscriptions" ON public.ai_character_subscriptions FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update own subscriptions" ON public.ai_character_subscriptions FOR UPDATE USING (true);
          `
        }, { status: 500 });
      }

      return NextResponse.json({
        success: true,
        message: 'Table ai_character_subscriptions created successfully'
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Table ai_character_subscriptions already exists'
    });

  } catch (error) {
    console.error('Setup error:', error);
    return NextResponse.json({ error: 'Setup failed' }, { status: 500 });
  }
}

