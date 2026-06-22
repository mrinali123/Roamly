-- ── Fix invite token lookup (bypasses RLS for anonymous visitors) ────────────
-- The invite page needs to read a trip_collaborators row by token BEFORE
-- the user is logged in. RLS blocks this, so we use SECURITY DEFINER.

-- 1. Read invite by token (safe — token is a random 12-byte base64url secret)
CREATE OR REPLACE FUNCTION public.get_invite_by_token(p_token text)
RETURNS TABLE (
  id          uuid,
  trip_id     uuid,
  invited_email text,
  role        text,
  accepted_at timestamptz
)
LANGUAGE sql SECURITY DEFINER STABLE SET search_path = public AS $$
  SELECT id, trip_id, invited_email, role, accepted_at
  FROM public.trip_collaborators
  WHERE invite_token = p_token
  LIMIT 1;
$$;

-- 2. Accept invite — sets user_id + accepted_at for the calling user
CREATE OR REPLACE FUNCTION public.accept_invite(p_token text)
RETURNS json
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_row public.trip_collaborators;
BEGIN
  SELECT * INTO v_row
  FROM public.trip_collaborators
  WHERE invite_token = p_token
  LIMIT 1;

  IF NOT FOUND THEN
    RETURN json_build_object('error', 'Invalid invite token');
  END IF;

  IF v_row.accepted_at IS NOT NULL THEN
    RETURN json_build_object('trip_id', v_row.trip_id);
  END IF;

  UPDATE public.trip_collaborators
  SET user_id = auth.uid(), accepted_at = now()
  WHERE id = v_row.id;

  RETURN json_build_object('trip_id', v_row.trip_id);
END;
$$;
