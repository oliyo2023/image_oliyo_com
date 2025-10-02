import type { NextApiRequest, NextApiResponse } from 'next';
import { AIService } from '../../lib/services/ai-service';
import { AuthService } from '../../lib/services/auth-service';
import { getUserIdFromSession } from '../../lib/utils/session';

const aiService = new AIService();
const authService = new AuthService();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      success: false, 
      error: 'Method not allowed' 
    });
  }

  try {
    const { prompt, aiModel, sessionToken } = req.body;

    // Validate input
    if (!prompt || !aiModel || !sessionToken) {
      return res.status(400).json({ 
        success: false, 
        error: 'Prompt, aiModel, and sessionToken are required' 
      });
    }

    // Verify the session
    const userId = await getUserIdFromSession(sessionToken);
    if (!userId) {
      return res.status(401).json({ 
        success: false, 
        error: 'Invalid or expired session token' 
      });
    }

    // Validate AI model
    const availableModels = await aiService.getAvailableModels();
    const isValidModel = availableModels.some(model => model.name === aiModel);

    if (!isValidModel) {
      return res.status(400).json({ 
        success: false, 
        error: `Invalid AI model: ${aiModel}` 
      });
    }

    // Generate the image
    const result = await aiService.generateImage({
      userId,
      prompt,
      aiModel
    });

    if (result.success) {
      return res.status(200).json(result);
    } else {
      // Determine appropriate status code based on error type
      const statusCode = result.error?.includes('Insufficient credits') ? 402 : 400;
      return res.status(statusCode).json(result);
    }
  } catch (error: any) {
    console.error('Image generation error:', error);
    return res.status(500).json({ 
      success: false, 
      error: 'Internal server error' 
    });
  }
}

// Export the handler function to be used in tests
export { handler as generateHandler };