import { redirect } from "next/navigation";

import { prisma } from "@/lib/prisma";
import { getPendingSignup } from "@/lib/pending-signup";
import { Button } from "@/components/ui/button";

import { chooseTopics, skipTopics } from "../actions";
import { StepProgress } from "../step-progress";

export default async function SpecialitesPage() {
  const pending = await getPendingSignup();
  if (!pending) redirect("/login");
  if (!pending.roleId) redirect("/inscription");

  const topics = await prisma.topic.findMany({ orderBy: { name: "asc" } });

  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col gap-8 px-6 py-10">
      <StepProgress step={2} total={3} />

      <div className="flex flex-col gap-1 text-center">
        <h1 className="text-xl font-semibold">Quelles sont vos spécialités ?</h1>
        <p className="text-sm text-muted-foreground">
          Sélectionnez-en une ou plusieurs.
        </p>
      </div>

      <form action={chooseTopics} className="flex flex-col gap-6">
        <div className="flex flex-col divide-y divide-border rounded-xl border border-border">
          {topics.map((topic) => (
            <label
              key={String(topic.id)}
              className="flex items-center gap-3 px-4 py-3 text-sm"
            >
              <input
                type="checkbox"
                name="topicIds"
                value={String(topic.id)}
                className="size-4 rounded border-input"
              />
              {topic.name}
            </label>
          ))}
        </div>

        <Button
          type="submit"
          className="h-11 rounded-xl bg-foreground text-background hover:bg-foreground/90"
        >
          Continuer
        </Button>
      </form>

      <form action={skipTopics}>
        <button
          type="submit"
          className="w-full text-center text-sm text-muted-foreground underline-offset-4 hover:underline"
        >
          Passer cette étape
        </button>
      </form>
    </main>
  );
}
