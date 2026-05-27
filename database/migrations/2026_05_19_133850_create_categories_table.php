<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('categories', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('slug')->unique();
            $table->text('description')->nullable();
            $table->string('color')->default('#6366f1'); // accent color hex
            $table->timestamps();
        });

        // Add category_id to blogs
        Schema::table('blogs', function (Blueprint $table) {
            $table->foreignId('category_id')->nullable()->after('team_id')->constrained()->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('blogs', function (Blueprint $table) {
            $table->dropForeignIdFor(\App\Models\Category::class);
            $table->dropColumn('category_id');
        });
        Schema::dropIfExists('categories');
    }
};
