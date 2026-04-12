import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
console.log('Resource fields:', Object.keys(prisma.resource.fields || {}));
process.exit(0);
