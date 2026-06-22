"use client";

import { useState } from "react";
import { EXPENSE_CATEGORIES, type ExpenseCategory } from "@/types/budget";

interface ExpenseFormProps {
  tripId: string;
  currency?: string;
  onAdd: () => void;
  onClose: () => void;
}

const CATEGORY_PLACEHOLDERS: Record<ExpenseCategory, string> = {
  Food:          "e.g. ₹800",
  Transport:     "e.g. ₹200",
  Accommodation: "e.g. ₹4,500",
  Activities:    "e.g. ₹1,200",
  Shopping:      "e.g. ₹2,500",
  Other:         "e.g. ₹500",
};

export default function ExpenseForm({ tripId, onAdd, onClose }: ExpenseFormProps) {
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState<ExpenseCategory>("Food");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !amount || !category) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/trips/${tripId}/expenses`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          amount: parseFloat(amount),
          currency: "INR",
          category,
          expense_date: date,
          notes,
        }),
      });
      if (res.ok) {
        onAdd();
        onClose();
      }
    } finally {
      setSaving(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end justify-center p-0 sm:items-center sm:p-4"
      style={{ background: "rgba(0,0,0,0.65)", backdropFilter: "blur(4px)" }}
      onClick={onClose}
    >
      <div
        className="w-full rounded-t-2xl border border-slate-700/60 bg-[#0B1523] p-6 shadow-2xl sm:max-w-md sm:rounded-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-base font-semibold text-white">Add expense</h2>
          <button onClick={onClose} className="text-slate-400 transition hover:text-white">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-400">What for? *</label>
            <input
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Dinner at Nobu"
              className="w-full rounded-xl border border-slate-700 bg-navy px-3 py-2 text-sm text-white placeholder-slate-600 outline-none focus:border-sky/50"
              required
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-slate-400">
              Amount (₹) *
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-semibold text-sky">₹</span>
              <input
                type="number"
                step="1"
                min="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder={CATEGORY_PLACEHOLDERS[category].replace("e.g. ₹", "").replace(",", "")}
                className="w-full rounded-xl border border-slate-700 bg-navy py-2 pl-7 pr-3 text-sm text-white placeholder-slate-600 outline-none focus:border-sky/50"
                required
              />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium text-slate-400">Category</label>
            <div className="flex flex-wrap gap-1.5">
              {EXPENSE_CATEGORIES.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setCategory(c)}
                  className={`rounded-full border px-3 py-1 text-xs transition ${
                    category === c
                      ? "border-sky/60 bg-sky/10 text-sky"
                      : "border-slate-700 text-slate-400 hover:border-slate-600 hover:text-white"
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-slate-400">Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full rounded-xl border border-slate-700 bg-navy px-3 py-2 text-sm text-white outline-none focus:border-sky/50 [color-scheme:dark]"
              required
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-slate-400">Notes (optional)</label>
            <input
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any notes…"
              className="w-full rounded-xl border border-slate-700 bg-navy px-3 py-2 text-sm text-white placeholder-slate-600 outline-none focus:border-sky/50"
            />
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full rounded-xl bg-sky py-2.5 text-sm font-semibold text-navy transition hover:bg-sky-hover disabled:opacity-40"
          >
            {saving ? "Saving…" : "Add expense"}
          </button>
        </form>
      </div>
    </div>
  );
}
