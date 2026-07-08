import { prisma } from "@/lib/prisma";
import { getSessionUserId } from "@/lib/auth";
import { toBigInt } from "@/lib/bigint";

/**
 * Résultats d'un sondage : options avec leur nombre de votes et le total.
 * `votedOptionId` indique l'option choisie par l'utilisateur courant (null si
 * non connecté ou s'il n'a pas encore voté).
 *
 * Retourne `null` si le post n'existe pas ou n'a pas de sondage.
 * Ids déjà sérialisés en `string`.
 */
export async function getPollResults(postId: string | number | bigint) {
  const pid = toBigInt(postId);
  if (pid === null) return null;

  const viewerId = await getSessionUserId();

  const poll = await prisma.poll.findUnique({
    where: { postId: pid },
    select: {
      id: true,
      question: true,
      options: {
        select: {
          id: true,
          label: true,
          _count: { select: { votes: true } },
        },
        orderBy: { id: "asc" },
      },
      // Vote de l'utilisateur courant — tableau vide si non connecté.
      votes: viewerId
        ? { where: { userId: viewerId }, select: { optionId: true } }
        : false,
    },
  });

  if (!poll) return null;

  const totalVotes = poll.options.reduce((s, o) => s + o._count.votes, 0);
  const votedOptionId =
    viewerId && poll.votes && poll.votes.length > 0
      ? String(poll.votes[0].optionId)
      : null;

  return {
    id: String(poll.id),
    question: poll.question,
    totalVotes,
    votedOptionId,
    options: poll.options.map((o) => ({
      id: String(o.id),
      label: o.label,
      votes: o._count.votes,
    })),
  };
}
