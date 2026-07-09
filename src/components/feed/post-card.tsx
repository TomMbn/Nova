import Link from "next/link";
import { User } from "lucide-react";
import type { FeedPost } from "@/queries/posts";
import { PostCardMedia } from "./post-card-media";
import { PostCardActions } from "./post-card-actions";

function relativeTime(date: Date): string {
  const diffMs = Date.now() - date.getTime();
  const diffH = Math.floor(diffMs / 3_600_000);
  if (diffH < 1) return "< 1h";
  if (diffH < 24) return `${diffH}h`;
  const diffD = Math.floor(diffH / 24);
  if (diffD < 7) return `${diffD}j`;
  return `${Math.floor(diffD / 7)}sem`;
}

export function PostCard({ post }: { post: FeedPost }) {
  return (
    <article className="border border-border rounded-[10px] p-[10px] flex flex-col gap-3">
      {/* Header : avatar + nom + rôle + timestamp */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-3 min-w-0">
          <div className="size-[38px] rounded-[10px] bg-muted flex items-center justify-center shrink-0 overflow-hidden">
            {post.author.avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={post.author.avatarUrl}
                alt={post.author.name}
                className="size-full object-cover"
              />
            ) : (
              <User size={20} strokeWidth={1.5} className="text-muted-foreground" />
            )}
          </div>
          <div className="min-w-0">
            <p className="text-xs font-bold leading-tight truncate">{post.author.name}</p>
            <p className="text-xs text-muted-foreground leading-tight truncate">
              {post.author.role}
            </p>
          </div>
        </div>
        <span className="text-xs text-muted-foreground shrink-0 mt-0.5">
          {relativeTime(post.createdAt)}
        </span>
      </div>

      {/* Badges : catégorie + thématiques */}
      <div className="flex gap-2 flex-wrap">
        <span className="px-3 py-1 rounded-[10px] bg-muted text-xs font-bold">
          {post.category.name}
        </span>
        {post.topics.map((t) => (
          <span key={t.id} className="px-3 py-1 rounded-[10px] bg-muted text-xs font-bold">
            {t.name}
          </span>
        ))}
      </div>

      {/* Contenu texte */}
      {post.content && (
        <div className="flex flex-col gap-0.5">
          <p className="text-sm font-bold leading-snug">{post.content}</p>
          <Link
            href={`/posts/${post.id}`}
            className="text-xs text-muted-foreground hover:underline w-fit"
          >
            Détails
          </Link>
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
