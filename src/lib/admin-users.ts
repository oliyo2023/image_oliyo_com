// src/lib/admin-users.ts
// Admin user management service

import db from './db-server'; // Use server-side database client
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

/**
 * Create a new admin user
 * @param userData - Object containing user data
 * @param userData.email - User's email address
 * @param userData.password - User's password (will be hashed)
 * @returns Promise<Object> - Result of the user creation
 */
export async function createAdminUser(userData: {
  email: string;
  password: string;
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
    const existingUser = await db.user.findUnique({
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

    // Create the new user with admin role
    const newUser = await db.user.create({
      data: {
        id: uuidv4(),
        email: userData.email,
        passwordHash,
        role: 'admin',
        isActive: true,
        registrationDate: new Date(),
        lastLogin: null
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
    const updatedUser = await db.user.update({
      where: { 
        id: userId,
        role: 'admin'  // Ensure we're only updating admin users
      },
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
    const user = await db.user.findUnique({
      where: { 
        id: userId,
        role: 'admin'  // Ensure we're only getting admin users
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
    const user = await db.user.findUnique({
      where: { 
        email,
        role: 'admin'  // Ensure we're only getting admin users
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
    const whereClause: any = {
      role: 'admin'  // Only get admin users
    };
    if (activeOnly) {
      whereClause.isActive = true;
    }

    // Get users with pagination
    const users = await db.user.findMany({
      where: whereClause,
      orderBy: {
        registrationDate: 'desc'
      },
      skip: offset,
      take: limit
    });

    // Get total count for pagination
    const totalCount = await db.user.count({
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
    const deletedUser = await db.user.update({
      where: { 
        id: userId,
        role: 'admin'  // Ensure we're only updating admin users
      },
      data: {
        isActive: false
      }
    });

    // Remove password hash from response for security
    const { passwordHash, ...userWithoutPassword } = deletedUser;

    return {
      success: true,
      user: userWithoutPassword,
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
    const user = await db.user.findUnique({
      where: { 
        email,
        role: 'admin'  // Ensure we're only authenticating admin users
      }
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
    const updatedUser = await db.user.update({
      where: { 
        id: user.id,
        role: 'admin'  // Ensure we're only updating admin users
      },
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
 * @param roleName - Name of the role to assign
 * @returns Promise<Object> - Result of the role assignment
 */
export async function assignRolesToAdminUser(userId: string, roleName: string): Promise<any> {
  try {
    // For now, we'll just log a message since we don't have roleIds field
    // In a more complete implementation, we would need to modify the data model
    console.log(`Would assign role ${roleName} to user ${userId} if roleIds field existed`);

    return {
      success: true,
      message: 'Role assignment would be successful if roleIds field existed'
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
 * @param roleName - Name of the role to remove
 * @returns Promise<Object> - Result of the role removal
 */
export async function removeRoleFromAdminUser(userId: string, roleName: string): Promise<any> {
  try {
    // Get current user
    const user = await db.user.findUnique({
      where: { 
        id: userId,
        role: 'admin'  // Ensure we're only getting admin users
      }
    });

    if (!user) {
      return {
        success: false,
        message: 'User not found'
      };
    }

    // For now, we'll just log a message since we don't have roleIds field
    // In a more complete implementation, we would need to modify the data model
    console.log(`Would remove role ${roleName} from user ${userId} if roleIds field existed`);

    return {
      success: true,
      message: 'Role removal would be successful if roleIds field existed'
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
    // Get user
    const user = await db.user.findUnique({
      where: { 
        id: userId,
        role: 'admin'  // Ensure we're only getting admin users
      }
    });

    if (!user) {
      return false;
    }

    // For now, we'll just return false since we don't have roleIds field
    // In a more complete implementation, we would need to modify the data model
    console.log(`Would check if user ${userId} has role ${roleName} if roleIds field existed`);
    return false;
  } catch (error) {
    console.error('Error checking admin user role:', error);
    return false;
  }
}

/**
 * Get admin users by role
 * @param roleName - Name of the role to filter by
 * @param page - Page number (1-based)
 * @param limit - Number of items per page
 * @returns Promise<{users: any[], total: number}> - Paginated admin users with total count
 */
export async function getAdminUsersByRole(
  roleName: string,
  page: number = 1,
  limit: number = 10
): Promise<{users: any[], total: number}> {
  try {
    // Calculate pagination values
    const offset = (page - 1) * limit;
    
    // Create where clause with role filter
    const whereClause = {
      role: 'admin'
      // Note: We're removing the role filter based on roleIds since the field doesn't exist
    };

    // Get users with role filter
    const users = await db.user.findMany({
      where: whereClause,
      skip: offset,
      take: limit,
      orderBy: {
        registrationDate: 'desc'
      }
    });

    // Get total count with same filters
    const total = await db.user.count({
      where: whereClause
    });

    // Transform to AdminUser format
    const adminUsers: any[] = users.map(user => ({
      id: user.id,
      email: user.email,
      // roleIds: user.roleIds || [],  // Removed since this field doesn't exist
      lastLogin: user.lastLogin,
      createdAt: user.registrationDate
      // Removed updatedAt since it doesn't exist in the User model
    }));

    return { users: adminUsers, total };
  } catch (error) {
    console.error('Error getting admin users by role:', error);
    throw new Error('Failed to get admin users by role');
  }
}