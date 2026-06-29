<?php

namespace Database\Seeders;

use App\Models\Product;
use Illuminate\Database\Seeder;

class ProductSeeder extends Seeder
{
    public function run(): void
    {
        $products = [
            [
                'name' => 'iPhone 15 Pro',
                'brand' => 'Apple iPhone',
                'category' => 'premium',
                'storage' => '256 Go',
                'color' => 'Titane naturel',
                'price' => 12499.00,
                'stock' => 8,
                'is_new' => true,
                'description' => 'Le smartphone Apple le plus avancé avec puce A17 Pro.',
            ],
            [
                'name' => 'iPhone 14',
                'brand' => 'Apple iPhone',
                'category' => 'midrange',
                'storage' => '128 Go',
                'color' => 'Bleu',
                'price' => 8990.00,
                'stock' => 12,
                'is_new' => false,
                'description' => 'Performances solides et excellent écran OLED.',
            ],
            [
                'name' => 'Galaxy S24 Ultra',
                'brand' => 'Samsung',
                'category' => 'premium',
                'storage' => '512 Go',
                'color' => 'Titane',
                'price' => 13990.00,
                'stock' => 6,
                'is_new' => true,
                'description' => 'Flagship Samsung avec S Pen intégré.',
            ],
            [
                'name' => 'Galaxy A55',
                'brand' => 'Samsung',
                'category' => 'midrange',
                'storage' => '256 Go',
                'color' => 'Bleu nuit',
                'price' => 4990.00,
                'stock' => 20,
                'is_new' => false,
                'description' => 'Excellent rapport qualité/prix avec écran AMOLED.',
            ],
            [
                'name' => 'Reno 11 Pro',
                'brand' => 'Oppo',
                'category' => 'midrange',
                'storage' => '256 Go',
                'color' => 'Vert menthe',
                'price' => 5490.00,
                'stock' => 14,
                'is_new' => true,
                'description' => 'Design élégant et photo portrait professionnel.',
            ],
            [
                'name' => 'Redmi Note 13',
                'brand' => 'Xiaomi',
                'category' => 'entry',
                'storage' => '128 Go',
                'color' => 'Noir',
                'price' => 2290.00,
                'stock' => 30,
                'is_new' => false,
                'description' => 'Le best-seller abordable avec une grosse batterie.',
            ],
        ];

        foreach ($products as $product) {
            Product::create($product);
        }
    }
}