// src/lib/env.ts
import { z } from 'zod';

// Define environment variable schema for validation
const envSchema = z.object({
  // Database
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
  
  // JWT
  JWT_SECRET: z.string().min(1, 'JWT_SECRET is required'),
  
  // Stripe
  STRIPE_SECRET_KEY: z.string().min(1, 'STRIPE_SECRET_KEY is required'),
  STRIPE_WEBHOOK_SECRET: z.string().min(1, 'STRIPE_WEBHOOK_SECRET is required'),
  
  // Cloudflare R2
  R2_ACCESS_KEY_ID: z.string().min(1, 'R2_ACCESS_KEY_ID is required'),
  R2_SECRET_ACCESS_KEY: z.string().min(1, 'R2_SECRET_ACCESS_KEY is required'),
  R2_ENDPOINT: z.string().min(1, 'R2_ENDPOINT is required'),
  R2_BUCKET_NAME: z.string().min(1, 'R2_BUCKET_NAME is required'),
  R2_PUBLIC_DOMAIN: z.string().optional(),
  
  // Redis (for rate limiting)
  REDIS_URL: z.string().min(1, 'REDIS_URL is required'),
  
  // Application
  NEXT_PUBLIC_APP_URL: z.string().min(1, 'NEXT_PUBLIC_APP_URL is required'),
});

// Validate environment variables
function validateEnvironmentVariables() {
  try {
    // Parse and validate environment variables
    const env = envSchema.parse(process.env);
    
    console.log('✅ Environment variables validation passed');
    return { success: true, env };
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('❌ Environment variables validation failed:');
      error.errors.forEach((err) => {
        console.error(`  - ${err.path.join('.')}: ${err.message}`);
      });
      return { success: false, error: error.errors };
    }
    
    console.error('❌ Unexpected error during environment variables validation:', error);
    return { success: false, error: 'Unexpected error during validation' };
  }
}

// Get validated environment variables
function getValidatedEnvironmentVariables() {
  const result = validateEnvironmentVariables();
  
  if (!result.success) {
    throw new Error('Environment variables validation failed');
  }
  
  return result.env;
}

export { validateEnvironmentVariables, getValidatedEnvironmentVariables };
export default { validateEnvironmentVariables, getValidatedEnvironmentVariables };