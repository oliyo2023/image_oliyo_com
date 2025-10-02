import { NextRequest } from 'next/server';
import { verifyToken, getUserProfile } from '@/lib/auth';

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

    // Get user profile
    const profile = await getUserProfile(tokenPayload.userId);
    
    if (!profile) {
      return Response.json(
        { error: 'User not found', message: 'The user associated with this token does not exist' },
        { status: 404 }
      );
    }

    // Return user profile
    return Response.json({
      id: profile.id,
      email: profile.email,
      creditBalance: profile.creditBalance,
      registrationDate: profile.registrationDate,
      lastLogin: profile.lastLogin,
      socialLoginProvider: profile.socialLoginProvider,
    });
  } catch (error: any) {
    // General error handling
    console.error('Get profile error:', error);
    return Response.json(
      { 
        error: 'Internal server error',
        message: 'An unexpected error occurred while retrieving profile'
      },
      { status: 500 }
    );
  }
}