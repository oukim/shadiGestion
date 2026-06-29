<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\RevenueService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
class AnalyticsController extends Controller
{
    public function __construct(private readonly RevenueService $revenueService)
    {
    }

    /**
     * GET /api/analytics/overview
     * Tout ce qu'il faut pour la page principale Analytics.
     */
    public function overview(Request $request): JsonResponse
    {
        $months = (int) $request->input('months', 12);
        $months = max(3, min($months, 24)); // borné entre 3 et 24

        return response()->json([
            'summary' => $this->revenueService->summary(),
            'monthly_revenue' => $this->revenueService->monthlyRevenue($months),
            'year_comparison' => $this->revenueService->yearComparison(),
            'top_products' => $this->revenueService->topProducts(5),
        ]);
    }

    /**
     * GET /api/analytics/months/{year}/{month}
     * Détail d'un mois spécifique (pour le drill-down).
     */
    public function monthDetail(int $year, int $month): JsonResponse
    {
        // Validation basique
        if ($month < 1 || $month > 12) {
            return response()->json(['message' => 'Mois invalide.'], 422);
        }
        if ($year < 2020 || $year > 2100) {
            return response()->json(['message' => 'Année invalide.'], 422);
        }

        return response()->json([
            'data' => $this->revenueService->monthDetail($year, $month),
        ]);
    }

    /**
     * GET /api/analytics/top-products
     * Top produits sur une période personnalisable.
     * Query: ?from=2026-01-01&to=2026-12-31&limit=10
     */
public function topProducts(Request $request): JsonResponse
{
    $limit = max(1, min((int) $request->input('limit', 10), 50));

    $from = $request->filled('from')
        ? Carbon::parse($request->from)->startOfDay()      // ✅ Illuminate\Support\Carbon
        : null;
    $to = $request->filled('to')
        ? Carbon::parse($request->to)->endOfDay()           // ✅ Illuminate\Support\Carbon
        : null;

    return response()->json([
        'data' => $this->revenueService->topProducts($limit, $from, $to),
        'period' => [
            'from' => $from?->toDateString(),
            'to' => $to?->toDateString(),
        ],
    ]);
}
}