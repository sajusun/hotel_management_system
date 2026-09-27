# Admin App – Structure & Notes

React + TypeScript + Vite admin dashboard for HMS.

## Tech

- React 19 + `react-router-dom`
- Axios client with cookies + XSRF support
- TailwindCSS v4

## Folder structure

- `admin-app/src/App.tsx` – Route map + module wiring
- `admin-app/src/layouts/DashboardLayout.tsx` – Main admin layout (topbar + sidebar + content)
- `admin-app/src/lib/axios.ts` – Axios instance (same-origin baseURL in dev)
- `admin-app/vite.config.ts` – Dev proxy (`/api`, `/sanctum` → backend host)

### Auth

- `admin-app/src/auth/AuthProvider.tsx` – Loads session via `GET /api/v1/user`
- `admin-app/src/auth/ProtectedRoute.tsx` – Blocks unauthenticated users
- `admin-app/src/auth/RequireRole.tsx` – UI-level role guard (backend still enforces security)
- `admin-app/src/auth/types.ts` – `AuthUser` type

## Dev proxy (important)

During development the admin app runs on `http://localhost:5173`.
To avoid CSRF 419 issues with Sanctum, we proxy:
- `/sanctum/*` → `http://backend_hms.test`
- `/api/*` → `http://backend_hms.test`

Configured in `admin-app/vite.config.ts`.

## Pages (current)

- Login:
  - `admin-app/src/pages/Login.tsx`
- Rooms:
  - `admin-app/src/pages/rooms/RoomsPage.tsx`
- Settings (site settings):
  - `admin-app/src/pages/settings/SiteSettingsPage.tsx`
- Newsletter subscribers:
  - `admin-app/src/pages/newsletter/SubscribersPage.tsx`
- Support inbox:
  - `admin-app/src/pages/support/SupportInboxPage.tsx`
  - `admin-app/src/pages/support/SupportThreadPage.tsx`

## Shared UI components

- `admin-app/src/components/Pagination.tsx` – Prev/Next pagination
- `admin-app/src/components/FormField.tsx` – Label + hint wrapper
- `admin-app/src/components/Modal.tsx` – Generic modal (for small forms, later)

## Layout behavior

`DashboardLayout` includes:
- Sidebar collapse/expand (persisted in `localStorage` key `hms.sidebar.collapsed`)
- Mobile sidebar drawer
- Topbar actions: fullscreen toggle + notifications placeholder + profile dropdown
- Content header strip with page title (derived from routes)

## Role expectations (UI)

Current guards:
- Settings: `admin` only
- Newsletter + Support: `admin` + `help_desk`

Backend middleware still controls actual access.

## Recommended next admin-app steps

1. Add “Users” module for admin: list/create/update role.
2. Add full pagination UI (page numbers) if needed; currently Prev/Next is implemented.
3. Build remaining modules (Guests, Reservations, Stays, Billing) with full-page forms + lists.
4. Add notification integration once backend emits events/notifications.

