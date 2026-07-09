"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { SlidersHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";

type Category = { id: string; name: string };

export function CategoryFilter({ categories }: { categories: Category[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeId = searchParams.get("categoryId");

  function toggle(id: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (activeId === id) {
      params.delete("categoryId");
    } else {
      params.set("categoryId", id);
    }
    const qs = params.toString();
    router.push(qs ? `/?${qs}` : "/", { scroll: false });
  }

  return (
    <div className="flex items-center gap-2 px-[14px] pb-[10px]">
      {/* Chips scrollables */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar flex-1">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => toggle(cat.id)}
            className={cn(
              "shrink-0 px-[10px] py-1 h-6 rounded-[10px] text-[12px] font-bold whitespace-nowrap transition-colors",
              activeId === cat.id
                ? "bg-[#1e1e1e] text-[#e8e8e8]"
                : "bg-[#e8e8e8] text-foreground"
            )}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Icône filtre fixe à droite */}
      <button
        className="shrink-0 flex items-center justify-center size-8 rounded-[10px] hover:bg-muted transition-colors"
        aria-label="Filtres avancés"
      >
        <SlidersHorizontal size={18} strokeWidth={1.8} />
      </button>
    </div>
  );
}
