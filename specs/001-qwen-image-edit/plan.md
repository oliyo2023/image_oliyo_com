# Implementation Plan: AI Image Generation and Editing Website

**Branch**: `001-qwen-image-edit` | **Date**: 2025-10-03 | **Spec**: E:\project\oliyo.com\specs\001-qwen-image-edit\spec.md
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

AI-powered image generation and editing website with user authentication, credit-based system, and admin management. Users can generate images from text prompts and edit uploaded images using qwen-image-edit and gemini-flash-image models, with credits consumed per operation (5 for qwen, 10 for gemini).

## Technical Context

**Language/Version**: TypeScript 5.0+  
**Primary Dependencies**: Next.js 14, React 18, Prisma, Tailwind CSS, Stripe, AWS S3  
**Storage**: Prisma with SQLite (development), PostgreSQL (production), AWS S3 for image storage  
**Testing**: Jest with ts-jest, Testing Library  
**Target Platform**: Vercel deployment  
**Project Type**: Web application (frontend + backend)  
**Performance Goals**: 95% of image generation requests within 60 seconds, 95% API responses within 2 seconds  
**Constraints**: Max 50MB image uploads, standard HTTPS security, 95% uptime target  
**Scale/Scope**: 100+ concurrent users, dynamic scaling based on demand

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

### Core Principles Check

- [ ] Library-First: Components should be self-contained and independently testable
- [ ] CLI Interface: Not applicable for web application
- [ ] Test-First: TDD approach required for all features
- [ ] Integration Testing: Required for API contracts and inter-service communication
- [ ] Observability: Structured logging and monitoring required
- [ ] Versioning: Semantic versioning for APIs and breaking changes
- [ ] Simplicity: Start simple, follow YAGNI principles

### Security & Compliance

- [ ] Data Protection: User data and images secured with HTTPS
- [ ] Authentication: Email/password with optional social login
- [ ] Authorization: Role-based access control (user vs admin)
- [ ] Content Moderation: User confirmation for content compliance

### Performance & Scalability

- [ ] Response Times: API endpoints <2s for 95% requests
- [ ] Concurrency: Support 100+ concurrent users
- [ ] Resource Management: Credit-based usage control
- [ ] Error Handling: Graceful failure with user notifications

## Project Structure

### Documentation (this feature)

```
specs/[###-feature]/
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
├── app/                    # Next.js App Router
│   ├── about/             # About page
│   ├── admin/             # Admin dashboard pages
│   │   ├── analytics/     # Analytics page
│   │   ├── articles/      # Article management
│   │   └── users/         # User management
│   ├── blog/              # Blog page
│   ├── contact/           # Contact page
│   ├── dashboard/         # User dashboard
│   │   ├── edit-image/    # Image editing interface
│   │   ├── gallery/       # Image gallery
│   │   ├── generate-image/ # Image generation interface
│   │   └── purchase-credits/ # Credit purchase
│   ├── docs/              # Documentation pages
│   ├── faq/               # FAQ page
│   ├── login/             # Login page
│   ├── pricing/           # Pricing page
│   ├── register/          # Registration page
│   ├── test/              # Test page
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page
├── components/            # Reusable React components
│   ├── Navigation.tsx     # Navigation component
│   └── UserAvatar.tsx     # User avatar component
└── lib/                   # Utility libraries and services
    ├── admin-users.ts     # Admin user management
    ├── ai-models.ts       # AI model integration
    ├── audit-logging.ts   # Audit logging
    ├── auth.ts            # Authentication utilities
    ├── credit.ts          # Credit management
    ├── db-*.ts            # Database utilities
    ├── env.ts             # Environment configuration
    ├── permissions.ts     # Permission management
    ├── personalization.ts # User personalization
    ├── r2.ts              # R2 storage integration
    ├── resource-locking.ts # Resource locking
    ├── stripe.ts          # Stripe payment integration
    ├── task-queue.ts      # Task queue management
    ├── user.ts            # User utilities
    ├── utils.ts           # General utilities
    └── validations.ts     # Input validation

prisma/                   # Database schema and migrations
├── schema.prisma         # Database schema
├── migrations/           # Database migrations
└── seed.ts              # Database seeding

tests/                    # Test files
├── contract/             # Contract tests
├── integration/          # Integration tests
├── e2e/                  # End-to-end tests
├── performance/          # Performance tests
└── unit/                 # Unit tests
```

**Structure Decision**: Next.js App Router with integrated frontend/backend structure. The application uses a monorepo-style organization with clear separation between UI components (app/), shared utilities (lib/), database management (prisma/), and comprehensive testing (tests/).

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
   ```

3. **Consolidate findings** in `research.md` using format:
   - Decision: [what was chosen]
   - Rationale: [why chosen]
   - Alternatives considered: [what else evaluated]

**Output**: research.md with all NEEDS CLARIFICATION resolved

## Phase 1: Design & Contracts

_Prerequisites: research.md complete_

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
   - Run `.specify/scripts/powershell/update-agent-context.ps1 -AgentType opencode`
     **IMPORTANT**: Execute it exactly as specified above. Do not add or remove any arguments.
   - If exists: Add only NEW tech from current plan
   - Preserve manual additions between markers
   - Update recent changes (keep last 3)
   - Keep under 150 lines for token efficiency
   - Output to repository root

**Output**: data-model.md, /contracts/\*, failing tests, quickstart.md, agent-specific file

## Phase 2: Task Planning Approach

_This section describes what the /tasks command will do - DO NOT execute during /plan_

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

_These phases are beyond the scope of the /plan command_

**Phase 3**: Task execution (/tasks command creates tasks.md)  
**Phase 4**: Implementation (execute tasks.md following constitutional principles)  
**Phase 5**: Validation (run tests, execute quickstart.md, performance validation)

## Complexity Tracking

_Fill ONLY if Constitution Check has violations that must be justified_

| Violation                  | Why Needed         | Simpler Alternative Rejected Because |
| -------------------------- | ------------------ | ------------------------------------ |
| [e.g., 4th project]        | [current need]     | [why 3 projects insufficient]        |
| [e.g., Repository pattern] | [specific problem] | [why direct DB access insufficient]  |

## Progress Tracking

_This checklist is updated during execution flow_

**Phase Status**:

- [ ] Phase 0: Research complete (/plan command)
- [ ] Phase 1: Design complete (/plan command)
- [ ] Phase 2: Task planning complete (/plan command - describe approach only)
- [ ] Phase 3: Tasks generated (/tasks command)
- [ ] Phase 4: Implementation complete
- [ ] Phase 5: Validation passed

**Gate Status**:

- [ ] Initial Constitution Check: PASS
- [ ] Post-Design Constitution Check: PASS
- [ ] All NEEDS CLARIFICATION resolved
- [ ] Complexity deviations documented

---

_Based on Constitution v2.1.1 - See `/memory/constitution.md`_
