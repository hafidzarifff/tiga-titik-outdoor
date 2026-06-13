// resources/js/Pages/Admin/Category/Index.jsx
import React, { useState, useEffect } from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Folder, Pencil, Plus, Tag, X, Tent, Backpack, Flame, UtensilsCrossed, Flashlight, Mountain, Footprints, Compass, Package, Map, Trash2, Check, Search } from 'lucide-react';
import { Head, useForm, usePage, router } from '@inertiajs/react';

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
    'Map': Map
};

const ICONS = Object.keys(ICONS_MAP);

const renderIcon = (iconName, className) => {
    const IconComponent = ICONS_MAP[iconName] || Package;
    return <IconComponent className={className} strokeWidth={1.5} />;
};

export default function Index({ categories }) {
    const { flash } = usePage().props;
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState(null);
    const [toast, setToast] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        if (flash.success || flash.error) {
            setToast({
                type: flash.success ? 'success' : 'error',
                message: flash.success || flash.error
            });
            const timer = setTimeout(() => {
                setToast(null);
            }, 4000);
            return () => clearTimeout(timer);
        }
    }, [flash]);

    const { data, setData, post, put, processing, errors, reset, clearErrors } = useForm({
        name: '',
        icon: 'Tent',
    });

    const openCreateModal = () => {
        setEditingCategory(null);
        reset();
        clearErrors();
        setIsModalOpen(true);
    };

    const openEditModal = (category) => {
        setEditingCategory(category);
        setData({
            name: category.name,
            icon: category.icon || 'Tent',
        });
        clearErrors();
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setTimeout(() => {
            reset();
            clearErrors();
        }, 300);
    };

    const submit = (e) => {
        e.preventDefault();
        if (editingCategory) {
            put(`/admin/categories/${editingCategory.id}`, {
                onSuccess: () => closeModal(),
            });
        } else {
            post('/admin/categories', {
                onSuccess: () => closeModal(),
            });
        }
    };

    const handleDelete = (id) => {
        if (confirm('Apakah Anda yakin ingin menghapus kategori ini?')) {
            router.delete(`/admin/categories/${id}`);
        }
    };

    // Fungsi untuk menghitung persentase ketersediaan stok
    const getPercentage = (available, total) => {
        if (!total || total === 0) return 0;
        return Math.round((available / total) * 100);
    };

    const filteredCategories = categories.filter(category =>
        category.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <AdminLayout title="Kategori Alat">
            <Head title="Kategori Alat" />

            {/* Toast Notification (Top Right) */}
            {toast && (
                <div className="fixed top-6 right-6 z-[70] transition-all duration-300">
                    <div className={`px-4 py-3 rounded-xl shadow-xl border flex items-center gap-3 min-w-[280px] max-w-sm ${toast.type === 'success'
                        ? 'bg-white border-green-100'
                        : 'bg-white border-red-100'
                        }`}>
                        {toast.type === 'success' ? (
                            <div className="bg-emerald-100 p-1.5 rounded-full text-green-600 shrink-0">
                                <Check className="w-4 h-4" strokeWidth={3} />
                            </div>
                        ) : (
                            <div className="bg-red-100 p-1.5 rounded-full text-red-600 shrink-0">
                                <X className="w-4 h-4" strokeWidth={3} />
                            </div>
                        )}
                        <span className="font-medium text-sm text-slate-700 flex-1 leading-snug">{toast.message}</span>
                        <button onClick={() => setToast(null)} className="text-slate-400 hover:text-slate-600 transition-colors p-1">
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            )}

            {/* Header Bagian Atas */}
            <div className="mb-8">
                <p className="text-sm text-slate-500 mb-4">Kelola kategori dan lihat ketersediaan stok</p>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="relative w-full sm:w-auto">
                        <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Cari kategori alat..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full sm:w-64 pl-10 pr-4 py-2.5 pl-10 pr-4 py-2.5 w-full lg:w-72 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all text-slate-600"
                        />
                    </div>
                    <button
                        onClick={openCreateModal}
                        className="w-full sm:w-auto flex justify-center items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-medium px-4 py-2.5 border border-transparent rounded-lg transition duration-200 shadow-sm"
                    >
                        <Plus className="w-5 h-5" />
                        Tambah Kategori
                    </button>
                </div>
            </div>

            {/* Grid Layout Kategori */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredCategories && filteredCategories.length > 0 ? (
                    filteredCategories.map((category) => {
                        const totalStock = category.equipments_sum_total_stock || 0;
                        const availableStock = category.equipments_sum_available_stock || 0;
                        const percentage = getPercentage(availableStock, totalStock);

                        // Logika Warna Progress Bar
                        const progressBarColor = percentage < 50 ? 'bg-red-500' : 'bg-emerald-500';

                        return (
                            <div key={category.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition duration-200">
                                {/* Bagian Atas Card */}
                                <div className="flex justify-between items-start">
                                    <div className="flex items-center gap-4">
                                        {/* Kotak Ikon */}
                                        <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-green-100 flex items-center justify-center text-green-600 shrink-0 shadow-sm overflow-hidden relative">
                                            {renderIcon(category.icon, "w-6 h-6")}
                                        </div>

                                        {/* Kolom Teks Nama & Total Unit */}
                                        <div>
                                            <h3 className="font-bold text-slate-900 text-lg leading-tight">{category.name}</h3>
                                            <p className="text-xs text-slate-500 mt-1">{totalStock} unit total</p>
                                        </div>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex items-center gap-1">
                                        <button
                                            className="text-gray-400 hover:text-green-500 transition p-1.5 rounded-lg hover:bg-emerald-50"
                                            onClick={() => openEditModal(category)}
                                            title="Edit Kategori"
                                        >
                                            <Pencil className="w-4 h-4" />
                                        </button>
                                        <button
                                            className="text-gray-400 hover:text-red-500 transition p-1.5 rounded-lg hover:bg-red-50"
                                            onClick={() => handleDelete(category.id)}
                                            title="Hapus Kategori"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>

                                {/* Bagian Tengah Card (Statistik Ketersediaan) */}
                                <div className="mt-6 flex justify-between items-end text-sm">
                                    <span className="text-slate-600 font-medium text-xs">
                                        Tersedia: {availableStock}/{totalStock}
                                    </span>
                                    <span className="text-slate-800 font-bold text-sm">
                                        {percentage}%
                                    </span>
                                </div>

                                {/* Progress Bar Container */}
                                <div className="w-full bg-gray-100 h-2 rounded-full mt-2 overflow-hidden">
                                    <div
                                        className={`h-full rounded-full ${progressBarColor} transition-all duration-700 ease-out`}
                                        style={{ width: `${percentage}%` }}
                                    ></div>
                                </div>
                            </div>
                        );
                    })
                ) : (
                    /* Tampilan State Kosong (Opsional namun disarankan) */
                    <div className="col-span-full py-16 text-center bg-white rounded-xl border border-gray-200 border-dashed">
                        <Folder className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                        <h3 className="text-lg font-bold text-gray-900">Belum Ada Kategori</h3>
                        <p className="text-gray-500 text-sm mt-1">Mulai kelola inventaris Anda dengan menambahkan kategori baru.</p>
                    </div>
                )}
            </div>

            {/* Modal Tambah Kategori */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <div
                        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
                        onClick={closeModal}
                    ></div>

                    {/* Modal Dialog */}
                    <form
                        onSubmit={submit}
                        className="bg-white rounded-2xl shadow-xl w-full max-w-md relative z-10 p-6 overflow-hidden transform transition-all"
                    >
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold text-slate-900">
                                {editingCategory ? 'Edit Kategori' : 'Tambah Kategori'}
                            </h2>
                            <button
                                type="button"
                                onClick={closeModal}
                                className="text-gray-400 hover:text-gray-600 transition"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="space-y-5">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">Nama Kategori</label>
                                <input
                                    type="text"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    placeholder="Masukkan nama kategori"
                                    className={`w-full border rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition ${errors.name ? 'border-red-300 focus:ring-red-500' : 'border-gray-300'}`}
                                />
                                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">Icon</label>
                                <div className="grid grid-cols-5 gap-3.5">
                                    {ICONS.map((iconName) => (
                                        <button
                                            key={iconName}
                                            type="button"
                                            onClick={() => setData('icon', iconName)}
                                            className={`w-full aspect-square rounded-lg flex items-center justify-center transition-all ${data.icon === iconName
                                                ? 'bg-emerald-100 border-2 border-green-500 scale-110 z-10 text-green-700'
                                                : 'bg-gray-100 border border-gray-200 hover:bg-gray-200 text-slate-500'
                                                }`}
                                        >
                                            {renderIcon(iconName, "w-6 h-6")}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <div className="mt-8 flex justify-end gap-3">
                            <button
                                type="button"
                                onClick={closeModal}
                                className="px-5 py-2.5 text-sm font-semibold text-slate-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                            >
                                Batal
                            </button>
                            <button
                                type="submit"
                                disabled={processing}
                                className="px-5 py-2.5 text-sm font-semibold text-white bg-emerald-500 rounded-lg hover:bg-emerald-600 shadow-sm shadow-green-500/20 transition disabled:opacity-50"
                            >
                                {processing ? 'Menyimpan...' : (editingCategory ? 'Simpan Perubahan' : 'Tambah Kategori')}
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </AdminLayout>
    );
}
