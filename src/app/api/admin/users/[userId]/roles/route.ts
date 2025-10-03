// src/app/api/admin/users/[userId]/roles/route.ts
// API routes for user role assignment

import { NextRequest } from 'next/server';
import { authenticateAdmin, checkPermission, logAuditAction } from '@/middleware';
import { assignRolesToAdminUser, getAdminUserById } from '@/lib/admin-users';
import { validateUUID } from '@/lib/validations';

/**
 * POST /api/admin/users/[userId]/roles
 * Assign roles to a user
 */
export async function POST(request: NextRequest, { params }: { params: { userId: string } }) {
  try {
    // Authenticate admin user
    const user = await authenticateAdmin(request);
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
    const hasPermission = await checkPermission(user.userId, 'admin.users.assign-roles');
    if (!hasPermission) {
      // Log audit action
      await logAuditAction(
        user.userId,
        'ASSIGN_ROLES_TO_USER',
        { 
          resourceType: 'user',
          resourceId: userId,
          message: 'Insufficient permissions'
        }
      );

      return new Response(
        JSON.stringify({ 
          success: false, 
          message: 'Forbidden: Insufficient permissions to assign roles to users' 
        }),
        { 
          status: 403,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Parse request body
    const body = await request.json();
    const { roleName } = body;

    // Validate required fields
    if (!roleName || typeof roleName !== 'string') {
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: 'Bad Request: roleName is required and must be a string' 
        }),
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Get current user for audit log
    const currentUser = await getAdminUserById(userId);

    // Assign role to user
    const result = await assignRolesToAdminUser(userId, roleName);

    // Log audit action
    await logAuditAction(
      user.userId,
      'ASSIGN_ROLES_TO_USER',
      { 
        resourceType: 'user',
        resourceId: userId,
        status: result.success ? 'success' : 'failed',
        userDetails: currentUser,
        result: result
      }
    );

    return new Response(
      JSON.stringify(result),
      { 
        status: result.success ? 200 : 400,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  } catch (error) {
    console.error('Error in POST /api/admin/users/[userId]/roles:', error);
    
    // Log audit action for error
    try {
      const user = await authenticateAdmin(request);
      if (user) {
        const { userId } = params;
        await logAuditAction(
          user.userId,
          'ASSIGN_ROLES_TO_USER_ERROR',
          { 
            resourceType: 'user',
            resourceId: userId,
            error: error instanceof Error ? error.message : 'Unknown error'
          }
        );
      }
    } catch (logError) {
      console.error('Error logging audit action:', logError);
    }

    return new Response(
      JSON.stringify({ 
        success: false, 
        message: 'Internal Server Error: Failed to assign roles to user' 
      }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}

/**
 * GET /api/admin/users/[userId]/roles
 * Get roles assigned to a user
 */
export async function GET(request: NextRequest, { params }: { params: { userId: string } }) {
  try {
    // Authenticate admin user
    const user = await authenticateAdmin(request);
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
    const hasPermission = await checkPermission(user.userId, 'admin.users.view-roles');
    if (!hasPermission) {
      // Log audit action
      await logAuditAction(
        user.userId,
        'VIEW_USER_ROLES',
        { 
          resourceType: 'user',
          resourceId: userId,
          message: 'Insufficient permissions'
        }
      );

      return new Response(
        JSON.stringify({ 
          success: false, 
          message: 'Forbidden: Insufficient permissions to view user roles' 
        }),
        { 
          status: 403,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Get user with roles
    const userWithRoles = await getAdminUserById(userId);

    if (!userWithRoles) {
      // Log audit action for not found
      await logAuditAction(
        user.userId,
        'VIEW_USER_ROLES',
        { 
          resourceType: 'user',
          resourceId: userId,
          message: 'User not found'
        }
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

    // Log audit action
    await logAuditAction(
      user.userId,
      'VIEW_USER_ROLES',
      { 
        resourceType: 'user',
        resourceId: userId,
        userId, 
        roleCount: userWithRoles.roles?.length || 0
      }
    );

    return new Response(
      JSON.stringify({
        success: true,
        user: {
          id: userWithRoles.id,
          email: userWithRoles.email,
          name: userWithRoles.name,
          roles: userWithRoles.roles || []
        }
      }),
      { 
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  } catch (error) {
    console.error('Error in GET /api/admin/users/[userId]/roles:', error);
    
    // Log audit action for error
    try {
      const user = await authenticateAdmin(request);
      if (user) {
        const { userId } = params;
        await logAuditAction(
          user.userId,
          'VIEW_USER_ROLES_ERROR',
          { 
            resourceType: 'user',
            resourceId: userId,
            error: error instanceof Error ? error.message : 'Unknown error'
          }
        );
      }
    } catch (logError) {
      console.error('Error logging audit action:', logError);
    }

    return new Response(
      JSON.stringify({ 
        success: false, 
        message: 'Internal Server Error: Failed to retrieve user roles' 
      }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}

/**
 * DELETE /api/admin/users/[userId]/roles/[roleId]
 * Remove a specific role from a user
 */
export async function DELETE(request: NextRequest, { params }: { params: { userId: string, roleId: string } }) {
  try {
    // Authenticate admin user
    const user = await authenticateAdmin(request);
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

    // Validate user ID and role ID
    const { userId, roleId } = params;
    if (!userId || !validateUUID(userId) || !roleId || !validateUUID(roleId)) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: 'Bad Request: Invalid or missing user ID or role ID' 
        }),
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Check permission
    const hasPermission = await checkPermission(user.userId, 'admin.users.remove-roles');
    if (!hasPermission) {
      // Log audit action
      await logAuditAction(
        user.userId,
        'REMOVE_ROLE_FROM_USER',
        { 
          resourceType: 'user',
          resourceId: userId,
          message: 'Insufficient permissions', 
          roleId
        }
      );

      return new Response(
        JSON.stringify({ 
          success: false, 
          message: 'Forbidden: Insufficient permissions to remove roles from users' 
        }),
        { 
          status: 403,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Get current user for audit log
    const currentUser = await getAdminUserById(userId);

    // Remove role from user
    const result = await removeRoleFromAdminUser(userId, roleId);

    // Log audit action
    await logAuditAction(
      user.userId,
      'REMOVE_ROLE_FROM_USER',
      { 
        resourceType: 'user',
        resourceId: userId,
        status: result.success ? 'success' : 'failed',
        userDetails: currentUser,
        result: result
      }
    );

    return new Response(
      JSON.stringify(result),
      { 
        status: result.success ? 200 : 400,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  } catch (error) {
    console.error('Error in DELETE /api/admin/users/[userId]/roles/[roleId]:', error);
    
    // Log audit action for error
    try {
      const user = await authenticateAdmin(request);
      if (user) {
        const { userId, roleId } = params;
        await logAuditAction(
          user.userId,
          'REMOVE_ROLE_FROM_USER_ERROR',
          { 
            resourceType: 'user',
            resourceId: userId,
            roleId,
            error: error instanceof Error ? error.message : 'Unknown error'
          }
        );
      }
    } catch (logError) {
      console.error('Error logging audit action:', logError);
    }

    return new Response(
      JSON.stringify({ 
        success: false, 
        message: 'Internal Server Error: Failed to remove role from user' 
      }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}

/**
 * Helper function to remove a role from an admin user
 * @param userId - ID of the user
 * @param roleId - ID of the role to remove
 * @returns Promise<Object> - Result of the role removal
 */
async function removeRoleFromAdminUser(userId: string, roleId: string): Promise<any> {
  try {
    // Get current user
    const user = await getAdminUserById(userId);

    if (!user) {
      return {
        success: false,
        message: 'User not found'
      };
    }

    // Remove role ID from user's role IDs array
    const updatedRoleIds = user.roleIds.filter(id => id !== roleId);

    // Update user's role IDs
    const updatedUser = await updateAdminUser(userId, {
      roleIds: updatedRoleIds
    });

    return {
      success: true,
      user: {
        id: updatedUser.user.id,
        email: updatedUser.user.email,
        name: updatedUser.user.name,
        roleIds: updatedUser.user.roleIds
      },
      message: 'Role removed successfully'
    };
  } catch (error) {
    console.error('Error removing role from admin user:', error);
    return {
      success: false,
      message: 'Failed to remove role from user'
    };
  }
}

/**
 * Helper function to update an admin user
 * @param userId - ID of the user to update
 * @param updateData - Object containing fields to update
 * @returns Promise<Object> - Result of the update operation
 */
async function updateAdminUser(userId: string, updateData: any): Promise<any> {
  try {
    // Remove sensitive fields from update data
    const { passwordHash, id, createdAt, ...safeUpdateData } = updateData;

    // Update the user using the service function
    const updateResult = await updateAdminUser(userId, safeUpdateData);
    if (!updateResult.success) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: updateResult.message || 'Failed to update user' 
        }),
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }
    const updatedUser = updateResult.user;

    // Remove password hash from response for security
    const { passwordHash: _, ...userWithoutPassword } = updatedUser;

    return {
      success: true,
      user: userWithoutPassword,
      message: 'Admin user updated successfully'
    };
  } catch (error) {
    console.error('Error updating admin user:', error);
    return {
      success: false,
      message: 'Failed to update admin user'
    };
  }
}