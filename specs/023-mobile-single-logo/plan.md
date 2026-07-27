# Implementation Plan: Mobile Single Logo

**Branch**: `topic/vii-1027-mobile-logo-title` | **Date**: 2026-07-27 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `/specs/023-mobile-single-logo/spec.md`

## Summary

Implement mobile-specific branding simplification: on mobile widths, surfaces that
currently display the full wordmark logo must display only the single-symbol logo; on
non-mobile widths, the existing full-logo presentation remains unchanged. The change is
frontend-only and follows existing Bootstrap breakpoint conventions and design-token
patterns, with explicit accessibility and interaction-preservation constraints.

**Technical approach**: adjust in-scope branding surfaces in React markup/styling to
render variant-specific logo presentation tied to existing responsive breakpoints
(mobile below `sm`, non-mobile at/above `sm`). Preserve current navbar/auth behavior,
keep meaningful accessible naming, and verify no overflow regressions at 320/768/1280.

## Technical Context

**Language/Version**: TypeScript 5.x (React 18 + Vite)

**Primary Dependencies**: React, react-router-dom, Bootstrap 5.3 (CSS), existing design tokens in `frontend/src/styles/tokens.css`

**Storage**: N/A (no database/data model changes)

**Testing**: Manual responsive/a11y regression verification per `quickstart.md`; no new unit tests (per constitution)

**Target Platform**: Evergreen desktop/mobile browsers

**Project Type**: Web application (frontend-only)

**Performance Goals**: No measurable UX regression from branding changes; no added page-level loading states; no new horizontal overflow at 320px/768px/1280px

**Constraints**: Zero new dependencies; no backend/shared/API/auth/session/encryption changes; preserve existing brand interactions; maintain WCAG-oriented semantics

**Scale/Scope**: Small UI-only slice across in-scope branding surfaces (auth pages + home header) and shared style tokens

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Assessment | Status |
|-----------|------------|--------|
| I. Code Quality | Small, focused frontend edits using existing component/style structure; no dead-code expansion expected. | PASS |
| II. Testing Standards | No unit-test expansion; manual validation focused on affected user flows and regressions. | PASS |
| III. UX Consistency | Change is explicitly responsive/mobile-first while preserving desktop behavior and consistent branding semantics. | PASS |
| IV. Performance Requirements | No runtime/service-path work; scope has lightweight UI swaps only. Budgets remain unchanged and measurable by regression checks. | PASS |
| V. Scalability & Maintainability | No new abstractions or dependencies; uses established breakpoint/token patterns for maintainability. | PASS |
| Security gate | No secret handling/auth/data-path changes. | PASS |

**Result: PASS - no constitutional violations.**

*Post-Phase-1 re-check (after research/data-model/contracts/quickstart): PASS - design
remains frontend-only, responsive, and accessibility-conscious with no architectural
deviation.*

## Project Structure

### Documentation (this feature)

```text
specs/023-mobile-single-logo/
├── plan.md                    # This file
├── research.md                # Phase 0 output
├── data-model.md              # Phase 1 output
├── quickstart.md              # Phase 1 output
├── contracts/
│   └── mobile-logo-ui.md      # UI behavior contract
└── tasks.md                   # Phase 2 output (/speckit.tasks)
```

### Source Code (repository root)

```text
frontend/
├── src/
│   ├── components/
│   │   └── Layout.tsx                 # Header brand rendering/interaction surface
│   ├── pages/
│   │   ├── LoginPage.tsx              # Auth brand surface
│   │   ├── RegisterPage.tsx           # Auth brand surface
│   │   └── ResetPasswordPage.tsx      # Auth brand surface
│   └── styles/
│       └── tokens.css                 # Responsive logo presentation rules
└── public/
    └── logo/                          # Existing logo assets reused

backend/   # UNTOUCHED
shared/    # UNTOUCHED
```

**Structure Decision**: Reuse the existing frontend component and token-style
architecture. No new packages/workspaces or backend/shared contracts are introduced.

## Complexity Tracking

> No constitutional violations - table intentionally empty.
