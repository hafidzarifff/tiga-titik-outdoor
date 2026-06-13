<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Category;
use App\Models\Equipment;
use Illuminate\Support\Str;

class DummyDataSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Buat Kategori
        $categories = [
            ['name' => 'Tenda', 'slug' => 'tenda', 'icon' => 'Tent'],
            ['name' => 'Tas', 'slug' => 'tas', 'icon' => 'Backpack'],
            ['name' => 'Sepatu', 'slug' => 'sepatu', 'icon' => 'Footprints'],
            ['name' => 'Masak', 'slug' => 'masak', 'icon' => 'Utensils'],
            ['name' => 'Aksesoris', 'slug' => 'aksesoris', 'icon' => 'Package'],
        ];

        foreach ($categories as $cat) {
            Category::firstOrCreate(['slug' => $cat['slug']], $cat);
        }

        // 2. Buat Alat (Equipments)
        $tenda = Category::where('slug', 'tenda')->first();
        $tas = Category::where('slug', 'tas')->first();
        $sepatu = Category::where('slug', 'sepatu')->first();

        $equipments = [
            [
                'category_id' => $tas->id,
                'name' => 'CARIER OSPREY ATMOS 50L',
                'slug' => Str::slug('CARIER OSPREY ATMOS 50L'),
                'price_per_day' => 150000,
                'total_stock' => 5,
                'available_stock' => 5,
                'status' => 'Baik',
            ],
            [
                'category_id' => $tenda->id,
                'name' => 'TENDA BIG ADVENTURE 2P',
                'slug' => Str::slug('TENDA BIG ADVENTURE 2P'),
                'price_per_day' => 120000,
                'total_stock' => 10,
                'available_stock' => 8,
                'status' => 'Baik',
            ],
            [
                'category_id' => $sepatu->id,
                'name' => 'SEPATU TRAIL SALOMON SPEEDCROSS',
                'slug' => Str::slug('SEPATU TRAIL SALOMON SPEEDCROSS'),
                'price_per_day' => 70000,
                'total_stock' => 15,
                'available_stock' => 12,
                'status' => 'Baik',
            ]
        ];

        foreach ($equipments as $eq) {
            Equipment::firstOrCreate(['slug' => $eq['slug']], $eq);
        }
    }
}
