<?php

declare(strict_types=1);

return [
    /*
    |--------------------------------------------------------------------------
    | Default Verification Settings
    |--------------------------------------------------------------------------
    */
    'default_type'    => 'otp',   // 'otp' or 'token'
    'default_channel' => 'email', // 'email' or 'sms'

    /*
    |--------------------------------------------------------------------------
    | OTP Specific Configuration
    |--------------------------------------------------------------------------
    */
    'otp' => [
        'length'       => 6,
        'expires_in'   => 15, // minutes
        'max_attempts' => 5,
    ],

    /*
    |--------------------------------------------------------------------------
    | Token Specific Configuration (Magic Links / Email Verification Links)
    |--------------------------------------------------------------------------
    */
    'token' => [
        'length'     => 64,
        'expires_in' => 60, // minutes
    ],

    /*
    |--------------------------------------------------------------------------
    | Rate Limiting & Cooldowns
    |--------------------------------------------------------------------------
    */
    'rate_limiting' => [
        'cooldown_seconds' => 60,  // wait 60s before resend
        'max_requests'     => 5,   // max resends before cooldown/block
        'block_duration'   => 30,  // minutes blocked if abused
    ],

    /*
    |--------------------------------------------------------------------------
    | Redirect URLs
    |--------------------------------------------------------------------------
    */
    'redirects' => [
        'success' => env('FRONTEND_URL', 'http://localhost:3000') . '/verification/success',
        'failed'  => env('FRONTEND_URL', 'http://localhost:3000') . '/verification/failed',
    ],
];
