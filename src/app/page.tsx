import { Suspense } from "react";
import { getFeed } from "@/queries/posts";
import { getCategories } from "@/queries/referentials";
import { BottomNav } from "@/components/bottom-nav";
import { TopBar } from "@/components/feed/top-bar";
import { CategoryFilter } from "@/components/feed/category-filter";
import { FeedList } from "@/components/feed/feed-list";

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ categoryId?: string }>;
}) {
  const { categoryId } = await searchParams;

  const [{ posts }, categories] = await Promise.all([
    getFeed({ categoryId }),
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

        <Suspense>
          <CategoryFilter categories={serializedCategories} />
        </Suspense>

        <main className="flex-1 pt-1">
          <FeedList posts={posts} />
        </main>
      </div>

      <BottomNav />
    </>
  );
}
