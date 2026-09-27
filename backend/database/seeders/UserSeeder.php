<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\Models\Role;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $users = [
            [
                'name' => 'System Administrator',
                'email' => 'admin@hms.com',
                'password' => Hash::make('password'),
                'role' => 'admin',
                'email_verified_at' => now(),
            ],
            [
                'name' => 'Sarah Connor (Hotel Manager)',
                'email' => 'manager@hms.com',
                'password' => Hash::make('password'),
                'role' => 'manager',
                'email_verified_at' => now(),
            ],
            [
                'name' => 'James Wilson (Front Desk Lead)',
                'email' => 'receptionist@hms.com',
                'password' => Hash::make('password'),
                'role' => 'receptionist',
                'email_verified_at' => now(),
            ],
            [
                'name' => 'Emily Davis (Support Specialist)',
                'email' => 'helpdesk@hms.com',
                'password' => Hash::make('password'),
                'role' => 'help_desk',
                'email_verified_at' => now(),
            ],
            [
                'name' => 'David Miller (Housekeeping & Staff)',
                'email' => 'staff@hms.com',
                'password' => Hash::make('password'),
                'role' => 'staff',
                'email_verified_at' => now(),
            ],
            [
                'name' => 'Jane Guest (Loyal Member)',
                'email' => 'guest@hms.com',
                'password' => Hash::make('password'),
                'role' => 'customer',
                'email_verified_at' => now(),
            ],
        ];

        foreach ($users as $userData) {
            $roleName = $userData['role'];
            $user = User::updateOrCreate(
                ['email' => $userData['email']],
                $userData
            );

            // Assign Spatie Role if defined
            if (Role::where('name', $roleName)->exists()) {
                $user->syncRoles([$roleName]);
            }
        }
    }
}
