<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Struk Pesanan #{{ $order->order_number }}</title>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

        body {
            font-family: 'Inter', sans-serif;
            font-size: 14px;
            color: #333;
            background-color: #f3f4f6;
            margin: 0;
            padding: 20px;
            display: flex;
            justify-content: center;
        }

        .receipt-container {
            width: 100%;
            max-width: 800px;
            background: #fff;
            padding: 40px;
            box-sizing: border-box;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
            border-radius: 8px;
        }

        .text-center { text-align: center; }
        .text-left { text-align: left; }
        .text-right { text-align: right; }
        .font-bold { font-weight: 700; }
        .font-semibold { font-weight: 600; }
        .text-gray-500 { color: #6b7280; }
        
        .header {
            margin-bottom: 30px;
            border-bottom: 2px solid #e5e7eb;
            padding-bottom: 20px;
        }

        .header h1 {
            font-size: 24px;
            margin: 0 0 5px 0;
            color: #111827;
        }

        .header p {
            margin: 0 0 5px 0;
            font-size: 14px;
            color: #4b5563;
        }

        .info-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
            margin-bottom: 30px;
        }

        .info-box {
            background: #f9fafb;
            padding: 15px;
            border-radius: 6px;
            border: 1px solid #e5e7eb;
        }

        .info-table {
            width: 100%;
            font-size: 13px;
        }

        .info-table td {
            padding: 4px 0;
        }

        .info-table td:first-child {
            font-weight: 600;
            color: #4b5563;
            width: 120px;
        }

        table.items-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 30px;
        }

        table.items-table th {
            background-color: #f3f4f6;
            color: #374151;
            font-weight: 600;
            text-align: left;
            padding: 12px;
            border-top: 1px solid #e5e7eb;
            border-bottom: 1px solid #e5e7eb;
        }

        table.items-table td {
            padding: 12px;
            border-bottom: 1px solid #e5e7eb;
        }

        .totals-container {
            width: 100%;
            display: flex;
            justify-content: flex-end;
            margin-bottom: 30px;
        }

        table.totals-table {
            width: 350px;
        }

        table.totals-table td {
            padding: 8px 12px;
        }

        table.totals-table td.label {
            text-align: left;
            color: #4b5563;
            font-weight: 500;
        }

        table.totals-table td.value {
            text-align: right;
            font-weight: 600;
        }

        .grand-total {
            font-size: 18px;
            font-weight: 700;
            color: #111827;
            background-color: #f3f4f6;
        }

        .terbilang-box {
            background-color: #f0fdf4;
            border: 1px solid #bbf7d0;
            padding: 15px;
            border-radius: 6px;
            margin-bottom: 30px;
        }

        .terbilang-title {
            font-size: 12px;
            color: #166534;
            font-weight: 600;
            margin-bottom: 4px;
            text-transform: uppercase;
        }

        .terbilang-text {
            font-size: 14px;
            color: #15803d;
            font-style: italic;
            font-weight: 500;
        }

        .footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 2px solid #e5e7eb;
            text-align: center;
            font-size: 13px;
            color: #6b7280;
        }

        .badges {
            display: flex;
            gap: 10px;
        }

        .badge {
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 11px;
            font-weight: 700;
            text-transform: uppercase;
        }

        .badge-online { background: #e0e7ff; color: #4338ca; }
        .badge-offline { background: #f3f4f6; color: #4b5563; }
        .badge-lunas { background: #dcfce3; color: #166534; }
        .badge-dp { background: #ffedd5; color: #c2410c; }

        /* Hide elements on print */
        @media print {
            @page {
                margin: 0;
                size: A4 portrait;
            }
            body {
                background-color: #fff;
                padding: 0;
            }
            .receipt-container {
                box-shadow: none;
                border: none;
                padding: 20px;
                max-width: 100%;
            }
            .no-print {
                display: none;
            }
        }
        
        .print-btn {
            display: inline-block;
            padding: 10px 20px;
            background-color: #10b981;
            color: #fff;
            text-align: center;
            border: none;
            border-radius: 6px;
            cursor: pointer;
            font-family: inherit;
            font-weight: 600;
            font-size: 14px;
            margin-bottom: 20px;
            transition: background-color 0.2s;
        }

        .print-btn:hover {
            background-color: #059669;
        }
    </style>
</head>
<body>

    <div class="receipt-container">
        <!-- Print Button (Hidden on Print) -->
        <div class="no-print text-center">
            <button class="print-btn" onclick="window.print()">🖨️ Cetak Nota (A4)</button>
        </div>

        <!-- Header -->
        <div class="header">
            <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                <div>
                    <h1>TIGA TITIK OUTDOOR</h1>
                    <p>Rental Alat Camping & Outdoor</p>
                    <p>Jl. Contoh No. 123, Kota Anda</p>
                    <p>Telp: 0812-3456-7890</p>
                </div>
                <div style="text-align: right;">
                    <h2 style="margin: 0 0 10px 0; color: #4b5563;">NOTA PENYEWAAN</h2>
                    <div class="badges" style="justify-content: flex-end;">
                        <span class="badge {{ $order->order_source === 'online' ? 'badge-online' : 'badge-offline' }}">
                            {{ $order->order_source === 'online' ? 'Online' : 'Offline' }}
                        </span>
                        <span class="badge {{ $order->payment_type === 'full_payment' ? 'badge-lunas' : 'badge-dp' }}">
                            {{ $order->payment_type === 'full_payment' ? 'Lunas' : 'DP 30%' }}
                        </span>
                    </div>
                </div>
            </div>
        </div>

        <!-- Order Info -->
        <div class="info-grid">
            <div class="info-box">
                <table class="info-table">
                    <tr>
                        <td>No. Nota</td>
                        <td>: <strong>{{ $order->order_number }}</strong></td>
                    </tr>
                    <tr>
                        <td>Tanggal</td>
                        <td>: {{ now()->format('d/m/Y H:i') }}</td>
                    </tr>
                    <tr>
                        <td>Kasir</td>
                        <td>: {{ auth()->user()->name ?? 'Admin' }}</td>
                    </tr>
                </table>
            </div>
            <div class="info-box">
                <table class="info-table">
                    <tr>
                        <td>Pelanggan</td>
                        <td>: <strong>{{ $order->user->name ?? $order->guest_name ?? 'Pelanggan Walk-in' }}</strong></td>
                    </tr>
                    <tr>
                        <td>No. HP</td>
                        <td>: {{ $order->user->customerProfile->phone_number ?? $order->guest_phone ?? '-' }}</td>
                    </tr>
                    <tr>
                        <td>Durasi</td>
                        <td>: {{ \Carbon\Carbon::parse($order->expected_pickup_datetime)->diffInDays(\Carbon\Carbon::parse($order->expected_return_datetime)) }} Hari</td>
                    </tr>
                </table>
            </div>
        </div>

        <!-- Items -->
        <table class="items-table">
            <thead>
                <tr>
                    <th style="width: 50%;">Nama Barang</th>
                    <th class="text-center" style="width: 10%;">Qty</th>
                    <th class="text-right" style="width: 20%;">Harga/Hari</th>
                    <th class="text-right" style="width: 20%;">Subtotal</th>
                </tr>
            </thead>
            <tbody>
                @foreach($order->items as $item)
                <tr>
                    <td>
                        <span class="font-semibold">{{ $item->equipment->name ?? $item->name }}</span>
                    </td>
                    <td class="text-center">{{ $item->qty }}</td>
                    <td class="text-right">Rp {{ number_format($item->price_per_day_at_rent, 0, ',', '.') }}</td>
                    <td class="text-right font-semibold">
                        @php
                            $days = \Carbon\Carbon::parse($order->expected_pickup_datetime)->diffInDays(\Carbon\Carbon::parse($order->expected_return_datetime));
                            $days = $days > 0 ? $days : 1;
                            $subtotal = $item->qty * $item->price_per_day_at_rent * $days;
                        @endphp
                        Rp {{ number_format($subtotal, 0, ',', '.') }}
                    </td>
                </tr>
                @endforeach
            </tbody>
        </table>

        <div class="totals-container">
            <!-- Totals -->
            <table class="totals-table">
                <tr>
                    <td class="label">Subtotal Sewa</td>
                    <td class="value">Rp {{ number_format($order->rental_subtotal ?? $order->total_rental_price, 0, ',', '.') }}</td>
                </tr>
                <tr>
                    <td class="label">Total Deposit</td>
                    <td class="value">Rp {{ number_format($order->deposit_total ?? $order->total_deposit, 0, ',', '.') }}</td>
                </tr>
                <tr class="grand-total">
                    <td class="label" style="color: inherit;">Total Tagihan</td>
                    <td class="value">Rp {{ number_format($order->grand_total ?? $order->total_price, 0, ',', '.') }}</td>
                </tr>
                
                @if($order->payment_type === 'dp_30')
                <tr>
                    <td class="label" style="color: #c2410c;">Telah Dibayar (DP)</td>
                    <td class="value" style="color: #c2410c;">Rp {{ number_format(($order->rental_subtotal ?? $order->total_rental_price) * 0.3, 0, ',', '.') }}</td>
                </tr>
                <tr>
                    <td class="label font-bold" style="color: #b91c1c;">Sisa Pembayaran</td>
                    <td class="value font-bold" style="color: #b91c1c;">Rp {{ number_format(($order->rental_subtotal ?? $order->total_rental_price) * 0.7, 0, ',', '.') }}</td>
                </tr>
                @endif
                
                <!-- Pengembalian (Bila selesai) -->
                @if($order->order_status === 'completed')
                    <tr><td colspan="2"><hr style="border-color:#e5e7eb; margin: 10px 0;"></td></tr>
                    <tr>
                        <td colspan="2" class="text-center font-bold" style="color: #4b5563;">RINCIAN PENGEMBALIAN</td>
                    </tr>
                    
                    @if($order->late_fee_total > 0)
                    <tr>
                        <td class="label">Denda Terlambat</td>
                        <td class="value text-red-600">- Rp {{ number_format($order->late_fee_total, 0, ',', '.') }}</td>
                    </tr>
                    @endif

                    @if($order->damage_fee_total > 0)
                    <tr>
                        <td class="label">Denda Rusak</td>
                        <td class="value text-red-600">- Rp {{ number_format($order->damage_fee_total, 0, ',', '.') }}</td>
                    </tr>
                    @endif
                    
                    @if($order->refund_admin_fee > 0)
                    <tr>
                        <td class="label">Biaya Admin</td>
                        <td class="value text-red-600">- Rp {{ number_format($order->refund_admin_fee, 0, ',', '.') }}</td>
                    </tr>
                    @endif

                    <tr class="grand-total" style="background-color: #f0fdf4;">
                        @php
                            $deposit_total = $order->deposit_total ?? $order->total_deposit;
                            $net_refund = $deposit_total - ($order->late_fee_total + $order->damage_fee_total + $order->refund_admin_fee);
                        @endphp
                        <td class="label" style="color: #166534;">{{ $net_refund < 0 ? 'Kekurangan Bayar' : 'Total Refund' }}</td>
                        <td class="value" style="color: #166534;">Rp {{ number_format(abs($net_refund), 0, ',', '.') }}</td>
                    </tr>
                @endif
            </table>
        </div>

        <!-- Terbilang -->
        <div class="terbilang-box">
            <div class="terbilang-title">Terbilang (Total Tagihan)</div>
            <div class="terbilang-text">
                # {{ \App\Helpers\TerbilangHelper::formatRupiah($order->grand_total ?? $order->total_price) }} #
            </div>
        </div>

        <!-- Footer -->
        <div class="footer">
            <p class="font-bold" style="font-size: 15px; margin-bottom: 5px; color: #111827;">Terima Kasih Atas Kepercayaan Anda</p>
            <p style="margin-bottom: 15px;">Syarat dan ketentuan berlaku. Barang yang sudah disewa menjadi tanggung jawab penyewa sepenuhnya.</p>
            
            <div style="display: flex; justify-content: space-between; margin-top: 40px; padding: 0 40px;">
                <div class="text-center">
                    <p style="margin-bottom: 60px;">Hormat Kami,</p>
                    <p class="font-semibold" style="text-decoration: underline;">Tiga Titik Outdoor</p>
                </div>
                <div class="text-center">
                    <p style="margin-bottom: 60px;">Penyewa,</p>
                    <p class="font-semibold" style="text-decoration: underline;">{{ $order->user->name ?? $order->guest_name ?? '......................' }}</p>
                </div>
            </div>
        </div>

    </div>

    <!-- Auto Print Script -->
    <script>
        window.onload = function() {
            // Uncomment to auto print
            // setTimeout(function() {
            //     window.print();
            // }, 500); 
        }
    </script>
</body>
</html>
