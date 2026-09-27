<?php

namespace Database\Seeders;

use App\Models\SupportConversation;
use App\Models\SupportMessage;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Database\Seeder;

class SupportSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $staffUser = User::where('role', 'help_desk')->orWhere('role', 'admin')->first();

        // ── 1. Open Ticket: Airport Transfer Inquiry ──────────────────────────
        $conv1 = SupportConversation::updateOrCreate(
            ['subject' => 'Early check-in and VIP airport shuttle inquiry'],
            [
                'status' => 'open',
                'customer_email' => 'sarah.jenkins@example.com',
                'customer_name' => 'Sarah Jenkins',
                'last_message_at' => Carbon::now()->subHours(2),
            ]
        );

        $conv1->messages()->delete();
        $conv1->messages()->createMany([
            [
                'user_id' => null,
                'direction' => 'in',
                'from_email' => 'sarah.jenkins@example.com',
                'to_email' => 'support@grandluxuryhms.com',
                'subject' => 'Early check-in and VIP airport shuttle inquiry',
                'body' => 'Hello team, my flight arrives at 10:30 AM tomorrow morning. Is it possible to arrange an early check-in for Room 202 and a private airport shuttle?',
                'provider' => 'smtp',
                'provider_message_id' => 'msg-sarah-001@example.com',
                'sent_at' => Carbon::now()->subHours(4),
                'received_at' => Carbon::now()->subHours(4),
            ],
            [
                'user_id' => $staffUser?->id,
                'direction' => 'out',
                'from_email' => 'support@grandluxuryhms.com',
                'to_email' => 'sarah.jenkins@example.com',
                'subject' => 'Re: Early check-in and VIP airport shuttle inquiry',
                'body' => 'Dear Sarah, We would love to welcome you! Early check-in is complimentary based on room readiness upon arrival. Our luxury chauffeur service is also confirmed for 10:30 AM terminal 2.',
                'provider' => 'smtp',
                'provider_message_id' => 'msg-staff-reply-001@grandluxuryhms.com',
                'sent_at' => Carbon::now()->subHours(2),
                'received_at' => null,
            ],
        ]);

        // ── 2. Pending Ticket: Dietary Preferences ────────────────────────────
        $conv2 = SupportConversation::updateOrCreate(
            ['subject' => 'Anniversary Champagne & Dietary Options'],
            [
                'status' => 'pending',
                'customer_email' => 'michael.chen@example.com',
                'customer_name' => 'Michael Chen',
                'last_message_at' => Carbon::now()->subDays(1),
            ]
        );

        $conv2->messages()->delete();
        $conv2->messages()->createMany([
            [
                'user_id' => null,
                'direction' => 'in',
                'from_email' => 'michael.chen@example.com',
                'to_email' => 'support@grandluxuryhms.com',
                'subject' => 'Anniversary Champagne & Dietary Options',
                'body' => 'Hi, we are celebrating our 10th anniversary during our stay in Suite 302. Could we confirm if the dessert options include gluten-free options?',
                'provider' => 'smtp',
                'provider_message_id' => 'msg-michael-002@example.com',
                'sent_at' => Carbon::now()->subDays(1)->subHours(3),
                'received_at' => Carbon::now()->subDays(1)->subHours(3),
            ],
            [
                'user_id' => $staffUser?->id,
                'direction' => 'out',
                'from_email' => 'support@grandluxuryhms.com',
                'to_email' => 'michael.chen@example.com',
                'subject' => 'Re: Anniversary Champagne & Dietary Options',
                'body' => 'Congratulations Michael! Our Executive Chef has curated a gluten-free chocolate artisan gateau and Dom Pérignon champagne will be chilled in your suite.',
                'provider' => 'smtp',
                'provider_message_id' => 'msg-staff-reply-002@grandluxuryhms.com',
                'sent_at' => Carbon::now()->subDays(1),
                'received_at' => null,
            ],
        ]);

        // ── 3. Closed Ticket: Conference WiFi Credentials ─────────────────────
        $conv3 = SupportConversation::updateOrCreate(
            ['subject' => 'Executive Conference WiFi Access'],
            [
                'status' => 'closed',
                'customer_email' => 'emma.watson@example.com',
                'customer_name' => 'Emma Watson',
                'last_message_at' => Carbon::now()->subDays(2),
            ]
        );

        $conv3->messages()->delete();
        $conv3->messages()->createMany([
            [
                'user_id' => null,
                'direction' => 'in',
                'from_email' => 'emma.watson@example.com',
                'to_email' => 'support@grandluxuryhms.com',
                'subject' => 'Executive Conference WiFi Access',
                'body' => 'Could someone please provide the dedicated network credentials for the 3rd-floor conference center?',
                'provider' => 'smtp',
                'provider_message_id' => 'msg-emma-003@example.com',
                'sent_at' => Carbon::now()->subDays(2)->subHours(5),
                'received_at' => Carbon::now()->subDays(2)->subHours(5),
            ],
            [
                'user_id' => $staffUser?->id,
                'direction' => 'out',
                'from_email' => 'support@grandluxuryhms.com',
                'to_email' => 'emma.watson@example.com',
                'subject' => 'Re: Executive Conference WiFi Access',
                'body' => 'Hi Emma, the network is "GrandLuxury-Executive" with high-speed passkey "LUXURY2026". Let us know if you need anything else!',
                'provider' => 'smtp',
                'provider_message_id' => 'msg-staff-reply-003@grandluxuryhms.com',
                'sent_at' => Carbon::now()->subDays(2)->subHours(4),
                'received_at' => null,
            ],
            [
                'user_id' => null,
                'direction' => 'in',
                'from_email' => 'emma.watson@example.com',
                'to_email' => 'support@grandluxuryhms.com',
                'subject' => 'Re: Executive Conference WiFi Access',
                'body' => 'Connected instantly! Thank you very much for the rapid response.',
                'provider' => 'smtp',
                'provider_message_id' => 'msg-emma-004@example.com',
                'sent_at' => Carbon::now()->subDays(2),
                'received_at' => Carbon::now()->subDays(2),
            ],
        ]);
    }
}
