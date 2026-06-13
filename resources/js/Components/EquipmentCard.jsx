import React, { useState } from 'react';
import { Pencil, Wrench, Package, Trash2, ImageOff, ChevronLeft, ChevronRight, Camera, ShoppingCart } from 'lucide-react';
import { Tent, Backpack, Flame, UtensilsCrossed, Flashlight, Mountain, Footprints, Compass, Map } from 'lucide-react';
import { Link } from '@inertiajs/react';

const ICONS_MAP = {
    'Tent': Tent,
    'Backpack': Backpack,
    'Utensils': UtensilsCrossed,
    'Flashlight': Flashlight,
    'Mountain': Mountain,
    'Flame': Flame,
    'Footprints': Footprints,
    'Compass': Compass,
    'Package': Package,
    'Map': Map,
};

const STORAGE_URL = '/storage';

function StatusBadge({ status }) {
    const config = {
        Maintenance: { bg: 'bg-orange-100', text: 'text-orange-700', label: 'Maintenance' },
        Rusak: { bg: 'bg-red-100', text: 'text-red-700', label: 'Rusak' },
        Baik: { bg: 'bg-emerald-100', text: 'text-green-700', label: 'Aktif' },
    };
    const s = config[status] || config.Baik;
    return (
        <span className={`px-2 py-1 text-[10px] font-bold rounded-full ${s.bg} ${s.text} shadow-sm uppercase tracking-wider`}>
            {s.label}
        </span>
    );
}

