<?php

namespace App\Http\Controllers\Client;

use App\Http\Controllers\Controller;
use App\Models\Equipment;
use App\Models\Order;
use Carbon\Carbon;
use Inertia\Inertia;
use Inertia\Response;

class HomeController extends Controller
{
    /**
     * Display the client home page.
     */
    public function index(): Response
    {
        // Jumlah alat baru yang ditambahkan dalam 7 hari terakhir
        $newUnitsCount = Equipment::where('created_at', '>=', Carbon::now()->subDays(7))->count();

        // Jumlah pelanggan unik yang pesanannya sudah selesai (completed)
        $satisfiedCustomersCount = Order::where('order_status', 'completed')
            ->distinct('user_id')
            ->count('user_id');

        return Inertia::render('Client/Home', [
            'newUnitsCount' => $newUnitsCount,
            'satisfiedCustomersCount' => $satisfiedCustomersCount,
        ]);
    }
}
