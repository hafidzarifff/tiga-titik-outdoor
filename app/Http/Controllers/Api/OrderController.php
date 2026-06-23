<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreOrderRequest;
use App\Models\Equipment;
use App\Models\Order;
use App\Models\User;
use App\Models\CustomerProfile;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;
use Illuminate\Support\Str;

class OrderController extends Controller
{
    /**
     * Display a listing of orders.
     */
    public function index(\Illuminate\Http\Request $request)
    {
        $status = $request->query('status');
        $shortfall = $request->query('shortfall');
        
        $query = Order::with(['user.customerProfile', 'items.equipment.images'])->latest();
        
        if ($status) {
            $query->where('order_status', $status);
        }

        if ($shortfall === 'unpaid') {
            $query->where('order_status', 'completed')
                  ->whereRaw('(late_fee_total + damage_fee_total + refund_admin_fee) > deposit_total')
                  ->where('is_shortfall_paid', false);
        }
        
        $orders = $query->get();
        
        $counts = [
            'pending' => Order::where('order_status', 'pending')->count(),
            'booked' => Order::where('order_status', 'booked')->count(),
            'active' => Order::where('order_status', 'active')->count(),
            'completed' => Order::where('order_status', 'completed')->count(),
            'hutang_denda' => Order::where('order_status', 'completed')
                                   ->whereRaw('(late_fee_total + damage_fee_total + refund_admin_fee) > deposit_total')
                                   ->where('is_shortfall_paid', false)
                                   ->count(),
        ];
        
        return response()->json([
            'success' => true,
            'message' => 'Daftar pesanan berhasil dimuat.',
            'data' => $orders,
            'counts' => $counts,
        ], 200);
    }

