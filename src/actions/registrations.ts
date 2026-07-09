"use server";

import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { toBigInt } from "@/lib/bigint";
import { ok, fail, type ActionResult } from "@/lib/action";

// Inscrit l'utilisateur courant (alumni uniquement) à une session présentielle.
// Renvoie l'URL CPF de la session pour redirection côté client.
export async function registerForSession(
  sessionId: string | number | bigint
): Promise<ActionResult<{ id: string; cpfUrl: string }>> {
  const user = await requireUser();

  const sid = toBigInt(sessionId);
  if (sid === null) return fail("Identifiant de session invalide.");

  // Vérification du rôle Alumni en base (requireUser ne charge pas le rôle).
  const userWithRole = await prisma.user.findUnique({
    where: { id: user.id },
    include: { role: true },
  });
  if (userWithRole?.role.name !== "Alumni")
    return fail("Les formations en présentiel sont réservées aux alumni.");

  const session = await prisma.formationSession.findUnique({ where: { id: sid } });
  if (!session) return fail("Session introuvable.");
  if (session.status !== "OPEN") return fail("Cette session n'accepte plus d'inscriptions.");

  const existing = await prisma.formationRegistration.findUnique({
    where: { userId_sessionId: { userId: user.id, sessionId: sid } },
  });
  if (existing) return fail("Vous êtes déjà inscrit à cette session.");

  try {
    const registration = await prisma.formationRegistration.create({
      data: { userId: user.id, sessionId: sid, status: "CONFIRMED" },
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
  const user = await requireUser();

  const rid = toBigInt(registrationId);
  if (rid === null) return fail("Identifiant invalide.");

  const registration = await prisma.formationRegistration.findUnique({
    where: { id: rid },
    include: { session: true },
  });
  if (!registration) return fail("Inscription introuvable.");
  if (registration.userId !== user.id) return fail("Non autorisé.");
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
