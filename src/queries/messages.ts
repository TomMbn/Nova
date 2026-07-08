import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

const PAGE_SIZE = 30;

const PARTNER_SELECT = {
  id: true,
  name: true,
  avatarUrl: true,
} as const;

/**
 * Liste des interlocuteurs de l'utilisateur connecté (un par conversation),
 * avec le dernier message échangé et le nombre de messages non lus reçus de
 * cet interlocuteur. Triée du plus récent au plus ancien.
 *
 * Retourne un tableau vide si personne n'est authentifié.
 */
export async function getConversations() {
  const current = await getCurrentUser();
  if (!current) return [];

  const messages = await prisma.message.findMany({
    where: { OR: [{ senderId: current.id }, { receiverId: current.id }] },
    orderBy: { createdAt: "desc" },
    include: {
      sender: { select: PARTNER_SELECT },
      receiver: { select: PARTNER_SELECT },
    },
  });

  const conversations = new Map<
    string,
    {
      partner: (typeof messages)[number]["sender"];
      lastMessage: (typeof messages)[number];
      unreadCount: number;
    }
  >();

  for (const message of messages) {
    const isSender = message.senderId === current.id;
    const partner = isSender ? message.receiver : message.sender;
    const key = String(partner.id);

    if (!conversations.has(key)) {
      conversations.set(key, { partner, lastMessage: message, unreadCount: 0 });
    }
    if (!isSender && message.readAt === null) {
      conversations.get(key)!.unreadCount += 1;
    }
  }

  return [...conversations.values()];
}

/**
 * Historique des messages échangés entre l'utilisateur connecté et `userId`,
 * paginé par curseur (id du dernier message chargé), du plus récent au plus
 * ancien.
 *
 * Retourne null si personne n'est authentifié.
 */
export async function getMessagesWith(
  userId: string | number | bigint,
  { cursor }: { cursor?: string | number | bigint } = {}
) {
  const current = await getCurrentUser();
  if (!current) return null;

  const otherId = BigInt(userId);

  const messages = await prisma.message.findMany({
    where: {
      OR: [
        { senderId: current.id, receiverId: otherId },
        { senderId: otherId, receiverId: current.id },
      ],
    },
    orderBy: { createdAt: "desc" },
    take: PAGE_SIZE + 1,
    ...(cursor !== undefined && { cursor: { id: BigInt(cursor) }, skip: 1 }),
  });

  const hasMore = messages.length > PAGE_SIZE;
  const page = hasMore ? messages.slice(0, PAGE_SIZE) : messages;

  return {
    messages: page,
    nextCursor: hasMore ? String(page[page.length - 1].id) : null,
  };
}
