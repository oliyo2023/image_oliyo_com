import type { NextApiRequest, NextApiResponse } from 'next';
import { authenticateUser } from '../auth';

/**
 * Test compatibility login handler (Express/Next.js Pages API style)
 * Used only by tests to call a handler(req, res) without conflicting with App Router.
 */
export async function loginHandler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method !== 'POST') {
      res.status(405).json({ error: 'Method Not Allowed' });
      return;
    }

    const { email, password } = req.body || {};
    if (!email || !password) {
      res.status(400).json({ error: 'Invalid request', message: 'Email and password are required' });
      return;
    }

    const result = await authenticateUser(email, password);
    if (!result) {
      res.status(401).json({ error: 'Unauthorized', message: 'Invalid credentials or inactive user' });
      return;
    }

    res.status(200).json({
      success: true,
      sessionToken: result.token,
      user: {
        id: result.user.id,
        email: result.user.email,
        creditBalance: result.user.creditBalance,
        lastLogin: result.user.lastLogin,
        role: result.user.role,
        isActive: result.user.isActive,
      }
    });
  } catch (err) {
    console.error('loginHandler error:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}

export default loginHandler;