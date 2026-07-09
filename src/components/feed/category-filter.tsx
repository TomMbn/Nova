"use client";

import { useRouter, useSearchParams } from "next/navigation";
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
    <div className="flex gap-2 overflow-x-auto px-4 pb-3 no-scrollbar">
      {categories.map((cat) => (
        <button
          key={cat.id}
          onClick={() => toggle(cat.id)}
          className={cn(
            "shrink-0 px-3 py-1 rounded-[10px] text-xs font-bold whitespace-nowrap transition-colors",
            activeId === cat.id
              ? "bg-foreground text-background"
              : "bg-muted text-foreground"
          )}
        >
          {cat.name}
        </button>
      ))}
    </div>
  );
}
