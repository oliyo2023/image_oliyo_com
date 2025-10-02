import { NextRequest } from 'next/server';
import { authenticateUser } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    // Validate request body
    if (!email || !password) {
      return Response.json(
        { 
          error: 'Missing required fields', 
          details: [
            { field: 'email', message: 'Email is required' },
            { field: 'password', message: 'Password is required' }
          ] 
        },
        { status: 400 }
      );
    }

    // Attempt to authenticate the user
    const result = await authenticateUser(email, password);

    if (result) {
      // Login successful
      return Response.json(
        { 
          success: true,
          message: 'Login successful',
          user: {
            id: result.user.id,
            email: result.user.email,
            creditBalance: result.user.creditBalance,
          },
          token: result.token
        },
        { status: 200 }
      );
    } else {
      // Authentication failed
      return Response.json(
        { 
          error: 'Invalid credentials',
          message: 'Email or password is incorrect'
        },
        { status: 401 }
      );
    }
  } catch (error: any) {
    // General error handling
    console.error('Login error:', error);
    return Response.json(
      { 
        error: 'Internal server error',
        message: 'An unexpected error occurred during login'
      },
      { status: 500 }
    );
  }
}