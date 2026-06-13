import React, { useState, useEffect } from 'react';
import ClientLayout from '@/Layouts/ClientLayout';
import { Head, usePage, router } from '@inertiajs/react';
import LoginModal from '@/Components/LoginModal';
import { CheckCircle2, Trash2, Package, CheckCircle, CreditCard, Minus, Plus } from 'lucide-react';

export default function Cart() {
    const { auth } = usePage().props;
    const isLoggedIn = !!auth.user || !!localStorage.getItem('tto_auth_token');

    const [cartItems, setCartItems] = useState(() => {
        const saved = localStorage.getItem('tto_cart');
        return saved ? JSON.parse(saved) : [];
    });
    const [selectedItems, setSelectedItems] = useState(() => {
        // Default select all
        const saved = localStorage.getItem('tto_cart');
        const parsed = saved ? JSON.parse(saved) : [];
        return parsed.map(item => item.id);
    });
    const [isLoginModalOpen, setLoginModalOpen] = useState(false);

    useEffect(() => {
        localStorage.setItem('tto_cart', JSON.stringify(cartItems));
    }, [cartItems]);

    const removeItem = (id) => {
        setCartItems(prev => prev.filter(item => item.id !== id));
        setSelectedItems(prev => prev.filter(itemId => itemId !== id));
    };

    const updateQty = (id, newQty, availableStock) => {
        if (newQty < 1) return;
        if (newQty > availableStock) {
            alert(`Stok maksimal yang tersedia untuk alat ini adalah ${availableStock} unit.`);
            return;
        }
        setCartItems(prev => prev.map(item => item.id === id ? { ...item, qty: newQty } : item));
    };

    const toggleSelection = (id) => {
        setSelectedItems(prev =>
            prev.includes(id) ? prev.filter(itemId => itemId !== id) : [...prev, id]
        );
    };

    const toggleAll = () => {
        if (selectedItems.length === cartItems.length) {
            setSelectedItems([]);
        } else {
            setSelectedItems(cartItems.map(item => item.id));
        }
    };

    const isAllSelected = cartItems.length > 0 && selectedItems.length === cartItems.length;

    const selectedCartItems = cartItems.filter(item => selectedItems.includes(item.id));
    const total = selectedCartItems.reduce((acc, item) => acc + (item.price_per_day * item.qty), 0);
    const totalItems = selectedCartItems.reduce((acc, item) => acc + item.qty, 0);

    const handleCheckout = () => {
        const token = localStorage.getItem('tto_auth_token');
        if (!token && !auth.user) {
            setLoginModalOpen(true);
        } else if (selectedCartItems.length === 0) {
            alert('Pilih minimal 1 barang untuk disewa');
        } else {
            router.visit('/booking/create', {
                method: 'get',
                data: { cart: JSON.stringify(selectedCartItems) }
            });
        }
    };

    return (
        <ClientLayout title="Keranjang" cartCount={totalItems} isLoggedIn={isLoggedIn} user={auth.user}>
            <Head title="Keranjang" />

            <div className="pt-6 pb-24 max-w-[1200px] mx-auto px-4 xl:px-0 w-full overflow-x-hidden">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
                    <div>
                        <h1 className="text-[32px] md:text-[40px] font-black tracking-tight leading-none uppercase italic text-[#072F1F]">
                            KERANJANG <span className="text-[#1DD28B]">SEWA</span>
                        </h1>
                        <p className="text-[10px] md:text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-2">
                            MANAJEMEN PERLENGKAPAN OUTDOOR ANDA
                        </p>
                    </div>

                    <div className="flex items-center">
                        <button
                            onClick={toggleAll}
                            className={`border px-5 py-2.5 rounded-full flex items-center gap-2 transition-colors ${isAllSelected
                                ? 'bg-[#1DD28B]/10 border-[#1DD28B]/20 text-[#072F1F]'
                                : 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100'
                                }`}
                        >
                            <div className={`w-2.5 h-2.5 rounded-full transition-colors ${isAllSelected ? 'bg-[#1DD28B]' : 'bg-slate-300'}`}></div>
                            <span className="text-[10px] font-black uppercase tracking-widest">
                                {isAllSelected ? 'SEMUA TERPILIH' : 'PILIH SEMUA'}
                            </span>
                        </button>
                    </div>
                </div>

                {cartItems.length === 0 ? (
                    <div className="bg-white rounded-[32px] border border-slate-100 flex flex-col items-center justify-center p-12 text-center shadow-sm">
                        <Package className="w-20 h-20 text-slate-200 mb-6" />
                        <h2 className="text-xl font-black text-slate-800 mb-2 uppercase">Keranjang Kosong</h2>
                        <p className="text-slate-400 font-medium mb-8 max-w-sm">Anda belum memasukkan perlengkapan apapun. Mari mulai petualangan Anda!</p>
                        <a href="/catalog" className="bg-[#072F1F] hover:bg-[#0a452d] text-white font-bold px-8 py-4 rounded-2xl transition-colors uppercase tracking-widest text-xs">
                            KEMBALI KE KATALOG
                        </a>
                    </div>
                ) : (
                    <div className="flex flex-col lg:flex-row gap-8 items-start">
                        {/* Left: Cart Items List */}
                        <div className="flex-1 w-full min-w-0 flex flex-col gap-4">
                            {cartItems.map(item => {
                                const isSelected = selectedItems.includes(item.id);
                                return (
                                    <div key={item.id} className={`bg-white border-2 rounded-[24px] md:rounded-full p-4 md:p-5 flex items-center gap-3 md:gap-6 relative overflow-hidden transition-all hover:shadow-lg ${isSelected ? 'border-[#1DD28B] shadow-[#1DD28B]/10' : 'border-slate-200'
                                        }`}>
                                        {/* Left Check Icon */}
                                        <button
                                            onClick={() => toggleSelection(item.id)}
                                            className={`w-6 h-6 md:w-8 md:h-8 rounded-full flex items-center justify-center shrink-0 ml-1 md:ml-2 transition-colors ${isSelected ? 'bg-[#1DD28B]/10 text-[#1DD28B]' : 'bg-transparent border-2 border-[#1DD28B] hover:bg-[#1DD28B]/5'
                                                }`}
                                        >
                                            {isSelected && <CheckCircle2 className="w-4 h-4 md:w-5 md:h-5" strokeWidth={3} />}
                                        </button>

                                        {/* Item Image */}
                                        <div className="w-16 h-16 md:w-20 md:h-20 bg-[#F8FAFC] rounded-2xl flex-shrink-0 flex items-center justify-center overflow-hidden border border-slate-100">
                                            {item.images && item.images.length > 0 ? (
                                                <img src={`/storage/${item.images[0].image_path}`} alt={item.name} className="w-full h-full object-contain mix-blend-multiply p-2" />
                                            ) : (
                                                <Package className="w-8 h-8 text-slate-300" />
                                            )}
                                        </div>

                                        {/* Item Details */}
                                        <div className="flex-1 min-w-0 pr-10 md:pr-20">
                                            <h3 className="font-black text-slate-900 text-xs md:text-base uppercase truncate mb-1.5">{item.name}</h3>

                                            <div className="flex items-center gap-2 mb-3">
                                                <div className="flex items-center justify-between bg-slate-50 border border-slate-200 rounded-lg p-0.5 w-24">
                                                    <button
                                                        onClick={() => updateQty(item.id, item.qty - 1, item.available_stock)}
                                                        className="w-7 h-7 flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-md transition"
                                                    >
                                                        <Minus className="w-3 h-3" />
                                                    </button>
                                                    <span className="font-bold text-slate-800 text-xs">{item.qty}</span>
                                                    <button
                                                        onClick={() => updateQty(item.id, item.qty + 1, item.available_stock)}
                                                        className="w-7 h-7 flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-md transition"
                                                    >
                                                        <Plus className="w-3 h-3" />
                                                    </button>
                                                </div>
                                            </div>

                                            <p className="text-[#072F1F] font-black text-lg md:text-xl italic leading-none">
                                                Rp {Number(item.price_per_day * item.qty).toLocaleString('id-ID')} <span className="text-[10px] text-slate-400 font-bold not-italic">/ HARI</span>
                                            </p>
                                        </div>

                                        {/* Delete Button */}
                                        <button
                                            onClick={() => removeItem(item.id)}
                                            className="absolute right-2 md:right-6 top-1/2 -translate-y-1/2 w-8 h-8 md:w-12 md:h-12 bg-red-50 hover:bg-red-100 text-red-400 hover:text-red-500 rounded-full flex items-center justify-center transition-colors shrink-0"
                                        >
                                            <Trash2 className="w-3 h-3 md:w-5 md:h-5" strokeWidth={2.5} />
                                        </button>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Right: Checkout Plan Panel */}
                        <div className="w-full lg:w-[400px] bg-[#072F1F] rounded-[32px] p-8 md:p-10 shadow-xl shrink-0 sticky top-24">
                            <div className="flex items-center gap-2 text-[#1DD28B] mb-2">
                                <Package className="w-4 h-4" />
                                <span className="text-[10px] font-bold tracking-widest uppercase">CHECKOUT PLAN</span>
                            </div>

                            <h2 className="text-white text-3xl font-black italic uppercase leading-none mb-1">
                                RINGKASAN
                            </h2>
                            <h2 className="text-[#1DD28B] text-3xl font-black italic uppercase leading-none mb-10">
                                TAGIHAN
                            </h2>

                            <div className="space-y-6 mb-8">
                                {selectedCartItems.length === 0 ? (
                                    <p className="text-white/50 text-xs italic">Tidak ada item yang dipilih</p>
                                ) : (
                                    selectedCartItems.map((item, idx) => (
                                        <div key={idx} className="flex justify-between items-start border-b border-white/10 pb-4">
                                            <div className="flex-1 min-w-0 pr-2 md:pr-4">
                                                <p className="text-white text-[10px] md:text-xs font-bold uppercase tracking-wider mb-1 truncate">{item.name}</p>
                                                <p className="text-[#1DD28B] text-[9px] md:text-[10px] font-bold uppercase tracking-widest">{item.qty}X UNIT</p>
                                            </div>
                                            <div className="text-right shrink-0">
                                                <p className="text-white text-sm font-black tracking-wide">
                                                    Rp {(item.price_per_day * item.qty).toLocaleString('id-ID')}
                                                </p>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>

                            <div className="mt-10 mb-8">
                                <p className="text-[#1DD28B] text-[10px] font-bold uppercase tracking-widest mb-2">TOTAL SEWA / HARI</p>
                                <div className="flex items-end justify-between flex-wrap gap-2">
                                    <h3 className="text-white text-2xl md:text-3xl font-black italic tracking-tight truncate">
                                        Rp {total.toLocaleString('id-ID')}
                                    </h3>
                                    <div className="bg-white/10 border border-white/10 px-3 md:px-4 py-1.5 rounded-full shrink-0">
                                        <span className="text-white text-[9px] md:text-[10px] font-bold tracking-widest uppercase">{totalItems} ITEM</span>
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={handleCheckout}
                                disabled={selectedCartItems.length === 0}
                                className={`w-full h-14 font-black text-xs tracking-widest uppercase rounded-2xl flex items-center justify-center gap-3 transition-colors ${selectedCartItems.length === 0
                                    ? 'bg-slate-700 text-slate-400 cursor-not-allowed'
                                    : 'bg-[#1DD28B] hover:bg-[#15b879] text-[#072F1F] shadow-lg shadow-[#1DD28B]/20'
                                    }`}
                            >
                                <CreditCard className="w-4 h-4" strokeWidth={2.5} />
                                KONFIRMASI SEWA ALAT
                            </button>
                        </div>
                    </div>
                )}
            </div>

            <LoginModal
                isOpen={isLoginModalOpen}
                onClose={() => setLoginModalOpen(false)}
                onSuccess={() => {
                    setLoginModalOpen(false);
                    handleCheckout();
                }}
            />
        </ClientLayout>
    );
}
