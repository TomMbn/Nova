"use server";

import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { toBigInt, toBigIntList } from "@/lib/bigint";
import { ok, fail, type ActionResult } from "@/lib/action";

// Le MCD contraint media.type par un CHECK IN ('IMAGE', 'VIDEO') — non
// représentable en Prisma, on valide donc ici (cf. CLAUDE.md).
const MEDIA_TYPES = ["IMAGE", "VIDEO"];

/**
 * Crée un post pour l'utilisateur courant, avec ses thématiques, ses médias et
 * son éventuel sondage, en une seule transaction.
 *
 * Champs FormData :
 *  - content        (optionnel) texte du post
 *  - categoryId     (requis)    catégorie unique du post
 *  - eventDate      (optionnel) date d'événement (ISO)
 *  - location       (optionnel) lieu
 *  - topicIds       (0..n)      thématiques — champs répétés `topicIds`
 *  - mediaUrl[]     (0..n)      urls des médias — champs répétés `mediaUrl`
 *  - mediaType[]    (0..n)      types alignés par index sur `mediaUrl`
 *  - pollQuestion   (optionnel) question du sondage
 *  - pollOption[]   (0..n)      options — champs répétés `pollOption` (>= 2)
 *
 * Un post doit contenir au moins un texte, un média ou un sondage.
 */
export async function createPost(
  formData: FormData
): Promise<ActionResult<{ id: string }>> {
  const user = await requireUser();

  const content = String(formData.get("content") ?? "").trim() || null;
  const location = String(formData.get("location") ?? "").trim() || null;
  const categoryId = toBigInt(formData.get("categoryId"));
  if (categoryId === null) return fail("La catégorie est requise.");

  const eventDateRaw = String(formData.get("eventDate") ?? "").trim();
  let eventDate: Date | null = null;
  if (eventDateRaw) {
    const parsed = new Date(eventDateRaw);
    if (Number.isNaN(parsed.getTime()))
      return fail("Date d'événement invalide.");
    eventDate = parsed;
  }

  const topicIds = toBigIntList(
    formData.getAll("topicIds").map((v) => String(v))
  );

  // Médias : tableaux parallèles mediaUrl[] / mediaType[], position = index.
  const mediaUrls = formData.getAll("mediaUrl").map((v) => String(v).trim());
  const mediaTypes = formData
    .getAll("mediaType")
    .map((v) => String(v).trim().toUpperCase());
  const media: { url: string; type: string; position: number }[] = [];
  for (let i = 0; i < mediaUrls.length; i++) {
    const url = mediaUrls[i];
    if (!url) continue;
    const type = mediaTypes[i] ?? "";
    if (!MEDIA_TYPES.includes(type))
      return fail(`Type de média invalide : ${type || "manquant"}.`);
    media.push({ url, type, position: media.length });
  }

  // Sondage : présent dès qu'une question ou une option est fournie.
  const pollQuestion = String(formData.get("pollQuestion") ?? "").trim();
  const pollOptions = formData
    .getAll("pollOption")
    .map((v) => String(v).trim())
    .filter(Boolean);
  let poll: { question: string; options: string[] } | null = null;
  if (pollQuestion || pollOptions.length > 0) {
    if (!pollQuestion) return fail("La question du sondage est requise.");
    if (pollOptions.length < 2)
      return fail("Un sondage nécessite au moins 2 options.");
    poll = { question: pollQuestion, options: pollOptions };
  }

  if (!content && media.length === 0 && !poll)
    return fail("Le post doit contenir du texte, un média ou un sondage.");

  try {
    const post = await prisma.$transaction(async (tx) => {
      const created = await tx.post.create({
        data: { content, location, eventDate, authorId: user.id, categoryId },
        select: { id: true },
      });

      if (topicIds.length > 0) {
        await tx.postTopic.createMany({
          data: topicIds.map((topicId) => ({ postId: created.id, topicId })),
        });
      }

      if (media.length > 0) {
        await tx.media.createMany({
          data: media.map((m) => ({ ...m, postId: created.id })),
        });
      }

      if (poll) {
        const createdPoll = await tx.poll.create({
          data: { question: poll.question, postId: created.id },
          select: { id: true },
        });
        await tx.pollOption.createMany({
          data: poll.options.map((label) => ({
            label,
            pollId: createdPoll.id,
          })),
        });
      }

      return created;
    });

    return ok({ id: String(post.id) });
  } catch (e) {
    // Peut être une FK invalide (categoryId/topicId), une violation de CHECK
    // (media.type) ou une erreur transitoire du pooler Neon : on logge la cause
    // réelle et on renvoie un message neutre.
    console.error("createPost failed:", e);
    return fail("Impossible de créer le post.");
  }
}

