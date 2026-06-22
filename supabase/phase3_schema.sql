-- Phase 3: Share token support
-- Run in Supabase SQL Editor after phase2_schema.sql

ALTER TABLE public.trips
  ADD COLUMN IF NOT EXISTS share_token TEXT UNIQUE DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS is_public   BOOLEAN NOT NULL DEFAULT false;

CREATE INDEX IF NOT EXISTS trips_share_token_idx
  ON public.trips(share_token) WHERE share_token IS NOT NULL;

-- Allow anyone to read a trip that has been made public
CREATE POLICY "trips_select_public" ON public.trips
  FOR SELECT USING (is_public = true AND share_token IS NOT NULL);

-- Allow anyone to read itinerary days of public trips
CREATE POLICY "days_select_public" ON public.itinerary_days
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.trips
      WHERE trips.id = itinerary_days.trip_id
      AND   trips.is_public = true
    )
  );
