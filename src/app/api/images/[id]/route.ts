import { NextRequest } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { getUserImage } from '@/lib/user';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
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
    const imageId = params.id;
    
    // Validate image ID
    if (!imageId) {
      return Response.json(
        { 
          error: 'Invalid input', 
          message: 'Image ID is required' 
        },
        { status: 400 }
      );
    }

    // Get the specific image
    const image = await getUserImage(userId, imageId);

    if (!image) {
      return Response.json(
        { 
          error: 'Not found', 
          message: 'Image not found or does not belong to the user' 
        },
        { status: 404 }
      );
    }

    // Format the response
    return Response.json({
      id: image.id,
      originalFilename: image.originalFilename,
      storagePath: image.storagePath,
      creationDate: image.creationDate,
      prompt: image.prompt,
      modelName: image.modelName,
      status: image.status,
      userId: image.userId,
    });
  } catch (error: any) {
    console.error('Get specific image error:', error);
    return Response.json(
      { 
        error: 'Internal server error',
        message: 'An unexpected error occurred while retrieving the image'
      },
      { status: 500 }
    );
  }
}