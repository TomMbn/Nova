"use server";

import bcrypt from "bcryptjs";

import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { ok, fail, type ActionResult } from "@/lib/action";

const BCRYPT_ROUNDS = 10;

// Convertit une valeur de formulaire (string | number | bigint) en BigInt.
// Renvoie null si la valeur est absente/vide/invalide.
function toBigInt(value: unknown): bigint | null {
  if (value === null || value === undefined || value === "") return null;
  try {
    return BigInt(value as string | number | bigint);
  } catch {
    return null;
  }
}

function toBigIntList(ids: (string | number | bigint)[]): bigint[] {
  const out: bigint[] = [];
  for (const id of ids) {
    const parsed = toBigInt(id);
    if (parsed !== null) out.push(parsed);
  }
  // Déduplique pour éviter les doublons de clé primaire composite.
  return [...new Set(out)];
}

/**
 * Crée un nouvel utilisateur (mot de passe hashé bcrypt).
 * Champs FormData attendus : email, password, name, roleId,
 * currentClassId (optionnel).
 */
export async function register(
  formData: FormData
): Promise<ActionResult<{ id: string }>> {
  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();
  const password = String(formData.get("password") ?? "");
  const name = String(formData.get("name") ?? "").trim();
  const roleId = toBigInt(formData.get("roleId"));
  const currentClassId = toBigInt(formData.get("currentClassId"));

  if (!email || !email.includes("@")) return fail("Email invalide.");
  if (password.length < 8)
    return fail("Le mot de passe doit contenir au moins 8 caractères.");
  if (!name) return fail("Le nom est requis.");
  if (roleId === null) return fail("Le rôle est requis.");

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return fail("Un compte existe déjà avec cet email.");

  const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);

  try {
    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        name,
        roleId,
        currentClassId,
      },
      select: { id: true },
    });
    return ok({ id: String(user.id) });
  } catch {
    // Ex. roleId / currentClassId qui ne référencent aucune ligne existante.
    return fail("Impossible de créer le compte (rôle ou classe invalide).");
  }
}

/**
 * Met à jour le profil de l'utilisateur courant.
 * Champs FormData : bio, avatarUrl, currentClassId (tous optionnels).
 * Une valeur vide efface le champ correspondant.
 */
export async function updateProfile(
  formData: FormData
): Promise<ActionResult<{ id: string }>> {
  const user = await requireUser();

  const bioRaw = formData.get("bio");
  const avatarUrlRaw = formData.get("avatarUrl");
  const currentClassId = toBigInt(formData.get("currentClassId"));

  const bio = bioRaw === null ? undefined : String(bioRaw).trim() || null;
  const avatarUrl =
    avatarUrlRaw === null ? undefined : String(avatarUrlRaw).trim() || null;

  try {
    await prisma.user.update({
      where: { id: user.id },
      data: {
        // undefined => champ non fourni, on ne le touche pas.
        ...(bio !== undefined && { bio }),
        ...(avatarUrl !== undefined && { avatarUrl }),
        // currentClassId absent du form => on ne modifie pas ; présent mais
        // vide => on détache la classe (null).
        ...(formData.has("currentClassId") && { currentClassId }),
      },
    });
    return ok({ id: String(user.id) });
  } catch {
    return fail("Impossible de mettre à jour le profil (classe invalide ?).");
  }
}

/**
 * Remplace intégralement les compétences de l'utilisateur courant.
 */
export async function updateSkills(
  skillIds: (string | number | bigint)[]
): Promise<ActionResult<{ count: number }>> {
  const user = await requireUser();
  const ids = toBigIntList(skillIds);

  try {
    await prisma.$transaction([
      prisma.userSkill.deleteMany({ where: { userId: user.id } }),
      prisma.userSkill.createMany({
        data: ids.map((skillId) => ({ userId: user.id, skillId })),
      }),
    ]);
    return ok({ count: ids.length });
  } catch {
    return fail("Impossible de mettre à jour les compétences.");
  }
}

/**
 * Remplace intégralement les thématiques suivies (préférences de notif).
 */
export async function updateFollowedTopics(
  topicIds: (string | number | bigint)[]
): Promise<ActionResult<{ count: number }>> {
  const user = await requireUser();
  const ids = toBigIntList(topicIds);

  try {
    await prisma.$transaction([
      prisma.followedTopic.deleteMany({ where: { userId: user.id } }),
      prisma.followedTopic.createMany({
        data: ids.map((topicId) => ({ userId: user.id, topicId })),
      }),
    ]);
    return ok({ count: ids.length });
  } catch {
    return fail("Impossible de mettre à jour les thématiques suivies.");
  }
}

/**
 * Remplace intégralement les catégories suivies.
 */
export async function updateFollowedCategories(
  categoryIds: (string | number | bigint)[]
): Promise<ActionResult<{ count: number }>> {
  const user = await requireUser();
  const ids = toBigIntList(categoryIds);

  try {
    await prisma.$transaction([
      prisma.followedCategory.deleteMany({ where: { userId: user.id } }),
      prisma.followedCategory.createMany({
        data: ids.map((categoryId) => ({ userId: user.id, categoryId })),
      }),
    ]);
    return ok({ count: ids.length });
  } catch {
    return fail("Impossible de mettre à jour les catégories suivies.");
  }
}
