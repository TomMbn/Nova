"use client";

import { useState, Suspense } from "react";
import { SlidersHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";
import type { FeedPost } from "@/queries/posts";
import { PostCard } from "./post-card";
import { PublishToast } from "@/components/ui/publish-toast";

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
      <div className="flex items-center gap-2 border-b border-border bg-background px-[14px] py-[10px]">
        <div className="flex flex-1 gap-2 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveId(null)}
            className={cn(
              "shrink-0 whitespace-nowrap rounded-full px-3.5 py-1.5 text-xs font-bold transition-colors",
              activeId === null
                ? "bg-foreground text-background"
                : "bg-muted text-foreground"
            )}
          >
            Tous
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveId(activeId === cat.id ? null : cat.id)}
              className={cn(
                "shrink-0 whitespace-nowrap rounded-full px-3.5 py-1.5 text-xs font-bold transition-colors",
                activeId === cat.id
                  ? "bg-foreground text-background"
                  : "bg-muted text-foreground"
              )}
            >
              {cat.name}
            </button>
          ))}
        </div>
        <button
          className="shrink-0 flex items-center justify-center size-8 rounded-xl hover:bg-muted transition-colors"
          aria-label="Filtres avancés"
        >
          <SlidersHorizontal size={18} strokeWidth={1.8} />
        </button>
      </div>

      <Suspense>
        <PublishToast />
      </Suspense>

      {filtered.length === 0 ? (
        <p className="bg-muted/40 py-12 text-center text-sm text-muted-foreground">
          Aucun post dans cette catégorie.
        </p>
      ) : (
        <div className="flex flex-col gap-3 bg-muted/40 p-3">
          {filtered.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      )}
    </>
  );
}
