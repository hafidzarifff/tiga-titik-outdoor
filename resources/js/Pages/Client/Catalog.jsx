import React, { useState, useEffect } from 'react';
import ClientLayout from '@/Layouts/ClientLayout';
import { Head, usePage, Link } from '@inertiajs/react';
import { getEquipments, getCategories } from '../../services/api';
import { Search, ArrowDownUp, Leaf, LayoutGrid, Tent, Backpack, UtensilsCrossed, Footprints, Package, Star, ShoppingCart } from 'lucide-react';

const CATEGORY_ICONS = {
    'Tent': Tent,
    'Tenda': Tent,
    'Backpack': Backpack,
    'Tas': Backpack,
    'Utensils': UtensilsCrossed,
    'Masak': UtensilsCrossed,
    'Footprints': Footprints,
    'Sepatu': Footprints,
    'Aksesoris': Package,
};

const STORAGE_URL = '/storage';

function CatalogCard({ item, onAddToCart }) {
    const category = item.category?.name || 'Uncategorized';
    const images = item.images || [];
    const imageUrl = images.length > 0 ? `${STORAGE_URL}/${images[0].image_path}` : null;

    // Fallbacks for missing fields to match the UI design
    const rating = item.rating || "5";
    const rentCount = item.rent_count || 0;

    // Dynamic Badges
    let topBadge = null;
    let badgeColor = "bg-[#072F1F] text-white";

    const isNew = item.created_at && (new Date() - new Date(item.created_at)) < 7 * 24 * 60 * 60 * 1000;

    if (item.is_top_rated) {
        topBadge = "TERLARIS";
        badgeColor = "bg-orange-500 text-white shadow-orange-500/30";
    } else if (isNew) {
        topBadge = "BARU";
        badgeColor = "bg-[#1DD28B] text-[#072F1F] shadow-[#1DD28B]/30";
    }

    return (
        <div className="bg-white rounded-[32px] shadow-[0_4px_24px_rgba(0,0,0,0.03)] border border-slate-100/50 p-5 flex flex-col hover:shadow-[0_8px_32px_rgba(0,0,0,0.06)] transition-all duration-300">
            {/* Top Badge & Image Area */}
            <Link href={`/catalog/${item.id}`} className="relative h-[180px] md:h-[220px] bg-[#F8FAFC] rounded-[24px] mb-5 flex items-center justify-center p-4 md:p-6 block">
                {/* Top Badge */}
                {topBadge && (
                    <div className="absolute top-4 left-4 z-10">
                        <div className={`${badgeColor} text-[9px] font-bold px-3 py-1.5 rounded-full tracking-widest uppercase shadow-sm`}>
                            {topBadge}
                        </div>
                    </div>
                )}

                {imageUrl ? (
                    <img src={imageUrl} alt={item.name} className="w-full h-full object-contain mix-blend-multiply hover:scale-105 transition-transform duration-500" />
                ) : (
                    <Package className="w-16 h-16 text-slate-300 hover:scale-105 transition-transform duration-500" />
                )}
            </Link>

            {/* Content Area */}
            <div className="flex-1 flex flex-col px-2">
                <div className="flex items-start justify-between gap-3 mb-3">
                    <Link href={`/catalog/${item.id}`} className="font-black text-slate-900 text-lg leading-tight uppercase line-clamp-2 hover:text-[#1DD28B] transition-colors">
                        {item.name}
                    </Link>
                </div>

                <div className="flex items-center justify-between gap-1.5 mb-6">
                    <div className="flex items-center gap-1.5 text-[#1DD28B]">
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>
                        <span className="text-[12px] font-bold tracking-wider uppercase">{rentCount} X DISEWA</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-orange-500">
                        <Package className="w-3.5 h-3.5" />
                        <span className="text-[12px] font-bold tracking-wider uppercase">SISA: {item.available_stock}</span>
                    </div>
                </div>

                <div className="flex items-end justify-between mt-auto">
                    <div>
                        <p className="text-[9px] text-slate-400 font-bold tracking-widest uppercase mb-0.5">Harga Sewa / Hari</p>
                        <p className="font-black text-[#072F1F] text-[22px] leading-none">
                            Rp {Number(item.price_per_day || 0).toLocaleString('id-ID')}
                        </p>
                    </div>
                    <button
                        onClick={() => onAddToCart(item)}
                        disabled={item.available_stock < 1}
                        className="w-12 h-12 bg-[#072F1F] hover:bg-[#0a452d] disabled:bg-slate-200 text-white rounded-[14px] flex items-center justify-center transition-colors shrink-0"
                    >
                        <ShoppingCart className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </div>
    );
}

