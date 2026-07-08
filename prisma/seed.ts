import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";

const prisma = new PrismaClient();

const ROLES = [
  "Futur élève",
  "Élève actuel",
  "Alumni",
  "Intervenant",
  "Équipe pédagogique",
];

const CATEGORIES = ["Entraide", "Événement", "Annonce", "Projet"];

const TOPICS = [
  { slug: "dev", name: "Dev" },
  { slug: "ux-ui", name: "UX/UI" },
  { slug: "data", name: "Data" },
  { slug: "marketing", name: "Marketing" },
  { slug: "design", name: "Design" },
];

async function main() {
  for (const name of ROLES) {
    await prisma.role.upsert({
      where: { name },
      update: {},
      create: { name },
    });
  }

  for (const name of CATEGORIES) {
    await prisma.category.upsert({
      where: { name },
      update: {},
      create: { name },
    });
  }

  for (const topic of TOPICS) {
    await prisma.topic.upsert({
      where: { slug: topic.slug },
      update: { name: topic.name },
      create: topic,
    });
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
