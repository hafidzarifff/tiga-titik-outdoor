import React, { useState } from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import { usePage } from '@inertiajs/react';
import { Search, Eye, X, User, Phone, Mail, AtSign, MapPin, CalendarDays, Receipt } from 'lucide-react';

export default function CustomerIndex() {
    const { customers } = usePage().props;
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCustomer, setSelectedCustomer] = useState(null);

    // Filter customers
    const filteredCustomers = customers.filter(customer =>
        customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.phone_number.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const openModal = (customer) => {
        setSelectedCustomer(customer);
    };

    const closeModal = () => {
        setSelectedCustomer(null);
    };

    const getStatusConfig = (status) => {
        switch (status) {
            case 'pending': return { label: 'Menunggu', className: 'bg-slate-100 text-slate-800' };
            case 'booked': return { label: 'Dibooking', className: 'bg-blue-100 text-blue-800' };
            case 'active': return { label: 'Disewa', className: 'bg-amber-100 text-amber-800' }; // Kuning
            case 'completed': return { label: 'Selesai', className: 'bg-emerald-100 text-emerald-800' }; // Hijau
            case 'cancelled': return { label: 'Dibatalkan', className: 'bg-red-100 text-red-800' }; // Merah
            default: return { label: status, className: 'bg-gray-100 text-gray-800' };
        }
    };

    return (
        <AdminLayout title="Data Pelanggan">
            <div className="bg-white rounded-[24px] border border-slate-100 shadow-sm overflow-hidden flex flex-col">
                {/* Header & Search */}
                <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50/50">
                    <div>
                        <h2 className="text-lg font-bold text-slate-900">Daftar Pelanggan</h2>
                        <p className="text-sm text-slate-500">Kelola semua pelanggan yang terdaftar di sistem</p>
                    </div>
                    <div className="relative w-full sm:w-72 shrink-0">
                        <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Cari nama atau nomor HP..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 w-full lg:w-72 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all text-slate-600"
                        />
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm whitespace-nowrap">
                        <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-semibold border-b border-slate-100">
                            <tr>
                                <th className="px-6 py-4">Nama Pelanggan</th>
                                <th className="px-6 py-4">Nomor HP</th>
                                <th className="px-6 py-4">Akun Instagram</th>
                                <th className="px-6 py-4">Terdaftar Sejak</th>
                                <th className="px-6 py-4 text-center">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filteredCustomers.length > 0 ? (
                                filteredCustomers.map((customer) => (
                                    <tr key={customer.id} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="px-6 py-4 font-medium text-slate-900 flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs">
                                                {customer.name.substring(0, 2).toUpperCase()}
                                            </div>
                                            {customer.name}
                                        </td>
                                        <td className="px-6 py-4 text-slate-600">{customer.phone_number}</td>
                                        <td className="px-6 py-4 text-slate-600">{customer.instagram}</td>
                                        <td className="px-6 py-4 text-slate-600">{customer.created_at}</td>
                                        <td className="px-6 py-4 text-center">
                                            <button
                                                onClick={() => openModal(customer)}
                                                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-600 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors"
                                            >
                                                <Eye className="w-3.5 h-3.5" /> Detail
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5" className="px-6 py-12 text-center text-slate-500">
                                        Tidak ada data pelanggan yang ditemukan.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Customer Detail Modal */}
            {selectedCustomer && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
                    <div
                        className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
                        onClick={closeModal}
                    ></div>

                    <div className="bg-white rounded-[24px] shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col relative z-10 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                        {/* Modal Header */}
                        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50 shrink-0">
                            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                                <User className="w-5 h-5 text-emerald-600" />
                                Detail Pelanggan
                            </h3>
                            <button
                                onClick={closeModal}
                                className="w-8 h-8 rounded-full hover:bg-slate-200 flex items-center justify-center text-slate-500 transition-colors"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="overflow-y-auto p-6 flex-1 bg-slate-50/30">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                                {/* Profile Info Card */}
                                <div className="md:col-span-1 bg-white border border-slate-100 rounded-2xl p-5 shadow-sm space-y-4">
                                    <div className="text-center pb-4 border-b border-slate-100">
                                        <div className="w-20 h-20 mx-auto rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-2xl mb-3">
                                            {selectedCustomer.name.substring(0, 2).toUpperCase()}
                                        </div>
                                        <h4 className="font-bold text-slate-900 text-lg">{selectedCustomer.name}</h4>
                                        <p className="text-sm text-slate-500 flex items-center justify-center gap-1.5 mt-1">
                                            <CalendarDays className="w-3.5 h-3.5" /> Bergabung {selectedCustomer.created_at}
                                        </p>
                                    </div>

                                    <div className="space-y-3 pt-2">
                                        <div className="flex items-start gap-3">
                                            <Phone className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
                                            <div>
                                                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Telepon</p>
                                                <p className="text-sm font-medium text-slate-900">{selectedCustomer.phone_number}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-3">
                                            <Mail className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
                                            <div>
                                                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Email</p>
                                                <p className="text-sm font-medium text-slate-900 break-all">{selectedCustomer.email}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-3">
                                            <AtSign className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
                                            <div>
                                                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Instagram</p>
                                                <p className="text-sm font-medium text-slate-900">{selectedCustomer.instagram}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-3">
                                            <MapPin className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
                                            <div>
                                                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Alamat</p>
                                                <p className="text-sm font-medium text-slate-900 line-clamp-3">{selectedCustomer.address}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Order History Card */}
                                <div className="md:col-span-2 bg-white border border-slate-100 rounded-2xl shadow-sm flex flex-col overflow-hidden">
                                    <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-2 bg-slate-50/50">
                                        <Receipt className="w-4 h-4 text-emerald-600" />
                                        <h4 className="font-bold text-slate-900">Riwayat Penyewaan ({selectedCustomer.orders.length})</h4>
                                    </div>
                                    <div className="overflow-x-auto flex-1">
                                        <table className="w-full text-left text-sm whitespace-nowrap">
                                            <thead className="bg-slate-50 text-slate-500 text-[11px] uppercase font-semibold border-b border-slate-100">
                                                <tr>
                                                    <th className="px-4 py-3">No. Pesanan</th>
                                                    <th className="px-4 py-3">Dari Tanggal</th>
                                                    <th className="px-4 py-3">Sampai Tanggal</th>
                                                    <th className="px-4 py-3 text-right">Total</th>
                                                    <th className="px-4 py-3 text-center">Status</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-100">
                                                {selectedCustomer.orders.length > 0 ? (
                                                    selectedCustomer.orders.map((order) => {
                                                        const statusConf = getStatusConfig(order.status);
                                                        return (
                                                            <tr key={order.id} className="hover:bg-slate-50/50 transition-colors">
                                                                <td className="px-4 py-3 font-semibold text-slate-900">{order.order_number}</td>
                                                                <td className="px-4 py-3 text-slate-600 text-xs">{order.expected_pickup_datetime}</td>
                                                                <td className="px-4 py-3 text-slate-600 text-xs">{order.actual_return_datetime}</td>
                                                                <td className="px-4 py-3 font-medium text-emerald-600 text-right">
                                                                    {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(order.rental_subtotal)}
                                                                </td>
                                                                <td className="px-4 py-3 text-center">
                                                                    <span className={`${statusConf.className} text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider`}>
                                                                        {statusConf.label}
                                                                    </span>
                                                                </td>
                                                            </tr>
                                                        );
                                                    })
                                                ) : (
                                                    <tr>
                                                        <td colSpan="5" className="px-4 py-10 text-center text-slate-500">
                                                            Pelanggan ini belum pernah melakukan penyewaan.
                                                        </td>
                                                    </tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}
