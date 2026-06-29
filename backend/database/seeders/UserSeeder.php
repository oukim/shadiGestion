<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        // Mot de passe initial fort - à communiquer au client
        // Le client devra le changer dès la première connexion
        $initialPassword = 'ShadiPhone@2026!';

        User::updateOrCreate(
            ['email' => 'admin@shadi-phone.local'],
            [
                'name' => 'Admin Shadi Phone',
                'email' => 'admin@shadi-phone.local',
                'password' => Hash::make($initialPassword),
                'role' => 'admin',
                'must_change_password' => true,
                'email_verified_at' => now(),
            ]
        );

        $this->command->info('✅ Compte admin créé');
        $this->command->info('   Email    : admin@shadi-phone.local');
        $this->command->info('   Password : ' . $initialPassword);
        $this->command->warn('   ⚠️ Le client devra changer ce mot de passe au 1er login');
    }
}