"use server";

import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { toBigInt } from "@/lib/bigint";
import { ok, fail, type ActionResult } from "@/lib/action";

// Laisse un avis sur une session présentielle.
// L'utilisateur doit avoir une inscription avec statut CONFIRMED et ne pas
// avoir déjà laissé d'avis sur cette session.
export async function leaveReview(
  sessionId: string | number | bigint,
  rating: number,
  comment: string
): Promise<ActionResult<{ id: string }>> {
  const user = await requireUser();

  if (!Number.isInteger(rating) || rating < 1 || rating > 5)
    return fail("La note doit être un entier entre 1 et 5.");

  const trimmedComment = comment.trim();
  if (!trimmedComment) return fail("Le commentaire est requis.");

  const sid = toBigInt(sessionId);
  if (sid === null) return fail("Identifiant de session invalide.");

  const registration = await prisma.formationRegistration.findUnique({
    where: { userId_sessionId: { userId: user.id, sessionId: sid } },
  });
  if (!registration || registration.status !== "CONFIRMED")
    return fail("Vous devez être inscrit et confirmé à cette session pour laisser un avis.");

  const existing = await prisma.review.findUnique({
    where: { userId_sessionId: { userId: user.id, sessionId: sid } },
  });
  if (existing) return fail("Vous avez déjà laissé un avis pour cette session.");

  try {
    const review = await prisma.review.create({
      data: { userId: user.id, sessionId: sid, rating, comment: trimmedComment },
      select: { id: true },
    });
    return ok({ id: String(review.id) });
  } catch {
    return fail("Impossible d'enregistrer l'avis.");
  }
}
