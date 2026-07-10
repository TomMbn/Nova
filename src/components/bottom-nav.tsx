"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Search, Plus, BookOpen, MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

const NAV_ITEMS = [
  { href: "/", icon: Home, label: "Accueil", publish: false },
  { href: "/recherche", icon: Search, label: "Recherche", publish: false },
  { href: "/publier", icon: Plus, label: "Publier", publish: true },
  { href: "/formations", icon: BookOpen, label: "Formations", publish: false },
  { href: "/messages", icon: MessageCircle, label: "Messages", publish: false },
] as const;

const POLL_INTERVAL_MS = 15_000;

export function BottomNav() {
  const pathname = usePathname();
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchUnreadCount = useCallback(async () => {
    try {
      const res = await fetch("/api/messages/unread-count");
      if (!res.ok) return;
      const data = await res.json();
      setUnreadCount(data.count ?? 0);
    } catch {
      // silencieux
    }
  }, []);

  useEffect(() => {
    // setTimeout(…, 0) plutôt qu'un appel direct : évite d'invoquer
    // synchroniquement une fonction qui met à jour l'état dans le corps de
    // l'effet (règle react-hooks/set-state-in-effect).
    const immediate = setTimeout(fetchUnreadCount, 0);
    const interval = setInterval(fetchUnreadCount, POLL_INTERVAL_MS);
    return () => {
      clearTimeout(immediate);
      clearInterval(interval);
    };
    // Rejoue aussi à chaque changement de page (ex. après lecture d'une
    // conversation) pour que le badge se mette à jour sans attendre le poll.
  }, [pathname, fetchUnreadCount]);

  return (
    <nav className="fixed bottom-0 inset-x-0 z-50 border-t border-border bg-background pb-[env(safe-area-inset-bottom)]">
      <ul className="flex items-center justify-around px-3 pt-2 pb-1">
        {NAV_ITEMS.map(({ href, icon: Icon, label, publish }) => {
          const active = pathname === href;

          if (publish) {
            return (
              <li key={href}>
                <Link href={href} aria-label={label}>
                  <span className="flex -mt-2 size-11 items-center justify-center rounded-xl bg-foreground shadow-lg transition-opacity active:opacity-70">
                    <Icon size={20} strokeWidth={2.5} className="text-background" />
                  </span>
                </Link>
              </li>
            );
          }

          const showBadge = href === "/messages" && unreadCount > 0;

          return (
            <li key={href}>
              <Link
                href={href}
                aria-label={
                  showBadge ? `${label} (${unreadCount} non lu${unreadCount > 1 ? "s" : ""})` : label
                }
                className={cn(
                  "relative flex flex-col items-center gap-1 px-2 py-1 transition-colors",
                  active ? "text-foreground" : "text-muted-foreground"
                )}
              >
                <Icon size={20} strokeWidth={active ? 2.2 : 1.8} />
                <span className="text-[10px] font-semibold">{label}</span>
                {showBadge && (
                  <Badge className="absolute -top-1 right-0 h-4 min-w-4 px-1 text-[10px]">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </Badge>
                )}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
