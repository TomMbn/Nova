"use server";

import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { toBigInt } from "@/lib/bigint";
import { ok, fail, type ActionResult } from "@/lib/action";

const VALID_ROLES = ["PARTICIPANT", "ANIMATEUR", "JURY"] as const;
const VALID_PAYMENT_METHODS = ["CB", "CREDIT"] as const;

type Role = (typeof VALID_ROLES)[number];
type PaymentMethod = (typeof VALID_PAYMENT_METHODS)[number];

// Inscrit l'utilisateur courant à une session présentielle.
// - role : PARTICIPANT | ANIMATEUR | JURY
// - paymentMethod : CB (mocké) | CREDIT — ignoré pour ANIMATEUR et JURY
//   (leur participation est gratuite, ils n'ont pas à payer)
export async function registerForSession(
  sessionId: string | number | bigint,
  role: string,
  paymentMethod?: string
): Promise<ActionResult<{ id: string }>> {
  const user = await requireUser();

  if (!VALID_ROLES.includes(role as Role))
    return fail("Rôle invalide. Valeurs acceptées : PARTICIPANT, ANIMATEUR, JURY.");

  const sid = toBigInt(sessionId);
  if (sid === null) return fail("Identifiant de session invalide.");

  const session = await prisma.formationSession.findUnique({ where: { id: sid } });
  if (!session) return fail("Session introuvable.");
  if (session.status !== "OPEN") return fail("Cette session n'accepte plus d'inscriptions.");

  // Vérifie que l'utilisateur n'est pas déjà inscrit à cette session.
  const existing = await prisma.formationRegistration.findUnique({
    where: { userId_sessionId: { userId: user.id, sessionId: sid } },
  });
  if (existing) return fail("Vous êtes déjà inscrit à cette session.");

  // Pour les participants, valide le mode de paiement (fast-fail avant DB).
  let resolvedPaymentMethod: string | null = null;
  if (role === "PARTICIPANT") {
    if (!paymentMethod || !VALID_PAYMENT_METHODS.includes(paymentMethod as PaymentMethod))
      return fail("Mode de paiement requis pour un participant : CB ou CREDIT.");
    resolvedPaymentMethod = paymentMethod;
  }

  try {
    const registration = await prisma.$transaction(async (tx) => {
      if (role === "PARTICIPANT") {
        // Vérification capacité dans la transaction pour éviter les race conditions.
        const confirmedCount = await tx.formationRegistration.count({
          where: { sessionId: sid, status: "CONFIRMED" },
        });
        if (confirmedCount >= session.capacity)
          throw new Error("CAPACITY_FULL");

        if (resolvedPaymentMethod === "CREDIT") {
          // updateMany conditionnel : atomique, empêche le solde de passer sous 0.
          const updated = await tx.user.updateMany({
            where: { id: user.id, credits: { gte: 1 } },
            data: { credits: { decrement: 1 } },
          });
          if (updated.count === 0) throw new Error("INSUFFICIENT_CREDITS");
        }
      }

      return tx.formationRegistration.create({
        data: {
          userId: user.id,
          sessionId: sid,
          role,
          status: "CONFIRMED",
          paymentMethod: resolvedPaymentMethod,
        },
        select: { id: true },
      });
    });

    return ok({ id: String(registration.id) });
  } catch (e) {
    if (e instanceof Error) {
      if (e.message === "CAPACITY_FULL") return fail("Cette session est complète.");
      if (e.message === "INSUFFICIENT_CREDITS") return fail("Vous n'avez pas assez de crédits.");
    }
    return fail("Impossible de créer l'inscription.");
  }
}

// Annule l'inscription de l'utilisateur courant.
// Rembourse le crédit si le paiement était en CREDIT et la session est encore OPEN.
export async function cancelRegistration(
  registrationId: string | number | bigint
): Promise<ActionResult<void>> {
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

  const refundCredit =
    registration.paymentMethod === "CREDIT" &&
    registration.session.status === "OPEN";

  try {
    await prisma.$transaction(async (tx) => {
      await tx.formationRegistration.update({
        where: { id: rid },
        data: { status: "CANCELLED" },
      });

      if (refundCredit) {
        await tx.user.update({
          where: { id: user.id },
          data: { credits: { increment: 1 } },
        });
      }
    });

    return ok(undefined);
  } catch {
    return fail("Impossible d'annuler l'inscription.");
  }
}
