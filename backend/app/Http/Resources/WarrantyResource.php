<?php

declare(strict_types=1);

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class WarrantyResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'warranty_number' => $this->warranty_number,
            'issued_at' => $this->issued_at?->toDateString(),
            'expires_at' => $this->expires_at?->toDateString(),
            'duration_months' => $this->duration_months,
            'terms' => $this->terms,
            'sale' => new SaleResource($this->whenLoaded('sale')),
        ];
    }
}