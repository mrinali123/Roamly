export type ExpenseCategory =
  | "Food"
  | "Transport"
  | "Accommodation"
  | "Activities"
  | "Shopping"
  | "Other";

export const EXPENSE_CATEGORIES: ExpenseCategory[] = [
  "Food",
  "Transport",
  "Accommodation",
  "Activities",
  "Shopping",
  "Other",
];

export const CATEGORY_COLORS: Record<ExpenseCategory, string> = {
  Food: "#38BDF8",
  Transport: "#818CF8",
  Accommodation: "#34D399",
  Activities: "#F59E0B",
  Shopping: "#F472B6",
  Other: "#94A3B8",
};

export const CATEGORY_EMOJI: Record<ExpenseCategory, string> = {
  Food: "🍽️",
  Transport: "🚌",
  Accommodation: "🏨",
  Activities: "⚡",
  Shopping: "🛍️",
  Other: "📦",
};

export const CURRENCIES = ["USD", "EUR", "GBP", "INR", "JPY", "AUD", "CAD"] as const;

export interface Expense {
  id: string;
  trip_id: string;
  user_id: string;
  name: string;
  amount: number;
  currency: string;
  category: ExpenseCategory;
  expense_date: string;
  notes?: string | null;
  created_at: string;
}
