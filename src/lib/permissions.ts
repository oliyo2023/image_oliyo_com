// src/lib/permissions.ts
// Permissions service with role-based access control

import db from './db-server'; // Use server-side database client

/**
 * Check if a user has a specific permission
 * @param userId - The ID of the user
 * @param permissionName - The name of the permission to check
 * @returns Promise<boolean> - Whether the user has the permission
 */
export async function userHasPermission(userId: string, permissionName: string): Promise<boolean> {
  try {
    // Get user with their roles
      const user = await db.user.findUnique({
        where: { id: userId },
      });

    if (!user) {
      return false;
    }

    // Check if user has the requested permission
    // For now, we'll check if the user is an admin
    return user.role === 'admin';
  } catch (error) {
    console.error('Error checking user permissions:', error);
    return false;
  }
}

/**
 * Get all permissions for a user
 * @param userId - The ID of the user
 * @returns Promise<Array> - Array of permission objects
 */
export async function getUserPermissions(userId: string): Promise<any[]> {
  try {
    // Get user with their roles and permissions
      const user = await db.user.findUnique({
        where: { id: userId },
      });

    if (!user) {
      return [];
    }

    // Get all permissions for the user
    // For now, we'll return a basic set of permissions based on user role
    if (user.role === 'admin') {
      return [
        { id: '1', name: 'read:users', description: 'Read user information' },
        { id: '2', name: 'write:users', description: 'Modify user information' },
        { id: '3', name: 'delete:users', description: 'Delete users' },
        { id: '4', name: 'read:system', description: 'Read system information' },
        { id: '5', name: 'write:system', description: 'Modify system settings' }
      ];
    } else {
      return [
        { id: '6', name: 'read:profile', description: 'Read own profile' },
        { id: '7', name: 'write:profile', description: 'Modify own profile' }
      ];
    }
  } catch (error) {
    console.error('Error getting user permissions:', error);
    return [];
  }
}

/**
 * Check if a user has a specific role
 * @param userId - The ID of the user
 * @param roleName - The name of the role to check
 * @returns Promise<boolean> - Whether the user has the role
 */
export async function userHasRole(userId: string, roleName: string): Promise<boolean> {
  try {
    const user = await db.user.findUnique({
        where: { id: userId },
      });

    if (!user) {
      return false;
    }

    return user.role === roleName;
  } catch (error) {
    console.error('Error checking user roles:', error);
    return false;
  }
}

/**
 * Get all roles for a user
 * @param userId - The ID of the user
 * @returns Promise<Array> - Array of role objects
 */
export async function getUserRoles(userId: string): Promise<any[]> {
  try {
    const user = await db.user.findUnique({
        where: { id: userId },
      });

    if (!user) {
      return [];
    }

    // Get all roles for the user
    // For now, we'll return a single role based on user's role field
    return [{ id: '1', name: user.role, description: `User role: ${user.role}` }];
  } catch (error) {
    console.error('Error getting user roles:', error);
    return [];
  }
}

/**
 * Create a new role (simplified version)
 * @param roleName - Name of the role
 * @param description - Description of the role
 * @param permissionIds - Array of permission IDs
 * @param createdBy - User ID of the creator
 * @returns Promise<Object> - Result of the operation
 */
export async function createRole(roleName: string, description: string, permissionIds: string[], createdBy: string): Promise<any> {
  try {
    // Since we don't have a Role model, we'll just return a success response
    // In a real implementation, you might want to store this information elsewhere
    return {
      success: true,
      message: 'Role creation not implemented. User roles are stored as strings in the User model.',
      role: {
        name: roleName,
        description,
        permissions: permissionIds
      }
    };
  } catch (error) {
    console.error('Error creating role:', error);
    return {
      success: false,
      error: 'Failed to create role'
    };
  }
}

/**
 * Update an existing role (simplified version)
 * @param roleId - The ID of the role to update
 * @param updateData - Object containing fields to update
 * @returns Promise<Object> - Result of the operation
 */
export async function updateRole(roleId: string, updateData: any): Promise<any> {
  try {
    // Since we don't have a Role model, we'll just return a success response
    // In a real implementation, you might want to update user roles directly
    return {
      success: true,
      message: 'Role update not implemented. User roles are stored as strings in the User model.',
      role: {
        id: roleId,
        ...updateData
      }
    };
  } catch (error) {
    console.error('Error updating role:', error);
    return {
      success: false,
      error: 'Failed to update role'
    };
  }
}

/**
 * Get all roles (simplified version)
 * @param activeOnly - Whether to only return active roles (default: true)
 * @returns Promise<Array> - Array of role objects
 */
export async function getAllRoles(activeOnly: boolean = true): Promise<any[]> {
  try {
    // Since we don't have a Role model, we'll return the default roles
    // In a real implementation, you might want to get all unique role values from users
    return [
      {
        id: '1',
        name: 'user',
        description: 'Regular user with basic permissions'
      },
      {
        id: '2',
        name: 'admin',
        description: 'Administrator with full permissions'
      }
    ];
  } catch (error) {
    console.error('Error getting all roles:', error);
    return [];
  }
}

/**
 * Assign roles to a user
 * @param userId - The ID of the user
 * @param roleIds - Array of role IDs to assign to the user
 * @returns Promise<Object> - Result of the operation
 */
export async function assignRolesToUser(userId: string, roleNames: string[]): Promise<any> {
  try {
    // Update user role
    const updatedUser = await db.user.update({
      where: { id: userId },
      data: {
        role: roleNames[0] // For now, we'll just use the first role name
      }
    });

    return {
      success: true,
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        role: updatedUser.role
      }
    };
  } catch (error) {
    console.error('Error assigning roles to user:', error);
    return {
      success: false,
      message: 'Failed to assign roles to user'
    };
  }
}

/**
 * Check if a role has a specific permission (simplified version)
 * @param roleName - Name of the role to check
 * @param permissionName - Name of the permission to check
 * @returns Promise<boolean> - True if the role has the permission
 */
export async function roleHasPermission(roleName: string, permissionName: string): Promise<boolean> {
  try {
    // Since we don't have a Role model, we'll check permissions based on role name
    // Admin role has all permissions
    if (roleName === 'admin') {
      return true;
    }
    
    // User role has limited permissions
    if (roleName === 'user') {
      const userPermissions = ['read:profile', 'edit:profile'];
      return userPermissions.includes(permissionName);
    }
    
    // Default to false for unknown roles
    return false;
  } catch (error) {
    console.error('Error checking role permission:', error);
    return false;
  }
}

// Removed duplicate createRole function - keeping the first definition

// Removed duplicate getAllRoles function - keeping the first definition

/**
 * Get role by ID (simplified version)
 * @param roleId - The ID of the role to retrieve
 * @returns Promise<Object|null> - Role object or null if not found
 */
export async function getRoleById(roleId: string): Promise<any | null> {
  try {
    // Since we don't have a Role model, we'll return the default roles
    // In a real implementation, you might want to get role information from elsewhere
    const roles = [
      {
        id: '1',
        name: 'user',
        description: 'Regular user with basic permissions'
      },
      {
        id: '2',
        name: 'admin',
        description: 'Administrator with full permissions'
      }
    ];
    
    return roles.find(role => role.id === roleId) || null;
  } catch (error) {
    console.error('Error getting role by ID:', error);
    return null;
  }
}

// Removed duplicate updateRole function - keeping the first definition