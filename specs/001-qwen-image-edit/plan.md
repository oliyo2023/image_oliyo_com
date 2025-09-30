
# Implementation Plan: AI Image Generation and Editing Website

**Branch**: `001-qwen-image-edit` | **Date**: 2025-09-30 | **Spec**: [E:\project\oliyo.com\specs\001-qwen-image-edit\spec.md]
**Input**: Feature specification from `/specs/001-qwen-image-edit/spec.md`

## Execution Flow (/plan command scope)
```
1. Load feature spec from Input path
   → If not found: ERROR "No feature spec at {path}"
2. Fill Technical Context (scan for NEEDS CLARIFICATION)
   → Detect Project Type from file system structure or context (web=frontend+backend, mobile=app+api)
   → Set Structure Decision based on project type
3. Fill the Constitution Check section based on the content of the constitution document.
4. Evaluate Constitution Check section below
   → If violations exist: Document in Complexity Tracking
   → If no justification possible: ERROR "Simplify approach first"
   → Update Progress Tracking: Initial Constitution Check
5. Execute Phase 0 → research.md
   → If NEEDS CLARIFICATION remain: ERROR "Resolve unknowns"
6. Execute Phase 1 → contracts, data-model.md, quickstart.md, agent-specific template file (e.g., `CLAUDE.md` for Claude Code, `.github/copilot-instructions.md` for GitHub Copilot, `GEMINI.md` for Gemini CLI, `QWEN.md` for Qwen Code or `AGENTS.md` for opencode).
7. Re-evaluate Constitution Check section
   → If new violations: Refactor design, return to Phase 1
   → Update Progress Tracking: Post-Design Constitution Check
8. Plan Phase 2 → Describe task generation approach (DO NOT create tasks.md)
9. STOP - Ready for /tasks command
```

**IMPORTANT**: The /plan command STOPS at step 7. Phases 2-4 are executed by other commands:
- Phase 2: /tasks command creates tasks.md
- Phase 3-4: Implementation execution (manual or via tools)

## Summary
Development of a full-stack web application that allows users to generate and edit images using AI models (qwen-image-edit, gemini-flash-image). The system includes a credit-based usage model where users receive 100 credits upon registration and consume credits for image operations, with the option to purchase more. The platform features user registration/login with optional social authentication, image upload and editing capabilities, and an admin backend for user management and analytics. The architecture follows Next.js best practices with TypeScript, component-first development, and performance optimization.

## Technical Context
**Language/Version**: TypeScript 5.0+, JavaScript ES2022  
**Primary Dependencies**: Next.js 14+, React 18+, Node.js 18+, Prisma ORM, Stripe for payments, AWS S3 for image storage  
**Storage**: PostgreSQL database via Prisma ORM, secure cloud storage for images (AWS S3)  
**Testing**: Jest, React Testing Library, Playwright for end-to-end tests  
**Target Platform**: Web application (Next.js App Router with SSR/Static generation)  
**Project Type**: Web application (unified Next.js codebase with API routes)  
**Performance Goals**: Core Web Vitals compliant (90/90/90 - LCP/FID/CLS), image generation within 60s for 95% of requests, API response times under 2s for 95% of requests  
**Constraints**: Image file size up to 50MB, dynamically scaled infrastructure, AI model integration rate limits  
**Scale/Scope**: Auto-scaling based on demand, designed for 100+ concurrent users

## Constitution Check
*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

Based on oliyo.com Constitution v1.0.0:
- Modern Full-Stack Architecture: Next.js framework with TypeScript unified codebase using API routes (COMPLIANT)
- Component-First Development: React components with defined interfaces (COMPLIANT)
- Test-Driven Development: Jest, React Testing Library, Playwright required (COMPLIANT)
- Performance Optimization: Core Web Vitals compliance, Next.js Image optimization (COMPLIANT)
- Security-First Approach: Input validation, authentication, environment variables, secure image storage (COMPLIANT)
- Technology Stack: Next.js 14+, React 18+, Node.js 18+, TypeScript 5+ (COMPLIANT)

## Project Structure

### Documentation (this feature)
```
specs/001-qwen-image-edit/
├── plan.md              # This file (/plan command output)
├── research.md          # Phase 0 output (/plan command)
├── data-model.md        # Phase 1 output (/plan command)
├── quickstart.md        # Phase 1 output (/plan command)
├── contracts/           # Phase 1 output (/plan command)
└── tasks.md             # Phase 2 output (/tasks command - NOT created by /plan)
```

