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
};

export default nextConfig;
