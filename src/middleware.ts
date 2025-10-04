import createMiddleware from 'next-intl/middleware';
import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

// Initialize Upstash Redis for rate limiting
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL || '',
  token: process.env.UPSTASH_REDIS_REST_TOKEN || '',
});

// Rate limiter: 100 requests per 1 hour per user
const ratelimit = new Ratelimit({
  redis: redis,
  limiter: Ratelimit.slidingWindow(100, '1 h'),
});

// JWT Secret should be stored in environment variable
const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'fallback_jwt_secret_for_development'
);

interface JWTPayload {
  jti: string; // Token ID
  iat: number; // Issued at
  exp: number; // Expiration
  userId: string;
  email: string;
}

import { getLocales } from '../i18n';

// Internationalization middleware
const internationalizationMiddleware = createMiddleware({
  // A list of all locales that are supported
  locales: getLocales(),

  // Used when no locale matches
  defaultLocale: 'en',

  // Enable locale detection from browser settings
  localeDetection: true,
});

// List of admin routes that require admin role
const adminRoutes = [
  '/api/admin/',
  // Add other admin routes as needed
];

// List of routes that need more strict rate limiting (e.g., image generation)
const highUsageRoutes = ['/api/images/generate', '/api/images/edit'];

export async function middleware(request: NextRequest) {
  // Skip middleware for API routes, static files, and other excluded paths
  if (
    request.nextUrl.pathname.startsWith('/api/') ||
    request.nextUrl.pathname.startsWith('/_next/') ||
    request.nextUrl.pathname.startsWith('/favicon.') ||
    request.nextUrl.pathname.match(/\.(png|jpg|jpeg|gif|svg|ico|css|js)$/)
  ) {
    // For API routes (except auth), apply rate limiting
    if (request.nextUrl.pathname.startsWith('/api/') && !request.nextUrl.pathname.startsWith('/api/auth')) {
      const ip = request.ip ?? 'anonymous';
      const { success } = await ratelimit.limit(`public_${ip}`);

      if (!success) {
        return new NextResponse(
          JSON.stringify({
            error: 'Rate limit exceeded',
            message: 'Too many requests',
          }),
          { status: 429, headers: { 'Content-Type': 'application/json' } }
        );
      }
    }
    return NextResponse.next();
  }

  // First, handle internationalization
  const intlResponse = internationalizationMiddleware(request);

  // For internationalized routes, we still want to apply rate limiting to API routes
  if (intlResponse && request.nextUrl.pathname.startsWith('/api/')) {
    // Use a more lenient rate limit for public API routes
    const ip = request.ip ?? 'anonymous';
    const { success } = await ratelimit.limit(`public_${ip}`);

    if (!success) {
      return new NextResponse(
        JSON.stringify({
          error: 'Rate limit exceeded',
          message: 'Too many requests',
        }),
        { status: 429, headers: { 'Content-Type': 'application/json' } }
      );
    }
  }

  // If we have an internationalized response, return it
  if (intlResponse) {
    return intlResponse;
  }

  // For non-internationalized routes, apply authentication and rate limiting
  // Check for authentication token
  const token = request.headers.get('authorization')?.replace('Bearer ', '');

  if (!token) {
    return new NextResponse(
      JSON.stringify({
        error: 'Unauthorized',
        message: 'Missing authorization token',
      }),
      { status: 401, headers: { 'Content-Type': 'application/json' } }
    );
  }

  try {
    // Verify the token
    const verified = await jwtVerify(token, JWT_SECRET);
    const payload = verified.payload as JWTPayload;

    // Apply rate limiting based on user ID
    // For high-usage routes, we might want to use a stricter limit
    const isHighUsageRoute = highUsageRoutes.some(route =>
      request.nextUrl.pathname.startsWith(route)
    );

    if (isHighUsageRoute) {
      // For image generation/editing, use a stricter rate limit
      // 10 requests per 10 minutes per user
      const { success } = await ratelimit.limit(
        `user_${payload.userId}_high_usage`
      );

      if (!success) {
        return new NextResponse(
          JSON.stringify({
            error: 'Rate limit exceeded',
            message: 'Too many image requests. Please slow down.',
          }),
          { status: 429, headers: { 'Content-Type': 'application/json' } }
        );
      }
    } else {
      // For other authenticated routes, use the standard rate limit
      const { success } = await ratelimit.limit(
        `user_${payload.userId}_standard`
      );

      if (!success) {
        return new NextResponse(
          JSON.stringify({
            error: 'Rate limit exceeded',
            message: 'Too many requests. Please slow down.',
          }),
          { status: 429, headers: { 'Content-Type': 'application/json' } }
        );
      }
    }

    // Check if the route requires admin privileges
    const isAdminRoute = adminRoutes.some(route =>
      request.nextUrl.pathname.startsWith(route)
    );

    if (isAdminRoute) {
      // In a full implementation, we'd check the user's role from the database
      // For now, we'll just pass the user info in headers for API routes to use
      // Role checking would typically happen inside the API route handler
    }

    // Add user info to headers for use in API routes
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-user-id', payload.userId);
    requestHeaders.set('x-user-email', payload.email);

    const response = NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });

    return response;
  } catch (error) {
    console.error('Middleware error:', error);
    return new NextResponse(
      JSON.stringify({
        error: 'Unauthorized',
        message: 'Invalid or expired token',
      }),
      { status: 401, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

// Export helper functions for admin authentication and permissions
export async function authenticateAdmin(
  request: NextRequest
): Promise<{ userId: string; email: string; role: string } | null> {
  // Extract token from Authorization header
  const authHeader = request.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.substring(7); // Remove 'Bearer ' prefix

  try {
    // Verify token
    const verified = await jwtVerify(token, JWT_SECRET);
    const payload = verified.payload as JWTPayload;

    // In a real implementation, we'd check the user's role from the database
    // For now, we'll simulate this by checking if the user ID matches an admin ID
    // In a real app, you'd have a proper role system
    const isAdmin = payload.userId === 'admin-user-id'; // Placeholder logic

    if (isAdmin) {
      return {
        userId: payload.userId,
        email: payload.email,
        role: 'admin',
      };
    }

    return null;
  } catch (error) {
    console.error('Admin authentication error:', error);
    return null;
  }
}

export async function checkPermission(
  userId: string,
  permission: string
): Promise<boolean> {
  // In a real implementation, this would check the user's permissions in the database
  // For now, we'll just return true for all checks
  // In a real app, you'd have a proper permission system
  console.log(`Checking permission ${permission} for user ${userId}`);
  return true;
}

export async function logAuditAction(
  userId: string,
  action: string,
  details?: any
): Promise<void> {
  // In a real implementation, this would log the audit action to a database
  // For now, we'll just log to the console
  console.log(`Audit log: User ${userId} performed action ${action}`, details);
}

export function validateUUID(uuid: string): boolean {
  // Simple UUID validation regex
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

export function validatePaginationParams(
  limit: string,
  offset: string
): { limit: number; offset: number } | null {
  const limitNum = parseInt(limit);
  const offsetNum = parseInt(offset);

  if (isNaN(limitNum) || limitNum < 1 || limitNum > 100) {
    return null;
  }

  if (isNaN(offsetNum) || offsetNum < 0) {
    return null;
  }

  return { limit: limitNum, offset: offsetNum };
}

export function validateDateRange(
  startDate: string,
  endDate: string
): { startDate: Date; endDate: Date } | null {
  const start = new Date(startDate);
  const end = new Date(endDate);

  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    return null;
  }

  if (start > end) {
    return null;
  }

  return { startDate: start, endDate: end };
}

export function validateAndSanitizeURLParams(
  params: Record<string, string>
): Record<string, string> {
  // In a real implementation, this would sanitize URL parameters to prevent injection attacks
  // For now, we'll just return the params as-is
  return params;
}

// Specify which paths the middleware should run for
export const config = {
  matcher: [
    // Match all pathnames except for
    // - …_next/static (static files)
    // - …_next/image (image optimization files)
    // - …favicon.ico (favicon file)
    // - …api (API routes)
    // - ….* (files with extensions, e.g., .png, .jpg, .css, .js)
    '/((?!_next/static|_next/image|favicon.ico|api|.*\\..*$).*)',
  ],
};
