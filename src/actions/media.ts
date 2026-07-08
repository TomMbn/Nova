"use server";

import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { toBigInt } from "@/lib/bigint";
import { ok, fail, type ActionResult } from "@/lib/action";

// CHECK IN ('IMAGE', 'VIDEO') contraint côté DB mais non représentable en
// Prisma — on valide donc ici (cf. CLAUDE.md).
const MEDIA_TYPES = ["IMAGE", "VIDEO"];

/**
 * Attache un média à un post existant.
 * Réservé à l'auteur du post. La position est calculée automatiquement
 * (dernier index + 1).
 */
export async function attachMedia(
  postId: string | number | bigint,
  media: { url: string; type: string }
): Promise<ActionResult<{ id: string }>> {
  const user = await requireUser();
  const pid = toBigInt(postId);
  if (pid === null) return fail("Identifiant de post invalide.");

  const type = media.type.trim().toUpperCase();
  if (!MEDIA_TYPES.includes(type))
    return fail(`Type de média invalide : ${type || "manquant"}.`);

  const url = media.url.trim();
  if (!url) return fail("L'URL du média est requise.");

  const post = await prisma.post.findUnique({
    where: { id: pid },
    select: { authorId: true },
  });
  if (!post) return fail("Post introuvable.");
  if (post.authorId !== user.id)
    return fail("Seul l'auteur peut modifier ce post.");

  try {
    const last = await prisma.media.findFirst({
      where: { postId: pid },
      orderBy: { position: "desc" },
      select: { position: true },
    });
    const position = last ? last.position + 1 : 0;

    const created = await prisma.media.create({
      data: { postId: pid, url, type, position },
      select: { id: true },
    });
    return ok({ id: String(created.id) });
  } catch {
    return fail("Impossible d'attacher le média.");
  }
}

/**
 * Supprime un média.
 * Réservé à l'auteur du post associé.
 */
export async function deleteMedia(
  id: string | number | bigint
): Promise<ActionResult<void>> {
  const user = await requireUser();
  const mediaId = toBigInt(id);
  if (mediaId === null) return fail("Identifiant de média invalide.");

  const media = await prisma.media.findUnique({
    where: { id: mediaId },
    select: { post: { select: { authorId: true } } },
  });
  if (!media) return fail("Média introuvable.");
  if (media.post.authorId !== user.id)
    return fail("Seul l'auteur peut supprimer ce média.");

  try {
    await prisma.media.delete({ where: { id: mediaId } });
    return ok(undefined);
  } catch {
    return fail("Impossible de supprimer le média.");
  }
}
