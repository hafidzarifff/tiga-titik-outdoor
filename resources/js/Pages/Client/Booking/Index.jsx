import React, { useState, useEffect } from 'react';
import ClientLayout from '@/Layouts/ClientLayout';
import { Head, usePage } from '@inertiajs/react';
import { Package, Clock, CheckCircle2, AlertCircle, ShieldCheck, FileText, ChevronDown, ChevronUp, Truck, RotateCcw } from 'lucide-react';
import api from '@/services/api';

export default function Index() {
    const { auth } = usePage().props;
    const isLoggedIn = !!auth.user || !!localStorage.getItem('tto_auth_token');

    const [orders, setOrders] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [expandedOrder, setExpandedOrder] = useState(null);

    useEffect(() => {
        if (!isLoggedIn) {
            setIsLoading(false);
            return;
        }
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        setIsLoading(true);
        try {
            const response = await api.get('/my-orders', { baseURL: '/api' });
            setOrders(response.data.data || []);
        } catch (error) {
            console.error('Failed to fetch orders:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const getStatusConfig = (status) => {
        switch (status) {
            case 'pending':
                return {
                    label: 'MENUNGGU PERSETUJUAN',
                    color: 'bg-orange-100 text-orange-700 border-orange-200',
                    icon: Clock,
                    dotColor: 'bg-orange-500'
                };
            case 'booked':
                return {
                    label: 'SIAP DIAMBIL',
                    color: 'bg-blue-100 text-blue-700 border-blue-200',
                    icon: Truck,
                    dotColor: 'bg-blue-500'
                };
            case 'active':
                return {
                    label: 'SEDANG DISEWA',
                    color: 'bg-emerald-100 text-emerald-700 border-emerald-200',
                    icon: RotateCcw,
                    dotColor: 'bg-emerald-500'
                };
            case 'completed':
                return {
                    label: 'SELESAI',
                    color: 'bg-slate-100 text-slate-700 border-slate-200',
                    icon: CheckCircle2,
                    dotColor: 'bg-slate-500'
                };
            case 'cancelled':
                return {
                    label: 'DIBATALKAN',
                    color: 'bg-red-100 text-red-700 border-red-200',
                    icon: AlertCircle,
                    dotColor: 'bg-red-500'
                };
            default:
                return {
                    label: status?.toUpperCase() || 'UNKNOWN',
                    color: 'bg-slate-100 text-slate-600 border-slate-200',
                    icon: Clock,
                    dotColor: 'bg-slate-400'
                };
        }
    };

    const formatRupiah = (number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'decimal',
            minimumFractionDigits: 0,
        }).format(Number(number));
    };

    const formatDate = (dateString) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
        });
    };

    return (
        <ClientLayout title="Riwayat Pesanan" cartCount={0} isLoggedIn={isLoggedIn} user={auth.user}>
            <Head title="Riwayat Pesanan" />

            <div className="pt-6 pb-24 max-w-[900px] mx-auto px-4 xl:px-0 w-full overflow-x-hidden">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-[28px] md:text-[36px] font-black tracking-tight leading-none uppercase italic text-[#072F1F]">
                        RIWAYAT <span className="text-[#1DD28B]">PESANAN</span>
                    </h1>
                    <p className="text-[10px] md:text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-2">
                        Lacak status penyewaan alat outdoor Anda secara transparan.
                    </p>
                </div>

                {/* Content */}
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-20">
                        <div className="w-10 h-10 border-4 border-[#1DD28B] border-t-transparent rounded-full animate-spin mb-4"></div>
                        <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Memuat pesanan...</p>
                    </div>
                ) : !isLoggedIn ? (
                    <div className="bg-white rounded-[24px] border border-slate-100 flex flex-col items-center justify-center p-12 text-center shadow-sm">
                        <ShieldCheck className="w-16 h-16 text-slate-200 mb-4" />
                        <h2 className="text-lg font-black text-slate-800 mb-2 uppercase">Login Diperlukan</h2>
                        <p className="text-slate-400 font-medium mb-6 max-w-sm text-sm">Silakan login terlebih dahulu untuk melihat riwayat pesanan Anda.</p>
                    </div>
                ) : orders.length === 0 ? (
                    <div className="bg-white rounded-[24px] border border-slate-100 flex flex-col items-center justify-center p-12 text-center shadow-sm">
                        <Package className="w-16 h-16 text-slate-200 mb-4" />
                        <h2 className="text-lg font-black text-slate-800 mb-2 uppercase">Belum Ada Pesanan</h2>
                        <p className="text-slate-400 font-medium mb-6 max-w-sm text-sm">Anda belum pernah melakukan penyewaan. Mulailah petualangan Anda!</p>
                        <a href="/catalog" className="bg-[#072F1F] hover:bg-[#0a452d] text-white font-bold px-8 py-3.5 rounded-2xl transition-colors uppercase tracking-widest text-xs">
                            JELAJAHI KATALOG
                        </a>
                    </div>
                ) : (
                    <div className="space-y-5">
                        {orders.map((order) => {
                            const statusConfig = getStatusConfig(order.order_status);
                            const StatusIcon = statusConfig.icon;
                            const isExpanded = expandedOrder === order.id;

                            return (
                                <div key={order.id} className="bg-white rounded-[24px] border border-slate-100 shadow-sm overflow-hidden transition-all hover:shadow-md">
                                    {/* Order Header */}
                                    <div className="p-5 md:p-6">
                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-8 h-8 rounded-full ${statusConfig.dotColor}/10 flex items-center justify-center`}>
                                                    <FileText className="w-4 h-4 text-[#072F1F]" />
                                                </div>
                                                <div>
                                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Order ID</p>
                                                    <p className="text-sm font-black text-[#072F1F] uppercase tracking-wide">{order.order_number ? order.order_number : `ORD-${order.id}`}</p>
                                                </div>
                                            </div>
                                            <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${statusConfig.color} flex items-center gap-1.5 w-fit`}>
                                                <span className={`w-1.5 h-1.5 rounded-full ${statusConfig.dotColor}`}></span>
                                                {statusConfig.label}
                                            </span>
                                        </div>

                                        {/* Order Items */}
                                        <div className="space-y-3">
                                            {order.items?.map((item, idx) => (
                                                <div key={idx} className="flex items-center gap-3">
                                                    <div className="w-10 h-10 md:w-12 md:h-12 bg-slate-50 rounded-xl flex-shrink-0 flex items-center justify-center overflow-hidden border border-slate-100">
                                                        {item.equipment?.images?.[0] ? (
                                                            <img
                                                                src={`/storage/${item.equipment.images[0].image_path}`}
                                                                alt={item.equipment?.name}
                                                                className="w-full h-full object-contain p-1"
                                                            />
                                                        ) : (
                                                            <Package className="w-5 h-5 text-slate-300" />
                                                        )}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-xs md:text-sm font-bold text-slate-800 uppercase truncate">
                                                            {item.equipment?.name || 'Alat'}
                                                        </p>
                                                        <p className="text-[10px] md:text-xs text-slate-400 font-medium">
                                                            {item.qty} Unit • {(() => {
                                                                if (order.expected_pickup_datetime && order.expected_return_datetime) {
                                                                    const days = Math.ceil(
                                                                        (new Date(order.expected_return_datetime) - new Date(order.expected_pickup_datetime)) / (1000 * 60 * 60 * 24)
                                                                    );
                                                                    return days;
                                                                }
                                                                return 1;
                                                            })()} Hari
                                                        </p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>

                                        {/* Footer with Total & Expand */}
                                        <div className="flex items-center justify-between mt-5 pt-4 border-t border-slate-100">
                                            <button
                                                onClick={() => setExpandedOrder(isExpanded ? null : order.id)}
                                                className="text-[10px] font-bold text-[#1DD28B] uppercase tracking-widest flex items-center gap-1 hover:underline"
                                            >
                                                {isExpanded ? 'Sembunyikan' : 'Lihat Detail'}
                                                {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                                            </button>
                                            <div className="text-right">
                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total Biaya Sewa</p>
                                                <p className="text-lg md:text-xl font-black text-[#072F1F] italic tracking-tight">
                                                    Rp {formatRupiah(order.rental_subtotal)}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Expanded Detail */}
                                    {isExpanded && (
                                        <div className="border-t border-slate-100 bg-slate-50/50 px-5 md:px-6 py-4 space-y-3">
                                            <div className="grid grid-cols-2 gap-3 text-xs">
                                                <div>
                                                    <p className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Periode Sewa</p>
                                                    <p className="text-slate-700 font-semibold mt-0.5">
                                                        {formatDate(order.expected_pickup_datetime)} — {formatDate(order.expected_return_datetime)}
                                                    </p>
                                                </div>
                                                <div>
                                                    <p className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Metode Bayar</p>
                                                    <p className="text-slate-700 font-semibold mt-0.5 uppercase">{order.payment_method}</p>
                                                </div>
                                                <div className="col-span-2">
                                                    <p className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Status Pembayaran Sewa</p>
                                                    <div className="mt-0.5 text-slate-700 font-semibold">
                                                        {order.order_status === 'completed' ? (
                                                            <span className="text-emerald-600 font-bold inline-flex items-center gap-1 mt-1">
                                                                <CheckCircle2 className="w-4 h-4" /> Lunas 100%
                                                            </span>
                                                        ) : order.payment_type === 'dp_30' ? (
                                                            <div className="flex flex-col gap-1 mt-1">
                                                                <div className="flex justify-between items-center">
                                                                    <span>Telah Dibayar (DP 30%)</span>
                                                                    <span>Rp {formatRupiah(order.rental_subtotal * 0.3)}</span>
                                                                </div>
                                                                <div className="flex justify-between items-center text-red-600 font-bold bg-red-50 p-2 rounded-lg border border-red-100 mt-1">
                                                                    <span>Sisa Tagihan (Pelunasan)</span>
                                                                    <span>Rp {formatRupiah(order.rental_subtotal * 0.7)}</span>
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            <span className="text-emerald-600 font-bold inline-flex items-center gap-1 mt-1">
                                                                <CheckCircle2 className="w-4 h-4" /> Lunas 100%
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                                {Number(order.deposit_total) > 0 && (
                                                    <div className="col-span-2 bg-amber-50 rounded-lg p-3 mt-1 border border-amber-100">
                                                        {order.order_status === 'completed' ? (
                                                            <div className="space-y-2">
                                                                <p className="text-amber-800 font-bold uppercase tracking-wider text-[10px]">Penyelesaian Deposit (Uang Jaminan)</p>
                                                                <div className="text-[11px] text-amber-900 font-medium space-y-1.5">
                                                                    <div className="flex justify-between items-center">
                                                                        <span>Deposit Awal Dibayarkan</span>
                                                                        <span>Rp {formatRupiah(order.deposit_total)}</span>
                                                                    </div>
                                                                    {Number(order.late_fee_total) > 0 && (
                                                                        <div className="flex justify-between items-center text-red-600">
                                                                            <span>Denda Keterlambatan</span>
                                                                            <span>- Rp {formatRupiah(order.late_fee_total)}</span>
                                                                        </div>
                                                                    )}
                                                                    {Number(order.damage_fee_total) > 0 && (
                                                                        <div className="flex justify-between items-center text-red-600">
                                                                            <span>Denda Kerusakan</span>
                                                                            <span>- Rp {formatRupiah(order.damage_fee_total)}</span>
                                                                        </div>
                                                                    )}
                                                                    {Number(order.refund_admin_fee) > 0 && (
                                                                        <div className="flex justify-between items-center text-red-600">
                                                                            <span>Biaya Admin / Potongan Lain</span>
                                                                            <span>- Rp {formatRupiah(order.refund_admin_fee)}</span>
                                                                        </div>
                                                                    )}
                                                                    
                                                                    {(() => {
                                                                        const netRefund = Number(order.deposit_total) - (Number(order.late_fee_total || 0) + Number(order.damage_fee_total || 0) + Number(order.refund_admin_fee || 0));
                                                                        return (
                                                                            <div className="flex justify-between items-center font-bold pt-2 border-t border-amber-200/60 mt-2">
                                                                                {netRefund > 0 ? (
                                                                                    <>
                                                                                        <span className="text-emerald-700">Total Deposit Dikembalikan (Refund)</span>
                                                                                        <span className="text-emerald-700">Rp {formatRupiah(netRefund)}</span>
                                                                                    </>
                                                                                ) : netRefund < 0 ? (
                                                                                    <>
                                                                                        <span className="text-red-700">Kekurangan Bayar Pelanggan</span>
                                                                                        <span className="text-red-700">Rp {formatRupiah(Math.abs(netRefund))}</span>
                                                                                    </>
                                                                                ) : (
                                                                                    <>
                                                                                        <span className="text-amber-800">Total Deposit Dikembalikan</span>
                                                                                        <span className="text-amber-800">Rp 0 (Habis Terpotong Denda)</span>
                                                                                    </>
                                                                                )}
                                                                            </div>
                                                                        );
                                                                    })()}
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            <>
                                                                <p className="text-amber-800 font-bold uppercase tracking-wider text-[10px]">Deposit (Uang Jaminan)</p>
                                                                <p className="text-amber-900 font-semibold mt-0.5 flex justify-between items-center">
                                                                    <span>Rp {formatRupiah(order.deposit_total)}</span>
                                                                    <span className="text-[9px] text-amber-700 font-bold bg-amber-100 px-1.5 py-0.5 rounded">DIBAYAR SAAT PENGAMBILAN</span>
                                                                </p>
                                                            </>
                                                        )}
                                                    </div>
                                                )}
                                            </div>

                                            {/* Status Info Banner */}
                                            {order.order_status === 'pending' && (
                                                <div className="bg-[#1DD28B]/10 border border-[#1DD28B]/20 text-[#072F1F] text-xs p-3.5 rounded-xl flex items-start gap-2.5 mt-2">
                                                    <CheckCircle2 className="w-4 h-4 text-[#1DD28B] shrink-0 mt-0.5" strokeWidth={2.5} />
                                                    <p className="font-medium">Bukti telah diunggah. Kami sedang meninjau pembayaran Anda secara manual.</p>
                                                </div>
                                            )}
                                            {order.order_status === 'booked' && (
                                                <div className="bg-blue-50 border border-blue-200 text-blue-700 text-xs p-3.5 rounded-xl flex items-start gap-2.5 mt-2">
                                                    <Truck className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" strokeWidth={2.5} />
                                                    <p className="font-medium">Pesanan telah disetujui! Silakan ambil barang di toko Tiga Titik Outdoor.</p>
                                                </div>
                                            )}
                                            {order.order_status === 'completed' && (() => {
                                                const netRefund = Number(order.deposit_total) - (Number(order.late_fee_total || 0) + Number(order.damage_fee_total || 0) + Number(order.refund_admin_fee || 0));
                                                if (netRefund < 0) {
                                                    if (!order.is_shortfall_paid) {
                                                        return (
                                                            <div className="bg-red-50 border border-red-200 text-red-700 text-xs p-3.5 rounded-xl flex items-start gap-2.5 mt-2">
                                                                <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" strokeWidth={2.5} />
                                                                <p className="font-medium">
                                                                    Terdapat kekurangan pembayaran denda sebesar <strong>Rp {formatRupiah(Math.abs(netRefund))}</strong>. Mohon segera lunasi kekurangan ini kepada petugas.
                                                                </p>
                                                            </div>
                                                        );
                                                    } else {
                                                        return (
                                                            <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs p-3.5 rounded-xl flex items-start gap-2.5 mt-2">
                                                                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" strokeWidth={2.5} />
                                                                <p className="font-medium">
                                                                    Terima kasih, seluruh kekurangan denda telah Anda lunasi.
                                                                </p>
                                                            </div>
                                                        );
                                                    }
                                                }
                                                return null;
                                            })()}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </ClientLayout>
    );
}
