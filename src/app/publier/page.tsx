import { redirect } from "next/navigation";

import { getCategories, getTopics, getSkills } from "@/queries/referentials";
import { getCurrentUserProfile } from "@/queries/users";
import { CreatePostForm } from "@/components/publier/create-post-form";
import { TopBar } from "@/components/feed/top-bar";

export default async function PublierPage() {
  const [profile, categories, topics, skills] = await Promise.all([
    getCurrentUserProfile(),
    getCategories(),
    getTopics(),
    getSkills(),
  ]);
  if (!profile) redirect("/login");

  return (
    <>
      <TopBar />
      <CreatePostForm
        author={{
          name: profile.name,
          avatarUrl: profile.avatarUrl,
          role: profile.role.name,
        }}
        categories={categories.map((c) => ({ id: String(c.id), name: c.name }))}
        topics={topics.map((t) => ({ id: String(t.id), name: t.name }))}
        skills={skills.map((s) => ({ id: String(s.id), name: s.name }))}
      />
    </>
  );
}