### Source Code (repository root)
```
src/
├── app/                 # Next.js 13+ App Router structure
│   ├── api/
│   │   ├── auth/
│   │   │   ├── register/route.ts
│   │   │   ├── login/route.ts
│   │   │   ├── login-social/route.ts
│   │   │   ├── profile/route.ts
│   │   │   └── logout/route.ts
│   │   ├── images/
│   │   │   ├── generate/route.ts
│   │   │   ├── edit/route.ts
│   │   │   └── [...slug]/route.ts
│   │   ├── credits/
│   │   │   ├── balance/route.ts
│   │   │   ├── transactions/route.ts
│   │   │   ├── purchase-intent/route.ts
│   │   │   └── purchase-confirm/route.ts
│   │   └── admin/
│   │       ├── users/route.ts
│   │       ├── analytics/route.ts
│   │       ├── transactions/route.ts
│   │       ├── articles/route.ts
│   │       └── articles/[id]/route.ts
│   ├── components/
│   │   ├── auth/
│   │   ├── image-editor/
│   │   ├── dashboard/
│   │   ├── admin/
│   │   └── shared/
│   ├── lib/             # Shared utilities and services
│   │   ├── db.ts        # Database connection
│   │   ├── auth.ts      # Authentication utilities
│   │   ├── s3.ts        # S3 client
│   │   ├── stripe.ts    # Stripe client
│   │   ├── ai-models.ts # AI model integration
│   │   └── validations.ts # Validation utilities
│   ├── hooks/
│   │   ├── useAuth.ts
│   │   └── useImageGeneration.ts
│   ├── types/
│   │   ├── user.types.ts
│   │   ├── image.types.ts
│   │   └── credit.types.ts
│   └── dashboard/
│       ├── page.tsx
│       ├── generate-image/page.tsx
│       ├── edit-image/page.tsx
│       └── purchase-credits/page.tsx
│   └── admin/
│       ├── page.tsx
│       ├── users/page.tsx
│       ├── analytics/page.tsx
│       └── articles/page.tsx
├── middleware.ts        # Next.js middleware for auth and rate limiting
└── tests/
    ├── unit/
    ├── integration/
    └── e2e/
```

**Structure Decision**: Web application following Next.js 14+ App Router conventions with unified TypeScript codebase. API routes manage server-side logic while React components handle client-side interactions. This structure follows constitutional principles of unified codebase with clear separation between client and server code through Next.js conventions.

## Phase 0: Outline & Research
1. **Extract unknowns from Technical Context** above:
   - For each NEEDS CLARIFICATION → research task
   - For each dependency → best practices task
   - For each integration → patterns task

2. **Generate and dispatch research agents**:
   ```
   For each unknown in Technical Context:
     Task: "Research {unknown} for {feature context}"
   For each technology choice:
     Task: "Find best practices for {tech} in {domain}"
   For AI model integrations:
     Task: "Research qwen-image-edit and gemini-flash-image API integration patterns"
   For payment processing:
     Task: "Research Stripe integration best practices for credit purchases"
   ```

3. **Consolidate findings** in `research.md` using format:
   - Decision: [what was chosen]
   - Rationale: [why chosen]
   - Alternatives considered: [what else evaluated]

**Output**: research.md with all NEEDS CLARIFICATION resolved

## Phase 1: Design & Contracts
*Prerequisites: research.md complete*

1. **Extract entities from feature spec** → `data-model.md`:
   - Entity name, fields, relationships
   - Validation rules from requirements
   - State transitions if applicable

2. **Generate API contracts** from functional requirements:
   - For each user action → endpoint
   - Use standard REST/GraphQL patterns
   - Output OpenAPI/GraphQL schema to `/contracts/`

3. **Generate contract tests** from contracts:
   - One test file per endpoint
   - Assert request/response schemas
   - Tests must fail (no implementation yet)

4. **Extract test scenarios** from user stories:
   - Each story → integration test scenario
   - Quickstart test = story validation steps

5. **Update agent file incrementally** (O(1) operation):
   - Run `.specify/scripts/powershell/update-agent-context.ps1 -AgentType qwen`
     **IMPORTANT**: Execute it exactly as specified above. Do not add or remove any arguments.
   - If exists: Add only NEW tech from current plan
   - Preserve manual additions between markers
   - Update recent changes (keep last 3)
   - Keep under 150 lines for token efficiency
   - Output to repository root

**Output**: data-model.md, /contracts/*, failing tests, quickstart.md, agent-specific file

## Phase 2: Task Planning Approach
*This section describes what the /tasks command will do - DO NOT execute during /plan*

**Task Generation Strategy**:
- Load `.specify/templates/tasks-template.md` as base
- Generate tasks from Phase 1 design docs (contracts, data model, quickstart)
- Each contract → contract test task [P]
- Each entity → model creation task [P] 
- Each user story → integration test task
- Implementation tasks to make tests pass

**Ordering Strategy**:
- TDD order: Tests before implementation 
- Dependency order: Models before services before UI
- Mark [P] for parallel execution (independent files)

**Estimated Output**: 25-30 numbered, ordered tasks in tasks.md

**IMPORTANT**: This phase is executed by the /tasks command, NOT by /plan

## Phase 3+: Future Implementation
*These phases are beyond the scope of the /plan command*

**Phase 3**: Task execution (/tasks command creates tasks.md)  
**Phase 4**: Implementation (execute tasks.md following constitutional principles)  
**Phase 5**: Validation (run tests, execute quickstart.md, performance validation)

## Complexity Tracking
*Fill ONLY if Constitution Check has violations that must be justified*

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| [API Rate Limiting] | [High volume AI model requests could incur excessive costs] | [Without rate limiting, users could abuse the system and cause high costs] |

## Progress Tracking
*This checklist is updated during execution flow*

**Phase Status**:
- [x] Phase 0: Research complete (/plan command)
- [x] Phase 1: Design complete (/plan command)
- [x] Phase 2: Task planning complete (/plan command - describe approach only)
- [ ] Phase 3: Tasks generated (/tasks command)
- [ ] Phase 4: Implementation complete
- [ ] Phase 5: Validation passed

**Gate Status**:
- [x] Initial Constitution Check: PASS
- [x] Post-Design Constitution Check: PASS
- [x] All NEEDS CLARIFICATION resolved
- [x] Complexity deviations documented

---
*Based on oliyo.com Constitution v1.0.0 - See `.specify/memory/constitution.md`*
