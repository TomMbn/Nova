import { prisma } from "@/lib/prisma";

export type FormationVideo = {
  id: string;
  title: string;
  description: string;
  videoUrl: string;
  topics: { id: string; name: string; slug: string }[];
};

export type FormationSession = {
  id: string;
  title: string;
  description: string;
  date: Date;
  location: string;
  status: string;
  cpfUrl: string;
  imageUrl: string | null;
  level: string | null;
  capacity: number | null;
  topics: { id: string; name: string; slug: string }[];
};

function serializeSession(r: {
  id: bigint;
  title: string;
  description: string;
  date: Date;
  location: string;
  status: string;
  cpfUrl: string;
  imageUrl: string | null;
  level: string | null;
  capacity: number | null;
  topics: { topic: { id: bigint; name: string; slug: string } }[];
}): FormationSession {
  return {
    id: String(r.id),
    title: r.title,
    description: r.description,
    date: r.date,
    location: r.location,
    status: r.status,
    cpfUrl: r.cpfUrl,
    imageUrl: r.imageUrl,
    level: r.level,
    capacity: r.capacity,
    topics: r.topics.map((t) => ({
      id: String(t.topic.id),
      name: t.topic.name,
      slug: t.topic.slug,
    })),
  };
}

const SESSION_INCLUDE = {
  topics: { include: { topic: { select: { id: true, name: true, slug: true } } } },
} as const;

export async function getFormationVideos(): Promise<FormationVideo[]> {
  const rows = await prisma.formationVideo.findMany({
    orderBy: { id: "asc" },
    include: {
      topics: { include: { topic: { select: { id: true, name: true, slug: true } } } },
    },
  });
  return rows.map((r) => ({
    id: String(r.id),
    title: r.title,
    description: r.description,
    videoUrl: r.videoUrl,
    topics: r.topics.map((t) => ({
      id: String(t.topic.id),
      name: t.topic.name,
      slug: t.topic.slug,
    })),
  }));
}

export async function getFormationSessionById(id: string): Promise<FormationSession | null> {
  const r = await prisma.formationSession.findUnique({
    where: { id: BigInt(id) },
    include: SESSION_INCLUDE,
  });
  if (!r) return null;
  return serializeSession(r);
}

export async function getFormationSessions(): Promise<FormationSession[]> {
  const rows = await prisma.formationSession.findMany({
    orderBy: { date: "asc" },
    include: SESSION_INCLUDE,
  });
  return rows.map(serializeSession);
}
