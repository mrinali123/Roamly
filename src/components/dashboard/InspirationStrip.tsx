"use client";

import { useRef } from "react";
import Link from "next/link";
import Image from "next/image";

const DESTINATIONS = [
  { city: "Goa",       img: "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=240&q=80" },
  { city: "Manali",    img: "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=240&q=80" },
  { city: "Jaipur",    img: "https://images.unsplash.com/photo-1477587458883-47145ed94245?w=240&q=80" },
  { city: "Kerala",    img: "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=240&q=80" },
  { city: "Ladakh",    img: "https://images.unsplash.com/photo-1589308078059-be1415eab4c3?w=240&q=80" },
  { city: "Varanasi",  img: "https://images.unsplash.com/photo-1561361513-2d000a50f0dc?w=240&q=80" },
  { city: "Andaman",   img: "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=240&q=80" },
  { city: "Rishikesh", img: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=240&q=80" },
];

const SCROLL_AMOUNT = 300;

const arrowBtnStyle: React.CSSProperties = {
  position: "absolute", top: "50%", transform: "translateY(-50%)",
  zIndex: 10, width: 36, height: 36, borderRadius: "50%",
  display: "flex", alignItems: "center", justifyContent: "center",
  background: "rgba(10,15,30,0.85)", border: "1px solid rgba(56,189,248,0.35)",
  color: "#38BDF8", fontSize: 16, cursor: "pointer",
  backdropFilter: "blur(12px)", boxShadow: "0 4px 16px rgba(0,0,0,0.4)",
  transition: "all 0.2s",
};

export default function InspirationStrip() {
  const ref = useRef<HTMLDivElement>(null);

  const scroll = (dir: "left" | "right") => {
    ref.current?.scrollBy({ left: dir === "right" ? SCROLL_AMOUNT : -SCROLL_AMOUNT, behavior: "smooth" });
  };

  return (
    <div style={{ padding: "0 0 8px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
      <div className="mx-auto max-w-5xl px-4 pt-6 pb-2">
        <p style={{ fontSize: 11, fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.12em", color: "rgba(255,255,255,0.35)", marginBottom: 12 }}>
          Inspire your next trip
        </p>

        {/* Scroll container with arrow buttons */}
        <div style={{ position: "relative" }}>
          {/* Left arrow */}
          <button
            onClick={() => scroll("left")}
            aria-label="Scroll left"
            style={{ ...arrowBtnStyle, left: -18 }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(56,189,248,0.18)"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(10,15,30,0.85)"; }}
          >
            ‹
          </button>

          {/* Scrollable strip */}
          <div
            ref={ref}
            className="flex gap-3 pb-2"
            style={{ overflowX: "auto", scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            {DESTINATIONS.map((d) => (
              <Link
                key={d.city}
                href={`/trips/new?destination=${encodeURIComponent(d.city + ", India")}`}
                className="group shrink-0 relative overflow-hidden"
                style={{ width: 130, height: 88, borderRadius: 14, display: "block", textDecoration: "none", flexShrink: 0 }}
              >
                <Image
                  src={d.img} alt={d.city} fill
                  className="object-cover transition-transform duration-500 group-hover:scale-110"
                  sizes="130px"
                />
                <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,0.82) 0%, rgba(0,0,0,0.1) 60%)" }} />
                {/* Hover ring */}
                <div
                  className="opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                  style={{ position: "absolute", inset: 0, border: "2px solid rgba(56,189,248,0.55)", borderRadius: 14 }}
                />
                <span style={{ position: "absolute", bottom: 8, left: 10, fontSize: 12, fontWeight: 700, color: "white", letterSpacing: "0.01em" }}>
                  {d.city}
                </span>
              </Link>
            ))}
          </div>

          {/* Right arrow */}
          <button
            onClick={() => scroll("right")}
            aria-label="Scroll right"
            style={{ ...arrowBtnStyle, right: -18 }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(56,189,248,0.18)"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(10,15,30,0.85)"; }}
          >
            ›
          </button>
        </div>
      </div>
    </div>
  );
}
