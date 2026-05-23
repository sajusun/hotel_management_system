<?php

use App\Modules\Billing\Http\Controllers\InvoiceController;
use App\Modules\Guest\Http\Controllers\GuestController;
use App\Modules\Reservation\Http\Controllers\ReservationController;
use App\Modules\Room\Http\Controllers\RoomController;
use App\Modules\Room\Http\Controllers\RoomTypeController;
use App\Modules\Stay\Http\Controllers\StayController;
use App\Modules\Auth\Http\Controllers\AuthController;
use App\Http\Controllers\Api\SettingsController;
use App\Http\Controllers\Api\NewsletterSubscriberController;
use App\Http\Controllers\Api\SupportController;
use App\Http\Controllers\Api\NotificationsController;
use Illuminate\Support\Facades\Route;

Route::prefix('v1')->group(function () {
    // Public Newsletter Subscribe
    Route::post('newsletter/subscribe', [NewsletterSubscriberController::class, 'store']);

    // Public guest routes
    Route::prefix('public')->group(function () {
        Route::get('room-types', [RoomController::class, 'roomTypes']);
        Route::get('availability', [ReservationController::class, 'searchAvailability']);
        Route::post('reservations', [ReservationController::class, 'storePublic']);
        Route::post('support/contact', [SupportController::class, 'createConversation']);
    });

    // Auth Routes
    Route::post('api-login', [AuthController::class, 'apiLogin']);
    // Route::post('logout', [AuthController::class, 'logout'])->middleware('auth:sanctum');
    // Route::get('user', [AuthController::class, 'user'])->middleware('auth:sanctum');

    // Settings (admin-only for now)
    Route::get('settings/site', [SettingsController::class, 'showSite'])->middleware(['auth:sanctum', 'role:admin']);
    Route::put('settings/site', [SettingsController::class, 'updateSite'])->middleware(['auth:sanctum', 'role:admin']);

    // Newsletter subscribers (admin + help desk)
    Route::get('newsletter/subscribers', [NewsletterSubscriberController::class, 'index'])
        ->middleware(['auth:sanctum', 'role:admin,help_desk']);

    // Support inbox (admin + help desk)
    Route::get('support/conversations', [SupportController::class, 'index'])
        ->middleware(['auth:sanctum', 'role:admin,help_desk']);
    Route::post('support/conversations', [SupportController::class, 'createConversation'])
        ->middleware(['auth:sanctum', 'role:admin,help_desk']);
    Route::get('support/conversations/{conversation}', [SupportController::class, 'show'])
        ->middleware(['auth:sanctum', 'role:admin,help_desk']);
    Route::patch('support/conversations/{conversation}/status', [SupportController::class, 'updateStatus'])
        ->middleware(['auth:sanctum', 'role:admin,help_desk']);
    Route::post('support/conversations/{conversation}/reply', [SupportController::class, 'reply'])
        ->middleware(['auth:sanctum', 'role:admin,help_desk']);

    Route::middleware('auth:sanctum')->group(function () {
        Route::get('notifications', [NotificationsController::class, 'index']);
        Route::post('notifications/{id}/read', [NotificationsController::class, 'markAsRead']);
        Route::post('notifications/read-all', [NotificationsController::class, 'markAllAsRead']);

        // Rooms
        Route::get('rooms', [RoomController::class, 'index']);
        Route::patch('rooms/{room}/status', [RoomController::class, 'updateStatus']);
        Route::middleware('role:admin,manager')->group(function () {
            Route::post('rooms', [RoomController::class, 'store']);
            Route::get('rooms/{room}', [RoomController::class, 'show']);
            Route::put('rooms/{room}', [RoomController::class, 'update']);
            Route::delete('rooms/{room}', [RoomController::class, 'destroy']);
        });

        // Room Types
        Route::get('room-types', [RoomTypeController::class, 'index']);
        Route::middleware('role:admin,manager')->group(function () {
            Route::post('room-types', [RoomTypeController::class, 'store']);
            Route::get('room-types/{room_type}', [RoomTypeController::class, 'show']);
            Route::put('room-types/{room_type}', [RoomTypeController::class, 'update']);
            Route::delete('room-types/{room_type}', [RoomTypeController::class, 'destroy']);
        });

        Route::apiResource('guests', GuestController::class);

        Route::get('reservations', [ReservationController::class, 'index']);
        Route::get('reservations/{reservation}', [ReservationController::class, 'show']);
        Route::post('reservations', [ReservationController::class, 'store']);
        Route::post('reservations/{reservation}/cancel', [ReservationController::class, 'cancel']);
        Route::get('availability', [ReservationController::class, 'searchAvailability']);

        Route::get('stays', [StayController::class, 'index']);
        Route::get('stays/{stay}', [StayController::class, 'show']);
        Route::post('reservations/{reservation}/check-in', [StayController::class, 'checkIn']);
        Route::post('stays/{stay}/check-out', [StayController::class, 'checkOut']);

        Route::get('invoices', [InvoiceController::class, 'index']);
        Route::get('invoices/{invoice}', [InvoiceController::class, 'show']);
        Route::post('invoices/{invoice}/services', [InvoiceController::class, 'addServiceCharge']);
        Route::post('invoices/{invoice}/issue', [InvoiceController::class, 'issue']);
        Route::post('invoices/{invoice}/payments', [InvoiceController::class, 'recordPayment']);
    });
});
