import { redirect } from "next/navigation";

import { prisma } from "@/lib/prisma";
import { getPendingSignup } from "@/lib/pending-signup";

import { StepProgress } from "../step-progress";
import { ProfileForm } from "./profile-form";

export default async function ProfilInscriptionPage() {
  const pending = await getPendingSignup();
  if (!pending) redirect("/login");
  if (!pending.roleId) redirect("/inscription");

  const role = await prisma.role.findUnique({
    where: { id: BigInt(pending.roleId) },
  });

  const classes =
    role?.name === "Élève actuel"
      ? await prisma.class.findMany({ orderBy: { name: "asc" } })
      : [];

  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col gap-8 px-6 py-10">
      <StepProgress step={3} total={3} />

      <div className="flex flex-col gap-1.5">
        <h1 className="text-2xl font-bold tracking-tight">
          Complétez votre profil
        </h1>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Ces informations seront visibles par la communauté.
        </p>
      </div>

      <ProfileForm
        classes={classes.map((c) => ({ id: String(c.id), name: c.name }))}
      />
    </main>
  );
}
