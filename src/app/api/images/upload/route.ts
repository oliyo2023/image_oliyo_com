import { NextRequest } from 'next/server';
import { verifyToken } from '@/lib/auth';
import prisma from '@/lib/db';
import { uploadImageToR2 } from '@/lib/r2';

export async function POST(request: NextRequest) {
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
    
    // Parse form data for image upload
    const formData = await request.formData();
    const imageFile = formData.get('image') as File | null;

    // Validate image file
    if (!imageFile) {
      return Response.json(
        { 
          error: 'Invalid input',
          message: 'Image file is required' 
        },
        { status: 400 }
      );
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(imageFile.type)) {
      return Response.json(
        { 
          error: 'Invalid file type',
          message: 'Only JPEG, PNG, GIF, and WebP images are allowed' 
        },
        { status: 400 }
      );
    }

    // Validate file size (50MB max)
    if (imageFile.size > 52428800) {
      return Response.json(
        { 
          error: 'File too large',
          message: 'Image size must be less than 50MB' 
        },
        { status: 400 }
      );
    }

    // Convert File to Buffer
    const arrayBuffer = await imageFile.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    // Upload image to R2
    const uploadUrl = await uploadImageToR2(
      buffer,
      imageFile.name,
      userId,
      imageFile.type
    );
    
    // Create image record in database
    const image = await prisma.image.create({
      data: {
        userId,
        originalFilename: imageFile.name,
        storagePath: uploadUrl,
        fileFormat: imageFile.type.split('/')[1],
        fileSize: imageFile.size,
        modelName: 'upload',
        status: 'completed',
        taskId: '',
      },
    });

    return Response.json({
      success: true,
      message: 'Image uploaded successfully',
      imageId: image.id,
      url: uploadUrl,
    });
  } catch (error: any) {
    console.error('Image upload error:', error);
    
    return Response.json(
      { 
        error: 'Internal server error',
        message: 'An unexpected error occurred during image upload'
      },
      { status: 500 }
    );
  }
}