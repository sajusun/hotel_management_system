# Guest-Facing Next.js Frontend Application

This plan details the implementation of a new user-facing Next.js frontend website (`frontend-app/`) for the Hotel Management System. It will connect to the Laravel backend using new public API routes to allow guests to check room availability, book rooms, submit support/contact tickets, and subscribe to newsletters.

## User Review Required

> [!IMPORTANT]
> **API Accessibility**: To allow public guests to search availability and book rooms directly from the website, we will add public-facing endpoints to the Laravel backend. These endpoints will not require authentication, but will validate inputs strictly to ensure no database integrity issues (e.g. overlapping reservations).

> [!WARNING]
> **Folder Rename**: We will rename the directory `fronend-app/` to `frontend-app/` to resolve the spelling typo and align it with standard naming conventions.

---

## Open Questions

> [!IMPORTANT]
> **Styling Framework**:
> We can build the frontend styling in two ways. Please let us know your preference:
> 1. **(Recommended) Tailwind CSS v4**: This matches the `@tailwindcss/vite` setup in `admin-app`, allowing shared design variables, color palettes, and component aesthetics.
> 2. **Vanilla CSS Modules**: Standard CSS modules (`page.module.css`, etc.) standard to Next.js.
>
> *By default, our plan recommends initializing with Tailwind CSS v4 to create a premium, cohesive, and modern look.*

---

## Proposed Changes

### Component 1: Backend (Laravel APIs)

Expose stateless public routes and validation to support anonymous guest requests.

#### [NEW] [StorePublicReservationRequest.php](file:///c:/Users/sakhawat/Herd/HMS/backend/app/Modules/Reservation/Http/Requests/StorePublicReservationRequest.php)
- Implement a request validator for public bookings containing both Guest data and Reservation parameters:
  - Guest fields: `first_name`, `last_name`, `email`, `phone`.
  - Reservation fields: `room_id`, `check_in_date`, `check_out_date`, `guests_count`, `special_requests`.

#### [MODIFY] [ReservationController.php](file:///c:/Users/sakhawat/Herd/HMS/backend/app/Modules/Reservation/Http/Controllers/ReservationController.php)
- Add a `storePublic` method that:
  1. Finds or creates the guest record using the provided `email`, `first_name`, `last_name`, and `phone`.
  2. Submits the booking request utilizing the existing `ReservationService::createReservation` logic.

#### [MODIFY] [api.php](file:///c:/Users/sakhawat/Herd/HMS/backend/routes/api.php)
- Define the following public routes (outside `auth:sanctum` group):
  - `GET /api/v1/public/room-types` mapping to `RoomController@roomTypes`.
  - `GET /api/v1/public/availability` mapping to `ReservationController@searchAvailability`.
  - `POST /api/v1/public/reservations` mapping to `ReservationController@storePublic`.
  - `POST /api/v1/public/support/contact` mapping to `SupportController@createConversation`.

---

### Component 2: Frontend Guest App (Next.js)

We will initialize and construct a modern Next.js project under `frontend-app/`.

#### [DELETE] [fronend-app](file:///c:/Users/sakhawat/Herd/HMS/fronend-app)
- Delete the placeholder folder with the spelling error.

#### [NEW] [frontend-app/](file:///c:/Users/sakhawat/Herd/HMS/frontend-app)
- Initialize using:
  `npx -y create-next-app@latest ./frontend-app --ts --eslint --app --src-dir --import-alias "@/*" --use-npm --disable-git --yes`

- **Core configuration and client**:
  - Configure `axios` or native fetch client in `src/lib/api.ts` pointing to the backend host (e.g. `http://localhost:8000`).
  - Create standard shared layouts: Navbar, Footer, and responsive container wrappers with custom modern Google Fonts (e.g., Outfit / Inter).

- **Implementation of Guest Pages**:
  - `src/app/page.tsx` (Homepage): High-fidelity hero section, hotel characteristics, visual grid showcasing featured room categories, guest testimonials, and inline newsletter subscription form.
  - `src/app/rooms/page.tsx` (Rooms Listing): Display room types fetched from `/api/v1/public/room-types`, showing amenities, pricing, capacity, and a quick-action "Book Now" link.
  - `src/app/booking/page.tsx` (Interactive Booking Flow):
    - Date availability check using the guest's check-in/check-out dates.
    - Room selection from matching available rooms list.
    - Checkout form requesting Guest details (`first_name`, `last_name`, `email`, `phone`, `special_requests`).
    - Success/confirmation feedback presenting booking references.
  - `src/app/contact/page.tsx` (Contact & Support):
    - Simple public contact ticket form submitting to `/api/v1/public/support/contact`.
    - Toast notifications and state validation for submission.

---

## Verification Plan

### Automated Tests
- Run PHPUnit tests on the backend to ensure public route mappings do not break auth routes.
- Execute frontend compilation checks (`npm run build` or `npm run lint`) inside `frontend-app`.

### Manual Verification
1. Run `npm run dev` in `frontend-app` and open the site in a browser.
2. Search for room availability on the Booking page.
3. Complete the guest details booking flow and confirm a reservation is successfully created in the backend database.
4. Open the Contact page, fill in the support form, and verify that a support ticket is created in the admin panel dashboard.
