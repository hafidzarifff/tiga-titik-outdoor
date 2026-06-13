<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Order extends Model
{
    use HasFactory;

    protected $fillable = [
        'order_number',
        'user_id',
        'order_source',
        'retained_id_type',
        'ktp_path',
        'payment_proof_path',
        'expected_pickup_datetime',
        'expected_return_datetime',
        'actual_return_datetime',
        'rental_subtotal',
        'deposit_total',
        'grand_total',
        'payment_type',
        'payment_method',
        'payment_status',
        'order_status',
        'late_fee_total',
        'damage_fee_total',
        'refund_admin_fee',
        'payment_due_datetime',
    ];

    protected $casts = [
        'expected_pickup_datetime' => 'datetime',
        'expected_return_datetime' => 'datetime',
        'actual_return_datetime' => 'datetime',
        'payment_due_datetime' => 'datetime',
        'rental_subtotal' => 'decimal:2',
        'deposit_total' => 'decimal:2',
        'grand_total' => 'decimal:2',
        'late_fee_total' => 'decimal:2',
        'damage_fee_total' => 'decimal:2',
        'refund_admin_fee' => 'decimal:2',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function items()
    {
        return $this->hasMany(OrderItem::class);
    }
}
