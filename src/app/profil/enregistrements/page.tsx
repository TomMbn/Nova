import { redirect } from "next/navigation";

import { getBookmarkedPosts } from "@/queries/posts";
import { getSessionUserId } from "@/lib/auth";
import { TopBar } from "@/components/feed/top-bar";
import { BottomNav } from "@/components/bottom-nav";
import { FeedList } from "@/components/feed/feed-list";

export default async function EnregistrementsPage() {
  const userId = await getSessionUserId();
  if (userId === null) redirect("/login");

  const posts = await getBookmarkedPosts();

  return (
    <div className="flex flex-col min-h-full pb-20">
      <TopBar />
      <main className="flex-1 pt-1">
        <h1 className="px-3 pb-3 text-lg font-semibold">Posts enregistrés</h1>
        <FeedList posts={posts} />
      </main>
      <BottomNav />
    </div>
  );
}
