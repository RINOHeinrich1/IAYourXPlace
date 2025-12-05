import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Use service role key to run migrations
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * POST /api/aliveai/run-migration
 * 
 * Runs the migration to add has_voice and has_live_action columns
 */
export async function POST() {
  try {
    console.log('Running migration: Adding has_voice and has_live_action columns...');

    // Try to add has_voice column
    const { error: voiceError } = await supabaseAdmin.rpc('exec_sql', {
      sql: `ALTER TABLE public.ai_models ADD COLUMN IF NOT EXISTS has_voice boolean DEFAULT false;`
    });

    if (voiceError) {
      // If rpc doesn't work, try direct approach using a workaround
      // We'll try to select with the column to check if it exists
      const { error: checkError } = await supabaseAdmin
        .from('ai_models')
        .select('has_voice')
        .limit(1);

      if (checkError && checkError.message.includes('has_voice')) {
        console.log('has_voice column does not exist yet, but cannot add it via API');
        return NextResponse.json({
          success: false,
          error: 'Migration requires direct database access. Please run the SQL migration manually.',
          sqlToRun: `
            ALTER TABLE public.ai_models ADD COLUMN IF NOT EXISTS has_voice boolean DEFAULT false;
            ALTER TABLE public.ai_models ADD COLUMN IF NOT EXISTS has_live_action boolean DEFAULT false;
          `
        }, { status: 500 });
      }
    }

    // Try to add has_live_action column
    const { error: liveActionError } = await supabaseAdmin.rpc('exec_sql', {
      sql: `ALTER TABLE public.ai_models ADD COLUMN IF NOT EXISTS has_live_action boolean DEFAULT false;`
    });

    if (liveActionError) {
      const { error: checkError } = await supabaseAdmin
        .from('ai_models')
        .select('has_live_action')
        .limit(1);

      if (checkError && checkError.message.includes('has_live_action')) {
        console.log('has_live_action column does not exist yet, but cannot add it via API');
      }
    }

    // Test if columns exist by querying
    const { data, error: testError } = await supabaseAdmin
      .from('ai_models')
      .select('id, has_voice, has_live_action')
      .limit(1);

    if (testError) {
      return NextResponse.json({
        success: false,
        error: `Column check failed: ${testError.message}`,
        hint: 'You need to run the migration SQL manually in Supabase SQL Editor',
        sqlToRun: `
          ALTER TABLE public.ai_models ADD COLUMN IF NOT EXISTS has_voice boolean DEFAULT false;
          ALTER TABLE public.ai_models ADD COLUMN IF NOT EXISTS has_live_action boolean DEFAULT false;
          CREATE INDEX IF NOT EXISTS idx_ai_models_has_live_action ON public.ai_models(has_live_action);
          CREATE INDEX IF NOT EXISTS idx_ai_models_has_voice ON public.ai_models(has_voice);
        `
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'Migration completed successfully. Columns exist.',
      sample: data
    });

  } catch (error) {
    console.error('Migration error:', error);
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

/**
 * GET /api/aliveai/run-migration
 * 
 * Returns the SQL needed to run the migration manually
 */
export async function GET() {
  return NextResponse.json({
    message: 'Run this SQL in Supabase SQL Editor to add the required columns:',
    sql: `
-- Add has_voice column (microphone icon)
ALTER TABLE public.ai_models ADD COLUMN IF NOT EXISTS has_voice boolean DEFAULT false;

-- Add has_live_action column (console icon)
ALTER TABLE public.ai_models ADD COLUMN IF NOT EXISTS has_live_action boolean DEFAULT false;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_ai_models_has_live_action ON public.ai_models(has_live_action);
CREATE INDEX IF NOT EXISTS idx_ai_models_has_voice ON public.ai_models(has_voice);
    `.trim()
  });
}

