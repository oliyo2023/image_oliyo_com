// Common database utilities to reduce code duplication
import { PrismaClient, User, Image, TaskQueue, CreditTransaction, AIModel, Article, Session } from '@prisma/client';
import prisma from './db';

/**
 * Generic function to find a user by ID
 * Reduces code duplication across services that need to fetch user data
 */
export async function findUserById(userId: string): Promise<User | null> {
  return prisma.user.findUnique({
    where: { id: userId },
  });
}

/**
 * Generic function to find a user by email
 * Reduces code duplication across services that need to fetch user data by email
 */
export async function findUserByEmail(email: string): Promise<User | null> {
  return prisma.user.findUnique({
    where: { email: email.toLowerCase() },
  });
}

/**
 * Generic function to update a user
 * Reduces code duplication across services that need to update user data
 */
export async function updateUser(userId: string, data: Partial<User>): Promise<User> {
  return prisma.user.update({
    where: { id: userId },
    data,
  });
}

/**
 * Generic function to find an image by ID
 * Reduces code duplication across services that need to fetch image data
 */
export async function findImageById(imageId: string): Promise<Image | null> {
  return prisma.image.findUnique({
    where: { id: imageId },
  });
}

/**
 * Generic function to find images by user ID
 * Reduces code duplication across services that need to fetch user images
 */
