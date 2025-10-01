// src/lib/user.ts
import db from './db';
import { hashPassword, verifyPassword } from './auth';

interface UserUpdateData {
  id: string;
  email?: string;
  currentPassword?: string;
  newPassword?: string;
}

interface UserResponse {
  success: boolean;
  message: string;
  user?: any;
}

export async function updateUserProfile(updateData: UserUpdateData): Promise<UserResponse> {
  try {
    const { id, email, currentPassword, newPassword } = updateData;

    // Find the user by ID
    const user = await db.user.findUnique({
      where: { id }
    });

    if (!user) {
      return {
        success: false,
        message: 'User not found'
      };
    }

    // If email is being updated, ensure it's unique
    if (email && email !== user.email) {
      const existingUser = await db.user.findUnique({
        where: { email }
      });

      if (existingUser) {
        return {
          success: false,
          message: 'Email already in use by another account'
        };
      }
    }

    // If password is being updated, verify current password
    if (newPassword) {
      if (!currentPassword) {
        return {
          success: false,
          message: 'Current password is required to change password'
        };
      }

      // Verify the current password
      const isValidPassword = await verifyPassword(currentPassword, user.passwordHash);
      if (!isValidPassword) {
        return {
          success: false,
          message: 'Current password is incorrect'
        };
      }

      // Hash the new password
      const hashedNewPassword = await hashPassword(newPassword);
      
      // Update user with new password and optionally new email
      const updatedUser = await db.user.update({
        where: { id },
        data: {
          ...(email && { email }),
          passwordHash: hashedNewPassword
        }
      });

      return {
        success: true,
        message: 'Profile updated successfully',
        user: {
          id: updatedUser.id,
          email: updatedUser.email,
          creditBalance: updatedUser.creditBalance,
          registrationDate: updatedUser.registrationDate
        }
      };
    } else {
      // Update only the email if password is not being changed
      if (email) {
        const updatedUser = await db.user.update({
          where: { id },
          data: { email }
        });

        return {
          success: true,
          message: 'Profile updated successfully',
          user: {
            id: updatedUser.id,
            email: updatedUser.email,
            creditBalance: updatedUser.creditBalance,
            registrationDate: updatedUser.registrationDate
          }
        };
      } else {
        return {
          success: false,
          message: 'No updates provided'
        };
      }
    }
  } catch (error) {
    console.error('Error updating user profile:', error);
    return {
      success: false,
      message: 'An error occurred while updating profile'
    };
  }
}

export async function getUserById(userId: string) {
  try {
    const user = await db.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        creditBalance: true,
        registrationDate: true,
        lastLogin: true,
        socialLoginProvider: true,
        isActive: true,
        role: true
      }
    });

    if (!user) {
      return null;
    }

    return {
      id: user.id,
      email: user.email,
      creditBalance: user.creditBalance,
      registrationDate: user.registrationDate,
      lastLogin: user.lastLogin,
      socialLoginProvider: user.socialLoginProvider,
      isActive: user.isActive,
      role: user.role
    };
  } catch (error) {
    console.error('Error fetching user by ID:', error);
    return null;
  }
}

export async function getUserByEmail(email: string) {
  try {
    const user = await db.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        passwordHash: true,
        creditBalance: true,
        registrationDate: true,
        lastLogin: true,
        socialLoginProvider: true,
        isActive: true,
        role: true
      }
    });

    if (!user) {
      return null;
    }

    return {
      id: user.id,
      email: user.email,
      passwordHash: user.passwordHash,
      creditBalance: user.creditBalance,
      registrationDate: user.registrationDate,
      lastLogin: user.lastLogin,
      socialLoginProvider: user.socialLoginProvider,
      isActive: user.isActive,
      role: user.role
    };
  } catch (error) {
    console.error('Error fetching user by email:', error);
    return null;
  }
}

export async function getUserImageHistory(userId: string, limit: number = 20, offset: number = 0) {
  try {
    const images = await db.image.findMany({
      where: { userId },
      orderBy: { creationDate: 'desc' },
      take: limit,
      skip: offset,
      select: {
        id: true,
        originalFilename: true,
        storagePath: true,
        creationDate: true,
        prompt: true,
        modelName: true,
        status: true
      }
    });

    // Get total count for pagination
    const totalCount = await db.image.count({
      where: { userId }
    });

    return {
      images,
      totalCount,
      limit,
      offset
    };
  } catch (error) {
    console.error('Error fetching user image history:', error);
    return {
      images: [],
      totalCount: 0,
      limit,
      offset
    };
  }
}

export async function getPublicUserStats() {
  try {
    const totalUsers = await db.user.count();
    const totalImages = await db.image.count();
    const activeUsersToday = await db.user.count({
      where: {
        lastLogin: {
          gte: new Date(new Date().setHours(0, 0, 0, 0)) // Today's date at 00:00:00
        }
      }
    });

    return {
      totalUsers,
      totalImages,
      activeUsersToday
    };
  } catch (error) {
    console.error('Error fetching public user stats:', error);
    return {
      totalUsers: 0,
      totalImages: 0,
      activeUsersToday: 0
    };
  }
}