    /**
     * Store a newly created order / transaction.
     */
    public function store(StoreOrderRequest $request)
    {
        $validated = $request->validated();

        // Gunakan DB::transaction agar jika salah satu insert gagal, semua di-rollback
        return DB::transaction(function () use ($validated, $request) {
            
            // 1. Hitung Durasi (Siklus 24 Jam)
            $pickup = Carbon::parse($validated['expected_pickup_datetime']);
            $return = Carbon::parse($validated['expected_return_datetime']);
            
            // Menghitung total jam sewa penuh
            $diffInHours = $pickup->diffInHours($return);
            
            // Pembulatan ke atas: Jika > 24 jam sedikit saja, dihitung hari berikutnya
            // Minimal masa sewa adalah 1 hari
            $rentalDays = max(1, ceil($diffInHours / 24));

            // 2. Kalkulasi Subtotal & Pengecekan Stok
            $rentalSubtotal = 0;
            $depositTotal = 0;
            $orderItemsData = [];
            $equipmentsToUpdate = [];

            foreach ($validated['items'] as $itemReq) {
                // lockForUpdate() sangat krusial di sini agar tidak ada race-condition (Overbooking) saat traffic tinggi
                $equipment = Equipment::where('id', $itemReq['equipment_id'])->lockForUpdate()->first();
                
                if (!$equipment) {
                    throw ValidationException::withMessages([
                        'items' => "Alat dengan ID {$itemReq['equipment_id']} tidak ditemukan."
                    ]);
                }

                // Cek ketersediaan stok
                if ($itemReq['qty'] > $equipment->available_stock) {
                    throw ValidationException::withMessages([
                        "items" => "Stok alat '{$equipment->name}' tidak mencukupi. (Tersedia: {$equipment->available_stock}, Diminta: {$itemReq['qty']})"
                    ]);
                }

                // Kalkulasi harga berdasar hari & qty
                $itemRentalPrice = $equipment->price_per_day * $rentalDays * $itemReq['qty'];
                
                // Deposit flat sesuai jumlah barang, tidak dikalikan hari
                $itemDepositPrice = $equipment->deposit_amount * $itemReq['qty'];

                $rentalSubtotal += $itemRentalPrice;
                $depositTotal += $itemDepositPrice;

                // Mempersiapkan payload item yang berisi SNAPSHOT dari harga master saat ini
                $orderItemsData[] = [
                    'equipment_id' => $equipment->id,
                    'qty' => $itemReq['qty'],
                    'price_per_day_at_rent' => $equipment->price_per_day,
                    'deposit_amount_at_rent' => $equipment->deposit_amount,
                    'penalty_hourly_rate_at_rent' => $equipment->penalty_hourly_rate,
                ];

                // WAJIB KETAT: Kurangi stok alat secara langsung untuk semua transaksi (online/offline)
                $equipment->available_stock -= $itemReq['qty'];
                $equipment->save();
            }

            $grandTotal = $rentalSubtotal;

            // 3. Set Status Awal, Jatuh Tempo, & Generate Identifier
            // Format Order Number: ORD-ddmmyy-001 (Reset tiap bulan)
            $datePrefix = now()->format('dmy');
            
            // Mencari transaksi terakhir di bulan ini untuk mendapatkan sequence
            $lastOrder = Order::whereYear('created_at', now()->year)
                ->whereMonth('created_at', now()->month)
                ->orderBy('id', 'desc')
                ->lockForUpdate() // Mencegah race condition saat pembuatan bersamaan
                ->first();

            $runningNumber = 1;
            if ($lastOrder && preg_match('/-(\d+)$/', $lastOrder->order_number, $matches)) {
                $runningNumber = (int) $matches[1] + 1;
            }

            $orderNumber = 'ORD-' . $datePrefix . '-' . str_pad($runningNumber, 3, '0', STR_PAD_LEFT);
            
            $orderStatus = 'pending';
            $paymentStatus = 'verifying';
            $paymentDueDatetime = now()->addHour(); // Batas waktu bayar DP 1 jam untuk online
            
            if ($validated['order_source'] === 'offline') {
                $orderStatus = 'active'; // Langsung aktif karena barang dibawa saat itu juga
                $paymentStatus = 'paid'; // Dianggap lunas di kasir
                $paymentDueDatetime = null; // Langsung lunas, tidak butuh batas waktu
            }

            // Memastikan payment_method fallback karena mungkin divalidasi di input form (misalnya default cash)
            $paymentMethod = $request->input('payment_method', 'cash'); 

            // 4. Manajemen Pelanggan (Inline Customer Creation)
            $userId = auth()->id() ?? null;
            if ($validated['order_source'] === 'offline') {
                $profile = CustomerProfile::where('phone_number', $validated['guest_phone'])->first();
                if ($profile) {
                    $userId = $profile->user_id;
                } else {
                    // Buat user baru jika belum pernah ada
                    $user = User::create([
                        'name' => $validated['guest_name'],
                        'email' => strtolower(Str::random(10)) . '@offline.local',
                        'password' => Hash::make(Str::random(12)),
                        'role' => 'customer',
                    ]);
                    $user->customerProfile()->create([
                        'phone_number' => $validated['guest_phone'],
                        'address' => '-',
                        'identity_card_number' => '-',
                        'registration_date' => now(),
                    ]);
                    $userId = $user->id;
                }
            }

            // 5. Simpan Data Induk Pesanan (Order)
            $order = Order::create([
                'order_number' => $orderNumber,
                'user_id' => $userId,
                'order_source' => $validated['order_source'],
                'retained_id_type' => $validated['retained_id_type'] ?? 'none',
                'expected_pickup_datetime' => $validated['expected_pickup_datetime'],
                'expected_return_datetime' => $validated['expected_return_datetime'],
                'rental_subtotal' => $rentalSubtotal,
                'deposit_total' => $depositTotal,
                'grand_total' => $grandTotal,
                'payment_type' => $validated['payment_type'],
                'payment_method' => $paymentMethod,
                'payment_status' => $paymentStatus,
                'order_status' => $orderStatus,
                'payment_due_datetime' => $paymentDueDatetime,
            ]);

            // Simpan detail/history items dari pesanan secara bulk / multiple
            foreach ($orderItemsData as $itemData) {
                $order->items()->create($itemData);
            }

            // Return response dengan me-load relation (items dan alat-alatnya)
            return response()->json([
                'success' => true,
                'message' => 'Transaksi penyewaan berhasil dibuat.',
                'data' => $order->load('items.equipment')
            ], 201);
        });
    }

