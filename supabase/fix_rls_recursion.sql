-- ── Nuclear RLS fix ──────────────────────────────────────────────────────────
-- Drops ALL policies on trips / trip_collaborators / itinerary_days regardless
-- of name, then recreates them cleanly with no circular references.
--
-- Run in: Supabase Dashboard → SQL Editor → New query → Run

-- ── 1. Drop every policy on the three affected tables ────────────────────────
DO $$
DECLARE pol record;
BEGIN
  FOR pol IN
    SELECT policyname, tablename FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename IN ('trips', 'trip_collaborators', 'itinerary_days')
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', pol.policyname, pol.tablename);
  END LOOP;
END $$;

-- ── 2. SECURITY DEFINER helpers — bypass RLS to break the cycle ──────────────
CREATE OR REPLACE FUNCTION public.rls_is_trip_owner(p_trip_id uuid)
RETURNS boolean LANGUAGE sql SECURITY DEFINER STABLE SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.trips WHERE id = p_trip_id AND user_id = auth.uid()
  );
$$;

CREATE OR REPLACE FUNCTION public.rls_is_trip_collaborator(p_trip_id uuid)
RETURNS boolean LANGUAGE sql SECURITY DEFINER STABLE SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.trip_collaborators
    WHERE trip_id = p_trip_id AND user_id = auth.uid() AND accepted_at IS NOT NULL
  );
$$;

-- ── 3. trips ─────────────────────────────────────────────────────────────────
-- Owner: full CRUD using only auth.uid() — no other table touched
CREATE POLICY "trips_owner_all" ON public.trips
  FOR ALL
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Collaborators: read-only via SECURITY DEFINER (no RLS loop)
CREATE POLICY "trips_collaborator_select" ON public.trips
  FOR SELECT
  USING (public.rls_is_trip_collaborator(id));

-- ── 4. trip_collaborators ────────────────────────────────────────────────────
CREATE POLICY "collabs_select" ON public.trip_collaborators
  FOR SELECT
  USING (public.rls_is_trip_owner(trip_id) OR user_id = auth.uid());

CREATE POLICY "collabs_insert_owner" ON public.trip_collaborators
  FOR INSERT
  WITH CHECK (public.rls_is_trip_owner(trip_id));

CREATE POLICY "collabs_delete_owner" ON public.trip_collaborators
  FOR DELETE
  USING (public.rls_is_trip_owner(trip_id));

-- ── 5. itinerary_days ────────────────────────────────────────────────────────
-- Use SECURITY DEFINER so checking trip ownership doesn't re-enter trips RLS
CREATE POLICY "days_owner_all" ON public.itinerary_days
  FOR ALL
  USING (public.rls_is_trip_owner(trip_id))
  WITH CHECK (public.rls_is_trip_owner(trip_id));

CREATE POLICY "days_collaborator_select" ON public.itinerary_days
  FOR SELECT
  USING (public.rls_is_trip_collaborator(trip_id));
