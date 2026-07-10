"use client";

import Link from "next/link";
import { Bookmark, LogOut, MoreHorizontal, Pencil } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ThemeToggle } from "@/components/theme-toggle";

export function ProfileMenu() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className="flex size-8 items-center justify-center rounded-full bg-muted"
        aria-label="Plus d'options"
      >
        <MoreHorizontal size={16} strokeWidth={2} />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuItem render={<Link href="/profil/modifier" />}>
          <Pencil />
          Modifier mon profil
        </DropdownMenuItem>
        <DropdownMenuItem render={<Link href="/profil/enregistrements" />}>
          <Bookmark />
          Posts enregistrés
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <div className="px-1.5 py-1.5">
          <ThemeToggle />
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          variant="destructive"
          render={<form action="/logout" method="POST" className="contents" />}
        >
          <button type="submit" className="flex w-full items-center gap-1.5">
            <LogOut />
            Se déconnecter
          </button>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
