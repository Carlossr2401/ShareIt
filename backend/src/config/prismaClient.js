import pkg from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import dotenv from "dotenv";

// Support both ESM named exports and CommonJS/default exports from @prisma/client
const PrismaClient = pkg?.PrismaClient ?? pkg?.default?.PrismaClient ?? pkg;

dotenv.config();

const connectionString =
  process.env.DATABASE_URL_POOLED || process.env.DATABASE_URL;

// Runtime usa pooler; comandos de esquema usan DATABASE_URL desde prisma.config.ts
const adapter = new PrismaPg({ connectionString });

export const prisma = new PrismaClient({ adapter });

export default prisma;
