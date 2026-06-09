<?php

namespace App\Modules\Reservation\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Billing\PaymentGatewayManager;
use App\Modules\Reservation\DTOs\AvailabilitySearchData;
use App\Modules\Reservation\DTOs\CreateReservationData;
use App\Modules\Reservation\Http\Requests\SearchAvailabilityRequest;
use App\Modules\Reservation\Http\Requests\StoreReservationRequest;
use App\Modules\Reservation\Http\Requests\StorePublicReservationRequest;
use App\Modules\Reservation\Http\Resources\ReservationResource;
use App\Modules\Stay\Models\Stay;
use App\Modules\Billing\Models\Invoice;
use App\Modules\Shared\Enums\StayStatus;
use App\Modules\Shared\Enums\InvoiceStatus;
use Illuminate\Http\Request;
use Stripe\Webhook;
use App\Modules\Reservation\Models\Reservation;
use App\Modules\Reservation\Repositories\Contracts\ReservationRepositoryInterface;
use App\Modules\Reservation\Services\ReservationService;
use App\Modules\Room\Http\Resources\RoomResource;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use App\Modules\Guest\Models\Guest;
use App\Models\User;
use App\Notifications\NewReservation;
use Illuminate\Support\Facades\Notification;

class ReservationController extends Controller
{
    public function __construct(
        private readonly ReservationService $reservationService,
        private readonly PaymentGatewayManager $paymentGatewayManager,
    ) {}

    public function index(): AnonymousResourceCollection
    {
        return ReservationResource::collection(
            Reservation::query()
                ->with(['room.roomType', 'guest', 'stay'])
                ->latest()
                ->paginate(20)
        );
    }

    public function show(int $reservation): ReservationResource
    {
        return new ReservationResource($this->reservations->findByIdOrFail($reservation));
    }

    public function searchAvailability(SearchAvailabilityRequest $request): AnonymousResourceCollection
    {
        $rooms = $this->reservationService->searchAvailability(
            new AvailabilitySearchData(
                checkInDate: Carbon::parse($request->validated('check_in_date')),
                checkOutDate: Carbon::parse($request->validated('check_out_date')),
                roomTypeId: $request->validated('room_type_id'),
                guestsCount: $request->integer('guests_count', 1),
            )
        );

        return RoomResource::collection($rooms);
    }

    public function store(StoreReservationRequest $request): JsonResponse
    {
        $reservation = $this->reservationService->createReservation(
            new CreateReservationData(
                roomId: $request->integer('room_id'),
                guestId: $request->integer('guest_id'),
                checkInDate: Carbon::parse($request->validated('check_in_date')),
                checkOutDate: Carbon::parse($request->validated('check_out_date')),
                guestsCount: $request->integer('guests_count', 1),
                specialRequests: $request->validated('special_requests'),
                paymentMethod: $request->validated('payment_method'),
            )
        );

        $admins = User::whereIn('role', ['admin', 'help_desk', 'receptionist', 'manager'])->get();
        Notification::send($admins, new NewReservation($reservation));

        return (new ReservationResource($reservation))
            ->response()
            ->setStatusCode(201);
    }

    public function storePublic(StorePublicReservationRequest $request): JsonResponse
    {
        $guest = Guest::firstOrCreate(
            ['email' => strtolower($request->validated('email'))],
            [
                'first_name' => $request->validated('first_name'),
                'last_name' => $request->validated('last_name'),
                'phone' => $request->validated('phone'),
            ]
        );

        $reservation = $this->reservationService->createReservation(
            new CreateReservationData(
                roomId: $request->integer('room_id'),
                guestId: $guest->id,
                checkInDate: Carbon::parse($request->validated('check_in_date')),
                checkOutDate: Carbon::parse($request->validated('check_out_date')),
                guestsCount: $request->integer('guests_count', 1),
                specialRequests: $request->validated('special_requests'),
                paymentMethod: $request->input('payment_method', 'stripe'),
            )
        );

        $admins = User::whereIn('role', ['admin', 'help_desk', 'receptionist', 'manager'])->get();
        Notification::send($admins, new NewReservation($reservation));

        $paymentMethod = $request->input('payment_method', 'stripe');
        $paymentUrl = null;
        if ($paymentMethod === 'stripe') {
            \Stripe\Stripe::setApiKey(config('payment.stripe.secret'));
            $session = \Stripe\Checkout\Session::create([
                'payment_method_types' => ['card'],
                'mode' => 'payment',
                'customer_email' => $guest->email,
                'line_items' => [[
                    'price_data' => [
                        'currency' => 'usd',
                        'unit_amount' => (int) round(($reservation->estimated_total ?? 0) * 100),
                        'product_data' => [
                            'name' => 'Reservation #' . $reservation->id,
                            'description' => 'Hotel reservation payment',
                        ],
                    ],
                    'quantity' => 1,
                ]],
                'metadata' => [
                    'reservation_id' => $reservation->id,
                ],
                'success_url' => config('payment.success_url') . "?session_id={CHECKOUT_SESSION_ID}&gateway=stripe",
                'cancel_url' => config('payment.cancel_url') . "?gateway=stripe",
            ]);
            $paymentUrl = $session->url;
            $reservation->update([
                'payment_method' => 'stripe',
                'payment_status' => 'pending',
            ]);
        } else {
            // Default to on arrival payment
            $reservation->update([
                'payment_method' => 'on_arrival',
                'payment_status' => 'on_arrival',
            ]);
        }

        return response()->json([
            'reservation' => new ReservationResource($reservation),
            'payment_url' => $paymentUrl,
        ])->setStatusCode(201);
    }

    public function cancel(int $reservation): ReservationResource
    {
        $cancelled = $this->reservationService->cancelReservation($reservation);

        return new ReservationResource($cancelled);
    }
}
