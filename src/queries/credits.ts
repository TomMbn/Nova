import { prisma } from "@/lib/prisma";
import { getSessionUserId } from "@/lib/auth";

// Solde de crédits de l'utilisateur courant.
export async function getCreditBalance(): Promise<number | null> {
  const userId = await getSessionUserId();
  if (!userId) return null;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { credits: true },
  });
  return user?.credits ?? null;
}

// Nombre de crédits en attente de réclamation : sessions animateur confirmées
// dont la date est passée et qui n'ont pas encore été créditées.
export async function getPendingCreditsCount(): Promise<number | null> {
  const userId = await getSessionUserId();
  if (!userId) return null;

  return prisma.formationRegistration.count({
    where: {
      userId,
      role: "ANIMATEUR",
      status: "CONFIRMED",
      creditedAt: null,
      session: { date: { lt: new Date() } },
    },
  });
}
