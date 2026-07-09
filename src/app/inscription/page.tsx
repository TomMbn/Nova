import { redirect } from "next/navigation";
import { GraduationCap, Award, Presentation, Users } from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { prisma } from "@/lib/prisma";
import { getPendingSignup } from "@/lib/pending-signup";

import { chooseRole } from "./actions";
import { StepProgress } from "./step-progress";

const ROLE_INFO: Record<string, { description: string; icon: LucideIcon }> = {
  "Élève actuel": {
    description: "Vous êtes actuellement en formation.",
    icon: GraduationCap,
  },
  Alumni: {
    description: "Vous avez déjà étudié ici.",
    icon: Award,
  },
  Intervenant: {
    description: "Vous intervenez ou formez des étudiants.",
    icon: Presentation,
  },
  "Équipe pédagogique": {
    description: "Vous faites partie de l'équipe pédagogique.",
    icon: Users,
  },
};

export default async function InscriptionRolePage() {
  const pending = await getPendingSignup();
  if (!pending) redirect("/login");

  const roles = await prisma.role.findMany({ orderBy: { id: "asc" } });

  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col gap-8 px-6 py-10">
      <StepProgress step={1} total={3} />

      <div className="flex flex-col gap-1 text-center">
        <h1 className="text-xl font-semibold">Bienvenue sur Nova</h1>
        <p className="text-sm text-muted-foreground">
          Choisissez le profil qui vous correspond pour personnaliser votre
          expérience.
        </p>
      </div>

      <div className="flex flex-col gap-3">
        {roles.map((role) => {
          const info = ROLE_INFO[role.name];
          const Icon = info?.icon ?? Users;

          return (
            <form key={String(role.id)} action={chooseRole}>
              <input type="hidden" name="roleId" value={String(role.id)} />
              <button
                type="submit"
                className="flex w-full items-center gap-3 rounded-xl border border-border px-4 py-3 text-left transition-colors hover:bg-muted"
              >
                <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted">
                  <Icon className="size-5" />
                </span>
                <span className="flex flex-col">
                  <span className="text-sm font-medium">{role.name}</span>
                  {info?.description && (
                    <span className="text-xs text-muted-foreground">
                      {info.description}
                    </span>
                  )}
                </span>
              </button>
            </form>
          );
        })}
      </div>
    </main>
  );
}
