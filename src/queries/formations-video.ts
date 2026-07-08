import { prisma } from "@/lib/prisma";
import { toBigInt } from "@/lib/bigint";

// Les ids retournés sont des BigInt — utiliser serializeBigInt() avant de
// passer le résultat à un Client Component.

export function getVideos() {
  return prisma.formationVideo.findMany({
    orderBy: { title: "asc" },
  });
}

export async function getVideoById(id: string | number | bigint) {
  const vid = toBigInt(id);
  if (vid === null) return null;

  return prisma.formationVideo.findUnique({ where: { id: vid } });
}
