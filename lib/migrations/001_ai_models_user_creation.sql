-- ============================================
-- MIGRATION: AI Models User Creation Support
-- Date: 2025-12-02
-- Description: Adds missing columns to ai_models table to support 
--              user-created AI models from the /creer-modele flow
-- ============================================

-- Add gender column for AI model gender selection
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'ai_models' AND column_name = 'gender') THEN
    ALTER TABLE public.ai_models ADD COLUMN gender text DEFAULT 'femmes' CHECK (gender IN ('femmes', 'hommes'));
  END IF;
END $$;

-- Add hair_type column (already may exist from database.sql, but ensure it exists)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'ai_models' AND column_name = 'hair_type') THEN
    ALTER TABLE public.ai_models ADD COLUMN hair_type text;
  END IF;
END $$;

-- Add hair_color column
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'ai_models' AND column_name = 'hair_color') THEN
    ALTER TABLE public.ai_models ADD COLUMN hair_color text;
  END IF;
END $$;

-- Add eye_color column
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'ai_models' AND column_name = 'eye_color') THEN
    ALTER TABLE public.ai_models ADD COLUMN eye_color text;
  END IF;
END $$;

-- Add body_type column
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'ai_models' AND column_name = 'body_type') THEN
    ALTER TABLE public.ai_models ADD COLUMN body_type text;
  END IF;
END $$;

-- Add chest_size column
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'ai_models' AND column_name = 'chest_size') THEN
    ALTER TABLE public.ai_models ADD COLUMN chest_size text;
  END IF;
END $$;

-- Add ethnicities array column
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'ai_models' AND column_name = 'ethnicities') THEN
    ALTER TABLE public.ai_models ADD COLUMN ethnicities text[] DEFAULT '{}';
  END IF;
END $$;

-- Add age column
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'ai_models' AND column_name = 'age') THEN
    ALTER TABLE public.ai_models ADD COLUMN age integer CHECK (age >= 18 AND age <= 100);
  END IF;
END $$;

-- Add relationship array column
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'ai_models' AND column_name = 'relationship') THEN
    ALTER TABLE public.ai_models ADD COLUMN relationship text[] DEFAULT '{}';
  END IF;
END $$;

-- Add profession array column
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'ai_models' AND column_name = 'profession') THEN
    ALTER TABLE public.ai_models ADD COLUMN profession text[] DEFAULT '{}';
  END IF;
END $$;

-- Add sexual_preferences array column
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'ai_models' AND column_name = 'sexual_preferences') THEN
    ALTER TABLE public.ai_models ADD COLUMN sexual_preferences text[] DEFAULT '{}';
  END IF;
END $$;

-- Add voice column
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'ai_models' AND column_name = 'voice') THEN
    ALTER TABLE public.ai_models ADD COLUMN voice text;
  END IF;
END $$;

-- Add created_by column (references the user who created the AI model)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'ai_models' AND column_name = 'created_by') THEN
    ALTER TABLE public.ai_models ADD COLUMN created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL;
  END IF;
END $$;

-- Add status column with default value
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'ai_models' AND column_name = 'status') THEN
    ALTER TABLE public.ai_models ADD COLUMN status text DEFAULT 'active';
  END IF;
END $$;

-- Add is_public column to control visibility
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'ai_models' AND column_name = 'is_public') THEN
    ALTER TABLE public.ai_models ADD COLUMN is_public boolean DEFAULT false;
  END IF;
END $$;

-- Create index on created_by for faster queries of user's AI models
CREATE INDEX IF NOT EXISTS idx_ai_models_created_by ON public.ai_models(created_by);

-- Create index on status for filtering
CREATE INDEX IF NOT EXISTS idx_ai_models_status ON public.ai_models(status);

-- ============================================
-- RLS Policies for AI Models
-- ============================================

-- Enable RLS on ai_models table
ALTER TABLE public.ai_models ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own AI models and public ones
DROP POLICY IF EXISTS "Users can view own and public ai_models" ON public.ai_models;
CREATE POLICY "Users can view own and public ai_models" ON public.ai_models
  FOR SELECT USING (
    created_by = auth.uid() 
    OR is_public = true 
    OR created_by IS NULL
  );

-- Policy: Users can insert their own AI models
DROP POLICY IF EXISTS "Users can insert own ai_models" ON public.ai_models;
CREATE POLICY "Users can insert own ai_models" ON public.ai_models
  FOR INSERT WITH CHECK (created_by = auth.uid());

-- Policy: Users can update their own AI models
DROP POLICY IF EXISTS "Users can update own ai_models" ON public.ai_models;
CREATE POLICY "Users can update own ai_models" ON public.ai_models
  FOR UPDATE USING (created_by = auth.uid());

-- Policy: Users can delete their own AI models
DROP POLICY IF EXISTS "Users can delete own ai_models" ON public.ai_models;
CREATE POLICY "Users can delete own ai_models" ON public.ai_models
  FOR DELETE USING (created_by = auth.uid());

-- ============================================
-- MIGRATION COMPLETE
-- ============================================

