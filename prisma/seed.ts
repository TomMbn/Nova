import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const ROLES = [
  "Élève",
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

const SKILLS = [
  "Développement Web",
  "UX/UI Design",
  "Data Science",
  "Growth Marketing",
  "Gestion de projet",
  "DevOps",
  "Illustration",
  "Rédaction",
  "Cybersécurité",
  "Product Management",
];

const COMPANIES = [
  "Google",
  "Doctolib",
  "Ubisoft",
  "OpenClassrooms",
  "Freelance",
  "BlaBlaCar",
  "Capgemini",
  "Station F",
];

// Bac +2 : formations en 2 ans → une classe B1 et une classe B2 chacune.
const FORMATIONS_BAC2 = [
  "Bachelor Digital Design",
  "Bachelor Informatique",
  "Bachelor Marketing Digital",
  "BTS Services Informatiques aux Organisations (SIO)",
];

// Bac +3 : admission post-bac+2, une seule année → classe B3.
const FORMATIONS_BAC3 = [
  "Bachelor Chargé d'Affaires Web",
  "Bachelor Chef de Projet Digital",
  "Bachelor Création Numérique",
  "Bachelor Cybersécurité et Administrateur Réseau",
  "Bachelor Data Analyst et IA",
  "Bachelor Développeur Web",
  "Bachelor UX/UI Design",
  "Bachelor Webmarketing & Social Media",
];

// Bac +5 : MBA en alternance, 2 ans → classe M1 et M2 chacune.
const FORMATIONS_MBA = [
  "MBA Big Data & Intelligence Artificielle (IA)",
  "MBA Cybersécurité et Architecture Réseau",
  "MBA Développeur Full Stack",
  "MBA Direction Artistique Digitale",
  "MBA Entrepreneuriat et Digital Business",
  "MBA Expert Marketing Digital",
  "MBA Lead UX/UI Designer",
  "MBA Management de Projet Digital",
];

const CLASSES = [
  ...FORMATIONS_BAC2.flatMap((name) => [`${name} - B1`, `${name} - B2`]),
  ...FORMATIONS_BAC3.map((name) => `${name} - B3`),
  ...FORMATIONS_MBA.flatMap((name) => [`${name} - M1`, `${name} - M2`]),
];

async function main() {
  // --- Référentiels ---
  await prisma.role.deleteMany({ where: { name: "Futur élève" } });
  for (const name of ROLES) {
    await prisma.role.upsert({ where: { name }, update: {}, create: { name } });
  }
  for (const name of CATEGORIES) {
    await prisma.category.upsert({ where: { name }, update: {}, create: { name } });
  }
  for (const topic of TOPICS) {
    await prisma.topic.upsert({
      where: { slug: topic.slug },
      update: { name: topic.name },
      create: topic,
    });
  }
  for (const name of CLASSES) {
    await prisma.class.upsert({ where: { name }, update: {}, create: { name } });
  }
  for (const name of SKILLS) {
    await prisma.skill.upsert({ where: { name }, update: {}, create: { name } });
  }
  for (const name of COMPANIES) {
    await prisma.company.upsert({ where: { name }, update: {}, create: { name } });
  }

  // --- Utilisateurs de démo ---
  const passwordHash = await bcrypt.hash("password123", 10);

  const roleAlumni = await prisma.role.findFirstOrThrow({ where: { name: "Alumni" } });
  const roleEleve = await prisma.role.findFirstOrThrow({ where: { name: "Élève" } });
  const roleIntervenant = await prisma.role.findFirstOrThrow({ where: { name: "Intervenant" } });
  const rolePedago = await prisma.role.findFirstOrThrow({ where: { name: "Équipe pédagogique" } });
  const classDataIA = await prisma.class.findFirstOrThrow({ where: { name: "Bachelor Data Analyst et IA - B3" } });

  const julie = await prisma.user.upsert({
    where: { email: "julie@demo.fr" },
    update: { avatarUrl: "https://i.pravatar.cc/300?img=47" },
    create: {
      email: "julie@demo.fr",
      passwordHash,
      name: "Julie Martin",
      bio: "Développeuse full-stack passionnée par le web.",
      avatarUrl: "https://i.pravatar.cc/300?img=47",
      roleId: roleAlumni.id,
    },
  });

  const thomas = await prisma.user.upsert({
    where: { email: "thomas@demo.fr" },
    update: { currentClassId: classDataIA.id, avatarUrl: "https://i.pravatar.cc/300?img=12" },
    create: {
      email: "thomas@demo.fr",
      passwordHash,
      name: "Thomas Dupont",
      bio: "Étudiant en 3e année, passionné de data.",
      avatarUrl: "https://i.pravatar.cc/300?img=12",
      roleId: roleEleve.id,
      currentClassId: classDataIA.id,
    },
  });

  const sofia = await prisma.user.upsert({
    where: { email: "sofia@demo.fr" },
    update: { avatarUrl: "https://i.pravatar.cc/300?img=32" },
    create: {
      email: "sofia@demo.fr",
      passwordHash,
      name: "Sofia Benali",
      bio: "Designer UX/UI freelance, intervenante.",
      avatarUrl: "https://i.pravatar.cc/300?img=32",
      roleId: roleIntervenant.id,
    },
  });

  const marc = await prisma.user.upsert({
    where: { email: "marc@demo.fr" },
    update: { avatarUrl: "https://i.pravatar.cc/300?img=68" },
    create: {
      email: "marc@demo.fr",
      passwordHash,
      name: "Marc Lefèvre",
      bio: "Responsable pédagogique, toujours partant pour un café.",
      avatarUrl: "https://i.pravatar.cc/300?img=68",
      roleId: rolePedago.id,
    },
  });

  // --- Compétences des membres ---
  const skillByName = async (name: string) =>
    prisma.skill.findFirstOrThrow({ where: { name } });

  const userSkills: [bigint, string][] = [
    [julie.id, "Développement Web"],
    [julie.id, "DevOps"],
    [julie.id, "Cybersécurité"],
    [thomas.id, "Data Science"],
    [thomas.id, "Gestion de projet"],
    [sofia.id, "UX/UI Design"],
    [sofia.id, "Illustration"],
    [marc.id, "Gestion de projet"],
    [marc.id, "Rédaction"],
  ];
  for (const [userId, skillName] of userSkills) {
    const skill = await skillByName(skillName);
    await prisma.userSkill.upsert({
      where: { userId_skillId: { userId, skillId: skill.id } },
      update: {},
      create: { userId, skillId: skill.id },
    });
  }

  // --- Expériences professionnelles ---
  const companyByName = async (name: string) =>
    prisma.company.findFirstOrThrow({ where: { name } });

  const companyDoctolib = await companyByName("Doctolib");
  const companyCapgemini = await companyByName("Capgemini");
  const companyBlaBlaCar = await companyByName("BlaBlaCar");
  const companyGoogle = await companyByName("Google");
  const companyFreelance = await companyByName("Freelance");

  // `experience.id` est une identity column GENERATED ALWAYS côté Postgres :
  // impossible d'upsert sur un id explicite (pas de OVERRIDING SYSTEM VALUE
  // via Prisma). On dédoublonne donc par (userId, companyId, title).
  const experiences: {
    userId: bigint;
    companyId: bigint;
    title: string;
    startDate: Date;
    endDate: Date | null;
    isCurrent: boolean;
  }[] = [
    {
      userId: julie.id,
      companyId: companyDoctolib.id,
      title: "Développeuse Full-Stack",
      startDate: new Date("2023-01-15"),
      endDate: null,
      isCurrent: true,
    },
    {
      userId: julie.id,
      companyId: companyCapgemini.id,
      title: "Alternante développeuse",
      startDate: new Date("2021-09-01"),
      endDate: new Date("2022-12-31"),
      isCurrent: false,
    },
    {
      userId: thomas.id,
      companyId: companyBlaBlaCar.id,
      title: "Stagiaire Data Analyst",
      startDate: new Date("2025-06-01"),
      endDate: new Date("2025-08-31"),
      isCurrent: false,
    },
    {
      userId: sofia.id,
      companyId: companyFreelance.id,
      title: "Designer UX/UI freelance",
      startDate: new Date("2020-01-01"),
      endDate: null,
      isCurrent: true,
    },
    {
      userId: marc.id,
      companyId: companyGoogle.id,
      title: "Chef de projet digital",
      startDate: new Date("2016-03-01"),
      endDate: new Date("2019-08-31"),
      isCurrent: false,
    },
  ];
  for (const exp of experiences) {
    const existing = await prisma.experience.findFirst({
      where: { userId: exp.userId, companyId: exp.companyId, title: exp.title },
    });
    if (!existing) {
      await prisma.experience.create({ data: exp });
    }
  }

  // --- Catégories & thématiques ---
  const catEntraide = await prisma.category.findFirstOrThrow({ where: { name: "Entraide" } });
  const catEvenement = await prisma.category.findFirstOrThrow({ where: { name: "Événement" } });
  const catAnnonce = await prisma.category.findFirstOrThrow({ where: { name: "Annonce" } });
  const catProjet = await prisma.category.findFirstOrThrow({ where: { name: "Projet" } });

  const topicDev = await prisma.topic.findFirstOrThrow({ where: { slug: "dev" } });
  const topicUX = await prisma.topic.findFirstOrThrow({ where: { slug: "ux-ui" } });
  const topicDesign = await prisma.topic.findFirstOrThrow({ where: { slug: "design" } });
  const topicData = await prisma.topic.findFirstOrThrow({ where: { slug: "data" } });
  const topicMarketing = await prisma.topic.findFirstOrThrow({ where: { slug: "marketing" } });

  // --- Préférences de notif (thématiques & catégories suivies) ---
  const followedTopics: [bigint, bigint][] = [
    [julie.id, topicDev.id],
    [julie.id, topicData.id],
    [thomas.id, topicData.id],
    [thomas.id, topicDev.id],
    [sofia.id, topicUX.id],
    [sofia.id, topicDesign.id],
    [marc.id, topicMarketing.id],
    [marc.id, topicDesign.id],
  ];
  for (const [userId, topicId] of followedTopics) {
    await prisma.followedTopic.upsert({
      where: { userId_topicId: { userId, topicId } },
      update: {},
      create: { userId, topicId },
    });
  }

  const followedCategories: [bigint, bigint][] = [
    [julie.id, catEntraide.id],
    [julie.id, catProjet.id],
    [thomas.id, catProjet.id],
    [thomas.id, catAnnonce.id],
    [sofia.id, catAnnonce.id],
    [sofia.id, catEvenement.id],
    [marc.id, catEvenement.id],
    [marc.id, catAnnonce.id],
  ];
  for (const [userId, categoryId] of followedCategories) {
    await prisma.followedCategory.upsert({
      where: { userId_categoryId: { userId, categoryId } },
      update: {},
      create: { userId, categoryId },
    });
  }

  // --- Posts de démo ---

  // Post 1 : entraide dev avec image placeholder
  const post1 = await prisma.post.upsert({
    where: { id: BigInt(1) },
    update: {},
    create: {
      authorId: julie.id,
      categoryId: catEntraide.id,
      content: "Besoin d'aide sur une API REST — quelqu'un a déjà fait de l'auth JWT avec refresh tokens ?",
    },
  });
  await prisma.postTopic.upsert({
    where: { postId_topicId: { postId: post1.id, topicId: topicDev.id } },
    update: {},
    create: { postId: post1.id, topicId: topicDev.id },
  });
  await prisma.media.upsert({
    where: { id: BigInt(1) },
    update: {},
    create: {
      postId: post1.id,
      type: "IMAGE",
      url: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&q=80",
      position: 0,
    },
  });

  // Post 2 : annonce UX sans média
  const post2 = await prisma.post.upsert({
    where: { id: BigInt(2) },
    update: {},
    create: {
      authorId: sofia.id,
      categoryId: catAnnonce.id,
      content: "Je donne un atelier Figma gratuit vendredi à 18h en salle B204. Places limitées !",
    },
  });
  await prisma.postTopic.upsert({
    where: { postId_topicId: { postId: post2.id, topicId: topicUX.id } },
    update: {},
    create: { postId: post2.id, topicId: topicUX.id },
  });
  await prisma.postTopic.upsert({
    where: { postId_topicId: { postId: post2.id, topicId: topicDesign.id } },
    update: {},
    create: { postId: post2.id, topicId: topicDesign.id },
  });

  // Post 3 : sondage
  const post3 = await prisma.post.upsert({
    where: { id: BigInt(3) },
    update: {},
    create: {
      authorId: thomas.id,
      categoryId: catProjet.id,
      content: "Pour notre projet data, quel outil de visualisation vous préférez ?",
    },
  });
  await prisma.postTopic.upsert({
    where: { postId_topicId: { postId: post3.id, topicId: topicData.id } },
    update: {},
    create: { postId: post3.id, topicId: topicData.id },
  });
  let poll = await prisma.poll.findUnique({ where: { postId: post3.id } });
  if (!poll) {
    poll = await prisma.poll.create({
      data: { postId: post3.id, question: "Quel outil de dataviz ?" },
    });
    await prisma.pollOption.createMany({
      data: [
        { pollId: poll.id, label: "Tableau" },
        { pollId: poll.id, label: "Power BI" },
        { pollId: poll.id, label: "Metabase" },
        { pollId: poll.id, label: "Observable" },
      ],
    });
  }

  // Post 4 : événement avec image
  const post4 = await prisma.post.upsert({
    where: { id: BigInt(4) },
    update: {},
    create: {
      authorId: julie.id,
      categoryId: catEvenement.id,
      content: "Hackathon alumni ce week-end ! 48h pour pitcher votre idée devant un jury. Inscriptions ouvertes.",
      eventDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      location: "Campus principal — Amphi A",
    },
  });
  await prisma.postTopic.upsert({
    where: { postId_topicId: { postId: post4.id, topicId: topicDev.id } },
    update: {},
    create: { postId: post4.id, topicId: topicDev.id },
  });
  await prisma.media.upsert({
    where: { id: BigInt(2) },
    update: {},
    create: {
      postId: post4.id,
      type: "IMAGE",
      url: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800&q=80",
      position: 0,
    },
  });

  // Post 5 : entraide sans média
  const post5 = await prisma.post.upsert({
    where: { id: BigInt(5) },
    update: {},
    create: {
      authorId: thomas.id,
      categoryId: catEntraide.id,
      content: "Quelqu'un cherche un binôme pour le projet fil rouge ? Je suis sur la partie front React.",
    },
  });
  await prisma.postTopic.upsert({
    where: { postId_topicId: { postId: post5.id, topicId: topicDev.id } },
    update: {},
    create: { postId: post5.id, topicId: topicDev.id },
  });

  // --- Likes, bookmarks, votes, commentaires ---
  const postLikes: [bigint, bigint][] = [
    [thomas.id, post1.id],
    [sofia.id, post1.id],
    [marc.id, post1.id],
    [julie.id, post2.id],
    [thomas.id, post2.id],
    [sofia.id, post4.id],
    [marc.id, post4.id],
    [thomas.id, post4.id],
  ];
  for (const [userId, postId] of postLikes) {
    await prisma.postLike.upsert({
      where: { userId_postId: { userId, postId } },
      update: {},
      create: { userId, postId },
    });
  }

  const bookmarks: [bigint, bigint][] = [
    [sofia.id, post1.id],
    [julie.id, post4.id],
  ];
  for (const [userId, postId] of bookmarks) {
    await prisma.bookmark.upsert({
      where: { userId_postId: { userId, postId } },
      update: {},
      create: { userId, postId },
    });
  }

  const pollOptions = await prisma.pollOption.findMany({ where: { pollId: poll.id } });
  const optionByLabel = (label: string) =>
    pollOptions.find((o) => o.label === label)!;

  const votes: [bigint, string][] = [
    [julie.id, "Metabase"],
    [sofia.id, "Power BI"],
    [marc.id, "Tableau"],
  ];
  for (const [userId, label] of votes) {
    const option = optionByLabel(label);
    await prisma.vote.upsert({
      where: { userId_pollId: { userId, pollId: poll.id } },
      update: {},
      create: { userId, pollId: poll.id, optionId: option.id },
    });
  }

  // `comment.id` est aussi une identity column GENERATED ALWAYS : on
  // dédoublonne par (authorId, postId, content) plutôt que par id explicite.
  const comments: { authorId: bigint; postId: bigint; content: string }[] = [
    {
      authorId: sofia.id,
      postId: post1.id,
      content: "Regarde du côté de NextAuth, ça gère bien les refresh tokens.",
    },
    {
      authorId: marc.id,
      postId: post1.id,
      content: "Bon sujet, ça intéressera sûrement d'autres élèves.",
    },
    {
      authorId: thomas.id,
      postId: post4.id,
      content: "Hâte d'y être !",
    },
  ];
  for (const comment of comments) {
    const existing = await prisma.comment.findFirst({ where: comment });
    if (!existing) {
      await prisma.comment.create({ data: comment });
    }
  }

  // --- Messagerie privée ---
  // `message.id` idem : dédoublonnage par (senderId, receiverId, content).
  const messages: {
    senderId: bigint;
    receiverId: bigint;
    content: string;
    readAt: Date | null;
  }[] = [
    {
      senderId: thomas.id,
      receiverId: julie.id,
      content: "Salut Julie, je voulais te demander des conseils sur les API REST.",
      readAt: new Date(),
    },
    {
      senderId: julie.id,
      receiverId: thomas.id,
      content: "Avec plaisir ! On peut en discuter après le cours ?",
      readAt: new Date(),
    },
    {
      senderId: thomas.id,
      receiverId: julie.id,
      content: "Parfait, à toute à l'heure !",
      readAt: null,
    },
    {
      senderId: sofia.id,
      receiverId: marc.id,
      content: "Bonjour Marc, le draft du planning de l'atelier Figma est prêt.",
      readAt: new Date(),
    },
    {
      senderId: marc.id,
      receiverId: sofia.id,
      content: "Merci Sofia, je regarde ça aujourd'hui.",
      readAt: null,
    },
  ];
  for (const message of messages) {
    const existing = await prisma.message.findFirst({
      where: {
        senderId: message.senderId,
        receiverId: message.receiverId,
        content: message.content,
      },
    });
    if (!existing) {
      await prisma.message.create({ data: message });
    }
  }

  // --- Formations vidéo ---
  const video1 = await prisma.formationVideo.upsert({
    where: { id: BigInt(1) },
    update: {},
    create: {
      id: BigInt(1),
      title: "Introduction à React et Next.js",
      description: "Découvrez les bases de React et Next.js pour créer des applications web modernes. Au programme : composants, props, état et routing.",
      videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
    },
  });
  await prisma.formationVideoTopic.upsert({
    where: { videoId_topicId: { videoId: video1.id, topicId: topicDev.id } },
    update: {},
    create: { videoId: video1.id, topicId: topicDev.id },
  });

  const video2 = await prisma.formationVideo.upsert({
    where: { id: BigInt(2) },
    update: {},
    create: {
      id: BigInt(2),
      title: "Fondamentaux du UX Design",
      description: "Les principes clés du design centré utilisateur : recherche, wireframing, prototypage et tests utilisateurs.",
      videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
    },
  });
  await prisma.formationVideoTopic.upsert({
    where: { videoId_topicId: { videoId: video2.id, topicId: topicUX.id } },
    update: {},
    create: { videoId: video2.id, topicId: topicUX.id },
  });
  await prisma.formationVideoTopic.upsert({
    where: { videoId_topicId: { videoId: video2.id, topicId: topicDesign.id } },
    update: {},
    create: { videoId: video2.id, topicId: topicDesign.id },
  });

  const video3 = await prisma.formationVideo.upsert({
    where: { id: BigInt(3) },
    update: {},
    create: {
      id: BigInt(3),
      title: "SQL et bases de données relationnelles",
      description: "Maîtrisez SQL de zéro : requêtes SELECT, jointures, agrégations et optimisation des performances.",
      videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
    },
  });
  await prisma.formationVideoTopic.upsert({
    where: { videoId_topicId: { videoId: video3.id, topicId: topicData.id } },
    update: {},
    create: { videoId: video3.id, topicId: topicData.id },
  });

  // --- Formations en présentiel ---
  const now = new Date();

  const session1 = await prisma.formationSession.upsert({
    where: { id: BigInt(1) },
    update: {},
    create: {
      id: BigInt(1),
      title: "Workshop Figma avancé",
      description: "Composants, variables et auto-layout : maîtrisez Figma pour des designs scalables et maintenables en équipe. Apprenez à structurer un design system robuste et à travailler efficacement en équipe sur des projets complexes.",
      date: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000),
      location: "Campus principal — Salle B204",
      status: "OPEN",
      cpfUrl: "https://www.moncompteformation.gouv.fr",
      imageUrl: "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800&q=80",
      level: "Intermédiaire",
      capacity: 20,
    },
  });
  await prisma.formationSessionTopic.upsert({
    where: { sessionId_topicId: { sessionId: session1.id, topicId: topicDesign.id } },
    update: {},
    create: { sessionId: session1.id, topicId: topicDesign.id },
  });
  await prisma.formationSessionTopic.upsert({
    where: { sessionId_topicId: { sessionId: session1.id, topicId: topicUX.id } },
    update: {},
    create: { sessionId: session1.id, topicId: topicUX.id },
  });

  const session2 = await prisma.formationSession.upsert({
    where: { id: BigInt(2) },
    update: {},
    create: {
      id: BigInt(2),
      title: "Python pour la Data Science",
      description: "Pandas, NumPy, Matplotlib et Scikit-learn : construisez vos premiers pipelines de données et modèles prédictifs. Une journée intensive pour passer de zéro à l'analyse de données réelles.",
      date: new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000),
      location: "Campus principal — Amphi B",
      status: "OPEN",
      cpfUrl: "https://www.moncompteformation.gouv.fr",
      imageUrl: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&q=80",
      level: "Débutant",
      capacity: 30,
    },
  });
  await prisma.formationSessionTopic.upsert({
    where: { sessionId_topicId: { sessionId: session2.id, topicId: topicData.id } },
    update: {},
    create: { sessionId: session2.id, topicId: topicData.id },
  });

  const session3 = await prisma.formationSession.upsert({
    where: { id: BigInt(3) },
    update: {},
    create: {
      id: BigInt(3),
      title: "Growth Hacking & SEO",
      description: "Stratégies d'acquisition, SEO technique, A/B testing et analytics : accélérez la croissance de vos projets digitaux. Formation intensive avec études de cas réels.",
      date: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
      location: "En ligne (Zoom)",
      status: "DONE",
      cpfUrl: "https://www.moncompteformation.gouv.fr",
      imageUrl: "https://images.unsplash.com/photo-1432888498266-38ffec3eaf0a?w=800&q=80",
      level: "Avancé",
      capacity: 15,
    },
  });
  await prisma.formationSessionTopic.upsert({
    where: { sessionId_topicId: { sessionId: session3.id, topicId: topicMarketing.id } },
    update: {},
    create: { sessionId: session3.id, topicId: topicMarketing.id },
  });

  // --- Inscriptions & avis (réservés aux Alumni, cf. CLAUDE.md) ---
  await prisma.formationRegistration.upsert({
    where: { userId_sessionId: { userId: julie.id, sessionId: session1.id } },
    update: {},
    create: { userId: julie.id, sessionId: session1.id, status: "CONFIRMED" },
  });
  await prisma.formationRegistration.upsert({
    where: { userId_sessionId: { userId: julie.id, sessionId: session3.id } },
    update: {},
    create: { userId: julie.id, sessionId: session3.id, status: "CONFIRMED" },
  });

  await prisma.review.upsert({
    where: { userId_sessionId: { userId: julie.id, sessionId: session3.id } },
    update: {},
    create: {
      userId: julie.id,
      sessionId: session3.id,
      rating: 5,
      comment: "Formation très complète, formateur au top !",
    },
  });

  console.log(
    "✓ Seed terminé — 4 utilisateurs, 5 posts (likes/bookmarks/votes/commentaires), 5 messages, 3 vidéos, 3 sessions (inscriptions + avis)"
  );
}

main()
  .then(async () => { await prisma.$disconnect(); })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
