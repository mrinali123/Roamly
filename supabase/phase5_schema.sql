-- Phase 5: Power Features
-- Run in Supabase SQL Editor after phase4_schema.sql

-- ── New columns on trips ────────────────────────────────────────────────────
ALTER TABLE public.trips
  ADD COLUMN IF NOT EXISTS weather_cache           JSONB         DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS weather_cache_updated_at TIMESTAMPTZ  DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS preferred_currency      TEXT          DEFAULT 'USD';

-- ── New columns on profiles ─────────────────────────────────────────────────
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS home_city          TEXT     DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS default_budget     TEXT     DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS default_interests  TEXT[]   DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS default_dietary    TEXT[]   DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS preferred_currency TEXT     DEFAULT 'USD';

-- ── Budget tracker ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.trip_expenses (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id      UUID        NOT NULL REFERENCES public.trips(id) ON DELETE CASCADE,
  user_id      UUID        NOT NULL REFERENCES auth.users(id)  ON DELETE CASCADE,
  name         TEXT        NOT NULL,
  amount       DECIMAL(12,2) NOT NULL,
  currency     TEXT        NOT NULL DEFAULT 'USD',
  category     TEXT        NOT NULL,
  expense_date DATE        NOT NULL DEFAULT CURRENT_DATE,
  notes        TEXT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS trip_expenses_trip_idx
  ON public.trip_expenses(trip_id, expense_date);

ALTER TABLE public.trip_expenses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "expenses_select" ON public.trip_expenses
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "expenses_insert" ON public.trip_expenses
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "expenses_update" ON public.trip_expenses
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "expenses_delete" ON public.trip_expenses
  FOR DELETE USING (auth.uid() = user_id);

-- ── Collaborative planning ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.trip_collaborators (
  id             UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id        UUID        NOT NULL REFERENCES public.trips(id) ON DELETE CASCADE,
  user_id        UUID        REFERENCES auth.users(id) ON DELETE CASCADE,
  invited_email  TEXT        NOT NULL,
  role           TEXT        NOT NULL DEFAULT 'viewer' CHECK (role IN ('viewer','editor')),
  invite_token   TEXT        UNIQUE NOT NULL,
  accepted_at    TIMESTAMPTZ,
  invited_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS trip_collaborators_trip_idx
  ON public.trip_collaborators(trip_id);
CREATE INDEX IF NOT EXISTS trip_collaborators_token_idx
  ON public.trip_collaborators(invite_token);
CREATE INDEX IF NOT EXISTS trip_collaborators_user_idx
  ON public.trip_collaborators(user_id);

ALTER TABLE public.trip_collaborators ENABLE ROW LEVEL SECURITY;

CREATE POLICY "collabs_select" ON public.trip_collaborators
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.trips WHERE id = trip_id AND user_id = auth.uid())
    OR user_id = auth.uid()
  );

CREATE POLICY "collabs_insert_owner" ON public.trip_collaborators
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.trips WHERE id = trip_id AND user_id = auth.uid())
  );

CREATE POLICY "collabs_update_accept" ON public.trip_collaborators
  FOR UPDATE USING (invited_email = (SELECT email FROM auth.users WHERE id = auth.uid()));

CREATE POLICY "collabs_delete_owner" ON public.trip_collaborators
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM public.trips WHERE id = trip_id AND user_id = auth.uid())
  );

-- Allow collaborators to view trips they accepted
CREATE POLICY "trips_collaborator_select" ON public.trips
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.trip_collaborators
      WHERE trip_id = id AND user_id = auth.uid() AND accepted_at IS NOT NULL
    )
  );

-- Allow collaborators to view itinerary days of their trips
CREATE POLICY "days_collaborator_select" ON public.itinerary_days
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.trip_collaborators
      WHERE trip_id = trip_id AND user_id = auth.uid() AND accepted_at IS NOT NULL
    )
  );
