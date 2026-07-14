<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->boolean('is_representative_pickup')->default(false)->after('order_source');
            $table->string('representative_name')->nullable()->after('is_representative_pickup');
            $table->string('representative_phone')->nullable()->after('representative_name');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropColumn(['is_representative_pickup', 'representative_name', 'representative_phone']);
        });
    }
};
