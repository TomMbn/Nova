import Link from "next/link";
import { cn } from "@/lib/utils";

export function SearchTabs({ active }: { active: "membres" | "entreprises" }) {
  return (
    <div className="flex rounded-full bg-muted p-1">
      <Link
        href="/recherche?tab=membres"
        className={cn(
          "flex-1 rounded-full py-2 text-center text-[13px] transition-colors",
          active === "membres"
            ? "bg-background font-bold text-foreground shadow-sm"
            : "font-medium text-muted-foreground"
        )}
      >
        Membres
      </Link>
      <Link
        href="/recherche?tab=entreprises"
        className={cn(
          "flex-1 rounded-full py-2 text-center text-[13px] transition-colors",
          active === "entreprises"
            ? "bg-background font-bold text-foreground shadow-sm"
            : "font-medium text-muted-foreground"
        )}
      >
        Entreprises
      </Link>
    </div>
  );
}
