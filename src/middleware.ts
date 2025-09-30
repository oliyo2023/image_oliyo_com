// src/middleware.ts
import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

// Define API routes that require authentication
const protectedRoutes = [
  '/api/auth/profile',
  '/api/auth/logout',
  '/api/images/',
  '/api/credits/',
  '/api/admin/'
];

// Define API routes that require admin access
const adminRoutes = [
  '/api/admin/'
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Check if this is a protected route
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));
  const isAdminRoute = adminRoutes.some(route => pathname.startsWith(route));

  // Check authentication for protected routes
  if (isProtectedRoute) {
    const authHeader = request.headers.get('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Authorization token required' 
        },
        { 
          status: 401,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    
    try {
      // Verify JWT token
      const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'fallback_secret_for_development');
      const { payload } = await jwtVerify(token, secret);
      
      // If it's an admin route, check user role
      if (isAdminRoute && payload.role !== 'admin') {
        return NextResponse.json(
          { 
            success: false, 
            message: 'Access denied: Admin role required' 
          },
          { 
            status: 403,
            headers: { 'Content-Type': 'application/json' }
          }
        );
      }
    } catch (error) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Invalid or expired token' 
        },
        { 
          status: 401,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }
  }

  // Continue to the next middleware or route handler
  return NextResponse.next();
}

// Define which paths the middleware should run on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};