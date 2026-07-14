<?php

// app/Models/Equipment.php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Equipment extends Model
{
    use HasFactory, SoftDeletes;

    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'equipments';

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'category_id',
        'name',
        'slug',
        'price_per_day',
        'total_stock',
        'available_stock',
        'qty_baik',
        'qty_rusak_ringan',
        'qty_rusak_parah',
        'condition_notes',
        'status',
        'deposit_amount',
        'penalty_hourly_rate',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'price_per_day'       => 'decimal:2',
        'total_stock'         => 'integer',
        'available_stock'     => 'integer',
        'qty_baik'            => 'integer',
        'qty_rusak_ringan'    => 'integer',
        'qty_rusak_parah'     => 'integer',
        'deposit_amount'      => 'decimal:2',
        'penalty_hourly_rate' => 'decimal:2',
    ];

    /**
     * Get the category that owns the equipment.
     */
    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class, 'category_id');
    }

    /**
     * Get all images for the equipment, ordered by sort_order.
     */
    public function images(): HasMany
    {
        return $this->hasMany(EquipmentImage::class)->orderBy('sort_order');
    }

    /**
     * Get all order items associated with the equipment.
     */
    public function orderItems(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }
}
