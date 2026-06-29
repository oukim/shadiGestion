<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\Sale;
use Illuminate\Support\Carbon;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

class RevenueService
{
    /**
     * Revenus mensuels sur N mois glissants.
     * Retourne un tableau avec une entrée par mois, même si zéro vente.
     *
     * @param int $months  Nombre de mois à inclure (12 par défaut)
     * @return Collection<array{year:int, month:int, label:string, revenue:float, orders:int}>
     */
    public function monthlyRevenue(int $months = 12): Collection
    {
        $end = Carbon::now()->endOfMonth();
        $start = Carbon::now()->subMonths($months - 1)->startOfMonth();

        // Agrégation SQL
        $rows = Sale::query()
            ->where('status', 'completed')
            ->whereBetween('created_at', [$start, $end])
            ->select(
                DB::raw("EXTRACT(YEAR FROM created_at)::int as year"),
                DB::raw("EXTRACT(MONTH FROM created_at)::int as month"),
                DB::raw("SUM(total) as revenue"),
                DB::raw("COUNT(*) as orders"),
            )
            ->groupBy('year', 'month')
            ->orderBy('year')
            ->orderBy('month')
            ->get()
            ->keyBy(fn ($row) => "{$row->year}-{$row->month}");

        // Génère les 12 mois (même ceux à zéro)
        $result = collect();
        for ($i = 0; $i < $months; $i++) {
            $cursor = $start->copy()->addMonths($i);
            $key = $cursor->year . '-' . $cursor->month;
            $row = $rows->get($key);

            $result->push([
                'year' => $cursor->year,
                'month' => $cursor->month,
                'label' => $cursor->translatedFormat('M Y'), // "mai 2026"
                'short_label' => $cursor->translatedFormat('M'), // "mai"
                'revenue' => $row ? (float) $row->revenue : 0.0,
                'orders' => $row ? (int) $row->orders : 0,
            ]);
        }

        return $result;
    }

    /**
     * Comparaison année en cours vs année précédente, mois par mois.
     */
    public function yearComparison(): array
    {
        $currentYear = Carbon::now()->year;
        $previousYear = $currentYear - 1;

        $rows = Sale::query()
            ->where('status', 'completed')
            ->whereIn(DB::raw('EXTRACT(YEAR FROM created_at)'), [$currentYear, $previousYear])
            ->select(
                DB::raw("EXTRACT(YEAR FROM created_at)::int as year"),
                DB::raw("EXTRACT(MONTH FROM created_at)::int as month"),
                DB::raw("SUM(total) as revenue"),
            )
            ->groupBy('year', 'month')
            ->get()
            ->groupBy('year');

        // Construit 12 mois pour chaque année
        $months = [];
        for ($m = 1; $m <= 12; $m++) {
            $current = $rows->get($currentYear)?->firstWhere('month', $m);
            $previous = $rows->get($previousYear)?->firstWhere('month', $m);

            $months[] = [
                'month' => $m,
                'label' => Carbon::create($currentYear, $m, 1)->translatedFormat('M'),
                'current_year' => $current ? (float) $current->revenue : 0.0,
                'previous_year' => $previous ? (float) $previous->revenue : 0.0,
            ];
        }

        return [
            'current_year' => $currentYear,
            'previous_year' => $previousYear,
            'months' => $months,
        ];
    }

