# Backend (Laravel) – Structure & Notes

This doc describes the backend structure, key files, and API conventions.

## Tech

- Laravel 13.x, PHP 8.3
- Sanctum SPA auth (`/sanctum/csrf-cookie` + session cookies)

## Folder structure (important parts)

- `backend/app/Modules/*` – Domain modules (Room, Guest, Reservation, Stay, Billing, Shared)
- `backend/routes/api.php` – Public + API v1 routes
- `backend/bootstrap/app.php` – Laravel 13 bootstrap; API middleware + route middleware aliases
- `backend/app/Http/Middleware/EnsureRole.php` – RBAC middleware
- `backend/app/Http/Controllers/Api/*` – Non-domain API controllers (Settings, Newsletter, Support)
- `backend/app/Models/*` – Eloquent models (User + settings/newsletter/support models)

## Auth

Routes:
- `POST /api/v1/login`
- `POST /api/v1/logout` (middleware `auth:sanctum`)
- `GET /api/v1/user` (middleware `auth:sanctum`) returns `{id,name,email,role}`

Notes:
- SPA must call `GET /sanctum/csrf-cookie` before login requests.
- In dev, admin-app uses Vite proxy to avoid cross-site cookie problems (CSRF 419).

## RBAC (roles)

Implementation:
- Column: `users.role` (string, default `admin`)
- Middleware: `role:admin,help_desk,...`
- Alias registration: `backend/bootstrap/app.php`

Current protected endpoints:
- Settings: admin-only
- Newsletter subscribers: admin + help_desk
- Support inbox: admin + help_desk

Recommended roles (project intent):
- `admin`, `manager`, `assistant_manager`, `help_desk`

## Settings (site settings)

Storage:
- Table: `settings`
- Key: `site`
- Value: JSON array

Routes (admin-only):
- `GET /api/v1/settings/site`
- `PUT /api/v1/settings/site`

Fields (current):
- Brand/SEO: `name`, `title`, `description`, `tagline`, `seo_keywords`, `logo_url`, `favicon_url`
- Owner: `owner_name`, `owner_email`, `owner_phone`
- Support: `support_email`, `support_phone`, `support_hours`, `support_url`
- Newsletter: `newsletter_enabled`, `newsletter_from_name`, `newsletter_from_email`, `newsletter_reply_to_email`, `newsletter_footer_text`, `newsletter_manage_url`

## Newsletter subscribers

Storage:
- Table: `newsletter_subscribers` (`email`, timestamps)

Routes:
- Public email collection:
  - `POST /api/v1/newsletter/subscribe` body: `{ email }`
- Admin list (admin/help_desk):
  - `GET /api/v1/newsletter/subscribers?q=...&page=1&per_page=10`

## Support inbox + message records

Storage:
- `support_conversations` (subject, status, customer, last_message_at)
- `support_messages` (direction in/out, subject/body, sent/received timestamps, provider tracking fields)

Routes (admin/help_desk):
- `GET /api/v1/support/conversations`
- `POST /api/v1/support/conversations` (manual create “incoming”)
- `GET /api/v1/support/conversations/{id}`
- `PATCH /api/v1/support/conversations/{id}/status`
- `POST /api/v1/support/conversations/{id}/reply` (logs outgoing; real sending later)

Important:
- Outgoing emails are not actually sent yet; they are recorded with `provider=manual`.
- Inbound replies are not auto-ingested yet (webhook/IMAP integration pending).

## Pagination convention

Newer endpoints use:
- `page` (Laravel paginator)
- `per_page` (clamped 1–100)
- Response returns Laravel paginator JSON (`data`, `meta`, `links`).

## Recommended next backend steps

1. Add user management endpoints (admin-only): list/create/update role/disable.
2. Apply `auth:sanctum` + `role:*` to the rest of domain routes.
3. Add real support email sending + inbound capture.
4. Add newsletter campaigns + unsubscribe flow.

