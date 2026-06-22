import { redirect, notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getTripWithDays } from "@/lib/db/trips";
import TripView from "@/components/trips/TripView";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function TripPage({ params }: PageProps) {
  const { id } = await params;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/auth/signin");

  const trip = await getTripWithDays(id, user.id);

  if (!trip) notFound();

  const isOwner = trip.user_id === user.id;

  return <TripView trip={trip} userEmail={user.email} isOwner={isOwner} />;
}
