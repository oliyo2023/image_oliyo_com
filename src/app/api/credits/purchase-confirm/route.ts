import { NextRequest } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { confirmPayment } from '@/lib/stripe';

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

    const userId = tokenPayload.userId;
    
    const body = await request.json();
    const { paymentIntentId } = body;

    // Validate request body
    if (!paymentIntentId) {
      return Response.json(
        { 
          error: 'Missing required fields', 
          details: [
            { field: 'paymentIntentId', message: 'Payment intent ID is required' }
          ] 
        },
        { status: 400 }
      );
    }

    // Validate payment intent ID format (basic check)
    if (typeof paymentIntentId !== 'string' || paymentIntentId.trim().length === 0) {
      return Response.json(
        { 
          error: 'Invalid input', 
          message: 'Payment intent ID must be a non-empty string' 
        },
        { status: 400 }
      );
    }

    // Confirm the payment
    const result = await confirmPayment({ paymentIntentId, userId });

    return Response.json(result);
  } catch (error: any) {
    console.error('Confirm payment error:', error);

    // Check for specific error types
    if (error.message && error.message.includes('Purchase record not found')) {
      return Response.json(
        { 
          error: 'Bad Request', 
          message: error.message 
        },
        { status: 400 }
      );
    }
    
    if (error.message && error.message.includes('Payment not successful')) {
      return Response.json(
        { 
          error: 'Payment Failed', 
          message: error.message 
        },
        { status: 402 } // Payment Required
      );
    }

    return Response.json(
      { 
        error: 'Internal server error',
        message: 'An unexpected error occurred while confirming payment'
      },
      { status: 500 }
    );
  }
}