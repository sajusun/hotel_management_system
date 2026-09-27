<?php

namespace Database\Seeders;

use App\Models\Setting;
use Illuminate\Database\Seeder;

class SettingSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $siteSettings = [
            'name' => 'Grand Luxury Hotel & Suites',
            'title' => 'Grand Luxury HMS — Enterprise Hospitality Platform',
            'description' => 'Five-star premier oceanfront luxury resort & hospitality management system.',
            'tagline' => 'Excellence in Every Stay',
            'seo_keywords' => 'luxury hotel, resort booking, oceanfront suites, hospitality management, grand luxury',
            'logo_url' => '/images/logo.png',
            'favicon_url' => '/favicon.ico',

            'owner_name' => 'Grand Luxury Hospitality Group',
            'owner_email' => 'management@grandluxuryhms.com',
            'owner_phone' => '+1 (800) 555-LUXE',

            'support_email' => 'support@grandluxuryhms.com',
            'support_phone' => '+1 (800) 555-HELP',
            'support_hours' => '24 Hours / 7 Days a week',
            'support_url' => 'https://grandluxuryhms.com/support',

            'newsletter_enabled' => true,
            'newsletter_from_name' => 'Grand Luxury Concierge',
            'newsletter_from_email' => 'concierge@grandluxuryhms.com',
            'newsletter_reply_to_email' => 'support@grandluxuryhms.com',
            'newsletter_footer_text' => 'You are receiving this exclusive newsletter as a distinguished guest of Grand Luxury HMS.',
            'newsletter_manage_url' => 'https://grandluxuryhms.com/newsletter/manage',
        ];

        Setting::updateOrCreate(
            ['key' => 'site'],
            ['value' => $siteSettings]
        );
    }
}
