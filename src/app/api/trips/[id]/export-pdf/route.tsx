export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import { createClient } from "@/lib/supabase/server";
import { getTripWithDays } from "@/lib/db/trips";
import { ItineraryPDF } from "@/lib/pdf/itinerary-pdf";
import type { TripWithDays } from "@/types/trip";

// 1-hour in-memory cache
const cache = new Map<string, { buf: Buffer; expires: number }>();

export async function GET(
  _request: NextRequest,
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
    // Check cache
    const cached = cache.get(id);
    if (cached && Date.now() < cached.expires) {
      return pdfResponse(cached.buf, id);
    }

    const trip = await getTripWithDays(id, user.id);
    if (!trip) {
      return NextResponse.json({ error: "Trip not found" }, { status: 404 });
    }

    const pdfEl = <ItineraryPDF trip={trip as TripWithDays} />;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const buf = await renderToBuffer(pdfEl as any);

    cache.set(id, { buf, expires: Date.now() + 3_600_000 });

    return pdfResponse(buf, id, trip);
  } catch (error) {
    console.error("[export-pdf]", error);
    return NextResponse.json(
      { error: "Failed to generate PDF" },
      { status: 500 }
    );
  }
}

function pdfResponse(buf: Buffer, tripId: string, trip?: TripWithDays) {
  const dest = trip
    ? trip.destination.toLowerCase().replace(/\s+/g, "-")
    : tripId;
  const date = trip ? trip.arrival_date : "";
  const filename = `roamly-${dest}-${date}.pdf`.replace(/[^a-z0-9.\-]/gi, "-");

  return new NextResponse(new Uint8Array(buf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "private, max-age=3600",
    },
  });
}
