# Frontend (User-side) – Structure Plan

This repo currently contains a placeholder folder named `fronend-app/` (note the spelling). The user-facing frontend is not implemented yet.

## Current status

- `fronend-app/about.txt` – placeholder note only

## Recommended structure (when implementing)

Create a real app (React/Vue/Next/etc.) under either:
- keep using `fronend-app/` (existing folder name), or
- rename to `frontend-app/` (recommended) and update references

Suggested directory layout (framework-agnostic):

- `src/`
  - `pages/` – routes (Home, Rooms, Booking, Contact, Subscribe)
  - `components/` – shared UI components
  - `lib/api.ts` – API client
  - `lib/validators.ts` – form validation
  - `styles/` – styling system

## Needed public endpoints (already available / planned)

Already available:
- `POST /api/v1/newsletter/subscribe` – collect subscriber email

Planned for user-facing support:
- A public “Contact / Support” form endpoint (already exists but currently auth-protected):
  - `POST /api/v1/support/conversations`
  - Recommendation: add a separate public route like `POST /api/v1/support/contact` with spam protection (rate limit + captcha).

## UX requirements (from project direction)

- Fully responsive for mobile/tablet/desktop
- Full-page forms where appropriate
- Lists should be paginated

