import type { NextApiRequest, NextApiResponse } from 'next';
import { AuthService } from '../../lib/services/auth-service';

const authService = new AuthService();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      success: false, 
      error: 'Method not allowed' 
    });
  }

  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ 
        success: false, 
        error: 'Email and password are required' 
      });
    }

    // Attempt to login
    const result = await authService.login({ email, password });

    if (result.success) {
      return res.status(200).json(result);
    } else {
      return res.status(401).json(result); // 401 for unauthorized
    }
  } catch (error: any) {
    console.error('Login error:', error);
    return res.status(500).json({ 
      success: false, 
      error: 'Internal server error' 
    });
  }
}

// Export the handler function to be used in tests
export { handler as loginHandler };