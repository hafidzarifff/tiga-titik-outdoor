<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class OrderController extends Controller
{
    /**
     * Display a listing of orders.
     */
    public function index(): Response
    {
        return Inertia::render('Admin/Order/Index');
    }

    /**
     * Display the specified order.
     */
    public function show(int $id): Response
    {
        return Inertia::render('Admin/Order/Show', [
            'orderId' => $id,
        ]);
    }

    /**
     * Update the status of the specified order.
     */
    public function updateStatus(int $id): RedirectResponse
    {
        // TODO: Implement with Form Request validation
        return redirect()->route('admin.orders.index');
    }

    /**
     * Display the POS receipt for the specified order.
     */
    public function receipt(int $id)
    {
        $order = \App\Models\Order::with(['user.customerProfile', 'items.equipment'])->findOrFail($id);
        
        return view('admin.orders.receipt', compact('order'));
    }
}
