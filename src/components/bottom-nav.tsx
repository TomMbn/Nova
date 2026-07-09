"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Search, Plus, Headphones, MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/", icon: Home, label: "Accueil", publish: false },
  { href: "/recherche", icon: Search, label: "Recherche", publish: false },
  { href: "/publier", icon: Plus, label: "Publier", publish: true },
  { href: "/formations", icon: Headphones, label: "Formations", publish: false },
  { href: "/messages", icon: MessageCircle, label: "Messages", publish: false },
] as const;

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 inset-x-0 z-50 bg-background pb-[env(safe-area-inset-bottom)]">
      <ul className="flex items-center justify-around h-16 px-4">
        {NAV_ITEMS.map(({ href, icon: Icon, label, publish }) => {
          const active = pathname === href;

          if (publish) {
            return (
              <li key={href}>
                <Link href={href} aria-label={label}>
                  <span className="flex items-center justify-center size-[39px] rounded-[10px] bg-[#e8e8e8] transition-opacity active:opacity-60">
                    <Icon size={20} strokeWidth={2} className="text-foreground" />
                  </span>
                </Link>
              </li>
            );
          }

          return (
            <li key={href}>
              <Link
                href={href}
                aria-label={label}
                className={cn(
                  "flex items-center justify-center transition-opacity active:opacity-60",
                  active ? "opacity-100" : "opacity-40"
                )}
              >
                <Icon size={24} strokeWidth={active ? 2 : 1.5} />
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
