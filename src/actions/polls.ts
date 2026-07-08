"use server";

import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { toBigInt } from "@/lib/bigint";
import { ok, fail, type ActionResult } from "@/lib/action";

/**
 * Crée un sondage sur un post existant.
 * Réservé à l'auteur du post. Un post ne peut avoir qu'un seul sondage.
 */
export async function createPoll(
  postId: string | number | bigint,
  poll: { question: string; options: string[] }
): Promise<ActionResult<{ id: string }>> {
  const user = await requireUser();
  const pid = toBigInt(postId);
  if (pid === null) return fail("Identifiant de post invalide.");

  const question = poll.question.trim();
  if (!question) return fail("La question du sondage est requise.");

  const options = poll.options.map((o) => o.trim()).filter(Boolean);
  if (options.length < 2)
    return fail("Un sondage nécessite au moins 2 options.");

  const post = await prisma.post.findUnique({
    where: { id: pid },
    select: { authorId: true, poll: { select: { id: true } } },
  });
  if (!post) return fail("Post introuvable.");
  if (post.authorId !== user.id)
    return fail("Seul l'auteur peut modifier ce post.");
  if (post.poll) return fail("Ce post a déjà un sondage.");

  try {
    const created = await prisma.$transaction(async (tx) => {
      const p = await tx.poll.create({
        data: { question, postId: pid },
        select: { id: true },
      });
      await tx.pollOption.createMany({
        data: options.map((label) => ({ label, pollId: p.id })),
      });
      return p;
    });
    return ok({ id: String(created.id) });
  } catch {
    return fail("Impossible de créer le sondage.");
  }
}

/**
 * Vote pour une option d'un sondage.
 * Un utilisateur ne peut voter qu'une seule fois par sondage (clé composite
 * userId+pollId). Un second appel avec une option différente remplace le vote.
 */
export async function vote(
  pollId: string | number | bigint,
  optionId: string | number | bigint
): Promise<ActionResult<void>> {
  const user = await requireUser();
  const pid = toBigInt(pollId);
  const oid = toBigInt(optionId);
  if (pid === null) return fail("Identifiant de sondage invalide.");
  if (oid === null) return fail("Identifiant d'option invalide.");

  // Vérifie que l'option appartient bien au sondage (évite un vote croisé).
  const option = await prisma.pollOption.findFirst({
    where: { id: oid, pollId: pid },
    select: { id: true },
  });
  if (!option) return fail("Option introuvable pour ce sondage.");

  try {
    await prisma.vote.upsert({
      where: { userId_pollId: { userId: user.id, pollId: pid } },
      update: { optionId: oid },
      create: { userId: user.id, pollId: pid, optionId: oid },
    });
    return ok(undefined);
  } catch {
    return fail("Impossible d'enregistrer le vote.");
  }
}
