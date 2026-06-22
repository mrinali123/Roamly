-- Phase 2: Trips and Itinerary Days
-- Run this in the Supabase SQL Editor after schema.sql

CREATE TABLE IF NOT EXISTS public.trips (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  destination TEXT NOT NULL,
  trip_title TEXT NOT NULL,
  arrival_date DATE NOT NULL,
  departure_date DATE NOT NULL,
  hotel_name TEXT NOT NULL,
  hotel_address TEXT NOT NULL DEFAULT '',
  num_travelers INTEGER NOT NULL DEFAULT 1,
  trip_purpose TEXT NOT NULL DEFAULT 'tourism',
  budget_level TEXT NOT NULL DEFAULT 'mid-range',
  pace TEXT NOT NULL DEFAULT 'balanced',
  interests TEXT[] NOT NULL DEFAULT '{}',
  dietary_prefs TEXT[] NOT NULL DEFAULT '{}',
  must_visit TEXT NOT NULL DEFAULT '',
  estimated_budget TEXT NOT NULL DEFAULT '',
  general_tips TEXT[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.itinerary_days (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id UUID NOT NULL REFERENCES public.trips(id) ON DELETE CASCADE,
  day_number INTEGER NOT NULL,
  date DATE NOT NULL,
  theme TEXT NOT NULL DEFAULT '',
  daily_notes TEXT NOT NULL DEFAULT '',
  places JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS trips_user_id_idx ON public.trips(user_id);
CREATE INDEX IF NOT EXISTS trips_created_at_idx ON public.trips(created_at DESC);
CREATE INDEX IF NOT EXISTS itinerary_days_trip_id_idx ON public.itinerary_days(trip_id);
CREATE INDEX IF NOT EXISTS itinerary_days_order_idx ON public.itinerary_days(trip_id, day_number);

-- RLS for trips
ALTER TABLE public.trips ENABLE ROW LEVEL SECURITY;

CREATE POLICY "trips_select_own" ON public.trips
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "trips_insert_own" ON public.trips
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "trips_update_own" ON public.trips
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "trips_delete_own" ON public.trips
  FOR DELETE USING (auth.uid() = user_id);

-- RLS for itinerary_days (inherit ownership via trips)
ALTER TABLE public.itinerary_days ENABLE ROW LEVEL SECURITY;

CREATE POLICY "days_select_own" ON public.itinerary_days
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.trips WHERE trips.id = itinerary_days.trip_id AND trips.user_id = auth.uid())
  );

CREATE POLICY "days_insert_own" ON public.itinerary_days
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.trips WHERE trips.id = itinerary_days.trip_id AND trips.user_id = auth.uid())
  );

CREATE POLICY "days_update_own" ON public.itinerary_days
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.trips WHERE trips.id = itinerary_days.trip_id AND trips.user_id = auth.uid())
  );

CREATE POLICY "days_delete_own" ON public.itinerary_days
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM public.trips WHERE trips.id = itinerary_days.trip_id AND trips.user_id = auth.uid())
  );
