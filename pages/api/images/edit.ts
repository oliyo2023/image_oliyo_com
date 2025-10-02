import type { NextApiRequest, NextApiResponse } from 'next';
import { AIService } from '../../lib/services/ai-service';
import { getUserIdFromSession } from '../../lib/utils/session';

const aiService = new AIService();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      success: false, 
      error: 'Method not allowed' 
    });
  }

  try {
    const { imageId, prompt, aiModel, sessionToken } = req.body;

    // Validate input
    if (!imageId || !prompt || !aiModel || !sessionToken) {
      return res.status(400).json({ 
        success: false, 
        error: 'imageId, prompt, aiModel, and sessionToken are required' 
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

    // Edit the image
    const result = await aiService.editImage({
      userId,
      imageId,
      prompt,
      aiModel
    });

    if (result.success) {
      return res.status(200).json(result);
    } else {
      return res.status(400).json(result);
    }
  } catch (error: any) {
    console.error('Image editing error:', error);
    return res.status(500).json({ 
      success: false, 
      error: 'Internal server error' 
    });
  }
}

// Export the handler function to be used in tests
export { handler as editHandler };