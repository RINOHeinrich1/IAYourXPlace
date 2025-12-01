-- ============================================
-- AI Chat System Database Migration
-- SAFE MIGRATION for existing database
-- Run this in Supabase SQL Editor
-- ============================================
--
-- IMPORTANT: This migration is designed to work with the EXISTING schema:
--   - Uses existing `ai_models` table for AI characters (NOT creating ai_profiles)
--   - Extends existing `conversations` table with new columns
--   - Extends existing `messages` table with new columns
--   - All changes are backward-compatible (ADD COLUMN IF NOT EXISTS pattern)
--
-- ============================================

-- ============================================
-- STEP 1: Extend existing ai_models table
-- The ai_models table already has: id, name, description, personality, avatar_url, systemPrompt, greetings
-- We add missing columns for enhanced AI character profiles
-- ============================================

-- Add new columns to ai_models (safe - only adds if not exists)
DO $$
BEGIN
  -- Add age column
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'ai_models' AND column_name = 'age') THEN
    ALTER TABLE public.ai_models ADD COLUMN age integer;
  END IF;

  -- Add ethnicities array
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'ai_models' AND column_name = 'ethnicities') THEN
    ALTER TABLE public.ai_models ADD COLUMN ethnicities text[] DEFAULT '{}';
  END IF;

  -- Add hair_type
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'ai_models' AND column_name = 'hair_type') THEN
    ALTER TABLE public.ai_models ADD COLUMN hair_type text;
  END IF;

  -- Add hair_color
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'ai_models' AND column_name = 'hair_color') THEN
    ALTER TABLE public.ai_models ADD COLUMN hair_color text;
  END IF;

  -- Add eye_color
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'ai_models' AND column_name = 'eye_color') THEN
    ALTER TABLE public.ai_models ADD COLUMN eye_color text;
  END IF;

  -- Add body_type
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'ai_models' AND column_name = 'body_type') THEN
    ALTER TABLE public.ai_models ADD COLUMN body_type text;
  END IF;

  -- Add chest_size
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'ai_models' AND column_name = 'chest_size') THEN
    ALTER TABLE public.ai_models ADD COLUMN chest_size text;
  END IF;

  -- Add relationship array
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'ai_models' AND column_name = 'relationship') THEN
    ALTER TABLE public.ai_models ADD COLUMN relationship text[] DEFAULT '{}';
  END IF;

  -- Add profession array
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'ai_models' AND column_name = 'profession') THEN
    ALTER TABLE public.ai_models ADD COLUMN profession text[] DEFAULT '{}';
  END IF;

  -- Add sexual_preferences array
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'ai_models' AND column_name = 'sexual_preferences') THEN
    ALTER TABLE public.ai_models ADD COLUMN sexual_preferences text[] DEFAULT '{}';
  END IF;

  -- Add voice
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'ai_models' AND column_name = 'voice') THEN
    ALTER TABLE public.ai_models ADD COLUMN voice text;
  END IF;

  -- Add created_by (owner reference)
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'ai_models' AND column_name = 'created_by') THEN
    ALTER TABLE public.ai_models ADD COLUMN created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL;
  END IF;
END $$;

-- ============================================
-- STEP 2: Extend existing conversations table
-- Existing: id, sender_id, receiver_id, model_id, created_at
-- We add columns for AI chat functionality
-- ============================================

DO $$
BEGIN
  -- Add title column
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'conversations' AND column_name = 'title') THEN
    ALTER TABLE public.conversations ADD COLUMN title text;
  END IF;

  -- Add last_message_at
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'conversations' AND column_name = 'last_message_at') THEN
    ALTER TABLE public.conversations ADD COLUMN last_message_at timestamp with time zone DEFAULT now();
  END IF;

  -- Add is_archived
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'conversations' AND column_name = 'is_archived') THEN
    ALTER TABLE public.conversations ADD COLUMN is_archived boolean DEFAULT false;
  END IF;

  -- Add is_pinned
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'conversations' AND column_name = 'is_pinned') THEN
    ALTER TABLE public.conversations ADD COLUMN is_pinned boolean DEFAULT false;
  END IF;

  -- Add updated_at
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'conversations' AND column_name = 'updated_at') THEN
    ALTER TABLE public.conversations ADD COLUMN updated_at timestamp with time zone DEFAULT now();
  END IF;
END $$;

