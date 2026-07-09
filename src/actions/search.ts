"use server";

import { prisma } from "@/lib/prisma";
import { searchUsers } from "@/queries/users";

const QUICK_SEARCH_LIMIT = 5;

export type QuickSearchMember = {
  id: string;
  name: string;
  avatarUrl: string | null;
  role: string;
};

/** Suggestions rapides "Personnes" pour la barre de recherche (top bar). */
export async function quickSearchMembers(
  query: string
): Promise<QuickSearchMember[]> {
  const trimmed = query.trim();
  if (!trimmed) return [];

  const users = await searchUsers({ name: trimmed });

  return users.slice(0, QUICK_SEARCH_LIMIT).map((u) => ({
    id: String(u.id),
    name: u.name,
    avatarUrl: u.avatarUrl,
    role: u.role.name,
  }));
}

export type QuickSearchPost = {
  id: string;
  content: string;
  author: { id: string; name: string; avatarUrl: string | null };
};

/** Suggestions rapides "Posts" pour la barre de recherche (top bar) : posts
 * dont le contenu texte matche la requête. */
export async function quickSearchPosts(
  query: string
): Promise<QuickSearchPost[]> {
  const trimmed = query.trim();
  if (!trimmed) return [];

  const posts = await prisma.post.findMany({
    where: { content: { contains: trimmed, mode: "insensitive" } },
    orderBy: { id: "desc" },
    take: QUICK_SEARCH_LIMIT,
    select: {
      id: true,
      content: true,
      author: { select: { id: true, name: true, avatarUrl: true } },
    },
  });

  return posts.map((p) => ({
    id: String(p.id),
    content: p.content ?? "",
    author: {
      id: String(p.author.id),
      name: p.author.name,
      avatarUrl: p.author.avatarUrl,
    },
  }));
}

export type QuickSearchCompany = {
  id: string;
  name: string;
  memberCount: number;
};

/** Suggestions rapides "Entreprises" pour la barre de recherche (top bar) :
 * entreprises dont au moins un membre a une expérience enregistrée. */
export async function quickSearchCompanies(
  query: string
): Promise<QuickSearchCompany[]> {
  const trimmed = query.trim();
  if (!trimmed) return [];

  const companies = await prisma.company.findMany({
    where: { name: { contains: trimmed, mode: "insensitive" } },
    take: QUICK_SEARCH_LIMIT,
    orderBy: { name: "asc" },
    include: { _count: { select: { experiences: true } } },
  });

  return companies.map((c) => ({
    id: String(c.id),
    name: c.name,
    memberCount: c._count.experiences,
  }));
}
