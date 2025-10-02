// POST /api/admin/articles endpoint implementation
import { NextRequest } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { getUserById } from '@/lib/user';
import prisma from '@/lib/db';

export async function POST(request: NextRequest) {
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
    
    // Check if user has admin role
    const user = await getUserById(userId);
    if (!user || user.role !== 'admin') {
      return Response.json(
        { error: 'Forbidden', message: 'Admin access required' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { title, content, status, imageUrl } = body;

    // Validate request body
    if (!title || typeof title !== 'string' || title.trim().length === 0) {
      return Response.json(
        { 
          error: 'Invalid input', 
          message: 'Title is required and must be a non-empty string' 
        },
        { status: 400 }
      );
    }

    if (!content || typeof content !== 'string' || content.trim().length === 0) {
      return Response.json(
        { 
          error: 'Invalid input', 
          message: 'Content is required and must be a non-empty string' 
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

    // Use provided status or default to 'draft'
    const finalStatus = status || 'draft';

    // Create the article
    const article = await prisma.article.create({
      data: {
        title: title.trim(),
        content: content.trim(),
        authorId: userId,
        status: finalStatus,
        imageUrl: imageUrl || null,
      },
    });

    return Response.json({
      success: true,
      message: 'Article created successfully',
      article: {
        id: article.id,
        title: article.title,
        authorId: article.authorId,
        publicationDate: article.publicationDate,
        status: article.status,
      },
    });
  } catch (error: any) {
    console.error('Create admin article error:', error);
    return Response.json(
      { 
        error: 'Internal server error',
        message: 'An unexpected error occurred while creating the article'
      },
      { status: 500 }
    );
  }
}