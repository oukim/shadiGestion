<?php

declare(strict_types=1);

use App\Models\Product;
use App\Models\Sale;
use App\Models\SaleItem;
use App\Models\User;
use App\Models\Warranty;
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
 * PROTECTION DU STOCK (CRITIQUE)
 * ============================================ */

test('CRITIQUE : impossible de vendre plus que le stock', function () {
    $product = Product::factory()->create(['stock' => 5, 'price' => 100]);

    $this->withHeaders($this->headers)
        ->postJson('/api/sales', [
            'customer' => ['name' => 'Test'],
            'items' => [[
                'product_id' => $product->id,
                'quantity' => 10,
                'imeis' => array_map(fn($i) => str_pad((string) $i, 15, '0', STR_PAD_LEFT), range(1, 10)),
            ]],
        ])->assertStatus(422);

    expect($product->fresh()->stock)->toBe(5);
});

test('CRITIQUE : impossible de vendre un produit en rupture', function () {
    $product = Product::factory()->create(['stock' => 0, 'price' => 100]);

    $this->withHeaders($this->headers)
        ->postJson('/api/sales', [
            'customer' => ['name' => 'Test'],
            'items' => [[
                'product_id' => $product->id,
                'quantity' => 1,
                'imeis' => ['123456789012345'],
            ]],
        ])->assertStatus(422);

    expect($product->fresh()->stock)->toBe(0);
});

test('le stock est décrémenté après une vente réussie', function () {
    $product = Product::factory()->create(['stock' => 10, 'price' => 100]);

    $this->withHeaders($this->headers)
        ->postJson('/api/sales', [
            'customer' => ['name' => 'Lina M.'],
            'items' => [[
                'product_id' => $product->id,
                'quantity' => 3,
                'imeis' => ['111111111111111', '222222222222222', '333333333333333'],
            ]],
        ])->assertStatus(201);

    expect($product->fresh()->stock)->toBe(7);
});

test('CRITIQUE : transaction atomique — si une partie échoue, rien n\'est modifié', function () {
    $product1 = Product::factory()->create(['stock' => 10, 'price' => 100]);
    $product2 = Product::factory()->create(['stock' => 1, 'price' => 200]);

    // Tentative : produit 1 OK, produit 2 KO (qty 5 vs stock 1)
    $this->withHeaders($this->headers)
        ->postJson('/api/sales', [
            'customer' => ['name' => 'Test'],
            'items' => [
                [
                    'product_id' => $product1->id,
                    'quantity' => 2,
                    'imeis' => ['111111111111111', '222222222222222'],
                ],
                [
                    'product_id' => $product2->id,
                    'quantity' => 5,
                    'imeis' => array_map(fn($i) => str_pad((string) $i, 15, '9', STR_PAD_LEFT), range(1, 5)),
                ],
            ],
        ])->assertStatus(422);

    // Aucun des deux stocks n'a bougé
    expect($product1->fresh()->stock)->toBe(10);
    expect($product2->fresh()->stock)->toBe(1);
    expect(Sale::count())->toBe(0);
});

/* ============================================
 * INTÉGRITÉ DU PRIX (CRITIQUE)
 * ============================================ */

test('CRITIQUE : le prix utilisé est celui du produit, pas celui envoyé par le client', function () {
    $product = Product::factory()->create(['stock' => 10, 'price' => 1000]);

    $this->withHeaders($this->headers)
        ->postJson('/api/sales', [
            'customer' => ['name' => 'Test'],
            'items' => [[
                'product_id' => $product->id,
                'quantity' => 1,
                'imeis' => ['123456789012345'],
            ]],
            'price' => 1,        // tentative : prix manipulé
            'subtotal' => 1,     // tentative
            'total' => 1,        // tentative
        ])->assertStatus(201);

    // Le prix réel est bien utilisé
    $sale = Sale::first();
    expect((float) $sale->subtotal)->toBe(1000.0);
});

/* ============================================
 * IMEI — Unicité bullet-proof
 * ============================================ */

