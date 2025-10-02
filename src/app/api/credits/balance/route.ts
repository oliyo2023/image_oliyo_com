import { NextRequest } from 'next/server';
import { verifyToken, getUserProfile } from '@/lib/auth';
import { getUserCreditBalance } from '@/lib/credit';

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
    
    // Get user's credit balance
    const balance = await getUserCreditBalance(userId);

    return Response.json({
      balance: balance,
      lastUpdated: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('Get credit balance error:', error);
    return Response.json(
      { 
        error: 'Internal server error',
        message: 'An unexpected error occurred while retrieving credit balance'
      },
      { status: 500 }
    );
  }
}