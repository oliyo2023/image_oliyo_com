import { PrismaClient } from '@prisma/client';

// Export a singleton Prisma client for modules/tests that import "@/lib/db"
const prisma = new PrismaClient();

export default prisma;