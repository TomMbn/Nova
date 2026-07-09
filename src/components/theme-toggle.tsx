"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Switch } from "@/components/ui/switch";

/**
 * Bascule clair/sombre. `useTheme` ne connaît le thème réel qu'après montage
 * côté client (le rendu serveur ne sait pas ce qui est stocké en
 * localStorage) — on affiche un état neutre jusque-là pour éviter tout écart
 * d'hydratation.
 */
export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Nécessaire pour resynchroniser après hydratation (le serveur ne connaît
  // pas le thème stocké en localStorage) — pattern documenté par next-themes.
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => setMounted(true), []);

  const isDark = mounted && resolvedTheme === "dark";

  return (
    <div className="flex items-center justify-between gap-3">
      <div className="flex items-center gap-2">
        {isDark ? (
          <Moon className="size-4" />
        ) : (
          <Sun className="size-4" />
        )}
        <span className="text-sm font-medium">Mode sombre</span>
      </div>
      <Switch
        checked={isDark}
        onCheckedChange={(checked) => setTheme(checked ? "dark" : "light")}
        aria-label="Activer le mode sombre"
      />
    </div>
  );
}
