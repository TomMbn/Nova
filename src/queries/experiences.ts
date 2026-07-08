import { prisma } from "@/lib/prisma";
import { toBigInt } from "@/lib/bigint";

/**
 * Expériences d'un utilisateur avec l'entreprise associée, triées de la plus
 * récente à la plus ancienne.
 *
 * Retourne null si userId est invalide.
 * Les ids retournés sont des BigInt — utiliser serializeBigInt() avant de
 * passer le résultat à un Client Component.
 */
export async function getExperiencesByUser(userId: string | number | bigint) {
  const uid = toBigInt(userId);
  if (uid === null) return null;

  return prisma.experience.findMany({
    where: { userId: uid },
    include: { company: true },
    orderBy: { startDate: "desc" },
  });
}
