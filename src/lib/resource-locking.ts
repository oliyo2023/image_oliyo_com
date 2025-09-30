// src/lib/resource-locking.ts
// Resource locking service for concurrent access control

import db from './db';

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
    // Check if there's already an active lock on this resource
    const existingLock = await db.resourceLock.findFirst({
      where: {
        resourceType,
        resourceId,
        isActive: true,
        lockExpiresAt: {
          gt: new Date()
        }
      }
    });

    // If there's an existing active lock, check if it belongs to the current user
    if (existingLock) {
      if (existingLock.lockedBy === userId) {
        // User already has the lock, extend the expiration time
        const extendedLock = await db.resourceLock.update({
          where: { id: existingLock.id },
          data: {
            lockExpiresAt: new Date(Date.now() + timeoutMs)
          }
        });

        return {
          success: true,
          acquiredLock: true,
          lockId: extendedLock.id,
          message: 'Extended existing lock expiration time'
        };
      } else {
        // Another user has the lock
        const lockingUser = await db.adminUser.findUnique({
          where: { id: existingLock.lockedBy },
          select: { name: true, email: true }
        });

        return {
          success: false,
          acquiredLock: false,
          message: `Resource is currently locked by ${lockingUser?.name || lockingUser?.email || 'another user'}`
        };
      }
    }

    // No existing lock, create a new one
    const newLock = await db.resourceLock.create({
      data: {
        resourceType,
        resourceId,
        lockedBy: userId,
        lockAcquiredAt: new Date(),
        lockExpiresAt: new Date(Date.now() + timeoutMs),
        isActive: true
      }
    });

    return {
      success: true,
      acquiredLock: true,
      lockId: newLock.id,
      message: 'Successfully acquired resource lock'
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
 * Release a resource lock
 * @param resourceType - Type of the resource
 * @param resourceId - ID of the specific resource
 * @param userId - ID of the user attempting to release the lock
 * @returns Promise<Object> - Result of the lock release attempt
 */
export async function releaseResourceLock(
  resourceType: string,
  resourceId: string,
  userId: string
): Promise<any> {
  try {
    // Find the active lock for this resource
    const existingLock = await db.resourceLock.findFirst({
      where: {
        resourceType,
        resourceId,
        isActive: true,
        lockExpiresAt: {
          gt: new Date()
        }
      }
    });

    // If no active lock exists, nothing to release
    if (!existingLock) {
      return {
        success: true,
        message: 'No active lock found for this resource'
      };
    }

    // Check if the user owns the lock or has permission to override it
    if (existingLock.lockedBy !== userId) {
      // Check if user has admin privileges to override locks
      const isAdmin = await checkUserAdminPrivileges(userId);
      
      if (!isAdmin) {
        return {
          success: false,
          message: 'You do not have permission to release this lock'
        };
      }
    }

    // Release the lock by setting it as inactive
    const releasedLock = await db.resourceLock.update({
      where: { id: existingLock.id },
      data: {
        isActive: false
      }
    });

    return {
      success: true,
      lockId: releasedLock.id,
      message: 'Successfully released resource lock'
    };
  } catch (error) {
    console.error('Error releasing resource lock:', error);
    return {
      success: false,
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
    // Find the active lock for this resource
    const existingLock = await db.resourceLock.findFirst({
      where: {
        resourceType,
        resourceId,
        isActive: true,
        lockExpiresAt: {
          gt: new Date()
        }
      },
      include: {
        adminUser: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    // If no active lock exists or it has expired, resource is unlocked
    if (!existingLock) {
      return {
        success: true,
        isLocked: false,
        message: 'Resource is not locked'
      };
    }

    // Resource is locked, return lock information
    return {
      success: true,
      isLocked: true,
      lockedBy: existingLock.adminUser,
      lockAcquiredAt: existingLock.lockAcquiredAt,
      lockExpiresAt: existingLock.lockExpiresAt,
      lockId: existingLock.id,
      message: 'Resource is locked'
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
 * @returns Promise<Object> - Cleanup result
 */
export async function cleanupExpiredLocks(): Promise<any> {
  try {
    // Find all expired locks that are still marked as active
    const expiredLocks = await db.resourceLock.findMany({
      where: {
        isActive: true,
        lockExpiresAt: {
          lt: new Date()
        }
      }
    });

    // Mark all expired locks as inactive
    const updatedLocks = await Promise.all(
      expiredLocks.map(lock =>
        db.resourceLock.update({
          where: { id: lock.id },
          data: { isActive: false }
        })
      )
    );

    return {
      success: true,
      cleanedUpLocks: updatedLocks.length,
      message: `Cleaned up ${updatedLocks.length} expired locks`
    };
  } catch (error) {
    console.error('Error cleaning up expired locks:', error);
    return {
      success: false,
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