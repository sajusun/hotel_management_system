<?php

declare(strict_types=1);

namespace App\Modules\Auth\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\UserResource;
use App\Models\User;
use App\Modules\Auth\Models\Verification;
use App\Services\UserService;
use Exception;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use RuntimeException;

class RegisterApiController extends Controller
{
    public function __construct(
        private readonly UserService $userService
    ) {
    }

    public function register(Request $request): JsonResponse
    {
        $request->validate([
            'name'     => ['required', 'string', 'max:100'],
            'email'    => ['required', 'string', 'email', 'max:150', 'unique:users,email'],
            'password' => ['required', 'string', 'min:6', 'confirmed'],
        ]);

        try {
            DB::beginTransaction();

            $user = User::create([
                'name'     => $request->input('name'),
                'email'    => strtolower($request->input('email')),
                'password' => Hash::make($request->input('password')),
                'role'     => 'guest',
            ]);

            // Assign role if Spatie roles are initialized
            if (method_exists($user, 'assignRole')) {
                try {
                    $user->assignRole('guest');
                } catch (\Throwable) {
                    // Ignore if role does not exist in db
                }
            }

            // Send OTP directly via Model's HasVerification trait
            $verification = null;
            if (method_exists($user, 'sendVerification')) {
                $verification = $user->sendVerification(
                    purpose: Verification::PURPOSE_EMAIL_VERIFICATION
                );
            }

            $token = $user->createToken('auth-token')->plainTextToken;

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Registration successful. Please check your email for verification.',
                'token'   => $token,
                'user'    => new UserResource($user),
                'otp'     => $verification?->code,
            ], 201);
        } catch (RuntimeException $e) {
            DB::rollBack();
            Log::error('User registration failed: ' . $e->getMessage());
            return response()->json(['success' => false, 'message' => $e->getMessage()], 422);
        } catch (Exception $e) {
            DB::rollBack();
            Log::error('User registration failed: ' . $e->getMessage());
            return response()->json(['success' => false, 'message' => 'Registration failed: ' . $e->getMessage()], 500);
        }
    }

    public function verifyEmail(Request $request): JsonResponse
    {
        $request->validate([
            'email' => ['required', 'email', 'exists:users,email'],
            'otp'   => ['required', 'string'],
        ]);

        try {
            $user = $this->userService->findByEmail($request->input('email'));
            if (!$user) {
                return response()->json(['success' => false, 'message' => 'Invalid email address'], 404);
            }

            if ($user->isEmailVerified()) {
                return response()->json(['success' => false, 'message' => 'Email is already verified.'], 409);
            }

            $verified = $user->verifyOtp(
                code: (string) $request->input('otp'),
                purpose: Verification::PURPOSE_EMAIL_VERIFICATION
            );

            if (!$verified) {
                return response()->json(['success' => false, 'message' => 'Invalid OTP code. Please try again.'], 422);
            }

            $token = $user->createToken('auth-token')->plainTextToken;

            return response()->json([
                'success' => true,
                'message' => 'Email verified successfully.',
                'token'   => $token,
                'user'    => new UserResource($user),
            ]);
        } catch (RuntimeException $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 422);
        } catch (Exception $e) {
            return response()->json(['success' => false, 'message' => 'Verification failed: ' . $e->getMessage()], 500);
        }
    }

    public function resendOtp(Request $request): JsonResponse
    {
        $request->validate([
            'email' => ['required', 'email', 'exists:users,email'],
        ]);

        try {
            $user = $this->userService->findByEmail($request->input('email'));
            if (!$user) {
                return response()->json(['success' => false, 'message' => 'Invalid email address'], 404);
            }

            if ($user->isEmailVerified()) {
                return response()->json(['success' => false, 'message' => 'Email is already verified.'], 409);
            }

            $verification = $user->resendVerification(
                purpose: Verification::PURPOSE_EMAIL_VERIFICATION
            );

            return response()->json([
                'success'       => true,
                'message'       => 'A new OTP has been sent to your email.',
                'otp'           => $verification->code,
                'expires_at'    => $verification->expires_at?->toIso8601String(),
                'request_count' => $verification->request_count,
            ]);
        } catch (RuntimeException $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 422);
        } catch (Exception $e) {
            return response()->json(['success' => false, 'message' => 'Resend OTP failed: ' . $e->getMessage()], 500);
        }
    }
}
