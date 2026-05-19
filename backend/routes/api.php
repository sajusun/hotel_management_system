<?php

use App\Modules\Billing\Http\Controllers\InvoiceController;
use App\Modules\Guest\Http\Controllers\GuestController;
use App\Modules\Reservation\Http\Controllers\ReservationController;
use App\Modules\Room\Http\Controllers\RoomController;
use App\Modules\Stay\Http\Controllers\StayController;
use App\Modules\Auth\Http\Controllers\AuthController;
use App\Http\Controllers\Api\SettingsController;
use App\Http\Controllers\Api\NewsletterSubscriberController;
use App\Http\Controllers\Api\SupportController;
use Illuminate\Support\Facades\Route;

Route::prefix('v1')->group(function () {
    // Public Newsletter Subscribe
    Route::post('newsletter/subscribe', [NewsletterSubscriberController::class, 'store']);

    // Auth Routes
    Route::post('login', [AuthController::class, 'login']);
    Route::post('logout', [AuthController::class, 'logout'])->middleware('auth:sanctum');
    Route::get('user', [AuthController::class, 'user'])->middleware('auth:sanctum');

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

    Route::get('room-types', [RoomController::class, 'roomTypes']);
    Route::get('rooms', [RoomController::class, 'index']);
    Route::patch('rooms/{room}/status', [RoomController::class, 'updateStatus']);

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

    Route::get('invoices/{invoice}', [InvoiceController::class, 'show']);
    Route::post('invoices/{invoice}/services', [InvoiceController::class, 'addServiceCharge']);
    Route::post('invoices/{invoice}/issue', [InvoiceController::class, 'issue']);
    Route::post('invoices/{invoice}/payments', [InvoiceController::class, 'recordPayment']);
});
