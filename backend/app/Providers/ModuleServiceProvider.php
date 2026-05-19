<?php

namespace App\Providers;

use App\Modules\Billing\Repositories\Contracts\InvoiceRepositoryInterface;
use App\Modules\Billing\Repositories\InvoiceRepository;
use App\Modules\Guest\Repositories\Contracts\GuestRepositoryInterface;
use App\Modules\Guest\Repositories\GuestRepository;
use App\Modules\Reservation\Repositories\Contracts\ReservationRepositoryInterface;
use App\Modules\Reservation\Repositories\ReservationRepository;
use App\Modules\Room\Repositories\Contracts\RoomRepositoryInterface;
use App\Modules\Room\Repositories\RoomRepository;
use App\Modules\Stay\Repositories\Contracts\StayRepositoryInterface;
use App\Modules\Stay\Repositories\StayRepository;
use Illuminate\Support\ServiceProvider;

class ModuleServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        $this->app->bind(RoomRepositoryInterface::class, RoomRepository::class);
        $this->app->bind(GuestRepositoryInterface::class, GuestRepository::class);
        $this->app->bind(ReservationRepositoryInterface::class, ReservationRepository::class);
        $this->app->bind(StayRepositoryInterface::class, StayRepository::class);
        $this->app->bind(InvoiceRepositoryInterface::class, InvoiceRepository::class);
    }
}
