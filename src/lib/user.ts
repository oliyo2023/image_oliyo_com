import { User, Prisma } from '@prisma/client';
export type SafeUser = Omit<User, 'passwordHash'>;
import prisma from './db';
import { getUserCreditBalance, getUserCreditHistory, getTotalCreditsSpent, getTotalCreditsEarned, getTotalCreditsPurchased } from './credit';

/**
 * Gets a user by ID, excluding sensitive information
 */
export async function getUserById(userId: string): Promise<SafeUser | null> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    return null;
  }

  // Return user without password hash
  const { passwordHash, ...userWithoutPassword } = user;
  return userWithoutPassword as SafeUser;
}

/**
 * Gets a user by email, excluding sensitive information
 */
export async function getUserByEmail(email: string): Promise<SafeUser | null> {
  const user = await prisma.user.findUnique({
    where: { email: email.toLowerCase() },
  });

  if (!user) {
    return null;
  }

  // Return user without password hash
  const { passwordHash, ...userWithoutPassword } = user;
  return userWithoutPassword as SafeUser;
}

/**
 * Updates user information
 */
export async function updateUser(
  userId: string,
  data: Prisma.UserUpdateInput
): Promise<User> {
  // Don't allow updating certain fields like email, registration date, etc.
  const { email, registrationDate, passwordHash, ...allowedUpdates } = data;
  
  return prisma.user.update({
    where: { id: userId },
    data: allowedUpdates,
  });
}

/**
 * Gets complete user profile with credit information
 */
export async function getUserProfile(userId: string) {
  const user = await getUserById(userId);
  
  if (!user) {
    return null;
  }

  const creditBalance = await getUserCreditBalance(userId);
  const creditHistory = await getUserCreditHistory(userId, 10, 0); // Get last 10 transactions
  const totalSpent = await getTotalCreditsSpent(userId);
  const totalEarned = await getTotalCreditsEarned(userId);
  const totalPurchased = await getTotalCreditsPurchased(userId);

  return {
    ...user,
    creditBalance,
    creditHistory,
    totalSpent,
    totalEarned,
    totalPurchased,
  };
}

/**
 * Gets all users (for admin functionality)
 */
export async function getAllUsers(limit: number = 20, offset: number = 0, search?: string) {
  const whereClause: Prisma.UserWhereInput = {};

  if (search) {
    whereClause.email = {
      contains: search,
      mode: 'insensitive',
    };
  }

  const users = await prisma.user.findMany({
    where: whereClause,
    take: limit,
    skip: offset,
    orderBy: {
      registrationDate: 'desc',
    },
  });

  // Get total count for pagination
  const total = await prisma.user.count({
    where: whereClause,
  });

  // Add credit balance to each user
  const usersWithBalance = await Promise.all(
    users.map(async (user) => {
      const balance = await getUserCreditBalance(user.id);
      return { ...user, creditBalance: balance };
    })
  );

  return {
    users: usersWithBalance,
    total,
    limit,
    offset,
  };
}

/**
 * Updates user's role (for admin functionality)
 */
export async function updateUserRole(userId: string, role: string): Promise<User> {
  // Validate role
  if (!['user', 'admin'].includes(role)) {
    throw new Error('Invalid role. Must be "user" or "admin"');
  }

  return prisma.user.update({
    where: { id: userId },
    data: { role },
  });
}

/**
 * Deactivates a user account (for admin functionality)
 */
export async function deactivateUser(userId: string): Promise<User> {
  return prisma.user.update({
    where: { id: userId },
    data: { isActive: false },
  });
}

/**
 * Activates a user account (for admin functionality)
 */
export async function activateUser(userId: string): Promise<User> {
  return prisma.user.update({
    where: { id: userId },
    data: { isActive: true },
  });
}

/**
 * Gets user analytics (for admin functionality)
 */
export async function getUserAnalytics(userId: string) {
  const user = await getUserById(userId);
  
  if (!user) {
    return null;
  }

  const creditBalance = await getUserCreditBalance(userId);
  const totalSpent = await getTotalCreditsSpent(userId);
  const totalEarned = await getTotalCreditsEarned(userId);
  const totalPurchased = await getTotalCreditsPurchased(userId);

  // Get count of images created by the user
  const imageCount = await prisma.image.count({
    where: { userId },
  });

  // Get count of tasks performed by the user
  const taskCount = await prisma.taskQueue.count({
    where: { userId },
  });

  return {
    user: {
      id: user.id,
      email: user.email,
      registrationDate: user.registrationDate,
      lastLogin: user.lastLogin,
      role: user.role,
      isActive: user.isActive,
    },
    creditBalance,
    totalSpent,
    totalEarned,
    totalPurchased,
    imageCount,
    taskCount,
  };
}

/**
 * Gets user's images
 */
export async function getUserImages(userId: string, limit: number = 20, offset: number = 0) {
  return prisma.image.findMany({
    where: { userId },
    take: limit,
    skip: offset,
    orderBy: {
      creationDate: 'desc',
    },
  });
}

/**
 * Gets a specific image by ID and user ID
 */
export async function getUserImage(userId: string, imageId: string) {
  return prisma.image.findFirst({
    where: {
      id: imageId,
      userId,
    },
  });
}

/**
 * Gets user's image history with filtering and pagination
 */
export async function getUserImageHistory(
  userId: string, 
  limit: number = 20, 
  offset: number = 0,
  status?: string,
  modelName?: string
) {
  const whereClause: Prisma.ImageWhereInput = { userId };
  
  // Add filters if provided
  if (status) {
    whereClause.status = status;
  }
  
  if (modelName) {
    whereClause.modelName = modelName;
  }

  const images = await prisma.image.findMany({
    where: whereClause,
    take: limit,
    skip: offset,
    orderBy: {
      creationDate: 'desc',
    },
  });

  // Get total count for pagination
  const total = await prisma.image.count({
    where: whereClause,
  });

  return {
    images,
    total,
    limit,
    offset,
  };
}

/**
 * Updates user's concurrent request count
 */
export async function updateUserConcurrentRequests(userId: string, change: number): Promise<User> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new Error(`User with ID ${userId} not found`);
  }

  // Apply the change to concurrent request count
  const newCount = Math.max(0, Math.min(3, user.concurrentRequests + change)); // Ensure it's between 0 and 3

  return prisma.user.update({
    where: { id: userId },
    data: { concurrentRequests: newCount },
  });
}

/**
 * Gets user's concurrent request count
 */
export async function getUserConcurrentRequests(userId: string): Promise<number> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { concurrentRequests: true },
  });

  return user?.concurrentRequests ?? 0;
}