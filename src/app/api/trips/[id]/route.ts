import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { withLogger, getLog } from "@/lib/with-logger";

export const DELETE = withLogger(
  "trips.delete",
  async (_request: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
    const log = getLog();
    const { id } = await params;

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      log.warn({ event: "auth.unauthorized" }, "unauthorized trip delete request");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { error } = await supabase
      .from("trips")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id); // RLS: only delete own trips

    if (error) {
      log.error({ err: error, tripId: id, event: "trip.delete_error" }, "failed to delete trip");
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    log.info({ userId: user.id, tripId: id, event: "trip.deleted" }, "trip deleted");
    return NextResponse.json({ success: true });
  }
);
