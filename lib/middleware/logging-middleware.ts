import { NextApiRequest, NextApiResponse } from 'next';

export function setupLogging() {
  // This function could be used to initialize logging configuration
  console.log('Logging setup complete');
}

export function logRequest(req: NextApiRequest, res: NextApiResponse, startTime: number) {
  const duration = Date.now() - startTime;
  const method = req.method;
  const url = req.url;
  const statusCode = res.statusCode;
  const userAgent = req.headers['user-agent'];
  const userId = (req as any).userId || 'anonymous';

  console.log(`[${new Date().toISOString()}] ${method} ${url} ${statusCode} ${duration}ms - User: ${userId} - UA: ${userAgent}`);
}

export function logError(error: Error, context: string) {
  console.error(`[${new Date().toISOString()}] ERROR [${context}]:`, error.message, error.stack);
}

export function logInfo(message: string, context: string) {
  console.log(`[${new Date().toISOString()}] INFO [${context}]: ${message}`);
}

export function logAPIUsage(userId: string, endpoint: string, modelUsed?: string) {
  console.log(`[${new Date().toISOString()}] API_USAGE - User: ${userId}, Endpoint: ${endpoint}${modelUsed ? `, Model: ${modelUsed}` : ''}`);
}