# Tasks: Admin Permissions and UI Optimization

**Input**: Design documents from `/specs/002-admin-permissions-ui-optimization/`
**Prerequisites**: plan.md (required), research.md, data-model.md, contracts/

## Execution Flow (main)
```
1. Load plan.md from feature directory
   �?If not found: ERROR "No implementation plan found"
   �?Extract: tech stack, libraries, structure
2. Load optional design documents:
   �?data-model.md: Extract entities �?model tasks
   �?contracts/: Each file �?contract test task
   �?research.md: Extract decisions �?setup tasks
3. Generate tasks by category:
   �?Setup: project init, dependencies, linting
   �?Tests: contract tests, integration tests
   �?Core: models, services, CLI commands
   �?Integration: DB, middleware, logging
   �?Polish: unit tests, performance, docs
4. Apply task rules:
   �?Different files = mark [P] for parallel
   �?Same file = sequential (no [P])
   �?Tests before implementation (TDD)
5. Number tasks sequentially (T001, T002...)
6. Generate dependency graph
7. Create parallel execution examples
8. Validate task completeness:
   �?All contracts have tests?
   �?All entities have models?
   �?All endpoints implemented?
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
- [X] T002 Initialize Next.js project with TypeScript, Prisma ORM, PostgreSQL dependencies
- [X] T003 [P] Configure linting (ESLint) and formatting (Prettier) tools

## Phase 3.2: Tests First (TDD) ⚠️ MUST COMPLETE BEFORE 3.3
**CRITICAL: These tests MUST be written and MUST FAIL before ANY implementation**
- [X] T004 [P] Contract test for roles endpoints in tests/contract/test_roles.ts
- [X] T005 [P] Contract test for permissions endpoints in tests/contract/test_permissions.ts
- [X] T006 [P] Contract test for user management endpoints in tests/contract/test_users.ts
- [X] T007 [P] Contract test for resource locking endpoints in tests/contract/test_resource_locking.ts
- [X] T008 [P] Contract test for personalization endpoints in tests/contract/test_personalization.ts
- [X] T009 [P] Contract test for audit logging endpoints in tests/contract/test_audit.ts
- [X] T010 [P] Integration test role-based access control in tests/integration/test_rbac.ts
- [X] T011 [P] Integration test user permission assignment in tests/integration/test_permission_assignment.ts
- [X] T012 [P] Integration test resource locking mechanism in tests/integration/test_resource_locking.ts
- [X] T013 [P] Integration test UI personalization flow in tests/integration/test_personalization.ts

## Phase 3.3: Core Implementation (ONLY after tests are failing)
- [X] T014 [P] AdminUser model with Prisma schema in src/lib/db.ts
- [X] T015 [P] Role model with Prisma schema in src/lib/db.ts
- [X] T016 [P] Permission model with Prisma schema in src/lib/db.ts
- [X] T017 [P] AuditLog model with Prisma schema in src/lib/db.ts
- [X] T018 [P] ResourceLock model with Prisma schema in src/lib/db.ts
- [X] T019 [P] UserPersonalization model with Prisma schema in src/lib/db.ts
- [X] T020 [P] Permissions service with role-based access in src/lib/permissions.ts
- [X] T021 [P] Personalization service with UI preferences in src/lib/personalization.ts
- [X] T022 [P] Resource locking service in src/lib/resource-locking.ts
- [X] T023 [P] Admin user management service with role assignment in src/lib/admin-users.ts
- [X] T024 [P] Audit logging service with comprehensive logging in src/lib/audit-logging.ts
- [X] T025 POST /api/admin/roles endpoint in src/app/api/admin/roles/route.ts
- [X] T026 GET /api/admin/roles endpoint in src/app/api/admin/roles/route.ts
- [X] T027 PUT /api/admin/roles/[roleId] endpoint in src/app/api/admin/roles/[roleId]/route.ts
- [X] T028 POST /api/admin/users/[userId]/roles endpoint in src/app/api/admin/users/[userId]/roles/route.ts
- [X] T029 GET /api/admin/users/[userId]/permissions endpoint in src/app/api/admin/users/[userId]/permissions/route.ts
- [X] T030 GET /api/admin/resources/[resourceType]/[resourceId]/lock endpoint in src/app/api/admin/resources/[resourceType]/[resourceId]/lock/route.ts
- [X] T031 POST /api/admin/resources/[resourceType]/[resourceId]/lock endpoint in src/app/api/admin/resources/[resourceType]/[resourceId]/lock/route.ts
- [X] T032 DELETE /api/admin/resources/[resourceType]/[resourceId]/lock endpoint in src/app/api/admin/resources/[resourceType]/[resourceId]/lock/route.ts
- [X] T033 GET /api/admin/users/[userId]/personalization endpoint in src/app/api/admin/users/[userId]/personalization/route.ts
- [X] T034 PUT /api/admin/users/[userId]/personalization endpoint in src/app/api/admin/users/[userId]/personalization/route.ts
- [X] T035 POST /api/admin/audit-logs endpoint in src/app/api/admin/audit-logs/route.ts
- [X] T036 GET /api/admin/audit-logs endpoint in src/app/api/admin/audit-logs/route.ts

## Phase 3.4: Integration
- [X] T037 Connect models to database with Prisma in src/lib/db.ts
- [X] T038 Implement admin authentication middleware with JWT in src/middleware.ts
- [X] T039 Implement permission checking middleware in src/middleware.ts
- [X] T040 Implement resource locking mechanism in src/lib/resource-locking.ts
- [X] T041 Setup comprehensive audit logging in src/lib/audit-logging.ts
- [X] T042 Implement role-based access control checks in src/lib/permissions.ts
- [X] T043 Implement UI personalization service in src/lib/personalization.ts
- [X] T044 Add input validation and sanitization in src/lib/validations.ts
- [X] T045 Implement security measures for admin endpoints in src/middleware.ts

## Phase 3.5: Polish
- [X] T046 [P] Unit tests for permissions service in tests/unit/test_permissions.py
- [X] T047 [P] Unit tests for personalization service in tests/unit/test_personalization.py
- [X] T048 [P] Unit tests for resource locking service in tests/unit/test_resource_locking.py
- [X] T049 [P] Unit tests for audit logging service in tests/unit/test_audit_logging.py
- [X] T050 Performance tests for admin interface with 1-2s page load targets
- [X] T051 [P] Update docs/api.md with all endpoints and usage
- [X] T052 Remove code duplication and refactor common utilities
- [X] T053 Run manual-testing.md following quickstart guide scenarios

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
- Tests (T004-T013) before implementation (T014-T036)
- T014-T019 (models) before T020-T024 (services)
- T020-T024 (services) before T025-T036 (controllers/endpoints)
- T037 (database connection) blocks several integration tasks
- T038 (auth middleware) blocks protected endpoints
- Implementation before polish (T046-T053)

## Parallel Example
````
# Launch T014-T019 together:
Task: "AdminUser model with Prisma schema in src/lib/db.ts"
Task: "Role model with Prisma schema in src/lib/db.ts" 
Task: "Permission model with Prisma schema in src/lib/db.ts"
Task: "AuditLog model with Prisma schema in src/lib/db.ts"
Task: "ResourceLock model with Prisma schema in src/lib/db.ts"
Task: "UserPersonalization model with Prisma schema in src/lib/db.ts"
````

## Notes
- [P] tasks = different files, no dependencies
- Verify tests fail before implementing
- Commit after each task
- Avoid: vague tasks, same file conflicts

## Task Generation Rules
*Applied during main() execution*

1. **From Contracts**:
   - Each contract file �?contract test task [P]
   - Each endpoint �?implementation task
   
2. **From Data Model**:
   - Each entity �?model creation task [P]
   - Relationships �?service layer tasks
   
3. **From User Stories**:
   - Each story �?integration test [P]
   - Quickstart scenarios �?validation tasks

4. **Ordering**:
   - Setup �?Tests �?Models �?Services �?Endpoints �?Polish
   - Dependencies block parallel execution

## Validation Checklist
*GATE: Checked by main() before returning*

- [X] All contracts have corresponding tests
- [X] All entities have model tasks
- [X] All tests come before implementation
- [X] Parallel tasks truly independent
- [X] Each task specifies exact file path
- [X] No task modifies same file as another [P] task
