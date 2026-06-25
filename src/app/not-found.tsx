import Link from "next/link";

export default function NotFound() {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "var(--bg-base, #06080F)",
        color: "white",
        textAlign: "center",
        padding: "0 24px",
        gap: 0,
      }}
    >
      <p
        style={{
          fontSize: 120,
          fontWeight: 900,
          lineHeight: 1,
          background: "linear-gradient(135deg, #38BDF8 0%, #7DD3FC 100%)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          marginBottom: 8,
        }}
      >
        404
      </p>

      <h1
        style={{
          fontFamily: "var(--font-playfair, Georgia, serif)",
          fontSize: "clamp(22px, 4vw, 36px)",
          fontWeight: 700,
          marginBottom: 12,
          color: "white",
        }}
      >
        Lost in transit
      </h1>

      <p style={{ color: "rgba(255,255,255,0.45)", fontSize: 16, marginBottom: 36, maxWidth: 360 }}>
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
      </p>

      <Link
        href="/"
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 8,
          padding: "12px 28px",
          borderRadius: 999,
          background: "white",
          color: "#06080F",
          fontWeight: 600,
          fontSize: 14,
          textDecoration: "none",
          transition: "opacity 0.2s",
        }}
      >
        Back to home
      </Link>
    </div>
  );
}
