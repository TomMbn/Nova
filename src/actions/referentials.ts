"use server";

import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { ok, fail, type ActionResult } from "@/lib/action";

export async function createSkillIfNotExists(
  name: string
): Promise<ActionResult<{ id: string; name: string }>> {
  try {
    await requireUser();

    const trimmed = name.trim();
    if (!trimmed) return fail("Le nom de la compétence est requis");

    const skill = await prisma.skill.upsert({
      where: { name: trimmed },
      update: {},
      create: { name: trimmed },
    });

    return ok({ id: String(skill.id), name: skill.name });
  } catch (e) {
    return fail(e instanceof Error ? e.message : "Erreur inconnue");
  }
}

export async function createCompanyIfNotExists(
  name: string
): Promise<ActionResult<{ id: string; name: string }>> {
  try {
    await requireUser();

    const trimmed = name.trim();
    if (!trimmed) return fail("Le nom de l'entreprise est requis");

    const company = await prisma.company.upsert({
      where: { name: trimmed },
      update: {},
      create: { name: trimmed },
    });

    return ok({ id: String(company.id), name: company.name });
  } catch (e) {
    return fail(e instanceof Error ? e.message : "Erreur inconnue");
  }
}
