import { neonConfig } from "@neondatabase/serverless";
import { PrismaNeon } from "@prisma/adapter-neon";
import ws from "ws";

import { PrismaClient } from "@/generated/prisma/client";

// Le driver Neon serverless communique en WebSocket même en environnement
// Node.js (hors edge) : il a besoin d'un polyfill WebSocket, contrairement au
// navigateur / edge runtime qui en fournissent un nativement.
neonConfig.webSocketConstructor = ws;

const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL });

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
