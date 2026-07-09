"use client";

import { useState } from "react";
import Link from "next/link";
import { Heart, MessageCircle, Bookmark, Send } from "lucide-react";
import { likePost, unlikePost, bookmarkPost, unbookmarkPost } from "@/actions/posts";
import { cn } from "@/lib/utils";

type Props = {
  postId: string;
  authorId: string;
  isAuthor: boolean;
  counts: { likes: number; comments: number };
  isLiked: boolean;
  isBookmarked: boolean;
};

export function PostCardActions({
  postId,
  authorId,
  isAuthor,
  counts,
  isLiked,
  isBookmarked,
}: Props) {
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
    <div className="flex items-center gap-1">
      <button
        onClick={toggleLike}
        className={cn(
          "flex items-center gap-1.5 rounded-full px-3 py-1.5 transition-colors active:opacity-60",
          liked ? "bg-destructive/10 text-destructive" : "text-muted-foreground"
        )}
        aria-label={liked ? "Retirer le like" : "Aimer"}
      >
        <Heart size={18} strokeWidth={1.8} className={cn(liked && "fill-current")} />
        <span className="text-xs font-bold">{likeCount}</span>
      </button>

      <button
        className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-muted-foreground transition-colors active:opacity-60"
        aria-label="Commenter"
      >
        <MessageCircle size={18} strokeWidth={1.8} />
        <span className="text-xs font-bold">{counts.comments}</span>
      </button>

      <button
        onClick={toggleBookmark}
        className={cn(
          "flex items-center justify-center rounded-full p-1.5 transition-colors active:opacity-60",
          bookmarked ? "bg-accent/10 text-accent" : "text-muted-foreground"
        )}
        aria-label={bookmarked ? "Retirer des favoris" : "Enregistrer"}
      >
        <Bookmark size={18} strokeWidth={1.8} className={cn(bookmarked && "fill-current")} />
      </button>

      {!isAuthor && (
        <Link
          href={`/messages/${authorId}`}
          className="ml-auto flex items-center gap-1.5 rounded-full bg-primary px-4 py-1.5 text-xs font-bold text-primary-foreground transition-opacity active:opacity-80"
        >
          <Send size={14} strokeWidth={2} />
          Message
        </Link>
      )}
    </div>
  );
}
