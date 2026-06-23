<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Struk Pesanan #{{ $order->order_number }}</title>
    <style>
        /* CSS Khusus Printer Thermal 80mm */
        @import url('https://fonts.googleapis.com/css2?family=Courier+Prime:ital,wght@0,400;0,700;1,400;1,700&display=swap');

        body {
            font-family: 'Courier Prime', 'Courier New', Courier, monospace;
            font-size: 14px;
            color: #000;
            background-color: #fff;
            margin: 0;
            padding: 0;
            display: flex;
            justify-content: center;
        }

        .receipt-container {
            width: 80mm; /* Standar thermal 80mm */
            max-width: 100%;
            padding: 10px;
            box-sizing: border-box;
        }

        .text-center { text-align: center; }
        .text-left { text-align: left; }
        .text-right { text-align: right; }
        .font-bold { font-weight: bold; }
        
        .divider {
            border-bottom: 1px dashed #000;
            margin: 10px 0;
        }

        .divider-solid {
            border-bottom: 1px solid #000;
            margin: 10px 0;
        }

        .mb-1 { margin-bottom: 5px; }
        .mb-2 { margin-bottom: 10px; }
        .mt-2 { margin-top: 10px; }
        
        .header h1 {
            font-size: 18px;
            margin: 0 0 5px 0;
        }

        .header p {
            margin: 0;
            font-size: 12px;
        }

        table {
            width: 100%;
            border-collapse: collapse;
            font-size: 13px;
        }

        table th, table td {
            padding: 3px 0;
            vertical-align: top;
        }

        .item-row td {
            padding-bottom: 5px;
        }

        .item-name {
            display: block;
            margin-bottom: 2px;
        }

        .item-details {
            display: flex;
            justify-content: space-between;
        }

        .totals td {
            padding: 2px 0;
        }

        .totals .label {
            text-align: left;
        }

        .totals .value {
            text-align: right;
        }

        .grand-total {
            font-size: 15px;
            font-weight: bold;
        }

        .footer {
            margin-top: 20px;
            font-size: 12px;
        }

        /* Hide elements on print */
        @media print {
            @page {
                margin: 0;
                size: 80mm auto;
            }
            body {
                width: 80mm;
            }
            .no-print {
                display: none;
            }
        }
        
        .print-btn {
            display: block;
            width: 100%;
            padding: 10px;
            margin-bottom: 20px;
            background-color: #000;
            color: #fff;
            text-align: center;
            border: none;
            cursor: pointer;
            font-family: inherit;
            font-weight: bold;
            font-size: 14px;
        }
    </style>
</head>
<body>

    <div class="receipt-container">
        <!-- Print Button (Hidden on Print) -->
        <button class="no-print print-btn" onclick="window.print()">🖨️ CETAK STRUK</button>

        <!-- Header -->
        <div class="header text-center">
            <h1>TIGA TITIK OUTDOOR</h1>
            <p>Rental Alat Camping & Outdoor</p>
            <p>Jl. Contoh No. 123, Kota Anda</p>
            <p>Telp: 0812-3456-7890</p>
        </div>

        <div class="divider"></div>

        <!-- Order Info -->
        <div class="mb-2" style="font-size: 13px;">
            <table style="width: 100%;">
                <tr>
                    <td style="width: 40%;">Waktu</td>
                    <td>: {{ now()->format('d/m/Y H:i') }}</td>
                </tr>
                <tr>
                    <td>Kasir</td>
                    <td>: {{ auth()->user()->name ?? 'Admin' }}</td>
                </tr>
                <tr>
                    <td>No. Order</td>
                    <td>: {{ $order->order_number }}</td>
                </tr>
                <tr>
                    <td>Pelanggan</td>
                    <td>: {{ $order->user->name ?? 'Guest' }}</td>
                </tr>
            </table>
        </div>

        <div class="divider"></div>
        <div class="text-center font-bold mb-1">DETAIL SEWA</div>
        <div class="divider"></div>

        <!-- Items -->
        <table class="mb-2">
            <tbody>
                @foreach($order->items as $item)
                <tr class="item-row">
                    <td colspan="2">
                        <span class="item-name">{{ $item->equipment->name }}</span>
                        <div class="item-details">
                            <span>{{ $item->quantity }} x Rp {{ number_format($item->price, 0, ',', '.') }}</span>
                            <span>Rp {{ number_format($item->subtotal, 0, ',', '.') }}</span>
                        </div>
                    </td>
                </tr>
                @endforeach
            </tbody>
        </table>

        <div class="divider-solid"></div>

        <!-- Totals -->
        <table class="totals">
            <tr>
                <td class="label">Total Sewa</td>
                <td class="value">Rp {{ number_format($order->total_rental_price, 0, ',', '.') }}</td>
            </tr>
            <tr>
                <td class="label">Deposit Awal</td>
                <td class="value">Rp {{ number_format($order->total_deposit, 0, ',', '.') }}</td>
            </tr>
            <tr>
                <td class="label">Total Keseluruhan</td>
                <td class="value font-bold">Rp {{ number_format($order->total_price, 0, ',', '.') }}</td>
            </tr>
            
            <tr style="height: 10px;"><td></td><td></td></tr>

            <!-- Return Details -->
            <tr style="border-top: 1px dashed #000;">
                <td colspan="2" class="text-center font-bold pt-2 pb-1" style="padding-top: 5px;">PENGEMBALIAN</td>
            </tr>
            
            <tr>
                <td class="label">Status</td>
                <td class="value">{{ strtoupper($order->order_status) }}</td>
            </tr>
            
            @if($order->order_status === 'completed')
                @if($order->late_fee_total > 0)
                <tr>
                    <td class="label">Denda Terlambat</td>
                    <td class="value">- Rp {{ number_format($order->late_fee_total, 0, ',', '.') }}</td>
                </tr>
                @endif

                @if($order->damage_fee_total > 0)
                <tr>
                    <td class="label">Denda Rusak</td>
                    <td class="value">- Rp {{ number_format($order->damage_fee_total, 0, ',', '.') }}</td>
                </tr>
                @endif
                
                @if($order->refund_admin_fee > 0)
                <tr>
                    <td class="label">Biaya Admin</td>
                    <td class="value">- Rp {{ number_format($order->refund_admin_fee, 0, ',', '.') }}</td>
                </tr>
                @endif

                <tr class="grand-total mt-2" style="border-top: 1px solid #000;">
                    @php
                        $net_refund = $order->deposit_total - ($order->late_fee_total + $order->damage_fee_total + $order->refund_admin_fee);
                    @endphp
                    <td class="label" style="padding-top: 5px;">{{ $net_refund < 0 ? 'KEKURANGAN' : 'TOTAL REFUND' }}</td>
                    <td class="value" style="padding-top: 5px;">Rp {{ number_format(abs($net_refund), 0, ',', '.') }}</td>
                </tr>
            @endif
        </table>

        <div class="divider"></div>

        <!-- Footer -->
        <div class="footer text-center">
            <p class="font-bold mb-1">TERIMA KASIH</p>
            <p>Barang yang sudah disewa<br>menjadi tanggung jawab penyewa.</p>
            <p style="margin-top: 10px;">--- tto.com ---</p>
        </div>

    </div>

    <!-- Auto Print Script -->
    <script>
        window.onload = function() {
            setTimeout(function() {
                window.print();
            }, 500); // Tunggu sebentar agar font selesai diload
        }
    </script>
</body>
</html>
