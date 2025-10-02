import { NextRequest } from 'next/server';
import { verifyToken, logout } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    // Extract token from Authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return Response.json(
        { error: 'Unauthorized', message: 'Missing or invalid authorization header' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    
    // Verify token
    const tokenPayload = await verifyToken(token);
    if (!tokenPayload) {
      return Response.json(
        { error: 'Unauthorized', message: 'Invalid or expired token' },
        { status: 401 }
      );
    }

    // Perform logout (in this implementation, we just confirm the action)
    // In a real implementation, you might add the token to a blacklist
    const logoutSuccess = await logout(token);
    
    if (logoutSuccess) {
      return Response.json({
        success: true,
        message: 'Logged out successfully'
      });
    } else {
      // This shouldn't happen with the current implementation
      return Response.json({
        success: false,
        message: 'Logout failed'
      }, { status: 500 });
    }
  } catch (error: any) {
    // General error handling
    console.error('Logout error:', error);
    return Response.json(
      { 
        error: 'Internal server error',
        message: 'An unexpected error occurred during logout'
      },
      { status: 500 }
    );
  }
}