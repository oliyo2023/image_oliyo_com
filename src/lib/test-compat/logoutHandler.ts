import type { NextApiRequest, NextApiResponse } from 'next';
import { logout } from '../auth';

/**
 * Test compatibility logout handler (Express/Next.js Pages API style)
 * Used only by tests to call a handler(req, res) without conflicting with App Router.
 */
export async function logoutHandler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method !== 'POST') {
      res.status(405).json({ success: false, error: 'Method Not Allowed' });
      return;
    }

    const { sessionToken } = (req.body as any) || {};
    if (!sessionToken || typeof sessionToken !== 'string') {
      res.status(401).json({ success: false, error: 'Invalid session token' });
      return;
    }

    const ok = await logout(sessionToken);
    if (!ok) {
      res.status(500).json({ success: false, error: 'Logout failed' });
      return;
    }

    res.status(200).json({ success: true, message: 'Successfully logged out' });
  } catch (err) {
    console.error('logoutHandler error:', err);
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
}

export default logoutHandler;