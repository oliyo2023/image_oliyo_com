import { NextRequest } from 'next/server';
import { registerUser } from '@/lib/auth';
import prisma from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, confirmPassword } = body;

    // Validate request body
    if (!email || !password || !confirmPassword) {
      return Response.json(
        { 
          error: 'Missing required fields', 
          details: [
            { field: 'email', message: 'Email is required' },
            { field: 'password', message: 'Password is required' },
            { field: 'confirmPassword', message: 'Confirm password is required' }
          ] 
        },
        { status: 400 }
      );
    }

    // Attempt to register the user
    const result = await registerUser(email, password, confirmPassword);

    if (result) {
      // Registration successful
      return Response.json(
        { 
          success: true,
          message: 'User registered successfully',
          user: {
            id: result.user.id,
            email: result.user.email,
            creditBalance: result.user.creditBalance,
            registrationDate: result.user.registrationDate,
          },
          token: result.token
        },
        { status: 201 }
      );
    } else {
      // This should not happen if registerUser throws errors properly,
      // but included for completeness
      return Response.json(
        { 
          error: 'Registration failed',
          message: 'Unable to create user account'
        },
        { status: 400 }
      );
    }
  } catch (error: any) {
    // Handle specific error types
    if (error.message.includes('Passwords do not match')) {
      return Response.json(
        { 
          error: 'Invalid input',
          message: 'Passwords do not match'
        },
        { status: 400 }
      );
    }
    
    if (error.message.includes('Password must be at least')) {
      return Response.json(
        { 
          error: 'Invalid input', 
          message: error.message 
        },
        { status: 400 }
      );
    }
    
    if (error.message.includes('Invalid email format')) {
      return Response.json(
        { 
          error: 'Invalid input', 
          message: 'Invalid email format' 
        },
        { status: 400 }
      );
    }
    
    if (error.message.includes('Email already exists')) {
      return Response.json(
        { 
          error: 'Conflict', 
          message: 'Email already exists' 
        },
        { status: 409 }
      );
    }

    // General error handling
    console.error('Registration error:', error);
    return Response.json(
      { 
        error: 'Internal server error',
        message: 'An unexpected error occurred during registration'
      },
      { status: 500 }
    );
  }
}