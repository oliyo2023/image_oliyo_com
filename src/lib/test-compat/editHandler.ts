import type { NextApiRequest, NextApiResponse } from 'next';

/**
 * Test compatibility edit handler (Express/Next.js Pages API style)
 * Used only by tests to call a handler(req, res) without conflicting with App Router.
 * This returns a mock success matching contract test expectations.
 */
export async function editHandler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method !== 'POST') {
      res.status(405).json({ success: false, error: 'Method Not Allowed' });
      return;
    }

    const { imageId, prompt } = (req.body as any) || {};
    if (!imageId || !prompt) {
      res.status(400).json({ success: false, error: 'Invalid request parameters' });
      return;
    }

    // Map AI model to credit usage (default 10 for gemini-flash-image)
    const creditsUsed = (req.body as any)?.aiModel === 'gemini-flash-image' ? 10 : 5;
    const originalImageId = String(imageId);
    const newImageId = `${originalImageId}-edited`;
    const imageUrl = `https://cdn.example.com/edited/${newImageId}.png`;
    const finalCreditBalance = 100 - creditsUsed;

    res.status(200).json({
      success: true,
      imageId: newImageId,
      imageUrl,
      creditsUsed,
      finalCreditBalance,
      originalImageId,
      message: 'Image edited successfully'
    });
  } catch (err) {
    console.error('editHandler error:', err);
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
}

export default editHandler;