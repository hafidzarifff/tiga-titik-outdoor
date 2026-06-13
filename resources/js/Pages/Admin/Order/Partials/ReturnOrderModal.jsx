import React, { useState, useEffect } from 'react';
import { X, AlertCircle, AlertTriangle, CheckCircle2, ShieldAlert, CreditCard, ChevronRight, User } from 'lucide-react';
import axios from 'axios';

export default function ReturnOrderModal({ isOpen, onClose, onSuccess, order }) {
    const [calcData, setCalcData] = useState({ late_fee_total: 0, deposit_total: 0, is_late: false });
    const [isLoadingCalc, setIsLoadingCalc] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [itemConditions, setItemConditions] = useState({});
    const [refundAdminFee, setRefundAdminFee] = useState('');
    const [isIdReturned, setIsIdReturned] = useState(false);

    useEffect(() => {
        if (isOpen && order) {
            fetchCalculation();

            // Inisialisasi state kondisi barang
            const initialConditions = {};
            if (order.items) {
                order.items.forEach(item => {
                    initialConditions[item.id] = { isDamaged: false, fee: '' };
                });
            }
            setItemConditions(initialConditions);
            setRefundAdminFee('');
            setIsIdReturned(order.retained_id_type === 'none'); // Auto-check if none
        }
    }, [isOpen, order]);

    const fetchCalculation = async () => {
        setIsLoadingCalc(true);
        try {
            const response = await axios.get(`/api/v1/orders/${order.order_number}/calculate-return`);
            if (response.data?.data) {
                setCalcData(response.data.data);
            }
        } catch (error) {
            console.error("Gagal mengambil kalkulasi return:", error);
            alert("Gagal mengkalkulasi denda keterlambatan.");
        } finally {
            setIsLoadingCalc(false);
        }
    };

    const handleConditionChange = (itemId, isDamaged) => {
        setItemConditions(prev => ({
            ...prev,
            [itemId]: { ...prev[itemId], isDamaged, fee: isDamaged ? prev[itemId].fee : '' }
        }));
    };

    const handleDamageFeeChange = (itemId, fee) => {
        setItemConditions(prev => ({
            ...prev,
            [itemId]: { ...prev[itemId], fee }
        }));
    };

    // Kalkulasi Total Denda Kerusakan
    const damageFeeTotal = Object.values(itemConditions).reduce((sum, item) => {
        return sum + (item.isDamaged && item.fee ? parseInt(item.fee) || 0 : 0);
    }, 0);

    const adminFeeVal = parseInt(refundAdminFee) || 0;
    const netRefund = calcData.deposit_total - (calcData.late_fee_total + damageFeeTotal + adminFeeVal);

    const formatRupiah = (number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0
        }).format(number);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (order.retained_id_type !== 'none' && !isIdReturned) {
            alert("Anda harus mencentang konfirmasi pengembalian KTP/ID pelanggan.");
            return;
        }

        setIsSubmitting(true);
        try {
            await axios.post(`/api/v1/orders/${order.order_number}/return`, {
                damage_fee_total: damageFeeTotal,
                refund_admin_fee: adminFeeVal
            });
            alert("Pesanan berhasil diselesaikan.");
            onSuccess();
            onClose();
        } catch (error) {
            console.error("Gagal menyelesaikan pesanan:", error);
            alert(error.response?.data?.message || "Terjadi kesalahan sistem.");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen || !order) return null;

    const needsIdReturn = order.retained_id_type !== 'none';

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-0">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose}></div>

            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">

                {/* Header */}
                <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-white">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center">
                            <RefreshCwIcon className="w-5 h-5 text-amber-500" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-slate-900">Proses Pengembalian</h2>
                            <p className="text-sm text-slate-500 font-medium">{order.order_number}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="overflow-y-auto flex-1 p-6 space-y-6">

                    {/* Seksi 0: Info Pelanggan */}
                    <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                            <User className="w-4 h-4" /> Info Pelanggan
                        </h3>
                        <div className="space-y-1">
                            <p className="font-bold text-slate-900">{order.user?.name || order.customer?.name || 'Tamu / Offline'}</p>
                            <p className="text-sm text-slate-600">{order.user?.customer_profile?.phone_number || '-'}</p>
                        </div>
                    </div>

                    {/* Seksi 2: Peringatan KTP (Prioritas Atas) */}
                    {needsIdReturn && (
                        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex flex-col gap-3">
                            <div className="flex gap-3">
                                <ShieldAlert className="w-6 h-6 text-red-600 shrink-0" />
                                <div>
                                    <h4 className="text-sm font-bold text-red-900 uppercase tracking-wide">Peringatan Penting</h4>
                                    <p className="text-sm text-red-700 mt-0.5">Kembalikan <strong>{order.retained_id_type.toUpperCase()}</strong> fisik milik pelanggan sekarang!</p>
                                </div>
                            </div>
                            <label className="flex items-center gap-2 mt-2 p-3 bg-white rounded-lg border border-red-100 cursor-pointer hover:bg-red-50/50 transition-colors">
                                <input
                                    type="checkbox"
                                    checked={isIdReturned}
                                    onChange={(e) => setIsIdReturned(e.target.checked)}
                                    className="w-5 h-5 text-red-600 rounded focus:ring-red-500 border-slate-300"
                                    required
                                />
                                <span className="text-sm font-semibold text-slate-900">Saya mengonfirmasi bahwa {order.retained_id_type.toUpperCase()} telah diserahkan kembali.</span>
                            </label>
                        </div>
                    )}

                    {/* Seksi 1: Pengecekan Kondisi Barang */}
                    <div className="space-y-4">
                        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Pengecekan Kondisi Barang
                        </h3>
                        <div className="space-y-3">
                            {order.items?.map((item) => {
                                const condition = itemConditions[item.id] || { isDamaged: false, fee: '' };
                                return (
                                    <div key={item.id} className="border border-slate-200 rounded-xl p-4 bg-slate-50/50">
                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                            <div className="flex items-center gap-3">
                                                <div className="w-12 h-12 bg-white border border-slate-100 rounded-lg shrink-0 flex items-center justify-center overflow-hidden">
                                                    {item.equipment?.images?.[0]?.image_path ? (
                                                        <img src={`/storage/${item.equipment.images[0].image_path}`} alt={item.equipment?.name || item.name || 'Alat'} className="w-full h-full object-contain p-1" />
                                                    ) : (
                                                        <div className="w-full h-full bg-slate-50"></div>
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold text-slate-900">{item.equipment?.name || item.name || 'Alat'}</p>
                                                    <p className="text-xs text-slate-500 mt-0.5">Qty: {item.qty} item</p>
                                                </div>
                                            </div>
                                            <div className="flex bg-white rounded-lg p-1 border border-slate-200 shrink-0">
                                                <button
                                                    type="button"
                                                    onClick={() => handleConditionChange(item.id, false)}
                                                    className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${!condition.isDamaged ? 'bg-emerald-100 text-emerald-700 shadow-sm' : 'text-slate-500 hover:bg-slate-50'}`}
                                                >
                                                    ✓ Baik
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => handleConditionChange(item.id, true)}
                                                    className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${condition.isDamaged ? 'bg-red-100 text-red-700 shadow-sm' : 'text-slate-500 hover:bg-slate-50'}`}
                                                >
                                                    ✕ Rusak
                                                </button>
                                            </div>
                                        </div>
                                        {condition.isDamaged && (
                                            <div className="mt-3 pt-3 border-t border-slate-200">
                                                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Nominal Denda Kerusakan (Rp)</label>
                                                <input
                                                    type="number"
                                                    min="0"
                                                    placeholder="Contoh: 50000"
                                                    value={condition.fee}
                                                    onChange={(e) => handleDamageFeeChange(item.id, e.target.value)}
                                                    className="w-full bg-white border border-red-200 text-slate-900 text-sm rounded-lg focus:ring-red-500 focus:border-red-500 block p-2.5 transition-colors"
                                                    required
                                                />
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    <hr className="border-slate-100" />

                    {/* Seksi 3: Rincian Denda & Pengembalian Deposit */}
                    <div className="space-y-4">
                        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                            <CreditCard className="w-4 h-4 text-emerald-500" /> Rincian Pengembalian Deposit
                        </h3>

                        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-slate-600">Total Deposit Awal</span>
                                <span className="font-semibold text-slate-900">{formatRupiah(calcData.deposit_total)}</span>
                            </div>

                            <div className="flex justify-between items-center text-sm">
                                <span className="text-slate-600">Denda Keterlambatan</span>
                                {isLoadingCalc ? (
                                    <span className="text-slate-400 text-xs italic">Menghitung...</span>
                                ) : (
                                    <span className={`font-semibold ${calcData.late_fee_total > 0 ? 'text-red-600' : 'text-slate-900'}`}>
                                        - {formatRupiah(calcData.late_fee_total)}
                                    </span>
                                )}
                            </div>

                            <div className="flex justify-between items-center text-sm">
                                <span className="text-slate-600">Denda Kerusakan Barang</span>
                                <span className={`font-semibold ${damageFeeTotal > 0 ? 'text-red-600' : 'text-slate-900'}`}>
                                    - {formatRupiah(damageFeeTotal)}
                                </span>
                            </div>

                            {calcData.deposit_total > 0 && (
                                <div className="pt-2 border-t border-slate-200/60">
                                    <label className="flex items-center justify-between text-sm">
                                        <span className="text-slate-600 font-medium">Biaya Admin Transfer (Opsional)</span>
                                        <input
                                            type="number"
                                            min="0"
                                            placeholder="Contoh: 6500"
                                            value={refundAdminFee}
                                            onChange={(e) => setRefundAdminFee(e.target.value)}
                                            className="w-32 bg-white border border-slate-200 text-slate-900 text-sm rounded-lg focus:ring-emerald-500 focus:border-emerald-500 block px-2.5 py-1.5 text-right transition-colors"
                                        />
                                    </label>
                                </div>
                            )}

                            <div className="pt-3 border-t border-slate-200 mt-3">
                                <div className="flex justify-between items-center">
                                    <span className="font-bold text-slate-900 text-base">
                                        {netRefund < 0 ? 'Kekurangan Bayar Pelanggan' : 'Uang Kembali (Net Refund)'}
                                    </span>
                                    <span className={`font-black text-lg ${netRefund < 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                                        {formatRupiah(Math.abs(netRefund))}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                </form>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex justify-end gap-3 rounded-b-2xl">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 text-sm font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors"
                        disabled={isSubmitting}
                    >
                        Batal
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={isSubmitting || isLoadingCalc}
                        className="flex items-center gap-2 px-6 py-2 bg-emerald-500 hover:bg-emerald-600 disabled:bg-emerald-300 text-white text-sm font-bold rounded-xl shadow-sm transition-colors"
                    >
                        {isSubmitting ? 'Memproses...' : 'Selesaikan Pengembalian'}
                    </button>
                </div>
            </div>
        </div>
    );
}

// Icon helper
function RefreshCwIcon(props) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
            <path d="M3 3v5h5" />
        </svg>
    )
}
