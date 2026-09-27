<?php

namespace Database\Seeders;

use App\Models\NewsletterSubscriber;
use Illuminate\Database\Seeder;

class NewsletterSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $subscribers = [
            'traveler.jane@globetrotter.io',
            'executive.corporate@fintech.co',
            'vacation.planner@wanderlust.net',
            'vip.club@luxuryescapes.org',
            'guest.reviews@hospitalitytoday.com',
            'sarah.adventures@travelblogger.com',
            'mark.summit@destinationguides.org',
            'elena.luxury@voyages.fr',
        ];

        foreach ($subscribers as $email) {
            NewsletterSubscriber::firstOrCreate(['email' => $email]);
        }
    }
}
