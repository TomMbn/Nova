"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Search, Plus, Bell, User } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/", icon: Home, label: "Accueil", publish: false },
  { href: "/recherche", icon: Search, label: "Recherche", publish: false },
  { href: "/publier", icon: Plus, label: "Publier", publish: true },
  { href: "/notifications", icon: Bell, label: "Notifications", publish: false },
  { href: "/profil", icon: User, label: "Profil", publish: false },
] as const;

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 inset-x-0 z-50 bg-background border-t border-border pb-[env(safe-area-inset-bottom)]">
      <ul className="flex items-center justify-around h-16 px-2">
        {NAV_ITEMS.map(({ href, icon: Icon, label, publish }) => {
          const active = pathname === href;

          if (publish) {
            return (
              <li key={href}>
                <Link
                  href={href}
                  aria-label={label}
                  className="flex flex-col items-center gap-1"
                >
                  <span className="flex items-center justify-center w-11 h-11 rounded-full bg-foreground text-background transition-opacity active:opacity-70">
                    <Icon size={20} strokeWidth={2.5} />
                  </span>
                  <span className="text-[10px] tracking-wide text-muted-foreground">
                    {label}
                  </span>
                </Link>
              </li>
            );
          }

          return (
            <li key={href}>
              <Link
                href={href}
                className={cn(
                  "flex flex-col items-center gap-1 transition-colors",
                  active ? "text-foreground" : "text-muted-foreground"
                )}
              >
                <Icon size={22} strokeWidth={active ? 2.5 : 1.8} />
                <span className="text-[10px] tracking-wide">{label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
