<?php

namespace App\Http\Controllers\Client;

use App\Http\Controllers\Controller;
use App\Models\Equipment;
use App\Models\Order;
use App\Models\OrderItem;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class BookingController extends Controller
{
    /**
     * Display the booking form.
     */
    public function create(Request $request): Response
    {
        $cart = json_decode($request->query('cart', '[]'), true) ?: [];
        $settings = \App\Models\Setting::pluck('value', 'key')->toArray();
        
        return Inertia::render('Client/Booking/Create', [
            'cart' => $cart,
            'settings' => $settings
        ]);
    }

    /**
     * Store a new client booking/order via API.
     */
    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'ktp' => 'required|image|max:2048',
            'payment_proof' => 'required|image|max:2048',
            'cart' => 'required|string',
            'agree_tnc' => 'accepted',
            'expected_pickup_datetime' => 'required|date',
            'expected_return_datetime' => 'required|date|after:expected_pickup_datetime',
            'payment_type' => 'required|in:dp_30,full_payment',
        ]);

        $cart = json_decode($request->input('cart'), true);
        if (empty($cart)) {
            return response()->json(['errors' => ['cart' => ['Keranjang kosong']]], 422);
        }

        // Upload files
        $ktpPath = $request->file('ktp')->store('bookings/ktp', 'public');
        $paymentProofPath = $request->file('payment_proof')->store('bookings/payment_proof', 'public');

        return DB::transaction(function () use ($cart, $ktpPath, $paymentProofPath, $request) {
            // Calculate rental days
            $pickup = Carbon::parse($request->input('expected_pickup_datetime'));
            $return = Carbon::parse($request->input('expected_return_datetime'));
            $diffHours = $pickup->diffInHours($return);
            $maxDays = max(1, (int) ceil($diffHours / 24));

            // 1. Calculate rental subtotal & validate stock
            $rentalSubtotal = 0;
            $depositTotal = 0;
            $orderItemsData = [];

            foreach ($cart as $cartItem) {
                $equipment = Equipment::where('id', $cartItem['id'])->lockForUpdate()->first();

                if (!$equipment) {
                    throw ValidationException::withMessages([
                        'cart' => "Alat '{$cartItem['name']}' tidak ditemukan di sistem."
                    ]);
                }

                $qty = (int) ($cartItem['qty'] ?? 1);
                
                if ($qty > $equipment->available_stock) {
                    throw ValidationException::withMessages([
                        'cart' => "Stok alat '{$equipment->name}' tidak mencukupi. (Tersedia: {$equipment->available_stock}, Diminta: {$qty})"
                    ]);
                }

                $itemRentalPrice = $equipment->price_per_day * $maxDays * $qty;
                $itemDepositPrice = ($equipment->deposit_amount ?? 0) * $qty;

                $rentalSubtotal += $itemRentalPrice;
                $depositTotal += $itemDepositPrice;

                $orderItemsData[] = [
                    'equipment_id' => $equipment->id,
                    'qty' => $qty,
                    'price_per_day_at_rent' => $equipment->price_per_day,
                    'deposit_amount_at_rent' => $equipment->deposit_amount ?? 0,
                    'penalty_hourly_rate_at_rent' => $equipment->penalty_hourly_rate ?? 0,
                ];

                // Deduct stock
                $equipment->available_stock -= $qty;
                $equipment->save();
            }

            $grandTotal = $rentalSubtotal;

            // 2. Generate Order Number: ORD-ddmmyy-001
            $datePrefix = now()->format('dmy');
            $lastOrder = Order::whereYear('created_at', now()->year)
                ->whereMonth('created_at', now()->month)
                ->orderBy('id', 'desc')
                ->lockForUpdate()
                ->first();

            $runningNumber = 1;
            if ($lastOrder && preg_match('/(\d+)$/', $lastOrder->order_number, $matches)) {
                $runningNumber = (int) $matches[1] + 1;
            }

            $orderNumber = 'ORD-' . $datePrefix . '-' . str_pad($runningNumber, 3, '0', STR_PAD_LEFT);

            // 3. Create Order
            $order = Order::create([
                'order_number' => $orderNumber,
                'user_id' => auth()->id(),
                'order_source' => 'online',
                'retained_id_type' => 'ktp',
                'ktp_path' => $ktpPath,
                'payment_proof_path' => $paymentProofPath,
                'expected_pickup_datetime' => Carbon::parse($request->input('expected_pickup_datetime')),
                'expected_return_datetime' => Carbon::parse($request->input('expected_return_datetime')),
                'rental_subtotal' => $rentalSubtotal,
                'deposit_total' => $depositTotal,
                'grand_total' => $grandTotal,
                'payment_type' => $request->input('payment_type'),
                'payment_method' => 'qris',
                'payment_status' => 'verifying',
                'order_status' => 'pending',
                'payment_due_datetime' => now()->addHour(),
            ]);

            // 4. Create Order Items
            foreach ($orderItemsData as $itemData) {
                $order->items()->create($itemData);
            }

            return response()->json([
                'success' => true,
                'message' => 'Pesanan berhasil dibuat dan sedang diverifikasi.',
                'redirect' => route('client.booking.index')
            ]);
        });
    }

    /**
     * Display booking history for authenticated client.
     */
    public function index(): Response
    {
        return Inertia::render('Client/Booking/Index');
    }
}
