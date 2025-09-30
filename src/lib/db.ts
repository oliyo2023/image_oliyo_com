// src/lib/db.ts
// Database connection using Prisma ORM

import { PrismaClient } from '@prisma/client';

// Global declaration for PrismaClient to prevent multiple instances in development
declare global {
  var prisma: PrismaClient | undefined;
}

// Create PrismaClient instance
const prismaClient = global.prisma || new PrismaClient();

// In development, store PrismaClient in global variable to prevent multiple instances
if (process.env.NODE_ENV !== 'production') {
  global.prisma = prismaClient;
}

export default prismaClient;

// Export models for easy access
export const {
  adminUser,
  role,
  permission,
  auditLog,
  resourceLock,
  userPersonalization
} = prismaClient;