// src/lib/db-server.ts
// Server-side database connection using Prisma ORM
// This version should only be imported in server-side code, not in middleware

import { PrismaClient } from '@prisma/client';

// Global declaration for PrismaClient to prevent multiple instances in development
declare global {
  var prisma: PrismaClient | undefined;
}

// Create PrismaClient instance
const client = global.prisma || new PrismaClient();

if (process.env.NODE_ENV !== 'production') {
  global.prisma = client;
}

// Export the client
export default client;

// Export models for easy access
export const {
  user,
  creditTransaction,
  image,
  aiModel,
  article,
  session,
  adminUser,
  role,
  permission,
  auditLog,
  resourceLock,
  userPersonalization
} = client;