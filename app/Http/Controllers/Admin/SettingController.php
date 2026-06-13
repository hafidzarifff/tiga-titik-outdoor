<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Setting;
use Illuminate\Support\Facades\Storage;

class SettingController extends Controller
{
    public function index()
    {
        $settings = Setting::pluck('value', 'key')->toArray();
        
        // Decode JSON for FAQs if exists
        if (isset($settings['store_faqs'])) {
            $settings['store_faqs'] = json_decode($settings['store_faqs'], true);
        } else {
            $settings['store_faqs'] = [];
        }

        return Inertia::render('Admin/Setting/Index', [
            'settings' => $settings
        ]);
    }

    public function update(Request $request)
    {
        $data = $request->except(['store_qris', '_method']);

        // Format FAQs array to JSON
        if (isset($data['store_faqs'])) {
            $data['store_faqs'] = json_encode($data['store_faqs']);
        }

        // Handle text settings
        foreach ($data as $key => $value) {
            Setting::updateOrCreate(
                ['key' => $key],
                ['value' => $value]
            );
        }

        // Handle QRIS Upload
        if ($request->hasFile('store_qris')) {
            $request->validate([
                'store_qris' => 'image|mimes:jpeg,png,jpg,webp|max:2048',
            ]);

            $path = $request->file('store_qris')->store('settings', 'public');
            
            // Delete old QRIS if exists
            $oldQris = Setting::where('key', 'store_qris')->first();
            if ($oldQris && $oldQris->value) {
                Storage::disk('public')->delete($oldQris->value);
            }

            Setting::updateOrCreate(
                ['key' => 'store_qris'],
                ['value' => $path]
            );
        }

        return redirect()->back()->with('success', 'Pengaturan berhasil disimpan.');
    }
}
