# Agent Guidelines

## Build & Test Commands

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run lint` - Run ESLint
- `npm test` - Run all tests
- `npm run test:watch` - Run tests in watch mode
- `npm run test:coverage` - Run tests with coverage
- `npx jest tests/unit/test_auth_service.ts` - Run single test file

## Code Style

- **Framework**: Next.js 14 with TypeScript
- **Styling**: Tailwind CSS
- **Database**: Prisma with SQLite
- **Imports**: Use `@/` path alias for src directory
- **Formatting**: Prettier with single quotes, 2-space tabs, 80 char width
- **Types**: TypeScript with strict mode disabled
- **Naming**: camelCase for variables/functions, PascalCase for components
- **Error Handling**: Use try/catch with proper error messages
- **File Structure**: Next.js App Router conventions

## Testing

- Jest with ts-jest preset
- Test files in `tests/` directory (unit, integration, e2e)
- 80% coverage threshold required
- Use `setupTests.ts` for test setup

## Database

- **Database**: PostgreSQL (configured in .env, but schema.prisma shows SQLite - needs alignment)
- `npm run db:push` - Push schema changes
- `npm run db:studio` - Open Prisma Studio
