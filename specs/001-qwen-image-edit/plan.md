
# Implementation Plan: AI Image Generation and Editing Website

**Branch**: `001-qwen-image-edit` | **Date**: 2025-10-03 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `E:\project\oliyo.com\specs\001-qwen-image-edit\spec.md`

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
A Next.js-based web application that allows users to generate and edit images using AI models (qwen-image-edit and gemini-flash-image) with a credit-based system. The application features user authentication, image upload and generation capabilities, a credit management system, admin dashboard for user and model management, and article publishing functionality, all built with TypeScript following constitutional principles for security, performance, and test-driven development.

## Technical Context
**Language/Version**: TypeScript 5+, Next.js 14+, Node.js 18+ (as per constitution)  
**Primary Dependencies**: Next.js, React 18+, TypeScript, Vercel for deployment  
**Storage**: To be determined based on project requirements (likely PostgreSQL with Prisma ORM as per constitution)
**Testing**: Jest and React Testing Library for component testing, Cypress or Playwright for e2e tests (as per constitution)  
**Target Platform**: Web application (as specified in feature spec)
**Project Type**: Web application (frontend + backend in single Next.js project)  
**Performance Goals**: Must meet Core Web Vitals thresholds (90 LCP, 90 FID, 90 CLS) with API response times under 2s for 95% of requests  
**Constraints**: 95% uptime target, image generation within 60s for 95% of requests, support for 100+ concurrent users  
**Scale/Scope**: Support for 100+ concurrent users, image file sizes up to 50MB, credit-based usage system

## Constitution Check
*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- [x] **Modern Full-Stack Architecture**: Using Next.js framework for both frontend and backend with unified TypeScript codebase as required
- [x] **Component-First Development**: UI elements will be developed as reusable React components with defined props interfaces
- [x] **Test-Driven Development**: All features will require unit tests before implementation with 80%+ coverage as required
- [x] **Performance Optimization**: All pages will meet Core Web Vitals thresholds and use Next.js Image optimization
- [x] **Security-First Approach**: Server-side validation, authentication/authorization, environment variables for sensitive config, CSP for XSS prevention
- [x] **Technology Stack Compliance**: Using Next.js 14+, React 18+, Node.js 18+, TypeScript 5+ as required
- [x] **Deployment**: Deploying to Vercel as specified in both constitution and feature spec

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
# Next.js Web application structure
pages/
├── api/
│   ├── auth/
│   ├── users/
│   ├── images/
│   ├── credits/
│   └── admin/
├── auth/
├── dashboard/
├── editor/
├── gallery/
├── admin/
└── _app.js
│   └── _document.js

components/
├── ui/
├── auth/
├── image-editor/
├── gallery/
├── admin/
└── common/

public/
├── images/
├── uploads/
└── icons/

styles/
├── globals.css
└── components.css

lib/
├── db/
├── auth/
├── ai/
├── utils/
└── types/

tests/
├── unit/
├── integration/
├── contract/
└── e2e/
```

**Structure Decision**: Web application using Next.js standard structure with pages directory for routing, components for reusable UI elements, lib for utilities and services, public for static assets, and tests for all testing types as required by the constitution.

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
| [e.g., 4th project] | [current need] | [why 3 projects insufficient] |
| [e.g., Repository pattern] | [specific problem] | [why direct DB access insufficient] |


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
- [ ] Complexity deviations documented

---
*Based on oliyo.com Constitution v1.0.0 - See `.specify/memory/constitution.md`*
