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

/**
 * Profil public d'un utilisateur : rôle, classe, compétences, expériences.
 * Le hash de mot de passe n'est jamais exposé.
 *
 * Retourne null si l'utilisateur n'existe pas.
 */
export async function getUserById(id: string | number | bigint) {
  return prisma.user.findUnique({
    where: { id: BigInt(id) },
    omit: { passwordHash: true },
    include: {
      role: true,
      currentClass: true,
      skills: { include: { skill: true } },
      experiences: {
        include: { company: true },
        orderBy: { startDate: "desc" },
      },
    },
  });
}

/**
 * Recherche de membres de l'annuaire par nom, compétence, rôle et/ou classe.
 * Tous les filtres sont optionnels et combinés en ET.
 */
export async function searchUsers({
  name,
  skillId,
  roleId,
  classId,
}: {
  name?: string;
  skillId?: string | number | bigint;
  roleId?: string | number | bigint;
  classId?: string | number | bigint;
}) {
  return prisma.user.findMany({
    where: {
      ...(name && { name: { contains: name, mode: "insensitive" } }),
      ...(skillId !== undefined && {
        skills: { some: { skillId: BigInt(skillId) } },
      }),
      ...(roleId !== undefined && { roleId: BigInt(roleId) }),
      ...(classId !== undefined && { currentClassId: BigInt(classId) }),
    },
    omit: { passwordHash: true },
    include: {
      role: true,
      currentClass: true,
      skills: { include: { skill: true } },
    },
    orderBy: { name: "asc" },
  });
}
