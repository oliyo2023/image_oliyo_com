export const runtime = 'nodejs';
import { NextRequest } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { getAllUsers, getUserById } from '@/lib/user';

export async function GET(request: NextRequest) {
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

    const userId = tokenPayload.userId;
    
    // Check if user has admin role
    const user = await getUserById(userId);
    if (!user || user.role !== 'admin') {
      return Response.json(
        { error: 'Forbidden', message: 'Admin access required' },
        { status: 403 }
      );
    }

    // Parse query parameters for pagination and search
    const url = new URL(request.url);
    const limit = parseInt(url.searchParams.get('limit') || '20');
    const offset = parseInt(url.searchParams.get('offset') || '0');
    const search = url.searchParams.get('search') || undefined;
    
    // Validate limit and offset
    if (isNaN(limit) || limit < 1 || limit > 100) {
      return Response.json(
        { 
          error: 'Invalid input', 
          message: 'Limit must be a number between 1 and 100' 
        },
        { status: 400 }
      );
    }
    
    if (isNaN(offset) || offset < 0) {
      return Response.json(
        { 
          error: 'Invalid input', 
          message: 'Offset must be a non-negative number' 
        },
        { status: 400 }
      );
    }

    // Get all users
    const result = await getAllUsers(limit, offset, search);

    // Format the response
    const formattedUsers = result.users.map(user => ({
      id: user.id,
      email: user.email,
      creditBalance: user.creditBalance,
      registrationDate: user.registrationDate,
      lastLogin: user.lastLogin,
      role: user.role,
      isActive: user.isActive,
    }));

    return Response.json({
      users: formattedUsers,
      total: result.total,
      limit: result.limit,
      offset: result.offset,
    });
  } catch (error: any) {
    console.error('Get admin users error:', error);
    return Response.json(
      { 
        error: 'Internal server error',
        message: 'An unexpected error occurred while retrieving users'
      },
      { status: 500 }
    );
  }
}