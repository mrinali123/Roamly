import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { updateShareSettings, getTripWithDays } from "@/lib/db/trips";
import { generateShareToken } from "@/lib/share";
import { withLogger, getLog } from "@/lib/with-logger";

export const POST = withLogger(
  "trips.share",
  async (request: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
    const log = getLog();
    const { id } = await params;

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      log.warn({ event: "auth.unauthorized" }, "unauthorized share request");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
      const { enable } = await request.json();

      if (enable) {
        const trip = await getTripWithDays(id, user.id);
        if (!trip) return NextResponse.json({ error: "Not found" }, { status: 404 });

        const token = trip.share_token ?? generateShareToken();
        await updateShareSettings(id, user.id, true, token);
        log.info({ userId: user.id, tripId: id, event: "share.enabled" }, "trip sharing enabled");
        return NextResponse.json({ shareToken: token });
      } else {
        await updateShareSettings(id, user.id, false, null);
        log.info({ userId: user.id, tripId: id, event: "share.disabled" }, "trip sharing disabled");
        return NextResponse.json({ ok: true });
      }
    } catch (error) {
      log.error({ err: error, tripId: id, event: "request.error" }, "share toggle failed");
      return NextResponse.json(
        { error: error instanceof Error ? error.message : "Failed" },
        { status: 500 }
      );
    }
  }
);
