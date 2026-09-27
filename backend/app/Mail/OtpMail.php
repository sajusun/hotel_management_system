<?php

declare(strict_types=1);

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class OtpMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public string $code,
        public string $purpose = 'Verification'
    ) {}

    public function envelope(): Envelope
    {
        $subject = match ($this->purpose) {
            'password_reset'     => 'Your Password Reset OTP - Grand Luxury Hotel',
            'email_verification' => 'Verify Your Email Address - Grand Luxury Hotel',
            default              => 'Your Verification Code - Grand Luxury Hotel',
        };

        return new Envelope(subject: $subject);
    }

    public function content(): Content
    {
        return new Content(
            htmlString: "
                <div style='font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;'>
                    <h2 style='color: #1e293b; margin-bottom: 8px;'>Grand Luxury Hotel</h2>
                    <p style='color: #475569; font-size: 15px;'>Hello,</p>
                    <p style='color: #475569; font-size: 15px;'>Your verification code for <strong>{$this->purpose}</strong> is:</p>
                    <div style='background: #f1f5f9; padding: 16px; font-size: 28px; font-weight: bold; letter-spacing: 6px; text-align: center; color: #4338ca; border-radius: 6px; margin: 20px 0;'>
                        {$this->code}
                    </div>
                    <p style='color: #64748b; font-size: 13px;'>This code is valid for 15 minutes. If you did not request this, please ignore this email.</p>
                </div>
            "
        );
    }

    public function attachments(): array
    {
        return [];
    }
}