    /**
     * Memverifikasi pembayaran pesanan.
     */
    public function approvePayment(Order $order)
    {
        // 1. Validasi Keadaan (State Check)
        if ($order->order_status !== 'pending') {
            return response()->json([
                'success' => false,
                'message' => 'Pesanan tidak dalam status menunggu pembayaran.'
            ], 400); // 400 Bad Request
        }

        // 2. Pembaruan Data (Update Logic) dibungkus Transaction
        DB::transaction(function () use ($order) {
            // Gunakan Pessimistic Locking untuk menghindari Race Condition
            $lockedOrder = Order::where('id', $order->id)->lockForUpdate()->first();

            if ($lockedOrder->order_status !== 'pending') {
                return;
            }

            $lockedOrder->order_status = 'booked'; // Barang siap diambil
            
            // Set payment status berdasarkan tipe bayarnya
            if ($lockedOrder->payment_type === 'dp_30') {
                $lockedOrder->payment_status = 'partial';
            } else {
                $lockedOrder->payment_status = 'paid';
            }

            // KRUSIAL: Hilangkan batas jatuh tempo agar lolos dari penyisiran Cron Job CancelUnpaidOrders
            $lockedOrder->payment_due_datetime = null;
            
            $lockedOrder->save();
        });

        // Kembalikan response json sukses
        return response()->json([
            'success' => true,
            'message' => 'Pembayaran berhasil diverifikasi. Status pesanan diubah menjadi booked.',
            'data' => $order->fresh()
        ], 200);
    }

    /**
     * Menolak pesanan dan mengembalikan stok barang.
     */
    public function rejectPayment(Order $order)
    {
        if ($order->order_status !== 'pending') {
            return response()->json([
                'success' => false,
                'message' => 'Pesanan tidak dalam status menunggu, tidak dapat ditolak.'
            ], 400);
        }

        DB::transaction(function () use ($order) {
            $lockedOrder = Order::where('id', $order->id)->lockForUpdate()->first();

            if ($lockedOrder->order_status !== 'pending') {
                return;
            }

            // Kembalikan stok barang
            foreach ($order->items as $item) {
                $equipment = Equipment::where('id', $item->equipment_id)->lockForUpdate()->first();
                if ($equipment) {
                    $equipment->available_stock += $item->qty;
                    $equipment->save();
                }
            }

            $lockedOrder->order_status = 'cancelled';
            $lockedOrder->payment_status = 'unpaid';
            $lockedOrder->payment_due_datetime = null;
            $lockedOrder->save();
        });

        return response()->json([
            'success' => true,
            'message' => 'Pesanan berhasil ditolak dan stok barang telah dikembalikan.',
            'data' => $order->fresh()
        ], 200);
    }

    /**
     * Memproses penyerahan barang kepada pelanggan (Handover)
     */
    public function processHandover(\Illuminate\Http\Request $request, Order $order)
    {
        // 1. Validasi Keadaan (State Check)
        if ($order->order_status !== 'booked') {
            return response()->json([
                'success' => false,
                'message' => 'Penyerahan barang ditolak. Pesanan tidak dalam status siap diambil (booked).'
            ], 400); // 400 Bad Request
        }

        // 2. Pengecekan Pelunasan & Jaminan (Request Validation)
        $rules = [
            'is_fully_paid' => 'required|accepted', // accepted memaksa nilai true, '1', 'on', atau 'yes'
        ];
        
        $messages = [
            'is_fully_paid.accepted' => 'Anda harus mengonfirmasi bahwa seluruh sisa tagihan telah dilunasi.',
        ];

        // Jika pesanan offline, wajib ada penahanan ID (KTP/SIM/dll)
        if ($order->order_source === 'offline' && $order->retained_id_type !== 'none') {
            $rules['is_id_retained'] = 'required|accepted';
            $messages['is_id_retained.accepted'] = "Anda harus mengonfirmasi bahwa kartu {$order->retained_id_type} pelanggan telah diamankan secara fisik.";
        }

        $request->validate($rules, $messages);

        // 3. Pembaruan Data (Update Logic) dibungkus Transaction
        DB::transaction(function () use ($order) {
            $lockedOrder = Order::where('id', $order->id)->lockForUpdate()->first();

            if ($lockedOrder->order_status !== 'booked') {
                return;
            }

            // Ubah status order menjadi aktif berjalan
            $lockedOrder->order_status = 'active';
            
            // Ubah pembayaran menjadi Lunas (karena admin sudah konfirmasi is_fully_paid)
            $lockedOrder->payment_status = 'paid';
            
            $lockedOrder->save();
        });

        return response()->json([
            'success' => true,
            'message' => 'Penyerahan barang berhasil diproses. Masa sewa telah dimulai!',
            'data' => $order->fresh()
        ], 200);
    }

