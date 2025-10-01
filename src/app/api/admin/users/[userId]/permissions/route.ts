// src/app/api/admin/users/[userId]/permissions/route.ts
// API routes for user permissions

import { NextRequest } from 'next/server';
import { authenticateAdmin, checkPermission, logAuditAction } from '@/middleware';
import { getUserPermissions } from '@/lib/permissions';
import { getAdminUserById } from '@/lib/admin-users';
import { validateUUID } from '@/lib/validations';

/**
 * GET /api/admin/users/[userId]/permissions
 * Get permissions for a specific user
 */
export async function GET(request: NextRequest, { params }: { params: { userId: string } }) {
  try {
    // Authenticate admin user
    const user = await authenticateAdmin(request, {} as any);
    if (!user) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: 'Unauthorized: Invalid or missing authentication token' 
        }),
        { 
          status: 401,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Validate user ID
    const { userId } = params;
    if (!userId || !validateUUID(userId)) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: 'Bad Request: Invalid or missing user ID' 
        }),
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Check permission
    const hasPermission = await checkPermission(user, 'admin.users.view-permissions');
    if (!hasPermission) {
      // Log audit action
      await logAuditAction(
        user.id,
        'VIEW_USER_PERMISSIONS',
        'user',
        userId,
        request,
        'failed',
        null,
        { message: 'Insufficient permissions' }
      );

      return new Response(
        JSON.stringify({ 
          success: false, 
          message: 'Forbidden: Insufficient permissions to view user permissions' 
        }),
        { 
          status: 403,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Get user for audit log
    const targetUser = await getAdminUserById(userId);
    if (!targetUser) {
      // Log audit action for not found
      await logAuditAction(
        user.id,
        'VIEW_USER_PERMISSIONS',
        'user',
        userId,
        request,
        'failed',
        null,
        { message: 'User not found' }
      );

      return new Response(
        JSON.stringify({ 
          success: false, 
          message: 'Not Found: User not found' 
        }),
        { 
          status: 404,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Get user permissions
    const permissions = await getUserPermissions(userId);

    // Log audit action
    await logAuditAction(
      user.id,
      'VIEW_USER_PERMISSIONS',
      'user',
      userId,
      request,
      'success',
      null,
      { userId, permissionCount: permissions.length }
    );

    return new Response(
      JSON.stringify({
        success: true,
        permissions,
        count: permissions.length
      }),
      { 
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  } catch (error) {
    console.error('Error in GET /api/admin/users/[userId]/permissions:', error);
    
    // Log audit action for error
    try {
      const user = await authenticateAdmin(request, {} as any);
      if (user) {
        const { userId } = params;
        await logAuditAction(
          user.id,
          'VIEW_USER_PERMISSIONS',
          'user',
          userId,
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
        message: 'Internal Server Error: Failed to retrieve user permissions' 
      }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}

/**
 * POST /api/admin/users/[userId]/permissions
 * Add permissions to a user (direct assignment, bypassing roles)
 */
export async function POST(request: NextRequest, { params }: { params: { userId: string } }) {
  try {
    // Authenticate admin user
    const user = await authenticateAdmin(request, {} as any);
    if (!user) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: 'Unauthorized: Invalid or missing authentication token' 
        }),
        { 
          status: 401,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Validate user ID
    const { userId } = params;
    if (!userId || !validateUUID(userId)) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: 'Bad Request: Invalid or missing user ID' 
        }),
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Check permission
    const hasPermission = await checkPermission(user, 'admin.users.assign-permissions');
    if (!hasPermission) {
      // Log audit action
      await logAuditAction(
        user.id,
        'ASSIGN_PERMISSIONS_TO_USER',
        'user',
        userId,
        request,
        'failed',
        null,
        { message: 'Insufficient permissions' }
      );

      return new Response(
        JSON.stringify({ 
          success: false, 
          message: 'Forbidden: Insufficient permissions to assign permissions to users' 
        }),
        { 
          status: 403,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Parse request body
    const body = await request.json();
    const { permissionIds } = body;

    // Validate required fields
    if (!permissionIds || !Array.isArray(permissionIds)) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: 'Bad Request: permissionIds is required and must be an array' 
        }),
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Validate permission IDs format
    for (const permissionId of permissionIds) {
      if (!validateUUID(permissionId)) {
        return new Response(
          JSON.stringify({ 
            success: false, 
            message: `Bad Request: Invalid permission ID format: ${permissionId}` 
          }),
          { 
            status: 400,
            headers: { 'Content-Type': 'application/json' }
          }
        );
      }
    }

    // Get user for audit log
    const targetUser = await getAdminUserById(userId);
    if (!targetUser) {
      // Log audit action for not found
      await logAuditAction(
        user.id,
        'ASSIGN_PERMISSIONS_TO_USER',
        'user',
        userId,
        request,
        'failed',
        null,
        { message: 'User not found' }
      );

      return new Response(
        JSON.stringify({ 
          success: false, 
          message: 'Not Found: User not found' 
        }),
        { 
          status: 404,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // In this implementation, we'll assume permissions are assigned through roles
    // Direct permission assignment would require a separate table/model
    // For now, we'll return an appropriate response

    // Log audit action
    await logAuditAction(
      user.id,
      'ASSIGN_PERMISSIONS_TO_USER',
      'user',
      userId,
      request,
      'failed',
      null,
      { message: 'Direct permission assignment not supported - assign through roles instead' }
    );

    return new Response(
      JSON.stringify({ 
        success: false, 
        message: 'Not Implemented: Direct permission assignment not supported - assign through roles instead' 
      }),
      { 
        status: 501,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  } catch (error) {
    console.error('Error in POST /api/admin/users/[userId]/permissions:', error);
    
    // Log audit action for error
    try {
      const user = await authenticateAdmin(request, {} as any);
      if (user) {
        const { userId } = params;
        await logAuditAction(
          user.id,
          'ASSIGN_PERMISSIONS_TO_USER',
          'user',
          userId,
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
        message: 'Internal Server Error: Failed to assign permissions to user' 
      }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}

/**
 * DELETE /api/admin/users/[userId]/permissions/[permissionId]
 * Remove a specific permission from a user (if directly assigned)
 */
export async function DELETE(request: NextRequest, { params }: { params: { userId: string, permissionId: string } }) {
  try {
    // Authenticate admin user
    const user = await authenticateAdmin(request, {} as any);
    if (!user) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: 'Unauthorized: Invalid or missing authentication token' 
        }),
        { 
          status: 401,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Validate user ID and permission ID
    const { userId, permissionId } = params;
    if (!userId || !validateUUID(userId) || !permissionId || !validateUUID(permissionId)) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: 'Bad Request: Invalid or missing user ID or permission ID' 
        }),
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Check permission
    const hasPermission = await checkPermission(user, 'admin.users.remove-permissions');
    if (!hasPermission) {
      // Log audit action
      await logAuditAction(
        user.id,
        'REMOVE_PERMISSION_FROM_USER',
        'user',
        userId,
        request,
        'failed',
        null,
        { message: 'Insufficient permissions', permissionId }
      );

      return new Response(
        JSON.stringify({ 
          success: false, 
          message: 'Forbidden: Insufficient permissions to remove permissions from users' 
        }),
        { 
          status: 403,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Get user for audit log
    const targetUser = await getAdminUserById(userId);
    if (!targetUser) {
      // Log audit action for not found
      await logAuditAction(
        user.id,
        'REMOVE_PERMISSION_FROM_USER',
        'user',
        userId,
        request,
        'failed',
        null,
        { message: 'User not found', permissionId }
      );

      return new Response(
        JSON.stringify({ 
          success: false, 
          message: 'Not Found: User not found' 
        }),
        { 
          status: 404,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // In this implementation, we'll assume permissions are assigned through roles
    // Direct permission removal would require a separate table/model
    // For now, we'll return an appropriate response

    // Log audit action
    await logAuditAction(
      user.id,
      'REMOVE_PERMISSION_FROM_USER',
      'user',
      userId,
      request,
      'failed',
      null,
      { message: 'Direct permission removal not supported - remove through roles instead', permissionId }
    );

    return new Response(
      JSON.stringify({ 
        success: false, 
        message: 'Not Implemented: Direct permission removal not supported - remove through roles instead' 
      }),
      { 
        status: 501,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  } catch (error) {
    console.error('Error in DELETE /api/admin/users/[userId]/permissions/[permissionId]:', error);
    
    // Log audit action for error
    try {
      const user = await authenticateAdmin(request, {} as any);
      if (user) {
        const { userId, permissionId } = params;
        await logAuditAction(
          user.id,
          'REMOVE_PERMISSION_FROM_USER',
          'user',
          userId,
          request,
          'error',
          null,
          { error: error instanceof Error ? error.message : 'Unknown error', permissionId }
        );
      }
    } catch (logError) {
      console.error('Error logging audit action:', logError);
    }

    return new Response(
      JSON.stringify({ 
        success: false, 
        message: 'Internal Server Error: Failed to remove permission from user' 
      }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}