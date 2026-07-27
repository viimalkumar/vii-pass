# Tasks: Mobile Single Logo

**Input**: Design documents from `/specs/023-mobile-single-logo/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/mobile-logo-ui.md, quickstart.md

**Tests**: Per Constitution, do not add unit-test tasks. Validate with manual responsive/accessibility regression checks from quickstart.

**Organization**: Tasks are grouped by user story so each story can be implemented and validated independently.

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Prepare implementation context and shared UI surface inventory

- [X] T001 Confirm in-scope branding surfaces and invariants in specs/023-mobile-single-logo/contracts/mobile-logo-ui.md
- [X] T002 Verify target assets and fallback assumptions in specs/023-mobile-single-logo/research.md

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Shared UI primitives required before user-story work

**⚠️ CRITICAL**: No user story implementation starts before this phase completes

- [X] T003 Create shared responsive brand component in frontend/src/components/BrandLogo.tsx
- [X] T004 [P] Add shared responsive logo visibility/sizing utilities in frontend/src/styles/tokens.css
- [X] T005 Wire shared brand component usage contract in specs/023-mobile-single-logo/contracts/mobile-logo-ui.md

**Checkpoint**: Foundation ready - user story implementation can begin

---

## Phase 3: User Story 1 - Mobile Logo Simplification (Priority: P1) 🎯 MVP

**Goal**: Mobile surfaces show only the single-symbol logo while preserving behavior

**Independent Test**: At mobile width (for example 320px), login/register/reset/home surfaces show only the single-symbol logo, and header brand interactions still work.

### Implementation for User Story 1

- [X] T006 [P] [US1] Replace login brand markup with shared responsive logo component in frontend/src/pages/LoginPage.tsx
- [X] T007 [P] [US1] Replace register brand markup with shared responsive logo component in frontend/src/pages/RegisterPage.tsx
- [X] T008 [P] [US1] Replace reset-password brand markup with shared responsive logo component in frontend/src/pages/ResetPasswordPage.tsx
- [X] T009 [US1] Replace home header brand markup with responsive variant behavior while preserving click/tap behavior in frontend/src/components/Layout.tsx
- [X] T010 [US1] Tune mobile spacing and clamp rules to prevent overlap/collision in frontend/src/styles/tokens.css
- [X] T011 [US1] Run mobile validation pass and record observed outcomes in specs/023-mobile-single-logo/quickstart.md

**Checkpoint**: User Story 1 is independently functional and testable on mobile

---

## Phase 4: User Story 2 - Preserve Desktop Branding (Priority: P2)

**Goal**: Keep existing full-logo presentation unchanged on non-mobile widths

**Independent Test**: At tablet/desktop widths (768px and 1280px), all in-scope surfaces still present the full logo with no layout regressions.

### Implementation for User Story 2

- [X] T012 [US2] Enforce desktop/full-logo visibility rules across breakpoint boundary in frontend/src/styles/tokens.css
- [X] T013 [P] [US2] Preserve auth-surface non-mobile logo sizing behavior in frontend/src/pages/LoginPage.tsx
- [X] T014 [P] [US2] Preserve auth-surface non-mobile logo sizing behavior in frontend/src/pages/RegisterPage.tsx
- [X] T015 [US2] Preserve header non-mobile logo layout/no-wrap behavior in frontend/src/components/Layout.tsx
- [X] T016 [US2] Execute desktop/tablet regression verification and document outcomes in specs/023-mobile-single-logo/quickstart.md

**Checkpoint**: User Story 2 is independently functional and testable on non-mobile viewports

---

## Phase 5: User Story 3 - Consistent Mobile Experience Across Surfaces (Priority: P3)

**Goal**: Ensure consistent logo behavior, accessibility semantics, and fallback treatment across all in-scope surfaces

**Independent Test**: Crossing the mobile breakpoint and switching roles keeps consistent logo rules on every in-scope surface with equivalent accessible naming and fallback behavior.

### Implementation for User Story 3

- [X] T017 [US3] Centralize brand alt/fallback semantics in frontend/src/components/BrandLogo.tsx
- [X] T018 [P] [US3] Apply consistent auth-surface accessibility/fallback rendering in frontend/src/pages/ResetPasswordPage.tsx
- [X] T019 [P] [US3] Apply consistent header accessibility/fallback rendering in frontend/src/components/Layout.tsx
- [X] T020 [US3] Run boundary/role/accessibility/fallback verification and capture results in specs/023-mobile-single-logo/quickstart.md

**Checkpoint**: All user stories are independently functional and consistent

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Final cleanup and quality gates

- [X] T021 [P] Remove obsolete logo-specific styles/selectors made redundant by shared component usage in frontend/src/styles/tokens.css
- [X] T022 Run quality gates and resolve any resulting issues in frontend/src/components/Layout.tsx

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: Start immediately
- **Phase 2 (Foundational)**: Depends on Phase 1; blocks all user stories
- **Phase 3 (US1)**: Depends on Phase 2; MVP slice
- **Phase 4 (US2)**: Depends on Phase 2; may be done after US1 for safer rollout
- **Phase 5 (US3)**: Depends on Phase 2 and should run after US1/US2 edits stabilize
- **Phase 6 (Polish)**: Depends on completion of desired user stories

### User Story Dependencies

- **US1 (P1)**: No dependency on other stories after foundational phase
- **US2 (P2)**: No hard dependency on US1, but coordination recommended due to shared files
- **US3 (P3)**: Depends on shared surfaces being updated; execute after US1/US2 implementation to normalize consistency

### Within Each User Story

- Shared component/rules before per-surface adjustments
- Per-surface updates before verification tasks
- Verification before moving to polish

### Parallel Opportunities

- Setup documentation checks can run in parallel: T001, T002
- Foundational CSS work can run in parallel with component scaffold review: T004 with T003
- US1 auth-page markup tasks can run in parallel: T006, T007, T008
- US2 auth-surface preservation tasks can run in parallel: T013, T014
- US3 consistency tasks can run in parallel where files differ: T018, T019
- Polish cleanup can run in parallel with final gate prep: T021 with early T022 prep

---

## Parallel Example: User Story 1

```bash
# Run auth surface swaps in parallel after foundational tasks:
Task T006 in frontend/src/pages/LoginPage.tsx
Task T007 in frontend/src/pages/RegisterPage.tsx
Task T008 in frontend/src/pages/ResetPasswordPage.tsx
```

## Parallel Example: User Story 2

```bash
# Run non-mobile auth preservation tasks in parallel:
Task T013 in frontend/src/pages/LoginPage.tsx
Task T014 in frontend/src/pages/RegisterPage.tsx
```

## Parallel Example: User Story 3

```bash
# Run consistency alignment in parallel on different surfaces:
Task T018 in frontend/src/pages/ResetPasswordPage.tsx
Task T019 in frontend/src/components/Layout.tsx
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1 (Setup)
2. Complete Phase 2 (Foundational)
3. Complete Phase 3 (US1)
4. Validate mobile-only acceptance criteria
5. Demo/ship MVP if acceptable

### Incremental Delivery

1. Deliver US1 mobile simplification
2. Deliver US2 desktop-preservation safeguards
3. Deliver US3 cross-surface consistency and fallback/accessibility normalization
4. Complete polish and quality gates

### Parallel Team Strategy

1. One developer handles shared foundation (T003-T005)
2. Two developers split auth surfaces and header surfaces in US1/US2
3. One developer executes consistency/fallback normalization and verification

---

## Notes

- [P] tasks are parallelizable by file separation and dependency ordering
- [US#] labels map each task to a specific user story for traceability
- Keep implementation frontend-only; backend/ and shared/ remain unchanged
- Use quickstart verification steps as completion evidence for story checkpoints