export default function Catalog() {
    const { auth } = usePage().props;
    const isLoggedIn = !!auth?.user || !!localStorage.getItem('tto_auth_token');

    const [equipments, setEquipments] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeCategory, setActiveCategory] = useState('all');

    const [cartItems, setCartItems] = useState(() => {
        try {
            const saved = localStorage.getItem('tto_cart');
            return saved ? JSON.parse(saved) : [];
        } catch (e) {
            return [];
        }
    });

    useEffect(() => {
        // Fetch Categories
        getCategories()
            .then(res => setCategories(res.data || []))
            .catch(err => console.error("Could not load categories", err));

        // Fetch Equipments
        getEquipments({ per_page: 100 }) // Load all for client side filtering
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

        // Show temporary toast or alert
        const toast = document.createElement('div');
        toast.className = 'fixed bottom-10 left-1/2 -translate-x-1/2 z-50 bg-[#072F1F] text-white px-5 py-3 rounded-full text-sm font-bold shadow-xl shadow-[#072F1F]/20 animate-in slide-in-from-bottom-5 fade-in duration-300';
        toast.innerText = 'Ditambahkan ke keranjang ✓';
        document.body.appendChild(toast);
        setTimeout(() => {
            toast.remove();
        }, 2000);
    };

    const filteredEquipments = equipments.filter(eq => {
        const matchesSearch = eq?.name?.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = activeCategory === 'all' || eq.category_id === activeCategory;
        return matchesSearch && matchesCategory;
    });

    const getCategoryIcon = (name) => {
        const Icon = CATEGORY_ICONS[name] || Package;
        return <Icon className="w-4 h-4" />;
    };

    return (
        <ClientLayout title="Katalog Alat" cartCount={cartItems.reduce((acc, item) => acc + item.qty, 0)} isLoggedIn={isLoggedIn} user={auth?.user}>
            <Head title="Katalog Alat" />

            <div className="pt-6 pb-12">
                {/* Header Section */}
                <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 md:gap-6 mb-8 md:mb-10">
                    <div>
                        <h1 className="text-[28px] md:text-[40px] font-black tracking-tight leading-none uppercase">
                            <span className="text-[#072F1F]">Katalog</span>
                            <span className="text-[#1DD28B] italic ml-3 md:ml-4">Alat Outdoor</span>
                        </h1>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center gap-4">
                        <div className="relative w-full sm:w-[280px]">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Cari perlengkapan..."
                                className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-full text-sm font-medium outline-none focus:border-[#1DD28B] focus:ring-1 focus:ring-[#1DD28B] shadow-sm placeholder:text-slate-400"
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>
                </div>

                {/* Categories Filter - Mobile (Dropdown) */}
                <div className="md:hidden mb-6">
                    <div className="relative">
                        <select
                            value={activeCategory}
                            onChange={(e) => setActiveCategory(e.target.value === 'all' ? 'all' : Number(e.target.value))}
                            className="w-full appearance-none bg-[#F8FAFC] border border-slate-200 text-slate-700 font-bold text-sm tracking-wider uppercase rounded-xl px-5 py-3.5 outline-none focus:border-[#1DD28B] focus:ring-1 focus:ring-[#1DD28B] shadow-sm"
                        >
                            <option value="all">SEMUA KATEGORI</option>
                            {categories.map(cat => (
                                <option key={cat.id} value={cat.id}>{cat.name.toUpperCase()}</option>
                            ))}
                        </select>
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none flex items-center justify-center w-8 h-8 bg-white rounded-lg shadow-sm border border-slate-100 text-slate-400">
                            <LayoutGrid className="w-4 h-4" />
                        </div>
                    </div>
                </div>

                {/* Categories Filter - Desktop (Flex Wrap) */}
                <div className="hidden md:flex mb-10 flex-wrap gap-3">
                    <button
                        onClick={() => setActiveCategory('all')}
                        className={`flex items-center gap-2 px-6 py-2.5 rounded-full text-xs font-bold tracking-wider uppercase transition-all duration-300 ${activeCategory === 'all'
                            ? 'bg-[#1DD28B] text-white shadow-md shadow-[#1DD28B]/20 border border-transparent'
                            : 'bg-white border border-slate-200 text-slate-500 hover:text-slate-800 hover:border-slate-300 shadow-sm'
                            }`}
                    >
                        <LayoutGrid className="w-4 h-4" /> SEMUA
                    </button>

                    {categories.map(cat => (
                        <button
                            key={cat.id}
                            onClick={() => setActiveCategory(cat.id)}
                            className={`flex items-center gap-2 px-6 py-2.5 rounded-full text-xs font-bold tracking-wider uppercase transition-all duration-300 ${activeCategory === cat.id
                                ? 'bg-[#1DD28B] text-white shadow-md shadow-[#1DD28B]/20 border border-transparent'
                                : 'bg-white border border-slate-200 text-slate-500 hover:text-slate-800 hover:border-slate-300 shadow-sm'
                                }`}
                        >
                            {getCategoryIcon(cat.icon || cat.name)} {cat.name}
                        </button>
                    ))}
                </div>

                {/* Equipment Grid */}
                {loading ? (
                    <div className="flex items-center justify-center h-64">
                        <div className="animate-spin w-10 h-10 border-4 border-[#1DD28B] border-t-transparent rounded-full"></div>
                    </div>
                ) : filteredEquipments.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredEquipments.map(eq => (
                            <CatalogCard
                                key={eq.id}
                                item={eq}
                                onAddToCart={handleAddToCart}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20 bg-white rounded-[32px] border border-slate-100 shadow-sm">
                        <Package className="w-16 h-16 text-slate-200 mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-slate-700 mb-1">Alat tidak ditemukan</h3>
                        <p className="text-slate-400 font-medium">Coba gunakan kata kunci atau kategori lain.</p>
                    </div>
                )}
            </div>

            <style>{`
                .hide-scrollbar::-webkit-scrollbar {
                    display: none;
                }
                .hide-scrollbar {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }
            `}</style>
        </ClientLayout>
    );
}
