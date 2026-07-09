import { prisma } from "@/lib/prisma";
import { getSessionUserId } from "@/lib/auth";
import { toBigInt } from "@/lib/bigint";

const DEFAULT_FEED_LIMIT = 20;

// Sentinelle : les ids sont des autoincrement positifs, donc `-1` ne matche
// jamais. Permet de garder un `include` de type statique quand aucun user
// n'est connecté (au lieu de le rendre conditionnel).
const NO_USER = BigInt(-1);

// Fragment d'`include` partagé par le fil et le détail : garantit que les deux
// exposent exactement les mêmes champs de base (auteur, catégorie, thématiques,
// compteurs, état perso), sérialisés par `serializePostBase`.
const POST_BASE_INCLUDE = (viewerId: bigint) =>
  ({
    author: { select: { id: true, name: true, avatarUrl: true, role: { select: { name: true } } } },
    category: { select: { id: true, name: true } },
    topics: {
      include: { topic: { select: { id: true, name: true, slug: true } } },
    },
    _count: { select: { likes: true, comments: true } },
    likes: { where: { userId: viewerId }, select: { userId: true } },
    bookmarks: { where: { userId: viewerId }, select: { userId: true } },
  }) as const;

// Forme minimale attendue par `serializePostBase` (les résultats Prisma des
// deux queries la satisfont structurellement, avec d'éventuels champs en plus).
type PostBaseRow = {
  id: bigint;
  content: string | null;
  createdAt: Date;
  eventDate: Date | null;
  location: string | null;
  author: { id: bigint; name: string; avatarUrl: string | null; role: { name: string } };
  category: { id: bigint; name: string };
  topics: { topic: { id: bigint; name: string; slug: string } }[];
  _count: { likes: number; comments: number };
  likes: unknown[];
  bookmarks: unknown[];
};

// Sérialise le tronc commun d'un post (ids en `string`, état perso en booléens)
// → passable tel quel à un Client Component via le rendu RSC.
function serializePostBase(post: PostBaseRow) {
  return {
    id: String(post.id),
    content: post.content,
    createdAt: post.createdAt,
    eventDate: post.eventDate,
    location: post.location,
    author: {
      id: String(post.author.id),
      name: post.author.name,
      avatarUrl: post.author.avatarUrl,
      role: post.author.role.name,
    },
    category: { id: String(post.category.id), name: post.category.name },
    topics: post.topics.map((t) => ({
      id: String(t.topic.id),
      name: t.topic.name,
      slug: t.topic.slug,
    })),
    counts: { likes: post._count.likes, comments: post._count.comments },
    isLiked: post.likes.length > 0,
    isBookmarked: post.bookmarks.length > 0,
  };
}

export type FeedPost = {
  id: string;
  content: string | null;
  createdAt: Date;
  eventDate: Date | null;
  location: string | null;
  author: { id: string; name: string; avatarUrl: string | null; role: string };
  category: { id: string; name: string };
  topics: { id: string; name: string; slug: string }[];
  counts: { likes: number; comments: number };
  isLiked: boolean;
  isBookmarked: boolean;
  media: { id: string; type: string; url: string; position: number }[];
  poll: { id: string; question: string; options: { id: string; label: string }[] } | null;
};

type FeedParams = {
  cursor?: string | number | bigint | null;
  categoryId?: string | number | bigint | null;
  topicId?: string | number | bigint | null;
  limit?: number;
};

/**
 * Fil d'actualité paginé par cursor (id décroissant → du plus récent au plus
 * ancien ; les ids étant autoincrement, l'ordre par id équivaut à l'ordre de
 * création, sans tie-break nécessaire sur `createdAt`).
 *
 * Filtres optionnels : `categoryId` (une catégorie), `topicId` (posts portant
 * cette thématique). Un id de filtre illisible est ignoré (feed non filtré).
 *
 * `isLiked` / `isBookmarked` reflètent l'utilisateur courant (false si non
 * authentifié). Les ids sont déjà sérialisés en `string` : le résultat peut
 * être passé tel quel à un Client Component.
 */
export async function getFeed(params: FeedParams = {}) {
  // `?? ` ne rattrape que null/undefined : on borne aussi 0 et les négatifs,
  // sinon `take: limit + 1` casse la pagination (page vide → nextCursor undefined).
  const limit = Math.max(1, Math.trunc(params.limit ?? DEFAULT_FEED_LIMIT));
  const cursorId = toBigInt(params.cursor);
  const categoryId = toBigInt(params.categoryId);
  const topicId = toBigInt(params.topicId);

  const viewerId = (await getSessionUserId()) ?? NO_USER;

  const rows = await prisma.post.findMany({
    where: {
      ...(categoryId !== null && { categoryId }),
      ...(topicId !== null && { topics: { some: { topicId } } }),
    },
    orderBy: { id: "desc" },
    take: limit + 1, // +1 sentinelle pour détecter la page suivante
    ...(cursorId !== null && { cursor: { id: cursorId }, skip: 1 }),
    include: {
      ...POST_BASE_INCLUDE(viewerId),
      media: { orderBy: { position: "asc" as const } },
      poll: {
        select: {
          id: true,
          question: true,
          options: { select: { id: true, label: true }, orderBy: { id: "asc" as const } },
        },
      },
    },
  });

  const hasMore = rows.length > limit;
  const page = hasMore ? rows.slice(0, limit) : rows;
  const posts = page.map((row) => ({
    ...serializePostBase(row),
    media: row.media.map((m) => ({
      id: String(m.id),
      type: m.type,
      url: m.url,
      position: m.position,
    })),
    poll: row.poll
      ? {
          id: String(row.poll.id),
          question: row.poll.question,
          options: row.poll.options.map((o) => ({ id: String(o.id), label: o.label })),
        }
      : null,
  }));
  const nextCursor = hasMore ? posts[posts.length - 1].id : null;

  return { posts, nextCursor };
}

/**
 * Détail d'un post : auteur, catégorie, thématiques, médias (triés par
 * position), sondage + options, commentaires (avec auteur, du plus ancien au
 * plus récent), compteurs likes/commentaires et état perso (isLiked /
 * isBookmarked).
 *
 * Retourne `null` si le post n'existe pas. Ids déjà sérialisés en `string`.
 */
export async function getPostById(id: string | number | bigint) {
  const postId = toBigInt(id);
  if (postId === null) return null;

  const viewerId = (await getSessionUserId()) ?? NO_USER;

  const post = await prisma.post.findUnique({
    where: { id: postId },
    include: {
      ...POST_BASE_INCLUDE(viewerId),
      media: { orderBy: { position: "asc" } },
      poll: { include: { options: true } },
      comments: {
        orderBy: { createdAt: "asc" },
        include: {
          author: { select: { id: true, name: true, avatarUrl: true, role: { select: { name: true } } } },
        },
      },
    },
  });

  if (!post) return null;

  return {
    ...serializePostBase(post),
    media: post.media.map((m) => ({
      id: String(m.id),
      type: m.type,
      url: m.url,
      position: m.position,
    })),
    poll: post.poll
      ? {
          id: String(post.poll.id),
          question: post.poll.question,
          options: post.poll.options.map((o) => ({
            id: String(o.id),
            label: o.label,
          })),
        }
      : null,
    comments: post.comments.map((c) => ({
      id: String(c.id),
      content: c.content,
      createdAt: c.createdAt,
      author: {
        id: String(c.author.id),
        name: c.author.name,
        avatarUrl: c.author.avatarUrl,
      },
    })),
  };
}
