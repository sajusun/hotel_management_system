<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Tag;

class TagsTableSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $tags = [
            ['name' => 'Ocean View', 'description' => 'Direct panoramic view of the ocean shoreline'],
            ['name' => 'City Skyline', 'description' => 'Spectacular views overlooking the vibrant downtown skyline'],
            ['name' => 'Family Friendly', 'description' => 'Spacious layout ideal for families with children'],
            ['name' => 'Executive & Business', 'description' => 'Optimized work station and Executive Lounge access'],
            ['name' => 'Honeymoon Suite', 'description' => 'Romantic ambiance tailored for couples and newlyweds'],
            ['name' => 'Accessible / ADA', 'description' => 'Full wheelchair accessibility with roll-in shower'],
            ['name' => 'High Floor Penthouse', 'description' => 'Top floor exclusive privacy and quiet luxury'],
            ['name' => 'Pet Friendly', 'description' => 'Accommodates well-behaved domestic pets'],
        ];

        foreach ($tags as $data) {
            Tag::firstOrCreate(['name' => $data['name']], $data);
        }
    }
}
