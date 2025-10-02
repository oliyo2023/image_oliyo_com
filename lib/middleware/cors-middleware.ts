import { NextApiHandler } from 'next';

// Security headers to prevent common web vulnerabilities
const securityHeaders = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'geolocation=(), microphone=(), camera=()',
};

// Default allowed origins (in production, configure as needed)
const allowedOrigins = process.env.NODE_ENV === 'production' 
  ? (process.env.ALLOWED_ORIGINS?.split(',') || ['https://oliyo.com'])
  : [
      'http://localhost:3000',
      'http://localhost:3001',
      'https://oliyo.com',
      'https://www.oliyo.com'
    ];

export function withCORS(handler: NextApiHandler): NextApiHandler {
  return async (req, res) => {
    // Set CORS headers
    const origin = req.headers.origin;
    
    if (origin && allowedOrigins.includes(origin)) {
      res.setHeader('Access-Control-Allow-Origin', origin);
    } else {
      // For requests without origin (like from curl or some tools), allow from allowed origins
      res.setHeader('Access-Control-Allow-Origin', allowedOrigins[0]);
    }
    
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
    res.setHeader('Access-Control-Allow-Credentials', 'true');

    // Add security headers
    Object.entries(securityHeaders).forEach(([key, value]) => {
      res.setHeader(key, value);
    });

    // Handle preflight requests
    if (req.method === 'OPTIONS') {
      res.status(200).end();
      return;
    }

    return handler(req, res);
  };
}