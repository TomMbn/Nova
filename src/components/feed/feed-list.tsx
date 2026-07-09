import type { FeedPost } from "@/queries/posts";
import { PostCard } from "./post-card";

export function FeedList({ posts }: { posts: FeedPost[] }) {
  if (posts.length === 0) {
    return (
      <p className="text-center text-sm text-muted-foreground py-12">
        Aucun post pour le moment.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-3 px-3">
      {posts.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}
    </div>
  );
}
