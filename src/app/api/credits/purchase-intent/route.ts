import { NextRequest } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { createPurchaseIntent } from '@/lib/stripe';

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
    const { credits, paymentMethodId } = body;

    // Validate request body
    if (credits === undefined || !paymentMethodId) {
      return Response.json(
        { 
          error: 'Missing required fields', 
          details: [
            { field: 'credits', message: 'Credits amount is required' },
            { field: 'paymentMethodId', message: 'Payment method ID is required' }
          ] 
        },
        { status: 400 }
      );
    }

    // Validate credits amount (should be one of the predefined packages)
    const validCreditAmounts = [100, 500, 1000]; // From our stripe.ts implementation
    if (!validCreditAmounts.includes(credits)) {
      return Response.json(
        { 
          error: 'Invalid input', 
          message: `Credits must be one of: ${validCreditAmounts.join(', ')}`
        },
        { status: 400 }
      );
    }

    // Validate payment method ID format (basic check)
    if (typeof paymentMethodId !== 'string' || paymentMethodId.trim().length === 0) {
      return Response.json(
        { 
          error: 'Invalid input', 
          message: 'Payment method ID must be a non-empty string' 
        },
        { status: 400 }
      );
    }

    // Create purchase intent
    const result = await createPurchaseIntent(userId, credits);

    return Response.json(result);
  } catch (error: any) {
    console.error('Create purchase intent error:', error);
    
    // Check for specific error types
    if (error.message && error.message.includes('Invalid credit amount')) {
      return Response.json(
        { 
          error: 'Invalid input', 
          message: error.message 
        },
        { status: 400 }
      );
    }

    return Response.json(
      { 
        error: 'Internal server error',
        message: 'An unexpected error occurred while creating purchase intent'
      },
      { status: 500 }
    );
  }
}