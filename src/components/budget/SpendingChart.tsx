"use client";

import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
} from "recharts";
import type { Expense, ExpenseCategory } from "@/types/budget";
import { CATEGORY_COLORS, CATEGORY_EMOJI } from "@/types/budget";

interface SpendingChartProps {
  expenses: Expense[];
  currency: string;
}

export default function SpendingChart({ expenses, currency }: SpendingChartProps) {
  // By category
  const byCategory = expenses.reduce<Record<string, number>>((acc, e) => {
    acc[e.category] = (acc[e.category] ?? 0) + e.amount;
    return acc;
  }, {});

  const pieData = Object.entries(byCategory).map(([name, value]) => ({
    name,
    value: Math.round(value * 100) / 100,
    color: CATEGORY_COLORS[name as ExpenseCategory] ?? "#94A3B8",
  }));

  // By day
  const byDay = expenses.reduce<Record<string, number>>((acc, e) => {
    const label = new Date(e.expense_date + "T00:00:00").toLocaleDateString("en-US", {
      month: "short", day: "numeric",
    });
    acc[label] = (acc[label] ?? 0) + e.amount;
    return acc;
  }, {});

  const barData = Object.entries(byDay)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, amount]) => ({ date, amount: Math.round(amount * 100) / 100 }));

  if (expenses.length === 0) return null;

  return (
    <div className="space-y-6">
      {/* Donut chart */}
      {pieData.length > 0 && (
        <div>
          <p className="mb-3 text-sm font-medium text-slate-300">By category</p>
          <div className="flex items-center gap-6">
            <div className="h-[160px] w-[160px] shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={48}
                    outerRadius={70}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {pieData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      background: "#1E293B",
                      border: "1px solid #334155",
                      borderRadius: 8,
                      color: "#F1F5F9",
                      fontSize: 12,
                    }}
                    formatter={(v) => [`${currency} ${Number(v).toFixed(2)}`, ""]}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex-1 space-y-2">
              {pieData.map((item) => (
                <div key={item.name} className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    <div
                      className="h-2.5 w-2.5 rounded-full shrink-0"
                      style={{ background: item.color }}
                    />
                    <span className="text-xs text-slate-400">
                      {CATEGORY_EMOJI[item.name as ExpenseCategory]} {item.name}
                    </span>
                  </div>
                  <span className="text-xs font-medium text-white">
                    {currency} {item.value.toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Daily spend bar chart */}
      {barData.length > 1 && (
        <div>
          <p className="mb-3 text-sm font-medium text-slate-300">Daily spend</p>
          <div className="h-[140px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
                <XAxis
                  dataKey="date"
                  tick={{ fill: "#64748B", fontSize: 10 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: "#64748B", fontSize: 10 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{
                    background: "#1E293B",
                    border: "1px solid #334155",
                    borderRadius: 8,
                    color: "#F1F5F9",
                    fontSize: 12,
                  }}
                  formatter={(v) => [`${currency} ${Number(v).toFixed(2)}`, "Spent"]}
                />
                <Bar dataKey="amount" fill="#38BDF8" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
}
