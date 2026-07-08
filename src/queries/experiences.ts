import { prisma } from "@/lib/prisma";

export function getExperiencesByUser(userId: string | number | bigint) {
  return prisma.experience.findMany({
    where: { userId: BigInt(userId) },
    include: { company: true },
    orderBy: { startDate: "desc" },
  });
}
