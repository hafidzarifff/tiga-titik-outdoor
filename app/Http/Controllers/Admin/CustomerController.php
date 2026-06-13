<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class CustomerController extends Controller
{
    /**
     * Display a listing of the customers.
     */
    public function index(): Response
    {
        $customers = User::where('role', 'customer')
            ->with(['customerProfile', 'orders' => function($query) {
                $query->orderBy('created_at', 'desc');
            }])
            ->latest()
            ->get()
            ->map(function ($user) {
                return [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'phone_number' => $user->customerProfile?->phone_number ?? '-',
                    'instagram' => $user->customerProfile?->instagram ?? '-',
                    'address' => $user->customerProfile?->address ?? '-',
                    'identity_card_number' => $user->customerProfile?->identity_card_number ?? '-',
                    'created_at' => $user->created_at->format('d/m/Y'),
                    'orders' => $user->orders->map(function ($order) {
                        return [
                            'id' => $order->id,
                            'order_number' => $order->order_number,
                            'expected_pickup_datetime' => \Carbon\Carbon::parse($order->expected_pickup_datetime)->format('d M Y, H:i'),
                            'actual_return_datetime' => $order->actual_return_datetime ? \Carbon\Carbon::parse($order->actual_return_datetime)->format('d M Y, H:i') : '-',
                            'rental_subtotal' => $order->rental_subtotal,
                            'status' => $order->order_status,
                        ];
                    }),
                ];
            });

        return Inertia::render('Admin/Customer/Index', [
            'customers' => $customers
        ]);
    }
}
