import { getCategories, getTopics, getSkills } from "@/queries/referentials";
import { CreatePostForm } from "@/components/publier/create-post-form";
import { TopBar } from "@/components/feed/top-bar";

export default async function PublierPage() {
  const [categories, topics, skills] = await Promise.all([
    getCategories(),
    getTopics(),
    getSkills(),
  ]);

  return (
    <>
      <TopBar />
      <CreatePostForm
        categories={categories.map((c) => ({ id: String(c.id), name: c.name }))}
        topics={topics.map((t) => ({ id: String(t.id), name: t.name }))}
        skills={skills.map((s) => ({ id: String(s.id), name: s.name }))}
      />
    </>
  );
}
