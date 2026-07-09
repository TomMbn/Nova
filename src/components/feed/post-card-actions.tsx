"use client";

import { useState } from "react";
import { Heart, MessageCircle, Bookmark } from "lucide-react";
import { likePost, unlikePost, bookmarkPost, unbookmarkPost } from "@/actions/posts";
import { cn } from "@/lib/utils";

type Props = {
  postId: string;
  counts: { likes: number; comments: number };
  isLiked: boolean;
  isBookmarked: boolean;
};

export function PostCardActions({ postId, counts, isLiked, isBookmarked }: Props) {
  const [liked, setLiked] = useState(isLiked);
  const [likeCount, setLikeCount] = useState(counts.likes);
  const [bookmarked, setBookmarked] = useState(isBookmarked);

  async function toggleLike() {
    const prev = liked;
    setLiked(!prev);
    setLikeCount((c) => (prev ? c - 1 : c + 1));
    if (prev) await unlikePost(postId);
    else await likePost(postId);
  }

  async function toggleBookmark() {
    const prev = bookmarked;
    setBookmarked(!prev);
    if (prev) await unbookmarkPost(postId);
    else await bookmarkPost(postId);
  }

  return (
    <div className="flex items-center gap-4">
      <button
        onClick={toggleLike}
        className="flex items-center gap-1.5 active:opacity-60 transition-opacity"
        aria-label={liked ? "Retirer le like" : "Aimer"}
      >
        <Heart
          size={20}
          strokeWidth={1.8}
          className={cn("transition-colors", liked ? "fill-current text-red-500" : "")}
        />
        <span className="text-sm font-bold">{likeCount}</span>
      </button>

      <button
        className="flex items-center gap-1.5 active:opacity-60 transition-opacity"
        aria-label="Commenter"
      >
        <MessageCircle size={20} strokeWidth={1.8} />
        <span className="text-sm font-bold">{counts.comments}</span>
      </button>

      <button
        onClick={toggleBookmark}
        className={cn(
          "ml-auto flex items-center gap-1.5 active:opacity-60 transition-opacity",
          bookmarked ? "text-foreground" : "text-foreground"
        )}
        aria-label={bookmarked ? "Retirer des favoris" : "Enregistrer"}
      >
        <Bookmark
          size={20}
          strokeWidth={1.8}
          className={cn("transition-colors", bookmarked && "fill-current")}
        />
        <span className="text-sm font-bold">Enregistrer</span>
      </button>
    </div>
  );
}
