# Oliyo AI Image Platform

This is a Next.js-based application that enables users to generate and edit images using AI models (qwen-image-edit, gemini-flash-image). The platform features a credit-based system where users receive 100 free credits upon registration and can purchase more to continue using the service.

## Features

- **User Authentication**: Register, login, and social login capabilities
- **AI Image Generation**: Create images from text prompts
- **AI Image Editing**: Modify existing images with text prompts
- **Credit System**: Track and manage user credits for AI operations
- **Payment Integration**: Stripe integration for purchasing credits
- **Admin Dashboard**: User management, analytics, and content publishing
- **Secure File Storage**: Cloudflare R2 integration for image storage

## Tech Stack

- Next.js 14+ (with App Router)
- TypeScript 5+
- Prisma ORM (with PostgreSQL)
- Cloudflare R2 (for image storage)
- Stripe (for payments)
- Redis (for rate limiting)
- JWT (for authentication)

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Set up environment variables in `.env.local`:
   ```env
   DATABASE_URL="postgresql://username:password@localhost:5432/oliyo_image_platform"
   JWT_SECRET="your-super-secret-jwt-key-here-make-it-long-and-random"
   STRIPE_SECRET_KEY="sk_test_your_stripe_secret_key_here"
   R2_ACCESS_KEY_ID="your_r2_access_key_id"
   R2_SECRET_ACCESS_KEY="your_r2_secret_access_key"
   R2_ENDPOINT="https://your-account-id.r2.cloudflarestorage.com"
   R2_BUCKET_NAME="oliyo-image-storage-bucket"
   R2_PUBLIC_DOMAIN="https://your-public-domain.r2.dev"  # Optional: if using a custom domain
   REDIS_URL="redis://localhost:6379"
   NEXT_PUBLIC_APP_URL="http://localhost:3000"
   ```

3. Generate Prisma client:
   ```bash
   npm run db:generate
   ```

4. Run database migrations:
   ```bash
   npm run db:migrate
   ```

5. Initialize database with sample data:
   ```bash
   npm run db:init
   ```

6. Check database connection:
   ```bash
   npm run db:check
   ```

7. Start the development server:
   ```bash
   npm run dev
   ```

## API Documentation

Comprehensive API documentation is available in [docs/api.md](./docs/api.md).

## Architecture

The application follows a unified Next.js codebase with:
- API routes in `src/app/api/`
- Components in `src/components/`
- Services in `src/lib/`
- Database models defined in Prisma schema (`prisma/schema.prisma`)
- Cloudflare R2 integration for secure image storage

## Security Features

- JWT-based authentication
- Rate limiting with Redis
- Input validation and sanitization
- Secure R2 file uploads with appropriate permissions
- SQL injection prevention via Prisma ORM
- Cross-site scripting (XSS) prevention

## Testing

The application includes:
- Contract tests for all API endpoints
- Integration tests for key user flows
- Manual testing guide in `manual-testing.md`

## Credits

This platform was developed following the oliyo.com Constitution principles of:
- Modern Full-Stack Architecture (Next.js framework with TypeScript)
- Component-First Development
- Test-Driven Development
- Performance Optimization
- Security-First Approach