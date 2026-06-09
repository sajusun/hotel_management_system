<?php

namespace App\Modules\Reservation\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Reservation\Models\Reservation;
use App\Modules\Billing\PaymentGatewayManager;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Exception;

class ReservationPaymentController extends Controller
{
    public function __construct(
        private readonly PaymentGatewayManager $gatewayManager,
    ) {}

    /**
     * Initiate payment for a reservation.
     * Expects JSON: { payment_method: "stripe"|"paypal" }
     */
    public function initiate(Request $request, int $reservationId): JsonResponse
    {
        $request->validate([
            'payment_method' => ['required', 'string', 'in:stripe,paypal'],
        ]);
        $method = $request->input('payment_method');
        $reservation = Reservation::findOrFail($reservationId);
        try {
            $gateway = $this->gatewayManager->gateway($method);
            $result = $gateway->createPaymentIntent($reservation);
            return response()->json([
                'success' => true,
                'method' => $method,
                'payload' => $result,
            ]);
        } catch (Exception $e) {
            Log::error('Payment initiation failed', ['reservation' => $reservationId, 'error' => $e]);
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Mark reservation as on‑arrival payment (no online transaction).
     */
    public function onArrival(int $reservationId): JsonResponse
    {
        $reservation = Reservation::findOrFail($reservationId);
        $reservation->update([
            'payment_method' => 'on_arrival',
            'payment_status' => 'on_arrival',
        ]);
        return response()->json([
            'success' => true,
            'message' => 'Reservation set for on‑arrival payment',
        ]);
    }
}
?>
