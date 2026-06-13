<?php

// app/Http/Controllers/Admin/EquipmentController.php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Category;
use Inertia\Inertia;
use Inertia\Response;

class EquipmentController extends Controller
{
    /**
     * Display a listing of equipment.
     *
     * Equipment data is fetched client-side via the REST API.
     * Categories are passed as Inertia props for the filter/form dropdowns.
     */
    public function index(): Response
    {
        $categories = Category::select('id', 'name', 'icon')
            ->orderBy('name')
            ->get();

        return Inertia::render('Admin/Equipment/Index', [
            'categories' => $categories,
        ]);
    }
}
