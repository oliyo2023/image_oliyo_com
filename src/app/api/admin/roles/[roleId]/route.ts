// src/app/api/admin/roles/[roleId]/route.ts
// API routes for specific admin role management

import { NextRequest } from 'next/server';
import { authenticateAdmin, checkPermission, logAuditAction } from '@/middleware';
import { updateRole, getRoleById } from '@/lib/permissions';
import { validateUUID } from '@/lib/validations';

/**
 * PUT /api/admin/roles/[roleId]
 * Update a specific role
 */
export async function PUT(request: NextRequest, { params }: { params: { roleId: string } }) {
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

    // Validate role ID
    const { roleId } = params;
    if (!roleId || !validateUUID(roleId)) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: 'Bad Request: Invalid or missing role ID' 
        }),
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Check permission
    const hasPermission = await checkPermission(user, 'admin.roles.update');
    if (!hasPermission) {
      // Log audit action
      await logAuditAction(
        user.id,
        'UPDATE_ROLE',
        'role',
        roleId,
        request,
        'failed',
        null,
        { message: 'Insufficient permissions' }
      );

      return new Response(
        JSON.stringify({ 
          success: false, 
          message: 'Forbidden: Insufficient permissions to update roles' 
        }),
        { 
          status: 403,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Parse request body
    const body = await request.json();
    const { name, description, permissionIds, isActive } = body;

    // Validate permission IDs if provided
    if (permissionIds && Array.isArray(permissionIds)) {
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
    }

    // Prepare update data
    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (permissionIds !== undefined) updateData.permissionIds = permissionIds;
    if (isActive !== undefined) updateData.isActive = isActive;

    // Get current role for audit log
    const currentRole = await getRoleById(roleId);

    // Update the role
    const result = await updateRole(roleId, updateData);

    // Log audit action
    await logAuditAction(
      user.id,
      'UPDATE_ROLE',
      'role',
      roleId,
      request,
      result.success ? 'success' : 'failed',
      currentRole,
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
    console.error('Error in PUT /api/admin/roles/[roleId]:', error);
    
    // Log audit action for error
    try {
      const user = await authenticateAdmin(request, {} as any);
      if (user) {
        const { roleId } = await request.json().catch(() => ({ roleId: 'unknown' }));
        await logAuditAction(
          user.id,
          'UPDATE_ROLE',
          'role',
          roleId,
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
        message: 'Internal Server Error: Failed to update role' 
      }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}

/**
 * GET /api/admin/roles/[roleId]
 * Get a specific role by ID
 */
export async function GET(request: NextRequest, { params }: { params: { roleId: string } }) {
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

    // Validate role ID
    const { roleId } = params;
    if (!roleId || !validateUUID(roleId)) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: 'Bad Request: Invalid or missing role ID' 
        }),
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Check permission
    const hasPermission = await checkPermission(user, 'admin.roles.view');
    if (!hasPermission) {
      // Log audit action
      await logAuditAction(
        user.id,
        'VIEW_ROLE',
        'role',
        roleId,
        request,
        'failed',
        null,
        { message: 'Insufficient permissions' }
      );

      return new Response(
        JSON.stringify({ 
          success: false, 
          message: 'Forbidden: Insufficient permissions to view role' 
        }),
        { 
          status: 403,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Get the role
    const result = await getRoleById(roleId);

    if (!result) {
      // Log audit action for not found
      await logAuditAction(
        user.id,
        'VIEW_ROLE',
        'role',
        roleId,
        request,
        'failed',
        null,
        { message: 'Role not found' }
      );

      return new Response(
        JSON.stringify({ 
          success: false, 
          message: 'Not Found: Role not found' 
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
      'VIEW_ROLE',
      'role',
      roleId,
      request,
      'success',
      null,
      { roleId }
    );

    return new Response(
      JSON.stringify({
        success: true,
        role: result
      }),
      { 
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  } catch (error) {
    console.error('Error in GET /api/admin/roles/[roleId]:', error);
    
    // Log audit action for error
    try {
      const user = await authenticateAdmin(request, {} as any);
      if (user) {
        const { roleId } = params;
        await logAuditAction(
          user.id,
          'VIEW_ROLE',
          'role',
          roleId,
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
        message: 'Internal Server Error: Failed to retrieve role' 
      }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}

/**
 * DELETE /api/admin/roles/[roleId]
 * Delete (soft delete) a specific role
 */
export async function DELETE(request: NextRequest, { params }: { params: { roleId: string } }) {
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

    // Validate role ID
    const { roleId } = params;
    if (!roleId || !validateUUID(roleId)) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: 'Bad Request: Invalid or missing role ID' 
        }),
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Check permission
    const hasPermission = await checkPermission(user, 'admin.roles.delete');
    if (!hasPermission) {
      // Log audit action
      await logAuditAction(
        user.id,
        'DELETE_ROLE',
        'role',
        roleId,
        request,
        'failed',
        null,
        { message: 'Insufficient permissions' }
      );

      return new Response(
        JSON.stringify({ 
          success: false, 
          message: 'Forbidden: Insufficient permissions to delete roles' 
        }),
        { 
          status: 403,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Get current role for audit log
    const currentRole = await getRoleById(roleId);
    if (!currentRole) {
      // Log audit action for not found
      await logAuditAction(
        user.id,
        'DELETE_ROLE',
        'role',
        roleId,
        request,
        'failed',
        null,
        { message: 'Role not found' }
      );

      return new Response(
        JSON.stringify({ 
          success: false, 
          message: 'Not Found: Role not found' 
        }),
        { 
          status: 404,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Soft delete the role by setting isActive to false
    const result = await updateRole(roleId, { isActive: false });

    // Log audit action
    await logAuditAction(
      user.id,
      'DELETE_ROLE',
      'role',
      roleId,
      request,
      result.success ? 'success' : 'failed',
      currentRole,
      result
    );

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Role deleted successfully',
        role: result.role
      }),
      { 
        status: result.success ? 200 : 400,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  } catch (error) {
    console.error('Error in DELETE /api/admin/roles/[roleId]:', error);
    
    // Log audit action for error
    try {
      const user = await authenticateAdmin(request, {} as any);
      if (user) {
        const { roleId } = params;
        await logAuditAction(
          user.id,
          'DELETE_ROLE',
          'role',
          roleId,
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
        message: 'Internal Server Error: Failed to delete role' 
      }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}