import React, { useState } from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import ClientLayout from '@/Layouts/ClientLayout';
import { ChevronLeft, Share2, Heart, Star, ShieldCheck, Info, Package, MessageSquare, ShoppingCart, CheckCircle2, Minus, Plus, XCircle } from 'lucide-react';

const STORAGE_URL = '/storage';

export default function EquipmentDetail({ equipment }) {
    const { auth } = usePage().props;
    const isLoggedIn = !!auth?.user || !!localStorage.getItem('tto_auth_token');

    const [cartItems, setCartItems] = useState(() => {
        try {
            const saved = localStorage.getItem('tto_cart');
            return saved ? JSON.parse(saved) : [];
        } catch (e) {
            return [];
        }
    });

    const images = equipment.images || [];
    const [activeImage, setActiveImage] = useState(images.length > 0 ? `${STORAGE_URL}/${images[0].image_path}` : null);

    const [unitCount, setUnitCount] = useState(1);

    const handleAddToCart = () => {
        const newCartItems = [...cartItems];
        const existing = newCartItems.find(item => item.id === equipment.id);

        if (existing) {
            existing.qty += unitCount;
        } else {
            newCartItems.push({ ...equipment, qty: unitCount });
        }

        setCartItems(newCartItems);
        localStorage.setItem('tto_cart', JSON.stringify(newCartItems));

        const toast = document.createElement('div');
        toast.className = 'fixed bottom-10 left-1/2 -translate-x-1/2 z-50 bg-[#072F1F] text-white px-5 py-3 rounded-full text-sm font-bold shadow-xl shadow-[#072F1F]/20 animate-in slide-in-from-bottom-5 fade-in duration-300';
        toast.innerText = 'Ditambahkan ke keranjang ✓';
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 2000);
    };

    const rating = equipment.rating || 5;
    const rentCount = equipment.rent_count || 0;
    const categoryName = equipment.category?.name || 'UMUM';

    const attributes = [
        { label: 'KATEGORI', value: categoryName.toUpperCase() },
        { label: 'STATUS', value: equipment.status },
    ];

    if (equipment.deposit_amount && equipment.deposit_amount > 0) {
        attributes.push({ label: 'DEPOSIT', value: `Rp ${Number(equipment.deposit_amount).toLocaleString('id-ID')}` });
    }

    if (equipment.penalty_hourly_rate && equipment.penalty_hourly_rate > 0) {
        attributes.push({ label: 'DENDA/JAM', value: `Rp ${Number(equipment.penalty_hourly_rate).toLocaleString('id-ID')}` });
    }

    return (
        <ClientLayout title={`Detail - ${equipment.name}`} cartCount={cartItems.reduce((acc, item) => acc + item.qty, 0)} isLoggedIn={isLoggedIn} user={auth?.user}>
            <Head title={equipment.name} />

            <div className="pt-6 pb-20 max-w-6xl mx-auto">
                {/* Header Navigation */}
                <div className="flex items-center justify-between mb-8">
                    <Link href="/catalog" className="flex items-center gap-2 text-slate-500 hover:text-slate-800 transition-colors font-semibold text-sm bg-white px-4 py-2.5 rounded-full shadow-sm border border-slate-100">
                        <ChevronLeft className="w-4 h-4" strokeWidth={3} />
                        Kembali ke Katalog
                    </Link>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                    {/* Left: Image Gallery */}
                    <div className="flex flex-col gap-4">
                        <div className="bg-white rounded-[32px] p-10 flex items-center justify-center h-[350px] md:h-[450px] shadow-sm border border-slate-100/50">
                            {activeImage ? (
                                <img src={activeImage} alt={equipment.name} className="w-full h-full object-contain mix-blend-multiply drop-shadow-xl" />
                            ) : (
                                <Package className="w-24 h-24 text-slate-200" />
                            )}
                        </div>

                        {images.length > 1 && (
                            <div className="flex gap-4 overflow-x-auto pb-2 hide-scrollbar">
                                {images.map((img, idx) => {
                                    const imgUrl = `${STORAGE_URL}/${img.image_path}`;
                                    const isActive = activeImage === imgUrl;
                                    return (
                                        <button
                                            key={idx}
                                            onClick={() => setActiveImage(imgUrl)}
                                            className={`w-24 h-24 rounded-2xl bg-white p-3 border-2 flex-shrink-0 transition-all ${isActive ? 'border-[#1DD28B] shadow-md' : 'border-slate-100 hover:border-slate-300'}`}
                                        >
                                            <img src={imgUrl} alt="thumbnail" className="w-full h-full object-contain mix-blend-multiply" />
                                        </button>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {/* Right: Product Details */}
                    <div className="bg-white rounded-[32px] p-6 md:p-10 shadow-sm border border-slate-100/50 flex flex-col">
                        <h1 className="text-xl md:text-3xl font-black text-[#072F1F] leading-tight mb-2 uppercase">
                            {equipment.name}
                        </h1>

                        <div className="bg-[#1DD28B]/5 border border-[#1DD28B]/20 rounded-3xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                            <div>
                                <p className="text-[10px] font-bold text-[#1DD28B] uppercase tracking-widest mb-1">Harga Sewa / Hari</p>
                                <p className="text-2xl font-black text-[#072F1F]">Rp {Number(equipment.price_per_day).toLocaleString('id-ID')}</p>
                            </div>
                            <div className="flex flex-col items-start sm:items-end gap-1">
                                {equipment.available_stock > 0 ? (
                                    <>
                                        <div className="bg-white px-4 py-2 rounded-full border border-green-100 shadow-sm flex items-center gap-2">
                                            <ShieldCheck className="w-4 h-4 text-[#1DD28B]" />
                                            <span className="text-xs font-bold text-[#072F1F]">Tersedia</span>
                                        </div>
                                        <span className="text-[10px] font-bold text-[#1DD28B] uppercase tracking-widest pr-2 mt-1">
                                            STOK: {equipment.available_stock} UNIT
                                        </span>
                                    </>
                                ) : (
                                    <>
                                        <div className="bg-slate-50 px-4 py-2 rounded-full border border-slate-200 shadow-sm flex items-center gap-2">
                                            <XCircle className="w-4 h-4 text-slate-400" />
                                            <span className="text-xs font-bold text-slate-400">Tidak Tersedia</span>
                                        </div>
                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pr-2 mt-1">
                                            STOK: 0 UNIT
                                        </span>
                                    </>
                                )}
                            </div>
                        </div>

                        <div className="mb-8">
                            <div className="flex items-center gap-2 mb-4">
                                <Info className="w-5 h-5 text-[#072F1F]" />
                                <h3 className="text-sm font-black tracking-widest text-[#072F1F] uppercase">Deskripsi Produk</h3>
                            </div>
                            <p className="text-slate-500 text-sm leading-relaxed mb-6 italic">
                                {equipment.description || `${equipment.name} adalah pilihan tepat untuk aktivitas outdoor Anda. Dirancang dengan material berkualitas tinggi untuk daya tahan maksimal.`}
                            </p>

                            <div className="grid grid-cols-2 gap-3">
                                {attributes.map((attr, idx) => (
                                    <div key={idx} className="bg-slate-50 px-4 py-3 rounded-xl border border-slate-100 flex items-center gap-3">
                                        <div className="w-1.5 h-1.5 bg-[#1DD28B] rounded-full"></div>
                                        <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                                            {attr.label}: <span className="text-slate-800">{attr.value}</span>
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="mt-auto pt-6 border-t border-slate-100">
                            <div className="mb-6">
                                <div>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Unit</p>
                                    <div className="flex items-center justify-between bg-slate-50 border border-slate-200 rounded-xl p-1 w-full">
                                        <button
                                            onClick={() => setUnitCount(Math.max(1, unitCount - 1))}
                                            className="w-10 h-10 flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-lg transition"
                                        >
                                            <Minus className="w-4 h-4" />
                                        </button>
                                        <span className="font-bold text-slate-800">{unitCount}</span>
                                        <button
                                            onClick={() => setUnitCount(Math.min(equipment.available_stock, unitCount + 1))}
                                            className="w-10 h-10 flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-lg transition"
                                        >
                                            <Plus className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-4">
                                <button
                                    onClick={handleAddToCart}
                                    disabled={equipment.available_stock < 1}
                                    className="flex-1 bg-[#1DD28B]/10 hover:bg-[#1DD28B]/20 disabled:bg-slate-100 text-[#1DD28B] disabled:text-slate-400 border border-[#1DD28B]/20 disabled:border-slate-200 font-bold text-xs uppercase tracking-widest py-4 rounded-2xl flex items-center justify-center gap-2 transition-colors disabled:cursor-not-allowed"
                                >
                                    <ShoppingCart className="w-4 h-4" /> {equipment.available_stock < 1 ? 'STOK HABIS' : '+ KERANJANG'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </ClientLayout>
    );
}
