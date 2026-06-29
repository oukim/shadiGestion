<?php

declare(strict_types=1);

use App\Models\Product;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->user = User::factory()->create([
        'password' => bcrypt('secret_password_xyz_123'),
        'role' => 'admin',
    ]);
    $this->token = $this->user->createToken('test')->plainTextToken;
    $this->headers = [
        'Authorization' => "Bearer {$this->token}",
        'Accept' => 'application/json',
    ];
});

test('CRITIQUE : password jamais retourné dans /api/me', function () {
    $response = $this->withHeaders($this->headers)->getJson('/api/me');

    $body = $response->getContent();
    expect(strtolower($body))->not->toContain('secret_password_xyz_123');
    expect(strtolower($body))->not->toContain('"password"');
    expect(strtolower($body))->not->toContain('password_hash');
});

test('CRITIQUE : password jamais retourné dans les sales', function () {
    $product = Product::factory()->create(['stock' => 10, 'price' => 100]);

    $sale = $this->withHeaders($this->headers)
        ->postJson('/api/sales', [
            'customer' => ['name' => 'Test'],
            'items' => [[
                'product_id' => $product->id,
                'quantity' => 1,
                'imeis' => ['123456789012345'],
            ]],
        ])->json('data');

    $response = $this->withHeaders($this->headers)
        ->getJson("/api/sales/{$sale['id']}");

    $body = strtolower($response->getContent());
    
    // Le password hashé ne doit JAMAIS apparaître
    expect($body)->not->toContain('"password":');     // champ password en tant que clé
    expect($body)->not->toContain('"password_hash"');
    expect($body)->not->toContain('"remember_token":');
    expect($body)->not->toContain('$2y$');             // pattern bcrypt
    expect($body)->not->toContain('bcrypt');
    
    // Le mot "password" peut apparaître dans must_change_password (légitime)
    // mais jamais dans une valeur (donc on vérifie qu'aucun hash bcrypt n'est exposé)
});

test('le hash du token API n\'apparaît pas dans /me', function () {
    $response = $this->withHeaders($this->headers)->getJson('/api/me');

    $body = strtolower($response->getContent());
    expect($body)->not->toContain('access_token');
    expect($body)->not->toContain('plain_text_token');
});