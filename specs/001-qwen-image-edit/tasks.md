# Tasks: AI Image Generation and Editing Website

**Input**: Design documents from `E:\project\oliyo.com\specs\001-qwen-image-edit\`
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
- [x] T001 Create Next.js project structure per implementation plan
- [x] T002 Initialize TypeScript/Next.js project with required dependencies (Next.js 14+, React 18+, Prisma, etc.)
- [x] T003 [P] Configure linting (ESLint) and formatting (Prettier) tools
- [x] T004 Set up Prisma ORM with PostgreSQL and create initial schema
- [x] T005 Create .env file structure for all required environment variables

## Phase 3.2: Tests First (TDD) ⚠️ MUST COMPLETE BEFORE 3.3
**CRITICAL: These tests MUST be written and MUST FAIL before ANY implementation**
- [x] T006 [P] Contract test POST /api/auth/register in tests/contract/test_auth_register.ts
- [x] T007 [P] Contract test POST /api/auth/login in tests/contract/test_auth_login.ts
- [x] T008 [P] Contract test POST /api/auth/logout in tests/contract/test_auth_logout.ts
- [x] T009 [P] Contract test POST /api/images/generate in tests/contract/test_images_generate.ts
- [x] T010 [P] Contract test POST /api/images/edit in tests/contract/test_images_edit.ts
- [x] T011 [P] Contract test POST /api/images/upload in tests/contract/test_images_upload.ts
- [x] T012 [P] Integration test user registration workflow in tests/integration/test_user_registration.ts
- [x] T013 [P] Integration test image generation workflow in tests/integration/test_image_generation.ts
- [x] T014 [P] Integration test image editing workflow in tests/integration/test_image_editing.ts

## Phase 3.3: Core Implementation (ONLY after tests are failing)
- [x] T015 [P] User model in prisma/schema.prisma
- [x] T016 [P] CreditTransaction model in prisma/schema.prisma
- [x] T017 [P] Image model in prisma/schema.prisma
- [x] T018 [P] AIModel model in prisma/schema.prisma
- [x] T019 [P] Article model in prisma/schema.prisma
- [x] T020 [P] Session model in prisma/schema.prisma
- [x] T021 [P] UserService with CRUD operations in lib/services/user-service.ts
- [x] T022 [P] CreditService with transaction operations in lib/services/credit-service.ts
- [x] T023 [P] ImageService for image management in lib/services/image-service.ts
- [x] T024 [P] AuthService for authentication in lib/services/auth-service.ts
- [x] T025 [P] AIService for AI model integration in lib/services/ai-service.ts
- [x] T026 [P] ArticleService for content management in lib/services/article-service.ts
- [x] T027 [P] Password hashing utility in lib/utils/auth.ts
- [x] T028 [P] Session management utility in lib/utils/session.ts
- [x] T029 [P] Image validation utility in lib/utils/image.ts
- [x] T030 [P] Credit calculation utility in lib/utils/credit.ts
- [x] T031 [P] Type definitions in lib/types/index.ts
- [x] T032 POST /api/auth/register endpoint implementation
- [x] T033 POST /api/auth/login endpoint implementation
- [x] T034 POST /api/auth/logout endpoint implementation
- [x] T035 POST /api/images/generate endpoint implementation
- [x] T036 POST /api/images/edit endpoint implementation
- [x] T037 POST /api/images/upload endpoint implementation
- [x] T038 [P] Image upload component in components/image-editor/upload.tsx
- [x] T039 [P] Image editor component in components/image-editor/editor.tsx
- [x] T040 [P] User dashboard component in components/dashboard/index.tsx
- [x] T041 [P] Gallery component in components/gallery/index.tsx
- [x] T042 [P] Authentication components in components/auth/
- [x] T043 [P] Admin components in components/admin/

## Phase 3.4: Integration
- [x] T044 Connect all service layers to Prisma database
- [x] T045 Implement auth middleware for protected routes
- [x] T046 Set up request/response logging
- [x] T047 Configure CORS and security headers
- [x] T048 Implement image storage solutions (local/cloudinary)
- [x] T049 Integrate with Qwen and Gemini APIs
- [x] T050 Set up payment processing for credit purchases
- [x] T051 Implement session management
- [x] T052 Create database seed script with initial AI models

## Phase 3.5: Polish
- [x] T053 [P] Unit tests for UserService in tests/unit/test_user_service.ts
- [x] T054 [P] Unit tests for CreditService in tests/unit/test_credit_service.ts
- [x] T055 [P] Unit tests for ImageService in tests/unit/test_image_service.ts
- [x] T056 [P] Unit tests for AuthService in tests/unit/test_auth_service.ts
- [x] T057 [P] Unit tests for AIService in tests/unit/test_ai_service.ts
- [x] T058 Performance tests for API response times (<2s)
- [x] T059 [P] Update docs/api.md with API documentation
- [x] T060 [P] Update docs/user-guide.md
- [x] T061 [P] Update docs/admin-guide.md
- [x] T062 Run all tests with 80%+ coverage requirement
- [x] T063 Run manual-testing.md to validate user workflows

## Dependencies
- Tests (T006-T014) before implementation (T015-T043)
- T015-T020 blocks T021-T026 (models before services)
- T021-T026 blocks T032-T037 (services before endpoints)
- T001-T005 blocks all other tasks (setup first)
- T044 blocks T032-T037 (DB connection before endpoints)
- Implementation before polish (T053-T063)

## Parallel Example
```
# Launch T006-T011 together (contract tests):
Task: "Contract test POST /api/auth/register in tests/contract/test_auth_register.ts"
Task: "Contract test POST /api/auth/login in tests/contract/test_auth_login.ts"
Task: "Contract test POST /api/auth/logout in tests/contract/test_auth_logout.ts"
Task: "Contract test POST /api/images/generate in tests/contract/test_images_generate.ts"
Task: "Contract test POST /api/images/edit in tests/contract/test_images_edit.ts"
Task: "Contract test POST /api/images/upload in tests/contract/test_images_upload.ts"

# Launch T015-T020 together (models):
Task: "User model in prisma/schema.prisma"
Task: "CreditTransaction model in prisma/schema.prisma"
Task: "Image model in prisma/schema.prisma"
Task: "AIModel model in prisma/schema.prisma"
Task: "Article model in prisma/schema.prisma"
Task: "Session model in prisma/schema.prisma"

# Launch T021-T026 together (services):
Task: "UserService with CRUD operations in lib/services/user-service.ts"
Task: "CreditService with transaction operations in lib/services/credit-service.ts"
Task: "ImageService for image management in lib/services/image-service.ts"
Task: "AuthService for authentication in lib/services/auth-service.ts"
Task: "AIService for AI model integration in lib/services/ai-service.ts"
Task: "ArticleService for content management in lib/services/article-service.ts"
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

- [x] All contracts have corresponding tests
- [x] All entities have model tasks
- [x] All tests come before implementation
- [x] Parallel tasks truly independent
- [x] Each task specifies exact file path
- [x] No task modifies same file as another [P] task