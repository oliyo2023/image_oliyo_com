import { NextRequest } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { editImage } from '@/lib/ai-models';
import { isAtRequestLimit } from '@/lib/task-queue';

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
    
    // Check if user has reached the concurrent request limit
    const atLimit = await isAtRequestLimit(userId);
    if (atLimit) {
      return Response.json(
        { 
          error: 'Rate limit exceeded',
          message: `Maximum ${3} concurrent requests reached. Please wait for some requests to complete.` 
        },
        { status: 429 }
      );
    }

    // Parse JSON data for image editing
    const body = await request.json();
    const { prompt, model, strength, originalImageId } = body;

    // Validate required fields
    if (!prompt || typeof prompt !== 'string' || prompt.trim().length < 1 || prompt.trim().length > 1000) {
      return Response.json(
        { 
          error: 'Invalid input',
          message: 'Prompt must be a string between 1 and 1000 characters' 
        },
        { status: 400 }
      );
    }

    if (!model) {
      return Response.json(
        { 
          error: 'Invalid input', 
          message: 'Model is required' 
        },
        { status: 400 }
      );
    }

    // Validate model type
    const validModels = ['qwen-image-edit', 'gemini-flash-image'];
    if (!validModels.includes(model)) {
      return Response.json(
        { 
          error: 'Invalid input', 
          message: `Model must be one of: ${validModels.join(', ')}` 
        },
        { status: 400 }
      );
    }

    // Validate strength parameter if provided
    let strengthValue = 0.5; // Default value
    if (strength) {
      strengthValue = parseFloat(strength);
      if (isNaN(strengthValue) || strengthValue < 0.0 || strengthValue > 1.0) {
        return Response.json(
          { 
            error: 'Invalid input', 
            message: 'Strength must be a number between 0.0 and 1.0' 
          },
          { status: 400 }
        );
      }
    }

    // Validate original image ID
    if (!originalImageId) {
      return Response.json(
        {
          error: 'Invalid input',
          message: 'Original image ID is required'
        },
        { status: 400 }
      );
    }

    // Call the editImage function
    const result = await editImage({
      userId,
      originalImageId,
      prompt: prompt.trim(),
      model,
      strength: strength || 0.5,
    });

    if (result.status === 'success') {
      return Response.json({
        success: true,
        message: 'Image editing initiated',
        imageId: result.imageUrl ? result.imageUrl.split('/').pop() : '', // Extract image ID from URL
        status: 'processing',
        taskId: result.taskId,
        estimatedCompletion: new Date(Date.now() + 90000).toISOString() // Estimate 1.5 minutes
      });
    } else {
      return Response.json(
        {
          error: 'Image editing failed',
          message: result.message
        },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error('Image editing error:', error);
    
    // Check if it's a credit-related error
    if (error.message && error.message.includes('Insufficient credits')) {
      // Extract required and available amounts from error message
      const match = error.message.match(/Required: (\d+), Available: (\d+)/);
      if (match) {
        return Response.json(
          { 
            error: 'Insufficient credits',
            requiredCredits: parseInt(match[1]),
            availableCredits: parseInt(match[2])
          },
          { status: 402 } // Payment Required status code
        );
      }
    }
    
    return Response.json(
      { 
        error: 'Internal server error',
        message: 'An unexpected error occurred during image editing'
      },
      { status: 500 }
    );
  }
}