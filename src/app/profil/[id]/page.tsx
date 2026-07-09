import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft, MessageCircle } from "lucide-react";

import { getUserById } from "@/queries/users";
import { getSessionUserId } from "@/lib/auth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";

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
    <div className="flex flex-col min-h-full pb-20">
      <header className="flex items-center gap-3 px-[14px] py-[15px] bg-background sticky top-0 z-40">
        <Link
          href="/recherche"
          className="flex items-center justify-center size-[40px] rounded-[10px] hover:bg-muted transition-colors"
          aria-label="Retour"
        >
          <ArrowLeft size={20} strokeWidth={1.8} />
        </Link>
        <h1 className="text-sm font-bold">Profil</h1>
      </header>

      <main className="flex-1 flex flex-col gap-4 px-4 pt-1">
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-6 text-center">
            <Avatar size="lg" className="size-20">
              <AvatarImage src={profile.avatarUrl ?? undefined} alt={profile.name} />
              <AvatarFallback className="text-xl">{initials}</AvatarFallback>
            </Avatar>
            <div className="flex flex-col gap-1">
              <h2 className="text-lg font-semibold">{profile.name}</h2>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-2">
              <Badge variant="secondary">{profile.role.name}</Badge>
              {profile.currentClass && (
                <Badge variant="secondary">{profile.currentClass.name}</Badge>
              )}
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
                {profile.skills.map(({ skill }) => (
                  <Badge key={String(skill.id)} variant="outline">
                    {skill.name}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {profile.experiences.length > 0 && (
          <Card>
            <CardContent className="flex flex-col gap-3">
              <h3 className="text-sm font-medium">Parcours</h3>
              <div className="flex flex-col gap-3">
                {profile.experiences.map((experience) => (
                  <div key={String(experience.id)} className="flex flex-col gap-0.5">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm font-medium">
                        {experience.title
                          ? `${experience.title} — ${experience.company.name}`
                          : experience.company.name}
                      </span>
                      {experience.isCurrent && (
                        <Badge variant="secondary">Actuel</Badge>
                      )}
                    </div>
                    {formatPeriod(
                      experience.startDate,
                      experience.endDate,
                      experience.isCurrent
                    ) && (
                      <span className="text-xs text-muted-foreground">
                        {formatPeriod(
                          experience.startDate,
                          experience.endDate,
                          experience.isCurrent
                        )}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
