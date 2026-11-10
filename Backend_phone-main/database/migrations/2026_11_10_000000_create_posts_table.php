<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('posts')) {
            return;
        }

        Schema::create('posts', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->string('slug')->unique();
            $table->text('summary')->nullable();
            $table->longText('content');
            $table->string('image');
            $table->string('author', 100)->nullable()->default('Admin');
            $table->boolean('is_hot')->nullable()->default(false);
            $table->integer('views')->nullable()->default(0);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        // Older installations may already have a populated posts table.
    }
};
