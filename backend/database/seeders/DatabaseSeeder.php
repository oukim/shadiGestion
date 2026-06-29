<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Models\Product;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // Admin user
        User::create([
            'name' => 'Shadi Khalid',
            'email' => 'admin@shadi-phone.com',
            'password' => Hash::make('password'),
            'role' => 'admin',
        ]);

        // Vendeur de test
        User::create([
            'name' => 'Sara Vendeuse',
            'email' => 'sara@shadi-phone.com',
            'password' => Hash::make('password'),
            'role' => 'seller',
        ]);

        // Catalogue de produits
        $products = [
            [
                'name' => 'Aurora X1 Pro',
                'brand' => 'Aurora',
                'category' => 'premium',
                'storage' => '256 Go',
                'price' => 1249.00,
                'stock' => 42,
                'color' => '#1E3A8A',
                'description' => 'Écran 6.7" OLED · Puce A18 Bionic · Triple capteur 48 Mpx · Batterie 4500 mAh',
                'is_new' => true,
            ],
            [
                'name' => 'Nebula Edge 5G',
                'brand' => 'Nebula',
                'category' => 'midrange',
                'storage' => '128 Go',
                'price' => 849.00,
                'stock' => 67,
                'color' => '#312E81',
                'description' => 'AMOLED 120Hz · Snapdragon 7 Gen 2 · Triple caméra · 5G',
                'is_new' => false,
            ],
            [
                'name' => 'Vortex Mini',
                'brand' => 'Vortex',
                'category' => 'entry',
                'storage' => '64 Go',
                'price' => 399.00,
                'stock' => 8,
                'color' => '#7C2D12',
                'description' => 'Compact 5.4" · Idéal pour usage quotidien · Batterie longue durée',
                'is_new' => false,
            ],
            [
                'name' => 'Stellar Lite',
                'brand' => 'Stellar',
                'category' => 'midrange',
                'storage' => '128 Go',
                'price' => 549.00,
                'stock' => 124,
                'color' => '#064E3B',
                'description' => 'Triple capteur photo · Charge rapide 65W · Écran 6.5" FHD+',
                'is_new' => false,
            ],
            [
                'name' => 'Quantum Fold 5G',
                'brand' => 'Quantum',
                'category' => 'premium',
                'storage' => '512 Go',
                'price' => 1899.00,
                'stock' => 23,
                'color' => '#581C87',
                'description' => 'Écran pliable 7.6" · Snapdragon 8 Gen 3 · Triple caméra 50 Mpx',
                'is_new' => true,
            ],
            [
                'name' => 'Pulse Classic',
                'brand' => 'Pulse',
                'category' => 'entry',
                'storage' => '64 Go',
                'price' => 299.00,
                'stock' => 0,
                'color' => '#374151',
                'description' => 'Téléphone classique fiable · Batterie longue durée',
                'is_new' => false,
            ],
        ];

        foreach ($products as $product) {
            Product::create($product);
        }

        $this->command->info('✅ Seeder terminé : 2 utilisateurs + 6 produits créés');
    }
}