import { notFound } from "next/navigation";
import Navbar from "@/components/Navbar";
import TripView from "@/components/trips/TripView";
import { getTripByShareToken } from "@/lib/db/trips";

interface PageProps {
  params: Promise<{ token: string }>;
}

export default async function SharePage({ params }: PageProps) {
  const { token } = await params;
  const trip = await getTripByShareToken(token);

  if (!trip) notFound();

  return (
    <div className="min-h-screen bg-navy text-white">
      <Navbar user={null} />
      <TripView trip={trip} readOnly />
    </div>
  );
}
