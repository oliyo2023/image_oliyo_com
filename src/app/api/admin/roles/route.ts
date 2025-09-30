// src/app/api/admin/roles/route.ts
// API routes for admin roles management

import { NextRequest } from 'next/server';
import { authenticateAdmin, checkPermission, logAuditAction } from '@/middleware';
import { createRole, getAllRoles, updateRole } from '@/lib/permissions';
import { validateUUID } from '@/lib/validations';

/**
 * POST /api/admin/roles
 * Create a new role
 */
export async function POST(request: NextRequest) {
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

    // Check permission
    const hasPermission = await checkPermission(user, 'admin.roles.create');
    if (!hasPermission) {
      // Log audit action
      await logAuditAction(
        user.id,
        'CREATE_ROLE',
        'role',
        'new',
        request,
        'failed',
        null,
        { message: 'Insufficient permissions' }
      );

      return new Response(
        JSON.stringify({ 
          success: false, 
          message: 'Forbidden: Insufficient permissions to create roles' 
        }),
        { 
          status: 403,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Parse request body
    const body = await request.json();
    const { name, description, permissionIds } = body;

    // Validate required fields
    if (!name || !description || !permissionIds || !Array.isArray(permissionIds)) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: 'Bad Request: Name, description, and permissionIds are required' 
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

    // Create the role
    const result = await createRole(name, description, permissionIds, user.id);

    // Log audit action
    await logAuditAction(
      user.id,
      'CREATE_ROLE',
      'role',
      result.role?.id || 'new',
      request,
      result.success ? 'success' : 'failed',
      null,
      result
    );

    return new Response(
      JSON.stringify(result),
      { 
        status: result.success ? 201 : 400,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  } catch (error) {
    console.error('Error in POST /api/admin/roles:', error);
    
    // Log audit action for error
    try {
      const user = await authenticateAdmin(request, {} as any);
      if (user) {
        await logAuditAction(
          user.id,
          'CREATE_ROLE',
          'role',
          'new',
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
        message: 'Internal Server Error: Failed to create role' 
      }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}

/**
 * GET /api/admin/roles
 * Get all roles
 */
export async function GET(request: NextRequest) {
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

    // Check permission
    const hasPermission = await checkPermission(user, 'admin.roles.view');
    if (!hasPermission) {
      // Log audit action
      await logAuditAction(
        user.id,
        'VIEW_ROLES',
        'role',
        'all',
        request,
        'failed',
        null,
        { message: 'Insufficient permissions' }
      );

      return new Response(
        JSON.stringify({ 
          success: false, 
          message: 'Forbidden: Insufficient permissions to view roles' 
        }),
        { 
          status: 403,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const activeOnly = searchParams.get('activeOnly') !== 'false'; // Default to true

    // Get all roles
    const roles = await getAllRoles(activeOnly);

    // Log audit action
    await logAuditAction(
      user.id,
      'VIEW_ROLES',
      'role',
      'all',
      request,
      'success',
      null,
      { roleCount: roles.length, activeOnly }
    );

    return new Response(
      JSON.stringify({
        success: true,
        roles,
        count: roles.length
      }),
      { 
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  } catch (error) {
    console.error('Error in GET /api/admin/roles:', error);
    
    // Log audit action for error
    try {
      const user = await authenticateAdmin(request, {} as any);
      if (user) {
        await logAuditAction(
          user.id,
          'VIEW_ROLES',
          'role',
          'all',
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
        message: 'Internal Server Error: Failed to retrieve roles' 
      }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}