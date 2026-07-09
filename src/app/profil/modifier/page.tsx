import { redirect } from "next/navigation";

import { prisma } from "@/lib/prisma";
import { getCurrentUserProfile } from "@/queries/users";
import { TopBar } from "@/components/feed/top-bar";

import { EditProfileForm } from "./edit-profile-form";

export default async function ModifierProfilPage() {
  const profile = await getCurrentUserProfile();
  if (!profile) redirect("/login");

  const [topics, classes] = await Promise.all([
    prisma.topic.findMany({ orderBy: { name: "asc" } }),
    profile.role.name === "Élève actuel"
      ? prisma.class.findMany({ orderBy: { name: "asc" } })
      : Promise.resolve([]),
  ]);

  const currentCompanyExperience = profile.experiences.find(
    (e) => e.isCurrent && e.title === null
  );

  return (
    <div className="flex flex-col min-h-full pb-20">
      <TopBar />
      <main className="mx-auto flex w-full max-w-md flex-1 flex-col gap-6 px-4 pt-1">
        <h1 className="text-lg font-semibold">Modifier mon profil</h1>

        <EditProfileForm
          name={profile.name}
          bio={profile.bio ?? ""}
          skills={profile.skills.map((s) => s.skill.name).join(", ")}
          company={currentCompanyExperience?.company.name ?? ""}
          topics={topics.map((t) => ({ id: String(t.id), name: t.name }))}
          selectedTopicIds={profile.followedTopics.map((t) => String(t.topicId))}
          classes={classes.map((c) => ({ id: String(c.id), name: c.name }))}
          currentClassId={
            profile.currentClassId ? String(profile.currentClassId) : ""
          }
        />
      </main>
    </div>
  );
}
