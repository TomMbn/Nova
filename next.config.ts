import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
    ],
  },
  // Le body des Server Actions est limité à 1 Mo par défaut — trop petit pour
  // les vidéos uploadées depuis /publier (cf. src/lib/media-storage.ts).
  experimental: {
    serverActions: {
      bodySizeLimit: "30mb",
    },
  },
  // Le client Prisma est généré hors de l'emplacement par défaut
  // (src/generated/prisma) : le file tracing de Next.js ne l'embarque pas
  // automatiquement dans le bundle des fonctions serverless Vercel, d'où le
  // moteur binaire introuvable au runtime malgré binaryTargets dans schema.prisma.
  outputFileTracingIncludes: {
    "/**": ["./src/generated/prisma/**/*"],
  },
};

export default nextConfig;
