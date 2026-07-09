import { getCategories, getTopics, getSkills } from "@/queries/referentials";
import { getCurrentUserProfile } from "@/queries/users";
import { CreatePostForm } from "@/components/publier/create-post-form";

export default async function PublierPage() {
  const [categories, topics, skills, profile] = await Promise.all([
    getCategories(),
    getTopics(),
    getSkills(),
    getCurrentUserProfile(),
  ]);

  if (!profile) {
    return (
      <div className="flex flex-col items-center justify-center min-h-full gap-2 px-6 text-center">
        <p className="text-sm text-muted-foreground">
          Connectez-vous pour créer une publication.
        </p>
      </div>
    );
  }

  return (
    <CreatePostForm
      categories={categories.map((c) => ({ id: String(c.id), name: c.name }))}
      topics={topics.map((t) => ({ id: String(t.id), name: t.name }))}
      skills={skills.map((s) => ({ id: String(s.id), name: s.name }))}
      author={{
        id: String(profile.id),
        name: profile.name,
        avatarUrl: profile.avatarUrl,
        role: profile.role.name,
      }}
    />
  );
}
