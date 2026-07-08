import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

/**
 * Profil complet de l'utilisateur connecté : rôle, classe, compétences,
 * thématiques et catégories suivies. Le hash de mot de passe n'est jamais
 * exposé.
 *
 * Retourne null si personne n'est authentifié.
 *
 * Les ids sont des BigInt : penser à `serializeBigInt()` avant de passer le
 * résultat à un Client Component.
 */
export async function getCurrentUserProfile() {
  const current = await getCurrentUser();
  if (!current) return null;

  return prisma.user.findUnique({
    where: { id: current.id },
    omit: { passwordHash: true },
    include: {
      role: true,
      currentClass: true,
      skills: { include: { skill: true } },
      followedTopics: { include: { topic: true } },
      followedCategories: { include: { category: true } },
    },
  });
}
