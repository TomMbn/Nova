import { redirect } from "next/navigation";

import { prisma } from "@/lib/prisma";
import { getPendingSignup } from "@/lib/pending-signup";

import { RoleForm } from "./role-form";
import { StepProgress } from "./step-progress";

export default async function InscriptionRolePage() {
  const pending = await getPendingSignup();
  if (!pending) redirect("/login");

  const roles = await prisma.role.findMany({ orderBy: { id: "asc" } });

  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col gap-8 px-6 py-10">
      <StepProgress step={1} total={3} />

      <div className="flex flex-col gap-1.5">
        <h1 className="text-2xl font-bold tracking-tight">Bienvenue sur Nova</h1>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Choisissez le profil qui vous correspond pour personnaliser votre
          expérience.
        </p>
      </div>

      <RoleForm roles={roles.map((r) => ({ id: String(r.id), name: r.name }))} />
    </main>
  );
}
