import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { updateShareSettings, getTripWithDays } from "@/lib/db/trips";
import { generateShareToken } from "@/lib/share";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { enable } = await request.json();

    if (enable) {
      // Fetch current trip to see if it already has a token
      const trip = await getTripWithDays(id, user.id);
      if (!trip) return NextResponse.json({ error: "Not found" }, { status: 404 });

      const token = trip.share_token ?? generateShareToken();
      await updateShareSettings(id, user.id, true, token);
      return NextResponse.json({ shareToken: token });
    } else {
      await updateShareSettings(id, user.id, false, null);
      return NextResponse.json({ ok: true });
    }
  } catch (error) {
    console.error("[share]", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed" },
      { status: 500 }
    );
  }
}
