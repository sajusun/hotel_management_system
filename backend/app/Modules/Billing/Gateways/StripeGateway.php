<?php

namespace App\Modules\Billing\Gateways;

use App\Modules\Billing\Contracts\PaymentGatewayInterface;
use App\Modules\Billing\DTOs\PaymentSessionData;
use App\Modules\Billing\DTOs\WebhookResult;
use App\Modules\Billing\Models\Invoice;
use Stripe\Checkout\Session;
use Stripe\Stripe;
use Stripe\Webhook;

class StripeGateway implements PaymentGatewayInterface
{
    public function __construct()
    {
        Stripe::setApiKey(config('payment.stripe.secret'));
    }

    public function getName(): string
    {
        return 'stripe';
    }

    /**
     * Creates a Stripe Checkout hosted session and returns the redirect URL.
     */
    public function createSession(Invoice $invoice, float $amount, string $currency = 'USD'): PaymentSessionData
    {
        $invoice->loadMissing('guest');

        $session = Session::create([
            'payment_method_types' => ['card'],
            'mode'                 => 'payment',
            'customer_email'       => $invoice->guest?->email,
            'line_items'           => [
                [
                    'price_data' => [
                        'currency'     => strtolower($currency),
                        'unit_amount'  => (int) round($amount * 100), // cents
                        'product_data' => [
                            'name'        => "Invoice {$invoice->invoice_number}",
                            'description' => "Payment for stay — {$invoice->nights} night(s)",
                        ],
                    ],
                    'quantity' => 1,
                ],
            ],
            'metadata' => [
                'invoice_id'     => $invoice->id,
                'invoice_number' => $invoice->invoice_number,
            ],
            'success_url' => config('payment.success_url') . "?session_id={CHECKOUT_SESSION_ID}&gateway=stripe",
            'cancel_url'  => config('payment.cancel_url') . "?gateway=stripe",
        ]);

        return new PaymentSessionData(
            redirectUrl: $session->url,
            sessionId: $session->id,
            gateway: $this->getName(),
        );
    }

    /**
     * Verify the Stripe webhook signature and extract payment data.
     */
    public function handleWebhook(string $payload, array $headers): ?WebhookResult
    {
        $secret = config('payment.stripe.webhook_secret');
        $sigHeader = $headers['stripe-signature'] ?? '';

        $event = Webhook::constructEvent($payload, $sigHeader, $secret);

        if ($event->type !== 'checkout.session.completed') {
            return null;
        }

        /** @var \Stripe\Checkout\Session $session */
        $session = $event->data->object;

        if ($session->payment_status !== 'paid') {
            return null;
        }

        return new WebhookResult(
            gateway: $this->getName(),
            invoiceId: $session->metadata->invoice_id,
            transactionReference: $session->payment_intent ?? $session->id,
            amount: $session->amount_total / 100,
            status: 'completed',
        );
    }
}
