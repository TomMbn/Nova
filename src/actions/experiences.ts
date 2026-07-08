"use server";

import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { ok, fail, type ActionResult } from "@/lib/action";

function toBigInt(value: unknown): bigint | null {
  if (value === null || value === undefined || value === "") return null;
  try {
    return BigInt(value as string | number | bigint);
  } catch {
    return null;
  }
}

function toDate(value: unknown): Date | null {
  if (value === null || value === undefined || value === "") return null;
  const date = new Date(String(value));
  return Number.isNaN(date.getTime()) ? null : date;
}

/**
 * Crée une expérience pour l'utilisateur courant.
 * Champs FormData attendus : title, companyId, startDate, endDate,
 * isCurrent (optionnels sauf companyId).
 */
export async function addExperience(
  formData: FormData
): Promise<ActionResult<{ id: string }>> {
  const user = await requireUser();

  const companyId = toBigInt(formData.get("companyId"));
  if (companyId === null) return fail("L'entreprise est requise.");

  const title = String(formData.get("title") ?? "").trim() || null;
  const startDate = toDate(formData.get("startDate"));
  const endDate = toDate(formData.get("endDate"));
  const isCurrent = formData.get("isCurrent") === "true";

  try {
    const experience = await prisma.experience.create({
      data: {
        userId: user.id,
        companyId,
        title,
        startDate,
        endDate,
        isCurrent,
      },
      select: { id: true },
    });
    return ok({ id: String(experience.id) });
  } catch {
    return fail("Impossible de créer l'expérience (entreprise invalide ?).");
  }
}

/**
 * Met à jour une expérience de l'utilisateur courant.
 * Vérifie que l'expérience appartient bien à l'utilisateur.
 */
export async function updateExperience(
  id: string | number | bigint,
  formData: FormData
): Promise<ActionResult<{ id: string }>> {
  const user = await requireUser();
  const experienceId = toBigInt(id);
  if (experienceId === null) return fail("Identifiant invalide.");

  const experience = await prisma.experience.findUnique({
    where: { id: experienceId },
  });
  if (!experience) return fail("Expérience introuvable.");
  if (experience.userId !== user.id) return fail("Non autorisé.");

  const companyId = toBigInt(formData.get("companyId"));
  const title = formData.has("title")
    ? String(formData.get("title")).trim() || null
    : undefined;
  const startDate = formData.has("startDate")
    ? toDate(formData.get("startDate"))
    : undefined;
  const endDate = formData.has("endDate")
    ? toDate(formData.get("endDate"))
    : undefined;
  const isCurrent = formData.has("isCurrent")
    ? formData.get("isCurrent") === "true"
    : undefined;

  try {
    await prisma.experience.update({
      where: { id: experienceId },
      data: {
        ...(companyId !== null && { companyId }),
        ...(title !== undefined && { title }),
        ...(startDate !== undefined && { startDate }),
        ...(endDate !== undefined && { endDate }),
        ...(isCurrent !== undefined && { isCurrent }),
      },
    });
    return ok({ id: String(experienceId) });
  } catch {
    return fail("Impossible de mettre à jour l'expérience.");
  }
}

/**
 * Supprime une expérience de l'utilisateur courant.
 * Vérifie que l'expérience appartient bien à l'utilisateur.
 */
export async function deleteExperience(
  id: string | number | bigint
): Promise<ActionResult<{ id: string }>> {
  const user = await requireUser();
  const experienceId = toBigInt(id);
  if (experienceId === null) return fail("Identifiant invalide.");

  const experience = await prisma.experience.findUnique({
    where: { id: experienceId },
  });
  if (!experience) return fail("Expérience introuvable.");
  if (experience.userId !== user.id) return fail("Non autorisé.");

  await prisma.experience.delete({ where: { id: experienceId } });
  return ok({ id: String(experienceId) });
}
