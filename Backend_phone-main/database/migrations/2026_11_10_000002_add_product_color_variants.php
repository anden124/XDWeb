<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasTable('product_variants')) {
            Schema::create('product_variants', function (Blueprint $table) {
                $table->engine('InnoDB');
                $table->id();
                $table->foreignId('product_id')->constrained()->cascadeOnDelete();
                $table->string('color', 100);
                $table->decimal('price', 12, 2);
                $table->unsignedInteger('quantity');
                $table->string('image', 2048)->nullable();
                $table->timestamps();
            });
        }
        if (!Schema::hasColumn('order_items', 'product_variant_id')) {
            Schema::table('order_items', function (Blueprint $table) {
                $table->foreignId('product_variant_id')->nullable()->constrained()->restrictOnDelete();
            });
        }
        if (!Schema::hasColumn('order_items', 'variant_color')) {
            Schema::table('order_items', function (Blueprint $table) {
                $table->string('variant_color', 100)->nullable();
            });
        }
    }

    public function down(): void
    {
        Schema::table('order_items', function (Blueprint $table) {
            $table->dropConstrainedForeignId('product_variant_id');
            $table->dropColumn('variant_color');
        });
        Schema::dropIfExists('product_variants');
    }
};
