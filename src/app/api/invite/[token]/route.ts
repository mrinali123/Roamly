import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { withLogger, getLog } from "@/lib/with-logger";

export const GET = withLogger(
  "invite.validate",
  async (_req: NextRequest, { params }: { params: Promise<{ token: string }> }) => {
    const log = getLog();
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

    if (!data) {
      log.warn({ event: "invite.invalid" }, "invalid invite token");
      return NextResponse.json({ error: "Invalid invite" }, { status: 404 });
    }
    return NextResponse.json(data);
  }
);

export const POST = withLogger(
  "invite.accept",
  async (_req: NextRequest, { params }: { params: Promise<{ token: string }> }) => {
    const log = getLog();
    const { token } = await params;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      log.warn({ event: "auth.unauthorized" }, "unauthorized invite accept request");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: invite } = await supabase
      .from("trip_collaborators")
      .select("id, trip_id, accepted_at")
      .eq("invite_token", token)
      .single<{ id: string; trip_id: string; accepted_at: string | null }>();

    if (!invite) {
      log.warn({ event: "invite.invalid" }, "invalid invite token on accept");
      return NextResponse.json({ error: "Invalid invite" }, { status: 404 });
    }

    if (invite.accepted_at) {
      log.info({ userId: user.id, tripId: invite.trip_id, event: "invite.already_accepted" }, "invite already accepted");
      return NextResponse.json({ tripId: invite.trip_id });
    }

    const { error } = await supabase
      .from("trip_collaborators")
      .update({ user_id: user.id, accepted_at: new Date().toISOString() })
      .eq("id", invite.id);

    if (error) {
      log.error({ err: error, tripId: invite.trip_id, event: "db.error" }, "failed to accept invite");
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    log.info({ userId: user.id, tripId: invite.trip_id, event: "invite.accepted" }, "invite accepted");
    return NextResponse.json({ tripId: invite.trip_id });
  }
);
