<?php

// app/Http/Requests/Admin/UpdateEquipmentRequest.php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class UpdateEquipmentRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Prepare the data for validation.
     */
    protected function prepareForValidation(): void
    {
        if ($this->has('name')) {
            $this->merge([
                'slug' => Str::slug($this->name),
            ]);
        }
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $equipmentId = $this->route('equipment');

        return [
            'category_id' => [
                'sometimes',
                'required',
                'integer',
                Rule::exists('categories', 'id'),
            ],
            'name' => [
                'sometimes',
                'required',
                'string',
                'max:150',
            ],
            'slug' => [
                'sometimes',
                'required',
                'string',
                'max:255',
                Rule::unique('equipments', 'slug')->ignore($equipmentId),
            ],
            'price_per_day' => [
                'sometimes',
                'required',
                'numeric',
                'min:0',
                'regex:/^\d{1,8}(\.\d{1,2})?$/',
            ],
            'total_stock' => [
                'sometimes',
                'required',
                'integer',
                'min:0',
            ],
            'available_stock' => [
                'sometimes',
                'required',
                'integer',
                'min:0',
                'lte:total_stock',
            ],
            'status' => [
                'sometimes',
                Rule::in(['Baik', 'Maintenance', 'Rusak']),
            ],
            'deposit_amount' => [
                'sometimes',
                'required',
                'numeric',
                'min:0',
            ],
            'penalty_hourly_rate' => [
                'sometimes',
                'required',
                'numeric',
                'min:0',
            ],
            'images' => [
                'nullable',
                'array',
                'max:5',
            ],
            'images.*' => [
                'image',
                'mimes:jpg,jpeg,png',
                'max:2048',
            ],
            'delete_images' => [
                'nullable',
                'array',
            ],
            'delete_images.*' => [
                'integer',
                Rule::exists('equipment_images', 'id'),
            ],
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
            'category_id.required'     => 'Kategori wajib dipilih.',
            'category_id.exists'       => 'Kategori yang dipilih tidak valid.',
            'name.required'            => 'Nama alat wajib diisi.',
            'name.max'                 => 'Nama alat maksimal 150 karakter.',
            'price_per_day.required'   => 'Harga sewa per hari wajib diisi.',
            'price_per_day.numeric'    => 'Harga sewa per hari harus berupa angka.',
            'price_per_day.min'        => 'Harga sewa per hari tidak boleh negatif.',
            'price_per_day.regex'      => 'Format harga tidak valid (maks 2 desimal).',
            'total_stock.required'     => 'Stok total wajib diisi.',
            'total_stock.min'          => 'Stok total tidak boleh negatif.',
            'available_stock.required' => 'Stok tersedia wajib diisi.',
            'available_stock.min'      => 'Stok tersedia tidak boleh negatif.',
            'available_stock.lte'      => 'Stok tersedia tidak boleh melebihi stok total.',
            'status.in'                => 'Status harus salah satu dari: Baik, Maintenance, atau Rusak.',
            'deposit_amount.required'  => 'Nominal deposit wajib diisi.',
            'deposit_amount.numeric'   => 'Nominal deposit harus berupa angka.',
            'deposit_amount.min'       => 'Nominal deposit tidak boleh minus.',
            'penalty_hourly_rate.required' => 'Denda per jam wajib diisi.',
            'penalty_hourly_rate.numeric'  => 'Denda per jam harus berupa angka.',
            'penalty_hourly_rate.min'      => 'Denda per jam tidak boleh minus.',
            'images.max'               => 'Maksimal 5 gambar per alat.',
            'images.*.image'           => 'Setiap file harus berupa gambar.',
            'images.*.mimes'           => 'Gambar harus berformat JPG, JPEG, atau PNG.',
            'images.*.max'             => 'Ukuran setiap gambar maksimal 2MB.',
            'slug.unique'              => 'Nama alat sudah digunakan (slug duplikat).',
            'delete_images.*.exists'   => 'Gambar yang akan dihapus tidak ditemukan.',
        ];
    }
}
