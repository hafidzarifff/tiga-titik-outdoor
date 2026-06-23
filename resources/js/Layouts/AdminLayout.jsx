import React, { useState } from 'react';
import { Head, Link, usePage, router } from '@inertiajs/react';
import { LayoutDashboard, ShoppingCart, Folder, Package, Users, Tent, Search, Bell, Menu, X, LogOut, Settings, AlertTriangle, Wrench, Check } from 'lucide-react';

export default function AdminLayout({ children, title }) {
    const { auth, admin_notifications = [] } = usePage().props;
    const { url } = usePage();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [profileMenuOpen, setProfileMenuOpen] = useState(false);
    const [notifMenuOpen, setNotifMenuOpen] = useState(false);

    const isActive = (href) => url.startsWith(href);

    // Format Date for Header
    const today = new Date();
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    const dateString = today.toLocaleDateString('id-ID', options);

    return (
        <>
            <Head title={title} />
            <div className="h-screen bg-slate-50 text-slate-900 font-sans flex overflow-hidden">
                {/* Mobile Sidebar Overlay */}
                {sidebarOpen && (
                    <div
                        className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-sm lg:hidden"
                        onClick={() => setSidebarOpen(false)}
                    />
                )}

                {/* Sidebar (Dark Green) */}
                <aside
                    className={`fixed z-50 inset-y-0 left-0 w-64 bg-[#042217] text-white flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:z-auto ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'
                        }`}
                >
                    {/* Brand */}
                    <div className="flex items-center gap-3 px-6 h-20 shrink-0 border-b border-emerald-900/50">
                        <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center text-white shrink-0">
                            <img src="/logo.svg" className="w-14 h-14" alt="Logo" />
                        </div>
                        <div>
                            <span className="font-bold text-lg leading-tight block">Tiga Titik Outdoor</span>
                            <span className="text-xs text-emerald-300">Management System</span>
                        </div>
                        <button
                            onClick={() => setSidebarOpen(false)}
                            className="ml-auto lg:hidden text-emerald-300 hover:text-white"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 overflow-y-auto p-4 space-y-6">
                        {/* Main Group */}
                        <div className="space-y-1">
                            <Link
                                href="/admin/dashboard"
                                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition duration-200 ${isActive('/admin/dashboard')
                                    ? 'bg-emerald-50 text-[#042217]'
                                    : 'text-emerald-100 hover:bg-emerald-800/50 hover:text-white'
                                    }`}
                            >
                                <LayoutDashboard className="w-5 h-5" />
                                Dashboard
                            </Link>
                            <Link
                                href="/admin/orders"
                                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition duration-200 ${isActive('/admin/orders')
                                    ? 'bg-emerald-50 text-[#042217]'
                                    : 'text-emerald-100 hover:bg-emerald-800/50 hover:text-white'
                                    }`}
                            >
                                <ShoppingCart className="w-5 h-5" />
                                Pesanan
                            </Link>
                            <Link
                                href="/admin/customers"
                                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition duration-200 ${isActive('/admin/customers')
                                    ? 'bg-emerald-50 text-[#042217]'
                                    : 'text-emerald-100 hover:bg-emerald-800/50 hover:text-white'
                                    }`}
                            >
                                <Users className="w-5 h-5" />
                                Data Pelanggan
                            </Link>
                        </div>

                        {/* Inventaris Group */}
                        <div>
                            <p className="px-3 text-xs font-semibold text-emerald-400 uppercase tracking-wider mb-2">Inventaris</p>
                            <div className="space-y-1">
                                <Link
                                    href="/admin/categories"
                                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition duration-200 ${isActive('/admin/categories')
                                        ? 'bg-emerald-50 text-[#042217]'
                                        : 'text-emerald-100 hover:bg-emerald-800/50 hover:text-white'
                                        }`}
                                >
                                    <Folder className="w-5 h-5" />
                                    Kategori Alat
                                </Link>
                                <Link
                                    href="/admin/equipment"
                                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition duration-200 ${isActive('/admin/equipment')
                                        ? 'bg-emerald-50 text-[#042217]'
                                        : 'text-emerald-100 hover:bg-emerald-800/50 hover:text-white'
                                        }`}
                                >
                                    <Package className="w-5 h-5" />
                                    Alat
                                </Link>
                            </div>
                        </div>

                        {/* Sistem Group */}
                        <div>
                            <p className="px-3 text-xs font-semibold text-emerald-400 uppercase tracking-wider mb-2 mt-4">Sistem</p>
                            <div className="space-y-1">
                                <Link
                                    href="/admin/settings"
                                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition duration-200 ${isActive('/admin/settings')
                                        ? 'bg-emerald-50 text-[#042217]'
                                        : 'text-emerald-100 hover:bg-emerald-800/50 hover:text-white'
                                        }`}
                                >
                                    <Settings className="w-5 h-5" />
                                    Pengaturan
                                </Link>
                            </div>
                        </div>
                    </nav>


                </aside>

                {/* Main Area */}
                <div className="flex-1 flex flex-col h-screen overflow-hidden">
                    {/* Top Header */}
                    <header className="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-6 lg:px-10 shrink-0 relative z-30">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => setSidebarOpen(true)}
                                className="lg:hidden text-slate-500 hover:text-slate-900"
                            >
                                <Menu className="w-6 h-6" />
                            </button>
                            <div>
                                <h1 className="text-2xl font-bold text-slate-900">{title}</h1>
                                <p className="text-sm text-slate-500">{dateString}</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-4 sm:gap-6">
                            <div className="relative">
                                <button 
                                    onClick={() => setNotifMenuOpen(!notifMenuOpen)}
                                    className="relative text-slate-500 hover:text-slate-900 transition-colors focus:outline-none"
                                >
                                    <Bell className="w-6 h-6" />
                                    {admin_notifications.length > 0 && (
                                        <span className="absolute -top-1 -right-1 w-4 h-4 text-[9px] flex items-center justify-center font-bold text-white bg-red-500 rounded-full">
                                            {admin_notifications.length}
                                        </span>
                                    )}
                                </button>
                                
                                {notifMenuOpen && (
                                    <>
                                        <div
                                            className="fixed inset-0 z-40"
                                            onClick={() => setNotifMenuOpen(false)}
                                        ></div>

                                        <div className="absolute right-0 mt-3 w-80 bg-white rounded-xl shadow-lg border border-slate-100 z-50 py-2 animate-in fade-in slide-in-from-top-2 overflow-hidden flex flex-col max-h-[400px]">
                                            <div className="px-4 py-2 border-b border-slate-100 flex items-center justify-between">
                                                <h3 className="font-bold text-slate-900 text-sm">Notifikasi</h3>
                                                <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">{admin_notifications.length} Baru</span>
                                            </div>
                                            
                                            <div className="overflow-y-auto flex-1">
                                                {admin_notifications.length > 0 ? (
                                                    admin_notifications.map(notif => {
                                                        let Icon = Bell;
                                                        if (notif.icon === 'shopping-cart') Icon = ShoppingCart;
                                                        if (notif.icon === 'alert-triangle') Icon = AlertTriangle;
                                                        if (notif.icon === 'package') Icon = Package;
                                                        if (notif.icon === 'wrench') Icon = Wrench;
                                                        
                                                        const colorClasses = {
                                                            'blue': 'bg-blue-50 text-blue-600',
                                                            'red': 'bg-red-50 text-red-600',
                                                            'orange': 'bg-orange-50 text-orange-600',
                                                            'emerald': 'bg-emerald-50 text-emerald-600',
                                                        }[notif.color] || 'bg-slate-50 text-slate-600';

                                                        return (
                                                            <div key={notif.id} className="relative group border-b border-slate-50 last:border-0">
                                                                <Link
                                                                    href={notif.link}
                                                                    className="flex items-start gap-3 px-4 py-3 hover:bg-slate-50 transition-colors pr-12"
                                                                    onClick={() => setNotifMenuOpen(false)}
                                                                >
                                                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${colorClasses}`}>
                                                                        <Icon className="w-4 h-4" />
                                                                    </div>
                                                                    <div className="flex-1 min-w-0">
                                                                        <p className="text-sm font-semibold text-slate-900 truncate">{notif.title}</p>
                                                                        <p className="text-xs text-slate-600 line-clamp-2 mt-0.5">{notif.message}</p>
                                                                        <p className="text-[10px] text-slate-400 mt-1">{notif.time}</p>
                                                                    </div>
                                                                </Link>
                                                                <button
                                                                    onClick={(e) => {
                                                                        e.preventDefault();
                                                                        router.post('/admin/notifications/mark-read', { notification_id: notif.id }, { preserveScroll: true });
                                                                    }}
                                                                    title="Tandai telah dibaca"
                                                                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-slate-300 hover:text-green-500 hover:bg-green-50 rounded-full transition-colors opacity-0 group-hover:opacity-100"
                                                                >
                                                                    <Check className="w-4 h-4" />
                                                                </button>
                                                            </div>
                                                        );
                                                    })
                                                ) : (
                                                    <div className="py-8 text-center text-slate-500 flex flex-col items-center">
                                                        <Bell className="w-8 h-8 mb-2 text-slate-300" />
                                                        <p className="text-sm">Tidak ada notifikasi baru</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>

                            {/* User Profile */}
                            <div className="relative pl-4 sm:pl-6 border-l border-slate-200">
                                <button
                                    onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                                    className="flex items-center gap-3 hover:opacity-80 transition-opacity focus:outline-none"
                                >
                                    <div className="hidden sm:flex flex-col items-end">
                                        <p className="text-sm font-bold text-slate-900 leading-tight">{auth.user?.name || 'Admin'}</p>
                                        <p className="text-xs text-slate-500">{auth.user?.email || 'admin@test.com'}</p>
                                    </div>
                                    <div className="w-10 h-10 rounded-full bg-emerald-100 border border-green-200 flex items-center justify-center font-bold text-green-700 shrink-0">
                                        {auth.user?.name ? auth.user.name.substring(0, 2).toUpperCase() : 'AD'}
                                    </div>
                                </button>

                                {/* Dropdown Menu */}
                                {profileMenuOpen && (
                                    <>
                                        {/* Invisible backdrop to detect clicks outside */}
                                        <div
                                            className="fixed inset-0 z-40"
                                            onClick={() => setProfileMenuOpen(false)}
                                        ></div>

                                        <div className="absolute right-0 mt-3 w-48 bg-white rounded-xl shadow-lg border border-slate-100 z-50 py-1.5 animate-in fade-in slide-in-from-top-2">
                                            {/* Show user info inside dropdown only on mobile */}
                                            <div className="px-4 py-2 border-b border-slate-100 mb-1 sm:hidden">
                                                <p className="text-sm font-bold text-slate-900 truncate">{auth.user?.name || 'Admin'}</p>
                                                <p className="text-xs text-slate-500 truncate">{auth.user?.email || 'admin@test.com'}</p>
                                            </div>
                                            <Link
                                                href="/admin/profile"
                                                className="w-full text-left px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2 transition-colors font-medium"
                                            >
                                                <Users className="w-4 h-4" />
                                                Profil Saya
                                            </Link>
                                            <Link
                                                href="/admin/logout"
                                                method="post"
                                                as="button"
                                                className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors font-medium"
                                            >
                                                <LogOut className="w-4 h-4" />
                                                Keluar
                                            </Link>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    </header>

                    {/* Page Content */}
                    <main className="flex-1 overflow-y-auto p-6 lg:p-10 bg-slate-50">
                        {children}
                    </main>
                </div>
            </div>
        </>
    );
}
