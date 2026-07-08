import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";

const prisma = new PrismaClient();

const PROFILE_TYPES = [
  { slug: "futur-eleve", label: "Futur élève" },
  { slug: "eleve-actuel", label: "Élève actuel" },
  { slug: "alumni", label: "Ancien élève (alumni)" },
  { slug: "intervenant", label: "Intervenant" },
  { slug: "equipe-pedagogique", label: "Membre de l'équipe pédagogique" },
];

const THEMES = [
  { slug: "dev", label: "Dev" },
  { slug: "ux-ui", label: "UX/UI" },
  { slug: "data", label: "Data" },
  { slug: "marketing", label: "Marketing" },
  { slug: "design", label: "Design" },
];

async function main() {
  for (const profileType of PROFILE_TYPES) {
    await prisma.profileType.upsert({
      where: { slug: profileType.slug },
      update: { label: profileType.label },
      create: profileType,
    });
  }

  for (const theme of THEMES) {
    await prisma.theme.upsert({
      where: { slug: theme.slug },
      update: { label: theme.label },
      create: theme,
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
