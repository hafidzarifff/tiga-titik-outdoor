import React from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Package, TrendingUp, TrendingDown, AlertTriangle, ArrowRight, Clock } from 'lucide-react';
import { usePage } from '@inertiajs/react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const formatRevenue = (value) => {
    if (value >= 1000000000) return `Rp ${(value / 1000000000).toFixed(1)}M`;
    if (value >= 1000000) return `Rp ${(value / 1000000).toFixed(1)}jt`;
    if (value >= 1000) return `Rp ${(value / 1000).toFixed(0)}rb`;
    return `Rp ${value.toLocaleString('id-ID')}`;
};

const statusConfig = {
    pending: { label: 'Menunggu', className: 'bg-yellow-100 text-yellow-700' },
    late: { label: 'Terlambat', className: 'bg-red-100 text-red-600' },
    booked: { label: 'Dipesan', className: 'bg-blue-100 text-blue-700' },
    active: { label: 'Aktif', className: 'bg-emerald-100 text-emerald-700' },
};

export default function Dashboard() {
    const { auth, stats = {}, chartData = [], actionOrders = [] } = usePage().props;

    const {
        newOrders = 0,
        activeRentals = 0,
        lateOrders = 0,
        currentMonthRevenue = 0,
        revenueChangePercent = 0,
    } = stats;

    return (
        <AdminLayout title="Dashboard">

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
                {/* Stat 1 */}
                <div className="bg-white rounded-2xl p-6 flex items-center justify-between shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)]">
                    <div>
                        <p className="text-slate-500 text-sm mb-2 font-medium">Pesanan Baru</p>
                        <h3 className="text-4xl font-extrabold text-slate-900">{newOrders}</h3>
                    </div>
                    <div className="w-14 h-14 rounded-2xl bg-indigo-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/30">
                        <Package className="w-7 h-7" />
                    </div>
                </div>

                {/* Stat 2 */}
                <div className="bg-white rounded-2xl p-6 flex items-center justify-between shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)]">
                    <div>
                        <p className="text-slate-500 text-sm mb-2 font-medium">Alat Disewakan</p>
                        <h3 className="text-4xl font-extrabold text-slate-900">{activeRentals}</h3>
                    </div>
                    <div className="w-14 h-14 rounded-2xl bg-yellow-500 flex items-center justify-center text-white shadow-lg shadow-yellow-500/30">
                        <Package className="w-7 h-7" />
                    </div>
                </div>

                {/* Stat 3 */}
                <div className="bg-white rounded-2xl p-6 flex items-center justify-between shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)]">
                    <div>
                        <p className="text-slate-500 text-sm mb-2 font-medium">Terlambat</p>
                        <h3 className="text-4xl font-extrabold text-slate-900">{lateOrders}</h3>
                    </div>
                    <div className="w-14 h-14 rounded-2xl bg-red-500 flex items-center justify-center text-white shadow-lg shadow-red-500/30">
                        <AlertTriangle className="w-7 h-7" />
                    </div>
                </div>

                {/* Stat 4 */}
                <div className="bg-white rounded-2xl p-6 flex items-center justify-between shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)]">
                    <div>
                        <p className="text-slate-500 text-sm mb-1 font-medium">Total Pendapatan</p>
                        <h3 className="text-3xl font-extrabold text-slate-900 mb-1">{formatRevenue(currentMonthRevenue)}</h3>
                        <p className={`text-xs font-semibold flex items-center gap-1 ${revenueChangePercent >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                            {revenueChangePercent >= 0
                                ? <TrendingUp className="w-3 h-3" />
                                : <TrendingDown className="w-3 h-3" />
                            }
                            {revenueChangePercent >= 0 ? '+' : ''}{revenueChangePercent}% dari bulan lalu
                        </p>
                    </div>
                    <div className="w-14 h-14 rounded-2xl bg-emerald-500 flex items-center justify-center text-white shadow-lg shadow-green-500/30">
                        <TrendingUp className="w-7 h-7" />
                    </div>
                </div>
            </div>

            {/* Bottom Section */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">

                {/* Chart Section */}
                <div className="bg-white rounded-2xl p-6 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)]">
                    <div className="mb-8">
                        <h3 className="text-lg font-bold text-slate-900">Pendapatan Bulanan</h3>
                        <p className="text-sm text-slate-500">Tren pendapatan 6 bulan terakhir</p>
                    </div>
                    {/* Interactive Chart */}
                    <div className="h-72 w-full mt-6">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis
                                    dataKey="name"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#94a3b8', fontSize: 12 }}
                                    dy={10}
                                />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#94a3b8', fontSize: 12 }}
                                    tickFormatter={(value) => `${value}jt`}
                                    dx={0}
                                />
                                <Tooltip
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)' }}
                                    formatter={(value) => [`Rp ${value} Juta`, 'Pendapatan']}
                                    labelStyle={{ color: '#64748b', fontWeight: 'bold', marginBottom: '4px' }}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="pendapatan"
                                    stroke="#22c55e"
                                    strokeWidth={3}
                                    dot={{ r: 4, strokeWidth: 2, fill: '#fff', stroke: '#22c55e' }}
                                    activeDot={{ r: 6, strokeWidth: 0, fill: '#16a34a' }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Table Section */}
                <div className="bg-white rounded-2xl p-6 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] flex flex-col">
                    <div className="flex justify-between items-start mb-6">
                        <div>
                            <h3 className="text-lg font-bold text-slate-900">Perlu Tindakan</h3>
                            <p className="text-sm text-slate-500">Pesanan yang membutuhkan perhatian</p>
                        </div>
                        <a href="/admin/orders" className="text-sm font-semibold text-slate-600 hover:text-slate-900 flex items-center gap-1 transition">
                            Lihat Semua <ArrowRight className="w-4 h-4" />
                        </a>
                    </div>

                    <div className="overflow-x-auto flex-1">
                        <table className="w-full text-sm text-left">
                            <thead className="text-[11px] text-slate-400 uppercase tracking-wider border-b border-slate-100">
                                <tr>
                                    <th className="py-3 px-2 font-semibold">ID Pesanan</th>
                                    <th className="py-3 px-2 font-semibold">Pelanggan</th>
                                    <th className="py-3 px-2 font-semibold text-center">Status</th>
                                    <th className="py-3 px-2 font-semibold">Tanggal</th>
                                </tr>
                            </thead>
                            <tbody>
                                {actionOrders.length > 0 ? (
                                    actionOrders.map((order, index) => {
                                        const config = statusConfig[order.status] || statusConfig.pending;
                                        return (
                                            <tr key={order.order_number} className={`${index < actionOrders.length - 1 ? 'border-b border-slate-50' : ''} hover:bg-slate-50/50 transition`}>
                                                <td className="py-4 px-2 font-bold text-slate-800">{order.order_number}</td>
                                                <td className="py-4 px-2">
                                                    <div className="font-semibold text-slate-800">{order.customer_name}</div>
                                                    <div className="text-xs text-slate-500 mt-0.5">{order.customer_phone}</div>
                                                </td>
                                                <td className="py-4 px-2 text-center">
                                                    <span className={`${config.className} text-[11px] font-bold px-2.5 py-1 rounded-full`}>{config.label}</span>
                                                </td>
                                                <td className="py-4 px-2">
                                                    <div className="text-slate-500 text-xs font-medium flex items-center gap-1.5">
                                                        <Clock className="w-3.5 h-3.5 text-slate-400" /> {order.date}
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })
                                ) : (
                                    <tr>
                                        <td colSpan="5" className="py-12 text-center text-slate-400 text-sm font-medium">
                                            Tidak ada pesanan yang membutuhkan tindakan saat ini.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

            </div>
        </AdminLayout>
    );
}