    /**
     * Mengkalkulasi (simulasi) denda keterlambatan saat akan melakukan pengembalian barang.
     */
    public function calculateReturn(Order $order)
    {
        // 1. Validasi Keadaan (State Check)
        if ($order->order_status !== 'active') {
            return response()->json([
                'success' => false,
                'message' => 'Kalkulasi denda gagal. Pesanan tidak dalam status aktif.'
            ], 400); // 400 Bad Request
        }

        // Gunakan Timezone Asia/Jakarta sesuai permintaan
        $now = Carbon::now('Asia/Jakarta');
        $expected = Carbon::parse($order->expected_return_datetime)->timezone('Asia/Jakarta');

        $lateFeeTotal = 0;

        // 2. Pengecekan Toleransi (Lebih dari 1 Jam)
        if ($now->greaterThan($expected->copy()->addHour())) {
            
            // 3. Pengecekan Denda Progresif (Melewati Batas Operasional > 21:00)
            if ($now->format('H:i:s') > '21:00:00') {
                // Kena denda 1 hari sewa penuh
                foreach ($order->items as $item) {
                    $lateFeeTotal += ($item->qty * $item->price_per_day_at_rent);
                }
            } else {
                // Hitung selisih jam (menggunakan selisih menit dibagi 60 agar presisi pembulatannya benar)
                $hoursLate = ceil($expected->diffInMinutes($now) / 60);

                // Kena denda per jam
                foreach ($order->items as $item) {
                    $lateFeeTotal += ($hoursLate * $item->qty * $item->penalty_hourly_rate_at_rent);
                }
            }
        }

        return response()->json([
            'success' => true,
            'message' => 'Kalkulasi pengembalian barang berhasil ditarik.',
            'data' => [
                'current_return_time' => $now->format('Y-m-d H:i:s'),
                'late_fee_total' => $lateFeeTotal,
                'deposit_total' => $order->deposit_total,
                'is_late' => $lateFeeTotal > 0,
            ]
        ], 200);
    }

