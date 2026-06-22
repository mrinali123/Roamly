import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;
  const supabase = await createClient();

  const { data } = await supabase
    .from("trip_collaborators")
    .select("id, trip_id, invited_email, role, accepted_at")
    .eq("invite_token", token)
    .single<{
      id: string;
      trip_id: string;
      invited_email: string;
      role: string;
      accepted_at: string | null;
    }>();

  if (!data) return NextResponse.json({ error: "Invalid invite" }, { status: 404 });
  return NextResponse.json(data);
}

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: invite } = await supabase
    .from("trip_collaborators")
    .select("id, trip_id, accepted_at")
    .eq("invite_token", token)
    .single<{ id: string; trip_id: string; accepted_at: string | null }>();

  if (!invite) return NextResponse.json({ error: "Invalid invite" }, { status: 404 });
  if (invite.accepted_at) return NextResponse.json({ tripId: invite.trip_id });

  const { error } = await supabase
    .from("trip_collaborators")
    .update({ user_id: user.id, accepted_at: new Date().toISOString() })
    .eq("id", invite.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ tripId: invite.trip_id });
}
