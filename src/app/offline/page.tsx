"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import type { CachedTripMeta } from "@/lib/offline-cache";
import { getCachedTripsMeta } from "@/lib/offline-cache";

function formatDateRange(arrival: string, departure: string): string {
  const opts: Intl.DateTimeFormatOptions = { month: "short", day: "numeric" };
  const fmt = (s: string) => {
    const [y, m, d] = s.split("-").map(Number);
    return new Date(y, m - 1, d).toLocaleDateString("en-US", opts);
  };
  return `${fmt(arrival)} – ${fmt(departure)}`;
}

export default function OfflinePage() {
  const [trips, setTrips] = useState<CachedTripMeta[]>([]);

  useEffect(() => {
    setTrips(getCachedTripsMeta());
  }, []);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-navy px-4 py-12 text-center text-white">

      {/* Status indicator */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 28, background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.3)", borderRadius: 999, padding: "6px 16px" }}>
        <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#f59e0b", boxShadow: "0 0 8px #f59e0b" }} />
        <span style={{ fontSize: 13, color: "#f59e0b", fontWeight: 600 }}>No internet connection</span>
      </div>

      <h1 className="mb-3 text-2xl font-bold" style={{ letterSpacing: "-0.03em" }}>You&apos;re offline</h1>
      <p className="mb-8 max-w-sm text-slate-400 text-sm" style={{ lineHeight: 1.65 }}>
        Your previously viewed itineraries are still accessible below. Connect to the internet to use AI chat, maps, and PDF export.
      </p>

      {/* Cached trips */}
      {trips.length > 0 ? (
        <div className="w-full max-w-sm mb-8">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-3 text-left">
            Cached itineraries
          </p>
          <div className="space-y-2">
            {trips.map((t) => (
              <Link
                key={t.id}
                href={`/trips/${t.id}`}
                className="flex items-center justify-between rounded-xl border border-slate-700/60 bg-[#0B1523] px-4 py-3 text-left hover:border-sky/40 transition"
              >
                <div>
                  <p className="text-sm font-semibold text-white truncate max-w-[200px]">{t.title}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{t.destination}</p>
                  <p className="text-xs text-slate-600 mt-0.5">{formatDateRange(t.arrival_date, t.departure_date)}</p>
                </div>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(56,189,248,0.6)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 18l6-6-6-6"/>
                </svg>
              </Link>
            ))}
          </div>
        </div>
      ) : (
        <div className="w-full max-w-sm mb-8 rounded-xl border border-slate-700/40 bg-[#0B1523] px-6 py-5 text-sm text-slate-500">
          No cached itineraries yet. Visit your trips while online and they will be available here offline.
        </div>
      )}

      {/* What works offline */}
      <div className="w-full max-w-sm rounded-xl border border-slate-700/40 bg-[#0B1523] px-5 py-4 text-sm text-left mb-6">
        <p className="font-medium text-white mb-2">Available offline</p>
        <ul className="space-y-1 text-slate-400">
          <li className="flex items-center gap-2"><span className="text-emerald-400">✓</span> Read saved itineraries</li>
          <li className="flex items-center gap-2"><span className="text-emerald-400">✓</span> View daily timeline &amp; places</li>
          <li className="flex items-center gap-2"><span className="text-emerald-400">✓</span> Check trip notes &amp; tips</li>
        </ul>
        <p className="font-medium text-white mt-3 mb-2">Requires internet</p>
        <ul className="space-y-1 text-slate-600">
          <li>AI chat assistant</li>
          <li>Live map</li>
          <li>PDF download</li>
          <li>Weather forecast</li>
        </ul>
      </div>

      <button
        onClick={() => window.location.reload()}
        className="rounded-xl bg-sky px-6 py-2.5 text-sm font-semibold text-navy transition hover:bg-sky-hover"
      >
        Try reconnecting
      </button>
    </div>
  );
}
