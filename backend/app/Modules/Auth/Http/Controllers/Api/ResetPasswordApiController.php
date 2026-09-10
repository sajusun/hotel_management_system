<?php

declare(strict_types=1);

namespace App\Modules\Auth\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Modules\Auth\Models\Verification;
use App\Services\UserService;
use Exception;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ResetPasswordApiController extends Controller
{
    public function __construct(private readonly UserService $userService)
    {
    }

    public function forgotPassword(Request $request): JsonResponse
    {
        $request->validate([
            'email' => 'required|email|exists:users,email',
        ]);

        try {
            $user = $this->userService->findByEmail($request->input('email'));

            if (!$user) {
                return response()->json(['success' => false, 'message' => 'Invalid email address'], 404);
            }

            $verification = $user->sendVerification(
                purpose: Verification::PURPOSE_PASSWORD_RESET
            );

            return response()->json([
                'success' => true,
                'message' => 'Password reset code sent. Please check your email.',
                'otp'     => $verification->code,
            ], 200);
        } catch (Exception $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }

    public function resetSecretKey(Request $request): JsonResponse
    {
        $request->validate([
            'email' => 'required|email|exists:users,email',
            'otp'   => 'required|string',
        ]);

        try {
            $user = $this->userService->findByEmail($request->email);

            if (!$user) {
                return response()->json(['success' => false, 'message' => 'User not found'], 404);
            }

            $verified = $user->verifyOtp(
                code: (string) $request->input('otp'),
                purpose: Verification::PURPOSE_PASSWORD_RESET
            );

            if (!$verified) {
                return response()->json(['success' => false, 'message' => 'Invalid OTP code'], 400);
            }

            $token = $this->userService->createPasswordResetToken($user);

            return response()->json([
                'success'    => true,
                'message'    => 'OTP verified successfully.',
                'secret_key' => $token,
            ], 200);
        } catch (Exception $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }

    public function resetPassword(Request $request): JsonResponse
    {
        $request->validate([
            'email'      => 'required|email|exists:users,email',
            'secret_key' => 'required|string',
            'password'   => 'required|string|min:6|confirmed',
        ]);

        try {
            $user = $this->userService->findByEmail($request->email);

            if (!$user) {
                return response()->json(['success' => false, 'message' => 'User not found'], 404);
            }

            $tokenData = $this->userService->getResetTokenUser($request->secret_key, $request->email);
            if (!$tokenData) {
                return response()->json(['success' => false, 'message' => 'Invalid or expired secret key'], 419);
            }

            if (!$this->userService->isTokenValid($tokenData)) {
                return response()->json(['success' => false, 'message' => 'Secret key has expired'], 419);
            }

            $this->userService->updatePassword($user, $request->password);
            $this->userService->revokePasswordToken($user);

            return response()->json([
                'success' => true,
                'message' => 'Password reset successfully. You can now login with your new password.',
            ], 200);
        } catch (Exception $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }
}
