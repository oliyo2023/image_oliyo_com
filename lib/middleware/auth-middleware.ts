import { NextApiHandler, NextApiRequest, NextApiResponse } from 'next';
import { getUserIdFromSession } from '../lib/utils/session';

export function withAuth(handler: NextApiHandler) {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    // Extract session token from Authorization header or request body
    let sessionToken = 
      req.headers.authorization?.replace('Bearer ', '') ||
      req.body?.sessionToken ||
      req.query.sessionToken as string;

    if (!sessionToken) {
      return res.status(401).json({ 
        success: false, 
        error: 'Session token is required' 
      });
    }

    // Verify session token
    const userId = await getUserIdFromSession(sessionToken);
    
    if (!userId) {
      return res.status(401).json({ 
        success: false, 
        error: 'Invalid or expired session token' 
      });
    }

    // Add userId to request object for use in the handler
    (req as any).userId = userId;

    // Call the original handler
    return handler(req, res);
  };
}