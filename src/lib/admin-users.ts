// src/lib/admin-users.ts
// Admin user management service

import db from './db';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

/**
 * Create a new admin user
 * @param userData - Object containing user data
 * @param userData.email - User's email address
 * @param userData.name - User's display name
 * @param userData.password - User's password (will be hashed)
 * @param userData.roleIds - Array of role IDs to assign to the user
 * @returns Promise<Object> - Result of the user creation
 */
export async function createAdminUser(userData: {
  email: string;
  name: string;
  password: string;
  roleIds?: string[];
}): Promise<any> {
  try {
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(userData.email)) {
      return {
        success: false,
        message: 'Invalid email format'
      };
    }

    // Check if user with this email already exists
    const existingUser = await db.adminUser.findUnique({
      where: { email: userData.email }
    });

    if (existingUser) {
      return {
        success: false,
        message: 'User with this email already exists'
      };
    }

    // Validate password strength
    if (userData.password.length < 8) {
      return {
        success: false,
        message: 'Password must be at least 8 characters long'
      };
    }

    // Hash the password
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(userData.password, saltRounds);

    // Create the new user
    const newUser = await db.adminUser.create({
      data: {
        id: uuidv4(),
        email: userData.email,
        name: userData.name,
        passwordHash,
        roleIds: userData.roleIds || [],
        isActive: true,
        createdAt: new Date(),
        lastLogin: null,
        personalizationSettings: null,
        lastAccessedResource: null,
        lastAccessedResourceLockTime: null
      }
    });

    // Remove password hash from response for security
    const { passwordHash: _, ...userWithoutPassword } = newUser;

    return {
      success: true,
      user: userWithoutPassword,
      message: 'Admin user created successfully'
    };
  } catch (error) {
    console.error('Error creating admin user:', error);
    return {
      success: false,
      message: 'Failed to create admin user'
    };
  }
}

/**
 * Update an existing admin user
 * @param userId - ID of the user to update
 * @param updateData - Object containing fields to update
 * @returns Promise<Object> - Result of the update operation
 */
