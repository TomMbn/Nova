import Link from "next/link";
import Image from "next/image";
import { Search, Bell, User } from "lucide-react";

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

      <div className="flex items-center justify-center h-[46px] rounded-[10px] flex-1">
        <Image
          src="/logo-nova/nova-logo.png"
          alt="Nova"
          width={116}
          height={28}
          priority
          className="block dark:hidden"
        />
        <Image
          src="/logo-nova/nova-logo-blanc.png"
          alt="Nova"
          width={116}
          height={28}
          priority
          className="hidden dark:block"
        />
      </div>

      <div className="flex items-center gap-1">
        <Link
          href="/notifications"
          className="flex items-center justify-center size-[46px] rounded-[10px] hover:bg-muted transition-colors"
          aria-label="Notifications"
        >
          <Bell size={22} strokeWidth={1.8} />
        </Link>

        <Link
          href="/profil"
          className="flex items-center justify-center size-[46px] rounded-[10px] hover:bg-muted transition-colors"
          aria-label="Profil"
        >
          <User size={22} strokeWidth={1.8} />
        </Link>
      </div>
    </header>
  );
}
