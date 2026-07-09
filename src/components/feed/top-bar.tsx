import Link from "next/link";
import { Search, Bell } from "lucide-react";

export function TopBar() {
  return (
    <header className="flex items-center justify-between gap-3 px-[14px] py-[15px] bg-background sticky top-0 z-40">
      <Link
        href="/recherche"
        className="flex items-center justify-center size-[46px] rounded-[10px] hover:bg-muted transition-colors"
        aria-label="Rechercher"
      >
        <Search size={22} strokeWidth={1.8} />
      </Link>

      <div className="flex items-center justify-center h-[46px] rounded-[10px] bg-[#e8e8e8] flex-1">
        <span className="text-xs font-bold tracking-wide">Nova</span>
      </div>

      <Link
        href="/notifications"
        className="flex items-center justify-center size-[46px] rounded-[10px] hover:bg-muted transition-colors"
        aria-label="Notifications"
      >
        <Bell size={22} strokeWidth={1.8} />
      </Link>
    </header>
  );
}
