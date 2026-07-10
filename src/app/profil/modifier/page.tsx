import Link from "next/link";
import { redirect } from "next/navigation";
import { ChevronLeft } from "lucide-react";

import { prisma } from "@/lib/prisma";
import { getCurrentUserProfile } from "@/queries/users";

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
    <div className="flex min-h-full flex-1 flex-col pb-20">
      <header className="flex items-center gap-3 px-4 py-4">
        <Link
          href="/profil"
          className="flex size-8 items-center justify-center rounded-full bg-muted"
          aria-label="Retour"
        >
          <ChevronLeft size={16} strokeWidth={2} />
        </Link>
        <h1 className="text-base font-bold">Modifier mon profil</h1>
      </header>

      <main className="mx-auto flex w-full max-w-md flex-1 flex-col gap-6 px-4">
        <EditProfileForm
          name={profile.name}
          bio={profile.bio ?? ""}
          skills={profile.skills.map((s) => s.skill.name)}
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
