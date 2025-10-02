// src/app/api/admin/resources/[resourceType]/[resourceId]/lock/route.ts
// API routes for resource locking

import { NextRequest } from 'next/server';
import { authenticateAdmin, checkPermission, checkResourceLock, logAuditAction } from '@/middleware';
import { acquireResourceLock, releaseResourceLock, checkResourceLockStatus, extendResourceLock, forceReleaseLock } from '@/lib/resource-locking';
import { validateUUID } from '@/lib/validations';

/**
 * GET /api/admin/resources/[resourceType]/[resourceId]/lock
 * Check resource lock status
 */
export async function GET(request: NextRequest, { params }: { params: { resourceType: string, resourceId: string } }) {
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

    // Validate resource type and ID
    const { resourceType, resourceId } = params;
    if (!resourceType || !resourceId) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: 'Bad Request: Invalid or missing resource type or resource ID' 
        }),
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Check permission
    const hasPermission = await checkPermission(user, 'admin.resources.view-lock');
    if (!hasPermission) {
      // Log audit action
      await logAuditAction(
        user.id,
        'CHECK_RESOURCE_LOCK_STATUS',
        resourceType,
        resourceId,
        request,
        'failed',
        null,
        { message: 'Insufficient permissions' }
      );

      return new Response(
        JSON.stringify({ 
          success: false, 
          message: 'Forbidden: Insufficient permissions to check resource lock status' 
        }),
        { 
          status: 403,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Check resource lock status
    const lockStatus = await checkResourceLockStatus(resourceType, resourceId);

    // Log audit action
    await logAuditAction(
      user.id,
      'CHECK_RESOURCE_LOCK_STATUS',
      resourceType,
      resourceId,
      request,
      'success',
      null,
      { lockStatus }
    );

    return new Response(
      JSON.stringify({
        success: true,
        ...lockStatus
      }),
      { 
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  } catch (error) {
    console.error('Error in GET /api/admin/resources/[resourceType]/[resourceId]/lock:', error);
    
    // Log audit action for error
    try {
      const user = await authenticateAdmin(request);
      if (user) {
        const { resourceType, resourceId } = params;
        await logAuditAction(
          user.id,
          'CHECK_RESOURCE_LOCK_STATUS',
          resourceType,
          resourceId,
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
        message: 'Internal Server Error: Failed to check resource lock status' 
      }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}

/**
 * POST /api/admin/resources/[resourceType]/[resourceId]/lock
 * Acquire a lock on a resource
 */
export async function POST(request: NextRequest, { params }: { params: { resourceType: string, resourceId: string } }) {
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

    // Validate resource type and ID
    const { resourceType, resourceId } = params;
    if (!resourceType || !resourceId) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: 'Bad Request: Invalid or missing resource type or resource ID' 
        }),
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Check permission
    const hasPermission = await checkPermission(user, 'admin.resources.acquire-lock');
    if (!hasPermission) {
      // Log audit action
      await logAuditAction(
        user.id,
        'ACQUIRE_RESOURCE_LOCK',
        resourceType,
        resourceId,
        request,
        'failed',
        null,
        { message: 'Insufficient permissions' }
      );

      return new Response(
        JSON.stringify({ 
          success: false, 
          message: 'Forbidden: Insufficient permissions to acquire resource lock' 
        }),
        { 
          status: 403,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Parse request body
    const body = await request.json();
    const { timeoutMs } = body;

    // Validate timeout if provided
    if (timeoutMs !== undefined && (typeof timeoutMs !== 'number' || timeoutMs <= 0)) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: 'Bad Request: timeoutMs must be a positive number' 
        }),
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Acquire resource lock
    const lockResult = await acquireResourceLock(
      resourceType,
      resourceId,
      user.id,
      timeoutMs || 30000 // Default to 30 seconds
    );

    // Log audit action
    await logAuditAction(
      user.id,
      'ACQUIRE_RESOURCE_LOCK',
      resourceType,
      resourceId,
      request,
      lockResult.success ? 'success' : 'failed',
      null,
      { lockResult, timeoutMs: timeoutMs || 30000 }
    );

    return new Response(
      JSON.stringify(lockResult),
      { 
        status: lockResult.success ? 200 : 409, // 409 Conflict if resource is already locked
        headers: { 'Content-Type': 'application/json' }
      }
    );
  } catch (error) {
    console.error('Error in POST /api/admin/resources/[resourceType]/[resourceId]/lock:', error);
    
    // Log audit action for error
    try {
      const user = await authenticateAdmin(request);
      if (user) {
        const { resourceType, resourceId } = params;
        await logAuditAction(
          user.id,
          'ACQUIRE_RESOURCE_LOCK',
          resourceType,
          resourceId,
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
        message: 'Internal Server Error: Failed to acquire resource lock' 
      }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}

/**
 * DELETE /api/admin/resources/[resourceType]/[resourceId]/lock
 * Release a lock on a resource
 */
export async function DELETE(request: NextRequest, { params }: { params: { resourceType: string, resourceId: string } }) {
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

    // Validate resource type and ID
    const { resourceType, resourceId } = params;
    if (!resourceType || !resourceId) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: 'Bad Request: Invalid or missing resource type or resource ID' 
        }),
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Check permission
    const hasPermission = await checkPermission(user, 'admin.resources.release-lock');
    if (!hasPermission) {
      // Log audit action
      await logAuditAction(
        user.id,
        'RELEASE_RESOURCE_LOCK',
        resourceType,
        resourceId,
        request,
        'failed',
        null,
        { message: 'Insufficient permissions' }
      );

      return new Response(
        JSON.stringify({ 
          success: false, 
          message: 'Forbidden: Insufficient permissions to release resource lock' 
        }),
        { 
          status: 403,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Release resource lock
    const releaseResult = await releaseResourceLock(resourceType, resourceId, user.id);

    // Log audit action
    await logAuditAction(
      user.id,
      'RELEASE_RESOURCE_LOCK',
      resourceType,
      resourceId,
      request,
      releaseResult.success ? 'success' : 'failed',
      null,
      { releaseResult }
    );

    return new Response(
      JSON.stringify(releaseResult),
      { 
        status: releaseResult.success ? 200 : 400,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  } catch (error) {
    console.error('Error in DELETE /api/admin/resources/[resourceType]/[resourceId]/lock:', error);
    
    // Log audit action for error
    try {
      const user = await authenticateAdmin(request);
      if (user) {
        const { resourceType, resourceId } = params;
        await logAuditAction(
          user.id,
          'RELEASE_RESOURCE_LOCK',
          resourceType,
          resourceId,
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
        message: 'Internal Server Error: Failed to release resource lock' 
      }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}

/**
 * PUT /api/admin/resources/[resourceType]/[resourceId]/lock
 * Extend an existing lock on a resource
 */
export async function PUT(request: NextRequest, { params }: { params: { resourceType: string, resourceId: string } }) {
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

    // Validate resource type and ID
    const { resourceType, resourceId } = params;
    if (!resourceType || !resourceId) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: 'Bad Request: Invalid or missing resource type or resource ID' 
        }),
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Check permission
    const hasPermission = await checkPermission(user, 'admin.resources.extend-lock');
    if (!hasPermission) {
      // Log audit action
      await logAuditAction(
        user.id,
        'EXTEND_RESOURCE_LOCK',
        resourceType,
        resourceId,
        request,
        'failed',
        null,
        { message: 'Insufficient permissions' }
      );

      return new Response(
        JSON.stringify({ 
          success: false, 
          message: 'Forbidden: Insufficient permissions to extend resource lock' 
        }),
        { 
          status: 403,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Parse request body
    const body = await request.json();
    const { extensionMs } = body;

    // Validate extension time if provided
    if (extensionMs !== undefined && (typeof extensionMs !== 'number' || extensionMs <= 0)) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: 'Bad Request: extensionMs must be a positive number' 
        }),
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // First check if resource is locked by current user
    const lockStatus = await checkResourceLockStatus(resourceType, resourceId);
    
    if (!lockStatus.isLocked) {
      // Log audit action
      await logAuditAction(
        user.id,
        'EXTEND_RESOURCE_LOCK',
        resourceType,
        resourceId,
        request,
        'failed',
        null,
        { message: 'Resource is not locked', lockStatus }
      );

      return new Response(
        JSON.stringify({ 
          success: false, 
          message: 'Conflict: Resource is not locked' 
        }),
        { 
          status: 409,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    if (lockStatus.lockedBy.id !== user.id) {
      // Log audit action
      await logAuditAction(
        user.id,
        'EXTEND_RESOURCE_LOCK',
        resourceType,
        resourceId,
        request,
        'failed',
        null,
        { message: 'Resource locked by another user', lockStatus }
      );

      return new Response(
        JSON.stringify({ 
          success: false, 
          message: 'Conflict: Resource locked by another user' 
        }),
        { 
          status: 409,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Extend the resource lock
    const extendResult = await extendResourceLock(
      lockStatus.lockId,
      user.id,
      extensionMs || 30000 // Default to 30 seconds
    );

    // Log audit action
    await logAuditAction(
      user.id,
      'EXTEND_RESOURCE_LOCK',
      resourceType,
      resourceId,
      request,
      extendResult.success ? 'success' : 'failed',
      null,
      { extendResult, extensionMs: extensionMs || 30000 }
    );

    return new Response(
      JSON.stringify(extendResult),
      { 
        status: extendResult.success ? 200 : 400,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  } catch (error) {
    console.error('Error in PUT /api/admin/resources/[resourceType]/[resourceId]/lock:', error);
    
    // Log audit action for error
    try {
      const user = await authenticateAdmin(request);
      if (user) {
        const { resourceType, resourceId } = params;
        await logAuditAction(
          user.id,
          'EXTEND_RESOURCE_LOCK',
          resourceType,
          resourceId,
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
        message: 'Internal Server Error: Failed to extend resource lock' 
      }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}

/**
 * PATCH /api/admin/resources/[resourceType]/[resourceId]/lock
 * Force release a lock on a resource (admin only)
 */
export async function PATCH(request: NextRequest, { params }: { params: { resourceType: string, resourceId: string } }) {
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

    // Validate resource type and ID
    const { resourceType, resourceId } = params;
    if (!resourceType || !resourceId) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: 'Bad Request: Invalid or missing resource type or resource ID' 
        }),
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Check permission for force release
    const hasPermission = await checkPermission(user, 'admin.resources.force-release-lock');
    if (!hasPermission) {
      // Log audit action
      await logAuditAction(
        user.id,
        'FORCE_RELEASE_RESOURCE_LOCK',
        resourceType,
        resourceId,
        request,
        'failed',
        null,
        { message: 'Insufficient permissions' }
      );

      return new Response(
        JSON.stringify({ 
          success: false, 
          message: 'Forbidden: Insufficient permissions to force release resource lock' 
        }),
        { 
          status: 403,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // First check if resource is locked
    const lockStatus = await checkResourceLockStatus(resourceType, resourceId);
    
    if (!lockStatus.isLocked) {
      // Log audit action
      await logAuditAction(
        user.id,
        'FORCE_RELEASE_RESOURCE_LOCK',
        resourceType,
        resourceId,
        request,
        'failed',
        null,
        { message: 'Resource is not locked', lockStatus }
      );

      return new Response(
        JSON.stringify({ 
          success: false, 
          message: 'Conflict: Resource is not locked' 
        }),
        { 
          status: 409,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Force release the resource lock
    const forceReleaseResult = await forceReleaseLock(lockStatus.lockId, user.id);

    // Log audit action
    await logAuditAction(
      user.id,
      'FORCE_RELEASE_RESOURCE_LOCK',
      resourceType,
      resourceId,
      request,
      forceReleaseResult.success ? 'success' : 'failed',
      null,
      { forceReleaseResult, originalLockOwner: lockStatus.lockedBy.id }
    );

    return new Response(
      JSON.stringify(forceReleaseResult),
      { 
        status: forceReleaseResult.success ? 200 : 400,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  } catch (error) {
    console.error('Error in PATCH /api/admin/resources/[resourceType]/[resourceId]/lock:', error);
    
    // Log audit action for error
    try {
      const user = await authenticateAdmin(request);
      if (user) {
        const { resourceType, resourceId } = params;
        await logAuditAction(
          user.id,
          'FORCE_RELEASE_RESOURCE_LOCK',
          resourceType,
          resourceId,
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
        message: 'Internal Server Error: Failed to force release resource lock' 
      }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}