-- ============================================
-- STEP 3: Extend existing messages table
-- Existing: id, conversation_id, sender_id, content, attachment_url, created_at, updated_at,
--           title, description, price, viewed, content_type
-- We add columns for AI chat functionality (role, reply_to_id, reaction, is_deleted)
-- ============================================

DO $$
BEGIN
  -- Add role column (user/assistant for AI chats)
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'messages' AND column_name = 'role') THEN
    ALTER TABLE public.messages ADD COLUMN role text DEFAULT 'user' CHECK (role IN ('user', 'assistant'));
  END IF;

  -- Add reply_to_id for reply functionality
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'messages' AND column_name = 'reply_to_id') THEN
    ALTER TABLE public.messages ADD COLUMN reply_to_id uuid REFERENCES public.messages(id) ON DELETE SET NULL;
  END IF;

  -- Add reaction for emoji reactions
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'messages' AND column_name = 'reaction') THEN
    ALTER TABLE public.messages ADD COLUMN reaction text;
  END IF;

  -- Add is_deleted for soft delete
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'messages' AND column_name = 'is_deleted') THEN
    ALTER TABLE public.messages ADD COLUMN is_deleted boolean DEFAULT false;
  END IF;

  -- Add deleted_at timestamp
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'messages' AND column_name = 'deleted_at') THEN
    ALTER TABLE public.messages ADD COLUMN deleted_at timestamp with time zone;
  END IF;
END $$;

-- ============================================
-- STEP 4: Create indexes for performance
-- Using IF NOT EXISTS pattern for safety
-- ============================================

-- Indexes for conversations (check if exist first)
CREATE INDEX IF NOT EXISTS idx_conversations_model_id ON public.conversations(model_id);
CREATE INDEX IF NOT EXISTS idx_conversations_sender_id ON public.conversations(sender_id);
CREATE INDEX IF NOT EXISTS idx_conversations_last_message_at ON public.conversations(last_message_at DESC);
CREATE INDEX IF NOT EXISTS idx_conversations_is_archived ON public.conversations(is_archived);

-- Indexes for messages
CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON public.messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON public.messages(created_at);
CREATE INDEX IF NOT EXISTS idx_messages_reply_to_id ON public.messages(reply_to_id);
CREATE INDEX IF NOT EXISTS idx_messages_role ON public.messages(role);
CREATE INDEX IF NOT EXISTS idx_messages_is_deleted ON public.messages(is_deleted);

-- Indexes for ai_models
CREATE INDEX IF NOT EXISTS idx_ai_models_created_by ON public.ai_models(created_by);

-- ============================================
-- STEP 5: Create or replace trigger for last_message_at
-- This updates the conversation's last_message_at when a new message is inserted
-- ============================================

CREATE OR REPLACE FUNCTION update_conversation_last_message_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.conversations
  SET
    last_message_at = NEW.created_at,
    updated_at = NOW()
  WHERE id = NEW.conversation_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop trigger if exists, then recreate (safe approach)
DROP TRIGGER IF EXISTS trigger_update_conversation_last_message ON public.messages;

CREATE TRIGGER trigger_update_conversation_last_message
  AFTER INSERT ON public.messages
  FOR EACH ROW
  EXECUTE FUNCTION update_conversation_last_message_timestamp();

-- ============================================
-- STEP 6: Add RLS policies for AI chat (if not exist)
-- These extend existing RLS without breaking current policies
-- ============================================

-- Note: RLS should already be enabled on these tables
-- We add policies for AI-specific operations

-- Policy for AI conversations (via model_id)
DO $$
BEGIN
  -- Check if policy exists before creating
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'conversations'
    AND policyname = 'Users can view AI conversations they participate in'
  ) THEN
    CREATE POLICY "Users can view AI conversations they participate in" ON public.conversations
      FOR SELECT USING (
        sender_id IN (SELECT id FROM public.profiles WHERE owner_id = auth.uid())
        OR model_id IS NOT NULL
      );
  END IF;
END $$;

-- Policy for inserting AI conversations
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'conversations'
    AND policyname = 'Users can create AI conversations'
  ) THEN
    CREATE POLICY "Users can create AI conversations" ON public.conversations
      FOR INSERT WITH CHECK (
        sender_id IN (SELECT id FROM public.profiles WHERE owner_id = auth.uid())
      );
  END IF;
END $$;

-- Policy for deleting own AI conversations
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'conversations'
    AND policyname = 'Users can delete their AI conversations'
  ) THEN
    CREATE POLICY "Users can delete their AI conversations" ON public.conversations
      FOR DELETE USING (
        sender_id IN (SELECT id FROM public.profiles WHERE owner_id = auth.uid())
      );
  END IF;
