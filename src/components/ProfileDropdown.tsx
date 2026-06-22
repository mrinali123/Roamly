"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { signOut } from "@/lib/auth";

interface ProfileDropdownProps {
  user: { email?: string; full_name?: string } | null;
}

type View = "menu" | "password";
type PwdStatus = "idle" | "loading" | "success" | "error";

export default function ProfileDropdown({ user }: ProfileDropdownProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [view, setView] = useState<View>("menu");
  const [signingOut, setSigningOut] = useState(false);

  // Password form state
  const [currentPwd, setCurrentPwd] = useState("");
  const [newPwd, setNewPwd] = useState("");
  const [confirmPwd, setConfirmPwd] = useState("");
  const [pwdStatus, setPwdStatus] = useState<PwdStatus>("idle");
  const [pwdError, setPwdError] = useState("");

  const containerRef = useRef<HTMLDivElement>(null);

  const displayName = user?.full_name || user?.email?.split("@")[0] || "User";
  const initials = displayName
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  // Close dropdown when clicking outside
  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        closeDropdown();
      }
    }
    if (open) document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, [open]);

  function closeDropdown() {
    setOpen(false);
    setView("menu");
    setPwdStatus("idle");
    setPwdError("");
  }

  async function handleSignOut() {
    setSigningOut(true);
    await signOut();
    router.push("/");
    router.refresh();
  }

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault();
    if (newPwd !== confirmPwd) { setPwdError("New passwords don't match."); return; }
    if (newPwd.length < 8) { setPwdError("New password must be at least 8 characters."); return; }

    setPwdStatus("loading");
    setPwdError("");

    try {
      const supabase = createClient();

      // Step 1: verify current password
      const { error: signInErr } = await supabase.auth.signInWithPassword({
        email: user?.email ?? "",
        password: currentPwd,
      });
      if (signInErr) {
        setPwdError("Current password is incorrect.");
        setPwdStatus("error");
        return;
      }

      // Step 2: update to new password
      const { error: updateErr } = await supabase.auth.updateUser({ password: newPwd });
      if (updateErr) {
        setPwdError(updateErr.message);
        setPwdStatus("error");
        return;
      }

      setPwdStatus("success");
      setCurrentPwd(""); setNewPwd(""); setConfirmPwd("");
      setTimeout(() => { setView("menu"); setPwdStatus("idle"); }, 2200);
    } catch {
      setPwdError("Something went wrong. Please try again.");
      setPwdStatus("error");
    }
  }

  if (!user) return null;

  return (
    <div ref={containerRef} className="relative">
      {/* Avatar trigger */}
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label="Open profile menu"
        className={`flex h-9 w-9 items-center justify-center rounded-full bg-sky/20 text-sm font-bold text-sky ring-2 transition-all hover:bg-sky/30 ${open ? "ring-sky/50" : "ring-transparent"}`}
      >
        {initials}
      </button>

      {/* Dropdown panel */}
      {open && (
        <div className="absolute right-0 top-12 z-50 w-[280px] overflow-hidden rounded-2xl border border-slate-700/70 bg-[#1E293B] shadow-2xl shadow-black/50 animate-fade-up">
          {view === "menu" ? (
            <>
              {/* Header */}
              <div className="flex items-center gap-3 border-b border-slate-700/60 px-4 py-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-sky/40 to-blue-500/40 text-sm font-bold text-sky ring-2 ring-sky/20">
                  {initials}
                </div>
                <div className="min-w-0">
                  <p className="truncate font-semibold text-white">{displayName}</p>
                  <p className="truncate text-xs text-slate-400">{user.email}</p>
                </div>
              </div>

              {/* Menu items */}
              <div className="py-1.5">
                <Link
                  href="/profile"
                  onClick={closeDropdown}
                  className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-300 transition hover:bg-slate-700/50 hover:text-white"
                >
                  <span>👤</span> My Profile
                </Link>

                <button
                  onClick={() => { setView("password"); setPwdStatus("idle"); setPwdError(""); }}
                  className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-slate-300 transition hover:bg-slate-700/50 hover:text-white"
                >
                  <span>🔒</span> Change Password
                </button>

              </div>

              {/* Sign out */}
              <div className="border-t border-slate-700/60 py-1.5">
                <button
                  onClick={handleSignOut}
                  disabled={signingOut}
                  className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-red-400 transition hover:bg-red-500/10 hover:text-red-300 disabled:opacity-50"
                >
                  <span>🚪</span>
                  {signingOut ? "Signing out…" : "Sign Out"}
                </button>
              </div>
            </>
          ) : (
            /* Password change view */
            <div className="p-4">
              <div className="mb-4 flex items-center gap-2">
                <button
                  onClick={() => { setView("menu"); setPwdStatus("idle"); setPwdError(""); }}
                  className="flex h-7 w-7 items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-700 hover:text-white"
                >
                  ←
                </button>
                <h3 className="text-sm font-semibold text-white">Change Password</h3>
              </div>

              {pwdStatus === "success" ? (
                <div className="flex flex-col items-center gap-2 rounded-xl bg-emerald-900/30 p-5 text-center">
                  <span className="text-3xl">✅</span>
                  <p className="text-sm font-medium text-emerald-400">Password updated successfully!</p>
                </div>
              ) : (
                <form onSubmit={handleChangePassword} className="space-y-3">
                  {[
                    { label: "Current password", value: currentPwd, onChange: setCurrentPwd },
                    { label: "New password",     value: newPwd,     onChange: setNewPwd,    min: 8 },
                    { label: "Confirm new password", value: confirmPwd, onChange: setConfirmPwd },
                  ].map(({ label, value, onChange, min }) => (
                    <div key={label}>
                      <label className="mb-1 block text-xs text-slate-400">{label}</label>
                      <input
                        type="password"
                        value={value}
                        onChange={(e) => onChange(e.target.value)}
                        minLength={min}
                        required
                        className="w-full rounded-lg border border-slate-700 bg-[#0F172A] px-3 py-2 text-sm text-white placeholder-slate-600 focus:border-sky focus:outline-none"
                        placeholder="••••••••"
                      />
                    </div>
                  ))}

                  {pwdError && (
                    <p className="rounded-lg bg-red-900/20 px-3 py-2 text-xs text-red-400">{pwdError}</p>
                  )}

                  <button
                    type="submit"
                    disabled={pwdStatus === "loading"}
                    className="w-full rounded-xl bg-sky py-2.5 text-sm font-semibold text-navy transition hover:bg-sky-hover disabled:opacity-50"
                  >
                    {pwdStatus === "loading" ? "Verifying & updating…" : "Update Password"}
                  </button>
                </form>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
