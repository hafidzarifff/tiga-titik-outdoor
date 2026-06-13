import React, { useState, useEffect } from 'react';
import { X, User, Phone, Mail, Clock, CheckCircle2, AlertCircle } from 'lucide-react';
import axios from 'axios';

export default function PickupOrderModal({ isOpen, onClose, onSuccess, order }) {
    const [checkedItems, setCheckedItems] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isFullyPaid, setIsFullyPaid] = useState(false);
    const [isIdRetained, setIsIdRetained] = useState(false);

    useEffect(() => {
        if (isOpen && order) {
            setCheckedItems([]);
            // Auto check if payment status is already paid
            setIsFullyPaid(order.payment_status === 'paid' || order.payment_type === 'full_payment');
            setIsIdRetained(order.retained_id_type === 'none');
        }
    }, [isOpen, order]);

    if (!isOpen || !order) return null;

    const customerName = order.user?.name || order.customer?.name || 'Tamu / Offline';
    const customerPhone = order.user?.customer_profile?.phone_number || '-';
    const customerEmail = order.user?.email || '-';
    const customerInitials = customerName.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();

    const formatDate = (dateString) => {
        if (!dateString) return '-';
        const date = new Date(dateString);
        return date.toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        });
    };

    const formatRupiah = (number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0
        }).format(Number(number || 0));
    };

    const calculateDuration = (pickup, returnDate) => {
        if (!pickup || !returnDate) return '-';
        const start = new Date(pickup);
        const end = new Date(returnDate);
        const diffTime = Math.abs(end - start);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays;
    };

    const handleCheckItem = (itemId) => {
        setCheckedItems(prev => 
            prev.includes(itemId) ? prev.filter(id => id !== itemId) : [...prev, itemId]
        );
    };

    const isAllChecked = order.items && checkedItems.length === order.items.length;

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!isAllChecked) {
            alert('Silakan centang semua barang yang akan diserahkan.');
            return;
        }

        if (!isFullyPaid) {
            alert('Anda harus mengonfirmasi bahwa seluruh sisa tagihan telah dilunasi.');
            return;
        }

        if (order.order_source === 'offline' && order.retained_id_type !== 'none' && !isIdRetained) {
            alert(`Anda harus mengonfirmasi bahwa kartu ${order.retained_id_type.toUpperCase()} pelanggan telah diamankan.`);
            return;
        }

        setIsSubmitting(true);
        try {
            await axios.patch(`/api/v1/orders/${order.order_number}/handover`, {
                is_fully_paid: isFullyPaid,
                is_id_retained: isIdRetained
            });
            alert("Barang berhasil diserahkan kepada pelanggan.");
            if (onSuccess) onSuccess();
            onClose();
        } catch (error) {
            console.error("Gagal menyerahkan pesanan:", error);
            alert(error.response?.data?.message || "Terjadi kesalahan saat memproses penyerahan barang.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-0">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose}></div>

            <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-white z-10">
                    <h2 className="text-lg md:text-xl font-bold text-slate-900">
                        Checklist Pengambilan Barang
                    </h2>
                    <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="overflow-y-auto flex-1 p-6 space-y-6">
                    {/* Top Section: Info Pelanggan & Durasi */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Info Pelanggan */}
                        <div className="border border-slate-100 rounded-xl p-5 bg-slate-50/50">
                            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">Informasi Pelanggan</h3>
                            <div className="flex items-start gap-4">
                                <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-lg shrink-0">
                                    {customerInitials}
                                </div>
                                <div className="min-w-0">
                                    <h4 className="font-bold text-slate-900 truncate">{customerName}</h4>
                                    <p className="text-sm text-slate-600 mt-1 flex items-center gap-2">
                                        <Phone className="w-4 h-4" /> {customerPhone}
                                    </p>
                                    <p className="text-sm text-slate-600 mt-0.5 flex items-center gap-2 truncate">
                                        <Mail className="w-4 h-4" /> {customerEmail}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Durasi Rental */}
                        <div className="border border-slate-100 rounded-xl p-5 bg-slate-50/50">
                            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">Durasi Rental</h3>
                            <div className="relative pl-6 space-y-4">
                                {/* Timeline line */}
                                <div className="absolute left-[9px] top-2 bottom-2 w-0.5 bg-slate-200"></div>

                                <div className="relative">
                                    <div className="absolute -left-[27px] top-1 w-3 h-3 rounded-full bg-emerald-500 ring-4 ring-emerald-50"></div>
                                    <p className="text-sm font-bold text-slate-900">Mulai: {formatDate(order.expected_pickup_datetime)}</p>
                                    <p className="text-xs text-slate-500 mt-0.5">Pick-up</p>
                                </div>
                                <div className="relative">
                                    <div className="absolute -left-[27px] top-1 w-3 h-3 rounded-full bg-slate-800 ring-4 ring-slate-100"></div>
                                    <p className="text-sm font-bold text-slate-900">Selesai: {formatDate(order.expected_return_datetime)}</p>
                                    <p className="text-xs text-slate-500 mt-0.5">Return</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Table Barang */}
                    <div>
                        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Centang Barang Yang Diserahkan:</h3>
                        <div className="border border-slate-100 rounded-xl overflow-hidden bg-slate-50/30">
                            <table className="w-full text-left text-sm">
                                <thead className="border-b border-slate-100 text-slate-600 font-medium">
                                    <tr>
                                        <th className="py-3 px-4 w-12 text-center"></th>
                                        <th className="py-3 px-4">Nama Barang</th>
                                        <th className="py-3 px-4 text-center">Qty</th>
                                        <th className="py-3 px-4 text-right">Harga Sewa</th>
                                        <th className="py-3 px-4 text-right">Total</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {order.items?.map((item) => {
                                        const itemName = item.equipment?.name || item.name || 'Alat';
                                        const isChecked = checkedItems.includes(item.id);
                                        const duration = calculateDuration(order.expected_pickup_datetime, order.expected_return_datetime) || 1;
                                        const price = Number(item.price_per_day_at_rent || item.price || 0);
                                        const total = price * item.qty * duration;
                                        
                                        return (
                                            <tr 
                                                key={item.id} 
                                                className={`hover:bg-slate-50 transition-colors cursor-pointer ${isChecked ? 'bg-emerald-50/30' : ''}`}
                                                onClick={() => handleCheckItem(item.id)}
                                            >
                                                <td className="py-3 px-4 text-center">
                                                    <input 
                                                        type="checkbox" 
                                                        checked={isChecked}
                                                        onChange={() => handleCheckItem(item.id)}
                                                        onClick={(e) => e.stopPropagation()}
                                                        className="w-5 h-5 text-blue-600 bg-slate-100 border-slate-300 rounded focus:ring-blue-500 cursor-pointer"
                                                    />
                                                </td>
                                                <td className="py-3 px-4 flex items-center gap-3">
                                                    <div className="w-10 h-10 bg-white border border-slate-100 rounded-lg shrink-0 flex items-center justify-center overflow-hidden">
                                                        {item.equipment?.images?.[0]?.image_path ? (
                                                            <img src={`/storage/${item.equipment.images[0].image_path}`} alt={itemName} className="w-full h-full object-contain p-1" />
                                                        ) : (
                                                            <div className="w-full h-full bg-slate-50"></div>
                                                        )}
                                                    </div>
                                                    <span className={`font-medium ${isChecked ? 'text-slate-900' : 'text-slate-700'}`}>{itemName}</span>
                                                </td>
                                                <td className="py-3 px-4 text-center text-slate-600">{item.qty}</td>
                                                <td className="py-3 px-4 text-right text-slate-600">{formatRupiah(price)}</td>
                                                <td className="py-3 px-4 text-right font-medium text-slate-900">{formatRupiah(total)}</td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Totals */}
                    <div className="flex justify-end pt-4">
                        <div className="w-full md:w-1/3 space-y-3">
                            <div className="flex justify-between text-sm text-slate-600 px-2">
                                <span>Subtotal Sewa</span>
                                <span className="font-medium text-slate-900">{formatRupiah(order.rental_subtotal)}</span>
                            </div>
                            <div className="flex justify-between items-center px-2 pt-2 border-t border-slate-100">
                                <span className="text-base font-bold text-slate-900">Total Tagihan</span>
                                <span className="text-xl font-bold text-emerald-600">{formatRupiah(order.rental_subtotal)}</span>
                            </div>
                            {order.payment_type === 'dp_30' && (
                                <div className="px-2 pt-2 border-t border-slate-100 space-y-1">
                                    <div className="flex justify-between text-sm font-bold text-orange-600">
                                        <span>Telah Dibayar (DP 30%)</span>
                                        <span>{formatRupiah(order.rental_subtotal * 0.3)}</span>
                                    </div>
                                    <div className="flex justify-between text-sm font-bold text-red-600">
                                        <span>Sisa Tagihan (Pelunasan)</span>
                                        <span>{formatRupiah(order.rental_subtotal * 0.7)}</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Deposit - Terpisah */}
                    {Number(order.deposit_total) > 0 && (
                        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mt-4">
                            <div className="flex items-start gap-2">
                                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                                <div className="flex-1">
                                    <p className="text-xs font-bold text-amber-800 uppercase tracking-wider mb-1">UANG JAMINAN (DEPOSIT) — TAGIH LANGSUNG KE PELANGGAN</p>
                                    <p className="text-[11px] text-amber-700 mb-2">Deposit dibayar terpisah dari tagihan sewa. Pastikan pelanggan membayar deposit di bawah ini secara langsung (Cash / QRIS).</p>
                                    <div className="flex justify-between items-center bg-white rounded-lg p-3 border border-amber-200">
                                        <span className="text-sm font-bold text-amber-900">Total Deposit</span>
                                        <span className="text-lg font-black text-amber-900">{formatRupiah(order.deposit_total)}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Konfirmasi Persyaratan */}
                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mt-6 space-y-4">
                        <h4 className="text-sm font-bold text-amber-900 flex items-center gap-2">
                            <AlertCircle className="w-4 h-4" /> Persyaratan Penyerahan Barang
                        </h4>
                        
                        <label className="flex items-start gap-3 cursor-pointer">
                            <input 
                                type="checkbox" 
                                checked={isFullyPaid}
                                onChange={(e) => setIsFullyPaid(e.target.checked)}
                                className="w-5 h-5 mt-0.5 text-emerald-600 bg-white border-amber-300 rounded focus:ring-emerald-500 cursor-pointer"
                            />
                            <div>
                                <span className="text-sm font-semibold text-slate-900 block">Konfirmasi Pelunasan Tagihan</span>
                                <span className="text-xs text-slate-600">Saya mengonfirmasi bahwa seluruh sisa tagihan pesanan ini telah lunas dibayar.</span>
                            </div>
                        </label>

                        {order.order_source === 'offline' && order.retained_id_type !== 'none' && (
                            <label className="flex items-start gap-3 cursor-pointer pt-2 border-t border-amber-200/50">
                                <input 
                                    type="checkbox" 
                                    checked={isIdRetained}
                                    onChange={(e) => setIsIdRetained(e.target.checked)}
                                    className="w-5 h-5 mt-0.5 text-emerald-600 bg-white border-amber-300 rounded focus:ring-emerald-500 cursor-pointer"
                                />
                                <div>
                                    <span className="text-sm font-semibold text-slate-900 block flex items-center gap-2">
                                        Terima Jaminan Identitas <span className="uppercase bg-amber-200 text-amber-800 px-1.5 py-0.5 rounded text-[10px]">{order.retained_id_type}</span>
                                    </span>
                                    <span className="text-xs text-slate-600">Kartu identitas fisik pelanggan telah diterima dan diamankan oleh Admin.</span>
                                </div>
                            </label>
                        )}
                    </div>
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-slate-100 bg-white flex justify-end gap-3 z-10">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-6 py-2.5 text-sm font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 border border-slate-200 rounded-xl transition-colors"
                        disabled={isSubmitting}
                    >
                        Batal
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={isSubmitting || !isAllChecked || !isFullyPaid || (order.order_source === 'offline' && order.retained_id_type !== 'none' && !isIdRetained)}
                        className="flex items-center gap-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 disabled:text-slate-500 disabled:cursor-not-allowed text-white text-sm font-bold rounded-xl shadow-sm transition-colors"
                    >
                        {isSubmitting ? 'Memproses...' : 'Serahkan Barang'}
                    </button>
                </div>
            </div>
        </div>
    );
}
