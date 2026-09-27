<?php

namespace Database\Seeders;

use App\Models\User;
use Carbon\Carbon;
use Illuminate\Database\Seeder;
use Spatie\Activitylog\Models\Activity;

class ActivityLogSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $admin = User::where('email', 'admin@hms.com')->first();
        $manager = User::where('email', 'manager@hms.com')->first();
        $receptionist = User::where('email', 'receptionist@hms.com')->first();

        $events = [
            [
                'log_name' => 'auth',
                'description' => 'User logged in to Admin Console: admin@hms.com',
                'causer_type' => User::class,
                'causer_id' => $admin?->id,
                'properties' => ['ip' => '127.0.0.1', 'user_agent' => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'],
                'created_at' => Carbon::now()->subHours(1),
            ],
            [
                'log_name' => 'reservations',
                'description' => 'Checked in guest Sarah Jenkins into Room 202 (Reservation: RES-2026-001)',
                'causer_type' => User::class,
                'causer_id' => $receptionist?->id,
                'properties' => ['reservation_reference' => 'RES-2026-001', 'room_number' => '202'],
                'created_at' => Carbon::now()->subDays(7)->setTime(14, 32),
            ],
            [
                'log_name' => 'billing',
                'description' => 'Captured Stripe payment of $738.10 for Invoice #INV-2026-001',
                'causer_type' => User::class,
                'causer_id' => $receptionist?->id,
                'properties' => ['invoice_number' => 'INV-2026-001', 'gateway' => 'stripe', 'amount' => 738.10],
                'created_at' => Carbon::now()->subDays(3)->setTime(10, 31),
            ],
            [
                'log_name' => 'rooms',
                'description' => 'Room 104 status updated to Maintenance by Operations Manager',
                'causer_type' => User::class,
                'causer_id' => $manager?->id,
                'properties' => ['room_number' => '104', 'old_status' => 'available', 'new_status' => 'maintenance'],
                'created_at' => Carbon::now()->subDays(2)->setTime(9, 15),
            ],
            [
                'log_name' => 'reservations',
                'description' => 'Confirmed new reservation #RES-2026-004 for Alexander Wright (Presidential Suite)',
                'causer_type' => User::class,
                'causer_id' => $manager?->id,
                'properties' => ['reference' => 'RES-2026-004', 'amount' => 3568.40],
                'created_at' => Carbon::now()->subDays(3)->setTime(12, 50),
            ],
        ];

        foreach ($events as $event) {
            Activity::create($event);
        }
    }
}
