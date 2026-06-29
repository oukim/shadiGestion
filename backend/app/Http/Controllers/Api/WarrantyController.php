<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\WarrantyResource;
use App\Models\Warranty;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\JsonResponse;
use Symfony\Component\HttpFoundation\Response;

class WarrantyController extends Controller
{
    /**
     * GET /api/warranties/{warrantyNumber}
     */
    public function show(string $warrantyNumber): JsonResponse
    {
        $warranty = Warranty::where('warranty_number', $warrantyNumber)
            ->with(['sale.customer', 'sale.user', 'sale.items.product'])
            ->firstOrFail();

        return response()->json([
            'data' => new WarrantyResource($warranty),
        ]);
    }

    /**
     * GET /api/warranties/{warrantyNumber}/pdf — Téléchargement du PDF
     */
    public function downloadPdf(string $warrantyNumber): Response
    {
        $warranty = Warranty::where('warranty_number', $warrantyNumber)
            ->with(['sale.customer', 'sale.user', 'sale.items.product'])
            ->firstOrFail();

        $pdf = Pdf::loadView('warranty.certificate', [
            'warranty' => $warranty,
            'sale' => $warranty->sale,
            'customer' => $warranty->sale->customer,
            'items' => $warranty->sale->items,
        ])->setPaper('a4', 'portrait');

        return $pdf->download("bon-garantie-{$warrantyNumber}.pdf");
    }
}