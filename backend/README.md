# Hotel Management System (HMS)

A robust and modular Hotel Management System built with **Laravel 13** and **PHP 8.3**. This project exposes a complete RESTful API to manage the core operations of a hotel, including room inventory, guest profiles, reservations, stays, and billing.

## 🏗 Architecture

The application follows a **Modular / Domain-Driven** architecture pattern. Instead of grouping files purely by technical concern (e.g., all controllers together, all models together), the codebase is organized by business domains located in `app/Modules`.

### Core Modules

*   **🏨 Room**: Manages room inventory, room types, and real-time room status updates.
*   **👤 Guest**: Handles guest profiling, contact information, and guest history.
*   **📅 Reservation**: The booking engine. Handles availability searches, creating reservations, and cancellations.
*   **🛎️ Stay**: Manages the active lifecycle of a guest's visit, including check-in and check-out processes.
*   **💳 Billing**: Manages financial transactions, issues invoices, adds service charges, and records payments.
*   **🧰 Shared**: Contains shared infrastructure, value objects, and common utilities used across multiple modules.

## 🚀 Tech Stack

*   **Framework**: [Laravel 13.x](https://laravel.com/)
*   **Language**: PHP 8.3+
*   **Frontend Tools**: Vite & TailwindCSS v4 (Prepared for UI integration)
*   **Database**: Supports SQLite (default for development), MySQL, PostgreSQL

## 📦 Installation & Setup

1. **Clone the repository:**
   ```bash
   git clone <your-repository-url> HMS
   cd HMS
   ```

2. **Run the automated setup script:**
   The project includes a convenient setup script defined in `composer.json` which handles dependencies, environment setup, database migration, and frontend building.
   ```bash
   composer setup
   ```

   *(Alternatively, run the steps manually:)*
   ```bash
   composer install
   cp .env.example .env
   php artisan key:generate
   php artisan migrate --force
   npm install
   npm run build
   ```

3. **Start the development servers:**
   We use `concurrently` to run the PHP server, queue listener, logs, and Vite dev server simultaneously.
   ```bash
   composer dev
   ```
   *Your API will typically be available at `http://localhost:8000`.*

## 🔌 API Endpoints (v1)

The API endpoints are grouped under the `api/v1` prefix. 

### Rooms
*   `GET /api/v1/room-types` - List available room types
*   `GET /api/v1/rooms` - List all rooms
*   `PATCH /api/v1/rooms/{room}/status` - Update the status of a specific room

### Guests
*   `GET /api/v1/guests` - List guests
*   `POST /api/v1/guests` - Create a new guest profile
*   `GET /api/v1/guests/{guest}` - Get guest details
*   `PUT/PATCH /api/v1/guests/{guest}` - Update guest profile
*   `DELETE /api/v1/guests/{guest}` - Remove a guest

### Reservations
*   `GET /api/v1/availability` - Search for available rooms
*   `GET /api/v1/reservations` - List reservations
*   `POST /api/v1/reservations` - Create a new reservation
*   `GET /api/v1/reservations/{reservation}` - Get reservation details
*   `POST /api/v1/reservations/{reservation}/cancel` - Cancel a reservation

### Stays (Check-in / Check-out)
*   `GET /api/v1/stays` - List active/past stays
*   `POST /api/v1/reservations/{reservation}/check-in` - Process a check-in for a reservation
*   `GET /api/v1/stays/{stay}` - Get stay details
*   `POST /api/v1/stays/{stay}/check-out` - Process a check-out

### Billing
*   `GET /api/v1/invoices/{invoice}` - Get invoice details
*   `POST /api/v1/invoices/{invoice}/services` - Add a service charge to an invoice
*   `POST /api/v1/invoices/{invoice}/issue` - Issue the final invoice
*   `POST /api/v1/invoices/{invoice}/payments` - Record a payment against an invoice

## 🧪 Testing

To run the test suite:

```bash
composer test
```
This will clear configuration caches and execute the PHPUnit/Pest test suite.

## 📄 License

This project is open-sourced software licensed under the [MIT license](https://opensource.org/licenses/MIT).