export async function updateAdminUser(userId: string, updateData: any): Promise<any> {
  try {
    // Remove sensitive fields from update data
    const { passwordHash, id, createdAt, ...safeUpdateData } = updateData;

    // If password is being updated, hash it
    if (updateData.password) {
      const saltRounds = 10;
      safeUpdateData.passwordHash = await bcrypt.hash(updateData.password, saltRounds);
      delete safeUpdateData.password; // Remove plain text password
    }

    // Update the user
    const updatedUser = await db.adminUser.update({
      where: { id: userId },
      data: safeUpdateData
    });

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

/**
 * Get an admin user by ID
 * @param userId - ID of the user to retrieve
 * @returns Promise<Object> - User object or null if not found
 */
export async function getAdminUserById(userId: string): Promise<any> {
  try {
    const user = await db.adminUser.findUnique({
      where: { id: userId },
      include: {
        roles: true
      }
    });

    if (!user) {
      return null;
    }

    // Remove password hash from response for security
    const { passwordHash, ...userWithoutPassword } = user;

    return userWithoutPassword;
  } catch (error) {
    console.error('Error getting admin user by ID:', error);
    return null;
  }
}

/**
 * Get an admin user by email
 * @param email - Email of the user to retrieve
 * @returns Promise<Object> - User object or null if not found
 */
export async function getAdminUserByEmail(email: string): Promise<any> {
  try {
    const user = await db.adminUser.findUnique({
      where: { email },
      include: {
        roles: true
      }
    });

    if (!user) {
      return null;
    }

    // Remove password hash from response for security
    const { passwordHash, ...userWithoutPassword } = user;

    return userWithoutPassword;
  } catch (error) {
    console.error('Error getting admin user by email:', error);
    return null;
  }
}

/**
 * Get all admin users with pagination
 * @param limit - Number of users to return (default: 20)
 * @param offset - Number of users to skip (default: 0)
 * @param activeOnly - Whether to only return active users (default: true)
 * @returns Promise<Object> - Object containing users array and pagination info
 */
export async function getAllAdminUsers(
  limit: number = 20,
  offset: number = 0,
  activeOnly: boolean = true
): Promise<any> {
  try {
    // Build where clause
    const whereClause: any = {};
    if (activeOnly) {
      whereClause.isActive = true;
    }

    // Get users with pagination
    const users = await db.adminUser.findMany({
      where: whereClause,
      include: {
        roles: true
      },
      orderBy: {
        createdAt: 'desc'
      },
      skip: offset,
      take: limit
    });

    // Get total count for pagination
    const totalCount = await db.adminUser.count({
      where: whereClause
    });

    // Remove password hashes from response for security
    const usersWithoutPasswords = users.map(user => {
      const { passwordHash, ...userWithoutPassword } = user;
      return userWithoutPassword;
    });

    return {
      success: true,
      users: usersWithoutPasswords,
      pagination: {
        totalCount,
        limit,
        offset,
        hasNext: offset + users.length < totalCount
      }
    };
  } catch (error) {
    console.error('Error getting all admin users:', error);
    return {
      success: false,
      message: 'Failed to retrieve admin users'
    };
  }
}

/**
 * Delete an admin user
 * @param userId - ID of the user to delete
 * @returns Promise<Object> - Result of the deletion operation
 */
export async function deleteAdminUser(userId: string): Promise<any> {
  try {
    // Soft delete - set user as inactive instead of removing from database
    const deletedUser = await db.adminUser.update({
      where: { id: userId },
      data: {
        isActive: false,
        updatedAt: new Date()
      }
    });

    return {
      success: true,
      user: {
        id: deletedUser.id,
        email: deletedUser.email,
        name: deletedUser.name
      },
      message: 'Admin user deactivated successfully'
    };
  } catch (error) {
    console.error('Error deleting admin user:', error);
    return {
      success: false,
      message: 'Failed to delete admin user'
    };
  }
}

/**
 * Authenticate admin user login
 * @param email - User's email
 * @param password - User's password
 * @returns Promise<Object> - Authentication result
 */
export async function authenticateAdminUser(email: string, password: string): Promise<any> {
  try {
    // Find user by email
    const user = await db.adminUser.findUnique({
      where: { email }
    });

    // If user not found or is inactive
    if (!user || !user.isActive) {
      return {
        success: false,
        message: 'Invalid credentials'
      };
    }

    // Compare passwords
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

    if (!isPasswordValid) {
      return {
        success: false,
        message: 'Invalid credentials'
      };
    }

    // Update last login time
    const updatedUser = await db.adminUser.update({
      where: { id: user.id },
      data: {
        lastLogin: new Date()
      }
    });

    // Remove password hash from response for security
    const { passwordHash, ...userWithoutPassword } = updatedUser;

    return {
      success: true,
      user: userWithoutPassword,
      message: 'Authentication successful'
    };
  } catch (error) {
    console.error('Error authenticating admin user:', error);
    return {
      success: false,
      message: 'Authentication failed'
    };
  }
}

/**
 * Assign roles to an admin user
 * @param userId - ID of the user
 * @param roleIds - Array of role IDs to assign
 * @returns Promise<Object> - Result of the role assignment
 */
export async function assignRolesToAdminUser(userId: string, roleIds: string[]): Promise<any> {
  try {
    // Validate that all role IDs exist
    const roles = await db.role.findMany({
      where: {
        id: {
          in: roleIds
        },
        isActive: true
      }
    });

    // Check if all requested roles were found
    if (roles.length !== roleIds.length) {
      return {
        success: false,
        message: 'One or more roles not found or are inactive'
      };
    }

    // Update user's role IDs
    const updatedUser = await db.adminUser.update({
      where: { id: userId },
      data: {
        roleIds
      }
    });

    return {
      success: true,
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        name: updatedUser.name,
        roleIds: updatedUser.roleIds
      },
      message: 'Roles assigned successfully'
    };
  } catch (error) {
    console.error('Error assigning roles to admin user:', error);
    return {
      success: false,
      message: 'Failed to assign roles to user'
    };
  }
}

/**
 * Remove role from an admin user
 * @param userId - ID of the user
 * @param roleId - ID of the role to remove
 * @returns Promise<Object> - Result of the role removal
 */
export async function removeRoleFromAdminUser(userId: string, roleId: string): Promise<any> {
  try {
    // Get current user
    const user = await db.adminUser.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return {
        success: false,
        message: 'User not found'
      };
    }

    // Remove role ID from user's role IDs array
    const updatedRoleIds = user.roleIds.filter(id => id !== roleId);

    // Update user's role IDs
    const updatedUser = await db.adminUser.update({
      where: { id: userId },
      data: {
        roleIds: updatedRoleIds
      }
    });

    return {
      success: true,
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        name: updatedUser.name,
        roleIds: updatedUser.roleIds
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
 * Check if admin user has specific role
 * @param userId - ID of the user
 * @param roleName - Name of the role to check
 * @returns Promise<boolean> - Whether user has the role
 */
export async function adminUserHasRole(userId: string, roleName: string): Promise<boolean> {
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

    // Check if user has the specified role
    return user.roles.some(role => role.name === roleName);
  } catch (error) {
    console.error('Error checking admin user role:', error);
    return false;
  }
}

/**
 * Get admin users by role
 * @param roleName - Name of the role to filter by
 * @param limit - Number of users to return (default: 20)
 * @param offset - Number of users to skip (default: 0)
 * @returns Promise<Object> - Object containing users array and pagination info
 */
export async function getAdminUsersByRole(
  roleName: string,
  limit: number = 20,
  offset: number = 0
): Promise<any> {
  try {
    // Get users with the specified role
    const users = await db.adminUser.findMany({
      where: {
        roles: {
          some: {
            name: roleName
          }
        },
        isActive: true
      },
      include: {
        roles: true
      },
      orderBy: {
        createdAt: 'desc'
      },
      skip: offset,
      take: limit
    });

    // Get total count for pagination
    const totalCount = await db.adminUser.count({
      where: {
        roles: {
          some: {
            name: roleName
          }
        },
        isActive: true
      }
    });

    // Remove password hashes from response for security
    const usersWithoutPasswords = users.map(user => {
      const { passwordHash, ...userWithoutPassword } = user;
      return userWithoutPassword;
    });

    return {
      success: true,
      users: usersWithoutPasswords,
      pagination: {
        totalCount,
        limit,
        offset,
        hasNext: offset + users.length < totalCount
      }
    };
  } catch (error) {
    console.error('Error getting admin users by role:', error);
    return {
      success: false,
      message: 'Failed to retrieve admin users by role'
    };
  }
}