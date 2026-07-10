import Link from "next/link";
import { redirect } from "next/navigation";
import { ChevronLeft, Pencil } from "lucide-react";

import { getCurrentUserProfile } from "@/queries/users";
import { BottomNav } from "@/components/bottom-nav";
import { buttonVariants } from "@/components/ui/button";

import { ProfileTabs } from "./[id]/profile-tabs";
import { AvatarEditor } from "./avatar-editor";
import { ProfileMenu } from "./profile-menu";

function formatPeriod(start: Date | null, end: Date | null, isCurrent: boolean) {
  const fmt = (d: Date) =>
    new Intl.DateTimeFormat("fr-FR", { month: "short", year: "numeric" }).format(d);
  const from = start ? fmt(start) : null;
  const to = isCurrent ? "Aujourd'hui" : end ? fmt(end) : null;
  if (from && to) return `${from} — ${to}`;
  return from ?? to ?? null;
}

export default async function ProfilPage() {
  const profile = await getCurrentUserProfile();
  if (!profile) redirect("/login");

  const initials = profile.name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className="flex min-h-full flex-1 flex-col">
      <header className="flex items-center justify-between px-4 py-4">
        <Link
          href="/"
          className="flex size-8 items-center justify-center rounded-full bg-muted"
          aria-label="Retour"
        >
          <ChevronLeft size={16} strokeWidth={2} />
        </Link>
        <h2 className="text-base font-bold">Profil</h2>
        <ProfileMenu />
      </header>

      <div className="relative px-4">
        <div className="h-24 rounded-2xl bg-gradient-to-r from-primary/30 via-accent/20 to-[#FFD84A]/30" />
        <div className="absolute -bottom-6 left-8">
          <AvatarEditor avatarUrl={profile.avatarUrl} initials={initials} name={profile.name} />
        </div>
      </div>

      <main className="flex-1 flex flex-col gap-4 px-4 pt-8">
        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-1.5">
            <h1 className="text-lg font-bold">{profile.name}</h1>
            <p className="text-sm text-muted-foreground">
              {profile.role.name}
              {profile.currentClass && ` — ${profile.currentClass.name}`}
            </p>
            {profile.bio && (
              <p className="text-sm text-muted-foreground">{profile.bio}</p>
            )}
          </div>

          <Link
            href="/profil/modifier"
            className={buttonVariants({ className: "h-11 rounded-xl text-sm font-bold" })}
          >
            <Pencil className="size-4" />
            Modifier mon profil
          </Link>
        </div>

        <ProfileTabs
          skills={profile.skills.map(({ skill }) => ({
            id: String(skill.id),
            name: skill.name,
          }))}
          experiences={profile.experiences.map((experience) => ({
            id: String(experience.id),
            label: experience.title
              ? `${experience.title} — ${experience.company.name}`
              : experience.company.name,
            period: formatPeriod(
              experience.startDate,
              experience.endDate,
              experience.isCurrent
            ),
            isCurrent: experience.isCurrent,
          }))}
        />
      </main>
      <BottomNav />
    </div>
  );
}
