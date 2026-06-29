<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreProductRequest;
use App\Http\Requests\UpdateProductRequest;
use App\Http\Resources\ProductResource;
use App\Models\Product;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class ProductController extends Controller
{
    /**
     * GET /api/products
     * Liste paginée des produits avec filtres optionnels :
     *   ?category=premium|midrange|entry|all
     *   ?search=aurora
     *   ?per_page=20 (max 100)
     *   ?stock_status=in_stock|low_stock|out_of_stock
     */
    public function index(Request $request): AnonymousResourceCollection
    {
        // Validation des filtres (sécurité + UX)
        $validated = $request->validate([
            'category' => ['nullable', 'string', 'in:premium,midrange,entry,all'],
            'search' => ['nullable', 'string', 'max:255'],
            'stock_status' => ['nullable', 'string', 'in:in_stock,low_stock,out_of_stock'],
            'per_page' => ['nullable', 'integer', 'min:1', 'max:100'],
        ]);

        $query = Product::query();

        // Filtre par catégorie
        if (! empty($validated['category']) && $validated['category'] !== 'all') {
            $query->where('category', $validated['category']);
        }

        // Recherche par nom ou marque (case-insensitive PostgreSQL)
        if (! empty($validated['search'])) {
            $search = '%' . $validated['search'] . '%';
            $query->where(function ($q) use ($search) {
                $q->where('name', 'ILIKE', $search)
                    ->orWhere('brand', 'ILIKE', $search);
            });
        }

        // Filtre par statut de stock (calculé dynamiquement)
        if (! empty($validated['stock_status'])) {
            match ($validated['stock_status']) {
                'out_of_stock' => $query->where('stock', 0),
                'low_stock' => $query->whereBetween('stock', [1, 10]),
                'in_stock' => $query->where('stock', '>', 10),
            };
        }

        $perPage = $validated['per_page'] ?? 20;
        $products = $query->latest()->paginate($perPage);

        return ProductResource::collection($products);
    }

    /**
     * POST /api/products — Création d'un produit.
     */
    public function store(StoreProductRequest $request): JsonResponse
    {
        $product = Product::create($request->validated());

        return response()->json([
            'data' => new ProductResource($product),
            'message' => 'Produit créé avec succès.',
        ], 201);
    }

    /**
     * GET /api/products/{product} — Détail d'un produit (Route Model Binding).
     */
    public function show(Product $product): JsonResponse
    {
        return response()->json([
            'data' => new ProductResource($product),
        ]);
    }

    /**
     * PUT/PATCH /api/products/{product} — Mise à jour d'un produit.
     */
    public function update(UpdateProductRequest $request, Product $product): JsonResponse
    {
        $product->update($request->validated());

        return response()->json([
            'data' => new ProductResource($product->fresh()),
            'message' => 'Produit mis à jour avec succès.',
        ]);
    }

    /**
     * DELETE /api/products/{product}
     * Empêche la suppression si le produit a déjà été vendu (intégrité historique).
     */
    public function destroy(Product $product): JsonResponse
    {
        if ($product->saleItems()->exists()) {
            return response()->json([
                'message' => 'Impossible de supprimer ce produit car il est lié à des ventes existantes.',
            ], 409); // Conflict
        }

        $product->delete();

        return response()->json([
            'message' => 'Produit supprimé avec succès.',
        ]);
    }
}