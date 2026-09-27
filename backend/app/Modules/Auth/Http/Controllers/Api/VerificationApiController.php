<?php

declare(strict_types=1);

namespace App\Modules\Auth\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\UserResource;
use App\Modules\Auth\Services\VerificationService;
use Exception;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use RuntimeException;

class VerificationApiController extends Controller
{
    public function __construct(private readonly VerificationService $verificationService)
    {
    }

    public function verifyToken(Request $request)
    {
        $request->validate([
            'token'   => 'required|string',
            'purpose' => 'required|string',
        ]);

        $redirectUrl = $this->verificationService->verifyToken(
            $request->input('purpose'),
            $request->input('token')
        );

        return redirect()->to($redirectUrl);
    }

    public function send(Request $request): JsonResponse
    {
        $user = $request->user();
        if (!$user) {
            return response()->json(['success' => false, 'message' => 'Unauthenticated'], 401);
        }

        try {
            $verification = $this->verificationService->send(
                $user,
                $request->input('purpose', 'email_verification'),
                $request->input('type', 'otp'),
                $request->input('channel', 'email')
            );

            return response()->json([
                'success' => true,
                'message' => 'Verification code sent.',
                'otp'     => $verification->code,
            ]);
        } catch (RuntimeException $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 422);
        } catch (Exception $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }

    public function verifyOtp(Request $request): JsonResponse
    {
        $request->validate([
            'otp'     => 'required|string',
            'purpose' => 'nullable|string',
        ]);

        $user = $request->user();
        if (!$user) {
            return response()->json(['success' => false, 'message' => 'Unauthenticated'], 401);
        }

        try {
            $purpose = $request->input('purpose', 'email_verification');
            $verified = $this->verificationService->verifyOtp($user, $purpose, $request->input('otp'));

            if (!$verified) {
                return response()->json(['success' => false, 'message' => 'Invalid OTP code.'], 422);
            }

            return response()->json([
                'success' => true,
                'message' => 'Verification successful.',
                'user'    => new UserResource($user->fresh()),
            ]);
        } catch (RuntimeException $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 422);
        } catch (Exception $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }
}
