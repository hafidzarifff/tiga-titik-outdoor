<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Order;
use App\Models\Equipment;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class CancelUnpaidOrders extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'orders:cancel-unpaid';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Membatalkan pesanan yang belum dibayar hingga batas waktu pembayaran berakhir';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        // Cari order yang statusnya pending dan waktu saat ini telah melewati payment_due_datetime
        $expiredOrders = Order::with('items')
            ->where('order_status', 'pending')
            ->whereNotNull('payment_due_datetime')
            ->where('payment_due_datetime', '<', now())
            ->get();

        if ($expiredOrders->isEmpty()) {
            return;
        }

        foreach ($expiredOrders as $order) {
            DB::transaction(function () use ($order) {
                // Kunci (lock) baris order agar tidak dimodifikasi proses lain secara bersamaan
                $lockedOrder = Order::where('id', $order->id)->lockForUpdate()->first();
                
                // Pastikan status masih valid, jangan sampai double eksekusi
                if ($lockedOrder->order_status !== 'pending') {
                    return; 
                }

                $restoredCount = 0;
                $details = [];

                // Looping item pesanan untuk MENGEMBALIKAN stok master peralatan
                foreach ($order->items as $item) {
                    $equipment = Equipment::where('id', $item->equipment_id)->lockForUpdate()->first();
                    if ($equipment) {
                        $equipment->available_stock += $item->qty; // TAMBAHKAN KEMBALI STOK
                        $equipment->save();
                        
                        $restoredCount += $item->qty;
                        $details[] = "ID {$equipment->id} (+{$item->qty})";
                    }
                }

                // Ubah status
                $lockedOrder->order_status = 'cancelled';
                $lockedOrder->payment_status = 'forfeited';
                $lockedOrder->save();

                $detailsStr = implode(', ', $details);

                // Tulis catatan ke sistem Log
                Log::info("AUTO-CANCEL: Pesanan [{$lockedOrder->order_number}] dibatalkan otomatis karena melebihi batas bayar. Total stok dikembalikan: {$restoredCount} buah ({$detailsStr}).");
            });
        }
    }
}
