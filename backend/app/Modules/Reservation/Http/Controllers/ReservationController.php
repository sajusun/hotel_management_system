<?php

namespace App\Modules\Reservation\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Reservation\DTOs\AvailabilitySearchData;
use App\Modules\Reservation\DTOs\CreateReservationData;
use App\Modules\Reservation\Http\Requests\SearchAvailabilityRequest;
use App\Modules\Reservation\Http\Requests\StoreReservationRequest;
use App\Modules\Reservation\Http\Requests\StorePublicReservationRequest;
use App\Modules\Reservation\Http\Resources\ReservationResource;
use App\Modules\Reservation\Models\Reservation;
use App\Modules\Reservation\Repositories\Contracts\ReservationRepositoryInterface;
use App\Modules\Reservation\Services\ReservationService;
use App\Modules\Room\Http\Resources\RoomResource;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use App\Modules\Guest\Models\Guest;

class ReservationController extends Controller
{
    public function __construct(
        private readonly ReservationService $reservationService,
        private readonly ReservationRepositoryInterface $reservations,
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
            )
        );

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
            )
        );

        return (new ReservationResource($reservation))
            ->response()
            ->setStatusCode(201);
    }

    public function cancel(int $reservation): ReservationResource
    {
        $cancelled = $this->reservationService->cancelReservation($reservation);

        return new ReservationResource($cancelled);
    }
}
