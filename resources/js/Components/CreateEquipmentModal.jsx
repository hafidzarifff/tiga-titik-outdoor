// resources/js/Components/CreateEquipmentModal.jsx

import React, { useState, useEffect, useRef } from 'react';
import { X, Upload, Trash2, ArrowUp, ArrowDown } from 'lucide-react';
import api from '@/services/api';

const STORAGE_URL = '/storage';
const MAX_IMAGES = 5;

const INITIAL_FORM = {
    name: '',
    category_id: '',
    price_per_day: '',
    total_stock: 1,
    available_stock: 1,
    status: 'Baik',
    deposit_amount: 0,
    penalty_hourly_rate: 0,
};

/**
 * CreateEquipmentModal — modal form for creating or editing equipment.
 * Supports multi-image upload with preview grid and individual management.
 *
 * Props:
 *  - isOpen:       boolean — controls modal visibility
 *  - onClose:      () => void — callback to close the modal
 *  - onSuccess:    (equipment) => void — callback after successful save
 *  - categories:   array — list of categories for the dropdown
 *  - editingItem:  object|null — if set, the modal enters edit mode
 */
export default function CreateEquipmentModal({ isOpen, onClose, onSuccess, categories = [], editingItem = null }) {
    const [formData, setFormData] = useState(INITIAL_FORM);
    const [newFiles, setNewFiles] = useState([]);           // { file, preview }[]
    const [existingImages, setExistingImages] = useState([]); // EquipmentImage objects from API
    const [deleteImageIds, setDeleteImageIds] = useState([]); // IDs to delete on save
    const [errors, setErrors] = useState({});
    const [processing, setProcessing] = useState(false);
    const fileInputRef = useRef(null);

    const isEditing = !!editingItem;

    // Total images = existing (not marked for deletion) + new files
    const activeExistingCount = existingImages.filter((img) => !deleteImageIds.includes(img.id)).length;
    const totalImageCount = activeExistingCount + newFiles.length;
    const canAddMore = totalImageCount < MAX_IMAGES;

    /**
     * Populate form when switching between create/edit modes.
     */
    useEffect(() => {
        if (isOpen) {
            if (editingItem) {
                setFormData({
                    name: editingItem.name || '',
                    category_id: editingItem.category_id || '',
                    price_per_day: editingItem.price_per_day || '',
                    total_stock: editingItem.total_stock || 0,
                    available_stock: editingItem.available_stock || 0,
                    status: editingItem.status || 'Baik',
                    deposit_amount: editingItem.deposit_amount || 0,
                    penalty_hourly_rate: editingItem.penalty_hourly_rate || 0,
                });
                setExistingImages(editingItem.images || []);
                setDeleteImageIds([]);
            } else {
                setFormData({
                    ...INITIAL_FORM,
                    category_id: categories.length > 0 ? categories[0].id : '',
                });
                setExistingImages([]);
                setDeleteImageIds([]);
            }
            setNewFiles([]);
            setErrors({});
        }
    }, [isOpen, editingItem, categories]);

    /**
     * Handle text/select/number input changes.
     */
    const handleChange = (field, value) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors((prev) => {
                const next = { ...prev };
                delete next[field];
                return next;
            });
        }
    };

    /**
     * Handle multi-file selection.
     */
    const handleFilesChange = (e) => {
        const files = Array.from(e.target.files);
        if (!files.length) return;

        // Clear image-related errors
        if (errors.images || errors['images.0']) {
            setErrors((prev) => {
                const next = { ...prev };
                Object.keys(next).forEach((k) => {
                    if (k.startsWith('images')) delete next[k];
                });
                return next;
            });
        }

        const slotsAvailable = MAX_IMAGES - totalImageCount;
        const filesToAdd = files.slice(0, slotsAvailable);

        const newPreviews = filesToAdd.map((file) => ({
            file,
            preview: URL.createObjectURL(file),
        }));

        setNewFiles((prev) => [...prev, ...newPreviews]);

        // Reset file input so the same file can be re-selected
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    /**
     * Remove a newly-added file (not yet uploaded).
     */
    const removeNewFile = (index) => {
        setNewFiles((prev) => {
            const updated = [...prev];
            URL.revokeObjectURL(updated[index].preview);
            updated.splice(index, 1);
            return updated;
        });
    };

    /**
     * Mark an existing image for deletion (or unmark if already marked).
     */
    const toggleDeleteExisting = (imageId) => {
        setDeleteImageIds((prev) =>
            prev.includes(imageId)
                ? prev.filter((id) => id !== imageId)
                : [...prev, imageId]
        );
    };

    /**
     * Submit handler — builds FormData and sends to the API.
     */
    const handleSubmit = async (e) => {
        e.preventDefault();
        setProcessing(true);
        setErrors({});

        try {
            const payload = new FormData();
            payload.append('name', formData.name);
            payload.append('category_id', formData.category_id);
            payload.append('price_per_day', formData.price_per_day);
            payload.append('total_stock', formData.total_stock);
            payload.append('available_stock', formData.available_stock);
            payload.append('status', formData.status);
            payload.append('deposit_amount', formData.deposit_amount);
            payload.append('penalty_hourly_rate', formData.penalty_hourly_rate);

            // Append new image files
            newFiles.forEach(({ file }) => {
                payload.append('images[]', file);
            });

            let response;

            if (isEditing) {
                // Append image IDs to delete
                deleteImageIds.forEach((id) => {
                    payload.append('delete_images[]', id);
                });

                payload.append('_method', 'PUT');
                response = await api.post(`/equipments/${editingItem.id}`, payload, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                });
            } else {
                response = await api.post('/equipments', payload, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                });
            }

            if (response.data.success) {
                onSuccess(response.data.data);
                handleClose();
            }
        } catch (error) {
            if (error.response?.status === 422) {
                const serverErrors = error.response.data.errors || {};
                setErrors(serverErrors);
            } else {
                setErrors({
                    _general: error.response?.data?.message || 'Terjadi kesalahan. Silakan coba lagi.',
                });
            }
        } finally {
            setProcessing(false);
        }
    };

    /**
     * Close and reset.
     */
    const handleClose = () => {
        // Revoke all object URLs to prevent memory leaks
        newFiles.forEach(({ preview }) => URL.revokeObjectURL(preview));
        onClose();
        setTimeout(() => {
            setFormData(INITIAL_FORM);
            setNewFiles([]);
            setExistingImages([]);
            setDeleteImageIds([]);
            setErrors({});
        }, 300);
    };

    if (!isOpen) return null;

    // Build the unified image list for the preview grid
    const activeExistingImages = existingImages.filter((img) => !deleteImageIds.includes(img.id));
    const markedForDeletion = existingImages.filter((img) => deleteImageIds.includes(img.id));

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={handleClose} />

            {/* Modal Dialog */}
            <form
                onSubmit={handleSubmit}
                className="bg-white rounded-2xl shadow-xl w-full max-w-3xl relative z-10 p-6 overflow-hidden transform transition-all max-h-[90vh] overflow-y-auto"
            >
                {/* Header */}
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-slate-900">
                        {isEditing ? 'Edit Alat Kemah' : 'Tambah Alat Kemah'}
                    </h2>
                    <button type="button" onClick={handleClose} className="text-gray-400 hover:text-gray-600 transition">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* General Error */}
                {errors._general && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                        {errors._general}
                    </div>
                )}

                {/* Grid Layout Container */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                    {/* Kolom Kiri: Detil Informasi Alat */}
                    <div className="space-y-4">
                        {/* Name */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Nama Alat</label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => handleChange('name', e.target.value)}
                                placeholder="Contoh: Tenda Dome 2P"
                                className={`w-full border rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition ${errors.name ? 'border-red-300' : 'border-gray-300'}`}
                            />
                            {errors.name && <p className="text-red-500 text-xs mt-1">{Array.isArray(errors.name) ? errors.name[0] : errors.name}</p>}
                        </div>

                        {/* Category */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Kategori</label>
                            <select
                                value={formData.category_id}
                                onChange={(e) => handleChange('category_id', parseInt(e.target.value))}
                                className={`w-full border rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition bg-white ${errors.category_id ? 'border-red-300' : 'border-gray-300'}`}
                            >
                                <option value="" disabled>Pilih Kategori</option>
                                {categories.map((cat) => (
                                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                                ))}
                            </select>
                            {errors.category_id && <p className="text-red-500 text-xs mt-1">{Array.isArray(errors.category_id) ? errors.category_id[0] : errors.category_id}</p>}
                        </div>

                        {/* Stock Fields */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">Total Stok</label>
                                <input
                                    type="number"
                                    value={formData.total_stock}
                                    onChange={(e) => handleChange('total_stock', parseInt(e.target.value) || 0)}
                                    min="0"
                                    className={`w-full border rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition ${errors.total_stock ? 'border-red-300' : 'border-gray-300'}`}
                                />
                                {errors.total_stock && <p className="text-red-500 text-xs mt-1">{Array.isArray(errors.total_stock) ? errors.total_stock[0] : errors.total_stock}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">Tersedia</label>
                                <input
                                    type="number"
                                    value={formData.available_stock}
                                    onChange={(e) => handleChange('available_stock', parseInt(e.target.value) || 0)}
                                    min="0"
                                    max={formData.total_stock}
                                    className={`w-full border rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition ${errors.available_stock ? 'border-red-300' : 'border-gray-300'}`}
                                />
                                {errors.available_stock && <p className="text-red-500 text-xs mt-1">{Array.isArray(errors.available_stock) ? errors.available_stock[0] : errors.available_stock}</p>}
                            </div>
                        </div>

                        {/* Price */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Harga per Hari (Rp)</label>
                            <input
                                type="number"
                                value={formData.price_per_day}
                                onChange={(e) => handleChange('price_per_day', parseInt(e.target.value) || 0)}
                                min="0"
                                step="1000"
                                className={`w-full border rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition ${errors.price_per_day ? 'border-red-300' : 'border-gray-300'}`}
                            />
                            {errors.price_per_day && <p className="text-red-500 text-xs mt-1">{Array.isArray(errors.price_per_day) ? errors.price_per_day[0] : errors.price_per_day}</p>}
                        </div>

                        {/* Status (only show in edit mode) */}
                        {isEditing && (
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">Status</label>
                                <select
                                    value={formData.status}
                                    onChange={(e) => handleChange('status', e.target.value)}
                                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition bg-white"
                                >
                                    <option value="Baik">Baik (Aktif)</option>
                                    <option value="Maintenance">Maintenance</option>
                                    <option value="Rusak">Rusak</option>
                                </select>
                            </div>
                        )}
                    </div>

                    {/* Kolom Kanan: Media Gambar & Aturan Jaminan/Denda */}
                    <div className="space-y-4">
                        {/* ─── Multi-Image Upload ─────────────────────────── */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                Gambar Alat
                                <span className="text-slate-400 font-normal ml-1">({totalImageCount}/{MAX_IMAGES})</span>
                            </label>

                            {/* Preview Grid */}
                            {(activeExistingImages.length > 0 || newFiles.length > 0) && (
                                <div className="grid grid-cols-3 gap-2 mb-3">
                                    {/* Existing images (not deleted) */}
                                    {activeExistingImages.map((img, index) => (
                                        <div key={`existing-${img.id}`} className="relative group rounded-lg overflow-hidden border border-gray-200 aspect-square">
                                            <img
                                                src={`${STORAGE_URL}/${img.image_path}`}
                                                alt={`Gambar ${index + 1}`}
                                                className="w-full h-full object-cover"
                                            />
                                            {/* Primary badge */}
                                            {index === 0 && (
                                                <span className="absolute top-1 left-1 bg-emerald-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
                                                    Utama
                                                </span>
                                            )}
                                            {/* Delete button */}
                                            <button
                                                type="button"
                                                onClick={() => toggleDeleteExisting(img.id)}
                                                className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 hover:bg-red-600 transition shadow-sm"
                                            >
                                                <X className="w-3 h-3" />
                                            </button>
                                        </div>
                                    ))}

                                    {/* New files (not yet uploaded) */}
                                    {newFiles.map((item, index) => (
                                        <div key={`new-${index}`} className="relative group rounded-lg overflow-hidden border border-green-200 border-dashed aspect-square">
                                            <img
                                                src={item.preview}
                                                alt={`Baru ${index + 1}`}
                                                className="w-full h-full object-cover"
                                            />
                                            {/* "New" badge */}
                                            <span className="absolute top-1 left-1 bg-blue-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
                                                Baru
                                            </span>
                                            {/* Remove button */}
                                            <button
                                                type="button"
                                                onClick={() => removeNewFile(index)}
                                                className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 hover:bg-red-600 transition shadow-sm"
                                            >
                                                <X className="w-3 h-3" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Images marked for deletion (greyed out) */}
                            {markedForDeletion.length > 0 && (
                                <div className="mb-3">
                                    <p className="text-xs text-red-500 font-medium mb-1.5">Akan dihapus saat disimpan:</p>
                                    <div className="grid grid-cols-5 gap-1.5">
                                        {markedForDeletion.map((img) => (
                                            <div key={`del-${img.id}`} className="relative rounded overflow-hidden aspect-square opacity-50">
                                                <img
                                                    src={`${STORAGE_URL}/${img.image_path}`}
                                                    alt="Marked for deletion"
                                                    className="w-full h-full object-cover grayscale"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => toggleDeleteExisting(img.id)}
                                                    title="Batalkan hapus"
                                                    className="absolute inset-0 flex items-center justify-center bg-red-500/30 hover:bg-red-500/50 transition"
                                                >
                                                    <span className="text-white text-[10px] font-bold">Undo</span>
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Upload button */}
                            {canAddMore ? (
                                <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition">
                                    <div className="flex flex-col items-center justify-center py-2">
                                        <Upload className="w-5 h-5 text-gray-400 mb-1" />
                                        <p className="text-xs text-gray-500">
                                            <span className="font-semibold text-green-600">Klik untuk upload</span>
                                        </p>
                                        <p className="text-xs text-gray-400 mt-0.5">JPG, JPEG, PNG (Maks. 2MB per file)</p>
                                    </div>
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept="image/jpeg,image/jpg,image/png"
                                        onChange={handleFilesChange}
                                        multiple
                                        className="hidden"
                                    />
                                </label>
                            ) : (
                                <p className="text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 text-center">
                                    Batas maksimum {MAX_IMAGES} gambar tercapai.
                                </p>
                            )}

                            {/* Image errors */}
                            {(errors.images || errors['images.0'] || errors['images.1'] || errors['images.2'] || errors['images.3'] || errors['images.4']) && (
                                <p className="text-red-500 text-xs mt-1">
                                    {Array.isArray(errors.images) ? errors.images[0] : errors.images ||
                                        Array.isArray(errors['images.0']) ? errors['images.0']?.[0] : errors['images.0'] || 'Terjadi kesalahan pada gambar.'}
                                </p>
                            )}
                        </div>

                        {/* Deposit Amount */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Nominal Uang Jaminan (Deposit)</label>
                            <input
                                type="number"
                                value={formData.deposit_amount}
                                onChange={(e) => handleChange('deposit_amount', parseInt(e.target.value) || 0)}
                                min="0"
                                placeholder="Contoh: 500000 (Isi 0 jika tidak memerlukan deposit)"
                                className={`w-full border rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition ${errors.deposit_amount ? 'border-red-300' : 'border-gray-300'}`}
                            />
                            {errors.deposit_amount && <p className="text-red-500 text-xs mt-1">{Array.isArray(errors.deposit_amount) ? errors.deposit_amount[0] : errors.deposit_amount}</p>}
                        </div>

                        {/* Penalty Hourly Rate */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Tarif Denda Keterlambatan (Per Jam)</label>
                            <input
                                type="number"
                                value={formData.penalty_hourly_rate}
                                onChange={(e) => handleChange('penalty_hourly_rate', parseInt(e.target.value) || 0)}
                                min="0"
                                placeholder="Contoh: 5000"
                                className={`w-full border rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition ${errors.penalty_hourly_rate ? 'border-red-300' : 'border-gray-300'}`}
                            />
                            {errors.penalty_hourly_rate && <p className="text-red-500 text-xs mt-1">{Array.isArray(errors.penalty_hourly_rate) ? errors.penalty_hourly_rate[0] : errors.penalty_hourly_rate}</p>}
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="mt-8 flex justify-end gap-3 pt-4 border-t border-slate-100">
                    <button
                        type="button"
                        onClick={handleClose}
                        className="px-5 py-2.5 text-sm font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition"
                    >
                        Batal
                    </button>
                    <button
                        type="submit"
                        disabled={processing}
                        className="px-5 py-2.5 text-sm font-semibold text-white bg-emerald-500 rounded-lg hover:bg-emerald-600 shadow-sm shadow-green-500/20 transition disabled:opacity-50"
                    >
                        {processing ? 'Menyimpan...' : (isEditing ? 'Simpan Perubahan' : 'Tambah Alat')}
                    </button>
                </div>
            </form>
        </div>
    );
}
