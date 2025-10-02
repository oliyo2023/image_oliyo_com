import { NextRequest } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { generateImage, getTaskStatus } from '@/lib/ai-models';
import { isAtRequestLimit } from '@/lib/task-queue';
import { hasSufficientCredits } from '@/lib/credit';

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

    const body = await request.json();
    const { prompt, model, width, height, style } = body;

    // Validate request body
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

    // Validate dimensions if provided
    if (width && (width < 256 || width > 1024)) {
      return Response.json(
        { 
          error: 'Invalid input', 
          message: 'Width must be between 256 and 1024 pixels' 
        },
        { status: 400 }
      );
    }

    if (height && (height < 256 || height > 1024)) {
      return Response.json(
        { 
          error: 'Invalid input', 
          message: 'Height must be between 256 and 1024 pixels' 
        },
        { status: 400 }
      );
    }

    // Check if user has sufficient credits for the selected model
    // The cost will be determined internally by the generateImage function
    // but we can perform an initial check
    // In the actual implementation, the generateImage function handles credit deduction

    // Generate the image
    const result = await generateImage({
      userId,
      prompt: prompt.trim(),
      model,
      width: width || 512,
      height: height || 512,
      style: style || 'realistic',
    });

    if (result.status === 'success') {
      return Response.json({
        success: true,
        message: 'Image generation initiated',
        imageId: result.imageUrl ? result.imageUrl.split('/').pop() : '', // Extract image ID from URL
        status: 'processing',
        taskId: result.taskId,
        estimatedCompletion: new Date(Date.now() + 60000).toISOString() // Estimate 1 minute
      });
    } else {
      return Response.json(
        { 
          error: 'Image generation failed',
          message: result.message
        },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error('Image generation error:', error);
    
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
        message: 'An unexpected error occurred during image generation'
      },
      { status: 500 }
    );
  }
}