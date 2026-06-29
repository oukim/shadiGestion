<?php

declare(strict_types=1);

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProductResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'brand' => $this->brand,
            'category' => $this->category,
            'storage' => $this->storage,
            'price' => (float) $this->price,
            'stock' => $this->stock,
            'stock_status' => $this->stock_status,
            'color' => $this->color,
            'description' => $this->description,
            'is_new' => $this->is_new,
            'image_path' => $this->image_path,
            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
        ];
    }
}