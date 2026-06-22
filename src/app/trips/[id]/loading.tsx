export default function TripLoading() {
  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-base, #06080F)", paddingTop: 64 }}>
      {/* Hero skeleton */}
      <div
        className="animate-pulse"
        style={{ height: 420, background: "rgba(255,255,255,0.05)", marginBottom: 0 }}
      />

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "32px 24px" }}>
        {/* Title + meta */}
        <div style={{ marginBottom: 32 }}>
          <div className="animate-pulse" style={{ height: 36, width: "55%", background: "rgba(255,255,255,0.07)", borderRadius: 8, marginBottom: 12 }} />
          <div className="animate-pulse" style={{ height: 18, width: "35%", background: "rgba(255,255,255,0.05)", borderRadius: 6 }} />
        </div>

        {/* Day nav */}
        <div style={{ display: "flex", gap: 10, marginBottom: 36, overflowX: "auto" }}>
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="animate-pulse"
              style={{ height: 38, width: 90, flexShrink: 0, background: "rgba(255,255,255,0.06)", borderRadius: 999 }}
            />
          ))}
        </div>

        {/* Two-column content */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 24 }}>
          {/* Left: place cards */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="animate-pulse"
                style={{ height: 140, background: "rgba(255,255,255,0.05)", borderRadius: 16 }}
              />
            ))}
          </div>

          {/* Right: sidebar */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div className="animate-pulse" style={{ height: 180, background: "rgba(255,255,255,0.05)", borderRadius: 16 }} />
            <div className="animate-pulse" style={{ height: 160, background: "rgba(255,255,255,0.05)", borderRadius: 16 }} />
          </div>
        </div>
      </div>
    </div>
  );
}
