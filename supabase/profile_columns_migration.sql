-- Run this in your Supabase dashboard → SQL Editor
-- Adds profile preference columns and fixes the upsert policy

-- Add missing columns to profiles
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS home_city          TEXT          DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS default_budget     TEXT          DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS default_interests  TEXT[]        DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS default_dietary    TEXT[]        DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS preferred_currency TEXT          DEFAULT 'USD';

-- Allow users to upsert their own profile row (needed for the upsert API call)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'profiles' AND policyname = 'Users can insert own profile'
  ) THEN
    CREATE POLICY "Users can insert own profile"
      ON public.profiles
      FOR INSERT
      WITH CHECK (auth.uid() = id);
  END IF;
END $$;
