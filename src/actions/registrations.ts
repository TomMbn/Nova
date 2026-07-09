"use server";

import { prisma } from "@/lib/prisma";
import { getSessionUserId } from "@/lib/auth";
import { toBigInt } from "@/lib/bigint";
import { ok, fail, type ActionResult } from "@/lib/action";

// Retourne l'inscription CONFIRMED de l'utilisateur courant pour une session, ou null.
export async function getMyRegistration(
  sessionId: string
): Promise<{ id: string } | null> {
  const userId = await getSessionUserId();
  if (!userId) return null;

  const sid = toBigInt(sessionId);
  if (sid === null) return null;

  const reg = await prisma.formationRegistration.findFirst({
    where: { userId, sessionId: sid, status: "CONFIRMED" },
    select: { id: true },
  });
  return reg ? { id: String(reg.id) } : null;
}

// Inscrit l'utilisateur courant (alumni uniquement) à une session présentielle.
// Renvoie l'URL CPF de la session pour redirection côté client.
export async function registerForSession(
  sessionId: string | number | bigint
): Promise<ActionResult<{ id: string; cpfUrl: string }>> {
  const userId = await getSessionUserId();
  if (!userId) return fail("Non authentifié.");

  const sid = toBigInt(sessionId);
  if (sid === null) return fail("Identifiant de session invalide.");

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { role: true },
  });
  if (!user) return fail("Utilisateur introuvable.");
  if (user.role.name !== "Alumni")
    return fail("Les formations en présentiel sont réservées aux alumni.");

  const session = await prisma.formationSession.findUnique({ where: { id: sid } });
  if (!session) return fail("Session introuvable.");
  if (session.status !== "OPEN") return fail("Cette session n'accepte plus d'inscriptions.");

  const existing = await prisma.formationRegistration.findUnique({
    where: { userId_sessionId: { userId, sessionId: sid } },
  });

  if (existing) {
    if (existing.status === "CONFIRMED")
      return ok({ id: String(existing.id), cpfUrl: session.cpfUrl });
    // CANCELLED → réactiver
    const updated = await prisma.formationRegistration.update({
      where: { id: existing.id },
      data: { status: "CONFIRMED" },
      select: { id: true },
    });
    return ok({ id: String(updated.id), cpfUrl: session.cpfUrl });
  }

  try {
    const registration = await prisma.formationRegistration.create({
      data: { userId, sessionId: sid, status: "CONFIRMED" },
      select: { id: true },
    });
    return ok({ id: String(registration.id), cpfUrl: session.cpfUrl });
  } catch {
    return fail("Impossible de créer l'inscription.");
  }
}

// Annule l'inscription de l'utilisateur courant et renvoie l'URL CPF.
export async function cancelRegistration(
  registrationId: string | number | bigint
): Promise<ActionResult<{ cpfUrl: string }>> {
  const userId = await getSessionUserId();
  if (!userId) return fail("Non authentifié.");

  const rid = toBigInt(registrationId);
  if (rid === null) return fail("Identifiant invalide.");

  const registration = await prisma.formationRegistration.findUnique({
    where: { id: rid },
    include: { session: true },
  });
  if (!registration) return fail("Inscription introuvable.");
  if (registration.userId !== userId) return fail("Non autorisé.");
  if (registration.status === "CANCELLED") return fail("Inscription déjà annulée.");

  try {
    await prisma.formationRegistration.update({
      where: { id: rid },
      data: { status: "CANCELLED" },
    });
    return ok({ cpfUrl: registration.session.cpfUrl });
  } catch {
    return fail("Impossible d'annuler l'inscription.");
  }
}
