<?php

namespace App\Modules\Room\Services;

use App\Modules\Room\Models\Room;
use App\Modules\Room\Models\RoomType;
use App\Modules\Room\Repositories\Contracts\RoomRepositoryInterface;
use App\Modules\Shared\Enums\RoomStatus;
use Illuminate\Support\Collection;

class RoomService
{
    public function __construct(
        private readonly RoomRepositoryInterface $rooms,
    ) {}

    /**
     * @return Collection<int, Room>
     */
    public function listRooms(?RoomStatus $status = null): Collection
    {
        return Room::query()
            ->with('roomType')
            ->when($status, fn ($q) => $q->where('status', $status))
            ->orderBy('number')
            ->get();
    }

    /**
     * @return Collection<int, RoomType>
     */
    public function listRoomTypes(): Collection
    {
        return RoomType::query()->withCount('rooms')->orderBy('name')->get();
    }

    public function updateRoomStatus(int $roomId, RoomStatus $status): Room
    {
        return $this->rooms->updateStatus($roomId, $status);
    }
}
