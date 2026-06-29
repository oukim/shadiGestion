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
 * MASS ASSIGNMENT — Champs protégés
 * ============================================ */

test('Mass Assignment : impossible de créer un produit avec un ID custom', function () {
    $response = $this->withHeaders($this->headers)
        ->postJson('/api/products', [
            'id' => 999999, // tentative
            'name' => 'Test Product',
            'brand' => 'Apple iPhone',
            'category' => 'premium',
            'storage' => '128 Go',
            'price' => 100,
            'stock' => 10,
            'color' => 'Noir',
        ]);

    $response->assertStatus(201);
    expect(Product::find(999999))->toBeNull(); // l'ID custom n'a pas été utilisé
});

test('Mass Assignment : timestamps protégés', function () {
    $product = Product::factory()->create();
    $originalCreatedAt = $product->created_at->toDateTimeString();

    $this->withHeaders($this->headers)
        ->putJson("/api/products/{$product->id}", [
            'name' => 'Updated Name',
            'created_at' => '2000-01-01 00:00:00', // tentative
        ])->assertStatus(200);

    expect($product->fresh()->created_at->toDateTimeString())
        ->toBe($originalCreatedAt);
});

/* ============================================
 * RESSOURCES — Accès à des ID inexistants
 * ============================================ */

test('GET /api/products/{id} inexistant retourne 404', function () {
    $this->withHeaders($this->headers)
        ->getJson('/api/products/999999')
        ->assertStatus(404);
});

test('PUT /api/products/{id} inexistant retourne 404', function () {
    $this->withHeaders($this->headers)
        ->putJson('/api/products/999999', ['name' => 'X'])
        ->assertStatus(404);
});

test('DELETE /api/products/{id} inexistant retourne 404', function () {
    $this->withHeaders($this->headers)
        ->deleteJson('/api/products/999999')
        ->assertStatus(404);
});

test('GET /api/warranties/FAKE retourne 404', function () {
    $this->withHeaders($this->headers)
        ->getJson('/api/warranties/GAR-FAKE-999999')
        ->assertStatus(404);
});

test('POST /api/sales avec product_id inexistant retourne 422', function () {
    $this->withHeaders($this->headers)
        ->postJson('/api/sales', [
            'customer' => ['name' => 'Test'],
            'items' => [
                [
                    'product_id' => 999999,
                    'quantity' => 1,
                    'imeis' => ['123456789012345'],
                ],
            ],
        ])
        ->assertStatus(422)
        ->assertJsonValidationErrors(['items.0.product_id']);
});