/**
 * Supprime un post — réservé à son auteur.
 *
 * Les FK sont en `onDelete: NoAction` (base Neon existante) : on supprime donc
 * explicitement les enfants dans l'ordre inverse des dépendances avant le post.
 */
export async function deletePost(
  id: string | number | bigint
): Promise<ActionResult<{ id: string }>> {
  const user = await requireUser();
  const postId = toBigInt(id);
  if (postId === null) return fail("Identifiant de post invalide.");

  const post = await prisma.post.findUnique({
    where: { id: postId },
    select: { authorId: true },
  });
  if (!post) return fail("Post introuvable.");
  if (post.authorId !== user.id)
    return fail("Seul l'auteur peut supprimer ce post.");

  try {
    await prisma.$transaction(async (tx) => {
      const poll = await tx.poll.findUnique({
        where: { postId },
        select: { id: true },
      });
      if (poll) {
        await tx.vote.deleteMany({ where: { pollId: poll.id } });
        await tx.pollOption.deleteMany({ where: { pollId: poll.id } });
        await tx.poll.delete({ where: { id: poll.id } });
      }
      await tx.postLike.deleteMany({ where: { postId } });
      await tx.bookmark.deleteMany({ where: { postId } });
      await tx.comment.deleteMany({ where: { postId } });
      await tx.postTopic.deleteMany({ where: { postId } });
      await tx.media.deleteMany({ where: { postId } });
      await tx.post.delete({ where: { id: postId } });
    });
    return ok({ id: String(postId) });
  } catch {
    return fail("Impossible de supprimer le post.");
  }
}

/** Aime un post (idempotent — ne double pas si déjà aimé). */
export async function likePost(
  id: string | number | bigint
): Promise<ActionResult<void>> {
  const user = await requireUser();
  const postId = toBigInt(id);
  if (postId === null) return fail("Identifiant de post invalide.");

  try {
    await prisma.postLike.upsert({
      where: { userId_postId: { userId: user.id, postId } },
      update: {},
      create: { userId: user.id, postId },
    });
    return ok(undefined);
  } catch {
    return fail("Impossible d'aimer ce post.");
  }
}

/** Retire son like d'un post (idempotent). */
export async function unlikePost(
  id: string | number | bigint
): Promise<ActionResult<void>> {
  const user = await requireUser();
  const postId = toBigInt(id);
  if (postId === null) return fail("Identifiant de post invalide.");

  try {
    await prisma.postLike.deleteMany({ where: { userId: user.id, postId } });
    return ok(undefined);
  } catch {
    return fail("Impossible de retirer le like.");
  }
}

/** Enregistre un post en favori (idempotent). */
export async function bookmarkPost(
  id: string | number | bigint
): Promise<ActionResult<void>> {
  const user = await requireUser();
  const postId = toBigInt(id);
  if (postId === null) return fail("Identifiant de post invalide.");

  try {
    await prisma.bookmark.upsert({
      where: { userId_postId: { userId: user.id, postId } },
      update: {},
      create: { userId: user.id, postId },
    });
    return ok(undefined);
  } catch {
    return fail("Impossible d'enregistrer ce post en favori.");
  }
}

/** Retire un post des favoris (idempotent). */
export async function unbookmarkPost(
  id: string | number | bigint
): Promise<ActionResult<void>> {
  const user = await requireUser();
  const postId = toBigInt(id);
  if (postId === null) return fail("Identifiant de post invalide.");

  try {
    await prisma.bookmark.deleteMany({ where: { userId: user.id, postId } });
    return ok(undefined);
  } catch {
    return fail("Impossible de retirer ce favori.");
  }
}
