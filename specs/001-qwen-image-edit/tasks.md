# Tasks: AI Image Generation and Editing Website

**Input**: Design documents from `/specs/001-qwen-image-edit/`
**Prerequisites**: plan.md (required), research.md, data-model.md, contracts/

## Execution Flow (main)
```
1. Load plan.md from feature directory
   → If not found: ERROR "No implementation plan found"
   → Extract: tech stack, libraries, structure
2. Load optional design documents:
   → data-model.md: Extract entities → model tasks
   → contracts/: Each file → contract test task
   → research.md: Extract decisions → setup tasks
3. Generate tasks by category:
   → Setup: project init, dependencies, linting
   → Tests: contract tests, integration tests
   → Core: models, services, CLI commands
   → Integration: DB, middleware, logging
   → Polish: unit tests, performance, docs
4. Apply task rules:
   → Different files = mark [P] for parallel
   → Same file = sequential (no [P])
   → Tests before implementation (TDD)
5. Number tasks sequentially (T001, T002...)
6. Generate dependency graph
7. Create parallel execution examples
8. Validate task completeness:
   → All contracts have tests?
   → All entities have models?
   → All endpoints implemented?
9. Return: SUCCESS (tasks ready for execution)
```

## Format: `[ID] [P?] Description`
- **[P]**: Can run in parallel (different files, no dependencies)
- Include exact file paths in descriptions

## Path Conventions
- **Single project**: `src/`, `tests/` at repository root
- **Web app**: `backend/src/`, `frontend/src/`
- **Mobile**: `api/src/`, `ios/src/` or `android/src/`
- Paths shown below assume single project - adjust based on plan.md structure

## Phase 3.1: Setup
- [X] T001 Create project structure per implementation plan with Next.js App Router structure
- [X] T002 Initialize Next.js project with TypeScript, Prisma ORM, Stripe dependencies
- [X] T003 [P] Configure linting (ESLint) and formatting (Prettier) tools

## Phase 3.2: Tests First (TDD) ⚠️ MUST COMPLETE BEFORE 3.3
**CRITICAL: These tests MUST be written and MUST FAIL before ANY implementation**
- [X] T004 [P] Contract test for auth endpoints in tests/contract/test_auth.ts
- [X] T005 [P] Contract test for image endpoints in tests/contract/test_image.ts
- [X] T006 [P] Contract test for payment endpoints in tests/contract/test_payment.ts
- [X] T007 [P] Contract test for admin endpoints in tests/contract/test_admin.ts
- [X] T008 [P] Integration test user registration and credit assignment in tests/integration/test_auth.ts
- [X] T009 [P] Integration test image generation flow in tests/integration/test_image_gen.ts
- [X] T010 [P] Integration test image editing flow in tests/integration/test_image_edit.ts
- [X] T011 [P] Integration test payment processing in tests/integration/test_payment.ts

## Phase 3.3: Core Implementation (ONLY after tests are failing)
- [X] T012 [P] User model with Prisma schema in src/lib/db.ts
- [X] T013 [P] CreditTransaction model with Prisma schema in src/lib/db.ts
- [X] T014 [P] Image model with Prisma schema in src/lib/db.ts
- [X] T015 [P] AIModel model with Prisma schema in src/lib/db.ts
- [X] T016 [P] Article model with Prisma schema in src/lib/db.ts
- [X] T017 [P] Session model with Prisma schema in src/lib/db.ts
- [X] T018 [P] Auth service with login, register, social auth in src/lib/auth.ts
- [X] T019 [P] Image generation service with AI model integration in src/lib/ai-models.ts
- [X] T020 [P] Payment service with Stripe integration in src/lib/stripe.ts
- [X] T021 [P] User service with user operations in src/lib/user.ts
- [X] T022 [P] AI model integration service for qwen-image-edit and gemini-flash-image in src/lib/ai-models.ts
- [X] T023 [P] Credit service with credit deduction logic in src/lib/credit.ts
- [X] T024 POST /api/auth/register endpoint in src/app/api/auth/register/route.ts
- [X] T025 POST /api/auth/login endpoint in src/app/api/auth/login/route.ts
- [X] T026 POST /api/auth/login-social endpoint in src/app/api/auth/login-social/route.ts
- [X] T027 GET /api/auth/profile endpoint in src/app/api/auth/profile/route.ts
- [X] T028 POST /api/auth/logout endpoint in src/app/api/auth/logout/route.ts
- [X] T029 POST /api/images/generate endpoint in src/app/api/images/generate/route.ts
- [X] T030 POST /api/images/edit endpoint in src/app/api/images/edit/route.ts
- [X] T031 GET /api/images/[...slug] endpoint in src/app/api/images/[...slug]/route.ts
- [X] T032 GET /api/credits/balance endpoint in src/app/api/credits/balance/route.ts
- [X] T033 GET /api/credits/transactions endpoint in src/app/api/credits/transactions/route.ts
- [X] T034 POST /api/credits/purchase-intent endpoint in src/app/api/credits/purchase-intent/route.ts
- [X] T035 POST /api/credits/purchase-confirm endpoint in src/app/api/credits/purchase-confirm/route.ts
- [X] T036 GET /api/admin/users endpoint in src/app/api/admin/users/route.ts
- [X] T037 GET /api/admin/analytics endpoint in src/app/api/admin/analytics/route.ts
- [X] T038 GET /api/admin/transactions endpoint in src/app/api/admin/transactions/route.ts
- [X] T039 POST /api/admin/articles endpoint in src/app/api/admin/articles/route.ts
- [X] T040 GET /api/admin/articles endpoint in src/app/api/admin/articles/route.ts
- [X] T041 PUT /api/admin/articles/[id] endpoint in src/app/api/admin/articles/[id]/route.ts

