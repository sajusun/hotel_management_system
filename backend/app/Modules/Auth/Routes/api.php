<?php

use App\Modules\Auth\Http\Controllers\Api\LoginApiController;
use App\Modules\Auth\Http\Controllers\Api\RegisterApiController;
use App\Modules\Auth\Http\Controllers\Api\ResetPasswordApiController;
use App\Modules\Auth\Http\Controllers\Api\UserApiController;
use App\Modules\Auth\Http\Controllers\Api\VerificationApiController;
use App\Modules\Auth\Http\Controllers\AuthController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Public Auth Endpoints
|--------------------------------------------------------------------------
*/
Route::prefix('auth')->group(function () {
    Route::post('/register', [RegisterApiController::class, 'register']);
    Route::post('/verify-email', [RegisterApiController::class, 'verifyEmail']);
    Route::post('/otp/resend', [RegisterApiController::class, 'resendOtp']);
    Route::post('/otp/verify', [RegisterApiController::class, 'verifyEmail']);

    Route::post('/login', [LoginApiController::class, 'login']);
    Route::post('/forget-password', [ResetPasswordApiController::class, 'forgotPassword']);
    Route::post('/forget-password/verify-otp', [ResetPasswordApiController::class, 'resetSecretKey']);
    Route::post('/reset-password', [ResetPasswordApiController::class, 'resetPassword']);
    Route::get('/verification/verify-token', [VerificationApiController::class, 'verifyToken']);
});

/*
|--------------------------------------------------------------------------
| Protected Auth & Profile Endpoints
|--------------------------------------------------------------------------
*/
Route::middleware('auth:sanctum')->prefix('auth')->group(function () {
    Route::get('/me', [UserApiController::class, 'me']);
    Route::post('/update-profile', [UserApiController::class, 'updateProfile']);
    Route::post('/update-password', [UserApiController::class, 'updatePassword']);
    Route::post('/update-avatar', [UserApiController::class, 'updateAvatar']);
    Route::post('/logout', [AuthController::class, 'logout']);

    // Verification triggers
    Route::post('/verification/send', [VerificationApiController::class, 'send']);
    Route::post('/verification/verify-otp', [VerificationApiController::class, 'verifyOtp']);
});
