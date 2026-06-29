<?php

namespace Database\Factories;

use App\Models\Product;
use Illuminate\Database\Eloquent\Factories\Factory;

class ProductFactory extends Factory
{
    protected $model = Product::class;

    public function definition(): array
    {
        $brands = ['Apple iPhone', 'Samsung', 'Oppo', 'Xiaomi'];
        $storages = ['64 Go', '128 Go', '256 Go', '512 Go'];
        $colors = ['Noir', 'Blanc', 'Bleu', 'Rouge', 'Gris'];
        $categories = ['premium', 'midrange', 'entry'];

        return [
            'name' => fake()->words(2, true),
            'brand' => fake()->randomElement($brands),
            'category' => fake()->randomElement($categories),
            'storage' => fake()->randomElement($storages),
            'price' => fake()->randomFloat(2, 100, 15000),
            'stock' => fake()->numberBetween(0, 50),
            'color' => fake()->randomElement($colors),
            'description' => fake()->sentence(),
            'is_new' => fake()->boolean(),
        ];
    }
}