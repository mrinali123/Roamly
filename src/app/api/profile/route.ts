import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { withLogger, getLog } from "@/lib/with-logger";

export const GET = withLogger("profile.get", async () => {
  const log = getLog();
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    log.warn({ event: "auth.unauthorized" }, "unauthorized profile get request");
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  return NextResponse.json({ profile: data });
});

export const PATCH = withLogger("profile.update", async (request: NextRequest) => {
  const log = getLog();
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    log.warn({ event: "auth.unauthorized" }, "unauthorized profile update request");
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const allowed = [
    "full_name", "home_city", "default_budget",
    "default_interests", "default_dietary", "preferred_currency",
  ];
  const patch: Record<string, unknown> = {};
  for (const key of allowed) {
    if (key in body) patch[key] = body[key];
  }

  const { data, error } = await supabase
    .from("profiles")
    .upsert({ id: user.id, ...patch }, { onConflict: "id" })
    .select()
    .single();

  if (error) {
    log.error({ err: error, userId: user.id, event: "db.error" }, "profile update failed");
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  log.info({ userId: user.id, updatedFields: Object.keys(patch), event: "profile.updated" }, "profile updated");
  return NextResponse.json({ profile: data });
});
