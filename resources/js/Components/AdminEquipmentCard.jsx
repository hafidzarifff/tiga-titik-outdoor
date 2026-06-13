import React, { useState } from 'react';
import { Pencil, Wrench, Package, Trash2, ChevronLeft, ChevronRight, Camera } from 'lucide-react';
import { Tent, Backpack, Flame, UtensilsCrossed, Flashlight, Mountain, Footprints, Compass, Map } from 'lucide-react';

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
        Maintenance: {
            bg: 'bg-orange-100',
            text: 'text-orange-700',
            border: 'border-orange-200',
            label: 'Maintenance',
        },
        Rusak: {
            bg: 'bg-red-100',
            text: 'text-red-700',
            border: 'border-red-200',
            label: 'Rusak',
        },
        Baik: {
            bg: 'bg-emerald-100',
            text: 'text-green-700',
            border: 'border-green-200',
            label: 'Aktif',
        },
    };

    const s = config[status] || config.Baik;

    return (
        <span className={`px-2.5 py-1 text-xs font-medium border rounded-full ${s.bg} ${s.text} ${s.border} shadow-sm`}>
            {s.label}
        </span>
    );
}

function ImageCarousel({ images, name }) {
    const [currentIndex, setCurrentIndex] = useState(0);

    if (!images || images.length === 0) {
        return (
            <div className="w-full h-full bg-slate-50 flex flex-col items-center justify-center text-slate-300">
                <Camera className="w-10 h-10 mb-2 stroke-1" />
                <span className="text-xs font-medium">Belum ada foto</span>
            </div>
        );
    }

    const nextImage = (e) => {
        e.stopPropagation();
        setCurrentIndex((prev) => (prev + 1) % images.length);
    };

    const prevImage = (e) => {
        e.stopPropagation();
        setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
    };

    return (
        <div className="relative w-full h-full group flex items-center justify-center p-4">
            <img
                src={`${STORAGE_URL}/${images[currentIndex].image_path}`}
                alt={`${name} - ${currentIndex + 1}`}
                className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-105 mix-blend-multiply"
            />
            {images.length > 1 && (
                <>
                    <button
                        onClick={prevImage}
                        className="absolute left-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-white/80 hover:bg-white shadow-sm flex items-center justify-center text-slate-600 opacity-0 group-hover:opacity-100 transition"
                    >
                        <ChevronLeft className="w-4 h-4 -ml-0.5" />
                    </button>
                    <button
                        onClick={nextImage}
                        className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-white/80 hover:bg-white shadow-sm flex items-center justify-center text-slate-600 opacity-0 group-hover:opacity-100 transition"
                    >
                        <ChevronRight className="w-4 h-4 -mr-0.5" />
                    </button>
                    <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
                        {images.map((_, idx) => (
                            <div
                                key={idx}
                                className={`w-1.5 h-1.5 rounded-full transition-colors ${idx === currentIndex ? 'bg-[#1DD28B]' : 'bg-slate-300'
                                    }`}
                            />
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}

export default function AdminEquipmentCard({ item, onEdit, onToggleStatus, onDelete }) {
    const isMaintenance = item.status === 'Maintenance';
    const images = item.images || [];

    const categoryName = item.category?.name || 'Uncategorized';
    const CategoryIcon = ICONS_MAP[item.category?.icon] || Package;

    const stockPercentage = item.total_stock > 0
        ? Math.round((item.available_stock / item.total_stock) * 100)
        : 0;

    const getStockColor = () => {
        if (stockPercentage > 50) return 'bg-emerald-400';
        if (stockPercentage > 20) return 'bg-orange-400';
        return 'bg-red-500';
    };

    return (
        <div className="bg-white rounded-xl shadow-[0_2px_12px_rgba(0,0,0,0.04)] border border-slate-100 overflow-hidden flex flex-col hover:shadow-lg transition duration-300 group">
            {/* Image Section */}
            <div className="h-48 bg-[#F8FAFC] relative border-b border-slate-100/50">
                <div className="absolute top-3 left-3 z-20 flex flex-col gap-2">
                    <StatusBadge status={item.status} />
                </div>
                <div className="absolute top-3 right-3 z-20 bg-white/90 backdrop-blur-sm px-2.5 py-1.5 rounded-lg shadow-sm border border-slate-100 flex items-center gap-1.5">
                    <CategoryIcon className="w-3.5 h-3.5 text-[#1DD28B]" />
                    <span className="text-xs font-bold text-slate-700">{categoryName}</span>
                </div>

                {/* Maintenance Overlay */}
                {isMaintenance && (
                    <div className="absolute inset-0 bg-[#B23C10]/50 z-10 flex items-center justify-center">

                    </div>
                )}

                <ImageCarousel images={images} name={item.name} />
            </div>

            {/* Content Section */}
            <div className="p-5 flex-1 flex flex-col">
                <div className="mb-3">
                    <h3 className="font-bold text-slate-800 text-base leading-snug line-clamp-2 mb-1 group-hover:text-[#1DD28B] transition-colors">
                        {item.name}
                    </h3>
                    <p className="text-xs text-slate-500 line-clamp-1">{item.description}</p>
                </div>

                <div className="flex flex-col gap-2 mb-4 p-3 bg-slate-50 rounded-lg border border-slate-100/60">
                    <div className="flex justify-between items-center text-sm">
                        <span className="text-slate-500 font-medium">Harga/hari</span>
                        <span className="font-bold text-green-600">Rp {Number(item.price_per_day || 0).toLocaleString('id-ID')}</span>
                    </div>
                    {Number(item.deposit_amount) > 0 && (
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-slate-500 font-medium">Deposit</span>
                            <span className="font-bold text-[#072F1F]">Rp {Number(item.deposit_amount).toLocaleString('id-ID')}</span>
                        </div>
                    )}
                    {Number(item.penalty_hourly_rate) > 0 && (
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-slate-500 font-medium">Denda/jam</span>
                            <span className="font-bold text-red-500">Rp {Number(item.penalty_hourly_rate).toLocaleString('id-ID')}</span>
                        </div>
                    )}
                    <div className="flex justify-between items-center text-sm border-t border-slate-200/60 pt-2 mt-1">
                        <span className="text-slate-500 font-medium">Total Disewa</span>
                        <span className="font-bold text-emerald-600">{item.rent_count || 0} kali</span>
                    </div>
                </div>

                {/* Stock Progress */}
                <div className="mb-6">
                    <div className="flex justify-between items-end mb-1.5">
                        <span className="text-[11px] font-semibold text-slate-500">Ketersediaan Stok</span>
                        <span className="text-xs font-bold text-slate-700">
                            {item.available_stock} <span className="text-slate-400 font-medium">/ {item.total_stock}</span>
                        </span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                        <div
                            className={`h-full rounded-full transition-all duration-500 ${getStockColor()}`}
                            style={{ width: `${stockPercentage}%` }}
                        />
                    </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 mt-auto pt-2 border-t border-slate-100">
                    <button
                        onClick={() => onEdit(item)}
                        className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 bg-white border border-slate-200 text-slate-700 text-sm font-semibold rounded-lg hover:bg-slate-50 hover:border-slate-300 transition shadow-sm"
                    >
                        <Pencil className="w-4 h-4" /> Edit
                    </button>
                    <button
                        onClick={() => onToggleStatus(item)}
                        title={isMaintenance ? 'Selesai Maintenance' : 'Set Maintenance'}
                        className={`p-2.5 border rounded-lg transition flex items-center justify-center shadow-sm ${isMaintenance
                            ? 'bg-orange-50 border-orange-200 text-orange-600 hover:bg-orange-100'
                            : 'bg-white border-slate-200 text-slate-400 hover:text-orange-500 hover:bg-orange-50 hover:border-orange-200'
                            }`}
                    >
                        <Wrench className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => onDelete(item.id)}
                        title="Hapus Alat"
                        className="p-2.5 bg-white border border-slate-200 text-slate-400 rounded-lg hover:text-red-600 hover:bg-red-50 hover:border-red-200 transition flex items-center justify-center shadow-sm"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </div>
    );
}
