<?php

return [
    'stripe' => [
        'key' => env('STRIPE_KEY'),
        'secret' => env('STRIPE_SECRET'),
        'webhook_secret' => env('STRIPE_WEBHOOK_SECRET'),
    ],
    'paypal' => [
        'mode' => env('PAYPAL_MODE', 'sandbox'),
        'client_id' => env('PAYPAL_CLIENT_ID'),
        'client_secret' => env('PAYPAL_CLIENT_SECRET'),
    ],
    'success_url' => env('PAYMENT_SUCCESS_URL', env('FRONTEND_URL', 'http://localhost:5173') . '/dashboard/billing'),
    'cancel_url' => env('PAYMENT_CANCEL_URL', env('FRONTEND_URL', 'http://localhost:5173') . '/dashboard/billing'),
];
