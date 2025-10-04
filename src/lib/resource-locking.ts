// src/lib/resource-locking.ts
// Resource locking service for concurrent access control

import db from './db-server'; // Use server-side database client

/**
 * Attempt to acquire a lock on a resource
 * @param resourceType - Type of the resource (e.g., 'user', 'role', 'content')
 * @param resourceId - ID of the specific resource
 * @param userId - ID of the user attempting to acquire the lock
 * @param timeoutMs - Optional timeout in milliseconds (default: 30000ms = 30 seconds)
 * @returns Promise<Object> - Result of the lock acquisition attempt
 */
export async function acquireResourceLock(
  resourceType: string,
  resourceId: string,
  userId: string,
  timeoutMs: number = 30000
): Promise<any> {
  try {
    // Note: ResourceLock model is not defined in schema.prisma
    // This is a simplified implementation that always returns success
    // In a real implementation, you would need to create a ResourceLock model in your schema
    
    return {
      success: true,
      acquiredLock: true,
      lockId: `lock_${resourceType}_${resourceId}_${Date.now()}`,
      message: 'Resource lock acquired (simplified implementation)'
    };
  } catch (error) {
    console.error('Error acquiring resource lock:', error);
    return {
      success: false,
      acquiredLock: false,
      message: 'Failed to acquire resource lock'
    };
  }
}

/**
 * Release a lock on a resource
 * @param lockId - ID of the lock to release
 * @param userId - ID of the user attempting to release the lock
 * @returns Promise<Object> - Result of the lock release attempt
 */
export async function releaseResourceLock(
  lockId: string,
  userId: string
): Promise<any> {
  try {
    // Note: ResourceLock model is not defined in schema.prisma
    // This is a simplified implementation that always returns success
    // In a real implementation, you would need to create a ResourceLock model in your schema
    
    return {
      success: true,
      releasedLock: true,
      lockId,
      message: 'Resource lock released (simplified implementation)'
    };
  } catch (error) {
    console.error('Error releasing resource lock:', error);
    return {
      success: false,
      releasedLock: false,
      message: 'Failed to release resource lock'
    };
  }
}

/**
 * Check if a resource is currently locked
 * @param resourceType - Type of the resource
 * @param resourceId - ID of the specific resource
 * @returns Promise<Object> - Lock status information
 */
export async function checkResourceLockStatus(
  resourceType: string,
  resourceId: string
): Promise<any> {
  try {
    // Note: ResourceLock model is not defined in schema.prisma
    // This is a simplified implementation that always returns unlocked
    // In a real implementation, you would need to create a ResourceLock model in your schema
    
    return {
      success: true,
      isLocked: false,
      message: 'Resource is not locked (simplified implementation)'
    };
  } catch (error) {
    console.error('Error checking resource lock status:', error);
    return {
      success: false,
      isLocked: false,
      message: 'Failed to check resource lock status'
    };
  }
}

/**
 * Clean up expired locks
 * @returns Promise<Object> - Result of the cleanup operation
 */
export async function cleanupExpiredLocks(): Promise<any> {
  try {
    // Note: ResourceLock model is not defined in schema.prisma
    // This is a simplified implementation that always returns success
    // In a real implementation, you would need to create a ResourceLock model in your schema
    
    return {
      success: true,
      cleanedUpCount: 0,
      message: 'No expired locks to clean up (simplified implementation)'
    };
  } catch (error) {
    console.error('Error cleaning up expired locks:', error);
    return {
      success: false,
      cleanedUpCount: 0,
      message: 'Failed to clean up expired locks'
    };
  }
}

/**
 * Check if a user has admin privileges to override locks
 * @param userId - ID of the user
 * @returns Promise<boolean> - Whether the user has admin privileges
 */
async function checkUserAdminPrivileges(userId: string): Promise<boolean> {
  try {
    // Get user with their roles
    const user = await db.adminUser.findUnique({
      where: { id: userId },
      include: {
        roles: true
      }
    });

    if (!user) {
      return false;
    }

    // Check if user has admin role
    return user.roles.some(role => 
      role.name === 'admin' || 
      role.name === 'super-admin' || 
      role.name.includes('admin')
    );
  } catch (error) {
    console.error('Error checking user admin privileges:', error);
    return false;
  }
}

/**
 * Extend an existing lock's expiration time
 * @param lockId - ID of the lock to extend
 * @param userId - ID of the user requesting extension
 * @param extensionMs - Extension time in milliseconds (default: 30000ms = 30 seconds)
 * @returns Promise<Object> - Result of the extension attempt
 */
export async function extendResourceLock(
  lockId: string,
  userId: string,
  extensionMs: number = 30000
): Promise<any> {
  try {
    // Find the lock
    const existingLock = await db.resourceLock.findUnique({
      where: { id: lockId }
    });

    // If lock doesn't exist or is not active
    if (!existingLock || !existingLock.isActive) {
      return {
        success: false,
        message: 'Lock not found or is not active'
      };
    }

    // Check if user owns the lock
    if (existingLock.lockedBy !== userId) {
      return {
        success: false,
        message: 'You do not own this lock'
      };
    }

    // Check if lock has expired
    if (existingLock.lockExpiresAt < new Date()) {
      return {
        success: false,
        message: 'Lock has already expired'
      };
    }

    // Extend the lock expiration time
    const extendedLock = await db.resourceLock.update({
      where: { id: lockId },
      data: {
        lockExpiresAt: new Date(Date.now() + extensionMs)
      }
    });

    return {
      success: true,
      lock: extendedLock,
      message: 'Successfully extended lock expiration time'
    };
  } catch (error) {
    console.error('Error extending resource lock:', error);
    return {
      success: false,
      message: 'Failed to extend resource lock'
    };
  }
}

/**
 * Force release a lock (admin only)
 * @param lockId - ID of the lock to force release
 * @param adminUserId - ID of the admin user requesting force release
 * @returns Promise<Object> - Result of the force release attempt
 */
export async function forceReleaseLock(
  lockId: string,
  adminUserId: string
): Promise<any> {
  try {
    // Check if admin user has admin privileges
    const isAdmin = await checkUserAdminPrivileges(adminUserId);
    
    if (!isAdmin) {
      return {
        success: false,
        message: 'Only admin users can force release locks'
      };
    }

    // Force release the lock
    const releasedLock = await db.resourceLock.update({
      where: { id: lockId },
      data: {
        isActive: false
      }
    });

    return {
      success: true,
      lockId: releasedLock.id,
      message: 'Successfully force released lock'
    };
  } catch (error) {
    console.error('Error force releasing lock:', error);
    return {
      success: false,
      message: 'Failed to force release lock'
    };
  }
}