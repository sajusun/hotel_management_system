<?php

use App\Modules\Billing\Http\Controllers\InvoiceController;
use App\Modules\Guest\Http\Controllers\GuestController;
use App\Modules\Reservation\Http\Controllers\ReservationController;
use App\Modules\Room\Http\Controllers\RoomController;
use App\Modules\Stay\Http\Controllers\StayController;
use App\Modules\Auth\Http\Controllers\AuthController;
use Illuminate\Support\Facades\Route;

Route::prefix('v1')->group(function () {
    // Auth Routes
    Route::post('login', [AuthController::class, 'login']);
    Route::post('logout', [AuthController::class, 'logout'])->middleware('auth:sanctum');
    Route::get('user', [AuthController::class, 'user'])->middleware('auth:sanctum');

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
