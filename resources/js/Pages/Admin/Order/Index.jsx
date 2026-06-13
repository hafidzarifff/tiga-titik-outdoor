import React, { useState, useEffect } from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Search, Clock, Box, RefreshCw, Check, Eye, ChevronLeft, ChevronRight, Plus, ShoppingCart, FileWarning, MessageSquareWarning, AlertTriangle } from 'lucide-react';
import { router } from '@inertiajs/react';
import axios from 'axios';
import OrderDetailModal from './Partials/OrderDetailModal';
import CreateOrderModal from './Partials/CreateOrderModal';
import ReturnOrderModal from './Partials/ReturnOrderModal';
import CompletedOrderModal from './Partials/CompletedOrderModal';
import PickupOrderModal from './Partials/PickupOrderModal';

export default function Index() {
    const [activeTab, setActiveTab] = useState('pesanan_masuk');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isReturnModalOpen, setIsReturnModalOpen] = useState(false);
    const [isCompletedModalOpen, setIsCompletedModalOpen] = useState(false);
    const [isPickupModalOpen, setIsPickupModalOpen] = useState(false);
    const [refreshTrigger, setRefreshTrigger] = useState(0);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [orders, setOrders] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');

    const handleSuccess = () => {
        setRefreshTrigger(prev => prev + 1);
        router.reload({ only: ['admin_notifications'] });
    };
    const [counts, setCounts] = useState({
        pending: 0,
        booked: 0,
        active: 0,
        completed: 0
    });
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        let isMounted = true;
        const fetchOrders = async () => {
            setIsLoading(true);
            try {
                let apiStatus = 'pending';
                if (activeTab === 'siap_diambil') apiStatus = 'booked';
                if (activeTab === 'sedang_disewa') apiStatus = 'active';
                if (activeTab === 'selesai') apiStatus = 'completed';

                const response = await axios.get(`/api/v1/orders?status=${apiStatus}`);
                if (isMounted) {
                    setOrders(response.data?.data || []);
                    if (response.data?.counts) {
                        setCounts(response.data.counts);
                    }
                }
            } catch (error) {
                console.error("Failed to fetch orders:", error);
                if (isMounted) {
                    setOrders([]);
                }
            } finally {
                if (isMounted) {
                    setIsLoading(false);
                }
            }
        };

        fetchOrders();

        return () => {
            isMounted = false;
        };
    }, [activeTab, refreshTrigger]);

    const tabs = [
        { id: 'pesanan_masuk', apiStatus: 'pending', label: 'Pesanan Masuk', icon: Clock },
        { id: 'siap_diambil', apiStatus: 'booked', label: 'Siap Diambil', icon: Box },
        { id: 'sedang_disewa', apiStatus: 'active', label: 'Sedang Disewa', icon: RefreshCw },
        { id: 'selesai', apiStatus: 'completed', label: 'Selesai', icon: Check }
    ];

    const handleOpenDetail = (order) => {
        setSelectedOrder(order);
        setIsModalOpen(true);
    };

    const handleOpenReturn = (order) => {
        setSelectedOrder(order);
        setIsReturnModalOpen(true);
    };

    const handleOpenPickup = (order) => {
        setSelectedOrder(order);
        setIsPickupModalOpen(true);
    };

    const handleOpenCompleted = (order) => {
        setSelectedOrder(order);
        setIsCompletedModalOpen(true);
    };

    const formatRupiah = (number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0
        }).format(number);
    };

    const getStatusBadgeClasses = (status) => {
        switch (status) {
            case 'pending':
                return 'bg-orange-100 text-orange-700 border-orange-200/50';
            case 'booked':
                return 'bg-blue-100 text-blue-700 border-blue-200/50';
            case 'active':
                return 'bg-yellow-100 text-yellow-700 border-yellow-200/50';
            case 'completed':
                return 'bg-emerald-100 text-emerald-700 border-emerald-200/50';
            default:
                return 'bg-orange-100 text-orange-700 border-orange-200/50';
        }
    };

    const getStatusLabel = (status) => {
        switch (status) {
            case 'pending': return 'Menunggu';
            case 'booked': return 'Siap Diambil';
            case 'active': return 'Sedang Disewa';
            case 'completed': return 'Selesai';
            default: return 'Menunggu';
        }
    };

    const formatDateRange = (start, end) => {
        if (!start || !end) return '-';
        const startDate = new Date(start);
        const endDate = new Date(end);

        const startStr = startDate.toLocaleDateString('id-ID', { day: 'numeric', month: 'numeric', year: 'numeric' });
        const endStr = endDate.toLocaleDateString('id-ID', { day: 'numeric', month: 'numeric', year: 'numeric' });

        return (
            <div className="flex flex-col">
                <span className="text-slate-900">{startStr}</span>
                <span className="text-slate-400 text-xs">s/d {endStr}</span>
            </div>
        );
    };

    const filteredOrders = orders.filter((order) => {
        const searchLower = searchQuery.toLowerCase();
        const customerName = (order.user?.name || order.customer?.name || 'Tamu / Offline').toLowerCase();
        const orderNumber = (order.order_number || '').toLowerCase();
        return customerName.includes(searchLower) || orderNumber.includes(searchLower);
    });

    return (
        <AdminLayout title="Manajemen Pesanan">

            {/* Header Content with Tabs and Search */}
            <div className="mb-6 flex flex-col xl:flex-row xl:items-center justify-between gap-4">

                {/* Tabs */}
                <div className="flex items-center gap-1.5 bg-white p-1.5 rounded-xl border border-slate-200 w-fit max-w-full overflow-x-auto whitespace-nowrap hide-scrollbar">
                    {tabs.map((tab) => {
                        const Icon = tab.icon;
                        const isActive = activeTab === tab.id;
                        const currentCount = counts[tab.apiStatus] || 0;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 ${isActive
                                    ? 'bg-slate-50 text-slate-900 shadow-sm border border-slate-100'
                                    : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50 border border-transparent'
                                    }`}
                            >
                                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-slate-900' : 'text-slate-400'}`} />
                                {tab.label}
                                <span className={`ml-0.5 px-1.5 py-0.5 rounded-full text-[10px] font-bold ${isActive ? 'bg-emerald-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
                                    {currentCount}
                                </span>
                            </button>
                        );
                    })}
                </div>

                {/* Right Actions: Search & Add Button */}
                <div className="flex flex-col sm:flex-row items-center gap-3 w-full xl:w-auto">
                    {/* Search Bar */}
                    <div className="relative w-full sm:w-auto flex-1">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Search className="h-4 w-4 text-slate-400" />
                        </div>
                        <input
                            type="text"
                            placeholder="Cari pesanan, pelanggan..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10 pr-4 py-2.5 w-full lg:w-72 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all text-slate-600"
                        />
                    </div>
                    {/* Buat Pesanan Button */}
                    <button
                        onClick={() => setIsCreateModalOpen(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl shadow-sm transition-colors w-full sm:w-auto justify-center whitespace-nowrap"
                    >
                        <Plus className="w-5 h-5" />
                        Buat Pesanan
                    </button>
                </div>
            </div>

            {/* Table Container */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm whitespace-nowrap">
                        <thead className="bg-slate-50/50 border-b border-slate-200 text-slate-500 font-semibold text-xs tracking-wider">
                            <tr>
                                <th className="px-6 py-4 uppercase text-center">No.</th>
                                <th className="px-6 py-4 uppercase">ID</th>
                                <th className="px-6 py-4 uppercase">Pelanggan</th>
                                <th className="px-6 py-4 uppercase">Status</th>
                                <th className="px-6 py-4 uppercase">Total</th>
                                <th className="px-6 py-4 uppercase">Periode</th>
                                <th className="px-6 py-4 uppercase text-center">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {isLoading ? (
                                <tr>
                                    <td colSpan="7" className="px-6 py-12 text-center">
                                        <div className="flex flex-col items-center justify-center text-slate-500">
                                            <RefreshCw className="w-8 h-8 animate-spin text-green-500 mb-4" />
                                            <p className="font-medium text-slate-600">Memuat data...</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : filteredOrders.length === 0 ? (
                                <tr>
                                    <td colSpan="7" className="px-6 py-16 text-center">
                                        <div className="flex flex-col items-center justify-center">
                                            <div className="w-16 h-16 bg-slate-50 text-slate-400 rounded-full flex items-center justify-center mb-4">
                                                <ShoppingCart className="w-10 h-10" />
                                            </div>
                                            <h3 className="text-lg font-bold text-slate-900 mb-1">Tidak ada data ditemukan</h3>
                                            <p className="text-sm text-slate-500">Coba gunakan kata kunci pencarian yang lain.</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                filteredOrders.map((order, index) => (
                                    <tr key={order.id} className="hover:bg-slate-50/80 transition-colors">
                                        <td className="px-6 py-5 text-center">
                                            <span className="font-bold text-slate-900">{index + 1}</span>
                                        </td>
                                        <td className="px-6 py-5">
                                            <span className="font-bold text-slate-900">{order.order_number}</span>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="flex flex-col">
                                                <span className="font-semibold text-slate-900">{order.user?.name || order.customer?.name || 'Tamu / Offline'}</span>
                                                <span className="text-slate-500 text-xs mt-0.5">{order.user?.customer_profile?.phone_number || '-'}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="flex flex-col gap-1.5 w-max">
                                                <span className={`text-center px-3 py-1 rounded-full text-xs font-bold border capitalize ${getStatusBadgeClasses(order.order_status)}`}>
                                                    {getStatusLabel(order.order_status)}
                                                </span>
                                                {/* Indikator Terlambat */}
                                                {order.order_status === 'active' && new Date() > new Date(order.expected_return_datetime) && (
                                                    <span className="flex items-center justify-center gap-1 w-full px-2 py-1 bg-red-100 text-red-700 rounded-md text-[10px] font-bold border border-red-200">
                                                        <AlertTriangle className="w-3 h-3" /> Terlambat
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        {activeTab === 'selesai' ? (
                                            <td className="px-6 py-5">
                                                <div className="font-bold text-slate-900">
                                                    {formatRupiah(Number(order.rental_subtotal || 0) + Number(order.late_fee_total || 0) + Number(order.damage_fee_total || 0))}
                                                </div>
                                                {(Number(order.late_fee_total || 0) + Number(order.damage_fee_total || 0)) > 0 && (
                                                    <div className="text-[11px] text-red-600 font-medium mt-0.5">
                                                        (Denda: {formatRupiah(Number(order.late_fee_total || 0) + Number(order.damage_fee_total || 0))})
                                                    </div>
                                                )}
                                            </td>
                                        ) : (
                                            <td className="px-6 py-5 font-bold text-slate-900">
                                                {formatRupiah(order.grand_total)}
                                            </td>
                                        )}
                                        <td className="px-6 py-5">
                                            {formatDateRange(order.expected_pickup_datetime || order.pickup_datetime, order.expected_return_datetime || order.return_datetime)}
                                        </td>
                                        <td className="px-6 py-5 text-center">
                                            {activeTab === 'selesai' ? (
                                                <button
                                                    onClick={() => handleOpenCompleted(order)}
                                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-emerald-600 bg-white border border-emerald-500 hover:bg-emerald-50 rounded-lg transition-colors"
                                                >
                                                    <Eye className="w-3.5 h-3.5" />
                                                    Detail
                                                </button>
                                            ) : activeTab === 'sedang_disewa' ? (
                                                <button
                                                    onClick={() => handleOpenReturn(order)}
                                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-amber-700 bg-amber-100 border border-amber-300 hover:bg-amber-200 rounded-lg transition-colors whitespace-nowrap"
                                                >
                                                    <RefreshCw className="w-3.5 h-3.5" />
                                                    Proses Pengembalian
                                                </button>
                                            ) : activeTab === 'siap_diambil' ? (
                                                <button
                                                    onClick={() => handleOpenPickup(order)}
                                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-blue-700 bg-blue-100 border border-blue-300 hover:bg-blue-200 rounded-lg transition-colors whitespace-nowrap"
                                                >
                                                    <Box className="w-3.5 h-3.5" />
                                                    Proses Pengambilan
                                                </button>
                                            ) : (
                                                <button
                                                    onClick={() => handleOpenDetail(order)}
                                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-green-600 bg-emerald-50 border border-green-200 hover:bg-emerald-100 rounded-lg transition-colors"
                                                >
                                                    <Eye className="w-3.5 h-3.5" />
                                                    Detail
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination Placeholder */}
                <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between text-sm text-slate-500 bg-slate-50/50">
                    <span>Menampilkan {filteredOrders.length} pesanan</span>
                    <div className="flex gap-1">
                        <button className="px-3 py-1 border border-slate-200 bg-white rounded-md text-slate-400 cursor-not-allowed">
                            <ChevronLeft className="w-4 h-4" />
                        </button>
                        <button className="px-3 py-1 border border-green-500 bg-emerald-500 text-white rounded-md font-medium">1</button>
                        <button className="px-3 py-1 border border-slate-200 bg-white rounded-md text-slate-400 cursor-not-allowed">
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Modal Detail */}
            <OrderDetailModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                order={selectedOrder}
                onSuccess={handleSuccess}
            />

            {/* Modal Create Offline Order */}
            <CreateOrderModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                onSuccess={handleSuccess}
            />

            {/* Modal Return Order */}
            <ReturnOrderModal
                isOpen={isReturnModalOpen}
                onClose={() => setIsReturnModalOpen(false)}
                onSuccess={handleSuccess}
                order={selectedOrder}
            />

            {/* Modal Pickup Order */}
            <PickupOrderModal
                isOpen={isPickupModalOpen}
                onClose={() => setIsPickupModalOpen(false)}
                onSuccess={handleSuccess}
                order={selectedOrder}
            />

            {/* Modal Completed Order Detail */}
            <CompletedOrderModal
                isOpen={isCompletedModalOpen}
                onClose={() => setIsCompletedModalOpen(false)}
                order={selectedOrder}
            />

        </AdminLayout>
    );
}
