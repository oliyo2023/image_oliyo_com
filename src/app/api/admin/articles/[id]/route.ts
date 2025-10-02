import { NextRequest } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { getUserById } from '@/lib/user';
import prisma from '@/lib/db';

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Extract token from Authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return Response.json(
        { error: 'Unauthorized', message: 'Missing or invalid authorization header' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    
    // Verify token
    const tokenPayload = await verifyToken(token);
    if (!tokenPayload) {
      return Response.json(
        { error: 'Unauthorized', message: 'Invalid or expired token' },
        { status: 401 }
      );
    }

    const userId = tokenPayload.userId;
    const articleId = params.id;
    
    // Check if user has admin role
    const user = await getUserById(userId);
    if (!user || user.role !== 'admin') {
      return Response.json(
        { error: 'Forbidden', message: 'Admin access required' },
        { status: 403 }
      );
    }

    // Validate article ID
    if (!articleId) {
      return Response.json(
        { 
          error: 'Invalid input', 
          message: 'Article ID is required' 
        },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { title, content, status, imageUrl } = body;

    // Validate request body (at least one field must be provided for update)
    if (!title && !content && !status && !imageUrl) {
      return Response.json(
        { 
          error: 'Invalid input', 
          message: 'At least one field (title, content, status, imageUrl) must be provided for update' 
        },
        { status: 400 }
      );
    }

    // Validate title if provided
    if (title && (typeof title !== 'string' || title.trim().length === 0)) {
      return Response.json(
        { 
          error: 'Invalid input', 
          message: 'Title must be a non-empty string if provided' 
        },
        { status: 400 }
      );
    }

    // Validate content if provided
    if (content && (typeof content !== 'string' || content.trim().length === 0)) {
      return Response.json(
        { 
          error: 'Invalid input', 
          message: 'Content must be a non-empty string if provided' 
        },
        { status: 400 }
      );
    }

    // Validate status if provided
    if (status && !['draft', 'published', 'archived'].includes(status)) {
      return Response.json(
        { 
          error: 'Invalid input', 
          message: 'Status must be one of: draft, published, archived' 
        },
        { status: 400 }
      );
    }

    // Validate the article exists and belongs to an admin (not checking author because admins can edit all articles)
    const existingArticle = await prisma.article.findUnique({
      where: { id: articleId },
    });

    if (!existingArticle) {
      return Response.json(
        { 
          error: 'Not found', 
          message: 'Article not found' 
        },
        { status: 404 }
      );
    }

    // Prepare update data
    const updateData: any = {};
    if (title) updateData.title = title.trim();
    if (content) updateData.content = content.trim();
    if (status) updateData.status = status;
    if (imageUrl !== undefined) updateData.imageUrl = imageUrl || null; // Allow setting to null

    // Update the article
    const updatedArticle = await prisma.article.update({
      where: { id: articleId },
      data: updateData,
    });

    return Response.json({
      success: true,
      message: 'Article updated successfully',
      article: {
        id: updatedArticle.id,
        title: updatedArticle.title,
        authorId: updatedArticle.authorId,
        publicationDate: updatedArticle.publicationDate,
        status: updatedArticle.status,
      },
    });
  } catch (error: any) {
    console.error('Update admin article error:', error);
    
    // Check if it's a Prisma error about record not found
    if (error.code === 'P2025') {
      return Response.json(
        { 
          error: 'Not found', 
          message: 'Article not found' 
        },
        { status: 404 }
      );
    }
    
    return Response.json(
      { 
        error: 'Internal server error',
        message: 'An unexpected error occurred while updating the article'
      },
      { status: 500 }
    );
  }
}