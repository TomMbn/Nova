"use server";

import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { toBigInt } from "@/lib/bigint";
import { ok, fail, type ActionResult } from "@/lib/action";

/**
 * Envoie un message privé de l'utilisateur connecté vers `receiverId`.
 * Un utilisateur ne peut pas s'envoyer de message à lui-même (CHECK
 * `message.sender_id <> receiver_id` du MCD, revalidée ici côté app car non
 * représentable dans le schema Prisma).
 */
export async function sendMessage(
  receiverId: string | number | bigint,
  content: string
): Promise<ActionResult<{ id: string }>> {
  const user = await requireUser();

  const receiverBigInt = toBigInt(receiverId);
  if (receiverBigInt === null) return fail("Destinataire invalide.");

  if (receiverBigInt === user.id) {
    return fail("Impossible de s'envoyer un message à soi-même.");
  }

  const trimmed = content.trim();
  if (!trimmed) return fail("Le message ne peut pas être vide.");

  try {
    const message = await prisma.message.create({
      data: {
        senderId: user.id,
        receiverId: receiverBigInt,
        content: trimmed,
      },
      select: { id: true },
    });
    return ok({ id: String(message.id) });
  } catch {
    return fail("Destinataire introuvable.");
  }
}

/**
 * Marque comme lus tous les messages non lus reçus de `senderId` par
 * l'utilisateur connecté.
 */
export async function markAsRead(
  senderId: string | number | bigint
): Promise<ActionResult<{ count: number }>> {
  const user = await requireUser();

  const senderBigInt = toBigInt(senderId);
  if (senderBigInt === null) return fail("Expéditeur invalide.");

  const { count } = await prisma.message.updateMany({
    where: {
      senderId: senderBigInt,
      receiverId: user.id,
      readAt: null,
    },
    data: { readAt: new Date() },
  });

  return ok({ count });
}