    /**
     * Memproses penyelesaian transaksi dan pengembalian barang (Return)
     */
    public function processReturn(\Illuminate\Http\Request $request, Order $order)
    {
        // 1. Validasi Keadaan (State Check)
        if ($order->order_status !== 'active') {
            return response()->json([
                'success' => false,
                'message' => 'Proses return gagal. Pesanan tidak dalam status aktif.'
            ], 400); // 400 Bad Request
        }

        // 2. Validasi Input Admin (Kerusakan & Admin Fee)
        $validated = $request->validate([
            'damage_fee_total' => 'required|numeric|min:0',
            'refund_admin_fee' => 'required|numeric|min:0',
        ]);

        // 3. Kalkulasi Ulang Keterlambatan (Security Check via Backend)
        $now = Carbon::now('Asia/Jakarta');
        $expected = Carbon::parse($order->expected_return_datetime)->timezone('Asia/Jakarta');
        $lateFeeTotal = 0;

        if ($now->greaterThan($expected->copy()->addHour())) {
            if ($now->format('H:i:s') > '21:00:00') {
                foreach ($order->items as $item) {
                    $lateFeeTotal += ($item->qty * $item->price_per_day_at_rent);
                }
            } else {
                $hoursLate = ceil($expected->diffInMinutes($now) / 60);
                foreach ($order->items as $item) {
                    $lateFeeTotal += ($hoursLate * $item->qty * $item->penalty_hourly_rate_at_rent);
                }
            }
        }

        // 4. Kalkulasi Pencairan Deposit
        $totalDeduction = $lateFeeTotal + $validated['damage_fee_total'] + $validated['refund_admin_fee'];
        $netRefund = $order->deposit_total - $totalDeduction;

        // 5. Pembaruan Database (DB::transaction & Pessimistic Locking)
        DB::transaction(function () use ($order, $now, $lateFeeTotal, $validated, &$restoredCount) {
            $lockedOrder = Order::where('id', $order->id)->lockForUpdate()->first();

            if ($lockedOrder->order_status !== 'active') {
                return;
            }

            // Restock Barang
            $restoredCount = 0;
            foreach ($order->items as $item) {
                $equipment = Equipment::where('id', $item->equipment_id)->lockForUpdate()->first();
                if ($equipment) {
                    $equipment->available_stock += $item->qty;
                    $equipment->save();
                    $restoredCount += $item->qty;
                }
            }

            // Update Data Order
            $lockedOrder->actual_return_datetime = $now->format('Y-m-d H:i:s');
            $lockedOrder->late_fee_total = $lateFeeTotal;
            $lockedOrder->damage_fee_total = $validated['damage_fee_total'];
            $lockedOrder->refund_admin_fee = $validated['refund_admin_fee'];
            
            // Catatan: Karena 'completed_with_issue' tidak ada di definisi enum DB awal, 
            // kita menggunakan 'completed' namun tagihan dendanya akan menunjukkan issue-nya.
            $lockedOrder->order_status = 'completed'; 
            
            // Log Jika KTP ditahan
            if ($lockedOrder->retained_id_type !== 'none') {
                \Illuminate\Support\Facades\Log::info("RETURN PROSES: Jaminan {$lockedOrder->retained_id_type} untuk pesanan {$lockedOrder->order_number} telah diserahkan kembali kepada pelanggan.");
            }

            $lockedOrder->save();
        });

        // Response Berisi Ringkasan Tagihan/Pencairan Akhir
        return response()->json([
            'success' => true,
            'message' => 'Barang berhasil dikembalikan dan transaksi dinyatakan selesai.',
            'data' => [
                'order_number' => $order->order_number,
                'deposit_total' => $order->deposit_total,
                'late_fee_applied' => $lateFeeTotal,
                'damage_fee_applied' => $validated['damage_fee_total'],
                'refund_admin_fee_applied' => $validated['refund_admin_fee'],
                'total_deduction' => $totalDeduction,
                'net_refund' => $netRefund, // Bisa minus jika denda > deposit
                'status_message' => $netRefund < 0 ? "Deposit tidak cukup. Pelanggan wajib membayar kekurangan sebesar Rp" . number_format(abs($netRefund), 0, ',', '.') : "Sisa deposit yang dapat dikembalikan ke pelanggan sebesar Rp" . number_format($netRefund, 0, ',', '.')
            ]
        ], 200);
    }

    /**
     * Menandai pesanan yang kekurangan deposit/shortfall sebagai lunas.
     */
    public function markShortfallPaid(Order $order)
    {
        if ($order->order_status !== 'completed') {
            return response()->json(['success' => false, 'message' => 'Pesanan belum selesai.'], 400);
        }

        $totalDeduction = $order->late_fee_total + $order->damage_fee_total + $order->refund_admin_fee;
        if ($totalDeduction <= $order->deposit_total) {
            return response()->json(['success' => false, 'message' => 'Pesanan ini tidak memiliki kekurangan bayar denda.'], 400);
        }

        $order->is_shortfall_paid = true;
        $order->save();

        return response()->json([
            'success' => true,
            'message' => 'Hutang sisa denda berhasil ditandai lunas.',
            'data' => $order->fresh()
        ], 200);
    }
}
