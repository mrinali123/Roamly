import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function DELETE() {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Calls a SECURITY DEFINER function in Supabase that deletes the caller's
  // auth.users row. Because all tables reference auth.users ON DELETE CASCADE,
  // this removes profiles, trips, expenses, collaborators, and chat history too.
  const { error } = await supabase.rpc("delete_own_account");

  if (error) {
    console.error("[delete-account]", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
