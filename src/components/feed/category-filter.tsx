"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { SlidersHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";

type Category = { id: string; name: string };

function buildHref(current: URLSearchParams, catId: string) {
  const params = new URLSearchParams(current.toString());
  if (params.get("categoryId") === catId) {
    params.delete("categoryId");
  } else {
    params.set("categoryId", catId);
  }
  const qs = params.toString();
  return qs ? `/?${qs}` : "/";
}

export function CategoryFilter({ categories }: { categories: Category[] }) {
  const searchParams = useSearchParams();
  const activeId = searchParams.get("categoryId");

  return (
    <div className="flex items-center gap-2 px-[14px] pb-[10px]">
      <div className="flex gap-2 overflow-x-auto no-scrollbar flex-1">
        {categories.map((cat) => (
          <Link
            key={cat.id}
            href={buildHref(searchParams, cat.id)}
            scroll={false}
            className={cn(
              "shrink-0 px-[10px] py-1 h-6 rounded-[10px] text-[12px] font-bold whitespace-nowrap transition-colors",
              activeId === cat.id
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-foreground"
            )}
          >
            {cat.name}
          </Link>
        ))}
      </div>

      <button
        className="shrink-0 flex items-center justify-center size-8 rounded-[10px] hover:bg-muted transition-colors"
        aria-label="Filtres avancés"
      >
        <SlidersHorizontal size={18} strokeWidth={1.8} />
      </button>
    </div>
  );
}
