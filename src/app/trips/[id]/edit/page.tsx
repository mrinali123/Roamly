import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Trip } from "@/types/trip";
import EditSetup from "./EditSetup";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditTripPage({ params }: PageProps) {
  const { id } = await params;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/signin");

  const { data: trip } = await supabase
    .from("trips")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .single<Trip>();

  if (!trip) redirect("/trips");

  return <EditSetup trip={trip} />;
}
