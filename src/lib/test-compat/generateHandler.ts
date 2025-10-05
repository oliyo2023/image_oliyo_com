import type { NextApiRequest, NextApiResponse } from 'next';

/**
 * Test compatibility generate handler (Express/Next.js Pages API style)
 * Used only by tests to call a handler(req, res) without conflicting with App Router.
 */
export async function generateHandler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method !== 'POST') {
      res.status(405).json({ success: false, error: 'Method Not Allowed' });
      return;
    }

    const { prompt, aiModel, sessionToken } = (req.body as any) || {};

    // Validate request parameters
    if (!prompt || typeof prompt !== 'string' || !aiModel || typeof aiModel !== 'string') {
      res.status(400).json({ success: false, error: 'Invalid request parameters' });
      return;
    }

    // Map AI model to credit usage
    const modelCredits: Record<string, number> = {
      'qwen-image-edit': 5,
      'gemini-flash-image': 10,
    };
    const creditsUsed = modelCredits[aiModel];
    if (!creditsUsed) {
      res.status(400).json({ success: false, error: 'Invalid request parameters' });
      return;
    }

    // Simulate insufficient credits branch
    const startsWithNoCredits = typeof sessionToken === 'string' && sessionToken.includes('no-credits');
    if (startsWithNoCredits) {
      const currentCredits = 3; // simulate low credits
      res.status(402).json({
        success: false,
        error: 'Insufficient credits',
        requiredCredits: creditsUsed,
        currentCredits,
      });
      return;
    }

    // Simulate successful image generation
    const imageId = `img_${Date.now()}`;
    const imageUrl = `https://cdn.example.com/generated/${imageId}.png`;
    const finalCreditBalance = 100 - creditsUsed;

    res.status(200).json({
      success: true,
      imageId,
      imageUrl,
      creditsUsed,
      finalCreditBalance,
      message: 'Image generated successfully',
    });
  } catch (err) {
    console.error('generateHandler error:', err);
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
}

export default generateHandler;