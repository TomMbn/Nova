"use client";

import { useState } from "react";
import Link from "next/link";
import { User } from "lucide-react";
import type { FeedPost } from "@/queries/posts";
import { PostCardMedia } from "./post-card-media";
import { PostCardActions } from "./post-card-actions";
import { PostCardMenu } from "./post-card-menu";

function relativeTime(date: Date): string {
  const diffMs = Date.now() - date.getTime();
  const diffH = Math.floor(diffMs / 3_600_000);
  if (diffH < 1) {
    const diffMin = Math.floor(diffMs / 60_000);
    return diffMin < 1 ? "à l'instant" : `${diffMin}min`;
  }
  if (diffH < 24) return `${diffH}h`;
  const diffD = Math.floor(diffH / 24);
  if (diffD < 7) return `${diffD}j`;
  return `${Math.floor(diffD / 7)}sem`;
}

export function PostCard({ post }: { post: FeedPost }) {
  const [deleted, setDeleted] = useState(false);
  if (deleted) return null;

  return (
    <article className="border border-border rounded-[10px] p-[10px] flex flex-col gap-[10px]">

      {/* Header : avatar + nom/rôle + timestamp */}
      <div className="flex items-start justify-between gap-2">
        <Link
          href={`/profil/${post.author.id}`}
          className="flex items-center gap-3 min-w-0 hover:opacity-80 transition-opacity"
        >
          <div className="size-[38px] rounded-[10px] bg-muted flex items-center justify-center shrink-0 overflow-hidden">
            {post.author.avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={post.author.avatarUrl} alt={post.author.name} className="size-full object-cover" />
            ) : (
              <User size={20} strokeWidth={1.5} className="text-muted-foreground" />
            )}
          </div>
          <div className="min-w-0">
            <p className="text-[12px] font-bold leading-tight truncate">{post.author.name}</p>
            <p className="text-[12px] font-normal leading-tight text-foreground truncate">
              {post.author.role}
            </p>
          </div>
        </Link>
        <div className="flex items-center gap-1 shrink-0 mt-0.5">
          <span className="text-[12px] font-bold">{relativeTime(post.createdAt)}</span>
          {post.isAuthor && (
            <PostCardMenu postId={post.id} onDeleted={() => setDeleted(true)} />
          )}
        </div>
      </div>

      {/* Badges : catégorie (muted) + thématiques (léger, distinct de la catégorie) */}
      <div className="flex gap-2 flex-wrap">
        <span className="px-[10px] py-1 h-6 rounded-[10px] bg-muted text-[12px] font-bold leading-none flex items-center">
          {post.category.name}
        </span>
        {post.topics.map((t) => (
          <span key={t.id} className="px-[10px] py-1 h-6 rounded-[10px] bg-foreground/5 text-[12px] font-bold leading-none flex items-center">
            {t.name}
          </span>
        ))}
      </div>

      {/* Contenu texte + lien Détails */}
      {post.content && (
        <div className="flex flex-col gap-1">
          <p className="text-[14px] font-bold leading-snug">{post.content}</p>
        </div>
      )}

      {/* Média ou sondage */}
      <PostCardMedia media={post.media} poll={post.poll} />

      {/* Actions */}
      <PostCardActions
        postId={post.id}
        counts={post.counts}
        isLiked={post.isLiked}
        isBookmarked={post.isBookmarked}
      />
    </article>
  );
}
