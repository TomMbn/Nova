"use server";

import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { ok, fail, type ActionResult } from "@/lib/action";

// Attribue les crédits dus pour toutes les sessions animateur passées non
// encore créditées. Appelé au chargement de la page profil/formations.
export async function claimPendingCredits(): Promise<
  ActionResult<{ credited: number }>
> {
  const user = await requireUser();

  const pending = await prisma.formationRegistration.findMany({
    where: {
      userId: user.id,
      role: "ANIMATEUR",
      status: "CONFIRMED",
      creditedAt: null,
      session: { date: { lt: new Date() } },
    },
    select: { id: true },
  });

  if (pending.length === 0) return ok({ credited: 0 });

  const ids = pending.map((r) => r.id);

  try {
    await prisma.$transaction([
      prisma.formationRegistration.updateMany({
        where: { id: { in: ids } },
        data: { creditedAt: new Date() },
      }),
      prisma.user.update({
        where: { id: user.id },
        data: { credits: { increment: pending.length } },
      }),
    ]);

    return ok({ credited: pending.length });
  } catch {
    return fail("Impossible d'attribuer les crédits.");
  }
}
