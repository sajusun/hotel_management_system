<?php

declare(strict_types=1);

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class VerificationLinkMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public string $token,
        public string $purpose = 'email_verification'
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(subject: 'Verify Your Email - Grand Luxury Hotel');
    }

    public function content(): Content
    {
        $verifyUrl = url("/api/v1/auth/verification/verify-token?token={$this->token}&purpose={$this->purpose}");

        return new Content(
            htmlString: "
                <div style='font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;'>
                    <h2 style='color: #1e293b; margin-bottom: 8px;'>Grand Luxury Hotel</h2>
                    <p style='color: #475569; font-size: 15px;'>Hello,</p>
                    <p style='color: #475569; font-size: 15px;'>Please click the button below to verify your email address:</p>
                    <div style='text-align: center; margin: 25px 0;'>
                        <a href='{$verifyUrl}' style='background: #4338ca; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;'>Verify Email Address</a>
                    </div>
                    <p style='color: #64748b; font-size: 13px;'>If the button doesn't work, copy and paste this URL into your browser:<br>{$verifyUrl}</p>
                </div>
            "
        );
    }

    public function attachments(): array
    {
        return [];
    }
}
