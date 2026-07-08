import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

/**
 * Id de l'utilisateur courant lu directement depuis la session JWT (aucune
 * requête base). Renvoie null si non authentifié ou si l'id de session est
 * malformé. À privilégier quand seul l'id est nécessaire (ex. filtres
 * isLiked/isBookmarked dans les queries de lecture).
 */
export async function getSessionUserId(): Promise<bigint | null> {
  const session = await auth();
  if (!session?.user?.id) return null;
  try {
    return BigInt(session.user.id);
  } catch {
    return null;
  }
}

export async function getCurrentUser() {
  const userId = await getSessionUserId();
  if (userId === null) return null;

  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  return user;
}

export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) throw new Error("Non authentifié");
  return user;
}
