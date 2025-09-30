<!-- 
SYNC IMPACT REPORT
Version change: N/A → 1.0.0
Modified principles: N/A
Added sections: All principles (new constitution)
Removed sections: N/A
Templates requiring updates: ✅ .specify/templates/plan-template.md updated
Follow-up TODOs: RATIFICATION_DATE needs to be set to actual project start date
-->

# oliyo.com Constitution

## Core Principles

### Modern Full-Stack Architecture
Next.js framework drives both frontend and backend development with unified TypeScript codebase; API routes manage server-side logic while React components handle client-side interactions; Clear separation between client and server code maintained through Next.js conventions.

### Component-First Development
All UI elements start as reusable React components with defined props interfaces; Components are self-contained with their styling, logic, and tests; Shared components stored in dedicated library directories with documented usage guidelines.

### Test-Driven Development (NON-NEGOTIABLE)
All features require unit tests before implementation begins; Jest and React Testing Library used for component testing; End-to-end tests written with Cypress or Playwright for critical user flows; Code coverage minimum of 80% required for all new code.

### Performance Optimization
All pages must meet Core Web Vitals thresholds; Image optimization using Next.js Image component required; Server-side rendering and static generation leveraged appropriately for performance; Bundle size monitored and minimized with webpack-bundle-analyzer.

### Security-First Approach
All user inputs validated and sanitized server-side; Authentication and authorization implemented consistently across all routes; Environment variables used for all sensitive configuration; Content Security Policy implemented to prevent XSS attacks.

## Additional Constraints

Technology stack requirements: Next.js 14+, React 18+, Node.js 18+, TypeScript 5+; All dependencies must be actively maintained with regular security updates; Database integration follows Next.js recommended patterns (Prisma, Drizzle, etc.); Deployment to Vercel or equivalent Next.js-optimized platform.

## Development Workflow

Code review required for all PRs with minimum 1 approval; Feature flags used for incomplete functionality; Branch naming follows convention: feature/issue-number-description, bugfix/issue-number-description, or hotfix/issue-number-description; All code must pass linting, formatting (Prettier), and tests before merging.

## Governance

This constitution supersedes all other development practices; Amendments require team consensus and documented approval; All PRs and code reviews must verify compliance with these principles; Configuration follows Next.js recommended best practices.

**Version**: 1.0.0 | **Ratified**: TODO(RATIFICATION_DATE): Date project was established | **Last Amended**: 2025-09-30