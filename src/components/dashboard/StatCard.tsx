interface StatCardProps {
  value: number | string;
  label: string;
  subtitle: string;
  accent: string;
  accentSecondary?: string;
  type: "trips" | "countries" | "days" | "favourite";
  delay?: number;
}

/* ── Decorative SVG watermarks ──────────────────────────────────────────── */
function TripDecoration({ color }: { color: string }) {
  return (
    <svg width="96" height="72" viewBox="0 0 96 72" fill="none" aria-hidden="true">
      {/* Dashed flight arc */}
      <path
        d="M 8 64 C 30 20 66 12 88 32"
        stroke={color} strokeWidth="1.5" strokeDasharray="5 4"
        strokeLinecap="round" opacity="0.5"
      />
      {/* Origin dot */}
      <circle cx="8" cy="64" r="4" fill={color} opacity="0.45" />
      {/* Destination dot with ring */}
      <circle cx="88" cy="32" r="6" stroke={color} strokeWidth="1.5" opacity="0.25" />
      <circle cx="88" cy="32" r="3" fill={color} opacity="0.5" />
      {/* Plane icon */}
      <g transform="translate(56,26) rotate(-30)" opacity="0.6">
        <path d="M0 4 L8 0 L6 4 L8 8 Z" fill={color} />
        <path d="M2 4 L-2 6 L-1 4 L-2 2 Z" fill={color} opacity="0.6" />
      </g>
    </svg>
  );
}

function CountriesDecoration({ color }: { color: string }) {
  // Abstract globe meridians
  const dots = [
    [18,18],[38,12],[62,16],[80,22],
    [10,36],[28,30],[50,28],[72,32],[90,26],
    [22,50],[44,46],[66,44],[84,50],
    [16,62],[36,60],[58,58],[78,56],
  ];
  return (
    <svg width="96" height="72" viewBox="0 0 96 72" fill="none" aria-hidden="true">
      {/* Globe circle */}
      <ellipse cx="48" cy="36" rx="34" ry="30" stroke={color} strokeWidth="1" opacity="0.12" />
      {/* Meridian */}
      <ellipse cx="48" cy="36" rx="16" ry="30" stroke={color} strokeWidth="1" opacity="0.1" />
      {/* Equator */}
      <line x1="14" y1="36" x2="82" y2="36" stroke={color} strokeWidth="1" opacity="0.1" />
      {/* Location dots */}
      {dots.map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r="2" fill={color} opacity={0.2 + (i % 3) * 0.12} />
      ))}
      {/* Highlighted pin */}
      <circle cx="62" cy="24" r="5" fill={color} opacity="0.5" />
      <circle cx="62" cy="24" r="8" stroke={color} strokeWidth="1" opacity="0.2" />
    </svg>
  );
}

function DaysDecoration({ color }: { color: string }) {
  return (
    <svg width="96" height="72" viewBox="0 0 96 72" fill="none" aria-hidden="true">
      {/* Calendar grid */}
      <rect x="16" y="12" width="64" height="50" rx="6" stroke={color} strokeWidth="1" opacity="0.15" />
      {/* Header bar */}
      <rect x="16" y="12" width="64" height="14" rx="6" fill={color} opacity="0.1" />
      {/* Days dots in 5x4 grid */}
      {[0,1,2,3,4].map(col =>
        [0,1,2,3].map(row => {
          const filled = col * 4 + row < 11;
          return (
            <circle
              key={`${col}-${row}`}
              cx={28 + col * 11}
              cy={36 + row * 9}
              r="3"
              fill={color}
              opacity={filled ? 0.5 : 0.12}
            />
          );
        })
      )}
      {/* Highlight ring on "today" */}
      <circle cx="72" cy="36" r="6" stroke={color} strokeWidth="1.5" opacity="0.4" />
    </svg>
  );
}