// Get platform analytics for admin dashboard
export async function getPlatformAnalytics() {
  try {
    const userStats = await getPublicUserStats();
    
    // Get credit transaction stats
    const totalCreditsEarned = await db.creditTransaction.aggregate({
      where: { transactionType: 'earned' },
      _sum: { amount: true }
    });
    
    const totalCreditsSpent = await db.creditTransaction.aggregate({
      where: { transactionType: 'spent' },
      _sum: { amount: true }
    });
    
    // Get AI model usage stats
    const modelUsage = await db.image.groupBy({
      by: ['modelName'],
      _count: {
        id: true
      },
      orderBy: {
        _count: {
          id: 'desc'
        }
      }
    });
    
    // Get revenue stats from purchases
    const totalRevenue = await db.creditTransaction.aggregate({
      where: { transactionType: 'purchased' },
      _sum: { amount: true }
    });
    
    return {
      success: true,
      stats: {
        ...userStats,
        totalCreditsEarned: totalCreditsEarned._sum.amount || 0,
        totalCreditsSpent: Math.abs(totalCreditsSpent._sum.amount || 0), // Make sure it's positive
        totalRevenue: totalRevenue._sum.amount || 0,
        modelUsage
      }
    };
  } catch (error) {
    console.error('Error fetching platform analytics:', error);
    return {
      success: false,
      message: 'Error fetching platform analytics'
    };
  }
}

// Create an article (for admin users)
export async function createArticle(title: string, content: string, authorId: string, status: string = 'draft', imageUrl?: string) {
  try {
    const article = await db.article.create({
      data: {
        title,
        content,
        authorId,
        status,
        ...(imageUrl && { imageUrl })
      }
    });

    return {
      success: true,
      article: {
        id: article.id,
        title: article.title,
        content: article.content,
        authorId: article.authorId,
        publicationDate: article.publicationDate,
        status: article.status,
        imageUrl: article.imageUrl
      }
    };
  } catch (error) {
    console.error('Error creating article:', error);
    return {
      success: false,
      message: 'Error creating article'
    };
  }
}

// Get all articles
export async function getAllArticles() {
  try {
    const articles = await db.article.findMany({
      include: {
        author: {
          select: {
            id: true,
            email: true
          }
        }
      },
      orderBy: {
        publicationDate: 'desc'
      }
    });

    return {
      success: true,
      articles: articles.map(article => ({
        id: article.id,
        title: article.title,
        content: article.content,
        author: article.author,
        publicationDate: article.publicationDate,
        status: article.status,
        imageUrl: article.imageUrl
      }))
    };
  } catch (error) {
    console.error('Error fetching articles:', error);
    return {
      success: false,
      message: 'Error fetching articles'
    };
  }
}

/**
 * Get a specific article by ID
 * @param articleId - ID of the article to retrieve
 * @returns Promise<Object> - Article object or null if not found
 */
export async function getArticleById(articleId: string) {
  try {
    // Validate article ID
    if (!articleId) {
      return {
        success: false,
        message: 'Article ID is required'
      };
    }

    // Get article with author information
    const article = await db.article.findUnique({
      where: { id: articleId },
      include: {
        author: {
          select: {
            id: true,
            email: true
          }
        }
      }
    });

    // Check if article exists
    if (!article) {
      return {
        success: false,
        message: 'Article not found'
      };
    }

    return {
      success: true,
      article: {
        id: article.id,
        title: article.title,
        content: article.content,
        author: article.author,
        publicationDate: article.publicationDate,
        status: article.status,
        imageUrl: article.imageUrl
      }
    };
  } catch (error) {
    console.error('Error getting article by ID:', error);
    return {
      success: false,
      message: 'Failed to retrieve article'
    };
  }
}

// Update an article
export async function updateArticle(articleId: string, updateData: { title?: string; content?: string; status?: string; imageUrl?: string }) {
  try {
    const article = await db.article.update({
      where: { id: articleId },
      data: updateData
    });

    return {
      success: true,
      article: {
        id: article.id,
        title: article.title,
        content: article.content,
        authorId: article.authorId,
        publicationDate: article.publicationDate,
        status: article.status,
        imageUrl: article.imageUrl
      }
    };
  } catch (error) {
    console.error('Error updating article:', error);
    return {
      success: false,
      message: 'Error updating article'
    };
  }
}

// Get all users (for admin)
export async function getAllUsers() {
  try {
    const users = await db.user.findMany({
      select: {
        id: true,
        email: true,
        creditBalance: true,
        registrationDate: true,
        lastLogin: true,
        socialLoginProvider: true,
        isActive: true,
        role: true
      },
      orderBy: {
        registrationDate: 'desc'
      }
    });

    return {
      success: true,
      users
    };
  } catch (error) {
    console.error('Error fetching users:', error);
    return {
      success: false,
      message: 'Error fetching users'
    };
  }
}