    /**
     * KPIs résumés pour la page Analytics.
     */
    public function summary(): array
    {
        $now = Carbon::now();
        $currentMonthStart = $now->copy()->startOfMonth();
        $previousMonthStart = $now->copy()->subMonth()->startOfMonth();
        $previousMonthEnd = $now->copy()->subMonth()->endOfMonth();

        $currentMonthRevenue = (float) Sale::where('status', 'completed')
            ->where('created_at', '>=', $currentMonthStart)
            ->sum('total');

        $currentMonthOrders = Sale::where('status', 'completed')
            ->where('created_at', '>=', $currentMonthStart)
            ->count();

        $previousMonthRevenue = (float) Sale::where('status', 'completed')
            ->whereBetween('created_at', [$previousMonthStart, $previousMonthEnd])
            ->sum('total');

        $previousMonthOrders = Sale::where('status', 'completed')
            ->whereBetween('created_at', [$previousMonthStart, $previousMonthEnd])
            ->count();

        // Évolution en pourcentage
        $revenueChange = $previousMonthRevenue > 0
            ? round((($currentMonthRevenue - $previousMonthRevenue) / $previousMonthRevenue) * 100, 1)
            : ($currentMonthRevenue > 0 ? 100.0 : 0.0);

        // Panier moyen sur le mois en cours
        $averageOrderValue = $currentMonthOrders > 0
            ? round($currentMonthRevenue / $currentMonthOrders, 2)
            : 0.0;

        // Total annuel
        $yearStart = $now->copy()->startOfYear();
        $yearRevenue = (float) Sale::where('status', 'completed')
            ->where('created_at', '>=', $yearStart)
            ->sum('total');

        $yearOrders = Sale::where('status', 'completed')
            ->where('created_at', '>=', $yearStart)
            ->count();

        return [
            'current_month' => [
                'revenue' => $currentMonthRevenue,
                'orders' => $currentMonthOrders,
                'label' => $now->translatedFormat('F Y'),
            ],
            'previous_month' => [
                'revenue' => $previousMonthRevenue,
                'orders' => $previousMonthOrders,
                'label' => $now->copy()->subMonth()->translatedFormat('F Y'),
            ],
            'revenue_change_percent' => $revenueChange,
            'average_order_value' => $averageOrderValue,
            'current_year' => [
                'revenue' => $yearRevenue,
                'orders' => $yearOrders,
                'label' => (string) $now->year,
            ],
        ];
    }

    /**
     * Top N produits par revenu généré sur une période.
     */
    public function topProducts(int $limit = 5, ?Carbon $from = null, ?Carbon $to = null): Collection
    {
        $from ??= Carbon::now()->startOfMonth();
        $to ??= Carbon::now()->endOfMonth();

        return DB::table('sale_items')
            ->join('sales', 'sales.id', '=', 'sale_items.sale_id')
            ->where('sales.status', 'completed')
            ->whereBetween('sales.created_at', [$from, $to])
            ->select(
                'sale_items.product_id',
                'sale_items.product_name as name',
                DB::raw('SUM(sale_items.quantity) as units_sold'),
                DB::raw('SUM(sale_items.line_total) as revenue'),
            )
            ->groupBy('sale_items.product_id', 'sale_items.product_name')
            ->orderByDesc('revenue')
            ->limit($limit)
            ->get()
            ->map(fn ($row) => [
                'product_id' => (int) $row->product_id,
                'name' => $row->name,
                'units_sold' => (int) $row->units_sold,
                'revenue' => (float) $row->revenue,
            ]);
    }

    /**
     * Détail d'un mois spécifique : revenus jour par jour + stats.
     */
    public function monthDetail(int $year, int $month): array
    {
        $start = Carbon::create($year, $month, 1)->startOfMonth();
        $end = $start->copy()->endOfMonth();

        // Revenus jour par jour
        $dailyRows = Sale::query()
            ->where('status', 'completed')
            ->whereBetween('created_at', [$start, $end])
            ->select(
                DB::raw("EXTRACT(DAY FROM created_at)::int as day"),
                DB::raw("SUM(total) as revenue"),
                DB::raw("COUNT(*) as orders"),
            )
            ->groupBy('day')
            ->orderBy('day')
            ->get()
            ->keyBy('day');

        // Génère tous les jours du mois (même ceux sans vente)
        $days = [];
        $daysInMonth = $start->daysInMonth;
        for ($d = 1; $d <= $daysInMonth; $d++) {
            $row = $dailyRows->get($d);
            $days[] = [
                'day' => $d,
                'date' => Carbon::create($year, $month, $d)->toDateString(),
                'revenue' => $row ? (float) $row->revenue : 0.0,
                'orders' => $row ? (int) $row->orders : 0,
            ];
        }

        $totalRevenue = collect($days)->sum('revenue');
        $totalOrders = collect($days)->sum('orders');

        // Meilleur jour
        $bestDay = collect($days)->sortByDesc('revenue')->first();

        return [
            'year' => $year,
            'month' => $month,
            'label' => $start->translatedFormat('F Y'),
            'total_revenue' => $totalRevenue,
            'total_orders' => $totalOrders,
            'average_per_day' => $daysInMonth > 0 ? round($totalRevenue / $daysInMonth, 2) : 0,
            'best_day' => $bestDay,
            'days' => $days,
            'top_products' => $this->topProducts(5, $start, $end),
        ];
    }
}