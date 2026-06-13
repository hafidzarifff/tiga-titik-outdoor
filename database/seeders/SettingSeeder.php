<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class SettingSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $settings = [
            'store_phone' => '081234567890',
            'store_instagram' => '@tigatitikoutdoor',
            'store_email' => 'hello@tigatitik.com',
            'store_address' => 'Jl. Contoh Raya No. 123, Kota Bandung, Jawa Barat',
            'store_maps_link' => 'https://maps.google.com/?q=bandung',
            'store_qris' => null,
            'store_faqs' => json_encode([
                ['question' => 'Apa saja syarat penyewaan alat?', 'answer' => 'Penyewa wajib menjaminkan KTP asli atau identitas resmi lainnya yang masih berlaku.'],
                ['question' => 'Bagaimana jika alat rusak saat dikembalikan?', 'answer' => 'Penyewa akan dikenakan denda sesuai dengan tingkat kerusakan alat.'],
                ['question' => 'Apakah ada denda keterlambatan?', 'answer' => 'Ya, keterlambatan pengembalian akan dikenakan denda per jam atau per hari sesuai kebijakan yang berlaku.']
            ]),
            'store_terms_conditions' => '<h3>1. Ketentuan Umum</h3><p>Penyewa wajib menjaga alat dengan baik dan mematuhi seluruh aturan yang ada.</p>'
        ];

        foreach ($settings as $key => $value) {
            \App\Models\Setting::updateOrCreate(
                ['key' => $key],
                ['value' => $value]
            );
        }
    }
}
