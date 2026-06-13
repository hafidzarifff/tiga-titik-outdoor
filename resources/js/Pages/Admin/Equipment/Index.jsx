// resources/js/Pages/Admin/Equipment/Index.jsx

import React, { useState, useEffect, useCallback } from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Head, usePage } from '@inertiajs/react';
import { Plus, Package, Check, X, Loader2, Search } from 'lucide-react';
import AdminEquipmentCard from '@/Components/AdminEquipmentCard';
import CreateEquipmentModal from '@/Components/CreateEquipmentModal';
import api from '@/services/api';

export default function Index({ categories = [] }) {
    // ── State ──────────────────────────────────────────────────
    const [equipments, setEquipments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterCategory, setFilterCategory] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [flash, setFlash] = useState(null);

    // ── Data Fetching ──────────────────────────────────────────
    const fetchEquipments = useCallback(async () => {
        try {
            setLoading(true);
            const response = await api.get('/equipments', {
                params: { per_page: 100 },
            });
            if (response.data.success) {
                setEquipments(response.data.data.data || []);
            }
        } catch (error) {
            console.error('Failed to fetch equipments:', error);
            showFlash('Gagal memuat data peralatan.', 'error');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchEquipments();
    }, [fetchEquipments]);

    // ── Flash Messages ─────────────────────────────────────────
    const showFlash = (message, type = 'success') => {
        setFlash({ message, type });
        setTimeout(() => setFlash(null), 4000);
    };

    // ── Modal Handlers ─────────────────────────────────────────
    const openCreateModal = () => {
        setEditingItem(null);
        setIsModalOpen(true);
    };

    const openEditModal = (item) => {
        setEditingItem(item);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setTimeout(() => setEditingItem(null), 300);
    };

    /**
     * Called after a successful create or update from the modal.
     * Updates the local list without a full page refresh.
     */
    const handleSuccess = (savedEquipment) => {
        if (editingItem) {
            // Update existing item in the list
            setEquipments((prev) =>
                prev.map((eq) => (eq.id === savedEquipment.id ? savedEquipment : eq))
            );
            showFlash('Alat berhasil diperbarui.');
        } else {
            // Prepend new item to the list
            setEquipments((prev) => [savedEquipment, ...prev]);
            showFlash('Alat berhasil ditambahkan.');
        }
    };

    // ── Toggle Maintenance ─────────────────────────────────────
    const handleToggleStatus = async (item) => {
        const newStatus = item.status === 'Maintenance' ? 'Baik' : 'Maintenance';

        try {
            const payload = new FormData();
            payload.append('_method', 'PUT');
            payload.append('status', newStatus);

            const response = await api.post(`/equipments/${item.id}`, payload, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });

            if (response.data.success) {
                setEquipments((prev) =>
                    prev.map((eq) => (eq.id === item.id ? response.data.data : eq))
                );
                showFlash(
                    newStatus === 'Maintenance'
                        ? 'Alat dipindahkan ke maintenance.'
                        : 'Alat dikembalikan ke status aktif.'
                );
            }
        } catch (error) {
            console.error('Failed to toggle status:', error);
            showFlash('Gagal mengubah status alat.', 'error');
        }
    };

    // ── Delete ──────────────────────────────────────────────────
    const handleDelete = async (id) => {
        if (!confirm('Apakah Anda yakin ingin menghapus alat ini?')) return;

        try {
            const response = await api.delete(`/equipments/${id}`);

            if (response.data.success) {
                setEquipments((prev) => prev.filter((eq) => eq.id !== id));
                showFlash('Alat berhasil dihapus.');
            }
        } catch (error) {
            console.error('Failed to delete equipment:', error);
            showFlash('Gagal menghapus alat.', 'error');
        }
    };

    // ── Filtering ───────────────────────────────────────────────
    const filteredItems = equipments.filter((item) => {
        const matchesCategory = filterCategory === 'all' || item.category_id === parseInt(filterCategory);
        const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    // ── Render ──────────────────────────────────────────────────
    return (
        <AdminLayout title="Katalog Alat">
            <Head title="Katalog Alat" />

            {/* Flash Messages */}
            {flash && (
                <div className="fixed top-6 right-6 z-[70] transition-all duration-300 animate-in slide-in-from-top-2">
                    <div className={`px-4 py-3 rounded-xl shadow-xl border flex items-center gap-3 min-w-[280px] max-w-sm ${flash.type === 'success' ? 'bg-white border-green-100' : 'bg-white border-red-100'
                        }`}>
                        {flash.type === 'success' ? (
                            <div className="bg-emerald-100 p-1.5 rounded-full text-green-600 shrink-0">
                                <Check className="w-4 h-4" strokeWidth={3} />
                            </div>
                        ) : (
                            <div className="bg-red-100 p-1.5 rounded-full text-red-600 shrink-0">
                                <X className="w-4 h-4" strokeWidth={3} />
                            </div>
                        )}
                        <span className="font-medium text-sm text-slate-700 flex-1 leading-snug">{flash.message}</span>
                        <button onClick={() => setFlash(null)} className="text-slate-400 hover:text-slate-600 shrink-0">
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            )}

            {/* Header */}
            <div className="mb-8">
                <p className="text-sm text-slate-500 mb-4">Kelola inventaris peralatan rental kemah</p>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="relative w-full sm:w-auto">
                        <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Cari alat..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full sm:w-64 pl-10 pr-4 py-2.5 pl-10 pr-4 py-2.5 w-full lg:w-72 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all text-slate-600"
                        />
                    </div>
                    <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
                        <select
                            value={filterCategory}
                            onChange={(e) => setFilterCategory(e.target.value)}
                            className="w-full sm:w-44 px-3 py-2.5 bg-white border border-green-500 rounded-lg text-sm focus:bg-white focus:border-green-500 focus:ring-1 focus:ring-green-500 outline-none transition"
                        >
                            <option value="all">Semua Kategori</option>
                            {categories.map((cat) => (
                                <option key={cat.id} value={cat.id}>{cat.name}</option>
                            ))}
                        </select>
                        <button
                            onClick={openCreateModal}
                            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-medium px-4 py-2.5 border border-transparent rounded-lg transition duration-200 shadow-sm"
                        >
                            <Plus className="w-5 h-5" />
                            Tambah Alat
                        </button>
                    </div>
                </div>
            </div>

            {/* Loading State */}
            {loading ? (
                <div className="flex flex-col items-center justify-center py-20">
                    <Loader2 className="w-8 h-8 text-green-500 animate-spin mb-3" />
                    <p className="text-sm text-slate-500 font-medium">Memuat data peralatan...</p>
                </div>
            ) : filteredItems.length > 0 ? (
                /* Items Grid */
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredItems.map((item) => (
                        <AdminEquipmentCard
                            key={item.id}
                            item={item}
                            onEdit={openEditModal}
                            onToggleStatus={handleToggleStatus}
                            onDelete={handleDelete}
                        />
                    ))}
                </div>
            ) : (
                /* Empty State */
                <div className="col-span-full py-16 text-center bg-white rounded-xl border border-gray-200 border-dashed">
                    <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <h3 className="text-lg font-bold text-gray-900">
                        {filterCategory === 'all' ? 'Belum ada alat' : 'Kategori kosong'}
                    </h3>
                    <p className="text-gray-500 text-sm mt-1 mb-4">
                        {filterCategory === 'all'
                            ? 'Daftar peralatan akan muncul di sini setelah data ditambahkan.'
                            : 'Tidak ada alat di kategori ini.'}
                    </p>
                    {filterCategory === 'all' && (
                        <button
                            onClick={openCreateModal}
                            className="inline-flex items-center gap-2 text-sm font-semibold text-green-600 hover:text-green-700 transition"
                        >
                            <Plus className="w-4 h-4" />
                            Tambah Alat Pertama
                        </button>
                    )}
                </div>
            )}

            {/* Create / Edit Modal */}
            <CreateEquipmentModal
                isOpen={isModalOpen}
                onClose={closeModal}
                onSuccess={handleSuccess}
                categories={categories}
                editingItem={editingItem}
            />
        </AdminLayout>
    );
}
