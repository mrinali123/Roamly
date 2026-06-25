"use client";

import { useState } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import DashboardTripCard from "@/components/dashboard/TripCard";
import type { Trip } from "@/types/trip";

const CompassEmptyState = () => (
  <svg width="80" height="80" viewBox="0 0 80 80" fill="none" aria-hidden="true">
    <circle cx="40" cy="40" r="38" stroke="rgba(255,255,255,0.06)" strokeWidth="1.5" fill="none"/>
    <circle cx="40" cy="40" r="28" stroke="rgba(255,255,255,0.04)" strokeWidth="1" fill="none"/>
    <path d="M40 12L44 36H40H36L40 12Z" fill="#38BDF8"/>
    <path d="M40 68L36 44H40H44L40 68Z" fill="rgba(255,255,255,0.15)"/>
    <path d="M12 40L36 44V40V36L12 40Z" fill="rgba(255,255,255,0.15)"/>
    <path d="M68 40L44 36V40V44L68 40Z" fill="#38BDF8" opacity="0.5"/>
    <circle cx="40" cy="40" r="4" fill="#38BDF8"/>
    <circle cx="40" cy="40" r="8" stroke="#38BDF8" strokeWidth="0.5" fill="none" opacity="0.3"/>
  </svg>
);

interface Props {
  upcoming: Trip[];
  past:     Trip[];
}

export default function DashboardTabs({ upcoming: initialUpcoming, past: initialPast }: Props) {
  const [upcomingTrips, setUpcomingTrips] = useState<Trip[]>(initialUpcoming);
  const [pastTrips,     setPastTrips]     = useState<Trip[]>(initialPast);
  const [tab, setTab] = useState<"upcoming" | "past">("upcoming");

  const displayed = tab === "upcoming" ? upcomingTrips : pastTrips;

  async function handleDelete(id: string) {
    const prevUpcoming = upcomingTrips;
    const prevPast     = pastTrips;

    // Optimistic update — remove immediately
    setUpcomingTrips((prev) => prev.filter((t) => t.id !== id));
    setPastTrips((prev) => prev.filter((t) => t.id !== id));

    try {
      const res = await fetch(`/api/trips/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error((body as { error?: string }).error ?? "Delete failed");
      }
      toast.success("Trip deleted");
    } catch (err) {
      // Rollback on failure
      setUpcomingTrips(prevUpcoming);
      setPastTrips(prevPast);
      toast.error(err instanceof Error ? err.message : "Could not delete trip. Please try again.");
    }
  }

  return (
    <>
      {/* Tab switcher + count */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 28, flexWrap: "wrap", gap: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ display: "inline-flex", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, padding: 4 }}>
            {(["upcoming", "past"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                style={{
                  padding: "8px 20px", borderRadius: 9, border: "none", cursor: "pointer",
                  fontSize: 13, fontWeight: 600, transition: "all 0.2s ease",
                  background: tab === t ? "rgba(255,255,255,0.10)" : "transparent",
                  color: tab === t ? "white" : "rgba(255,255,255,0.4)",
                }}
              >
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </button>
            ))}
          </div>

          <span style={{ fontSize: 12, fontWeight: 600, color: "#38BDF8", background: "rgba(56,189,248,0.10)", border: "1px solid rgba(56,189,248,0.2)", borderRadius: 999, padding: "3px 10px" }}>
            {displayed.length}
          </span>
        </div>

        <Link
          href="/trips/new"
          className="white-btn"
          style={{ padding: "9px 18px", fontSize: 13, gap: 6 }}
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
            <line x1="6" y1="1" x2="6" y2="11" stroke="#06080F" strokeWidth="1.8" strokeLinecap="round"/>
            <line x1="1" y1="6" x2="11" y2="6" stroke="#06080F" strokeWidth="1.8" strokeLinecap="round"/>
          </svg>
          New Trip
        </Link>
      </div>

      {/* Cards or empty state */}
      {displayed.length === 0 ? (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "72px 0", textAlign: "center" }}>
          <CompassEmptyState />

          {tab === "upcoming" ? (
            <>
              <h3 style={{ fontSize: 26, fontWeight: 700, color: "white", marginTop: 24, letterSpacing: "-0.01em", fontFamily: "var(--font-playfair, Georgia, serif)" }}>
                No adventures yet.
              </h3>
              <p style={{ fontSize: 15, color: "rgba(255,255,255,0.4)", marginTop: 8, maxWidth: 340, lineHeight: 1.6 }}>
                Your story starts with a destination. Where will you go first?
              </p>
              <Link href="/trips/new" className="white-btn" style={{ marginTop: 32, padding: "14px 28px", fontSize: 14 }}>
                Plan your first trip
              </Link>
            </>
          ) : (
            <>
              <h3 style={{ fontSize: 26, fontWeight: 700, color: "white", marginTop: 24, letterSpacing: "-0.01em", fontFamily: "var(--font-playfair, Georgia, serif)" }}>
                No past trips yet.
              </h3>
              <p style={{ fontSize: 15, color: "rgba(255,255,255,0.4)", marginTop: 8 }}>
                Your completed adventures will appear here.
              </p>
            </>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {displayed.map((trip, i) => (
            <DashboardTripCard
              key={trip.id}
              trip={trip}
              isPast={tab === "past"}
              showTemplate={tab === "past"}
              index={i}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </>
  );
}
