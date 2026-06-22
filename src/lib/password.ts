export function getStrength(pw: string): { level: number; label: string; color: string } {
  if (!pw) return { level: 0, label: "", color: "#EF4444" };
  let s = 0;
  if (pw.length >= 8)          s++;
  if (/[A-Z]/.test(pw))        s++;
  if (/[0-9]/.test(pw))        s++;
  if (/[^A-Za-z0-9]/.test(pw)) s++;
  if (s <= 1) return { level: 1, label: "Weak",        color: "#EF4444" };
  if (s === 2) return { level: 2, label: "Fair",        color: "#F59E0B" };
  if (s === 3) return { level: 3, label: "Strong",      color: "#38BDF8" };
  return              { level: 4, label: "Very strong", color: "#10B981" };
}
