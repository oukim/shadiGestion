<?php

declare(strict_types=1);

use App\Http\Controllers\Api\AuthController;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\ProductController;
use App\Http\Controllers\Api\SaleController;
use App\Http\Controllers\Api\WarrantyController;
use App\Http\Controllers\Api\AnalyticsController;

/*
|--------------------------------------------------------------------------
| API Routes — Shadi Phone
|--------------------------------------------------------------------------
*/

// Public routes
Route::post('/login', [AuthController::class, 'login'])->name('login');

// Protected routes (authentification requise via token Sanctum)
Route::middleware(['auth:sanctum', 'throttle:60,1'])->group(function () {
    Route::get('/me', [AuthController::class, 'me'])->name('me');
    Route::post('/logout', [AuthController::class, 'logout'])->name('logout');

    // Produits — CRUD complet
    Route::apiResource('products', ProductController::class);

    // Ventes
    Route::apiResource('sales', SaleController::class)->only(['index', 'store', 'show']);

    // Garanties (clé = warranty_number, pas l'ID)
    Route::get('warranties/{warrantyNumber}', [WarrantyController::class, 'show'])
        ->name('warranties.show');
    Route::get('warranties/{warrantyNumber}/pdf', [WarrantyController::class, 'downloadPdf'])
        ->name('warranties.pdf');

     // Analytics
    Route::prefix('analytics')->group(function () {
        Route::get('overview', [AnalyticsController::class, 'overview'])->name('analytics.overview');
        Route::get('top-products', [AnalyticsController::class, 'topProducts'])->name('analytics.top-products');
        Route::get('months/{year}/{month}', [AnalyticsController::class, 'monthDetail'])
            ->whereNumber(['year', 'month'])
            ->name('analytics.month-detail');
            });
    
    // Changement de mot de passe
    Route::post('/change-password', [AuthController::class, 'changePassword'])->name('change-password');
});