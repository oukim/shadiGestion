<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Product extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'name', 'brand', 'category', 'storage', 'price',
        'stock', 'color', 'description', 'is_new', 'image_path',
    ];

    protected $casts = [
        'price' => 'decimal:2',
        'stock' => 'integer',
        'is_new' => 'boolean',
    ];

    protected $appends = ['stock_status'];

    public function saleItems(): HasMany
    {
        return $this->hasMany(SaleItem::class);
    }

    public function getStockStatusAttribute(): string
    {
        return match (true) {
            $this->stock === 0 => 'out_of_stock',
            $this->stock <= 10 => 'low_stock',
            default => 'in_stock',
        };
    }
}