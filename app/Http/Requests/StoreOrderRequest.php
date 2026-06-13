<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Carbon\Carbon;

class StoreOrderRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true; // Asumsikan otorisasi di-handle di Controller / Middleware
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array|string>
     */
    public function rules(): array
    {
        return [
            'expected_pickup_datetime' => [
                'required',
                'date_format:Y-m-d H:i:s',
                function ($attribute, $value, $fail) {
                    try {
                        $time = Carbon::parse($value)->format('H:i:s');
                        if ($time < '09:00:00' || $time > '21:00:00') {
                            $fail('Waktu pengambilan harus berada dalam rentang jam operasional (09:00 - 21:00).');
                        }
                    } catch (\Exception $e) {
                        $fail('Format waktu pengambilan tidak valid.');
                    }
                },
            ],
            'expected_return_datetime' => [
                'required',
                'date_format:Y-m-d H:i:s',
                'after:expected_pickup_datetime',
                function ($attribute, $value, $fail) {
                    try {
                        $time = Carbon::parse($value)->format('H:i:s');
                        if ($time < '09:00:00' || $time > '21:00:00') {
                            $fail('Waktu pengembalian harus berada dalam rentang jam operasional (09:00 - 21:00).');
                        }
                    } catch (\Exception $e) {
                        $fail('Format waktu pengembalian tidak valid.');
                    }
                },
            ],
            'order_source' => 'required|in:online,offline',
            'guest_name' => 'required_if:order_source,offline|string|max:255',
            'guest_phone' => 'required_if:order_source,offline|string|max:20',
            'payment_type' => [
                'required',
                'in:dp_30,full_payment',
                function ($attribute, $value, $fail) {
                    if ($this->order_source === 'offline' && $value !== 'full_payment') {
                        $fail('Transaksi offline wajib menggunakan pembayaran penuh (full_payment), tidak melayani DP.');
                    }
                },
            ],
            'retained_id_type' => [
                'nullable',
                'in:none,ktp,sim,paspor',
                function ($attribute, $value, $fail) {
                    if ($this->order_source === 'offline' && !in_array($value, ['ktp', 'sim', 'paspor'])) {
                        $fail('Transaksi offline wajib menahan ID sebagai jaminan (Pilih antara: KTP, SIM, atau Paspor).');
                    }
                },
            ],
            'items' => 'required|array|min:1',
            'items.*.equipment_id' => 'required|exists:equipments,id',
            'items.*.qty' => 'required|integer|min:1',
        ];
    }

    /**
     * Get custom messages for validator errors.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'expected_pickup_datetime.required' => 'Waktu pengambilan wajib diisi.',
            'expected_pickup_datetime.date_format' => 'Format waktu pengambilan harus Y-m-d H:i:s (Contoh: 2026-06-09 10:00:00).',
            
            'expected_return_datetime.required' => 'Waktu pengembalian wajib diisi.',
            'expected_return_datetime.date_format' => 'Format waktu pengembalian harus Y-m-d H:i:s.',
            'expected_return_datetime.after' => 'Waktu pengembalian harus lebih besar dari waktu pengambilan.',
            
            'order_source.required' => 'Sumber pesanan (online/offline) wajib diisi.',
            'order_source.in' => 'Sumber pesanan tidak valid, harus berisi "online" atau "offline".',
            
            'guest_name.required_if' => 'Nama pelanggan wajib diisi untuk pesanan walk-in (offline).',
            'guest_phone.required_if' => 'Nomor HP pelanggan wajib diisi untuk pesanan walk-in (offline).',
            
            'payment_type.required' => 'Tipe pembayaran wajib dipilih.',
            'payment_type.in' => 'Tipe pembayaran harus bernilai "dp_30" atau "full_payment".',
            
            'retained_id_type.in' => 'Tipe ID yang ditahan tidak dikenali.',
            
            'items.required' => 'Daftar barang pesanan (items) wajib diisi.',
            'items.array' => 'Daftar barang pesanan harus berupa list/array.',
            'items.min' => 'Transaksi minimal harus menyewa 1 jenis barang.',
            
            'items.*.equipment_id.required' => 'ID alat (equipment_id) wajib disertakan pada setiap barang.',
            'items.*.equipment_id.exists' => 'Salah satu ID alat yang Anda masukkan tidak ditemukan di database.',
            
            'items.*.qty.required' => 'Jumlah barang (qty) wajib diisi.',
            'items.*.qty.integer' => 'Jumlah barang harus berupa angka bulat.',
            'items.*.qty.min' => 'Jumlah sewa barang minimal 1.',
        ];
    }
}
