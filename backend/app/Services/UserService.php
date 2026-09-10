<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\User;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class UserService
{
    public function findByEmail(string $email): ?User
    {
        return User::where('email', strtolower($email))->first();
    }

    public function findById(int $id): ?User
    {
        return User::find($id);
    }

    public function updatePassword(User $user, string $password): bool
    {
        return $user->update([
            'password' => Hash::make($password),
        ]);
    }

    public function createPasswordResetToken(User $user): string
    {
        $token = Str::random(60);

        DB::table('password_reset_tokens')->updateOrInsert(
            ['email' => $user->email],
            [
                'email'      => $user->email,
                'token'      => Hash::make($token),
                'created_at' => Carbon::now(),
            ]
        );

        return $token;
    }

    public function getResetTokenUser(string $token, string $email): ?object
    {
        $record = DB::table('password_reset_tokens')->where('email', $email)->first();

        if (!$record || !Hash::check($token, $record->token)) {
            return null;
        }

        return $record;
    }

    public function isTokenValid(object $tokenData): bool
    {
        $expiresAt = Carbon::parse($tokenData->created_at)->addMinutes(60);
        return Carbon::now()->lessThanOrEqualTo($expiresAt);
    }

    public function revokePasswordToken(User $user): void
    {
        DB::table('password_reset_tokens')->where('email', $user->email)->delete();
    }
}
