"use client";

import { UtensilsCrossed, Sun, Moon, ChefHat, MapPin, Info } from "lucide-react";
import type { Meal } from "@/types/trip";

interface MealsCardProps {
  meals: Meal[];
}

function MealEntry({ meal }: { meal: Meal }) {
  const isLunch   = meal.meal_type === "lunch";
  const isDinner  = meal.meal_type === "dinner";
  const accent    = isLunch ? "#F97316" : isDinner ? "#A855F7" : "#38BDF8";
  const accentRgb = isLunch ? "249,115,22" : isDinner ? "168,85,247" : "56,189,248";
  const MealIcon  = isLunch ? Sun : isDinner ? Moon : UtensilsCrossed;
  const label     = `${meal.meal_type.charAt(0).toUpperCase()}${meal.meal_type.slice(1)}${meal.suggested_time ? ` · ${meal.suggested_time}` : ""}`;

  return (
    <div style={{ padding: "20px 24px" }}>
      {/* Meal type badge */}
      <div style={{ display: "inline-flex", alignItems: "center", gap: 6, borderRadius: 999, padding: "5px 12px", background: `rgba(${accentRgb},0.10)`, border: `1px solid rgba(${accentRgb},0.3)` }}>
        <MealIcon size={11} color={accent} />
        <span style={{ fontSize: 11, fontWeight: 700, color: accent, letterSpacing: "0.04em" }}>{label}</span>
      </div>

      {/* Restaurant name */}
      <h4 style={{ fontSize: 16, fontWeight: 700, color: "white", marginTop: 10, letterSpacing: "-0.01em" }}>
        {meal.restaurant_name}
      </h4>

      {/* Cuisine tag */}
      <div style={{ display: "inline-flex", marginTop: 5, borderRadius: 999, padding: "3px 10px", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.10)" }}>
        <span style={{ fontSize: 11, color: "rgba(255,255,255,0.5)" }}>{meal.cuisine}</span>
      </div>

      {/* Specialty */}
      {meal.specialty && (
        <div style={{ display: "flex", alignItems: "flex-start", gap: 8, marginTop: 12 }}>
          <ChefHat size={13} color="rgba(255,255,255,0.3)" style={{ flexShrink: 0, marginTop: 1 }} />
          <p style={{ fontSize: 12, color: "rgba(255,255,255,0.55)", lineHeight: 1.5 }}>
            <span style={{ color: "rgba(255,255,255,0.35)" }}>Try: </span>
            {meal.specialty}
          </p>
        </div>
      )}

      {/* Area */}
      {meal.area && (
        <div style={{ display: "flex", alignItems: "center", gap: 7, marginTop: 8 }}>
          <MapPin size={12} color="rgba(255,255,255,0.28)" />
          <span style={{ fontSize: 12, color: "rgba(255,255,255,0.42)" }}>{meal.area}</span>
        </div>
      )}

      {/* Best for */}
      {meal.best_for && (
        <div style={{ display: "flex", gap: 8, marginTop: 10, borderRadius: 8, padding: "8px 12px", background: "rgba(255,255,255,0.03)" }}>
          <Info size={12} color="rgba(255,255,255,0.22)" style={{ flexShrink: 0, marginTop: 1 }} />
          <p style={{ fontSize: 12, color: "rgba(255,255,255,0.38)", fontStyle: "italic", lineHeight: 1.5 }}>{meal.best_for}</p>
        </div>
      )}

      {/* Price range */}
      {meal.price_range && (
        <p style={{ marginTop: 10, fontSize: 13, fontWeight: 600, color: "#F59E0B", textAlign: "right" }}>{meal.price_range}</p>
      )}
    </div>
  );
}

export default function MealsCard({ meals }: MealsCardProps) {
  if (!meals?.length) return null;

  const ordered = [...meals].sort((a, b) => {
    const order = ["breakfast", "lunch", "dinner"];
    return order.indexOf(a.meal_type) - order.indexOf(b.meal_type);
  });

  return (
    <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 20, overflow: "hidden" }}>
      {/* Header */}
      <div style={{ padding: "18px 24px", borderBottom: "1px solid rgba(255,255,255,0.05)", display: "flex", alignItems: "center", gap: 10 }}>
        <UtensilsCrossed size={17} color="#F97316" />
        <span style={{ fontSize: 14, fontWeight: 600, color: "white" }}>Where to Eat Today</span>
      </div>

      {/* Meal entries */}
      {ordered.map((meal, i) => (
        <div key={i}>
          <MealEntry meal={meal} />
          {i < ordered.length - 1 && (
            <div style={{ marginInline: 24, height: 1, background: "rgba(255,255,255,0.05)" }} />
          )}
        </div>
      ))}
    </div>
  );
}
