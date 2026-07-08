import { prisma } from "@/lib/prisma";
import { getSessionUserId } from "@/lib/auth";
import { toBigInt } from "@/lib/bigint";

const PAGE_SIZE = 30;

// Limite le nombre de messages scannés pour construire la liste des
// conversations : au-delà, les très anciens fils seraient tronqués.
// Solution propre (window function SQL) reportée post-MVP.
const CONVERSATIONS_SCAN_LIMIT = 500;

/**
 * Liste des interlocuteurs de l'utilisateur connecté (un par conversation),
 * avec le dernier message échangé et le nombre de messages non lus reçus de
 * cet interlocuteur. Triée du plus récent au plus ancien.
 *
 * Retourne un tableau vide si personne n'est authentifié.
 * Ids sérialisés en string.
 */
export async function getConversations() {
  const userId = await getSessionUserId();
  if (!userId) return [];

  const messages = await prisma.message.findMany({
    where: { OR: [{ senderId: userId }, { receiverId: userId }] },
    orderBy: { createdAt: "desc" },
    take: CONVERSATIONS_SCAN_LIMIT,
    include: {
      sender: { select: { id: true, name: true, avatarUrl: true } },
      receiver: { select: { id: true, name: true, avatarUrl: true } },
    },
  });

  const conversations = new Map<
    string,
    {
      partner: { id: string; name: string; avatarUrl: string | null };
      lastMessage: {
        id: string;
        content: string;
        createdAt: Date;
        readAt: Date | null;
        senderId: string;
      };
      unreadCount: number;
    }
  >();

  for (const message of messages) {
    const isSender = message.senderId === userId;
    const partner = isSender ? message.receiver : message.sender;
    const key = String(partner.id);

    if (!conversations.has(key)) {
      conversations.set(key, {
        partner: {
          id: String(partner.id),
          name: partner.name,
          avatarUrl: partner.avatarUrl,
        },
        lastMessage: {
          id: String(message.id),
          content: message.content,
          createdAt: message.createdAt,
          readAt: message.readAt,
          senderId: String(message.senderId),
        },
        unreadCount: 0,
      });
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
 * Retourne null si personne n'est authentifié ou si userId est invalide.
 * Ids sérialisés en string.
 */
export async function getMessagesWith(
  userId: string | number | bigint,
  { cursor }: { cursor?: string | number | bigint } = {}
) {
  const currentId = await getSessionUserId();
  if (!currentId) return null;

  const otherId = toBigInt(userId);
  if (otherId === null) return null;

  const cursorId = cursor !== undefined ? toBigInt(cursor) : null;

  const messages = await prisma.message.findMany({
    where: {
      OR: [
        { senderId: currentId, receiverId: otherId },
        { senderId: otherId, receiverId: currentId },
      ],
    },
    orderBy: { id: "desc" },
    take: PAGE_SIZE + 1,
    ...(cursorId !== null && { cursor: { id: cursorId }, skip: 1 }),
  });

  const hasMore = messages.length > PAGE_SIZE;
  const page = hasMore ? messages.slice(0, PAGE_SIZE) : messages;

  return {
    messages: page.map((m) => ({
      id: String(m.id),
      content: m.content,
      createdAt: m.createdAt,
      readAt: m.readAt,
      senderId: String(m.senderId),
      receiverId: String(m.receiverId),
    })),
    nextCursor: hasMore ? String(page[page.length - 1].id) : null,
  };
}
