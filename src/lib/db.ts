import { PrismaClient } from '@prisma/client';

// Extend PrismaClient to add any custom methods
class ExtendedPrismaClient extends PrismaClient {
  constructor() {
    super();
  }

  // Add custom methods here if needed
}

// Create a single instance of PrismaClient
const prisma = new ExtendedPrismaClient();

export default prisma;

// Export types for convenience
export * from '@prisma/client';