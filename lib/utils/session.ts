import { PrismaClient } from '@prisma/client';
import { verifySessionToken } from './auth';

const prisma = new PrismaClient();

/**
 * Cleans up expired sessions from the database
 */
export async function cleanupExpiredSessions(): Promise<void> {
  const now = new Date();
  
  await prisma.session.deleteMany({
    where: {
      expirationTime: {
        lt: now
      }
    }
  });
}

/**
 * Extends a session by updating its expiration time
 */
export async function extendSession(sessionToken: string, hours: number = 24): Promise<boolean> {
  try {
    const newExpiration = new Date(Date.now() + hours * 60 * 60 * 1000);
    
    await prisma.session.update({
      where: { sessionToken },
      data: { expirationTime: newExpiration }
    });
    
    return true;
  } catch (error) {
    console.error('Error extending session:', error);
    return false;
  }
}

/**
 * Gets the user ID from a session token, verifying it's valid and not expired
 */
export async function getUserIdFromSession(sessionToken: string): Promise<string | null> {
  // First verify the JWT token
  const tokenPayload = await verifySessionToken(sessionToken);
  if (!tokenPayload) {
    return null;
  }
  
  // Then check if the session exists in the database and is not expired
  const session = await prisma.session.findUnique({
    where: { sessionToken }
  });

  if (!session || session.expirationTime < new Date()) {
    return null;
  }

  return session.userId;
}

/**
 * Invalidates a session by removing it from the database
 */
export async function invalidateSession(sessionToken: string): Promise<boolean> {
  try {
    await prisma.session.delete({
      where: { sessionToken }
    });
    
    return true;
  } catch (error) {
    console.error('Error invalidating session:', error);
    return false;
  }
}

/**
 * Gets session information
 */
export async function getSessionInfo(sessionToken: string) {
  const session = await prisma.session.findUnique({
    where: { sessionToken }
  });

  if (!session || session.expirationTime < new Date()) {
    return null;
  }

  return {
    userId: session.userId,
    createdAt: session.createdAt,
    expirationTime: session.expirationTime
  };
}