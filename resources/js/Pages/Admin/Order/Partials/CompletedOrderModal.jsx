import React, { useState } from 'react';
import { X, User, CalendarClock, CreditCard, CheckCircle2, Box } from 'lucide-react';
import axios from 'axios';

export default function CompletedOrderModal({ isOpen, onClose, order, onSuccess }) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    if (!isOpen || !order) return null;

    const formatRupiah = (number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0
        }).format(number);
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return '-';
        const date = new Date(dateStr);
        return date.toLocaleDateString('id-ID', {
            day: 'numeric', month: 'long', year: 'numeric',
            hour: '2-digit', minute: '2-digit'
        });
    };

    const lateFee = Number(order.late_fee_total) || 0;
    const damageFee = Number(order.damage_fee_total) || 0;
    const adminFee = Number(order.refund_admin_fee) || 0;
    const rentalSubtotal = Number(order.rental_subtotal) || 0;
    const depositTotal = Number(order.deposit_total) || 0;

    const totalIncome = rentalSubtotal + lateFee + damageFee;
    const netRefund = depositTotal - (lateFee + damageFee + adminFee);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-0">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose}></div>

            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">

                {/* Header */}
                <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-white">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center">
                            <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-slate-900">Detail Pesanan Selesai</h2>
                            <p className="text-sm text-slate-500 font-medium">{order.order_number}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="overflow-y-auto flex-1 p-6 space-y-6">

                    {/* Grid Info Atas */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Pelanggan */}
                        <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                                <User className="w-4 h-4" /> Info Pelanggan
                            </h3>
                            <div className="space-y-1">
                                <p className="font-bold text-slate-900">{order.user?.name || order.customer?.name || 'Tamu / Offline'}</p>
                                <p className="text-sm text-slate-600">{order.user?.customer_profile?.phone_number || '-'}</p>
                                <p className="text-sm text-slate-500">{order.user?.email || '-'}</p>
                            </div>
                        </div>

                        {/* Durasi */}
                        <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                                <CalendarClock className="w-4 h-4" /> Durasi Rental
                            </h3>
                            <div className="space-y-2">
                                <div>
                                    <p className="text-xs text-slate-500 font-medium">Diambil pada</p>
                                    <p className="text-sm font-semibold text-slate-900">{formatDate(order.actual_pickup_datetime || order.expected_pickup_datetime)}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-slate-500 font-medium">Dikembalikan pada</p>
                                    <p className={`text-sm font-semibold ${order.actual_return_datetime ? 'text-emerald-600' : 'text-slate-900'}`}>
                                        {formatDate(order.actual_return_datetime || order.expected_return_datetime)}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Tabel Barang */}
                    <div className="space-y-3">
                        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                            <Box className="w-4 h-4 text-emerald-500" /> Barang Disewa
                        </h3>
                        <div className="border border-slate-200 rounded-xl overflow-hidden">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500">
                                    <tr>
                                        <th className="px-4 py-3 font-semibold">Nama Barang</th>
                                        <th className="px-4 py-3 font-semibold text-center">Qty</th>
                                        <th className="px-4 py-3 font-semibold text-right">Harga / Hari</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {order.items?.map((item) => (
                                        <tr key={item.id} className="bg-white">
                                            <td className="px-4 py-3 flex items-center gap-3">
                                                <div className="w-10 h-10 bg-white border border-slate-100 rounded-lg shrink-0 flex items-center justify-center overflow-hidden">
                                                    {item.equipment?.images?.[0]?.image_path ? (
                                                        <img src={`/storage/${item.equipment.images[0].image_path}`} alt={item.equipment?.name || item.name || 'Alat'} className="w-full h-full object-contain p-1" />
                                                    ) : (
                                                        <div className="w-full h-full bg-slate-50"></div>
                                                    )}
                                                </div>
                                                <span className="font-medium text-slate-900">{item.equipment?.name || item.name || 'Alat'}</span>
                                            </td>
                                            <td className="px-4 py-3 text-center text-slate-600">{item.qty}</td>
                                            <td className="px-4 py-3 text-right text-slate-600">{formatRupiah(item.price_per_day_at_rent || 0)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <hr className="border-slate-100" />

                    {/* Rincian Finansial Akhir */}
                    <div className="space-y-4">
                        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                            <CreditCard className="w-4 h-4 text-emerald-500" /> Rincian Finansial Akhir
                        </h3>

                        <div className="bg-emerald-50/50 border border-emerald-100 rounded-xl p-5 space-y-3">
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-slate-600">Subtotal Sewa</span>
                                <span className="font-semibold text-slate-900">{formatRupiah(rentalSubtotal)}</span>
                            </div>

                            {lateFee > 0 && (
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-slate-600">Denda Keterlambatan</span>
                                    <span className="font-semibold text-red-600">+ {formatRupiah(lateFee)}</span>
                                </div>
                            )}

                            {damageFee > 0 && (
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-slate-600">Denda Kerusakan</span>
                                    <span className="font-semibold text-red-600">+ {formatRupiah(damageFee)}</span>
                                </div>
                            )}

                            <div className="pt-3 border-t border-emerald-200 mt-3">
                                <div className="flex justify-between items-center">
                                    <span className="font-bold text-slate-900">Total Pendapatan Toko</span>
                                    <span className="font-black text-lg text-emerald-600">
                                        {formatRupiah(totalIncome)}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Catatan Deposit */}
                        <div className="bg-slate-50 rounded-lg p-3 border border-slate-200 text-center">
                            <p className="text-xs text-slate-600 font-medium">
                                Catatan: Uang Jaminan (Deposit) sebesar <span className="font-bold">{formatRupiah(depositTotal)}</span> telah diterima saat pengambilan barang. <br />
                                {netRefund > 0
                                    ? <span className="text-emerald-700 font-semibold">Deposit Dikembalikan (Refund): {formatRupiah(netRefund)}</span>
                                    : netRefund < 0
                                        ? <span className="text-red-700 font-semibold">Kekurangan bayar dari pelanggan: {formatRupiah(Math.abs(netRefund))}</span>
                                        : <span className="text-slate-700 font-semibold">Seluruh deposit ditarik untuk pembayaran denda (Refund: Rp0)</span>
                                }
                            </p>
                        </div>
                    </div>

                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex justify-end gap-3 rounded-b-2xl">
                    <button
                        type="button"
                        onClick={() => window.open(`/admin/orders/${order.id}/receipt`, '_blank')}
                        className="px-6 py-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-sm font-bold rounded-xl shadow-sm transition-colors"
                    >
                        🖨️ Cetak Struk
                    </button>
                    {netRefund < 0 && !order.is_shortfall_paid && (
                        <button
                            type="button"
                            onClick={async () => {
                                if(!confirm('Yakin ingin menandai sisa hutang denda ini sebagai LUNAS?')) return;
                                setIsSubmitting(true);
                                try {
                                    await axios.patch(`/api/v1/orders/${order.order_number}/mark-shortfall-paid`);
                                    alert('Hutang denda berhasil ditandai lunas!');
                                    if(onSuccess) onSuccess();
                                    onClose();
                                } catch (error) {
                                    console.error(error);
                                    alert('Gagal menandai lunas.');
                                } finally {
                                    setIsSubmitting(false);
                                }
                            }}
                            disabled={isSubmitting}
                            className="px-6 py-2 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-bold rounded-xl shadow-sm transition-colors disabled:opacity-70"
                        >
                            {isSubmitting ? 'Memproses...' : 'Tandai Hutang Lunas'}
                        </button>
                    )}
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-6 py-2 bg-slate-800 hover:bg-slate-900 text-white text-sm font-bold rounded-xl shadow-sm transition-colors"
                    >
                        Tutup
                    </button>
                </div>
            </div>
        </div>
    );
}
