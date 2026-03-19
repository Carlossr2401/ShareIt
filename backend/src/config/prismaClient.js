import { PrismaClient } from "@prisma/client";

// Forzamos a Prisma a usar la URL de tu .env manualmente
export const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
});

export default prisma;
