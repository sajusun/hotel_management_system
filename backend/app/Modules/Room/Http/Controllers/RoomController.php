<?php

namespace App\Modules\Room\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Room\Http\Requests\UpdateRoomStatusRequest;
use App\Modules\Room\Http\Resources\RoomResource;
use App\Modules\Room\Http\Resources\RoomTypeResource;
use App\Modules\Room\Services\RoomService;
use App\Modules\Shared\Enums\RoomStatus;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class RoomController extends Controller
{
    public function __construct(
        private readonly RoomService $roomService,
    ) {}

    public function index(Request $request): AnonymousResourceCollection
    {
        $status = $request->query('status')
            ? RoomStatus::from($request->query('status'))
            : null;

        $perPage = (int) $request->integer('per_page', 10);
        $perPage = max(1, min(100, $perPage));

        return RoomResource::collection($this->roomService->paginateRooms($perPage, $status));
    }

    public function roomTypes(): AnonymousResourceCollection
    {
        return RoomTypeResource::collection($this->roomService->listRoomTypes());
    }

    public function updateStatus(UpdateRoomStatusRequest $request, int $room): RoomResource
    {
        $updated = $this->roomService->updateRoomStatus(
            $room,
            RoomStatus::from($request->validated('status')),
        );

        return new RoomResource($updated);
    }
}
