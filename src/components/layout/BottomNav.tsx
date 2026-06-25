"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, PlusCircle, User } from "lucide-react";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Home",     Icon: LayoutDashboard },
  { href: "/trips/new", label: "New Trip", Icon: PlusCircle      },
  { href: "/profile",   label: "Profile",  Icon: User            },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-30 flex items-center justify-around border-t border-slate-700/60 bg-navy/95 backdrop-blur-md sm:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      {NAV_ITEMS.map(({ href, label, Icon }) => {
        const active =
          href === "/dashboard"
            ? pathname === "/dashboard"
            : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            className={`flex min-w-[44px] flex-col items-center gap-1 py-3 px-4 text-xs transition-all ${
              active ? "text-sky" : "text-slate-500 hover:text-slate-300"
            }`}
          >
            <Icon size={22} strokeWidth={active ? 2 : 1.5} />
            <span className="font-medium">{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
