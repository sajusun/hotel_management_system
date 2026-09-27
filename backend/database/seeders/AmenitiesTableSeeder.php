<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Amenity;

class AmenitiesTableSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $amenities = [
            ['name' => 'High-Speed Wi-Fi', 'description' => 'Ultra high-speed fiber wireless internet (1 Gbps)'],
            ['name' => 'Climate Control AC', 'description' => 'Individual smart climate and temperature control'],
            ['name' => 'Mini Bar & Refrigerator', 'description' => 'Fully stocked gourmet refreshments and chilled beverages'],
            ['name' => '55" 4K Smart TV', 'description' => 'Ultra HD Smart TV with streaming apps and premium cable channels'],
            ['name' => 'Private Balcony', 'description' => 'Private panoramic outdoor balcony with seating'],
            ['name' => 'In-Room Electronic Safe', 'description' => 'Digital keypad secure safe for laptops and valuables'],
            ['name' => 'Nespresso Coffee Machine', 'description' => 'Complimentary premium espresso capsules and artisan teas'],
            ['name' => 'Luxury Bathrobe & Slippers', 'description' => 'Plush Egyptian cotton bathrobes and premium footwear'],
            ['name' => 'Jacuzzi Whirlpool Tub', 'description' => 'Deep soaking hydromassage bathtub with bath salts'],
            ['name' => '24/7 Room Service Access', 'description' => 'In-room private dining service available around the clock'],
        ];

        foreach ($amenities as $data) {
            Amenity::firstOrCreate(['name' => $data['name']], $data);
        }
    }
}