export async function findImagesByUserId(userId: string, limit: number = 20, offset: number = 0): Promise<Image[]> {
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
 * Generic function to create an image record
 * Reduces code duplication across services that need to create image records
 */
export async function createImage(data: Partial<Image>): Promise<Image> {
  return prisma.image.create({
    data,
  });
}

/**
 * Generic function to update an image
 * Reduces code duplication across services that need to update image data
 */
export async function updateImage(imageId: string, data: Partial<Image>): Promise<Image> {
  return prisma.image.update({
    where: { id: imageId },
    data,
  });
}

/**
 * Generic function to find a task queue entry by ID
 * Reduces code duplication across services that need to fetch task queue data
 */
export async function findTaskQueueById(taskId: string): Promise<TaskQueue | null> {
  return prisma.taskQueue.findUnique({
    where: { id: taskId },
  });
}

/**
 * Generic function to find task queue entries by user ID
 * Reduces code duplication across services that need to fetch user tasks
 */
export async function findTaskQueuesByUserId(userId: string, limit: number = 20, offset: number = 0): Promise<TaskQueue[]> {
  return prisma.taskQueue.findMany({
    where: { userId },
    take: limit,
    skip: offset,
    orderBy: {
      createdAt: 'desc',
    },
  });
}

/**
 * Generic function to create a task queue entry
 * Reduces code duplication across services that need to create task queue entries
 */
export async function createTaskQueueEntry(data: Partial<TaskQueue>): Promise<TaskQueue> {
  return prisma.taskQueue.create({
    data,
  });
}

/**
 * Generic function to update a task queue entry
 * Reduces code duplication across services that need to update task queue data
 */
export async function updateTaskQueueEntry(taskId: string, data: Partial<TaskQueue>): Promise<TaskQueue> {
  return prisma.taskQueue.update({
    where: { id: taskId },
    data,
  });
}

/**
 * Generic function to find a credit transaction by ID
 * Reduces code duplication across services that need to fetch credit transaction data
 */
export async function findCreditTransactionById(transactionId: string): Promise<CreditTransaction | null> {
  return prisma.creditTransaction.findUnique({
    where: { id: transactionId },
  });
}

/**
 * Generic function to find credit transactions by user ID
 * Reduces code duplication across services that need to fetch user credit transactions
 */
export async function findCreditTransactionsByUserId(userId: string, limit: number = 20, offset: number = 0): Promise<CreditTransaction[]> {
  return prisma.creditTransaction.findMany({
    where: { userId },
    take: limit,
    skip: offset,
    orderBy: {
      date: 'desc',
    },
  });
}

/**
 * Generic function to create a credit transaction
 * Reduces code duplication across services that need to create credit transactions
 */
export async function createCreditTransaction(data: Partial<CreditTransaction>): Promise<CreditTransaction> {
  return prisma.creditTransaction.create({
    data,
  });
}

/**
 * Generic function to find an AI model by name
 * Reduces code duplication across services that need to fetch AI model data
 */
export async function findAIModelByName(name: string): Promise<AIModel | null> {
  return prisma.aIModel.findUnique({
    where: { name },
  });
}

/**
 * Generic function to find all AI models
 * Reduces code duplication across services that need to fetch all AI models
 */
export async function findAllAIModels(): Promise<AIModel[]> {
  return prisma.aIModel.findMany();
}

/**
 * Generic function to update an AI model
 * Reduces code duplication across services that need to update AI model data
 */
export async function updateAIModel(name: string, data: Partial<AIModel>): Promise<AIModel> {
  return prisma.aIModel.update({
    where: { name },
    data,
  });
}

/**
 * Generic function to find an article by ID
 * Reduces code duplication across services that need to fetch article data
 */
export async function findArticleById(articleId: string): Promise<Article | null> {
  return prisma.article.findUnique({
    where: { id: articleId },
  });
}

/**
 * Generic function to find articles
 * Reduces code duplication across services that need to fetch articles
 */
export async function findArticles(limit: number = 20, offset: number = 0, status?: string): Promise<Article[]> {
  const whereClause: any = {};
  
  if (status) {
    whereClause.status = status;
  }

  return prisma.article.findMany({
    where: whereClause,
    take: limit,
    skip: offset,
    orderBy: {
      publicationDate: 'desc',
    },
  });
}

/**
 * Generic function to create an article
 * Reduces code duplication across services that need to create articles
 */
export async function createArticle(data: Partial<Article>): Promise<Article> {
  return prisma.article.create({
    data,
  });
}

/**
 * Generic function to update an article
 * Reduces code duplication across services that need to update article data
 */
export async function updateArticle(articleId: string, data: Partial<Article>): Promise<Article> {
  return prisma.article.update({
    where: { id: articleId },
    data,
  });
}

/**
 * Generic function to find a session by ID
 * Reduces code duplication across services that need to fetch session data
 */
export async function findSessionById(sessionId: string): Promise<Session | null> {
  return prisma.session.findUnique({
    where: { id: sessionId },
  });
}

/**
 * Generic function to find a session by token
 * Reduces code duplication across services that need to fetch session data by token
 */
export async function findSessionByToken(token: string): Promise<Session | null> {
  return prisma.session.findUnique({
    where: { sessionToken: token },
  });
}

/**
 * Generic function to create a session
 * Reduces code duplication across services that need to create sessions
 */
export async function createSession(data: Partial<Session>): Promise<Session> {
  return prisma.session.create({
    data,
  });
}

/**
 * Generic function to update a session
 * Reduces code duplication across services that need to update session data
 */
export async function updateSession(sessionId: string, data: Partial<Session>): Promise<Session> {
  return prisma.session.update({
    where: { id: sessionId },
    data,
  });
}

/**
 * Generic function to delete a session
 * Reduces code duplication across services that need to delete sessions
 */
export async function deleteSession(sessionId: string): Promise<Session> {
  return prisma.session.delete({
    where: { id: sessionId },
  });
}

/**
 * Generic function to count entities
 * Reduces code duplication across services that need to count entities
 */
export async function countEntities(entity: 'user' | 'image' | 'taskQueue' | 'creditTransaction' | 'aIModel' | 'article' | 'session', whereClause?: any): Promise<number> {
  switch (entity) {
    case 'user':
      return prisma.user.count({ where: whereClause });
    case 'image':
      return prisma.image.count({ where: whereClause });
    case 'taskQueue':
      return prisma.taskQueue.count({ where: whereClause });
    case 'creditTransaction':
      return prisma.creditTransaction.count({ where: whereClause });
    case 'aIModel':
      return prisma.aIModel.count({ where: whereClause });
    case 'article':
      return prisma.article.count({ where: whereClause });
    case 'session':
      return prisma.session.count({ where: whereClause });
    default:
      throw new Error(`Unsupported entity: ${entity}`);
  }
}

/**
 * Generic function to aggregate credit transactions
 * Reduces code duplication across services that need to aggregate credit transactions
 */
export async function aggregateCreditTransactions(whereClause: any, aggregation: '_sum' | '_avg' | '_count' | '_min' | '_max'): Promise<any> {
  return prisma.creditTransaction.aggregate({
    where: whereClause,
    [aggregation]: {
      amount: true,
    },
  });
}

/**
 * Generic function to execute database transactions
 * Reduces code duplication across services that need to execute database transactions
 */
export async function executeTransaction<T>(callback: (tx: PrismaClient) => Promise<T>): Promise<T> {
  return prisma.$transaction(callback);
}