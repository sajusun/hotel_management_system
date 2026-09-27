# HMS – Plan & Progress

Last updated: 2026-05-19

This file tracks what is implemented, what is partially done, and what is pending. It is meant for future developers (and AI assistants) to quickly understand the project state.

## Repository layout

- `backend/` – Laravel 13 REST API + Sanctum SPA auth + HMS domain modules
- `admin-app/` – React + TS + Vite admin dashboard (SPA)
- `frontend-app/` – User-facing guest Next.js application (SPA/SSG)

## Core decisions (current)

- Auth: Laravel Sanctum SPA (session cookie + CSRF cookie) for the admin SPA.
- Dev CORS/CSRF: admin-app uses Vite dev proxy so requests are same-origin to avoid 419 issues.
- RBAC: simple `users.role` (string) enforced by backend middleware `role:*`.
- Settings: stored in DB as JSON in `settings` table (key `site`).
- Newsletter: only subscriber email collection + admin list (no campaigns yet).
- Support: inbox + conversation/message record-keeping; email sending/inbound capture will be added later.

## Backend status

### Implemented

- Domain APIs (v1):
  - Rooms, Guests, Reservations, Stays, Billing (existing modules)
  - Rooms pagination (`per_page`, `page`) added
  - Public guest-facing endpoints:
    - `GET /api/v1/public/room-types` (all room types)
    - `GET /api/v1/public/availability` (search available rooms)
    - `POST /api/v1/public/reservations` (create guest booking)
    - `POST /api/v1/public/support/contact` (submit help tickets)
- Auth endpoints:
  - `POST /api/v1/login`
  - `POST /api/v1/logout` (auth:sanctum)
  - `GET /api/v1/user` (auth:sanctum) returns `id,name,email,role`
- RBAC:
  - `users.role` migration
  - `role` route middleware alias + `EnsureRole` middleware
- Settings:
  - `GET /api/v1/settings/site` (admin-only)
  - `PUT /api/v1/settings/site` (admin-only)
  - Fields include brand/SEO + owner + support center + newsletter config
- Newsletter:
  - `POST /api/v1/newsletter/subscribe` (public)
  - `GET /api/v1/newsletter/subscribers` (admin/help_desk)
- Support:
  - Conversations list/show, status update, reply logging, manual create (admin/help_desk)
  - Database notifications system with dedicated migration and custom triggers for reservations, support tickets, and newsletter subscribers.
  - Notifications API (`GET /api/v1/notifications`, `POST /api/v1/notifications/{id}/read`, and `POST /api/v1/notifications/read-all`).
  - Support reply email sending with dynamic site settings envelope configuration and responsive HTML blade template.

### Partially implemented

- Newsletter only stores subscribers; no campaign sender or delivery tracking yet.

### Pending

- Full RBAC matrix across all domain routes (currently only Settings/Newsletter/Support are role-protected).
- User management (create users, set role, deactivate, etc.).
- Email provider integration:
  - inbound webhook/IMAP ingestion to attach replies to conversations
- Newsletter campaigns (compose/send, opt-out, unsubscribe).

## Admin-app status

### Implemented

- Login + session refresh (`/api/v1/user`)
- Route protection (`ProtectedRoute`)
- Role guard component (`RequireRole`)
- Responsive admin layout:
  - collapse/expand sidebar (persisted in localStorage)
  - top navbar (fullscreen, notifications placeholder, profile dropdown)
  - page header strip + breadcrumb-like UI
- Modules:
  - Rooms: list + status update + pagination UI
  - Settings: site settings full-page responsive form (admin only)
  - Newsletter: subscribers list (admin/help_desk)
  - Support: inbox list + thread view + reply/status UI (admin/help_desk)
  - Notifications: stateful dropdown popover with 30s polling, unread badges, mark-as-read callbacks, and contextual navigation routing.

### Partially implemented

- None.

## Frontend-app (guest) status

### Implemented

- Type-safe backend client (`src/lib/api.ts`) connecting to Laravel public endpoints.
- High-fidelity visual layout:
  - Sticky glassmorphic Navbar and Footer.
  - Interactive newsletter subscription form with toast feedback.
  - Outfit / Geist typography and gradient accents.
- Pages:
  - Homepage (`src/app/page.tsx`): Hero section, characteristics grid, signature room type cards, and guest testimonials.
  - Rooms listing (`src/app/rooms/page.tsx`): Dynamically fetched room types with details, pricing, capacity, and check-in links.
  - Multi-step booking (`src/app/booking/page.tsx`): Availability date check, room selection card, guest information checkout form, booking summary invoice sidebar, and confirmation code screen.
  - Contact page (`src/app/contact/page.tsx`): Ticket submission form linked to support database.

## Pending (next recommended order)

1. User management (admin): CRUD users + assign role (`admin/manager/assistant_manager/help_desk`).
2. Apply RBAC to remaining modules (rooms, guests, reservations, billing).
3. Support: real email send + inbound capture.
4. Newsletter campaigns.

## How to run (local dev)

Backend:
- `cd backend`
- `composer install`
- `php artisan migrate`
- `php artisan serve`

Admin:
- `cd admin-app`
- `npm install`
- `npm run dev`

Notes:
- Admin app uses Vite proxy (`admin-app/vite.config.ts`) for `/api/*` and `/sanctum/*` to avoid CSRF 419 during dev.

