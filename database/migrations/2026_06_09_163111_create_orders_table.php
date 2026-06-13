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
        Schema::create('orders', function (Blueprint $table) {
            $table->id();
            $table->string('order_number')->unique();
            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->enum('order_source', ['online', 'offline']);
            $table->enum('retained_id_type', ['none', 'ktp', 'sim', 'paspor'])->default('none');
            $table->dateTime('expected_pickup_datetime');
            $table->dateTime('expected_return_datetime');
            $table->dateTime('actual_return_datetime')->nullable();
            
            $table->decimal('rental_subtotal', 10, 2);
            $table->decimal('deposit_total', 10, 2);
            $table->decimal('grand_total', 10, 2);
            
            $table->enum('payment_type', ['dp_30', 'full_payment']);
            $table->enum('payment_method', ['cash', 'transfer', 'qris']);
            $table->enum('payment_status', ['unpaid', 'verifying', 'partial', 'paid', 'refund_pending', 'refunded', 'forfeited']);
            $table->enum('order_status', ['pending', 'booked', 'active', 'completed', 'cancelled']);
            
            $table->decimal('late_fee_total', 10, 2)->nullable()->default(0);
            $table->decimal('damage_fee_total', 10, 2)->nullable()->default(0);
            $table->decimal('refund_admin_fee', 10, 2)->nullable()->default(0);
            
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('orders');
    }
};