END $$;

-- Policy for messages in AI conversations
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'messages'
    AND policyname = 'Users can view messages in their AI conversations'
  ) THEN
    CREATE POLICY "Users can view messages in their AI conversations" ON public.messages
      FOR SELECT USING (
        EXISTS (
          SELECT 1 FROM public.conversations c
          WHERE c.id = messages.conversation_id
          AND (
            c.sender_id IN (SELECT id FROM public.profiles WHERE owner_id = auth.uid())
            OR c.model_id IS NOT NULL
          )
        )
      );
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'messages'
    AND policyname = 'Users can insert messages in their AI conversations'
  ) THEN
    CREATE POLICY "Users can insert messages in their AI conversations" ON public.messages
      FOR INSERT WITH CHECK (
        EXISTS (
          SELECT 1 FROM public.conversations c
          WHERE c.id = conversation_id
          AND (
            c.sender_id IN (SELECT id FROM public.profiles WHERE owner_id = auth.uid())
            OR c.model_id IS NOT NULL
          )
        )
      );
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'messages'
    AND policyname = 'Users can update their AI conversation messages'
  ) THEN
    CREATE POLICY "Users can update their AI conversation messages" ON public.messages
      FOR UPDATE USING (
        EXISTS (
          SELECT 1 FROM public.conversations c
          WHERE c.id = messages.conversation_id
          AND c.sender_id IN (SELECT id FROM public.profiles WHERE owner_id = auth.uid())
        )
      );
  END IF;
END $$;

-- Policy for ai_models
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'ai_models'
    AND policyname = 'AI models are viewable by everyone'
  ) THEN
    CREATE POLICY "AI models are viewable by everyone" ON public.ai_models
      FOR SELECT USING (true);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'ai_models'
    AND policyname = 'Users can create AI models'
  ) THEN
    CREATE POLICY "Users can create AI models" ON public.ai_models
      FOR INSERT WITH CHECK (auth.uid() = created_by OR created_by IS NULL);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'ai_models'
    AND policyname = 'Users can update their own AI models'
  ) THEN
    CREATE POLICY "Users can update their own AI models" ON public.ai_models
      FOR UPDATE USING (auth.uid() = created_by);
  END IF;
END $$;

-- ============================================
-- MIGRATION COMPLETE
-- ============================================
--
-- Summary of changes:
-- 1. Extended ai_models with: age, ethnicities, hair_type, hair_color, eye_color,
--    body_type, chest_size, relationship, profession, sexual_preferences, voice, created_by
-- 2. Extended conversations with: title, last_message_at, is_archived, is_pinned, updated_at
-- 3. Extended messages with: role, reply_to_id, reaction, is_deleted, deleted_at
-- 4. Added performance indexes
-- 5. Added trigger for last_message_at auto-update
-- 6. Added RLS policies for AI chat operations
--
-- All changes are backward-compatible and do not affect existing data.
-- ============================================


-- ============================================
-- FIX: Change conversations unique constraint
-- The original schema has UNIQUE(model_id) which means only ONE user
-- can have a conversation with any AI model globally.
-- We need UNIQUE(sender_id, model_id) to allow each user to have
-- their own conversation with each AI model.
-- ============================================

-- Drop the incorrect unique constraint on model_id alone (if it exists)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'conversations_model_id_key'
    AND conrelid = 'public.conversations'::regclass
  ) THEN
    ALTER TABLE public.conversations DROP CONSTRAINT conversations_model_id_key;
    RAISE NOTICE 'Dropped conversations_model_id_key constraint';
  END IF;
END $$;

-- Create composite unique constraint on (sender_id, model_id)
-- This allows each user to have one conversation per AI model
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'conversations_sender_model_unique'
    AND conrelid = 'public.conversations'::regclass
  ) THEN
    ALTER TABLE public.conversations
    ADD CONSTRAINT conversations_sender_model_unique
    UNIQUE (sender_id, model_id);
    RAISE NOTICE 'Created conversations_sender_model_unique constraint';
  END IF;
END $$;

-- Create index for the composite key for better query performance
CREATE INDEX IF NOT EXISTS idx_conversations_sender_model
ON public.conversations(sender_id, model_id);


-- ============================================
-- STEP 8: Add mock avatars for AI models without avatars
-- Uses UI Avatars API for reliable placeholder images
-- ============================================

