<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\CustomerProfile;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // 1. Create Admin User
        User::create([
            'name' => 'Super Admin',
            'email' => 'admin@tigatitik.com',
            'password' => Hash::make('password'),
            'role' => 'admin',
        ]);

        // 2. Create Customer User
        $customer = User::create([
            'name' => 'Budi Santoso',
            'email' => 'customer@tigatitik.com',
            'password' => Hash::make('password'),
            'role' => 'customer',
        ]);

        // 3. Create Profile for Customer
        CustomerProfile::create([
            'user_id' => $customer->id,
            'phone_number' => '081234567890',
            'address' => 'Jl. Merdeka No. 45, Bandung',
            'identity_card_number' => '3273012345670001',
        ]);
        // 4. Create Settings
        $this->call([
            SettingSeeder::class,
        ]);
    }
}
