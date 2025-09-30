// src/app/api/credits/transactions/route.ts
import { NextRequest } from 'next/server';
import { authenticateToken } from '@/lib/auth';
import { getUserCreditTransactions } from '@/lib/credit';

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

    // Get query parameters for pagination
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Get user's credit transaction history
    const result = await getUserCreditTransactions(user.id, limit, offset);

    return new Response(
      JSON.stringify(result),
      { 
        status: result.success ? 200 : 400,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  } catch (error) {
    console.error('Error in credits transactions endpoint:', error);
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