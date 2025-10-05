export const runtime = 'nodejs';
import { NextRequest } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { getUserImages } from '@/lib/user';

export async function GET(request: NextRequest) {
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
    
    // Parse query parameters for pagination
    const url = new URL(request.url);
    const limit = parseInt(url.searchParams.get('limit') || '20');
    const offset = parseInt(url.searchParams.get('offset') || '0');
    
    // Validate limit and offset
    if (isNaN(limit) || limit < 1 || limit > 100) {
      return Response.json(
        { 
          error: 'Invalid input', 
          message: 'Limit must be a number between 1 and 100' 
        },
        { status: 400 }
      );
    }
    
    if (isNaN(offset) || offset < 0) {
      return Response.json(
        { 
          error: 'Invalid input', 
          message: 'Offset must be a non-negative number' 
        },
        { status: 400 }
      );
    }

    // Get user's images
    const images = await getUserImages(userId, limit, offset);

    // Format the response
    const formattedImages = images.map(image => ({
      id: image.id,
      originalFilename: image.originalFilename,
      storagePath: image.storagePath,
      creationDate: image.creationDate,
      prompt: image.prompt,
      modelName: image.modelName,
      status: image.status,
      userId: image.userId,
    }));

    return Response.json({
      images: formattedImages,
    });
  } catch (error: any) {
    console.error('Get images error:', error);
    return Response.json(
      { 
        error: 'Internal server error',
        message: 'An unexpected error occurred while retrieving images'
      },
      { status: 500 }
    );
  }
}