# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Next.js 14+ AI image generation platform using TypeScript, featuring:
- AI image generation and editing with qwen-image-edit and gemini-flash-image models
- Credit-based payment system with Stripe integration
- Cloudflare R2 storage for images
- JWT authentication with social login support
- Admin dashboard for user and content management
- Multi-language support via next-intl

## Essential Commands

### Development
- `npm run dev` - Start development server (localhost:3000)
- `npm run build` - Build production version
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run test` - Run Jest tests
- `npm run test:watch` - Run tests in watch mode
- `npm run test:coverage` - Run tests with coverage report

### Database
- `npm run db:push` - Push schema changes to database
- `npm run db:studio` - Open Prisma Studio
- `npm run postinstall` - Generate Prisma client (runs automatically after install)

## Architecture & Key Patterns

### Database Architecture
- **PostgreSQL** with Prisma ORM
- **User model**: Credit system with 100 free registration bonus, role-based access
- **Image model**: Hierarchical structure for original/edited images, task tracking
- **CreditTransaction model**: Complete audit trail of credit movements
- **TaskQueue model**: Background processing for AI operations
- **Session model**: JWT-based authentication with 7-day expiry

### Credit System
- Users start with 100 credits upon registration
- AI model costs: qwen-image-edit (10 credits), gemini-flash-image (30 credits)
- Credits are deducted immediately, refunded on failure
- All credit operations use database transactions for consistency

### AI Model Integration
- Simulated AI responses in `src/lib/ai-models.ts` (90% success rate for generation, 85% for editing)
- Real implementation would call Qwen and Gemini APIs
- Task queue tracks progress from "pending" → "processing" → "completed/failed"
- Images stored with hierarchical relationships (original → edited versions)

### Security Architecture
- JWT tokens with 7-day expiration, stored in database
- File upload validation: image types only, max 50MB, user isolation
- Cloudflare R2 with S3-compatible SDK
- Rate limiting via Redis (Upstash)
- Input validation via Zod schemas
- SQL injection prevention via Prisma

### Authentication Flow
- Password requirements: 8+ chars, uppercase, lowercase, number
- Social login support (Google, Facebook) with token simulation
- Sessions tracked in database with expiration
- User roles: "user" (default) or "admin"

### File Structure
```
src/
├── app/
│   ├── api/           # API routes (auth, images, credits, admin)
│   ├── dashboard/     # User dashboard pages
│   ├── admin/         # Admin-only pages
│   └── [locale]/      # Internationalized routes
├── components/
│   └── ui/           # Reusable UI components
└── lib/
    ├── auth.ts       # JWT authentication
    ├── ai-models.ts  # AI model integration
    ├── credit.ts     # Credit system logic
    ├── r2.ts         # Cloudflare R2 storage
    └── db.ts         # Prisma client
```

### Key Integrations
- **Cloudflare R2**: S3-compatible image storage with user isolation
- **Stripe**: Payment processing for credit purchases
- **Redis (Upstash)**: Rate limiting and session management
- **next-intl**: Multi-language support with locale-based routing

## Development Notes

### Environment Variables Required
- `DATABASE_URL` - PostgreSQL connection
- `JWT_SECRET` - JWT signing secret
- `STRIPE_SECRET_KEY` - Stripe payments
- `CLOUDFLARE_R2_*` - R2 storage credentials
- `REDIS_URL` - Rate limiting
- `NEXT_PUBLIC_APP_URL` - Application URL

### Testing
- Jest with React Testing Library
- API contract tests included
- Manual testing guide in `manual-testing.md`

### Code Patterns
- Database transactions for all credit operations
- Consistent error handling with meaningful messages
- Type-safe API responses with Zod validation
- Component-first architecture with TypeScript
- Security-first approach with input validation and sanitization

### Admin Features
- User management with role assignment
- Analytics and usage tracking
- Article publishing system
- Audit logging for admin actions
- Resource locking for concurrent operations