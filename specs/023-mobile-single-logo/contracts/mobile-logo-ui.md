# UI Contract: Mobile Single Logo

**Feature**: 023-mobile-single-logo | **Date**: 2026-07-27

This feature does not expose API contracts. Its externally observable contract is UI
behavior across responsive breakpoints.

## C1 - Mobile branding variant

1. On mobile viewport widths (below the Bootstrap `sm` boundary), each in-scope brand
   surface MUST display the single-symbol logo variant.
2. On these same mobile widths, the full-wordmark logo MUST NOT be visible.
3. In-scope surfaces include:
   - Login auth card brand area
   - Register auth card brand area
   - Reset password auth card brand area
   - Home header brand area

## C2 - Non-mobile branding preservation

1. On non-mobile widths (at or above Bootstrap `sm`), the existing full-wordmark logo
   presentation MUST remain unchanged.
2. Layout behavior on tablet/desktop MUST not regress (no wrapping/collision introduced
   by the feature).

## C3 - Responsive transition correctness

1. Crossing the mobile/non-mobile boundary by resize or orientation change MUST switch
   to the correct logo variant without requiring page reload.
2. Boundary transitions MUST not create a state where both variants are visible on the
   same surface.

## C4 - Interaction invariants

1. Existing brand interactions MUST remain unchanged on all modified surfaces.
2. If a brand element is currently clickable (for example, home header brand link),
   clicking/tapping behavior MUST be identical before and after this feature.

## C5 - Accessibility and fallback

1. Brand identity semantics MUST remain present for assistive technologies.
2. If a logo image is unavailable, users MUST still receive visible/announced brand
   identity text rather than an empty or broken-only presentation.
3. Any interactive brand element MUST retain an accessible name equivalent to
   "Vii Pass".

## C6 - Scope boundaries

1. Frontend-only change.
2. No backend/, shared/, API, auth, session, or encryption changes.
3. No new dependencies.

## C7 - Shared component binding

1. In-scope surfaces MUST consume a shared frontend logo component rather than
   duplicating per-page logo markup.
2. The shared component MUST implement responsive source selection with mobile
   using the single-symbol asset (`/logo/logo.png`) and non-mobile using the
   full-wordmark asset (`/logo/full_logo.png`).
3. The shared component MUST provide a visible fallback text label (`Vii Pass`)
   when image assets are unavailable.
