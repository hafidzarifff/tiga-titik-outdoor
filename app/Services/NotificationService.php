<?php

namespace App\Services;

use App\Models\Order;
use App\Models\Equipment;
use Carbon\Carbon;

class NotificationService
{
    /**
     * Get live notifications for admin.
     */
    public function getAdminNotifications(): array
    {
        $notifications = [];
        $now = Carbon::now();

        // 1. Pesanan Baru Masuk
        $pendingOrders = Order::with('user')->where('order_status', 'pending')->get();
        foreach ($pendingOrders as $order) {
            $customerName = $order->user ? $order->user->name : 'Pelanggan Offline';
            $notifications[] = [
                'id' => 'new_order_' . $order->id,
                'type' => 'new_order',
                'title' => 'Pesanan Baru',
                'message' => "{$customerName} membuat pesanan baru ({$order->order_number}).",
                'time' => $order->created_at->diffForHumans(),
                'timestamp' => $order->created_at->timestamp,
                'link' => route('admin.orders.show', $order->id),
                'read' => false,
                'icon' => 'shopping-cart',
                'color' => 'blue'
            ];
        }

        // 2. Keterlambatan Pengembalian
        $lateOrders = Order::with('user')
            ->where('order_status', 'active')
            ->where('expected_return_datetime', '<', $now)
            ->get();
        
        foreach ($lateOrders as $order) {
            $customerName = $order->user ? $order->user->name : 'Pelanggan Offline';
            $hoursLate = $order->expected_return_datetime->diffInHours($now);
            $notifications[] = [
                'id' => 'late_order_' . $order->id,
                'type' => 'late_return',
                'title' => 'Terlambat Pengembalian',
                'message' => "Pesanan {$order->order_number} ({$customerName}) terlambat {$hoursLate} jam.",
                'time' => $order->expected_return_datetime->diffForHumans(),
                'timestamp' => $order->expected_return_datetime->timestamp,
                'link' => route('admin.orders.show', $order->id),
                'read' => false,
                'icon' => 'alert-triangle',
                'color' => 'red'
            ];
        }

        // 3. Stok alat menipis
        $lowStockEquipments = Equipment::where('available_stock', '<=', 2)
            ->whereColumn('available_stock', '<', 'total_stock')
            ->where('status', 'Baik')
            ->get();
        
        foreach ($lowStockEquipments as $equip) {
            $notifications[] = [
                'id' => 'low_stock_' . $equip->id,
                'type' => 'low_stock',
                'title' => 'Stok Menipis',
                'message' => "Stok alat {$equip->name} tersisa {$equip->available_stock} unit.",
                'time' => $equip->updated_at->diffForHumans(),
                'timestamp' => $equip->updated_at->timestamp,
                'link' => route('admin.equipment.index'),
                'read' => false,
                'icon' => 'package',
                'color' => 'orange'
            ];
        }

        // 4. Peringatan perawatan alat
        $maintenanceEquipments = Equipment::withSum(['orderItems as rent_count' => function ($query) {
                $query->whereHas('order', function ($q) {
                    $q->where('order_status', 'completed');
                });
            }], 'qty')
            ->where('status', 'Baik')
            ->get()
            ->filter(function ($item) {
                return $item->rent_count >= 10;
            });

        foreach ($maintenanceEquipments as $equip) {
            $notifications[] = [
                'id' => 'maintenance_' . $equip->id,
                'type' => 'maintenance',
                'title' => 'Perawatan Alat',
                'message' => "{$equip->name} telah disewa {$equip->rent_count} kali. Disarankan untuk cek kondisi.",
                'time' => now()->diffForHumans(),
                'timestamp' => now()->timestamp,
                'link' => route('admin.equipment.index'),
                'read' => false,
                'icon' => 'wrench',
                'color' => 'emerald'
            ];
        }

        // Sort descending by timestamp
        usort($notifications, function ($a, $b) {
            return $b['timestamp'] <=> $a['timestamp'];
        });

        // Filter out read notifications for the current user
        $userId = auth()->id();
        if ($userId) {
            $readIds = \App\Models\UserReadNotification::where('user_id', $userId)
                ->pluck('notification_id')
                ->toArray();
                
            $notifications = array_values(array_filter($notifications, function($notif) use ($readIds) {
                return !in_array($notif['id'], $readIds);
            }));
        }

        return $notifications;
    }
}
