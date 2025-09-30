// src/app/api/images/[...slug]/route.ts
import { NextRequest } from 'next/server';
import { authenticateToken } from '@/lib/auth';
import { getUserImageHistory } from '@/lib/user';

export async function GET(request: NextRequest, { params }: { params: { slug: string[] } }) {
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

    // Check if a specific image ID was requested
    if (params && params.slug && params.slug.length > 0) {
      const imageId = params.slug[0];
      
      // In a real implementation, you would fetch the specific image
      // For now, we'll return an error since we haven't implemented individual image retrieval
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: 'Individual image retrieval not implemented in this endpoint, use the dedicated image endpoint' 
        }),
        { 
          status: 404,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    } else {
      // Return user's image list
      const { searchParams } = new URL(request.url);
      const limit = parseInt(searchParams.get('limit') || '20');
      const offset = parseInt(searchParams.get('offset') || '0');
      
      const result = await getUserImageHistory(user.id, limit, offset);
      
      return new Response(
        JSON.stringify(result),
        { 
          status: result.success ? 200 : 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }
  } catch (error) {
    console.error('Error in images endpoint:', error);
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