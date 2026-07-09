import Link from "next/link";
import { Search, SlidersHorizontal } from "lucide-react";

export function TopBar() {
  return (
    <header className="flex items-center justify-between gap-3 px-4 py-3 bg-background sticky top-0 z-40">
      <Link
        href="/recherche"
        className="flex items-center justify-center size-[46px] rounded-[10px] hover:bg-muted transition-colors"
        aria-label="Rechercher"
      >
        <Search size={22} strokeWidth={1.8} />
      </Link>

      <div className="flex items-center justify-center h-[46px] px-8 rounded-[10px] bg-muted flex-1">
        <span className="text-xs font-bold tracking-wide">Nova</span>
      </div>

      <button
        className="flex items-center justify-center size-[46px] rounded-[10px] hover:bg-muted transition-colors"
        aria-label="Filtres"
      >
        <SlidersHorizontal size={18} strokeWidth={1.8} />
      </button>
    </header>
  );
}
