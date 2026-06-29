<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Warranty extends Model
{
    use HasFactory;

    protected $fillable = [
        'warranty_number', 'sale_id',
        'issued_at', 'expires_at', 'duration_months', 'terms',
    ];

    protected $casts = [
        'issued_at' => 'date',
        'expires_at' => 'date',
        'duration_months' => 'integer',
    ];

    public function sale(): BelongsTo
    {
        return $this->belongsTo(Sale::class);
    }
}