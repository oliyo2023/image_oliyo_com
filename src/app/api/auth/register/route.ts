// src/app/api/auth/register/route.ts
import { NextRequest } from 'next/server';
import { registerUser } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, confirmPassword } = body;

    // Validate input
    if (!email || !password || !confirmPassword) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: 'Email, password, and confirmPassword are required' 
        }),
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Register the user
    const result = await registerUser({ email, password, confirmPassword });

    return new Response(
      JSON.stringify(result),
      { 
        status: result.success ? 201 : 400,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  } catch (error) {
    console.error('Error in registration endpoint:', error);
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