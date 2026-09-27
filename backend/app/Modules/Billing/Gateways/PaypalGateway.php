<?php

namespace App\Modules\Billing\Gateways;

use App\Modules\Billing\Contracts\PaymentGatewayInterface;
use App\Modules\Billing\DTOs\PaymentSessionData;
use App\Modules\Billing\DTOs\WebhookResult;
use App\Modules\Billing\Models\Invoice;
use Srmklive\PayPal\Services\PayPal as PayPalClient;
use Exception;
use Illuminate\Support\Facades\Log;

class PaypalGateway implements PaymentGatewayInterface
{
    private ?PayPalClient $provider = null;

    public function __construct()
    {
        // Lazy loading credentials to prevent exceptions during boot/testing when keys are missing.
    }

    /**
     * Get or instantiate the PayPal provider with credentials.
     */
    private function getProvider(): PayPalClient
    {
        if ($this->provider === null) {
            $this->provider = new PayPalClient;
            $this->provider->setApiCredentials(self::getConfig());
        }
        return $this->provider;
    }

    /**
     * Get dynamic config array matching srmklive/paypal structure.
     */
    public static function getConfig(): array
    {
        $mode = config('payment.paypal.mode', 'sandbox');
        return [
            'mode'    => $mode,
            'sandbox' => [
                'client_id'     => config('payment.paypal.client_id'),
                'client_secret' => config('payment.paypal.client_secret'),
                'app_id'        => 'APP-80W2841655291391B',
            ],
            'live' => [
                'client_id'     => config('payment.paypal.client_id'),
                'client_secret' => config('payment.paypal.client_secret'),
                'app_id'        => '',
            ],
            'payment_action' => 'Sale',
            'currency'       => 'USD',
            'notify_url'     => '',
            'locale'         => 'en_US',
            'validate_ssl'   => true,
        ];
    }

    public function getName(): string
    {
        return 'paypal';
    }

    /**
     * Creates a PayPal Order and returns the redirect approval link.
     */
    public function createSession(Invoice $invoice, float $amount, string $currency = 'USD'): PaymentSessionData
    {
        $provider = $this->getProvider();
        $provider->getAccessToken();

        $order = $provider->createOrder([
            'intent' => 'CAPTURE',
            'purchase_units' => [
                [
                    'amount' => [
                        'currency_code' => strtoupper($currency),
                        'value' => number_format($amount, 2, '.', ''),
                    ],
                    'description' => "Invoice {$invoice->invoice_number}",
                    'custom_id' => (string) $invoice->id,
                ]
            ],
            'application_context' => [
                'cancel_url' => config('payment.cancel_url') . "?gateway=paypal&invoice_id={$invoice->id}",
                'return_url' => config('payment.success_url') . "?gateway=paypal&invoice_id={$invoice->id}",
            ]
        ]);

        if (isset($order['error'])) {
            throw new Exception("PayPal Error: " . json_encode($order['error']));
        }

        $redirectUrl = '';
        foreach ($order['links'] as $link) {
            if ($link['rel'] === 'approve') {
                $redirectUrl = $link['href'];
                break;
            }
        }

        if (empty($redirectUrl)) {
            throw new Exception("PayPal error: No approval link found in response.");
        }

        return new PaymentSessionData(
            redirectUrl: $redirectUrl,
            sessionId: $order['id'],
            gateway: $this->getName(),
        );
    }

    /**
     * Verify and parse incoming PayPal webhook event.
     */
    public function handleWebhook(string $payload, array $headers): ?WebhookResult
    {
        $data = json_decode($payload, true);
        if (!$data) {
            return null;
        }

        $eventType = $data['event_type'] ?? '';
        $provider = $this->getProvider();

        // Handle CHECKOUT.ORDER.APPROVED (order approved, needs capture)
        if ($eventType === 'CHECKOUT.ORDER.APPROVED') {
            $orderId = $data['resource']['id'];
            $provider->getAccessToken();
            $capture = $provider->capturePaymentOrder($orderId);

            Log::info("PayPal Order Approved & Captured via Webhook", ['order_id' => $orderId, 'capture' => $capture]);

            if (isset($capture['status']) && $capture['status'] === 'COMPLETED') {
                $purchaseUnit = $capture['purchase_units'][0] ?? [];
                $invoiceId = $purchaseUnit['custom_id'] ?? null;
                $amount = $purchaseUnit['payments']['captures'][0]['amount']['value'] ?? 0.0;
                $transactionReference = $purchaseUnit['payments']['captures'][0]['id'] ?? $orderId;

                return new WebhookResult(
                    gateway: $this->getName(),
                    invoiceId: $invoiceId,
                    transactionReference: $transactionReference,
                    amount: (float) $amount,
                    status: 'completed',
                );
            }
        }

        // Handle PAYMENT.CAPTURE.COMPLETED (already captured)
        if ($eventType === 'PAYMENT.CAPTURE.COMPLETED') {
            $resource = $data['resource'] ?? [];
            $orderId = $resource['supplementary_data']['related_ids']['order_id'] ?? null;
            $invoiceId = $resource['custom_id'] ?? null;
            $amount = $resource['amount']['value'] ?? 0.0;
            $transactionReference = $resource['id'] ?? '';

            if (!$invoiceId && $orderId) {
                $provider->getAccessToken();
                $orderDetails = $provider->showOrderDetails($orderId);
                $invoiceId = $orderDetails['purchase_units'][0]['custom_id'] ?? null;
            }

            return new WebhookResult(
                gateway: $this->getName(),
                invoiceId: $invoiceId,
                transactionReference: $transactionReference,
                amount: (float) $amount,
                status: 'completed',
            );
        }

        return null;
    }
}
