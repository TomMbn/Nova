import { redirect } from "next/navigation";

import { prisma } from "@/lib/prisma";
import { getPendingSignup } from "@/lib/pending-signup";

import { skipTopics } from "../actions";
import { StepProgress } from "../step-progress";
import { TopicsForm } from "./topics-form";

export default async function SpecialitesPage() {
  const pending = await getPendingSignup();
  if (!pending) redirect("/login");
  if (!pending.roleId) redirect("/inscription");

  const topics = await prisma.topic.findMany({ orderBy: { name: "asc" } });

  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col gap-8 px-6 py-10">
      <StepProgress step={2} total={3} />

      <div className="flex flex-col gap-1.5">
        <h1 className="text-2xl font-bold tracking-tight">Vos spécialités</h1>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Sélectionnez-en une ou plusieurs pour personnaliser votre expérience.
        </p>
      </div>

      <TopicsForm topics={topics.map((t) => ({ id: String(t.id), name: t.name }))} />

      <form action={skipTopics}>
        <button
          type="submit"
          className="w-full text-center text-xs text-muted-foreground hover:underline"
        >
          Passer cette étape
        </button>
      </form>
    </main>
  );
}
