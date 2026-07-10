import { prisma } from "@/lib/prisma";

// Les fonctions ci-dessous retournent des objets Prisma bruts avec des ids
// BigInt. Utiliser serializeBigInt() avant de passer le résultat à un Client
// Component.

export function getSkills(search?: string) {
  return prisma.skill.findMany({
    where: search ? { name: { contains: search, mode: "insensitive" } } : undefined,
    orderBy: { name: "asc" },
  });
}

export function getClasses() {
  return prisma.class.findMany({ orderBy: { name: "asc" } });
}

export function getRoles() {
  return prisma.role.findMany({ orderBy: { id: "asc" } });
}

export function getTopics() {
  return prisma.topic.findMany({ orderBy: { name: "asc" } });
}

export function getCategories() {
  return prisma.category.findMany({ orderBy: { name: "asc" } });
}

export function getCompanies(search?: string) {
  return prisma.company.findMany({
    where: search ? { name: { contains: search, mode: "insensitive" } } : undefined,
    orderBy: { name: "asc" },
  });
}
