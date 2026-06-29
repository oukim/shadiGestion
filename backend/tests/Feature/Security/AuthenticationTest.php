<?php

declare(strict_types=1);

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->user = User::factory()->create([
        'email' => 'admin@shadi-phone.com',
        'password' => bcrypt('password123'),
        'role' => 'admin',
    ]);
});

/* ============================================
 * LOGIN — Validation
 * ============================================ */

test('login refuse les identifiants vides', function () {
    $this->postJson('/api/login', [])
        ->assertStatus(422)
        ->assertJsonValidationErrors(['email', 'password']);
});

test('login refuse un email mal formé', function () {
    $this->postJson('/api/login', [
        'email' => 'pas-un-email',
        'password' => 'password123',
    ])
        ->assertStatus(422)
        ->assertJsonValidationErrors(['email']);
});

test('login refuse un email inexistant', function () {
    $this->postJson('/api/login', [
        'email' => 'noone@example.com',
        'password' => 'password123',
    ])->assertStatus(422);
});

test('login refuse un mauvais mot de passe', function () {
    $this->postJson('/api/login', [
        'email' => 'admin@shadi-phone.com',
        'password' => 'wrong-password',
    ])->assertStatus(422);
});

test('login retourne un token valide avec bons identifiants', function () {
    $response = $this->postJson('/api/login', [
        'email' => 'admin@shadi-phone.com',
        'password' => 'password123',
    ]);

    $response->assertStatus(200)
        ->assertJsonStructure(['user', 'token']);

    expect($response->json('token'))->toBeString()->not->toBeEmpty();
});

test('CRITIQUE : login ne retourne JAMAIS le mot de passe', function () {
    $response = $this->postJson('/api/login', [
        'email' => 'admin@shadi-phone.com',
        'password' => 'password123',
    ]);

    $body = $response->getContent();
    expect(strtolower($body))->not->toContain('password123');
    expect(strtolower($body))->not->toContain('"password"');
    expect(strtolower($body))->not->toContain('password_hash');
});

/* ============================================
 * ROUTES PROTÉGÉES — Pas de token
 * ============================================ */

test('GET /api/me sans token retourne 401', function () {
    $this->getJson('/api/me')->assertStatus(401);
});

test('GET /api/products sans token retourne 401', function () {
    $this->getJson('/api/products')->assertStatus(401);
});

test('POST /api/products sans token retourne 401', function () {
    $this->postJson('/api/products', ['name' => 'Test'])->assertStatus(401);
});

test('POST /api/sales sans token retourne 401', function () {
    $this->postJson('/api/sales', [])->assertStatus(401);
});

test('GET /api/sales sans token retourne 401', function () {
    $this->getJson('/api/sales')->assertStatus(401);
});

test('GET /api/analytics/overview sans token retourne 401', function () {
    $this->getJson('/api/analytics/overview')->assertStatus(401);
});

/* ============================================
 * TOKENS — Faux/vides/expirés
 * ============================================ */

test('un token inventé retourne 401', function () {
    $this->withHeaders(['Authorization' => 'Bearer faux_token_xyz_123'])
        ->getJson('/api/me')
        ->assertStatus(401);
});

test('un token vide retourne 401', function () {
    $this->withHeaders(['Authorization' => 'Bearer '])
        ->getJson('/api/me')
        ->assertStatus(401);
});

test('un header Authorization sans Bearer retourne 401', function () {
    $token = $this->user->createToken('test')->plainTextToken;

    $this->withHeaders(['Authorization' => $token]) // pas de "Bearer "
        ->getJson('/api/me')
        ->assertStatus(401);
});

/* ============================================
 * LOGOUT — Révocation
 * ============================================ */

test('logout révoque le token courant', function () {
    $token = $this->user->createToken('test')->plainTextToken;

    // Logout
    $this->withHeaders(['Authorization' => "Bearer {$token}"])
        ->postJson('/api/logout')
        ->assertStatus(200);

    // Vérifie en DB que le token a bien été supprimé (= révoqué)
    expect(\Laravel\Sanctum\PersonalAccessToken::findToken($token))->toBeNull();
});

test('logout sans token retourne 401', function () {
    $this->postJson('/api/logout')->assertStatus(401);
});