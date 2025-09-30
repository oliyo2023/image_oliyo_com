// src/app/api/images/route.ts
import { NextRequest } from 'next/server';
import db from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    // Get the authorization header
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
    
    // In a real implementation, you would verify the token with JWT
    // For now, we'll simulate the process
    const userId = 'user123'; // This would come from the decoded token

    // Get query parameters for pagination
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Fetch user's images from database
    const images = await db.image.findMany({
      where: { 
        userId: userId 
      },
      orderBy: { 
        creationDate: 'desc' 
      },
      take: limit,
      skip: offset
    });

    // Get total count for pagination
    const totalCount = await db.image.count({
      where: { 
        userId: userId 
      }
    });

    return new Response(
      JSON.stringify({
        success: true,
        images: images,
        pagination: {
          total: totalCount,
          limit: limit,
          offset: offset,
          hasMore: offset + images.length < totalCount
        }
      }),
      { 
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  } catch (error) {
    console.error('Error fetching user images:', error);
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