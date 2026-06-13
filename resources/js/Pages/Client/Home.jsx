import React, { useState, useEffect } from 'react';
import ClientLayout from '../../Layouts/ClientLayout';
import EquipmentCard from '../../Components/EquipmentCard';
import { getEquipments } from '../../services/api';
import { Head, usePage } from '@inertiajs/react';
import { Zap, Users, Search, ArrowRight } from 'lucide-react';

export default function Home() {
    const { auth, newUnitsCount = 0, satisfiedCustomersCount = 0 } = usePage().props;
    const isLoggedIn = !!auth?.user || !!localStorage.getItem('tto_auth_token');

    const [equipments, setEquipments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [cartItems, setCartItems] = useState(() => {
        try {
            const saved = localStorage.getItem('tto_cart');
            const parsed = saved ? JSON.parse(saved) : [];
            return Array.isArray(parsed) ? parsed : [];
        } catch (e) {
            return [];
        }
    });
    const [toast, setToast] = useState('');

    useEffect(() => {
        getEquipments({ per_page: 6, featured: true })
            .then(res => {
                let items = [];
                if (Array.isArray(res.data?.data?.data)) {
                    items = res.data.data.data; // Laravel paginator wrapped in custom response
                } else if (Array.isArray(res.data?.data)) {
                    items = res.data.data; // Standard Laravel paginator or simple array wrapped
                } else if (Array.isArray(res.data)) {
                    items = res.data;
                }
                setEquipments(items);
            })
            .catch(err => console.error(err))
            .finally(() => setLoading(false));
    }, []);

    useEffect(() => {
        localStorage.setItem('tto_cart', JSON.stringify(cartItems));
    }, [cartItems]);

    const handleAddToCart = (equipment) => {
        setCartItems(prev => {
            const existing = prev.find(item => item.id === equipment.id);
            if (existing) {
                return prev.map(item => item.id === equipment.id ? { ...item, qty: item.qty + 1 } : item);
            }
            return [...prev, { ...equipment, qty: 1 }];
        });
        setToast('Ditambahkan ke keranjang ✓');
        setTimeout(() => setToast(''), 2000);
    };

    const filteredEquipments = (equipments || []).filter(eq => eq?.name?.toLowerCase().includes(searchQuery.toLowerCase()));

    return (
        <ClientLayout title="Home" cartCount={cartItems?.reduce?.((acc, item) => acc + (item?.qty || 0), 0) || 0} isLoggedIn={isLoggedIn} user={auth?.user}>
            <Head title="Home" />

            <div className="mt-4 md:mt-8">
                {/* Hero Banner Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12">
                    {/* Left Main Hero */}
                    <div className="lg:col-span-2 bg-[#072F1F] rounded-[24px] p-6 md:p-10 flex flex-col justify-center relative overflow-hidden min-h-[300px] md:h-[340px]">
                        <div className="z-10 relative">
                            <div className="inline-block px-4 py-1.5 bg-[#1DD28B]/10 rounded-full mb-4 md:mb-6">
                                <span className="text-[#1DD28B] text-[10px] font-bold tracking-widest uppercase">TIGA TITIK OUTDOOR</span>
                            </div>
                            <h1 className="text-white text-[36px] md:text-[52px] font-black leading-[1.1] mb-3 md:mb-4 tracking-tight">
                                Eksplorasi Alam <br />
                                Tanpa <span className="text-[#1DD28B] italic">Batas.</span>
                            </h1>
                            <p className="text-white/60 text-xs md:text-sm mb-6 md:mb-8 max-w-md font-medium leading-relaxed">
                                Penyewaan perlengkapan kemah profesional dengan kualitas terjamin.
                            </p>
                        </div>
                        {/* Soft overlay gradient/blob if needed */}
                        <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/3"></div>
                    </div>

                    {/* Right Stat Cards */}
                    <div className="flex flex-col md:flex-row lg:flex-col gap-4 md:gap-6 h-auto lg:h-[340px]">
                        <div className="flex-1 bg-white rounded-[24px] p-5 flex flex-col justify-center border border-slate-100 shadow-sm min-h-[140px]">
                            <Zap className="w-6 h-6 md:w-7 md:h-7 text-[#F97316] mb-3 md:mb-4" fill="#F97316" />
                            <p className="text-[9px] md:text-[10px] text-slate-400 font-bold tracking-widest uppercase mb-1">KETERSEDIAAN</p>
                            <h3 className="font-black text-slate-800 text-xl md:text-2xl italic tracking-tight">READY STOCK</h3>
                            <div className="flex items-center gap-1.5 mt-2 text-[#1DD28B] font-bold text-[10px] md:text-xs">
                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m3 17 9-11 9 11" /></svg>
                                <span>+{newUnitsCount} Unit Baru</span>
                            </div>
                        </div>

                        <div className="bg-emerald-500 p-5 rounded-[24px] flex-1 flex flex-col justify-center shadow-xl shadow-emerald-500/20 text-white min-h-[140px]">
                            <Users size={28} className="mb-3 md:mb-4" />
                            <p className="text-emerald-100/80 text-[10px] md:text-xs font-bold uppercase tracking-widest">
                                Pelanggan Puas
                            </p>
                            <h3 className="text-2xl md:text-3xl font-black mt-1 uppercase">{satisfiedCustomersCount.toLocaleString('id-ID')}+</h3>
                        </div>
                    </div>
                </div>

                {/* Section Katalog Pilihan */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 md:mb-8 mt-4 md:mt-0">
                    <div className="flex items-center gap-2">
                        <h2 className="text-xl md:text-2xl font-black text-slate-800 tracking-tight uppercase">KATALOG</h2>
                        <h2 className="text-xl md:text-2xl font-black text-[#1DD28B] tracking-tight uppercase">PILIHAN</h2>
                    </div>
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" strokeWidth={2.5} />
                        <input
                            type="text"
                            placeholder="Cari perlengkapan..."
                            className="w-full md:w-[320px] pl-11 pr-4 py-3 bg-white border-none rounded-2xl text-sm font-medium outline-none focus:ring-2 focus:ring-[#1DD28B]/20 shadow-[0_2px_10px_rgba(0,0,0,0.02)] placeholder:text-slate-300 placeholder:font-normal"
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>

                {loading ? (
                    <div className="flex items-center justify-center h-48">
                        <div className="animate-spin w-8 h-8 border-4 border-[#1DD28B] border-t-transparent rounded-full"></div>
                    </div>
                ) : filteredEquipments.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                        {filteredEquipments.map(eq => (
                            <EquipmentCard
                                key={eq.id}
                                item={eq}
                                onAddToCart={handleAddToCart}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12 bg-white rounded-[24px] border border-slate-100 shadow-sm">
                        <p className="text-slate-400 font-medium text-sm">Tidak ada alat yang ditemukan.</p>
                    </div>
                )}
            </div>

            {/* Toast Notification */}
            {toast && (
                <div className="fixed bottom-[80px] md:bottom-10 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-bottom-5 fade-in duration-300">
                    <div className="bg-[#072F1F] text-white px-5 py-3 rounded-full text-sm font-bold shadow-xl shadow-[#072F1F]/20 flex items-center gap-2">
                        {toast}
                    </div>
                </div>
            )}
        </ClientLayout>
    );
}
