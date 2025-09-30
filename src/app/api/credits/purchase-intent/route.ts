// src/app/api/credits/purchase-intent/route.ts
import { NextRequest } from 'next/server';
import { authenticateToken } from '@/lib/auth';
import { createCreditPurchaseIntent } from '@/lib/stripe';

export async function POST(request: NextRequest) {
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

    const body = await request.json();
    const { credits, paymentMethodId } = body;

    // Validate required fields
    if (!credits || !paymentMethodId) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: 'Credits and paymentMethodId are required' 
        }),
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Create credit purchase intent
    const result = await createCreditPurchaseIntent({
      userId: user.id,
      credits,
      paymentMethodId
    });

    return new Response(
      JSON.stringify(result),
      { 
        status: result.success ? 200 : 400,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  } catch (error) {
    console.error('Error in credits purchase intent endpoint:', error);
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