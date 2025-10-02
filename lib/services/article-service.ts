import { PrismaClient, Article, User } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';

const prisma = new PrismaClient();

export interface CreateArticleInput {
  title: string;
  content: string;
  authorId: string;
  status?: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
}

export interface UpdateArticleInput {
  id: string;
  title?: string;
  content?: string;
  status?: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
}

export class ArticleService {
  /**
   * Creates a new article
   */
  async createArticle(input: CreateArticleInput): Promise<Article> {
    const { title, content, authorId, status = 'DRAFT' } = input;
    
    // Verify that the author exists
    const author = await prisma.user.findUnique({
      where: { id: authorId }
    });
    
    if (!author) {
      throw new Error('Author not found');
    }
    
    // For admin functionality, we might want to check if the user has admin rights
    // This would require additional validation based on the user's role
    
    return prisma.article.create({
      data: {
        title,
        content,
        authorId,
        status,
        publicationDate: status === 'PUBLISHED' ? new Date() : undefined
      }
    });
  }

  /**
   * Finds an article by ID
   */
  async findArticleById(id: string): Promise<Article | null> {
    return prisma.article.findUnique({
      where: { id },
      include: {
        author: {
          select: {
            id: true,
            email: true
          }
        }
      }
    });
  }

  /**
   * Gets all published articles
   */
  async getPublishedArticles(limit?: number, offset?: number): Promise<Article[]> {
    return prisma.article.findMany({
      where: { status: 'PUBLISHED' },
      orderBy: { publicationDate: 'desc' },
      skip: offset || 0,
      take: limit || 50,
      include: {
        author: {
          select: {
            id: true,
            email: true
          }
        }
      }
    });
  }

  /**
   * Gets all articles by an author
   */
  async getArticlesByAuthor(authorId: string, limit?: number, offset?: number): Promise<Article[]> {
    return prisma.article.findMany({
      where: { authorId },
      orderBy: { publicationDate: 'desc' },
      skip: offset || 0,
      take: limit || 50
    });
  }

  /**
   * Updates an article
   */
  async updateArticle(input: UpdateArticleInput): Promise<Article> {
    const { id, ...updateData } = input;
    
    // If status is being changed to PUBLISHED and wasn't published before, set publication date
    if (updateData.status === 'PUBLISHED') {
      const existingArticle = await prisma.article.findUnique({
        where: { id },
        select: { publicationDate: true, status: true }
      });
      
      if (existingArticle?.status !== 'PUBLISHED') {
        (updateData as any).publicationDate = new Date();
      }
    }
    
    return prisma.article.update({
      where: { id },
      data: updateData
    });
  }

  /**
   * Deletes an article
   */
  async deleteArticle(id: string): Promise<Article> {
    return prisma.article.delete({
      where: { id }
    });
  }

  /**
   * Publishes an article (changes status to PUBLISHED)
   */
  async publishArticle(id: string): Promise<Article> {
    return prisma.article.update({
      where: { id },
      data: {
        status: 'PUBLISHED',
        publicationDate: new Date()
      }
    });
  }

  /**
   * Archives an article (changes status to ARCHIVED)
   */
  async archiveArticle(id: string): Promise<Article> {
    return prisma.article.update({
      where: { id },
      data: {
        status: 'ARCHIVED'
      }
    });
  }

  /**
   * Gets articles by status
   */
  async getArticlesByStatus(status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED', limit?: number, offset?: number): Promise<Article[]> {
    return prisma.article.findMany({
      where: { status },
      orderBy: { publicationDate: 'desc' },
      skip: offset || 0,
      take: limit || 50,
      include: {
        author: {
          select: {
            id: true,
            email: true
          }
        }
      }
    });
  }

  /**
   * Verifies if a user is the author of an article
   */
  async verifyArticleAuthor(articleId: string, userId: string): Promise<boolean> {
    const article = await prisma.article.findUnique({
      where: { id: articleId }
    });

    return article?.authorId === userId;
  }

  /**
   * Searches articles by title or content
   */
  async searchArticles(query: string, limit?: number, offset?: number): Promise<Article[]> {
    if (!query) {
      return [];
    }

    return prisma.article.findMany({
      where: {
        OR: [
          { title: { contains: query, mode: 'insensitive' } },
          { content: { contains: query, mode: 'insensitive' } }
        ],
        status: 'PUBLISHED' // Only search published articles
      },
      orderBy: { publicationDate: 'desc' },
      skip: offset || 0,
      take: limit || 50
    });
  }
}