test('CRITIQUE : impossible d\'avoir 2 IMEI identiques dans la même vente', function () {
    $product = Product::factory()->create(['stock' => 10, 'price' => 100]);

    $this->withHeaders($this->headers)
        ->postJson('/api/sales', [
            'customer' => ['name' => 'Test'],
            'items' => [[
                'product_id' => $product->id,
                'quantity' => 2,
                'imeis' => ['111111111111111', '111111111111111'], // doublons
            ]],
        ])->assertStatus(422);
});

test('CRITIQUE : impossible de réutiliser un IMEI déjà vendu', function () {
    $product = Product::factory()->create(['stock' => 10, 'price' => 100]);

    // Première vente
    $this->withHeaders($this->headers)
        ->postJson('/api/sales', [
            'customer' => ['name' => 'Client 1'],
            'items' => [[
                'product_id' => $product->id,
                'quantity' => 1,
                'imeis' => ['111111111111111'],
            ]],
        ])->assertStatus(201);

    // Tentative de réutiliser le même IMEI
    $this->withHeaders($this->headers)
        ->postJson('/api/sales', [
            'customer' => ['name' => 'Client 2'],
            'items' => [[
                'product_id' => $product->id,
                'quantity' => 1,
                'imeis' => ['111111111111111'],
            ]],
        ])->assertStatus(422);
});

/* ============================================
 * GARANTIE — Génération automatique
 * ============================================ */

test('un bon de garantie est créé automatiquement', function () {
    $product = Product::factory()->create(['stock' => 10, 'price' => 100]);

    $this->withHeaders($this->headers)
        ->postJson('/api/sales', [
            'customer' => ['name' => 'Test'],
            'items' => [[
                'product_id' => $product->id,
                'quantity' => 1,
                'imeis' => ['123456789012345'],
            ]],
        ])->assertStatus(201);

    $sale = Sale::first();
    $warranty = Warranty::where('sale_id', $sale->id)->first();

    expect($warranty)->not->toBeNull();
    expect($warranty->warranty_number)->toMatch('/^GAR-\d{4}-\d{6}$/');
    expect($warranty->duration_months)->toBe(3); // 3 mois pour Shadi Phone
});

test('les numéros de garantie sont uniques', function () {
    $product = Product::factory()->create(['stock' => 100, 'price' => 100]);

    for ($i = 0; $i < 5; $i++) {
        $imei = str_pad((string) ($i + 1), 15, '0', STR_PAD_LEFT);
        $this->withHeaders($this->headers)
            ->postJson('/api/sales', [
                'customer' => ['name' => "Client {$i}"],
                'items' => [[
                    'product_id' => $product->id,
                    'quantity' => 1,
                    'imeis' => [$imei],
                ]],
            ])->assertStatus(201);
    }

    $numbers = Warranty::pluck('warranty_number')->toArray();
    expect($numbers)->toHaveCount(5);
    expect(array_unique($numbers))->toHaveCount(5);
});

/* ============================================
 * TVA — Calculs
 * ============================================ */

test('TVA par défaut à 20%', function () {
    $product = Product::factory()->create(['stock' => 10, 'price' => 1000]);

    $response = $this->withHeaders($this->headers)
        ->postJson('/api/sales', [
            'customer' => ['name' => 'Test'],
            'items' => [[
                'product_id' => $product->id,
                'quantity' => 1,
                'imeis' => ['123456789012345'],
            ]],
        ]);

    $sale = $response->json('data');
    expect((float) $sale['tax_rate'])->toBe(20.0);
    expect((float) $sale['tax'])->toBe(200.0);
    expect((float) $sale['total'])->toBe(1200.0);
});

test('TVA désactivée avec apply_tax = false', function () {
    $product = Product::factory()->create(['stock' => 10, 'price' => 1000]);

    $response = $this->withHeaders($this->headers)
        ->postJson('/api/sales', [
            'customer' => ['name' => 'Test'],
            'items' => [[
                'product_id' => $product->id,
                'quantity' => 1,
                'imeis' => ['123456789012345'],
            ]],
            'apply_tax' => false,
        ]);

    $sale = $response->json('data');
    expect((float) $sale['tax_rate'])->toBe(0.0);
    expect((float) $sale['total'])->toBe(1000.0);
});