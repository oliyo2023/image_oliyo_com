// src/app/api/auth/login-social/route.ts
import { NextRequest } from 'next/server';
import { socialLogin } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { provider, socialToken } = body;

    // Validate input
    if (!provider || !socialToken) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: 'Provider and socialToken are required' 
        }),
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Social login the user
    const result = await socialLogin(provider, socialToken);

    if (!result) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: 'Social login failed' 
        }),
        { 
          status: 401,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    return new Response(
      JSON.stringify(result),
      { 
        status: result.user ? 200 : 401,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  } catch (error) {
    console.error('Error in social login endpoint:', error);
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