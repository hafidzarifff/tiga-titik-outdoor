<?php

namespace App\Http\Controllers\Client;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Setting;

class HelpCenterController extends Controller
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

        return Inertia::render('Client/HelpCenter/Index', [
            'settings' => $settings
        ]);
    }
}