function ImageCarousel({ images, name }) {
    const [currentIndex, setCurrentIndex] = useState(0);

    if (!images || images.length === 0) return null;

    const goTo = (dir) => {
        setCurrentIndex((prev) => {
            if (dir === 'next') return (prev + 1) % images.length;
            return (prev - 1 + images.length) % images.length;
        });
    };

    return (
        <div className="relative w-full h-full group flex items-center justify-center p-6">
            <img
                src={`${STORAGE_URL}/${images[currentIndex].image_path}`}
                alt={`${name} - ${currentIndex + 1}`}
                className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-105"
            />

            {images.length > 1 && (
                <>
                    <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); goTo('prev'); }}
                        className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-slate-800 p-1.5 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                        <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); goTo('next'); }}
                        className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-slate-800 p-1.5 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                        <ChevronRight className="w-4 h-4" />
                    </button>
                    <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                        {images.map((_, i) => (
                            <button
                                key={i}
                                type="button"
                                onClick={(e) => { e.stopPropagation(); setCurrentIndex(i); }}
                                className={`w-1.5 h-1.5 rounded-full transition-all ${i === currentIndex ? 'bg-[#072F1F] w-3' : 'bg-slate-300'}`}
                            />
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}

export default function EquipmentCard({ item, onEdit, onToggleStatus, onDelete, onAddToCart }) {
    const category = item.category;
    const images = item.images || [];
    const stockPercentage = item.total_stock > 0
        ? (item.available_stock / item.total_stock) * 100
        : 0;

    const renderIcon = (iconName, className) => {
        const IconComponent = ICONS_MAP[iconName] || Package;
        return <IconComponent className={className} strokeWidth={1.5} />;
    };

    const isMaintenance = item.status === 'Maintenance';
    const hasImages = images.length > 0;

    // Dynamic Badges
    let topBadge = null;
    let badgeColor = "bg-[#072F1F] text-white";

    // Determine if it's new (created in the last 7 days)
    const isNew = item.created_at && (new Date() - new Date(item.created_at)) < 7 * 24 * 60 * 60 * 1000;

    if (item.is_top_rated) {
        topBadge = "TERLARIS";
        badgeColor = "bg-orange-500 text-white shadow-orange-500/30";
    } else if (isNew) {
        topBadge = "BARU";
        badgeColor = "bg-[#1DD28B] text-[#072F1F] shadow-[#1DD28B]/30";
    }

    return (
        <div className="bg-white rounded-[24px] shadow-[0_4px_20px_rgba(0,0,0,0.03)] border-none overflow-hidden hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)] transition-all duration-300 flex flex-col group h-full">
            
            {/* Image Area */}
            <Link href={`/catalog/${item.id}`} className="relative h-[180px] md:h-[220px] bg-white flex items-center justify-center overflow-hidden block">
                {/* Top Badge */}
                {topBadge && (
                    <div className="absolute top-5 left-5 z-10">
                        <div className={`${badgeColor} text-[9px] font-bold px-3 py-1.5 rounded-full tracking-widest uppercase shadow-sm`}>
                            {topBadge}
                        </div>
                    </div>
                )}

                {hasImages ? (
                    <ImageCarousel images={images} name={item.name} />
                ) : (
                    <div className="flex items-center justify-center w-full h-full">
                        {category?.icon
                            ? renderIcon(category.icon, 'w-20 h-20 text-slate-200 group-hover:scale-110 transition-transform duration-500')
                            : <Package className="w-20 h-20 text-slate-200 group-hover:scale-110 transition-transform duration-500" />
                        }
                    </div>
                )}

                {/* Status Badges Overlay */}
                <div className="absolute top-5 right-5 z-10 flex flex-col gap-2 items-end">
                    {item.status !== 'Baik' && <StatusBadge status={item.status} />}
                </div>

                {/* Overlays for broken/maintenance */}
                {isMaintenance && (
                    <div className="absolute inset-0 bg-white/60 flex items-center justify-center backdrop-blur-[2px] pointer-events-none z-20">
                        <div className="bg-orange-500 text-white px-4 py-2 rounded-full text-xs font-bold flex items-center gap-2 shadow-lg">
                            <Wrench className="w-4 h-4" /> MAINTENANCE
                        </div>
                    </div>
                )}
                {item.status === 'Rusak' && (
                    <div className="absolute inset-0 bg-white/60 flex items-center justify-center backdrop-blur-[2px] pointer-events-none z-20">
                        <div className="bg-red-500 text-white px-4 py-2 rounded-full text-xs font-bold flex items-center gap-2 shadow-lg">
                            <ImageOff className="w-4 h-4" /> RUSAK
                        </div>
                    </div>
                )}
            </Link>

            {/* Content Area */}
            <div className="p-6 pt-2 flex-1 flex flex-col bg-white">
                <div className="mb-4">
                    <p className="text-[11px] font-bold text-[#1DD28B] tracking-wider uppercase mb-1">{category?.name || 'Uncategorized'}</p>
                    <Link href={`/catalog/${item.id}`} className="font-bold text-slate-800 text-lg leading-tight hover:text-[#1DD28B] transition-colors line-clamp-2">{item.name}</Link>
                </div>

                <div className="flex items-end justify-between mb-5 mt-auto">
                    <div>
                        <p className="text-[10px] text-slate-400 font-medium mb-0.5">Harga Sewa / Hari</p>
                        <p className="font-black text-slate-800 text-xl">
                            Rp {Number(item.price_per_day || 0).toLocaleString('id-ID')}
                        </p>
                    </div>
                    <div className="text-right">
                        <p className="text-[10px] text-slate-400 font-medium mb-0.5">Stok Tersedia</p>
                        <p className={`font-bold text-sm ${stockPercentage > 20 ? 'text-[#1DD28B]' : 'text-red-500'}`}>
                            {item.available_stock} <span className="text-slate-300 font-normal">/ {item.total_stock}</span>
                        </p>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                    {onAddToCart ? (
                        <button
                            onClick={() => onAddToCart(item)}
                            disabled={item.available_stock < 1 || item.status !== 'Baik'}
                            className="w-full flex items-center justify-center gap-2 bg-[#072F1F] hover:bg-[#0a452d] disabled:bg-slate-200 disabled:text-slate-400 text-white font-semibold transition-colors shadow-lg shadow-[#072F1F]/10"
                            style={{ height: '48px', borderRadius: '14px' }}
                        >
                            <ShoppingCart className="w-4 h-4" />
                            Tambah ke Keranjang
                        </button>
                    ) : (
                        <div className="grid grid-cols-3 gap-2 w-full">
                            {onEdit && (
                                <button
                                    onClick={() => onEdit(item)}
                                    className="col-span-1 flex items-center justify-center bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-xl transition"
                                    style={{ height: '44px' }}
                                >
                                    <Pencil className="w-4 h-4" />
                                </button>
                            )}
                            {onToggleStatus && (
                                <button
                                    onClick={() => onToggleStatus(item)}
                                    className={`col-span-1 flex items-center justify-center rounded-xl transition ${isMaintenance ? 'bg-orange-100 text-orange-600' : 'bg-slate-50 text-slate-400 hover:text-orange-500 hover:bg-orange-50'}`}
                                    style={{ height: '44px' }}
                                >
                                    <Wrench className="w-4 h-4" />
                                </button>
                            )}
                            {onDelete && (
                                <button
                                    onClick={() => onDelete(item.id)}
                                    className="col-span-1 flex items-center justify-center bg-red-50 hover:bg-red-100 text-red-500 rounded-xl transition"
                                    style={{ height: '44px' }}
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
