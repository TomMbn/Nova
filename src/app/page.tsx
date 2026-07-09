import { getFeed } from "@/queries/posts";
import { getCategories } from "@/queries/referentials";
import { BottomNav } from "@/components/bottom-nav";
import { TopBar } from "@/components/feed/top-bar";
import { FeedWithFilter } from "@/components/feed/feed-with-filter";

export default async function Home() {
  const [{ posts }, categories] = await Promise.all([
    getFeed(),
    getCategories(),
  ]);

  const serializedCategories = categories.map((c) => ({
    id: String(c.id),
    name: c.name,
  }));

  return (
    <>
      <div className="flex flex-col min-h-full pb-20">
        <TopBar />
        <main className="flex-1 pt-1">
          <FeedWithFilter
            initialPosts={posts}
            categories={serializedCategories}
          />
        </main>
      </div>
      <BottomNav />
    </>
  );
}
