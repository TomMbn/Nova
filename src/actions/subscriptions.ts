"use server";

import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { ok, fail, type ActionResult } from "@/lib/action";

// Durée d'un abonnement mensuel en ms
const SUBSCRIPTION_DURATION_MS = 30 * 24 * 60 * 60 * 1000;

// Active un abonnement vidéo pour l'utilisateur courant.
// Le paiement CB est mocké — aucune intégration de paiement réelle.
// Si un abonnement actif existe déjà, retourne une erreur.
export async function activateSubscription(): Promise<
  ActionResult<{ id: string }>
> {
  const user = await requireUser();

  const existing = await prisma.subscription.findFirst({
    where: {
      userId: user.id,
      status: "ACTIVE",
      OR: [{ endDate: null }, { endDate: { gt: new Date() } }],
    },
  });
  if (existing) return fail("Un abonnement actif existe déjà.");

  try {
    const startDate = new Date();
    const endDate = new Date(startDate.getTime() + SUBSCRIPTION_DURATION_MS);

    const subscription = await prisma.subscription.create({
      data: { userId: user.id, status: "ACTIVE", startDate, endDate },
      select: { id: true },
    });
    return ok({ id: String(subscription.id) });
  } catch {
    return fail("Impossible d'activer l'abonnement.");
  }
}

// Résilie l'abonnement actif de l'utilisateur courant.
export async function cancelSubscription(): Promise<ActionResult<void>> {
  const user = await requireUser();

  const subscription = await prisma.subscription.findFirst({
    where: {
      userId: user.id,
      status: "ACTIVE",
      OR: [{ endDate: null }, { endDate: { gt: new Date() } }],
    },
  });
  if (!subscription) return fail("Aucun abonnement actif à résilier.");

  try {
    await prisma.subscription.update({
      where: { id: subscription.id },
      data: { status: "CANCELLED", endDate: new Date() },
    });
    return ok(undefined);
  } catch {
    return fail("Impossible de résilier l'abonnement.");
  }
}
