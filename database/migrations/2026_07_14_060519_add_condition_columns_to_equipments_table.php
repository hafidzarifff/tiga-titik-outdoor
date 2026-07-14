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
            $table->unsignedInteger('qty_baik')->default(0)->after('available_stock');
            $table->unsignedInteger('qty_rusak_ringan')->default(0)->after('qty_baik');
            $table->unsignedInteger('qty_rusak_parah')->default(0)->after('qty_rusak_ringan');
            $table->text('condition_notes')->nullable()->after('qty_rusak_parah');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('equipments', function (Blueprint $table) {
            $table->dropColumn(['qty_baik', 'qty_rusak_ringan', 'qty_rusak_parah', 'condition_notes']);
        });
    }
};
