<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Sale extends Model
{
    use HasFactory;

    protected $fillable = [
        'reference', 'customer_id', 'user_id',
        'subtotal','tax_rate', 'tax', 'total', 'status',
    ];

    protected $casts = [
        'subtotal' => 'decimal:2',
        'tax_rate' => 'decimal:2',
        'tax' => 'decimal:2',
        'total' => 'decimal:2',
    ];

    protected static function booted(): void
{
    static::creating(function (Sale $sale) {
        // Ne génère une référence QUE si elle n'est pas déjà fournie
        if (empty($sale->reference)) {
            do {
                $sale->reference = 'V' . random_int(1000000, 9999999);
            } while (static::where('reference', $sale->reference)->exists());
        }
    });
}

    public function customer(): BelongsTo
    {
        return $this->belongsTo(Customer::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function items(): HasMany
    {
        return $this->hasMany(SaleItem::class);
    }

    public function warranty(): HasOne
    {
        return $this->hasOne(Warranty::class);
    }
    
}