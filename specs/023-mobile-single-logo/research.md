# Research: Mobile Single Logo

**Feature**: 023-mobile-single-logo | **Date**: 2026-07-27

All Technical Context unknowns are resolved in this document. No NEEDS CLARIFICATION
markers remain.

---

## Decision 1: Mobile breakpoint behavior uses existing Bootstrap boundary

**Decision**: Use the existing Bootstrap mobile breakpoint boundary for logo switching:
mobile behavior applies below the `sm` boundary and desktop behavior applies at and
above `sm`.

**Rationale**:
- The repository already standardizes responsive behavior around Bootstrap breakpoints.
- This keeps behavior consistent with prior UI features and avoids introducing a new
  bespoke threshold.
- It directly covers the spec edge case around width transitions near the boundary.

**Alternatives considered**:
- Custom pixel threshold unrelated to Bootstrap: rejected due to inconsistency risk.
- Device detection (user-agent): rejected due to unreliability and unnecessary complexity.

## Decision 2: Keep full logo on desktop, show single-symbol logo on mobile

**Decision**: Render the single-symbol logo on mobile and preserve the current full
wordmark logo on desktop/tablet for all in-scope branding surfaces.

**Rationale**:
- This is the exact requested user outcome.
- It improves mobile density while preserving established desktop branding.
- It keeps brand recognition intact on larger viewports where horizontal space is not
  constrained.

**Alternatives considered**:
- Single-symbol logo on all viewports: rejected because the spec requires desktop
  behavior preservation.
- Full logo on all viewports with smaller sizing: rejected because the request is to
  avoid showing full logo on mobile entirely.

## Decision 3: Frontend-only implementation with no backend/shared changes

**Decision**: Implement entirely in frontend UI files and token styles; no API, schema,
route, auth, session, encryption, or shared type changes.

**Rationale**:
- The feature is purely presentational.
- It minimizes regression risk and keeps scope small.
- It satisfies constitution expectations around simplicity and maintainability.

**Alternatives considered**:
- Server-configured branding mode: rejected as unnecessary for static viewport behavior.
- Shared package changes: rejected because no cross-workspace data contract is needed.

## Decision 4: Preserve accessibility and fallback semantics

**Decision**: Keep meaningful logo alternatives and ensure mobile/desktop switching does
not remove accessible brand identity or break clickable brand behavior.

**Rationale**:
- The constitution requires WCAG-oriented accessibility and consistency.
- Existing brand interactions (for example, home brand refresh navigation behavior)
  must remain unchanged.
- Fallback behavior for image load issues remains required by the feature spec.

**Alternatives considered**:
- Decorative-only image treatment with hidden alt text: rejected because brand images
  are meaningful content.
- CSS background images for brand marks: rejected because they weaken semantic fallback
  behavior and accessible naming.
