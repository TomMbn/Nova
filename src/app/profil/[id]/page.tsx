import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ChevronLeft, MessageCircle, MoreHorizontal } from "lucide-react";

import { getUserById } from "@/queries/users";
import { getSessionUserId } from "@/lib/auth";
import { buttonVariants } from "@/components/ui/button";
import { BottomNav } from "@/components/bottom-nav";

import { ProfileTabs } from "./profile-tabs";

function formatPeriod(start: Date | null, end: Date | null, isCurrent: boolean) {
  const fmt = (d: Date) =>
    new Intl.DateTimeFormat("fr-FR", { month: "short", year: "numeric" }).format(d);
  const from = start ? fmt(start) : null;
  const to = isCurrent ? "Aujourd'hui" : end ? fmt(end) : null;
  if (from && to) return `${from} — ${to}`;
  return from ?? to ?? null;
}

export default async function PublicProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const sessionUserId = await getSessionUserId();
  if (sessionUserId !== null && String(sessionUserId) === id) {
    redirect("/profil");
  }

  const profile = await getUserById(id);
  if (!profile) notFound();

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
          href="/recherche"
          className="flex size-8 items-center justify-center rounded-full bg-muted"
          aria-label="Retour"
        >
          <ChevronLeft size={16} strokeWidth={2} />
        </Link>
        <h2 className="text-base font-bold">Profil</h2>
        <button
          type="button"
          className="flex size-8 items-center justify-center rounded-full bg-muted"
          aria-label="Plus d'options"
        >
          <MoreHorizontal size={16} strokeWidth={2} />
        </button>
      </header>

      <div className="relative px-4">
        <div className="h-24 rounded-2xl bg-gradient-to-r from-primary/30 via-accent/20 to-[#FFD84A]/30" />
        <div className="absolute -bottom-6 left-8 size-16 overflow-hidden rounded-2xl ring-4 ring-background">
          {profile.avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={profile.avatarUrl}
              alt={profile.name}
              className="size-full object-cover"
            />
          ) : (
            <div className="flex size-full items-center justify-center bg-muted text-lg font-semibold text-muted-foreground">
              {initials}
            </div>
          )}
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
            href={`/messages/${id}`}
            className={buttonVariants({ className: "h-11 rounded-xl text-sm font-bold" })}
          >
            <MessageCircle className="size-4" />
            Envoyer un message
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
