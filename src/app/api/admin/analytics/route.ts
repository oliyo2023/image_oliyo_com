// src/app/api/admin/analytics/route.ts
import { NextRequest } from 'next/server';
import { authenticateToken } from '@/lib/auth';
import { getPlatformAnalytics } from '@/lib/user';

export async function GET(request: NextRequest) {
  try {
    // Extract token from Authorization header
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: 'Authorization token required' 
        }),
        { 
          status: 401,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }
    
    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    const user = await authenticateToken(token);
    
    if (!user) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: 'Invalid or expired token' 
        }),
        { 
          status: 401,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Check if user has admin role
    if (user.role !== 'admin') {
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: 'Access denied: Admin role required' 
        }),
        { 
          status: 403,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Get platform analytics
    const result = await getPlatformAnalytics();

    return new Response(
      JSON.stringify(result),
      { 
        status: result.success ? 200 : 400,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  } catch (error) {
    console.error('Error in admin analytics endpoint:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        message: 'An internal server error occurred' 
      }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}