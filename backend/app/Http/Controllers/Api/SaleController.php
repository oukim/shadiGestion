<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreSaleRequest;
use App\Http\Resources\SaleResource;
use App\Models\Sale;
use App\Services\SaleService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class SaleController extends Controller
{
    public function __construct(private readonly SaleService $saleService)
    {
    }

    /**
     * GET /api/sales — Liste des ventes avec filtres et pagination.
     */
    public function index(Request $request): AnonymousResourceCollection
    {
        // Validation des filtres (sécurité + UX)
        $validated = $request->validate([
            'status' => ['nullable', 'string', 'in:completed,pending,cancelled'],
            'search' => ['nullable', 'string', 'max:255'],
            'reference' => ['nullable', 'string', 'max:50'],
            'from' => ['nullable', 'date'],
            'to' => ['nullable', 'date', 'after_or_equal:from'],
            'per_page' => ['nullable', 'integer', 'min:1', 'max:100'],
        ]);

        $query = Sale::with(['customer', 'items', 'warranty']);

        // Filtre par statut
        if (! empty($validated['status'])) {
            $query->where('status', $validated['status']);
        }

        // Recherche par nom / téléphone / email du client
        if (! empty($validated['search'])) {
            $search = '%' . $validated['search'] . '%';
            $query->whereHas('customer', function ($q) use ($search) {
                $q->where('name', 'ILIKE', $search)
                    ->orWhere('phone', 'ILIKE', $search)
                    ->orWhere('email', 'ILIKE', $search);
            });
        }

        // Recherche par référence de vente OU numéro de garantie
        if (! empty($validated['reference'])) {
            $ref = '%' . $validated['reference'] . '%';
            $query->where(function ($q) use ($ref) {
                $q->where('reference', 'ILIKE', $ref)
                    ->orWhereHas('warranty', function ($q2) use ($ref) {
                        $q2->where('warranty_number', 'ILIKE', $ref);
                    });
            });
        }

        // Filtres par plage de dates
        if (! empty($validated['from'])) {
            $query->whereDate('created_at', '>=', $validated['from']);
        }
        if (! empty($validated['to'])) {
            $query->whereDate('created_at', '<=', $validated['to']);
        }

        $perPage = $validated['per_page'] ?? 15;
        $sales = $query->latest()->paginate($perPage);

        return SaleResource::collection($sales);
    }

    /**
     * POST /api/sales — Finalise une vente (création complète avec items, IMEI, garantie).
     */
    public function store(StoreSaleRequest $request): JsonResponse
    {
        $sale = $this->saleService->create(
            $request->validated(),
            $request->user()->id
        );

        return response()->json([
            'data' => new SaleResource($sale),
            'message' => 'Vente finalisée avec succès.',
        ], 201);
    }

    /**
     * GET /api/sales/{sale} — Détail d'une vente.
     */
    public function show(Sale $sale): JsonResponse
    {
        $sale->load(['customer', 'user', 'items.product', 'warranty']);

        return response()->json([
            'data' => new SaleResource($sale),
        ]);
    }
}