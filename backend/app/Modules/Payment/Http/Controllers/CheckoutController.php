<?php

namespace App\Modules\Payment\Http\Controllers;

use App\Modules\Reservation\Models\Reservation;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Stripe\Stripe;
use Stripe\Checkout\Session as StripeSession;

class CheckoutController
{
    /**
     * Create a Stripe Checkout Session for a reservation.
     *
     * Expects JSON payload:
     *   { "gateway": "stripe" }
     */
    public function createSession(Request $request, int $reservationId): JsonResponse
    {
        // Validate gateway selection (future support for PayPal could be added here)
        $data = $request->validate([
            'gateway' => ['required', 'in:stripe']
        ]);

        // Load reservation
        $reservation = Reservation::findOrFail($reservationId);

        // Ensure reservation is pending payment
        if ($reservation->payment_status !== 'pending' && $reservation->payment_status !== 'on_arrival') {
            return response()->json([
                'success' => false,
                'message' => 'Reservation is not eligible for payment.'
            ], 400);
        }

        // Use the estimated_total as the amount (cents)
        $amount = (int) ($reservation->estimated_total * 100);

        // Configure Stripe (assumes STRIPE_SECRET in .env)
        Stripe::setApiKey(env('STRIPE_SECRET'));

        // Create Checkout Session
        $session = StripeSession::create([
            'payment_method_types' => ['card'],
            'line_items' => [[
                'price_data' => [
                    'currency' => 'usd',
                    'unit_amount' => $amount,
                    'product_data' => [
                        'name' => "Reservation {$reservation->reference}",
                        'description' => "Room {$reservation->room->number} ({$reservation->check_in_date} → {$reservation->check_out_date})",
                    ],
                ],
                'quantity' => 1,
            ]],
            'mode' => 'payment',
            'success_url' => url('/admin/reservations/' . $reservation->id . '/payment-success'),
            'cancel_url' => url('/admin/reservations/' . $reservation->id . '/payment-cancel'),
            // Attach reservation ID for later webhook correlation
            'metadata' => [
                'reservation_id' => $reservation->id,
            ],
        ]);

        // Update reservation with chosen method
        $reservation->update([
            'payment_method' => 'stripe',
            'payment_status' => 'pending',
        ]);

        return response()->json([
            'success' => true,
            'checkout_url' => $session->url,
            'session_id' => $session->id,
        ]);
    }
}
?>
