import { redirect } from "next/navigation";
import { LogOut } from "lucide-react";

import { getCurrentUserProfile } from "@/queries/users";
import { BottomNav } from "@/components/bottom-nav";
import { TopBar } from "@/components/feed/top-bar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

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
    <div className="flex flex-col min-h-full pb-20">
      <TopBar />
      <main className="flex-1 flex flex-col gap-4 px-4 pt-1">
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-6 text-center">
            <Avatar size="lg" className="size-20">
              <AvatarImage src={profile.avatarUrl ?? undefined} alt={profile.name} />
              <AvatarFallback className="text-xl">{initials}</AvatarFallback>
            </Avatar>
            <div className="flex flex-col gap-1">
              <h1 className="text-lg font-semibold">{profile.name}</h1>
              <p className="text-sm text-muted-foreground">{profile.email}</p>
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
          </CardContent>
        </Card>

        {profile.skills.length > 0 && (
          <Card>
            <CardContent className="flex flex-col gap-2">
              <h2 className="text-sm font-medium">Compétences</h2>
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

        <form action="/logout" method="POST">
          <Button
            type="submit"
            variant="destructive"
            className="h-11 w-full rounded-xl"
          >
            <LogOut className="size-4" />
            Se déconnecter
          </Button>
        </form>
      </main>
      <BottomNav />
    </div>
  );
}
