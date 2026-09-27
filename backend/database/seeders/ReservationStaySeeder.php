<?php

namespace Database\Seeders;

use App\Models\Room;
use App\Modules\Guest\Models\Guest;
use App\Modules\Reservation\Models\Reservation;
use App\Modules\Shared\Enums\ReservationStatus;
use App\Modules\Shared\Enums\StayStatus;
use App\Modules\Stay\Models\Stay;
use Carbon\Carbon;
use Illuminate\Database\Seeder;

class ReservationStaySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $guests = Guest::all()->keyBy('email');
        $rooms = Room::all()->keyBy('number');

        if ($guests->isEmpty() || $rooms->isEmpty()) {
            return;
        }

        $records = [
            // 1. Completed Stay (Past)
            [
                'reference' => 'RES-2026-001',
                'room_number' => '202',
                'guest_email' => 'sarah.jenkins@example.com',
                'check_in' => Carbon::now()->subDays(7),
                'check_out' => Carbon::now()->subDays(3),
                'nights' => 4,
                'rate' => 149.00,
                'res_status' => ReservationStatus::Completed,
                'stay_status' => StayStatus::CheckedOut,
                'checked_in_at' => Carbon::now()->subDays(7)->setTime(14, 30),
                'checked_out_at' => Carbon::now()->subDays(3)->setTime(10, 45),
                'confirmed_at' => Carbon::now()->subDays(14),
                'special_requests' => 'High floor preferred, ocean view. Early check-in requested.',
            ],
            // 2. Active Stay (Checked In)
            [
                'reference' => 'RES-2026-002',
                'room_number' => '302',
                'guest_email' => 'michael.chen@example.com',
                'check_in' => Carbon::now()->subDays(2),
                'check_out' => Carbon::now()->addDays(2),
                'nights' => 4,
                'rate' => 249.00,
                'res_status' => ReservationStatus::Confirmed,
                'stay_status' => StayStatus::CheckedIn,
                'checked_in_at' => Carbon::now()->subDays(2)->setTime(15, 10),
                'checked_out_at' => null,
                'confirmed_at' => Carbon::now()->subDays(10),
                'special_requests' => 'Wedding anniversary setup: Chilled champagne and fresh berries upon arrival.',
            ],
            // 3. Active Stay (Checked In)
            [
                'reference' => 'RES-2026-003',
                'room_number' => '103',
                'guest_email' => 'emma.watson@example.com',
                'check_in' => Carbon::now()->subDays(1),
                'check_out' => Carbon::now()->addDays(1),
                'nights' => 2,
                'rate' => 89.00,
                'res_status' => ReservationStatus::Confirmed,
                'stay_status' => StayStatus::CheckedIn,
                'checked_in_at' => Carbon::now()->subDays(1)->setTime(16, 00),
                'checked_out_at' => null,
                'confirmed_at' => Carbon::now()->subDays(5),
                'special_requests' => 'Quiet corner room for remote video conferences.',
            ],
            // 4. Active Stay (Checked In - Presidential Suite)
            [
                'reference' => 'RES-2026-004',
                'room_number' => '402',
                'guest_email' => 'alexander.wright@example.com',
                'check_in' => Carbon::now()->subDays(3),
                'check_out' => Carbon::now()->addDays(3),
                'nights' => 6,
                'rate' => 499.00,
                'res_status' => ReservationStatus::Confirmed,
                'stay_status' => StayStatus::CheckedIn,
                'checked_in_at' => Carbon::now()->subDays(3)->setTime(13, 00),
                'checked_out_at' => null,
                'confirmed_at' => Carbon::now()->subDays(20),
                'special_requests' => 'VIP Airport limousine pickup requested. Dietary: strictly gluten-free.',
            ],
            // 5. Active Stay (Checked In)
            [
                'reference' => 'RES-2026-005',
                'room_number' => '205',
                'guest_email' => 'olivia.taylor@example.com',
                'check_in' => Carbon::now()->subDays(1),
                'check_out' => Carbon::now()->addDays(3),
                'nights' => 4,
                'rate' => 149.00,
                'res_status' => ReservationStatus::Confirmed,
                'stay_status' => StayStatus::CheckedIn,
                'checked_in_at' => Carbon::now()->subDays(1)->setTime(14, 15),
                'checked_out_at' => null,
                'confirmed_at' => Carbon::now()->subDays(4),
                'special_requests' => 'Extra down pillows and late departure if possible.',
            ],
            // 6. Confirmed Upcoming Reservation
            [
                'reference' => 'RES-2026-006',
                'room_number' => '203',
                'guest_email' => 'david.miller@example.com',
                'check_in' => Carbon::now()->addDays(1),
                'check_out' => Carbon::now()->addDays(4),
                'nights' => 3,
                'rate' => 149.00,
                'res_status' => ReservationStatus::Confirmed,
                'stay_status' => StayStatus::Scheduled,
                'checked_in_at' => null,
                'checked_out_at' => null,
                'confirmed_at' => Carbon::now()->subDays(2),
                'special_requests' => 'Late check-in expected after 10:00 PM due to delayed flight.',
            ],
            // 7. Pending Reservation
            [
                'reference' => 'RES-2026-007',
                'room_number' => '303',
                'guest_email' => 'sophia.garcia@example.com',
                'check_in' => Carbon::now()->addDays(3),
                'check_out' => Carbon::now()->addDays(7),
                'nights' => 4,
                'rate' => 249.00,
                'res_status' => ReservationStatus::Pending,
                'stay_status' => StayStatus::Scheduled,
                'checked_in_at' => null,
                'checked_out_at' => null,
                'confirmed_at' => null,
                'special_requests' => 'Traveling with two children, requested baby crib and rollaway cot.',
            ],
            // 8. Cancelled Reservation
            [
                'reference' => 'RES-2026-008',
                'room_number' => '101',
                'guest_email' => 'daniel.lee@example.com',
                'check_in' => Carbon::now()->addDays(5),
                'check_out' => Carbon::now()->addDays(8),
                'nights' => 3,
                'rate' => 89.00,
                'res_status' => ReservationStatus::Cancelled,
                'stay_status' => StayStatus::Cancelled,
                'checked_in_at' => null,
                'checked_out_at' => null,
                'confirmed_at' => Carbon::now()->subDays(8),
                'cancelled_at' => Carbon::now()->subDays(1),
                'special_requests' => 'Cancelled due to itinerary changes.',
            ],
        ];

        foreach ($records as $item) {
            $room = $rooms->get($item['room_number']);
            $guest = $guests->get($item['guest_email']);

            if (!$room || !$guest) {
                continue;
            }

            $total = $item['nights'] * $item['rate'];

            $res = Reservation::updateOrCreate(
                ['reference' => $item['reference']],
                [
                    'room_id' => $room->id,
                    'guest_id' => $guest->id,
                    'check_in_date' => $item['check_in']->toDateString(),
                    'check_out_date' => $item['check_out']->toDateString(),
                    'guests_count' => 2,
                    'status' => $item['res_status'],
                    'nightly_rate' => $item['rate'],
                    'estimated_total' => $total,
                    'special_requests' => $item['special_requests'],
                    'confirmed_at' => $item['confirmed_at'] ?? null,
                    'cancelled_at' => $item['cancelled_at'] ?? null,
                ]
            );

            Stay::updateOrCreate(
                ['reservation_id' => $res->id],
                [
                    'room_id' => $room->id,
                    'guest_id' => $guest->id,
                    'status' => $item['stay_status'],
                    'checked_in_at' => $item['checked_in_at'],
                    'checked_out_at' => $item['checked_out_at'],
                ]
            );
        }
    }
}
