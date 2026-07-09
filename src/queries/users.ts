import { prisma } from "@/lib/prisma";
import { getSessionUserId } from "@/lib/auth";
import { toBigInt } from "@/lib/bigint";

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
  const userId = await getSessionUserId();
  if (!userId) return null;

  return prisma.user.findUnique({
    where: { id: userId },
    omit: { passwordHash: true },
    include: {
      role: true,
      currentClass: true,
      skills: { include: { skill: true } },
      followedTopics: { include: { topic: true } },
      followedCategories: { include: { category: true } },
      experiences: {
        include: { company: true },
        orderBy: { startDate: "desc" },
      },
    },
  });
}

/**
 * Profil public d'un utilisateur : rôle, classe, compétences, expériences.
 * Le hash de mot de passe n'est jamais exposé.
 *
 * Retourne null si l'utilisateur n'existe pas ou si l'id est invalide.
 * Les ids retournés sont des BigInt — utiliser serializeBigInt() avant de
 * passer le résultat à un Client Component.
 */
export async function getUserById(id: string | number | bigint) {
  const uid = toBigInt(id);
  if (uid === null) return null;

  return prisma.user.findUnique({
    where: { id: uid },
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
 * Les ids des filtres invalides sont ignorés (filtre désactivé).
 * Les ids retournés sont des BigInt — utiliser serializeBigInt() avant de
 * passer le résultat à un Client Component.
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
  const parsedSkillId = skillId !== undefined ? toBigInt(skillId) : null;
  const parsedRoleId = roleId !== undefined ? toBigInt(roleId) : null;
  const parsedClassId = classId !== undefined ? toBigInt(classId) : null;

  return prisma.user.findMany({
    where: {
      ...(name && { name: { contains: name, mode: "insensitive" } }),
      ...(parsedSkillId !== null && {
        skills: { some: { skillId: parsedSkillId } },
      }),
      ...(parsedRoleId !== null && { roleId: parsedRoleId }),
      ...(parsedClassId !== null && { currentClassId: parsedClassId }),
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
