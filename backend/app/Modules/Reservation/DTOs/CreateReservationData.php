<?php

namespace App\Modules\Reservation\DTOs;

use Carbon\CarbonInterface;

readonly class CreateReservationData
{
    public function __construct(
        public int $roomId,
        public int $guestId,
        public CarbonInterface $checkInDate,
        public CarbonInterface $checkOutDate,
        public int $guestsCount = 1,
        public ?string $specialRequests = null,
        public ?string $paymentMethod = null,
    ) {}
}
