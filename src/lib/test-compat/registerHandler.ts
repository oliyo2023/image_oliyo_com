import type { NextApiRequest, NextApiResponse } from 'next';
import { registerUser } from '../auth';

/**
 * Test compatibility register handler (Express/Next.js Pages API style)
 * Used only by tests to call a handler(req, res) without conflicting with App Router.
 */
export async function registerHandler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method !== 'POST') {
      res.status(405).json({ error: 'Method Not Allowed' });
      return;
    }

    const { email, password, confirmPassword } = req.body || {};
    if (!email || !password || !confirmPassword) {
      res.status(400).json({ error: 'Invalid request', message: 'Email, password and confirmPassword are required' });
      return;
    }

    const result = await registerUser(email, password, confirmPassword);
    if (!result) {
      res.status(400).json({ error: 'Registration failed' });
      return;
    }

    res.status(201).json({
      success: true,
      email: result.user.email,
      creditBalance: result.user.creditBalance,
      message: 'Account created successfully with 100 free credits'
    });
  } catch (err: any) {
    console.error('registerHandler error:', err);
    res.status(500).json({ error: 'Internal Server Error', message: err?.message });
  }
}

export default registerHandler;