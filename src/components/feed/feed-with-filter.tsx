"use client";

import { useState } from "react";
import { SlidersHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";
import type { FeedPost } from "@/queries/posts";
import { PostCard } from "./post-card";

type Category = { id: string; name: string };

export function FeedWithFilter({
  initialPosts,
  categories,
}: {
  initialPosts: FeedPost[];
  categories: Category[];
}) {
  const [activeId, setActiveId] = useState<string | null>(null);

  const filtered = activeId
    ? initialPosts.filter((p) => p.category.id === activeId)
    : initialPosts;

  return (
    <>
      <div className="flex items-center gap-2 px-[14px] pb-[10px]">
        <div className="flex gap-2 overflow-x-auto no-scrollbar flex-1">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => { console.log("click", cat.id); setActiveId(activeId === cat.id ? null : cat.id); }}
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
        <button
          className="shrink-0 flex items-center justify-center size-8 rounded-[10px] hover:bg-muted transition-colors"
          aria-label="Filtres avancés"
        >
          <SlidersHorizontal size={18} strokeWidth={1.8} />
        </button>
      </div>

      {filtered.length === 0 ? (
        <p className="text-center text-sm text-muted-foreground py-12">
          Aucun post dans cette catégorie.
        </p>
      ) : (
        <div className="flex flex-col gap-3 px-3">
          {filtered.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      )}
    </>
  );
}
