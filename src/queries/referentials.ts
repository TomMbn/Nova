import { prisma } from "@/lib/prisma";

export function getSkills(search?: string) {
  return prisma.skill.findMany({
    where: search ? { name: { contains: search, mode: "insensitive" } } : undefined,
    orderBy: { name: "asc" },
  });
}

export function getClasses() {
  return prisma.class.findMany({ orderBy: { name: "asc" } });
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
