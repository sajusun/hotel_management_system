<?php

namespace Database\Seeders;

use App\Models\Amenity;
use App\Models\Room;
use App\Models\Tag;
use App\Modules\Guest\Models\Guest;
use App\Modules\Room\Models\RoomType;
use App\Modules\Shared\Enums\RoomStatus;
use Illuminate\Database\Seeder;

class HmsSeeder extends Seeder
{
    public function run(): void
    {
        // ── 1. Create Room Types ───────────────────────────────────────
        $standard = RoomType::firstOrCreate(
            ['name' => 'Standard Queen'],
            [
                'description' => 'Comfortable, cozy room featuring a queen-size plush bed, ergonomic work desk, and private en-suite bathroom.',
                'base_rate' => 89.00,
                'capacity' => 2,
            ]
        );

        $deluxe = RoomType::firstOrCreate(
            ['name' => 'Deluxe King Oceanfront'],
            [
                'description' => 'Spacious luxury room with a king-size bed, breathtaking ocean views, private balcony, and marble bath.',
                'base_rate' => 149.00,
                'capacity' => 2,
            ]
        );

        $suite = RoomType::firstOrCreate(
            ['name' => 'Executive Family Suite'],
            [
                'description' => 'Expansive dual-room suite with private living room, dining nook, 2 queen beds, and premium lounge privileges.',
                'base_rate' => 249.00,
                'capacity' => 4,
            ]
        );

        $presidential = RoomType::firstOrCreate(
            ['name' => 'Presidential Royal Suite'],
            [
                'description' => 'Ultra-luxurious top-floor penthouse suite with panoramic terrace, jacuzzi, master king bedroom, and 24/7 butler service.',
                'base_rate' => 499.00,
                'capacity' => 6,
            ]
        );

        // Fetch all amenities and tags for attaching
        $allAmenities = Amenity::all();
        $allTags = Tag::all();

        // ── 2. Create Rooms ────────────────────────────────────────────
        $roomConfigs = [
            // Floor 1: Standard Rooms
            ['type' => $standard, 'number' => '101', 'floor' => 1, 'status' => RoomStatus::Available],
            ['type' => $standard, 'number' => '102', 'floor' => 1, 'status' => RoomStatus::Available],
            ['type' => $standard, 'number' => '103', 'floor' => 1, 'status' => RoomStatus::Occupied],
            ['type' => $standard, 'number' => '104', 'floor' => 1, 'status' => RoomStatus::Maintenance],
            ['type' => $standard, 'number' => '105', 'floor' => 1, 'status' => RoomStatus::Available],

            // Floor 2: Deluxe Rooms
            ['type' => $deluxe, 'number' => '201', 'floor' => 2, 'status' => RoomStatus::Available],
            ['type' => $deluxe, 'number' => '202', 'floor' => 2, 'status' => RoomStatus::Occupied],
            ['type' => $deluxe, 'number' => '203', 'floor' => 2, 'status' => RoomStatus::Reserved],
            ['type' => $deluxe, 'number' => '204', 'floor' => 2, 'status' => RoomStatus::Available],
            ['type' => $deluxe, 'number' => '205', 'floor' => 2, 'status' => RoomStatus::Occupied],

            // Floor 3: Executive Family Suites
            ['type' => $suite, 'number' => '301', 'floor' => 3, 'status' => RoomStatus::Available],
            ['type' => $suite, 'number' => '302', 'floor' => 3, 'status' => RoomStatus::Occupied],
            ['type' => $suite, 'number' => '303', 'floor' => 3, 'status' => RoomStatus::Reserved],
            ['type' => $suite, 'number' => '304', 'floor' => 3, 'status' => RoomStatus::Available],

            // Floor 4: Presidential Royal Suites
            ['type' => $presidential, 'number' => '401', 'floor' => 4, 'status' => RoomStatus::Available],
            ['type' => $presidential, 'number' => '402', 'floor' => 4, 'status' => RoomStatus::Occupied],
        ];

        foreach ($roomConfigs as $cfg) {
            $room = Room::updateOrCreate(
                ['number' => $cfg['number']],
                [
                    'room_type_id' => $cfg['type']->id,
                    'name' => $cfg['type']->name . ' #' . $cfg['number'],
                    'description' => $cfg['type']->description,
                    'floor' => $cfg['floor'],
                    'status' => $cfg['status'],
                    'is_visible' => true,
                    'notes' => 'Room ' . $cfg['number'] . ' located on floor ' . $cfg['floor'] . '.',
                ]
            );

            // Attach 3-4 random amenities if available
            if ($allAmenities->isNotEmpty()) {
                $count = min(4, $allAmenities->count());
                $room->amenities()->sync($allAmenities->random($count)->pluck('id'));
            }

            // Attach 1-2 random tags if available
            if ($allTags->isNotEmpty()) {
                $count = min(2, $allTags->count());
                $room->tags()->sync($allTags->random($count)->pluck('id'));
            }
        }

        // ── 3. Create Diverse Guests ───────────────────────────────────
        $guests = [
            [
                'first_name' => 'Sarah',
                'last_name' => 'Jenkins',
                'email' => 'sarah.jenkins@example.com',
                'phone' => '+1 (555) 234-5678',
                'document_number' => 'US-P9874123',
                'notes' => 'VIP Club member. Prefers high floor and ocean view.',
            ],
            [
                'first_name' => 'Michael',
                'last_name' => 'Chen',
                'email' => 'michael.chen@example.com',
                'phone' => '+1 (555) 345-6789',
                'document_number' => 'CA-C8745129',
                'notes' => 'Celebrating 10th wedding anniversary. Requested champagne.',
            ],
            [
                'first_name' => 'Emma',
                'last_name' => 'Watson',
                'email' => 'emma.watson@example.com',
                'phone' => '+44 20 7946 0912',
                'document_number' => 'GB-91238475',
                'notes' => 'Corporate account. Requires express checkout and invoice emailing.',
            ],
            [
                'first_name' => 'David',
                'last_name' => 'Miller',
                'email' => 'david.miller@example.com',
                'phone' => '+1 (555) 456-7890',
                'document_number' => 'US-P1928374',
                'notes' => 'Late arrival expected after 10 PM.',
            ],
            [
                'first_name' => 'Alexander',
                'last_name' => 'Wright',
                'email' => 'alexander.wright@example.com',
                'phone' => '+61 2 9374 8102',
                'document_number' => 'AU-N5839201',
                'notes' => 'Frequent business traveler.',
            ],
            [
                'first_name' => 'Sophia',
                'last_name' => 'Garcia',
                'email' => 'sophia.garcia@example.com',
                'phone' => '+34 91 123 4567',
                'document_number' => 'ES-84729103D',
                'notes' => 'Traveling with family, requested connecting room or crib.',
            ],
            [
                'first_name' => 'Daniel',
                'last_name' => 'Lee',
                'email' => 'daniel.lee@example.com',
                'phone' => '+82 2 3456 7890',
                'document_number' => 'KR-M8291048',
                'notes' => 'Allergic to feathers, requested synthetic pillows.',
            ],
            [
                'first_name' => 'Olivia',
                'last_name' => 'Taylor',
                'email' => 'olivia.taylor@example.com',
                'phone' => '+1 (555) 567-8901',
                'document_number' => 'US-P6789123',
                'notes' => 'Quiet room away from elevators.',
            ],
        ];

        foreach ($guests as $g) {
            Guest::updateOrCreate(
                ['email' => $g['email']],
                $g
            );
        }
    }
}
