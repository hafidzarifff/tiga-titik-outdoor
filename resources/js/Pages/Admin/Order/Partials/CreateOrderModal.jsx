import React, { useState, useEffect, useRef } from 'react';
import { X, Plus, Trash2, AlertCircle, CalendarClock, CreditCard, Box, Search, ChevronDown, Users, Info } from 'lucide-react';
import axios from 'axios';

export default function CreateOrderModal({ isOpen, onClose, onSuccess }) {
    const [equipments, setEquipments] = useState([]);
    const [isLoadingEquipments, setIsLoadingEquipments] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [formData, setFormData] = useState({
        guest_name: '',
        guest_phone: '',
        expected_pickup_datetime: '',
        expected_return_datetime: '',
        retained_id_type: 'ktp',
        items: []
    });

    useEffect(() => {
        if (isOpen) {
            fetchEquipments();
            // Reset form when modal opens
            setFormData({
                guest_name: '',
                guest_phone: '',
                expected_pickup_datetime: '',
                expected_return_datetime: '',
                retained_id_type: 'ktp',
                items: [{ equipment_id: '', qty: 1 }]
            });
        }
    }, [isOpen]);

    const fetchEquipments = async () => {
        setIsLoadingEquipments(true);
        try {
            const response = await axios.get('/api/v1/equipments');
            let data = response.data?.data || response.data || [];

            // Handle Laravel paginated object inside the 'data' key
            if (data && data.data && Array.isArray(data.data)) {
                data = data.data;
            }

            setEquipments(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error("Gagal mengambil data alat:", error);
        } finally {
            setIsLoadingEquipments(false);
        }
    };

    const handleAddItem = () => {
        setFormData(prev => ({
            ...prev,
            items: [...prev.items, { equipment_id: '', qty: 1 }]
        }));
    };

    const handleRemoveItem = (index) => {
        setFormData(prev => ({
            ...prev,
            items: prev.items.filter((_, i) => i !== index)
        }));
    };

    const handleItemChange = (index, field, value) => {
        const newItems = [...formData.items];
        newItems[index][field] = value;
        setFormData(prev => ({ ...prev, items: newItems }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const validItems = formData.items.filter(item => item.equipment_id && item.qty > 0);
        if (validItems.length === 0) {
            alert("Mohon pilih minimal 1 barang untuk disewa!");
            return;
        }

        const formatDateTime = (dt) => {
            if (!dt) return '';
            return dt.replace('T', ' ') + (dt.length === 16 ? ':00' : '');
        };

        const payload = {
            order_source: 'offline',
            guest_name: formData.guest_name,
            guest_phone: formData.guest_phone,
            payment_type: 'full_payment', // Sebagaimana diminta, lunas untuk offline
            expected_pickup_datetime: formatDateTime(formData.expected_pickup_datetime),
            expected_return_datetime: formatDateTime(formData.expected_return_datetime),
            retained_id_type: formData.retained_id_type,
            items: validItems
        };

        setIsSubmitting(true);
        try {
            await axios.post('/api/v1/orders', payload);
            alert("Pesanan offline berhasil dibuat!");
            onClose();
            if (onSuccess) onSuccess();
        } catch (error) {
            console.error("Error creating order:", error);
            // Menangkap pesan error dari API (misalnya: penolakan jam operasional, stok habis)
            let errorMsg = "Terjadi kesalahan saat membuat pesanan.";

            if (error.response?.data?.errors) {
                // Kumpulkan semua error validasi
                const errors = error.response.data.errors;
                errorMsg = Object.values(errors).flat().join('\n');
            } else if (error.response?.data?.message) {
                errorMsg = error.response.data.message;
            }

            alert(`Gagal membuat pesanan:\n${errorMsg}`);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-0">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose}></div>

            {/* Modal Box */}
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col relative z-10 animate-in fade-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 shrink-0">
                    <div>
                        <h2 className="text-xl font-bold text-slate-900">Buat Pesanan Offline (POS)</h2>
                        <p className="text-sm text-slate-500 mt-0.5">Transaksi untuk pelanggan walk-in</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-slate-400 hover:text-slate-600 hover:bg-slate-100 p-2 rounded-full transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Form Body */}
                <form id="createOrderForm" onSubmit={handleSubmit} className="overflow-y-auto flex-1 p-6 space-y-6">

                    {/* Informasi Pelanggan */}
                    <div className="space-y-4">
                        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                            <Users className="w-4 h-4 text-emerald-500" /> Informasi Pelanggan
                        </h3>
                        <div className="bg-blue-50 border border-blue-100 rounded-lg p-3">
                            <p className="text-xs text-blue-700 font-medium flex gap-2">
                                <Info className="w-4 h-4 shrink-0" />
                                Jika nomor HP sudah terdaftar, pesanan akan otomatis masuk ke riwayat pelanggan tersebut.
                            </p>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider">No. WhatsApp / HP</label>
                                <input
                                    type="tel"
                                    required
                                    placeholder="Contoh: 08123456789"
                                    value={formData.guest_phone}
                                    onChange={(e) => setFormData({ ...formData, guest_phone: e.target.value })}
                                    className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-sm rounded-xl focus:ring-emerald-500 focus:border-emerald-500 block p-2.5 transition-colors"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Nama Pelanggan</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="Nama Lengkap"
                                    value={formData.guest_name}
                                    onChange={(e) => setFormData({ ...formData, guest_name: e.target.value })}
                                    className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-sm rounded-xl focus:ring-emerald-500 focus:border-emerald-500 block p-2.5 transition-colors"
                                />
                            </div>
                        </div>
                    </div>

                    <hr className="border-slate-100" />

                    {/* Waktu Sewa */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                                <CalendarClock className="w-4 h-4 text-emerald-500" /> Waktu Penyewaan
                            </h3>
                            <div className="flex items-center gap-1.5 text-xs font-medium text-amber-700 bg-amber-50 px-2.5 py-1 rounded-md border border-amber-200/50">
                                <AlertCircle className="w-3.5 h-3.5" />
                                Jam Operasional: 09:00 - 21:00
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Waktu Pengambilan</label>
                                <input
                                    type="datetime-local"
                                    required
                                    value={formData.expected_pickup_datetime}
                                    onChange={(e) => setFormData({ ...formData, expected_pickup_datetime: e.target.value })}
                                    className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-sm rounded-xl focus:ring-emerald-500 focus:border-emerald-500 block p-2.5 transition-colors"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Waktu Pengembalian</label>
                                <input
                                    type="datetime-local"
                                    required
                                    value={formData.expected_return_datetime}
                                    onChange={(e) => setFormData({ ...formData, expected_return_datetime: e.target.value })}
                                    className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-sm rounded-xl focus:ring-emerald-500 focus:border-emerald-500 block p-2.5 transition-colors"
                                />
                            </div>
                        </div>
                    </div>

                    <hr className="border-slate-100" />

                    {/* Jaminan Identitas */}
                    <div className="space-y-4">
                        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                            <CreditCard className="w-4 h-4 text-emerald-500" /> Jaminan Fisik
                        </h3>
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Jenis Identitas Ditahan</label>
                            <select
                                value={formData.retained_id_type}
                                onChange={(e) => setFormData({ ...formData, retained_id_type: e.target.value })}
                                className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-sm rounded-xl focus:ring-emerald-500 focus:border-emerald-500 block p-2.5 transition-colors"
                            >
                                <option value="ktp">KTP</option>
                                <option value="sim">SIM</option>
                                <option value="paspor">Paspor</option>
                                <option value="none">Tanpa Jaminan (Tidak Disarankan)</option>
                            </select>
                        </div>
                    </div>

                    <hr className="border-slate-100" />

                    {/* Daftar Barang */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                                <Box className="w-4 h-4 text-emerald-500" /> Barang yang Disewa
                            </h3>
                            <button
                                type="button"
                                onClick={handleAddItem}
                                className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600 bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-lg transition-colors border border-emerald-200"
                            >
                                <Plus className="w-3.5 h-3.5" /> Tambah Barang
                            </button>
                        </div>

                        <div className="space-y-3">
                            {formData.items.map((item, index) => {
                                const selectedEq = equipments.find(eq => eq.id === item.equipment_id || eq.id == item.equipment_id);
                                return (
                                <div key={index} className="flex items-start gap-3 p-3 bg-slate-50 border border-slate-200 rounded-xl">
                                    {selectedEq && (
                                        <div className="w-16 h-16 mt-6 bg-white border border-slate-100 rounded-lg shrink-0 flex items-center justify-center overflow-hidden">
                                            {selectedEq.images?.[0]?.image_path ? (
                                                <img src={`/storage/${selectedEq.images[0].image_path}`} alt={selectedEq.name} className="w-full h-full object-contain p-1" />
                                            ) : (
                                                <div className="w-full h-full bg-slate-100 flex items-center justify-center text-[10px] text-slate-400 font-medium">No Img</div>
                                            )}
                                        </div>
                                    )}
                                    <div className="flex-1 min-w-0 space-y-1.5">
                                        <label className="text-xs text-slate-500 font-medium">Pilih Alat</label>
                                        <SearchableEquipmentSelect
                                            value={item.equipment_id}
                                            onChange={(val) => handleItemChange(index, 'equipment_id', val)}
                                            equipments={equipments}
                                            disabled={isLoadingEquipments}
                                            isLoading={isLoadingEquipments}
                                        />
                                    </div>
                                    <div className="w-24 space-y-1.5 shrink-0">
                                        <label className="text-xs text-slate-500 font-medium">Jumlah</label>
                                        <input
                                            type="number"
                                            min="1"
                                            required
                                            value={item.qty}
                                            onChange={(e) => handleItemChange(index, 'qty', parseInt(e.target.value) || 1)}
                                            className="w-full bg-white border border-slate-200 text-slate-900 text-sm rounded-lg focus:ring-emerald-500 focus:border-emerald-500 block p-2 transition-colors text-center"
                                        />
                                    </div>
                                    <div className="pt-6 shrink-0">
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveItem(index)}
                                            className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                            title="Hapus baris"
                                            disabled={formData.items.length === 1}
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            )})}
                            {formData.items.length === 0 && (
                                <p className="text-sm text-center py-4 text-slate-500 italic">Belum ada barang ditambahkan.</p>
                            )}
                        </div>
                    </div>
                </form>

                {/* Footer Actions */}
                <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex items-center justify-end gap-3 rounded-b-2xl shrink-0">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-200 bg-slate-100 rounded-xl transition-colors"
                    >
                        Batal
                    </button>
                    <button
                        type="submit"
                        form="createOrderForm"
                        disabled={isSubmitting}
                        className="px-6 py-2.5 text-sm font-bold text-white bg-emerald-500 hover:bg-emerald-600 rounded-xl transition-colors shadow-sm flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {isSubmitting ? 'Menyimpan...' : 'Simpan Pesanan'}
                    </button>
                </div>
            </div>
        </div>
    );
}

// Custom Searchable Select Component
const SearchableEquipmentSelect = ({ value, onChange, equipments = [], disabled, isLoading }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [search, setSearch] = useState("");
    const wrapperRef = useRef(null);

    const safeEquipments = Array.isArray(equipments) ? equipments : [];
    const selectedEq = safeEquipments.find(eq => eq.id === value || eq.id == value);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const filtered = safeEquipments.filter(eq =>
        eq.status === 'Baik' && (eq?.name || "").toLowerCase().includes((search || "").toLowerCase())
    );

    const formatRupiah = (number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0
        }).format(Number(number));
    };

    return (
        <div ref={wrapperRef} className="relative w-full">
            <div
                className={`w-full bg-white border border-slate-200 text-slate-900 text-sm rounded-lg p-2 transition-colors flex justify-between items-center ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer focus-within:ring-emerald-500 focus-within:border-emerald-500'}`}
                onClick={() => !disabled && setIsOpen(!isOpen)}
            >
                <span className="truncate">
                    {isLoading ? 'Memuat alat...' : selectedEq ? `${selectedEq.name} - ${formatRupiah(selectedEq.price_per_day)}/hari` : '-- Pilih Alat --'}
                </span>
                <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
            </div>

            {isOpen && (
                <div className="absolute z-50 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg overflow-hidden">
                    <div className="p-2 border-b border-slate-100">
                        <div className="relative">
                            <Search className="w-4 h-4 text-slate-400 absolute left-2.5 top-2.5" />
                            <input
                                type="text"
                                className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-md text-sm focus:outline-none focus:border-emerald-500 transition-colors"
                                placeholder="Cari nama alat..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                onClick={(e) => e.stopPropagation()}
                                autoFocus
                            />
                        </div>
                    </div>
                    <ul className="max-h-48 overflow-y-auto">
                        {filtered.length > 0 ? (
                            filtered.map(eq => (
                                <li
                                    key={eq.id}
                                    className={`px-3 py-2 text-sm cursor-pointer hover:bg-emerald-50 hover:text-emerald-700 transition-colors ${value == eq.id ? 'bg-emerald-50 font-medium text-emerald-700' : 'text-slate-700'}`}
                                    onClick={() => {
                                        onChange(eq.id);
                                        setIsOpen(false);
                                        setSearch("");
                                    }}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-white border border-slate-100 rounded shrink-0 flex items-center justify-center overflow-hidden">
                                            {eq.images?.[0]?.image_path ? (
                                                <img src={`/storage/${eq.images[0].image_path}`} alt={eq.name} className="w-full h-full object-contain p-0.5" />
                                            ) : (
                                                <div className="w-full h-full bg-slate-50"></div>
                                            )}
                                        </div>
                                        <div>
                                            <div className="font-medium">{eq.name}</div>
                                            <div className="text-xs text-slate-500">Stok: {eq.available_stock} • {formatRupiah(eq.price_per_day)}/hari</div>
                                        </div>
                                    </div>
                                </li>
                            ))
                        ) : (
                            <li className="px-3 py-3 text-sm text-center text-slate-500">Alat tidak ditemukan</li>
                        )}
                    </ul>
                </div>
            )}
        </div>
    );
};
