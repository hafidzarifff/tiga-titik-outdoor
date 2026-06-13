<?php

namespace App\Http\Controllers\Client;

use App\Http\Controllers\Controller;
use Inertia\Inertia;
use Inertia\Response;

class CatalogController extends Controller
{
    /**
     * Display the equipment catalog for clients.
     */
    public function index(): Response
    {
        return Inertia::render('Client/Catalog');
    }

    /**
     * Display the detail of a specific equipment item.
     */
    public function show(int $id): Response
    {
        $equipment = \App\Models\Equipment::with(['category', 'images'])->findOrFail($id);
        
        return Inertia::render('Client/EquipmentDetail', [
            'equipment' => $equipment,
        ]);
    }
}
