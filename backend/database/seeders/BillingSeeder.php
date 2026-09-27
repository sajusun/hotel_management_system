<?php

namespace Database\Seeders;

use App\Modules\Billing\Models\Invoice;
use App\Modules\Billing\Models\InvoiceItem;
use App\Modules\Billing\Models\Payment;
use App\Modules\Reservation\Models\Reservation;
use App\Modules\Shared\Enums\InvoiceStatus;
use App\Modules\Shared\Enums\PaymentStatus;
use Carbon\Carbon;
use Illuminate\Database\Seeder;

class BillingSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $res1 = Reservation::with('stay', 'guest')->where('reference', 'RES-2026-001')->first();
        $res2 = Reservation::with('stay', 'guest')->where('reference', 'RES-2026-002')->first();
        $res3 = Reservation::with('stay', 'guest')->where('reference', 'RES-2026-004')->first();
        $res4 = Reservation::with('stay', 'guest')->where('reference', 'RES-2026-003')->first();

        // ── 1. Paid Invoice for Completed Stay (Sarah Jenkins) ────────────────
        if ($res1 && $res1->stay) {
            $inv1 = Invoice::updateOrCreate(
                ['invoice_number' => 'INV-2026-001'],
                [
                    'stay_id' => $res1->stay->id,
                    'guest_id' => $res1->guest_id,
                    'status' => InvoiceStatus::Paid,
                    'nights' => 4,
                    'room_charges' => 596.00,
                    'service_charges' => 75.00,
                    'tax_amount' => 67.10,
                    'total_amount' => 738.10,
                    'amount_paid' => 738.10,
                    'issued_at' => Carbon::now()->subDays(3)->setTime(10, 00),
                ]
            );

            $inv1->items()->delete();
            $inv1->items()->createMany([
                ['description' => 'Deluxe King Oceanfront (4 Nights @ $149.00)', 'type' => 'room', 'quantity' => 4, 'unit_price' => 149.00, 'total_price' => 596.00],
                ['description' => 'Aromatherapy Herbal Spa Treatment', 'type' => 'service', 'quantity' => 1, 'unit_price' => 75.00, 'total_price' => 75.00],
                ['description' => 'State & Municipal Hospitality Tax (10%)', 'type' => 'tax', 'quantity' => 1, 'unit_price' => 67.10, 'total_price' => 67.10],
            ]);

            Payment::updateOrCreate(
                ['invoice_id' => $inv1->id, 'transaction_reference' => 'ch_3MpZABC1092830182'],
                [
                    'amount' => 738.10,
                    'method' => 'credit_card',
                    'gateway' => 'stripe',
                    'session_id' => 'cs_test_a1b2c3d4e5f6',
                    'status' => PaymentStatus::Completed,
                    'paid_at' => Carbon::now()->subDays(3)->setTime(10, 30),
                ]
            );
        }

        // ── 2. Issued & Partially Paid Invoice (Michael Chen) ────────────────
        if ($res2 && $res2->stay) {
            $inv2 = Invoice::updateOrCreate(
                ['invoice_number' => 'INV-2026-002'],
                [
                    'stay_id' => $res2->stay->id,
                    'guest_id' => $res2->guest_id,
                    'status' => InvoiceStatus::Issued,
                    'nights' => 4,
                    'room_charges' => 996.00,
                    'service_charges' => 120.00,
                    'tax_amount' => 111.60,
                    'total_amount' => 1227.60,
                    'amount_paid' => 500.00,
                    'issued_at' => Carbon::now()->subDays(2)->setTime(15, 30),
                ]
            );

            $inv2->items()->delete();
            $inv2->items()->createMany([
                ['description' => 'Executive Family Suite (4 Nights @ $249.00)', 'type' => 'room', 'quantity' => 4, 'unit_price' => 249.00, 'total_price' => 996.00],
                ['description' => 'Grand Dining Hall - Gourmet Dinner & Wine', 'type' => 'service', 'quantity' => 1, 'unit_price' => 120.00, 'total_price' => 120.00],
                ['description' => 'State & Municipal Hospitality Tax (10%)', 'type' => 'tax', 'quantity' => 1, 'unit_price' => 111.60, 'total_price' => 111.60],
            ]);

            Payment::updateOrCreate(
                ['invoice_id' => $inv2->id, 'transaction_reference' => 'PAYID-MN67890XYZ234'],
                [
                    'amount' => 500.00,
                    'method' => 'paypal',
                    'gateway' => 'paypal',
                    'session_id' => 'paypal_order_987123',
                    'status' => PaymentStatus::Completed,
                    'paid_at' => Carbon::now()->subDays(2)->setTime(16, 00),
                ]
            );
        }

        // ── 3. High-Value Full Payment (Alexander Wright - Presidential Suite) ─
        if ($res3 && $res3->stay) {
            $inv3 = Invoice::updateOrCreate(
                ['invoice_number' => 'INV-2026-003'],
                [
                    'stay_id' => $res3->stay->id,
                    'guest_id' => $res3->guest_id,
                    'status' => InvoiceStatus::Paid,
                    'nights' => 6,
                    'room_charges' => 2994.00,
                    'service_charges' => 250.00,
                    'tax_amount' => 324.40,
                    'total_amount' => 3568.40,
                    'amount_paid' => 3568.40,
                    'issued_at' => Carbon::now()->subDays(3)->setTime(13, 15),
                ]
            );

            $inv3->items()->delete();
            $inv3->items()->createMany([
                ['description' => 'Presidential Royal Suite (6 Nights @ $499.00)', 'type' => 'room', 'quantity' => 6, 'unit_price' => 499.00, 'total_price' => 2994.00],
                ['description' => 'VIP Airport Limousine & Private Concierge', 'type' => 'service', 'quantity' => 1, 'unit_price' => 250.00, 'total_price' => 250.00],
                ['description' => 'State & Municipal Hospitality Tax (10%)', 'type' => 'tax', 'quantity' => 1, 'unit_price' => 324.40, 'total_price' => 324.40],
            ]);

            Payment::updateOrCreate(
                ['invoice_id' => $inv3->id, 'transaction_reference' => 'ch_3MpZPRESIDENTIAL998'],
                [
                    'amount' => 3568.40,
                    'method' => 'credit_card',
                    'gateway' => 'stripe',
                    'session_id' => 'cs_test_presidential_suite',
                    'status' => PaymentStatus::Completed,
                    'paid_at' => Carbon::now()->subDays(3)->setTime(13, 45),
                ]
            );
        }

        // ── 4. Draft Invoice (Emma Watson) ──────────────────────────────────
        if ($res4 && $res4->stay) {
            $inv4 = Invoice::updateOrCreate(
                ['invoice_number' => 'INV-2026-004'],
                [
                    'stay_id' => $res4->stay->id,
                    'guest_id' => $res4->guest_id,
                    'status' => InvoiceStatus::Draft,
                    'nights' => 2,
                    'room_charges' => 178.00,
                    'service_charges' => 25.00,
                    'tax_amount' => 20.30,
                    'total_amount' => 223.30,
                    'amount_paid' => 0.00,
                    'issued_at' => null,
                ]
            );

            $inv4->items()->delete();
            $inv4->items()->createMany([
                ['description' => 'Standard Queen Room (2 Nights @ $89.00)', 'type' => 'room', 'quantity' => 2, 'unit_price' => 89.00, 'total_price' => 178.00],
                ['description' => 'Artisan Continental Breakfast Buffet', 'type' => 'service', 'quantity' => 1, 'unit_price' => 25.00, 'total_price' => 25.00],
                ['description' => 'State & Municipal Hospitality Tax (10%)', 'type' => 'tax', 'quantity' => 1, 'unit_price' => 20.30, 'total_price' => 20.30],
            ]);
        }
    }
}
