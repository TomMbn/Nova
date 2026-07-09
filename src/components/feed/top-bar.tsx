import Link from "next/link";
import Image from "next/image";
import { Bell } from "lucide-react";

import { getCurrentUser } from "@/lib/auth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { SearchBar } from "./search-bar";

export async function TopBar() {
  const user = await getCurrentUser();
  const initials = user
    ? user.name
        .split(" ")
        .map((part) => part[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "";

  return (
    <header className="flex items-center gap-2.5 border-b border-border bg-background px-[14px] py-[10px] sticky top-0 z-40">
      <Link
        href="/"
        className="flex size-10 shrink-0 items-center justify-center"
        aria-label="Accueil"
      >
        <Image
          src="/logo-nova/nova-logo-favicon.png"
          alt="Nova"
          width={28}
          height={28}
          priority
          className="object-contain"
        />
      </Link>

      <SearchBar />

      <Link
        href="/notifications"
        className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-muted transition-colors hover:bg-muted/70"
        aria-label="Notifications"
      >
        <Bell size={18} strokeWidth={1.8} />
      </Link>

      <Link href="/profil" className="shrink-0" aria-label="Profil">
        <Avatar>
          <AvatarImage src={user?.avatarUrl ?? undefined} alt={user?.name ?? "Profil"} />
          <AvatarFallback className="text-xs">{initials || "?"}</AvatarFallback>
        </Avatar>
      </Link>
    </header>
  );
}
