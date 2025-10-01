// src/middleware.ts
// Middleware for admin authentication, permission checking, and security

import { NextRequest, NextFetchEvent } from 'next/server';
import jwt from 'jsonwebtoken';
import db from './lib/db';

// JWT secret from environment variables
const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_for_development';

/**
 * Admin authentication middleware
 * @param request - Next.js request object
 * @param event - Next.js fetch event
 * @returns Promise<Object|null> - User object if authenticated, null otherwise
 */
export async function authenticateAdmin(request: NextRequest, event: NextFetchEvent): Promise<any | null> {
  try {
    // Extract token from Authorization header
    const authHeader = request.headers.get('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }
    
    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    
    // Verify JWT token
    const decoded: any = jwt.verify(token, JWT_SECRET);
    
    // Get user from database
    const user = await db.adminUser.findUnique({
      where: { id: decoded.userId },
      include: {
        roles: true
      }
    });
    
    if (!user || !user.isActive) {
      return null;
    }
    
    // Update last login time
    await db.adminUser.update({
      where: { id: user.id },
      data: { lastLogin: new Date() }
    });
    
    return user;
  } catch (error) {
    console.error('Error authenticating admin user:', error);
    return null;
  }
}

/**
 * Permission checking middleware
 * @param user - User object
 * @param requiredPermission - Required permission name
 * @returns Promise<boolean> - Whether user has required permission
 */
export async function checkPermission(user: any, requiredPermission: string): Promise<boolean> {
  try {
    // Super admin users have all permissions
    if (user.roles.some((role: any) => role.name === 'super-admin')) {
      return true;
    }
    
    // Get all permissions for user's roles
    const rolePermissions = await db.role.findMany({
      where: {
        id: {
          in: user.roleIds
        }
      },
      include: {
        permissions: true
      }
    });
    
    // Flatten permissions from all roles
    const allPermissions = rolePermissions.flatMap(role => role.permissions);
    
    // Check if user has required permission
    return allPermissions.some(permission => permission.name === requiredPermission);
  } catch (error) {
    console.error('Error checking user permissions:', error);
    return false;
  }
}

/**
 * Resource locking middleware
 * @param request - Next.js request object
 * @param resourceType - Type of resource being accessed
 * @param resourceId - ID of the specific resource
 * @param userId - ID of the user accessing the resource
 * @returns Promise<Object> - Lock status result
 */
export async function checkResourceLock(
  request: NextRequest,
  resourceType: string,
  resourceId: string,
  userId: string
): Promise<any> {
  try {
    // Check if resource is locked
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
    
    // If resource is not locked, allow access
    if (!existingLock) {
      return {
        isLocked: false,
        message: 'Resource is not locked'
      };
    }
    
    // If user already has the lock, allow access
    if (existingLock.lockedBy === userId) {
      return {
        isLocked: false,
        hasLock: true,
        message: 'User already has lock on this resource'
      };
    }
    
    // Resource is locked by another user
    return {
      isLocked: true,
      lockedBy: existingLock.adminUser,
      lockAcquiredAt: existingLock.lockAcquiredAt,
      lockExpiresAt: existingLock.lockExpiresAt,
      message: 'Resource is currently locked by another user'
    };
  } catch (error) {
    console.error('Error checking resource lock:', error);
    return {
      isLocked: false,
      error: 'Failed to check resource lock status'
    };
  }
}

/**
 * Rate limiting middleware
 * @param request - Next.js request object
 * @param maxRequests - Maximum requests allowed (default: 100)
 * @param windowMs - Time window in milliseconds (default: 60000 = 1 minute)
 * @returns Promise<boolean> - Whether request is allowed
 */
export async function rateLimit(
  request: NextRequest,
  maxRequests: number = 100,
  windowMs: number = 60000
): Promise<boolean> {
  try {
    // Get client IP address
    const clientIp = request.headers.get('x-forwarded-for') || 
                     request.headers.get('x-real-ip') || 
                     'unknown';
    
    // In a real implementation, you would use Redis or similar to track requests
    // For this example, we'll just allow all requests
    return true;
  } catch (error) {
    console.error('Error applying rate limit:', error);
    // Allow request on error to avoid blocking legitimate traffic
    return true;
  }
}

/**
 * Security headers middleware
 * @param request - Next.js request object
 * @returns Object - Security headers
 */
export function getSecurityHeaders(request: NextRequest): any {
  return {
    // Prevent XSS attacks
    'X-XSS-Protection': '1; mode=block',
    // Prevent MIME type sniffing
    'X-Content-Type-Options': 'nosniff',
    // Prevent clickjacking
    'X-Frame-Options': 'DENY',
    // Content Security Policy
    'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self'",
    // Referrer policy
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    // Strict transport security (for HTTPS)
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload'
  };
}

/**
 * Input sanitization middleware
 * @param inputData - Input data to sanitize
 * @returns any - Sanitized input data
 */
export function sanitizeInput(inputData: any): any {
  // If string, sanitize for XSS
  if (typeof inputData === 'string') {
    return inputData
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .trim();
  }
  
  // If object, recursively sanitize properties
  if (typeof inputData === 'object' && inputData !== null) {
    const sanitizedData: any = {};
    
    for (const key in inputData) {
      if (inputData.hasOwnProperty(key)) {
        sanitizedData[key] = sanitizeInput(inputData[key]);
      }
    }
    
    return sanitizedData;
  }
  
  // For other types (number, boolean, etc.), return as-is
  return inputData;
}

/**
 * Audit logging middleware
 * @param userId - ID of the user performing the action
 * @param action - Action being performed
 * @param resourceType - Type of resource being accessed
 * @param resourceId - ID of the specific resource
 * @param request - Next.js request object
 * @param outcome - Outcome of the action ('success', 'failed', 'error')
 * @param beforeValue - Value before the action (optional)
 * @param afterValue - Value after the action (optional)
 * @returns Promise<void>
 */
export async function logAuditAction(
  userId: string,
  action: string,
  resourceType: string,
  resourceId: string,
  request: NextRequest,
  outcome: string,
  beforeValue?: any,
  afterValue?: any
): Promise<void> {
  try {
    // Get client IP address
    const clientIp = request.headers.get('x-forwarded-for') || 
                     request.headers.get('x-real-ip') || 
                     request.ip || 
                     'unknown';
    
    // Get user agent
    const userAgent = request.headers.get('user-agent') || '';
    
    // Get session ID from cookie or header
    const sessionId = request.cookies.get('session-id')?.value || 
                      request.headers.get('x-session-id') || 
                      'unknown';
    
    // Create audit log entry
    await db.auditLog.create({
      data: {
        userId,
        action,
        resourceType,
        resourceId,
        timestamp: new Date(),
        ipAddress: clientIp,
        userAgent,
        sessionId,
        actionOutcome: outcome,
        beforeValue: beforeValue ? JSON.stringify(beforeValue) : null,
        afterValue: afterValue ? JSON.stringify(afterValue) : null,
        metadata: JSON.stringify({
          url: request.url,
          method: request.method,
          userAgent
        })
      }
    });
  } catch (error) {
    console.error('Error logging audit action:', error);
    // Don't throw error as this shouldn't block the main operation
  }
}

/**
 * CSRF protection middleware
 * @param request - Next.js request object
 * @returns Promise<boolean> - Whether CSRF token is valid
 */
export async function validateCSRFToken(request: NextRequest): Promise<boolean> {
  try {
    // Get CSRF token from header
    const csrfToken = request.headers.get('x-csrf-token');
    
    // In a real implementation, you would validate the token against stored tokens
    // For this example, we'll just check if it exists
    return !!csrfToken;
  } catch (error) {
    console.error('Error validating CSRF token:', error);
    return false;
  }
}

/**
 * API key authentication middleware
 * @param request - Next.js request object
 * @returns Promise<Object|null> - API key info if valid, null otherwise
 */
export async function authenticateAPIKey(request: NextRequest): Promise<any | null> {
  try {
    // Get API key from Authorization header
    const authHeader = request.headers.get('Authorization');
    
    if (!authHeader || !authHeader.startsWith('ApiKey ')) {
      return null;
    }
    
    const apiKey = authHeader.substring(7); // Remove 'ApiKey ' prefix
    
    // In a real implementation, you would validate the API key against stored keys
    // For this example, we'll just check if it exists
    if (!apiKey) {
      return null;
    }
    
    // Return mock API key info
    return {
      id: 'mock-api-key-id',
      name: 'Mock API Key',
      permissions: ['read', 'write']
    };
  } catch (error) {
    console.error('Error authenticating API key:', error);
    return null;
  }
}

/**
 * Validate and sanitize URL parameters
 * @param params - URL parameters object
 * @returns Object - Validated and sanitized parameters
 */
export function validateAndSanitizeURLParams(params: any): any {
  const sanitizedParams: any = {};

  for (const key in params) {
    if (params.hasOwnProperty(key) && params[key] !== null && params[key] !== undefined) {
      const value = params[key];
      
      // Sanitize string values
      if (typeof value === 'string') {
        sanitizedParams[key] = value
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/"/g, '&quot;')
          .replace(/'/g, '&#x27;')
          .trim();
      } 
      // Parse numeric values
      else if (typeof value === 'string' && !isNaN(Number(value))) {
        sanitizedParams[key] = Number(value);
      } 
      // Parse boolean values
      else if (value === 'true' || value === 'false') {
        sanitizedParams[key] = value === 'true';
      }
      // Pass through other values (numbers, booleans, etc.)
      else {
        sanitizedParams[key] = value;
      }
    }
  }

  return sanitizedParams;
}

/**
 * Validate date range parameters
 * @param startDate - Start date parameter
 * @param endDate - End date parameter
 * @param maxDays - Maximum number of days allowed in range (default: 365)
 * @returns Object - Validated date range or error
 */
export function validateDateRange(
  startDate: any,
  endDate: any,
  maxDays: number = 365
): { isValid: boolean; startDate?: Date; endDate?: Date; error?: string } {
  try {
    // If no dates provided, return valid with no dates
    if (!startDate && !endDate) {
      return {
        isValid: true
      };
    }

    // Parse dates
    const start = new Date(startDate);
    const end = new Date(endDate);

    // Check if dates are valid
    if (startDate && isNaN(start.getTime())) {
      return {
        isValid: false,
        error: 'Invalid start date'
      };
    }

    if (endDate && isNaN(end.getTime())) {
      return {
        isValid: false,
        error: 'Invalid end date'
      };
    }

    // If only start date provided
    if (startDate && !endDate) {
      return {
        isValid: true,
        startDate: start
      };
    }

    // If only end date provided
    if (!startDate && endDate) {
      return {
        isValid: true,
        endDate: end
      };
    }

    // Ensure start date is before end date
    if (start > end) {
      return {
        isValid: false,
        error: 'Start date must be before end date'
      };
    }

    // Check date range is not too large
    const timeDiff = end.getTime() - start.getTime();
    const dayDiff = timeDiff / (1000 * 3600 * 24);

    if (dayDiff > maxDays) {
      return {
        isValid: false,
        error: `Date range cannot exceed ${maxDays} days`
      };
    }

    return {
      isValid: true,
      startDate: start,
      endDate: end
    };
  } catch (error) {
    return {
      isValid: false,
      error: 'Error validating date range'
    };
  }
}

/**
 * Validate pagination parameters
 * @param limit - Limit parameter
 * @param offset - Offset parameter
 * @returns Object - Validated pagination parameters
 */
export function validatePaginationParams(limit: any, offset: any): { limit: number; offset: number } {
  // Convert to numbers
  const limitNum = parseInt(limit, 10);
  const offsetNum = parseInt(offset, 10);

  // Set defaults if invalid
  const validatedLimit = isNaN(limitNum) || limitNum <= 0 || limitNum > 100 ? 20 : limitNum;
  const validatedOffset = isNaN(offsetNum) || offsetNum < 0 ? 0 : offsetNum;

  return {
    limit: validatedLimit,
    offset: validatedOffset
  };
}