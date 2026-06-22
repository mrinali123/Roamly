-- Allows an authenticated user to delete their own account.
-- SECURITY DEFINER runs as the function owner (postgres superuser),
-- which has permission to delete from auth.users.
-- The function still verifies auth.uid() so it can only delete the caller's account.
--
-- Run this in Supabase Dashboard → SQL Editor

CREATE OR REPLACE FUNCTION public.delete_own_account()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  _uid uuid := auth.uid();
BEGIN
  IF _uid IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;
  DELETE FROM auth.users WHERE id = _uid;
END;
$$;

-- Revoke public access, grant only to signed-in users
REVOKE ALL ON FUNCTION public.delete_own_account() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.delete_own_account() TO authenticated;
