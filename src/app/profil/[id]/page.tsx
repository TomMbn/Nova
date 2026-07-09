import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft, GraduationCap, MessageCircle } from "lucide-react";

import { getUserById } from "@/queries/users";
import { getSessionUserId } from "@/lib/auth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { BottomNav } from "@/components/bottom-nav";

const SKILLS_PREVIEW_COUNT = 7;

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

  const visibleSkills = profile.skills.slice(0, SKILLS_PREVIEW_COUNT);
  const hiddenSkillsCount = profile.skills.length - visibleSkills.length;

  return (
    <div className="flex flex-col min-h-full pb-20">
      <header className="flex items-center gap-3 px-[14px] py-[15px] bg-background sticky top-0 z-40">
        <Link
          href="/recherche"
          className="flex items-center justify-center size-[40px] rounded-[10px] hover:bg-muted transition-colors"
          aria-label="Retour"
        >
          <ArrowLeft size={20} strokeWidth={1.8} />
        </Link>
        <h1 className="flex-1 text-center text-sm font-bold pr-[40px]">Profil</h1>
      </header>

      <main className="flex-1 flex flex-col gap-4 px-4 pt-1">
        <Card>
          <CardContent className="flex flex-col gap-4">
            <div className="flex items-start gap-3">
              <Avatar size="lg" className="size-16">
                <AvatarImage src={profile.avatarUrl ?? undefined} alt={profile.name} />
                <AvatarFallback className="text-lg">{initials}</AvatarFallback>
              </Avatar>
              <div className="flex flex-col gap-1.5 pt-0.5">
                <h2 className="text-lg font-semibold leading-tight">{profile.name}</h2>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="secondary">{profile.role.name}</Badge>
                </div>
                {profile.currentClass && (
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <GraduationCap className="size-3.5 shrink-0" />
                    <span>{profile.currentClass.name}</span>
                  </div>
                )}
              </div>
            </div>

            {profile.bio && (
              <p className="text-sm text-muted-foreground">{profile.bio}</p>
            )}

            <Link
              href="/messages"
              className={buttonVariants({ className: "h-10 rounded-xl" })}
            >
              <MessageCircle className="size-4" />
              Envoyer un message
            </Link>
          </CardContent>
        </Card>

        {profile.skills.length > 0 && (
          <Card>
            <CardContent className="flex flex-col gap-2">
              <h3 className="text-sm font-medium">Compétences</h3>
              <div className="flex flex-wrap gap-2">
                {visibleSkills.map(({ skill }) => (
                  <Badge key={String(skill.id)} variant="outline">
                    {skill.name}
                  </Badge>
                ))}
                {hiddenSkillsCount > 0 && (
                  <Badge variant="outline">+{hiddenSkillsCount}</Badge>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {profile.experiences.length > 0 && (
          <Card>
            <CardContent className="flex flex-col gap-3">
              <h3 className="text-sm font-medium">Parcours</h3>
              <div className="flex flex-col">
                {profile.experiences.map((experience, index) => {
                  const isLast = index === profile.experiences.length - 1;
                  const period = formatPeriod(
                    experience.startDate,
                    experience.endDate,
                    experience.isCurrent
                  );

                  return (
                    <div key={String(experience.id)} className="flex gap-3">
                      <div className="flex flex-col items-center">
                        <span className="mt-1.5 size-2 rounded-full bg-foreground shrink-0" />
                        {!isLast && <span className="w-px flex-1 bg-border" />}
                      </div>
                      <div className="flex-1 flex flex-col gap-0.5 pb-4">
                        <div className="flex items-start justify-between gap-2">
                          <span className="text-sm font-medium">
                            {experience.title
                              ? `${experience.title} — ${experience.company.name}`
                              : experience.company.name}
                          </span>
                          {period && (
                            <span className="text-xs text-muted-foreground shrink-0">
                              {period}
                            </span>
                          )}
                        </div>
                        {experience.isCurrent && (
                          <Badge variant="secondary" className="w-fit">
                            Actuel
                          </Badge>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}
      </main>
      <BottomNav />
    </div>
  );
}
