<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Order;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    /**
     * Display the admin dashboard.
     */
    public function index(): Response
    {
        $now = Carbon::now();

        // 1. Pesanan Baru — orders with status 'pending'
        $newOrdersCount = Order::where('order_status', 'pending')->count();

        // 2. Alat Disewakan — orders with status 'active' (sedang disewa)
        $activeRentalsCount = Order::where('order_status', 'active')->count();

        // 3. Terlambat — active orders past their expected return datetime
        $lateOrdersCount = Order::where('order_status', 'active')
            ->where('expected_return_datetime', '<', $now)
            ->count();

        // 4. Total Pendapatan bulan ini (dari pesanan completed)
        $currentMonthRevenue = Order::where('order_status', 'completed')
            ->whereMonth('updated_at', $now->month)
            ->whereYear('updated_at', $now->year)
            ->sum('grand_total');

        // Pendapatan bulan lalu (untuk persentase perubahan)
        $lastMonth = $now->copy()->subMonth();
        $lastMonthRevenue = Order::where('order_status', 'completed')
            ->whereMonth('updated_at', $lastMonth->month)
            ->whereYear('updated_at', $lastMonth->year)
            ->sum('grand_total');

        $revenueChangePercent = $lastMonthRevenue > 0
            ? round((($currentMonthRevenue - $lastMonthRevenue) / $lastMonthRevenue) * 100, 1)
            : ($currentMonthRevenue > 0 ? 100 : 0);

        // 5. Chart Data — pendapatan 6 bulan terakhir
        $chartData = [];
        for ($i = 5; $i >= 0; $i--) {
            $month = $now->copy()->subMonths($i);
            $revenue = Order::where('order_status', 'completed')
                ->whereMonth('updated_at', $month->month)
                ->whereYear('updated_at', $month->year)
                ->sum('grand_total');

            $chartData[] = [
                'name' => $month->translatedFormat('M'),
                'pendapatan' => round((float) $revenue / 1000000, 2), // Convert to juta
            ];
        }

        // 6. Perlu Tindakan — pending orders + active late orders, max 5
        $actionOrders = Order::with(['user.customerProfile'])
            ->where(function ($query) use ($now) {
                $query->where('order_status', 'pending')
                    ->orWhere(function ($q) use ($now) {
                        $q->where('order_status', 'active')
                          ->where('expected_return_datetime', '<', $now);
                    });
            })
            ->latest()
            ->limit(5)
            ->get()
            ->map(function ($order) use ($now) {
                $isLate = $order->order_status === 'active'
                    && $order->expected_return_datetime < $now;

                return [
                    'id' => $order->id,
                    'order_number' => $order->order_number,
                    'customer_name' => $order->user?->name ?? 'Pelanggan Offline',
                    'customer_phone' => $order->user?->customerProfile?->phone_number ?? '-',
                    'status' => $isLate ? 'late' : $order->order_status,
                    'date' => $order->created_at->format('d/m/Y'),
                ];
            });

        return Inertia::render('Admin/Dashboard', [
            'stats' => [
                'newOrders' => $newOrdersCount,
                'activeRentals' => $activeRentalsCount,
                'lateOrders' => $lateOrdersCount,
                'currentMonthRevenue' => (float) $currentMonthRevenue,
                'revenueChangePercent' => $revenueChangePercent,
            ],
            'chartData' => $chartData,
            'actionOrders' => $actionOrders,
        ]);
    }

    public function markNotificationRead(\Illuminate\Http\Request $request)
    {
        $request->validate([
            'notification_id' => 'required|string',
        ]);

        \App\Models\UserReadNotification::firstOrCreate([
            'user_id' => auth()->id(),
            'notification_id' => $request->notification_id,
        ]);

        return redirect()->back();
    }
}
