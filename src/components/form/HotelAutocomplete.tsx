"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Building2, X } from "lucide-react";
import { usePlacesAutocomplete, type PlaceSuggestion } from "@/hooks/usePlacesAutocomplete";

export interface SelectedHotel {
  name: string;
  address: string;
  placeId: string;
  lat: number;
  lng: number;
  rating?: number;
}

interface HotelAutocompleteProps {
  value: string;
  onTextChange: (text: string) => void;
  onSelect: (hotel: SelectedHotel) => void;
  onClear: () => void;
  isConfirmed: boolean;
  destinationLat?: number;
  destinationLng?: number;
  error?: string;
  placeholder?: string;
}

export default function HotelAutocomplete({
  value,
  onTextChange,
  onSelect,
  onClear,
  isConfirmed,
  destinationLat,
  destinationLng,
  error,
  placeholder = "Search hotels in your destination…",
}: HotelAutocompleteProps) {
  const [open, setOpen] = useState(false);
  const [highlighted, setHighlighted] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);

  const location =
    destinationLat && destinationLng
      ? { lat: destinationLat, lng: destinationLng }
      : undefined;

  const { suggestions, loading, fetchSuggestions, clearSuggestions } =
    usePlacesAutocomplete({ types: ["lodging"], location });

  useEffect(() => {
    function onDown(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, []);

  useEffect(() => {
    if (suggestions.length > 0) { setOpen(true); setHighlighted(-1); }
    else setOpen(false);
  }, [suggestions]);

  const handleSelect = useCallback(
    (s: PlaceSuggestion) => {
      setOpen(false);
      clearSuggestions();
      onSelect({
        name: s.mainText,
        address: s.formattedAddress || s.secondaryText,
        placeId: s.placeId,
        lat: s.lat,
        lng: s.lng,
        rating: s.rating,
      });
    },
    [clearSuggestions, onSelect]
  );

  function handleKeyDown(e: React.KeyboardEvent) {
    if (!open) return;
    if (e.key === "ArrowDown") { e.preventDefault(); setHighlighted((h) => Math.min(h + 1, suggestions.length - 1)); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setHighlighted((h) => Math.max(h - 1, 0)); }
    else if (e.key === "Enter" && highlighted >= 0) { e.preventDefault(); handleSelect(suggestions[highlighted]); }
    else if (e.key === "Escape") setOpen(false);
  }

  // ── Confirmed chip ──────────────────────────────────────────────────────────
  if (isConfirmed) {
    return (
      <div style={{ display: "inline-flex", alignItems: "center", gap: 8, borderRadius: 10, padding: "10px 14px", background: "rgba(56,189,248,0.10)", border: "1px solid rgba(56,189,248,0.30)" }}>
        <Building2 size={14} color="#38BDF8" />
        <span style={{ fontSize: 14, fontWeight: 500, color: "#38BDF8", maxWidth: 260, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{value}</span>
        <button
          type="button"
          onClick={onClear}
          aria-label="Clear hotel"
          style={{ marginLeft: 4, background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", color: "rgba(56,189,248,0.45)", padding: 0, transition: "color 0.15s" }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.color = "#F87171"; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.color = "rgba(56,189,248,0.45)"; }}
        >
          <X size={13} />
        </button>
      </div>
    );
  }

  // ── Input + dropdown ────────────────────────────────────────────────────────
  return (
    <div ref={containerRef} className="nf-field" style={{ position: "relative" }}>
      <span className="nf-field-icon">
        <Building2 size={16} />
      </span>
      <input
        type="text"
        value={value}
        onChange={(e) => { onTextChange(e.target.value); fetchSuggestions(e.target.value); }}
        onFocus={() => { if (suggestions.length > 0) setOpen(true); }}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className={`nf-input${error ? " nf-input-error" : ""}`}
        autoComplete="off"
      />
      {loading && (
        <div style={{ position: "absolute", right: 16, top: "50%", transform: "translateY(-50%)" }}>
          <div style={{ width: 16, height: 16, borderRadius: "50%", border: "2px solid rgba(255,255,255,0.12)", borderTopColor: "#38BDF8", animation: "spin 0.7s linear infinite" }} />
        </div>
      )}

      {open && suggestions.length > 0 && (
        <div
          style={{
            position: "absolute", left: 0, right: 0, top: "calc(100% + 6px)", zIndex: 50,
            background: "#0D1426", border: "1px solid rgba(56,189,248,0.2)",
            borderRadius: 14, boxShadow: "0 16px 48px rgba(0,0,0,0.6)",
            maxHeight: 280, overflowY: "auto",
          }}
        >
          {suggestions.map((s, i) => (
            <button
              key={s.placeId}
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => handleSelect(s)}
              onMouseEnter={() => setHighlighted(i)}
              style={{
                display: "flex", width: "100%", alignItems: "center", gap: 12,
                padding: "13px 18px", background: highlighted === i ? "rgba(56,189,248,0.08)" : "transparent",
                borderLeft: highlighted === i ? "3px solid #38BDF8" : "3px solid transparent",
                cursor: "pointer", border: "none", textAlign: "left", transition: "background 0.12s",
                borderBottom: i < suggestions.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none",
              }}
            >
              <Building2 size={15} color={highlighted === i ? "#38BDF8" : "rgba(56,189,248,0.5)"} style={{ flexShrink: 0 }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: 14, fontWeight: 500, color: "white", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{s.mainText}</p>
                <p style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", marginTop: 2 }}>{s.secondaryText}</p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
