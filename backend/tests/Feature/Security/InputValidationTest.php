<?php

declare(strict_types=1);

use App\Models\Product;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->user = User::factory()->create(['role' => 'admin']);
    $this->token = $this->user->createToken('test')->plainTextToken;
    $this->headers = [
        'Authorization' => "Bearer {$this->token}",
        'Accept' => 'application/json',
    ];
});

/* ============================================
 * PRODUITS — Validations
 * ============================================ */

test('produit : prix négatif refusé', function () {
    $this->withHeaders($this->headers)
        ->postJson('/api/products', [
            'name' => 'Test', 'brand' => 'Apple iPhone', 'category' => 'premium',
            'storage' => '128 Go', 'price' => -100, 'stock' => 10, 'color' => 'Noir',
        ])->assertStatus(422)->assertJsonValidationErrors(['price']);
});

test('produit : stock négatif refusé', function () {
    $this->withHeaders($this->headers)
        ->postJson('/api/products', [
            'name' => 'Test', 'brand' => 'Apple iPhone', 'category' => 'premium',
            'storage' => '128 Go', 'price' => 100, 'stock' => -5, 'color' => 'Noir',
        ])->assertStatus(422)->assertJsonValidationErrors(['stock']);
});

test('produit : prix exorbitant refusé', function () {
    $this->withHeaders($this->headers)
        ->postJson('/api/products', [
            'name' => 'Test', 'brand' => 'Apple iPhone', 'category' => 'premium',
            'storage' => '128 Go', 'price' => 99999999999, 'stock' => 10, 'color' => 'Noir',
        ])->assertStatus(422)->assertJsonValidationErrors(['price']);
});

test('produit : marque hors liste refusée', function () {
    $this->withHeaders($this->headers)
        ->postJson('/api/products', [
            'name' => 'Test', 'brand' => 'Google', 'category' => 'premium',
            'storage' => '128 Go', 'price' => 100, 'stock' => 10, 'color' => 'Noir',
        ])->assertStatus(422)->assertJsonValidationErrors(['brand']);
});

test('produit : catégorie inconnue refusée', function () {
    $this->withHeaders($this->headers)
        ->postJson('/api/products', [
            'name' => 'Test', 'brand' => 'Samsung', 'category' => 'evil',
            'storage' => '128 Go', 'price' => 100, 'stock' => 10, 'color' => 'Noir',
        ])->assertStatus(422)->assertJsonValidationErrors(['category']);
});

test('produit : nom vide refusé', function () {
    $this->withHeaders($this->headers)
        ->postJson('/api/products', [
            'name' => '', 'brand' => 'Apple iPhone', 'category' => 'premium',
            'storage' => '128 Go', 'price' => 100, 'stock' => 10, 'color' => 'Noir',
        ])->assertStatus(422)->assertJsonValidationErrors(['name']);
});

test('produit : XSS dans le nom est stocké tel quel (échappé à l\'affichage)', function () {
    $payload = '<script>alert("xss")</script>';

    $response = $this->withHeaders($this->headers)
        ->postJson('/api/products', [
            'name' => $payload, 'brand' => 'Apple iPhone', 'category' => 'premium',
            'storage' => '128 Go', 'price' => 100, 'stock' => 10, 'color' => 'Noir',
        ]);

    $response->assertStatus(201);
    // Laravel renvoie le contenu en JSON, le navigateur ne l'exécutera pas
    expect($response->json('data.name'))->toBe($payload);
});

/* ============================================
 * VENTES — Validations
 * ============================================ */

test('vente : sans items refusée', function () {
    $this->withHeaders($this->headers)
        ->postJson('/api/sales', [
            'customer' => ['name' => 'Test'],
            'items' => [],
        ])->assertStatus(422)->assertJsonValidationErrors(['items']);
});

test('vente : sans nom client refusée', function () {
    $product = Product::factory()->create(['stock' => 10]);

    $this->withHeaders($this->headers)
        ->postJson('/api/sales', [
            'customer' => [],
            'items' => [
                ['product_id' => $product->id, 'quantity' => 1, 'imeis' => ['123456789012345']],
            ],
        ])->assertStatus(422)->assertJsonValidationErrors(['customer.name']);
});

test('vente : email mal formé refusé', function () {
    $product = Product::factory()->create(['stock' => 10]);

    $this->withHeaders($this->headers)
        ->postJson('/api/sales', [
            'customer' => ['name' => 'Test', 'email' => 'pas-un-email'],
            'items' => [
                ['product_id' => $product->id, 'quantity' => 1, 'imeis' => ['123456789012345']],
            ],
        ])->assertStatus(422)->assertJsonValidationErrors(['customer.email']);
});

test('vente : quantité 0 refusée', function () {
    $product = Product::factory()->create(['stock' => 10]);

    $this->withHeaders($this->headers)
        ->postJson('/api/sales', [
            'customer' => ['name' => 'Test'],
            'items' => [
                ['product_id' => $product->id, 'quantity' => 0, 'imeis' => []],
            ],
        ])->assertStatus(422);
});

test('vente : taux de TVA négatif refusé', function () {
    $product = Product::factory()->create(['stock' => 10]);

    $this->withHeaders($this->headers)
        ->postJson('/api/sales', [
            'customer' => ['name' => 'Test'],
            'items' => [
                ['product_id' => $product->id, 'quantity' => 1, 'imeis' => ['123456789012345']],
            ],
            'tax_rate' => -10,
        ])->assertStatus(422)->assertJsonValidationErrors(['tax_rate']);
});

test('vente : taux de TVA > 100 refusé', function () {
    $product = Product::factory()->create(['stock' => 10]);

    $this->withHeaders($this->headers)
        ->postJson('/api/sales', [
            'customer' => ['name' => 'Test'],
            'items' => [
                ['product_id' => $product->id, 'quantity' => 1, 'imeis' => ['123456789012345']],
            ],
            'tax_rate' => 150,
        ])->assertStatus(422)->assertJsonValidationErrors(['tax_rate']);
});

test('vente : IMEI avec lettres refusé', function () {
    $product = Product::factory()->create(['stock' => 10]);

    $this->withHeaders($this->headers)
        ->postJson('/api/sales', [
            'customer' => ['name' => 'Test'],
            'items' => [
                ['product_id' => $product->id, 'quantity' => 1, 'imeis' => ['ABC123456789012']],
            ],
        ])->assertStatus(422);
});

test('vente : IMEI moins de 15 chiffres refusé', function () {
    $product = Product::factory()->create(['stock' => 10]);

    $this->withHeaders($this->headers)
        ->postJson('/api/sales', [
            'customer' => ['name' => 'Test'],
            'items' => [
                ['product_id' => $product->id, 'quantity' => 1, 'imeis' => ['12345']],
            ],
        ])->assertStatus(422);
});