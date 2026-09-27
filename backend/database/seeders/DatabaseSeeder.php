<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->call([
            RolesAndPermissionsSeeder::class,
            UserSeeder::class,
            AmenitiesTableSeeder::class,
            TagsTableSeeder::class,
            HmsSeeder::class,
            ReservationStaySeeder::class,
            BillingSeeder::class,
            SupportSeeder::class,
            NewsletterSeeder::class,
            SettingSeeder::class,
            ActivityLogSeeder::class,
        ]);
    }
}