## Phase 3.4: Integration
- [X] T042 Connect models to database with Prisma in src/lib/db.ts
- [X] T043 Implement authentication middleware with JWT in src/middleware.ts
- [X] T044 Implement rate limiting middleware with Redis in src/middleware.ts
- [X] Setup Cloudflare R2 client for secure image storage in src/lib/r2.ts
- [X] T046 Setup Stripe client for payment processing in src/lib/stripe.ts
- [X] T047 Implement image upload validation (format, size) in src/lib/validations.ts
- [X] T048 Connect image generation to AI models in src/lib/ai-models.ts
- [X] T049 Implement credit deduction logic for image operations in src/lib/credit.ts
- [X] T050 Add security measures for image storage in src/lib/r2.ts

## Phase 3.5: Polish
- [X] T051 [P] Unit tests for authentication service in tests/unit/test_auth_service.py
- [X] T052 [P] Unit tests for image generation service in tests/unit/test_image_service.py
- [X] T053 [P] Unit tests for payment service in tests/unit/test_payment_service.py
- [X] T054 [P] Unit tests for user management in tests/unit/test_user_service.py
- [X] T055 Performance tests for image generation API with 90/90/90 Core Web Vitals targets
- [X] T056 [P] Update docs/api.md with all endpoints and usage
- [X] T057 Remove code duplication and refactor common utilities
- [X] T058 Run manual-testing.md following quickstart guide scenarios

## Progress Tracking
*This checklist is updated during execution flow*

**Phase Status**:
- [x] Phase 0: Research complete (/plan command)
- [x] Phase 1: Design complete (/plan command)
- [x] Phase 2: Task planning complete (/plan command - describe approach only)
- [x] Phase 3: Tasks generated (/tasks command)
- [x] Phase 4: Implementation complete
- [x] Phase 5: Validation passed

**Gate Status**:
- [x] Initial Constitution Check: PASS
- [x] Post-Design Constitution Check: PASS
- [x] All NEEDS CLARIFICATION resolved
- [x] Complexity deviations documented

## Dependencies
- Tests (T004-T011) before implementation (T012-T050)
- T012-T017 (models) before T018-T022 (services)
- T018-T022 (services) before T023-T042 (controllers/endpoints)
- T042 (database connection) blocks several integration tasks
- T043 (auth middleware) blocks protected endpoints
- Implementation before polish (T051-T058)

## Parallel Example
```
# Launch T004-T007 together:
Task: "Contract test for auth endpoints in tests/contract/test_auth.py"
Task: "Contract test for image endpoints in tests/contract/test_image.py"
Task: "Contract test for payment endpoints in tests/contract/test_payment.py"
Task: "Contract test for admin endpoints in tests/contract/test_admin.py"
```

## Notes
- [P] tasks = different files, no dependencies
- Verify tests fail before implementing
- Commit after each task
- Avoid: vague tasks, same file conflicts

## Task Generation Rules
*Applied during main() execution*

1. **From Contracts**:
   - Each contract file → contract test task [P]
   - Each endpoint → implementation task
   
2. **From Data Model**:
   - Each entity → model creation task [P]
   - Relationships → service layer tasks
   
3. **From User Stories**:
   - Each story → integration test [P]
   - Quickstart scenarios → validation tasks

4. **Ordering**:
   - Setup → Tests → Models → Services → Endpoints → Polish
   - Dependencies block parallel execution

## Validation Checklist
*GATE: Checked by main() before returning*

- [X] All contracts have corresponding tests
- [X] All entities have model tasks
- [X] All tests come before implementation
- [X] Parallel tasks truly independent
- [X] Each task specifies exact file path
- [X] No task modifies same file as another [P] task