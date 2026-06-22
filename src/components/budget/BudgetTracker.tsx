"use client";

import { useState, useEffect, useCallback } from "react";
import type { Expense, ExpenseCategory } from "@/types/budget";
import { CATEGORY_EMOJI } from "@/types/budget";
import SpendingChart from "./SpendingChart";
import ExpenseForm from "./ExpenseForm";

interface BudgetTrackerProps {
  tripId: string;
  estimatedBudget?: string;
  currency?: string;
}

// INR formatting using Indian number system (1,50,000 not 150,000)
function formatINR(amount: number): string {
  return (
    "₹" +
    amount.toLocaleString("en-IN", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    })
  );
}

function parseEstimatedBudget(s?: string): number | null {
  if (!s) return null;
  // Strip ₹, commas, and take the first number found
  const m = s.replace(/[₹,]/g, "").match(/[\d]+(?:\.\d+)?/);
  return m ? parseFloat(m[0]) : null;
}

export default function BudgetTracker({ tripId, estimatedBudget }: BudgetTrackerProps) {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  const loadExpenses = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/trips/${tripId}/expenses`);
      if (res.ok) {
        const json = await res.json();
        setExpenses(json.expenses ?? []);
      }
    } finally {
      setLoading(false);
    }
  }, [tripId]);

  useEffect(() => { loadExpenses(); }, [loadExpenses]);

  async function handleDelete(id: string) {
    await fetch(`/api/trips/${tripId}/expenses?expenseId=${id}`, { method: "DELETE" });
    setExpenses((prev) => prev.filter((e) => e.id !== id));
  }

  const total = expenses.reduce((s, e) => s + e.amount, 0);
  const estimated = parseEstimatedBudget(estimatedBudget);
  const pct = estimated ? Math.round((total / estimated) * 100) : null;
  const overBudget = pct !== null && pct > 100;
  const nearBudget = pct !== null && pct >= 80 && pct <= 100;

  return (
    <div className="space-y-6">
      {/* Summary card */}
      <div className="rounded-2xl border border-slate-700/60 bg-navy-800 p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs text-slate-400">Total spent</p>
            <p className="mt-1 text-3xl font-bold text-white">{formatINR(total)}</p>
            {estimated && (
              <p className="mt-1 text-sm text-slate-400">
                of {formatINR(estimated)} estimated
              </p>
            )}
          </div>
          {pct !== null && (
            <div
              className={`rounded-full px-3 py-1 text-sm font-bold ${
                overBudget
                  ? "bg-red-900/40 text-red-400"
                  : nearBudget
                  ? "bg-amber-900/40 text-amber-400"
                  : "bg-emerald-900/40 text-emerald-400"
              }`}
            >
              {pct}%
            </div>
          )}
        </div>

        {pct !== null && (
          <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-700">
            <div
              className={`h-full rounded-full transition-all ${
                overBudget ? "bg-red-500" : nearBudget ? "bg-amber-500" : "bg-emerald-500"
              }`}
              style={{ width: `${Math.min(pct, 100)}%` }}
            />
          </div>
        )}
      </div>

      {/* Charts */}
      {expenses.length >= 2 && (
        <div className="rounded-2xl border border-slate-700/60 bg-navy-800 p-5">
          <SpendingChart expenses={expenses} currency="₹" />
        </div>
      )}

      {/* Expense list */}
      <div className="rounded-2xl border border-slate-700/60 bg-navy-800 p-5">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-white">Expenses</h3>
          <button
            onClick={() => setShowForm(true)}
            className="rounded-lg bg-sky px-3 py-1.5 text-xs font-semibold text-navy transition hover:bg-sky-hover"
          >
            + Add
          </button>
        </div>

        {loading ? (
          <div className="space-y-2">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-12 animate-pulse rounded-xl bg-slate-700/40" />
            ))}
          </div>
        ) : expenses.length === 0 ? (
          <div className="py-8 text-center">
            <p className="mb-2 text-3xl">💰</p>
            <p className="text-sm text-slate-400">No expenses yet</p>
            <button onClick={() => setShowForm(true)} className="mt-3 text-xs text-sky hover:underline">
              Add your first expense →
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            {expenses.map((expense) => (
              <div
                key={expense.id}
                className="group flex items-center justify-between gap-3 rounded-xl border border-slate-700/50 bg-navy px-3 py-2.5"
              >
                <div className="flex min-w-0 items-center gap-2.5">
                  <span className="shrink-0 text-base">
                    {CATEGORY_EMOJI[expense.category as ExpenseCategory] ?? "📦"}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-white">{expense.name}</p>
                    <p className="text-xs text-slate-500">
                      {expense.category} · {expense.expense_date}
                    </p>
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-3">
                  <span className="text-sm font-semibold text-white">
                    {formatINR(expense.amount)}
                  </span>
                  <button
                    onClick={() => handleDelete(expense.id)}
                    className="text-slate-600 opacity-0 transition hover:text-red-400 group-hover:opacity-100"
                    title="Delete expense"
                  >
                    ✕
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showForm && (
        <ExpenseForm
          tripId={tripId}
          currency="INR"
          onAdd={loadExpenses}
          onClose={() => setShowForm(false)}
        />
      )}
    </div>
  );
}
