import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { withLogger, getLog } from "@/lib/with-logger";

export const DELETE = withLogger("account.delete", async () => {
  const log = getLog();
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    log.warn({ event: "auth.unauthorized" }, "unauthorized account delete request");
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Calls a SECURITY DEFINER function in Supabase that deletes the caller's
  // auth.users row. Because all tables reference auth.users ON DELETE CASCADE,
  // this removes profiles, trips, expenses, collaborators, and chat history too.
  const { error } = await supabase.rpc("delete_own_account");

  if (error) {
    log.error({ err: error, userId: user.id, event: "account.delete_failed" }, "account deletion failed");
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  log.info({ userId: user.id, event: "account.deleted" }, "account deleted");
  return NextResponse.json({ ok: true });
});
