<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('warranties', function (Blueprint $table) {
            $table->id();
            $table->string('warranty_number')->unique();
            $table->foreignId('sale_id')->constrained()->onDelete('cascade');
            $table->date('issued_at');
            $table->date('expires_at');
            $table->integer('duration_months')->default(24);
            $table->text('terms')->nullable();
            $table->timestamps();

            $table->index('warranty_number');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('warranties');
    }
};