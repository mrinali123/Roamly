-- Phase 4: AI Chat history
-- Run in Supabase SQL Editor after phase3_schema.sql

CREATE TABLE IF NOT EXISTS public.trip_chats (
  id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id    UUID        NOT NULL REFERENCES public.trips(id) ON DELETE CASCADE,
  user_id    UUID        NOT NULL REFERENCES auth.users(id)  ON DELETE CASCADE,
  role       TEXT        NOT NULL CHECK (role IN ('user', 'assistant')),
  content    TEXT        NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS trip_chats_trip_user_idx
  ON public.trip_chats(trip_id, user_id, created_at DESC);

ALTER TABLE public.trip_chats ENABLE ROW LEVEL SECURITY;

CREATE POLICY "chats_select_own" ON public.trip_chats
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "chats_insert_own" ON public.trip_chats
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "chats_delete_own" ON public.trip_chats
  FOR DELETE USING (auth.uid() = user_id);
