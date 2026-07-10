"use client";

import { useState } from "react";
import Link from "next/link";
import type { FeedPost } from "@/queries/posts";
import { splitPostContent } from "@/lib/post-content";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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

// Une couleur de marque par catégorie pour repérer le type de post d'un coup d'œil.
const CATEGORY_STYLES: Record<string, string> = {
  Entraide: "bg-primary/10 text-primary",
  Projet: "bg-accent/10 text-accent",
  Événement: "bg-[#FFD84A]/20 text-[#a37c00]",
  Annonce: "bg-destructive/10 text-destructive",
};
const DEFAULT_CATEGORY_STYLE = "bg-primary/10 text-primary";

export function PostCard({ post }: { post: FeedPost }) {
  const [deleted, setDeleted] = useState(false);
  if (deleted) return null;

  const initials = post.author.name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <article
      id={`post-${post.id}`}
      className="flex flex-col gap-3 scroll-mt-20 rounded-2xl bg-card p-4 shadow-sm"
    >
      {/* Header : avatar + nom/rôle + timestamp */}
      <div className="flex items-start justify-between gap-2">
        <Link
          href={`/profil/${post.author.id}`}
          className="flex min-w-0 items-center gap-3 transition-opacity hover:opacity-80"
        >
          <Avatar size="lg" className="shrink-0">
            <AvatarImage src={post.author.avatarUrl ?? undefined} alt={post.author.name} />
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <p className="truncate text-sm font-bold leading-tight">{post.author.name}</p>
            <p className="truncate text-xs leading-tight text-muted-foreground">
              {post.author.role}
            </p>
          </div>
        </Link>
        <div className="mt-0.5 flex shrink-0 items-center gap-1">
          <span className="text-xs font-semibold text-muted-foreground">
            {relativeTime(post.createdAt)}
          </span>
          {post.isAuthor && (
            <PostCardMenu postId={post.id} onDeleted={() => setDeleted(true)} />
          )}
        </div>
      </div>

      {/* Badges : catégorie (couleur de marque) + thématiques (neutre) */}
      <div className="flex flex-wrap gap-1.5">
        <span
          className={`flex h-6 items-center rounded-lg px-2.5 text-xs font-bold ${
            CATEGORY_STYLES[post.category.name] ?? DEFAULT_CATEGORY_STYLE
          }`}
        >
          {post.category.name}
        </span>
        {post.topics.map((t) => (
          <span
            key={t.id}
            className="flex h-6 items-center rounded-lg bg-muted px-2.5 text-xs font-semibold text-muted-foreground"
          >
            {t.name}
          </span>
        ))}
      </div>

      {/* Contenu texte */}
      {post.content && (() => {
        const { title, body } = splitPostContent(post.content);
        return title ? (
          <div className="flex flex-col gap-1">
            <p className="text-sm font-bold leading-snug">{title}</p>
            <p className="text-sm leading-relaxed text-muted-foreground whitespace-pre-wrap">
              {body}
            </p>
          </div>
        ) : (
          <p className="text-sm leading-relaxed whitespace-pre-wrap">{body}</p>
        );
      })()}

      {/* Média ou sondage */}
      <PostCardMedia media={post.media} poll={post.poll} />

      {/* Actions */}
      <PostCardActions
        postId={post.id}
        authorId={post.author.id}
        isAuthor={post.isAuthor}
        counts={post.counts}
        isLiked={post.isLiked}
        isBookmarked={post.isBookmarked}
      />
    </article>
  );
}
