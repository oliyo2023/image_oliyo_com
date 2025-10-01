// src/app/api/admin/articles/[id]/route.ts
// API routes for specific article management

import { NextRequest } from 'next/server';
import { authenticateAdmin, checkPermission, logAuditAction } from '@/middleware';
import { getArticleById, updateArticle, deleteArticle } from '@/lib/user';

/**
 * GET /api/admin/articles/[id]
 * Get a specific article by ID
 */
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Extract token from Authorization header
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: 'Authorization token required' 
        }),
        { 
          status: 401,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }
    
    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    const user = await authenticateAdmin(request, {} as any);
    
    if (!user) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: 'Invalid or expired token' 
        }),
        { 
          status: 401,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Check permission
    const hasPermission = await checkPermission(user, 'admin.articles.view');
    if (!hasPermission) {
      // Log audit action
      await logAuditAction(
        user.id,
        'VIEW_ARTICLE',
        'article',
        params.id,
        request,
        'failed',
        null,
        { message: 'Insufficient permissions' }
      );

      return new Response(
        JSON.stringify({ 
          success: false, 
          message: 'Forbidden: Insufficient permissions to view articles' 
        }),
        { 
          status: 403,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Get article ID from params
    const { id: articleId } = params;
    
    // Validate article ID
    if (!articleId) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: 'Article ID is required' 
        }),
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Get the article
    const result = await getArticleById(articleId);

    if (!result || !result.success) {
      // Log audit action for not found
      await logAuditAction(
        user.id,
        'VIEW_ARTICLE',
        'article',
        articleId,
        request,
        'failed',
        null,
        { message: 'Article not found' }
      );

      return new Response(
        JSON.stringify({ 
          success: false, 
          message: 'Not Found: Article not found' 
        }),
        { 
          status: 404,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Log audit action
    await logAuditAction(
      user.id,
      'VIEW_ARTICLE',
      'article',
      articleId,
      request,
      'success',
      null,
      { articleId }
    );

    return new Response(
      JSON.stringify(result),
      { 
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  } catch (error) {
    console.error('Error in GET /api/admin/articles/[id]:', error);
    
    // Log audit action for error
    try {
      const user = await authenticateAdmin(request, {} as any);
      if (user) {
        await logAuditAction(
          user.id,
          'VIEW_ARTICLE',
          'article',
          params.id,
          request,
          'error',
          null,
          { error: error instanceof Error ? error.message : 'Unknown error' }
        );
      }
    } catch (logError) {
      console.error('Error logging audit action:', logError);
    }

    return new Response(
      JSON.stringify({ 
        success: false, 
        message: 'An internal server error occurred' 
      }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}

/**
 * PUT /api/admin/articles/[id]
 * Update a specific article
 */
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Extract token from Authorization header
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: 'Authorization token required' 
        }),
        { 
          status: 401,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }
    
    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    const user = await authenticateAdmin(request, {} as any);
    
    if (!user) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: 'Invalid or expired token' 
        }),
        { 
          status: 401,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Check permission
    const hasPermission = await checkPermission(user, 'admin.articles.update');
    if (!hasPermission) {
      // Log audit action
      await logAuditAction(
        user.id,
        'UPDATE_ARTICLE',
        'article',
        params.id,
        request,
        'failed',
        null,
        { message: 'Insufficient permissions' }
      );

      return new Response(
        JSON.stringify({ 
          success: false, 
          message: 'Forbidden: Insufficient permissions to update articles' 
        }),
        { 
          status: 403,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Get article ID from params
    const { id: articleId } = params;
    
    // Validate article ID
    if (!articleId) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: 'Article ID is required' 
        }),
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Parse request body
    const body = await request.json();
    const { title, content, status, imageUrl } = body;

    // Validate input - at least one field must be provided for update
    if (title === undefined && content === undefined && status === undefined && imageUrl === undefined) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: 'At least one field (title, content, status, or imageUrl) must be provided for update' 
        }),
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Validate status if provided
    if (status !== undefined) {
      const validStatuses = ['draft', 'published', 'archived'];
      if (!validStatuses.includes(status)) {
        return new Response(
          JSON.stringify({ 
            success: false, 
            message: 'Invalid status. Must be one of: draft, published, archived' 
          }),
          { 
            status: 400,
            headers: { 'Content-Type': 'application/json' }
          }
        );
      }
    }

    // Get current article for audit log
    const currentArticle = await getArticleById(articleId);

    // Prepare update data
    const updateData: any = {};
    if (title !== undefined) updateData.title = title;
    if (content !== undefined) updateData.content = content;
    if (status !== undefined) updateData.status = status;
    if (imageUrl !== undefined) updateData.imageUrl = imageUrl;

    // Update the article
    const result = await updateArticle(articleId, updateData);

    // Log audit action
    await logAuditAction(
      user.id,
      'UPDATE_ARTICLE',
      'article',
      articleId,
      request,
      result.success ? 'success' : 'failed',
      currentArticle,
      result
    );

    return new Response(
      JSON.stringify(result),
      { 
        status: result.success ? 200 : 400,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  } catch (error) {
    console.error('Error in PUT /api/admin/articles/[id]:', error);
    
    // Log audit action for error
    try {
      const user = await authenticateAdmin(request, {} as any);
      if (user) {
        await logAuditAction(
          user.id,
          'UPDATE_ARTICLE',
          'article',
          params.id,
          request,
          'error',
          null,
          { error: error instanceof Error ? error.message : 'Unknown error' }
        );
      }
    } catch (logError) {
      console.error('Error logging audit action:', logError);
    }

    return new Response(
      JSON.stringify({ 
        success: false, 
        message: 'An internal server error occurred' 
      }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}

/**
 * DELETE /api/admin/articles/[id]
 * Delete (soft delete) a specific article
 */
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Extract token from Authorization header
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: 'Authorization token required' 
        }),
        { 
          status: 401,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }
    
    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    const user = await authenticateAdmin(request, {} as any);
    
    if (!user) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: 'Invalid or expired token' 
        }),
        { 
          status: 401,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Check permission
    const hasPermission = await checkPermission(user, 'admin.articles.delete');
    if (!hasPermission) {
      // Log audit action
      await logAuditAction(
        user.id,
        'DELETE_ARTICLE',
        'article',
        params.id,
        request,
        'failed',
        null,
        { message: 'Insufficient permissions' }
      );

      return new Response(
        JSON.stringify({ 
          success: false, 
          message: 'Forbidden: Insufficient permissions to delete articles' 
        }),
        { 
          status: 403,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Get article ID from params
    const { id: articleId } = params;
    
    // Validate article ID
    if (!articleId) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: 'Article ID is required' 
        }),
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Get current article for audit log
    const currentArticle = await getArticleById(articleId);
    if (!currentArticle || !currentArticle.success) {
      // Log audit action for not found
      await logAuditAction(
        user.id,
        'DELETE_ARTICLE',
        'article',
        articleId,
        request,
        'failed',
        null,
        { message: 'Article not found' }
      );

      return new Response(
        JSON.stringify({ 
          success: false, 
          message: 'Not Found: Article not found' 
        }),
        { 
          status: 404,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Soft delete the article by setting isActive to false
    const result = await deleteArticle(articleId);

    // Log audit action
    await logAuditAction(
      user.id,
      'DELETE_ARTICLE',
      'article',
      articleId,
      request,
      result.success ? 'success' : 'failed',
      currentArticle,
      result
    );

    return new Response(
      JSON.stringify(result),
      { 
        status: result.success ? 200 : 400,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  } catch (error) {
    console.error('Error in DELETE /api/admin/articles/[id]:', error);
    
    // Log audit action for error
    try {
      const user = await authenticateAdmin(request, {} as any);
      if (user) {
        await logAuditAction(
          user.id,
          'DELETE_ARTICLE',
          'article',
          params.id,
          request,
          'error',
          null,
          { error: error instanceof Error ? error.message : 'Unknown error' }
        );
      }
    } catch (logError) {
      console.error('Error logging audit action:', logError);
    }

    return new Response(
      JSON.stringify({ 
        success: false, 
        message: 'An internal server error occurred' 
      }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}

/**
 * PATCH /api/admin/articles/[id]
 * Update specific fields of an article
 */
export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Extract token from Authorization header
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: 'Authorization token required' 
        }),
        { 
          status: 401,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }
    
    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    const user = await authenticateAdmin(request, {} as any);
    
    if (!user) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: 'Invalid or expired token' 
        }),
        { 
          status: 401,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Check permission
    const hasPermission = await checkPermission(user, 'admin.articles.update');
    if (!hasPermission) {
      // Log audit action
      await logAuditAction(
        user.id,
        'PATCH_ARTICLE',
        'article',
        params.id,
        request,
        'failed',
        null,
        { message: 'Insufficient permissions' }
      );

      return new Response(
        JSON.stringify({ 
          success: false, 
          message: 'Forbidden: Insufficient permissions to update articles' 
        }),
        { 
          status: 403,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Get article ID from params
    const { id: articleId } = params;
    
    // Validate article ID
    if (!articleId) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: 'Article ID is required' 
        }),
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Parse request body
    const body = await request.json();
    const { title, content, status, imageUrl } = body;

    // Validate input - at least one field must be provided for update
    if (title === undefined && content === undefined && status === undefined && imageUrl === undefined) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: 'At least one field (title, content, status, or imageUrl) must be provided for update' 
        }),
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Validate status if provided
    if (status !== undefined) {
      const validStatuses = ['draft', 'published', 'archived'];
      if (!validStatuses.includes(status)) {
        return new Response(
          JSON.stringify({ 
            success: false, 
            message: 'Invalid status. Must be one of: draft, published, archived' 
          }),
          { 
            status: 400,
            headers: { 'Content-Type': 'application/json' }
          }
        );
      }
    }

    // Get current article for audit log
    const currentArticle = await getArticleById(articleId);

    // Prepare update data
    const updateData: any = {};
    if (title !== undefined) updateData.title = title;
    if (content !== undefined) updateData.content = content;
    if (status !== undefined) updateData.status = status;
    if (imageUrl !== undefined) updateData.imageUrl = imageUrl;

    // Update the article
    const result = await updateArticle(articleId, updateData);

    // Log audit action
    await logAuditAction(
      user.id,
      'PATCH_ARTICLE',
      'article',
      articleId,
      request,
      result.success ? 'success' : 'failed',
      currentArticle,
      result
    );

    return new Response(
      JSON.stringify(result),
      { 
        status: result.success ? 200 : 400,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  } catch (error) {
    console.error('Error in PATCH /api/admin/articles/[id]:', error);
    
    // Log audit action for error
    try {
      const user = await authenticateAdmin(request, {} as any);
      if (user) {
        await logAuditAction(
          user.id,
          'PATCH_ARTICLE',
          'article',
          params.id,
          request,
          'error',
          null,
          { error: error instanceof Error ? error.message : 'Unknown error' }
        );
      }
    } catch (logError) {
      console.error('Error logging audit action:', logError);
    }

    return new Response(
      JSON.stringify({ 
        success: false, 
        message: 'An internal server error occurred' 
      }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}