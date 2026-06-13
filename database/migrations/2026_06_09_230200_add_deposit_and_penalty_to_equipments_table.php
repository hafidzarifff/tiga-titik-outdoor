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
        Schema::table('equipments', function (Blueprint $table) {
            $table->decimal('deposit_amount', 10, 2)->default(0.00)->after('status');
            $table->decimal('penalty_hourly_rate', 10, 2)->default(0.00)->after('deposit_amount');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('equipments', function (Blueprint $table) {
            $table->dropColumn(['deposit_amount', 'penalty_hourly_rate']);
        });
    }
};
