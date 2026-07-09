import { prisma } from "@/lib/prisma";
import { getSessionUserId } from "@/lib/auth";
import { toBigInt } from "@/lib/bigint";

// Les ids retournés sont des BigInt — utiliser serializeBigInt() avant de
// passer le résultat à un Client Component.

export function getSessions() {
  return prisma.formationSession.findMany({
    where: { status: "OPEN" },
    include: {
      topics: { include: { topic: true } },
      _count: { select: { registrations: { where: { status: "CONFIRMED" } } } },
    },
    orderBy: { date: "asc" },
  });
}

export async function getSessionById(id: string | number | bigint) {
  const sid = toBigInt(id);
  if (sid === null) return null;

  return prisma.formationSession.findUnique({
    where: { id: sid },
    include: {
      topics: { include: { topic: true } },
      _count: { select: { registrations: { where: { status: "CONFIRMED" } } } },
    },
  });
}

// Sessions auxquelles l'utilisateur courant est inscrit (tous statuts).
export async function getMyRegistrations() {
  const userId = await getSessionUserId();
  if (!userId) return null;

  return prisma.formationRegistration.findMany({
    where: { userId },
    include: { session: true },
    orderBy: { createdAt: "desc" },
  });
}
