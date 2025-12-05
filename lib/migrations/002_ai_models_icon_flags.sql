-- ============================================
-- MIGRATION: AI Models Icon Flags
-- Date: 2025-12-05
-- Description: Adds has_voice and has_live_action columns to control
--              which icons appear on AI character cards
-- ============================================

-- Add has_voice column (microphone icon)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'ai_models' AND column_name = 'has_voice') THEN
    ALTER TABLE public.ai_models ADD COLUMN has_voice boolean DEFAULT false;
  END IF;
END $$;

-- Add has_live_action column (console icon)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'ai_models' AND column_name = 'has_live_action') THEN
    ALTER TABLE public.ai_models ADD COLUMN has_live_action boolean DEFAULT false;
  END IF;
END $$;

-- Create index for filtering live action characters
CREATE INDEX IF NOT EXISTS idx_ai_models_has_live_action ON public.ai_models(has_live_action);

-- Create index for filtering voice-enabled characters
CREATE INDEX IF NOT EXISTS idx_ai_models_has_voice ON public.ai_models(has_voice);

COMMENT ON COLUMN public.ai_models.has_voice IS 'If true, displays microphone icon on character card';
COMMENT ON COLUMN public.ai_models.has_live_action IS 'If true, displays console icon and character appears in Live Action section';

