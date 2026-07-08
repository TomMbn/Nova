import { prisma } from "@/lib/prisma";
import { getSessionUserId } from "@/lib/auth";

// Retourne l'abonnement actif de l'utilisateur courant, ou null.
// Les ids retournés sont des BigInt — utiliser serializeBigInt() avant de
// passer le résultat à un Client Component.
export async function getSubscriptionStatus() {
  const userId = await getSessionUserId();
  if (!userId) return null;

  return prisma.subscription.findFirst({
    where: {
      userId,
      status: "ACTIVE",
      OR: [{ endDate: null }, { endDate: { gt: new Date() } }],
    },
    orderBy: { startDate: "desc" },
  });
}
