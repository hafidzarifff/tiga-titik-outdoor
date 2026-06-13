<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class OrderItem extends Model
{
    use HasFactory;

    protected $fillable = [
        'order_id',
        'equipment_id',
        'qty',
        'price_per_day_at_rent',
        'deposit_amount_at_rent',
        'penalty_hourly_rate_at_rent',
    ];

    protected $casts = [
        'price_per_day_at_rent' => 'decimal:2',
        'deposit_amount_at_rent' => 'decimal:2',
        'penalty_hourly_rate_at_rent' => 'decimal:2',
    ];

    public function order()
    {
        return $this->belongsTo(Order::class);
    }

    public function equipment()
    {
        return $this->belongsTo(Equipment::class);
    }
}
