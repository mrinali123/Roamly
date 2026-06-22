"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { MapPin, Plus, ChevronLeft, ChevronRight } from "lucide-react";

export const DESTINATION_IMAGES = [
  { url: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=1600&q=80", city: "Paris",     country: "France" },
  { url: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=1600&q=80", city: "Tokyo",     country: "Japan" },
  { url: "https://images.unsplash.com/photo-1555992336-03a23c7b20ee?w=1600&q=80", city: "Santorini", country: "Greece" },
  { url: "https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=1600&q=80", city: "Agra",      country: "India" },
  { url: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=1600&q=80", city: "Bali",      country: "Indonesia" },
  { url: "https://images.unsplash.com/photo-1485738422979-f5c462d49f74?w=1600&q=80", city: "New York",  country: "USA" },
  { url: "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=1600&q=80", city: "London",    country: "UK" },
  { url: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=1600&q=80", city: "Dubai",     country: "UAE" },
  { url: "https://images.unsplash.com/photo-1523482580672-f109ba8cb9be?w=1600&q=80", city: "Sydney",    country: "Australia" },
  { url: "https://images.unsplash.com/photo-1560969184-10fe8719e047?w=1600&q=80", city: "Barcelona", country: "Spain" },
];


interface HeroCarouselProps {
  userName: string;
}

export default function HeroCarousel({ userName }: HeroCarouselProps) {
  const [current, setCurrent] = useState(0);
  const [paused,  setPaused]  = useState(false);

  const next = useCallback(() => setCurrent((c) => (c + 1) % DESTINATION_IMAGES.length), []);
  const prev = useCallback(() => setCurrent((c) => (c - 1 + DESTINATION_IMAGES.length) % DESTINATION_IMAGES.length), []);

  useEffect(() => {
    if (paused) return;
    const id = setInterval(next, 5000);
    return () => clearInterval(id);
  }, [paused, next]);

  const slide = DESTINATION_IMAGES[current];
  const firstName = userName.split(" ")[0];

  return (
    <div
      className="group relative w-full overflow-hidden"
      style={{ height: "clamp(280px, 42vw, 480px)", marginTop: 64 }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Slides */}
      {DESTINATION_IMAGES.map((img, idx) => (
        <div
          key={img.url}
          className="absolute inset-0 transition-opacity duration-1000 ease-in-out"
          style={{ opacity: idx === current ? 1 : 0, zIndex: idx === current ? 2 : 1 }}
        >
          <div key={idx === current ? `kb-${current}` : `s-${idx}`} className={`absolute inset-0 ${idx === current ? "animate-kenburns" : ""}`}>
            <Image src={img.url} alt={`${img.city}, ${img.country}`} fill className="object-cover" priority={idx < 2} sizes="100vw" />
          </div>
        </div>
      ))}

      {/* Overlay stack */}
      <div className="absolute inset-0 z-10 pointer-events-none" style={{ background: "rgba(6,8,15,0.35)" }} />
      <div className="absolute inset-0 z-10 pointer-events-none" style={{ background: "linear-gradient(to bottom, transparent 30%, rgba(6,8,15,0.98) 100%)" }} />
      <div className="absolute inset-0 z-10 pointer-events-none" style={{ background: "linear-gradient(to right, rgba(6,8,15,0.65) 0%, transparent 55%)" }} />

      {/* Hero content — bottom-left */}
      <div className="absolute inset-0 z-20 flex flex-col justify-end" style={{ padding: "0 80px 48px" }}>
        <p style={{ fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.5)", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 8 }}>
          Hello, {firstName}
        </p>
        <h1
          style={{
            fontFamily: "var(--font-playfair, Georgia, serif)",
            fontSize: "clamp(28px, 4vw, 52px)",
            fontWeight: 900,
            color: "white",
            letterSpacing: "-0.03em",
            lineHeight: 1.1,
            marginBottom: 10,
          }}
        >
          Where to next?
        </h1>
        <p style={{ fontSize: 16, color: "rgba(255,255,255,0.45)", marginBottom: 28 }}>
          Your world awaits. Plan your next adventure in minutes.
        </p>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <Link
            href="/trips/new"
            className="white-btn"
            style={{ padding: "14px 28px", fontSize: 14, gap: 8 }}
          >
            <Plus size={16} />
            Plan new trip
          </Link>
          <Link
            href="#trips"
            className="ghost-btn"
            style={{ padding: "14px 24px", fontSize: 14 }}
          >
            View my trips
          </Link>
        </div>
      </div>

      {/* Destination label — bottom left corner */}
      <div className="absolute z-20" style={{ bottom: 50, right: 80 }}>
        <span key={current} className="animate-fade-up inline-flex items-center gap-6">
          {/* Dot indicators */}
          <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
            {DESTINATION_IMAGES.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrent(idx)}
                aria-label={`Slide ${idx + 1}`}
                style={{
                  borderRadius: 999, border: "none", cursor: "pointer", padding: 0,
                  width: idx === current ? 20 : 6,
                  height: 6,
                  background: idx === current ? "white" : "rgba(255,255,255,0.25)",
                  transition: "all 0.3s ease",
                }}
              />
            ))}
          </div>

          {/* Current location pill */}
          <div style={{ display: "inline-flex", alignItems: "center", gap: 6, borderRadius: 999, padding: "6px 12px 6px 8px", background: "rgba(0,0,0,0.35)", backdropFilter: "blur(12px)", border: "1px solid rgba(255,255,255,0.12)" }}>
            <MapPin size={12} color="#38BDF8" />
            <span style={{ fontSize: 12, fontWeight: 500, color: "rgba(255,255,255,0.85)" }}>{slide.city}, {slide.country}</span>
          </div>
        </span>
      </div>

      {/* Prev/Next arrows */}
      {[
        { label: "Previous", action: prev, Icon: ChevronLeft,  pos: { right: "auto", left: 24 } },
        { label: "Next",     action: next, Icon: ChevronRight, pos: { left: "auto",  right: 24 } },
      ].map(({ label, action, Icon, pos }) => (
        <button
          key={label}
          onClick={action}
          aria-label={label}
          className="absolute top-1/2 z-20 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all duration-200"
          style={{
            ...pos,
            width: 44, height: 44, borderRadius: "50%", border: "none", cursor: "pointer",
            background: "rgba(255,255,255,0.08)", backdropFilter: "blur(12px)",
            display: "flex", alignItems: "center", justifyContent: "center",
            color: "rgba(255,255,255,0.6)", transition: "all 0.2s",
          }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.16)"; (e.currentTarget as HTMLButtonElement).style.color = "white"; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.08)"; (e.currentTarget as HTMLButtonElement).style.color = "rgba(255,255,255,0.6)"; }}
        >
          <Icon size={20} />
        </button>
      ))}
    </div>
  );
}
