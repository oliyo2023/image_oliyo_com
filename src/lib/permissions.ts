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
    const user = await db.adminUser.findUnique({
      where: { id: userId },
      include: {
        roles: {
          include: {
            permissions: true
          }
        }
      }
    });

    if (!user) {
      return false;
    }

    // Flatten all permissions from all roles
    const allPermissions = user.roles.flatMap(role => role.permissions);
    
    // Check if user has the requested permission
    return allPermissions.some(permission => permission.name === permissionName);
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
    const user = await db.adminUser.findUnique({
      where: { id: userId },
      include: {
        roles: {
          include: {
            permissions: true
          }
        }
      }
    });

    if (!user) {
      return [];
    }

    // Flatten all permissions from all roles and remove duplicates
    const allPermissions = user.roles.flatMap(role => role.permissions);
    const uniquePermissions = Array.from(
      new Map(allPermissions.map(permission => [permission.name, permission])).values()
    );

    return uniquePermissions;
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
    const user = await db.adminUser.findUnique({
      where: { id: userId },
      include: {
        roles: true
      }
    });

    if (!user) {
      return false;
    }

    return user.roles.some(role => role.name === roleName);
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
    const user = await db.adminUser.findUnique({
      where: { id: userId },
      include: {
        roles: true
      }
    });

    if (!user) {
      return [];
    }

    return user.roles;
  } catch (error) {
    console.error('Error getting user roles:', error);
    return [];
  }
}

/**
 * Create a new role
 * @param roleName - The name of the role
 * @param description - The description of the role
 * @param permissionIds - Array of permission IDs to assign to the role
 * @param createdBy - The ID of the user creating the role
 * @returns Promise<Object> - The created role object
 */
export async function createRole(roleName: string, description: string, permissionIds: string[], createdBy: string): Promise<any> {
  try {
    const role = await db.role.create({
      data: {
        name: roleName,
        description,
        permissionIds,
        createdBy
      }
    });

    return {
      success: true,
      role
    };
  } catch (error) {
    console.error('Error creating role:', error);
    return {
      success: false,
      message: 'Failed to create role'
    };
  }
}

/**
 * Update an existing role
 * @param roleId - The ID of the role to update
 * @param updateData - Object containing fields to update
 * @returns Promise<Object> - The updated role object
 */
export async function updateRole(roleId: string, updateData: any): Promise<any> {
  try {
    const role = await db.role.update({
      where: { id: roleId },
      data: updateData
    });

    return {
      success: true,
      role
    };
  } catch (error) {
    console.error('Error updating role:', error);
    return {
      success: false,
      message: 'Failed to update role'
    };
  }
}

/**
 * Get all roles
 * @param activeOnly - Whether to only return active roles (default: true)
 * @returns Promise<Array> - Array of role objects
 */
export async function getAllRoles(activeOnly: boolean = true): Promise<any[]> {
  try {
    const whereClause = activeOnly ? { isActive: true } : {};

    const roles = await db.role.findMany({
      where: whereClause,
      orderBy: {
        createdAt: 'desc'
      }
    });

    return roles;
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
export async function assignRolesToUser(userId: string, roleIds: string[]): Promise<any> {
  try {
    const user = await db.adminUser.update({
      where: { id: userId },
      data: {
        roleIds: roleIds
      }
    });

    return {
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        roleIds: user.roleIds
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
 * Check if a role has a specific permission
 * @param roleId - The ID of the role
 * @param permissionName - The name of the permission to check
 * @returns Promise<boolean> - Whether the role has the permission
 */
export async function roleHasPermission(roleId: string, permissionName: string): Promise<boolean> {
  try {
    const role = await db.role.findUnique({
      where: { id: roleId },
      include: {
        permissions: true
      }
    });

    if (!role) {
      return false;
    }

    return role.permissions.some(permission => permission.name === permissionName);
  } catch (error) {
    console.error('Error checking role permissions:', error);
    return false;
  }
}

// Removed duplicate createRole function - keeping the first definition

// Removed duplicate getAllRoles function - keeping the first definition

/**
 * Get a role by ID
 * @param roleId - The ID of the role to retrieve
 * @returns Promise<Object|null> - Role object or null if not found
 */
export async function getRoleById(roleId: string): Promise<any | null> {
  try {
    // Get role by ID
    const role = await db.role.findUnique({
      where: { id: roleId }
    });

    return role;
  } catch (error) {
    console.error('Error getting role by ID:', error);
    return null;
  }
}

// Removed duplicate updateRole function - keeping the first definition