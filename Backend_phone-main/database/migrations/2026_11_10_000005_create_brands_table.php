<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasTable('brands')) {
            Schema::create('brands', function (Blueprint $table) {
                $table->engine('InnoDB');
                $table->id();
                $table->string('name');
                $table->string('name_key')->unique();
                $table->timestamps();
            });
        }

        DB::table('products')->select('id', 'brand')->whereNotNull('brand')->chunkById(200, function ($products) {
            $rows = [];
            $time = now();
            foreach ($products as $product) {
                $name = trim($product->brand);
                if ($name !== '') {
                    $key = mb_strtolower($name);
                    $rows[$key] ??= ['name' => $name, 'name_key' => $key, 'created_at' => $time, 'updated_at' => $time];
                }
            }
            if ($rows) {
                DB::table('brands')->insertOrIgnore(array_values($rows));
            }
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('brands');
    }
};
