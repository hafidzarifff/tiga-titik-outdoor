import React, { useState, useEffect } from 'react';
import { X, Clock, CheckCircle2, AlertCircle, FileText, Eye, Download, XCircle, Phone, Mail } from 'lucide-react';
import axios from 'axios';

export default function OrderDetailModal({ order, isOpen, onClose, onSuccess }) {
    const [isApproving, setIsApproving] = useState(false);
    const [isRejecting, setIsRejecting] = useState(false);
    const [timeLeft, setTimeLeft] = useState('');
    const [showKtp, setShowKtp] = useState(false);
    const [showPayment, setShowPayment] = useState(false);

    useEffect(() => {
        if (!order || !order.payment_due_datetime) return;

        const calculateTimeLeft = () => {
            const difference = new Date(order.payment_due_datetime) - new Date();
            if (difference > 0) {
                const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
                const minutes = Math.floor((difference / 1000 / 60) % 60);
                const seconds = Math.floor((difference / 1000) % 60);
                setTimeLeft(`${hours}j ${minutes}m ${seconds}s`);
            } else {
                setTimeLeft('Waktu Habis');
            }
        };

        calculateTimeLeft();
        const timer = setInterval(calculateTimeLeft, 1000);

        return () => clearInterval(timer);
    }, [order]);

    if (!isOpen || !order) return null;

    const handleApprove = async () => {
        try {
            setIsApproving(true);
            await axios.patch(`/api/v1/orders/${order.order_number}/approve`);
            alert('Pesanan berhasil diterima!');
            onClose();
            if (onSuccess) onSuccess();
        } catch (error) {
            console.error('Error approving order:', error);
            alert('Gagal menyetujui pesanan.');
        } finally {
            setIsApproving(false);
        }
    };

    const handleReject = async () => {
        if (!confirm('Yakin ingin menolak pesanan ini? Stok barang akan dikembalikan.')) return;
        try {
            setIsRejecting(true);
            await axios.patch(`/api/v1/orders/${order.order_number}/reject`);
            alert('Pesanan berhasil ditolak.');
            onClose();
            if (onSuccess) onSuccess();
        } catch (error) {
            console.error('Error rejecting order:', error);
            alert('Gagal menolak pesanan.');
        } finally {
            setIsRejecting(false);
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return '-';
        const date = new Date(dateString);
        return date.toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        });
    };

    const formatDateTime = (dateString) => {
        if (!dateString) return '-';
        const date = new Date(dateString);
        return date.toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const calculateDuration = (pickup, returnDate) => {
        if (!pickup || !returnDate) return '-';
        const start = new Date(pickup);
        const end = new Date(returnDate);
        const diffTime = Math.abs(end - start);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays;
    };

    const formatRupiah = (number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0
        }).format(Number(number || 0));
    };

    const getStatusLabel = (status) => {
        switch (status) {
            case 'pending': return 'Menunggu';
            case 'booked': return 'Siap Diambil';
            case 'active': return 'Sedang Disewa';
            case 'completed': return 'Selesai';
            case 'cancelled': return 'Dibatalkan';
            default: return status;
        }
    };

    const getStatusBadgeClass = (status) => {
        switch (status) {
            case 'pending': return 'bg-yellow-100 text-yellow-700';
            case 'booked': return 'bg-blue-100 text-blue-700';
            case 'active': return 'bg-emerald-100 text-emerald-700';
            case 'completed': return 'bg-slate-100 text-slate-700';
            case 'cancelled': return 'bg-red-100 text-red-700';
            default: return 'bg-yellow-100 text-yellow-700';
        }
    };

    // Get customer info from various sources
    const customerName = order.user?.name || 'Pelanggan Offline';
    const customerPhone = order.user?.customer_profile?.phone_number || '-';
    const customerEmail = order.user?.email || '-';
    const customerInitials = customerName.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();

    // Get items — adapt for both API OrderController items and BookingController items
    const items = (order.items || []).map(item => ({
        name: item.equipment?.name || item.name || 'Alat',
        qty: item.qty,
        price: Number(item.price_per_day_at_rent || item.price || 0),
        image: item.equipment?.images?.[0]?.image_path || null,
        total: Number(item.price_per_day_at_rent || item.price || 0) * item.qty * calculateDuration(order.expected_pickup_datetime, order.expected_return_datetime),
    }));

    const rentalSubtotal = Number(order.rental_subtotal || 0);
    const depositTotal = Number(order.deposit_total || 0);
    const grandTotal = Number(order.grand_total || 0);

    const isPending = order.order_status === 'pending';

    return (
        <>
            <div className="fixed inset-0 z-[100] flex items-center justify-center">
                {/* Backdrop */}
                <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose}></div>

                {/* Modal */}
                <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto relative z-10 animate-in fade-in zoom-in-95 duration-200 mx-4">
                    {/* Header */}
                    <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 sticky top-0 bg-white z-20">
                        <div className="flex items-center gap-3 flex-wrap">
                            <h2 className="text-lg md:text-xl font-bold text-slate-900">
                                Detail Pesanan #{order.order_number}
                            </h2>
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadgeClass(order.order_status)}`}>
                                {getStatusLabel(order.order_status)}
                            </span>
                            {order.order_source === 'online' && (
                                <span className="px-2 py-0.5 bg-violet-100 text-violet-700 rounded-md text-[10px] font-bold uppercase">Online</span>
                            )}
                            {order.payment_type === 'dp_30' && (
                                <span className="px-2 py-0.5 bg-orange-100 text-orange-700 rounded-md text-[10px] font-bold uppercase animate-pulse shadow-sm border border-orange-200">Baru DP 30%</span>
                            )}
                            {timeLeft && timeLeft !== 'Waktu Habis' && isPending && (
                                <span className="flex items-center gap-1.5 px-3 py-1 bg-red-50 text-red-600 rounded-full text-xs font-semibold border border-red-100">
                                    <Clock className="w-3.5 h-3.5" />
                                    {timeLeft}
                                </span>
                            )}
                        </div>
                        <button
                            onClick={onClose}
                            className="text-slate-400 hover:text-slate-600 hover:bg-slate-100 p-2 rounded-full transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="p-6 space-y-6">
                        {/* Top Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Info Pelanggan */}
                            <div className="border border-slate-100 rounded-xl p-5 bg-slate-50/50">
                                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">Informasi Pelanggan</h3>
                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 rounded-full bg-yellow-100 text-yellow-700 flex items-center justify-center font-bold text-lg shrink-0">
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
                                        {order.ktp_path && (
                                            <button
                                                onClick={() => setShowKtp(true)}
                                                className="mt-3 text-sm font-medium text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
                                            >
                                                <FileText className="w-4 h-4" /> Cek Kartu Identitas
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Durasi Rental */}
                            <div className="border border-slate-100 rounded-xl p-5 bg-slate-50/50">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Durasi Rental</h3>
                                    <span className="text-xs font-bold bg-emerald-100 text-emerald-700 px-2 py-1 rounded-lg">
                                        {calculateDuration(order.expected_pickup_datetime, order.expected_return_datetime)} Hari
                                    </span>
                                </div>
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
                            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Barang Yang Disewa</h3>
                            <div className="border border-slate-100 rounded-xl overflow-hidden">
                                <table className="w-full text-left text-sm">
                                    <thead className="bg-slate-50 text-slate-600 font-medium border-b border-slate-100">
                                        <tr>
                                            <th className="py-3 px-4">Nama Barang</th>
                                            <th className="py-3 px-4 text-center">Qty</th>
                                            <th className="py-3 px-4 text-right">Harga Sewa</th>
                                            <th className="py-3 px-4 text-right">Total</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {items.map((item, idx) => (
                                            <tr key={idx} className="hover:bg-slate-50/50">
                                                <td className="py-3 px-4 flex items-center gap-3">
                                                    <div className="w-10 h-10 bg-slate-100 rounded-lg shrink-0 flex items-center justify-center overflow-hidden">
                                                        {item.image ? (
                                                            <img src={`/storage/${item.image}`} alt={item.name} className="w-full h-full object-contain p-1" />
                                                        ) : (
                                                            <div className="w-full h-full bg-slate-100"></div>
                                                        )}
                                                    </div>
                                                    <span className="font-medium text-slate-900">{item.name}</span>
                                                </td>
                                                <td className="py-3 px-4 text-center text-slate-600">{item.qty}</td>
                                                <td className="py-3 px-4 text-right text-slate-600">{formatRupiah(item.price)}</td>
                                                <td className="py-3 px-4 text-right font-medium text-slate-900">{formatRupiah(item.total)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Summary */}
                        <div className="flex flex-col md:flex-row justify-between gap-6 pt-4 border-t border-slate-100">
                            <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-4 flex-1">
                                <h4 className="text-sm font-bold text-blue-900 mb-2">Informasi Pembayaran</h4>
                                <div className="space-y-1.5 text-sm">
                                    <div className="flex justify-between text-blue-800">
                                        <span>Tipe Pembayaran:</span>
                                        <span className="font-semibold capitalize">{order.payment_type === 'full_payment' ? 'Lunas' : 'DP 30%'}</span>
                                    </div>
                                    <div className="flex justify-between text-blue-800">
                                        <span>Metode:</span>
                                        <span className="font-semibold uppercase">{order.payment_method}</span>
                                    </div>
                                    <div className="flex justify-between text-blue-800">
                                        <span>Status:</span>
                                        <span className="font-semibold capitalize">{order.payment_status === 'verifying' ? 'Menunggu Verifikasi' : order.payment_status === 'paid' ? 'Lunas' : order.payment_status}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="w-full md:w-1/3 space-y-2">
                                <div className="flex justify-between text-sm text-slate-600">
                                    <span>Subtotal Sewa</span>
                                    <span>{formatRupiah(rentalSubtotal)}</span>
                                </div>
                                <div className="flex justify-between text-lg font-bold text-emerald-600 pt-2 border-t border-slate-100">
                                    <span>Total Tagihan</span>
                                    <span>{formatRupiah(rentalSubtotal)}</span>
                                </div>
                                {order.payment_type === 'dp_30' && (
                                    <div className="pt-2 border-t border-slate-100 space-y-1">
                                        <div className="flex justify-between text-sm font-bold text-orange-600">
                                            <span>Telah Dibayar (DP 30%)</span>
                                            <span>{formatRupiah(rentalSubtotal * 0.3)}</span>
                                        </div>
                                        <div className="flex justify-between text-sm font-bold text-red-600">
                                            <span>Sisa Tagihan (Pelunasan)</span>
                                            <span>{formatRupiah(rentalSubtotal * 0.7)}</span>
                                        </div>
                                    </div>
                                )}
                                {depositTotal > 0 && (
                                    <div className="pt-2 border-t border-slate-100">
                                        <div className="flex justify-between text-sm text-amber-700">
                                            <span className="font-semibold">Deposit (Jaminan)</span>
                                            <span className="font-bold">{formatRupiah(depositTotal)}</span>
                                        </div>
                                        <p className="text-[10px] text-amber-600 mt-1 italic">* Dibayar langsung saat pengambilan barang</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Footer / Actions */}
                    <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex flex-col sm:flex-row items-center justify-between rounded-b-2xl sticky bottom-0 z-20 gap-3">
                        <div className="flex items-center gap-2">
                            {order.payment_proof_path && (
                                <button
                                    onClick={() => setShowPayment(true)}
                                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-emerald-700 bg-emerald-100 hover:bg-emerald-200 rounded-xl transition-colors"
                                >
                                    <FileText className="w-4 h-4" />
                                    Lihat Bukti Bayar
                                </button>
                            )}
                            {order.order_status === 'completed' && (
                                <button
                                    onClick={() => window.open(`/admin/orders/${order.id}/receipt`, '_blank')}
                                    className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-slate-700 bg-slate-200 hover:bg-slate-300 rounded-xl transition-colors"
                                >
                                    🖨️ Cetak Struk
                                </button>
                            )}
                        </div>
                        {isPending && (
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={handleReject}
                                    disabled={isRejecting}
                                    className="px-6 py-2.5 text-sm font-bold text-white bg-red-500 hover:bg-red-600 rounded-xl transition-colors shadow-sm disabled:opacity-70"
                                >
                                    {isRejecting ? 'Menolak...' : 'Tolak'}
                                </button>
                                <button
                                    onClick={handleApprove}
                                    disabled={isApproving}
                                    className="px-6 py-2.5 text-sm font-bold text-white bg-emerald-500 hover:bg-emerald-600 rounded-xl transition-colors shadow-sm flex items-center gap-2 disabled:opacity-70"
                                >
                                    {isApproving ? 'Memproses...' : 'Terima Pesanan'}
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* KTP Image Lightbox */}
            {showKtp && order.ktp_path && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-6" onClick={() => setShowKtp(false)}>
                    <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm"></div>
                    <div className="relative z-10 w-full max-w-3xl flex flex-col bg-white rounded-2xl overflow-hidden shadow-2xl max-h-full animate-in fade-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 shrink-0 bg-white">
                            <h3 className="text-sm font-bold text-slate-800">Kartu Identitas (KTP)</h3>
                            <button onClick={() => setShowKtp(false)} className="text-slate-400 hover:text-slate-700 hover:bg-slate-100 p-1.5 rounded-full transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="p-4 sm:p-6 overflow-auto flex items-center justify-center bg-slate-50/50 min-h-[50vh]">
                            <img src={`/storage/${order.ktp_path}`} alt="KTP" className="max-w-full max-h-[70vh] object-contain rounded-xl shadow-sm border border-slate-200/60" />
                        </div>
                    </div>
                </div>
            )}

            {/* Payment Proof Lightbox */}
            {showPayment && order.payment_proof_path && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-6" onClick={() => setShowPayment(false)}>
                    <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm"></div>
                    <div className="relative z-10 w-full max-w-3xl flex flex-col bg-white rounded-2xl overflow-hidden shadow-2xl max-h-full animate-in fade-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 shrink-0 bg-white">
                            <h3 className="text-sm font-bold text-slate-800">Bukti Pembayaran</h3>
                            <button onClick={() => setShowPayment(false)} className="text-slate-400 hover:text-slate-700 hover:bg-slate-100 p-1.5 rounded-full transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="p-4 sm:p-6 overflow-auto flex items-center justify-center bg-slate-50/50 min-h-[50vh]">
                            <img src={`/storage/${order.payment_proof_path}`} alt="Bukti Pembayaran" className="max-w-full max-h-[70vh] object-contain rounded-xl shadow-sm border border-slate-200/60" />
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
