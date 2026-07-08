import { prisma } from "@/lib/prisma";
import { getSessionUserId } from "@/lib/auth";
import { toBigInt } from "@/lib/bigint";

// Les ids retournés sont des BigInt — utiliser serializeBigInt() avant de
// passer le résultat à un Client Component.

export async function getReviewsBySession(sessionId: string | number | bigint) {
  const sid = toBigInt(sessionId);
  if (sid === null) return null;

  return prisma.review.findMany({
    where: { sessionId: sid },
    include: { user: { select: { id: true, name: true, avatarUrl: true } } },
    orderBy: { createdAt: "desc" },
  });
}

// Review laissée par l'utilisateur courant sur une session, ou null.
export async function getMyReview(sessionId: string | number | bigint) {
  const userId = await getSessionUserId();
  if (!userId) return null;

  const sid = toBigInt(sessionId);
  if (sid === null) return null;

  return prisma.review.findUnique({
    where: { userId_sessionId: { userId, sessionId: sid } },
  });
}