function FavouriteDecoration({ color }: { color: string }) {
  return (
    <svg width="96" height="72" viewBox="0 0 96 72" fill="none" aria-hidden="true">
      {/* Radiating lines */}
      {[0, 45, 90, 135, 180, 225, 270, 315].map((deg, i) => {
        const rad = (deg * Math.PI) / 180;
        const x1 = 48 + Math.cos(rad) * 18;
        const y1 = 36 + Math.sin(rad) * 18;
        const x2 = 48 + Math.cos(rad) * 30;
        const y2 = 36 + Math.sin(rad) * 30;
        return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke={color} strokeWidth="1.5" opacity="0.25" strokeLinecap="round" />;
      })}
      {/* Star polygon */}
      <path
        d="M48 14 L52.5 28 L67 28 L55.5 37 L60 51 L48 43 L36 51 L40.5 37 L29 28 L43.5 28 Z"
        fill={color} opacity="0.35"
      />
      {/* Inner star glow */}
      <path
        d="M48 22 L50.5 30 L59 30 L52.5 35 L55 43 L48 38.5 L41 43 L43.5 35 L37 30 L45.5 30 Z"
        fill={color} opacity="0.25"
      />
      {/* Small sparkle dots */}
      <circle cx="20" cy="18" r="2" fill={color} opacity="0.3" />
      <circle cx="76" cy="14" r="2.5" fill={color} opacity="0.25" />
      <circle cx="82" cy="56" r="1.5" fill={color} opacity="0.3" />
      <circle cx="14" cy="52" r="2" fill={color} opacity="0.2" />
    </svg>
  );
}

const DECORATIONS = {
  trips:     TripDecoration,
  countries: CountriesDecoration,
  days:      DaysDecoration,
  favourite: FavouriteDecoration,
};

export default function StatCard({
  value, label, subtitle, accent, accentSecondary, type, delay = 0,
}: StatCardProps) {
  const secondary = accentSecondary ?? accent;
  const Decoration = DECORATIONS[type];

  return (
    <div
      className="stat-card animate-fade-up relative overflow-hidden flex flex-col justify-between min-w-[160px] shrink-0"
      style={{
        background: `linear-gradient(135deg, rgba(${hexToRgb(accent)}, 0.06) 0%, rgba(255,255,255,0.03) 100%)`,
        border: `1px solid rgba(${hexToRgb(accent)}, 0.18)`,
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        borderRadius: 20,
        padding: "22px 22px 0",
        animationDelay: `${delay}ms`,
        minHeight: 160,
      }}
    >
      {/* SVG decoration — top-right watermark */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute", top: 0, right: 0,
          opacity: 0.9, pointerEvents: "none",
        }}
      >
        <Decoration color={accent} />
      </div>

      {/* Content */}
      <div style={{ position: "relative", zIndex: 1 }}>
        {/* Value */}
        <div
          style={{
            fontSize: typeof value === "string" && value.length > 5 ? 22 : 36,
            fontWeight: 800,
            lineHeight: 1.1,
            letterSpacing: "-0.02em",
            background: `linear-gradient(135deg, ${accent}, ${secondary})`,
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
            marginBottom: 6,
          }}
        >
          {value}
        </div>

        {/* Label */}
        <div style={{ fontSize: 13, fontWeight: 700, color: "rgba(255,255,255,0.85)", marginBottom: 3, letterSpacing: "0.01em" }}>
          {label}
        </div>

        {/* Subtitle */}
        <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", letterSpacing: "0.03em" }}>
          {subtitle}
        </div>
      </div>

      {/* Bottom gradient accent bar */}
      <div
        aria-hidden="true"
        style={{
          height: 3, borderRadius: "0 0 20px 20px",
          background: `linear-gradient(90deg, ${accent}55 0%, ${secondary}99 50%, ${accent}22 100%)`,
          marginLeft: -22, marginRight: -22, marginTop: 18,
        }}
      />
    </div>
  );
}

/* ── Utility: hex → "r g b" for rgba() ───────────────────────────────────── */
function hexToRgb(hex: string): string {
  const clean = hex.replace("#", "");
  const r = parseInt(clean.substring(0, 2), 16);
  const g = parseInt(clean.substring(2, 4), 16);
  const b = parseInt(clean.substring(4, 6), 16);
  return `${r}, ${g}, ${b}`;
}
