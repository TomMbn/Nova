"use server";

import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { toBigInt } from "@/lib/bigint";
import { ok, fail, type ActionResult } from "@/lib/action";

/** Ajoute un commentaire au post pour l'utilisateur courant. */
export async function addComment(
  postId: string | number | bigint,
  content: string
): Promise<ActionResult<{ id: string }>> {
  const user = await requireUser();

  const pid = toBigInt(postId);
  if (pid === null) return fail("Identifiant de post invalide.");

  const trimmed = content.trim();
  if (!trimmed) return fail("Le commentaire ne peut pas être vide.");

  try {
    const comment = await prisma.comment.create({
      data: { content: trimmed, authorId: user.id, postId: pid },
      select: { id: true },
    });
    return ok({ id: String(comment.id) });
  } catch {
    return fail("Impossible d'ajouter le commentaire (post introuvable ?).");
  }
}

/** Supprime un commentaire — réservé à son auteur. */
export async function deleteComment(
  id: string | number | bigint
): Promise<ActionResult<{ id: string }>> {
  const user = await requireUser();

  const commentId = toBigInt(id);
  if (commentId === null) return fail("Identifiant de commentaire invalide.");

  const comment = await prisma.comment.findUnique({
    where: { id: commentId },
    select: { authorId: true },
  });
  if (!comment) return fail("Commentaire introuvable.");
  if (comment.authorId !== user.id)
    return fail("Seul l'auteur peut supprimer ce commentaire.");

  try {
    await prisma.comment.delete({ where: { id: commentId } });
    return ok({ id: String(commentId) });
  } catch {
    return fail("Impossible de supprimer le commentaire.");
  }
}