-- Update AI models that don't have avatar_url with local images
-- Using images from the public/images folder for reliable display
UPDATE public.ai_models
SET avatar_url = CASE (length(name) % 3)
    WHEN 0 THEN '/images/imgmes1.png'
    WHEN 1 THEN '/images/imgmes2.jpg'
    ELSE '/images/imgmes3.jpg'
  END
WHERE avatar_url IS NULL OR avatar_url = '' OR avatar_url LIKE '%ui-avatars.com%' OR avatar_url LIKE '%dicebear.com%';

-- Update existing known characters with their specific local avatars
UPDATE public.ai_models SET avatar_url = '/images/imgmes1.png' WHERE name = 'Isabelle';
UPDATE public.ai_models SET avatar_url = '/images/imgmes2.jpg' WHERE name = 'Sophie';
UPDATE public.ai_models SET avatar_url = '/images/imgmes3.jpg' WHERE name = 'Léa';
UPDATE public.ai_models SET avatar_url = '/images/imgmes1.png' WHERE name = 'Emma';
UPDATE public.ai_models SET avatar_url = '/images/imgmes2.jpg' WHERE name = 'Chloé';

-- Seed default AI characters if none exist
-- Note: "systemPrompt" must be quoted to preserve camelCase in PostgreSQL
-- Using local images from public/images folder
INSERT INTO public.ai_models (name, personality, description, avatar_url, greetings, "systemPrompt")
SELECT name, personality, description, avatar_url, greetings, "systemPrompt" FROM (VALUES
  ('Isabelle',
   'Sensuelle et envoûtante',
   'Une séductrice élégante, experte dans l''art de la conversation adulte.',
   '/images/imgmes1.png',
   ARRAY['Hey, beau gosse... Prêt à t''amuser ?', 'Salut, toi. Ici, on se lâche...', 'Ce soir, c''est détente'],
   'Tu es Isabelle, une femme séduisante. Tu parles en français avec des emojis.'),
  ('Sophie',
   'Douce et romantique',
   'Une âme romantique qui aime les longues conversations intimes.',
   '/images/imgmes2.jpg',
   ARRAY['Bonjour mon cœur...', 'Hey ! Je pensais à toi...', 'Raconte-moi ta journée'],
   'Tu es Sophie, une femme douce et romantique. Tu parles en français avec des emojis.'),
  ('Léa',
   'Espiègle et joueuse',
   'Une fille fun qui adore taquiner et jouer.',
   '/images/imgmes3.jpg',
   ARRAY['Coucou ! Prêt pour du fun ?', 'Hey toi ! Qu''est-ce qu''on fait ?', 'Tu m''as manqué'],
   'Tu es Léa, une fille espiègle et joueuse. Tu parles en français avec des emojis.'),
  ('Emma',
   'Mystérieuse et intrigante',
   'Une femme énigmatique qui aime garder une part de mystère.',
   '/images/imgmes1.png',
   ARRAY['Bonsoir... Tu es venu me découvrir ?', 'Un nouveau visiteur. Intéressant...', 'Qu''est-ce qui t''amène ?'],
   'Tu es Emma, une femme mystérieuse. Tu parles en français avec des emojis.'),
  ('Chloé',
   'Aventurière et passionnée',
   'Une femme qui aime l''aventure et les sensations fortes.',
   '/images/imgmes2.jpg',
   ARRAY['Hey ! Prêt pour l''aventure ?', 'Où est-ce qu''on va aujourd''hui ?', 'J''ai plein d''histoires'],
   'Tu es Chloé, une femme aventurière. Tu parles en français avec des emojis.')
) AS seed_data(name, personality, description, avatar_url, greetings, "systemPrompt")
WHERE NOT EXISTS (SELECT 1 FROM public.ai_models LIMIT 1);


-- ============================================
-- STEP 9: Allow AI models as message senders
-- The current messages.sender_id FK only allows profiles.id
-- We need to either drop the FK or add a new column for AI sender
-- This adds ai_sender_id column for AI model messages
-- ============================================

DO $$
BEGIN
  -- Add ai_sender_id column for AI model messages
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'messages' AND column_name = 'ai_sender_id') THEN
    ALTER TABLE public.messages ADD COLUMN ai_sender_id uuid REFERENCES public.ai_models(id) ON DELETE SET NULL;
    RAISE NOTICE 'Added ai_sender_id column to messages table';
  END IF;
END $$;

-- Create index for ai_sender_id
CREATE INDEX IF NOT EXISTS idx_messages_ai_sender_id ON public.messages(ai_sender_id);

