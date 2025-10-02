import { NextRequest } from 'next/server';
import { socialLogin } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { provider, socialToken } = body;

    // Validate request body
    if (!provider || !socialToken) {
      return Response.json(
        { 
          error: 'Missing required fields', 
          details: [
            { field: 'provider', message: 'Provider is required' },
            { field: 'socialToken', message: 'Social token is required' }
          ] 
        },
        { status: 400 }
      );
    }

    // Validate provider
    const validProviders = ['google', 'facebook'];
    if (!validProviders.includes(provider.toLowerCase())) {
      return Response.json(
        { 
          error: 'Invalid provider',
          message: `Provider must be one of: ${validProviders.join(', ')}`
        },
        { status: 400 }
      );
    }

    // Attempt to login via social provider
    const result = await socialLogin(provider, socialToken);

    if (result) {
      // Social login successful
      return Response.json(
        { 
          success: true,
          message: 'Social login successful',
          user: {
            id: result.user.id,
            email: result.user.email,
            creditBalance: result.user.creditBalance,
            socialLoginProvider: result.user.socialLoginProvider,
          },
          token: result.token
        },
        { status: 200 }
      );
    } else {
      // Social login failed
      return Response.json(
        { 
          error: 'Authentication failed',
          message: 'Could not authenticate with the provided social token'
        },
        { status: 401 }
      );
    }
  } catch (error: any) {
    // General error handling
    console.error('Social login error:', error);
    return Response.json(
      { 
        error: 'Internal server error',
        message: 'An unexpected error occurred during social login'
      },
      { status: 500 }
    );
  }
}