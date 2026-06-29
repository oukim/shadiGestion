<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('products', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('brand');
            $table->enum('category', ['premium', 'midrange', 'entry']);
            $table->string('storage');
            $table->decimal('price', 10, 2);
            $table->integer('stock')->default(0);
            $table->string('color', 7)->default('#1E3A8A');
            $table->text('description')->nullable();
            $table->boolean('is_new')->default(false);
            $table->string('image_path')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->index('category');
            $table->index('brand');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('products');
    }
};