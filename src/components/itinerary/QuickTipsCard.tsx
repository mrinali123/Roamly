"use client";

import { Zap } from "lucide-react";

interface QuickTipsCardProps {
  tips: string[];
}

export default function QuickTipsCard({ tips }: QuickTipsCardProps) {
  if (!tips?.length) return null;

  return (
    <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 20, padding: 24 }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", gap: 10, marginBottom: 18 }}>
        <Zap size={17} color="#38BDF8" style={{ flexShrink: 0, marginTop: 1 }} />
        <div>
          <p style={{ fontSize: 14, fontWeight: 600, color: "white", lineHeight: 1 }}>Quick Tips</p>
          <p style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", marginTop: 4 }}>For today&apos;s itinerary</p>
        </div>
      </div>

      {/* Tips list */}
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {tips.slice(0, 4).map((tip, i) => (
          <div
            key={i}
            className="animate-step-enter"
            style={{ display: "flex", gap: 12, alignItems: "flex-start", animationDelay: `${i * 60}ms` }}
          >
            <div style={{
              width: 24, height: 24, borderRadius: "50%", flexShrink: 0,
              background: "rgba(56,189,248,0.10)", border: "1px solid rgba(56,189,248,0.22)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 11, fontWeight: 700, color: "#38BDF8",
            }}>
              {i + 1}
            </div>
            <p style={{ fontSize: 13, color: "rgba(255,255,255,0.68)", lineHeight: 1.55, paddingTop: 3 }}>{tip}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
