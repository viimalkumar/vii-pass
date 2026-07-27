# Quickstart: Mobile Single Logo Verification

**Feature**: 023-mobile-single-logo

Manual verification checklist for responsive branding behavior.

## Preconditions

- Run the app locally with the normal development stack.
- Use a browser with responsive dev tools.
- Test while signed out and signed in.

## 1. Mobile auth surfaces

1. Set viewport to a mobile width (for example 320x568).
2. Open login page.
3. Verify auth brand area shows only the single-symbol logo.
4. Repeat on register and reset password pages.
5. Confirm full-wordmark logo is not visible on these surfaces.

## 2. Mobile home header

1. Sign in.
2. Keep mobile width.
3. Verify home header brand area shows only the single-symbol logo.
4. Verify brand click/tap behavior still works exactly as before.

## 3. Desktop/tablet preservation

1. Set viewport to 768px width and then 1280px width.
2. Verify all in-scope surfaces use the full-wordmark logo.
3. Confirm layout remains stable and readable.

## 4. Boundary transition

1. Resize repeatedly across the Bootstrap `sm` boundary (for example 575px to 576px).
2. Verify the rendered logo switches to the correct variant each time.
3. Verify no dual-logo overlap appears during transition.

## 5. Accessibility/fallback checks

1. Verify brand identity has equivalent accessible naming on modified surfaces.
2. Confirm interactive brand elements remain keyboard accessible where applicable.
3. Simulate image load failure and verify visible/announced fallback brand identity.

## 6. Regression sweep

1. Confirm no horizontal overflow at 320px, 768px, and 1280px.
2. Confirm admin and normal roles observe identical variant rules for the same viewport.
3. Confirm backend and shared behavior remains unchanged.

## Implementation Validation Log (2026-07-27)

- Typecheck: PASS (`npm run typecheck`)
- Lint: PASS (`npm run lint`)
- Build: PASS (`npm run build --workspaces --if-present`)
- Auth surfaces source switching: PASS
	- `/login`, `/register`, `/reset` at `320px` resolved `currentSrc` to `/logo/logo.png`
	- Same routes at `768px` and `1280px` resolved `currentSrc` to `/logo/full_logo.png`
- Home header source switching: PASS
	- At `320px` and `575px` resolved to `/logo/logo.png`
	- At `576px`, `768px`, and `1280px` resolved to `/logo/full_logo.png`
- Breakpoint boundary behavior (575 -> 576): PASS (single-symbol to full-wordmark transition without reload)
- Overflow check: PASS (`scrollWidth <= clientWidth`) at tested widths on auth and home surfaces
- Header interaction invariant: PASS (`.navbar-brand[href='/']` remained present/clickable after logo swap)
- Accessibility alt text invariant: PASS (`alt='Vii Pass'` present on rendered logo image at tested surfaces)
- Fallback implementation note: visible fallback text is implemented in `BrandLogo` via `imageUnavailable` state and is triggered by image error handling.
