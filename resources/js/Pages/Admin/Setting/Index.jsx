import React, { useState } from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import { usePage, useForm } from '@inertiajs/react';
import { Save, Plus, Trash2, Image as ImageIcon } from 'lucide-react';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';

export default function Index() {
    const { settings, flash } = usePage().props;

    const { data, setData, post, processing, errors } = useForm({
        store_phone: settings.store_phone || '',
        store_instagram: settings.store_instagram || '',
        store_email: settings.store_email || '',
        store_address: settings.store_address || '',
        store_maps_link: settings.store_maps_link || '',
        store_faqs: settings.store_faqs || [],
        store_terms_conditions: settings.store_terms_conditions || '',
        store_qris: null,
    });

    const [qrisPreview, setQrisPreview] = useState(settings.store_qris ? `/storage/${settings.store_qris}` : null);

    const handleFaqChange = (index, field, value) => {
        const newFaqs = [...data.store_faqs];
        newFaqs[index][field] = value;
        setData('store_faqs', newFaqs);
    };

    const addFaq = () => {
        setData('store_faqs', [...data.store_faqs, { question: '', answer: '' }]);
    };

    const removeFaq = (index) => {
        const newFaqs = data.store_faqs.filter((_, i) => i !== index);
        setData('store_faqs', newFaqs);
    };

    const handleQrisChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setData('store_qris', file);
            setQrisPreview(URL.createObjectURL(file));
        }
    };

    const submit = (e) => {
        e.preventDefault();
        post('/admin/settings', {
            preserveScroll: true,
        });
    };

    const quillModules = {
        toolbar: [
            [{ 'header': [1, 2, 3, false] }],
            ['bold', 'italic', 'underline', 'strike'],
            [{ 'list': 'ordered' }, { 'list': 'bullet' }],
            ['clean']
        ],
    };

    return (
        <AdminLayout title="Pengaturan Sistem">
            {flash.success && (
                <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <span className="font-bold">Sukses!</span>
                        {flash.success}
                    </div>
                </div>
            )}

            <form onSubmit={submit} className="max-w-4xl space-y-6 pb-12">

                {/* 1. Informasi Kontak & Toko */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
                        <h3 className="font-bold text-slate-800 text-lg">Informasi Kontak Toko</h3>
                    </div>
                    <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Nomor HP / WhatsApp</label>
                            <input
                                type="text"
                                value={data.store_phone}
                                onChange={e => setData('store_phone', e.target.value)}
                                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Username Instagram</label>
                            <input
                                type="text"
                                value={data.store_instagram}
                                onChange={e => setData('store_instagram', e.target.value)}
                                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors"
                            />
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-slate-700 mb-2">Alamat Email</label>
                            <input
                                type="email"
                                value={data.store_email}
                                onChange={e => setData('store_email', e.target.value)}
                                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors"
                            />
                        </div>
                    </div>
                </div>

                {/* 2. Lokasi Toko */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
                        <h3 className="font-bold text-slate-800 text-lg">Lokasi Toko</h3>
                    </div>
                    <div className="p-6 space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Alamat Lengkap</label>
                            <textarea
                                value={data.store_address}
                                onChange={e => setData('store_address', e.target.value)}
                                rows="3"
                                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors"
                            ></textarea>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Link Google Maps</label>
                            <input
                                type="url"
                                value={data.store_maps_link}
                                onChange={e => setData('store_maps_link', e.target.value)}
                                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors"
                            />
                        </div>
                    </div>
                </div>

                {/* 3. QRIS Pembayaran */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
                        <h3 className="font-bold text-slate-800 text-lg">QRIS Pembayaran</h3>
                        <p className="text-xs text-slate-500 mt-1">Gambar ini akan digunakan saat konfirmasi penyewaan agar pelanggan bisa melihat dan mengunduh QRIS.</p>
                    </div>
                    <div className="p-6">
                        <div className="flex flex-col sm:flex-row gap-6 items-start">
                            <div className="w-full sm:w-1/3 aspect-[3/4] bg-slate-100 rounded-xl border-2 border-dashed border-slate-300 flex flex-col items-center justify-center overflow-hidden relative">
                                {qrisPreview ? (
                                    <img src={qrisPreview} alt="QRIS Preview" className="w-full h-full object-contain" />
                                ) : (
                                    <>
                                        <ImageIcon className="w-8 h-8 text-slate-400 mb-2" />
                                        <span className="text-xs text-slate-500">Belum ada gambar</span>
                                    </>
                                )}
                            </div>
                            <div className="flex-1">
                                <label className="block text-sm font-medium text-slate-700 mb-2">Upload Gambar QRIS Baru</label>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleQrisChange}
                                    className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100"
                                />
                                {errors.store_qris && <p className="text-red-500 text-xs mt-2">{errors.store_qris}</p>}
                            </div>
                        </div>
                    </div>
                </div>

                {/* 4. Syarat & Ketentuan */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
                        <h3 className="font-bold text-slate-800 text-lg">Aturan Penyewaan & Syarat Ketentuan</h3>
                    </div>
                    <div className="p-6">
                        <div className="bg-white">
                            <ReactQuill
                                theme="snow"
                                value={data.store_terms_conditions}
                                onChange={(content) => setData('store_terms_conditions', content)}
                                modules={quillModules}
                                className="h-150 mb-12"
                            />
                        </div>
                    </div>
                </div>

                {/* 5. FAQs */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                        <h3 className="font-bold text-slate-800 text-lg">Frequently Asked Questions (FAQ)</h3>
                        <button
                            type="button"
                            onClick={addFaq}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-100 text-emerald-700 rounded-lg text-sm font-bold hover:bg-emerald-200 transition-colors"
                        >
                            <Plus className="w-4 h-4" /> Tambah FAQ
                        </button>
                    </div>
                    <div className="p-6 space-y-4">
                        {data.store_faqs.length === 0 ? (
                            <p className="text-slate-500 text-sm text-center py-4">Belum ada daftar FAQ.</p>
                        ) : (
                            data.store_faqs.map((faq, index) => (
                                <div key={index} className="flex gap-4 items-start p-4 bg-slate-50 border border-slate-200 rounded-xl">
                                    <div className="flex-1 space-y-3">
                                        <input
                                            type="text"
                                            placeholder="Pertanyaan..."
                                            value={faq.question}
                                            onChange={(e) => handleFaqChange(index, 'question', e.target.value)}
                                            className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-sm font-medium"
                                        />
                                        <textarea
                                            placeholder="Jawaban..."
                                            value={faq.answer}
                                            onChange={(e) => handleFaqChange(index, 'answer', e.target.value)}
                                            rows="4"
                                            className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-sm text-slate-600"
                                        ></textarea>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => removeFaq(index)}
                                        className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                    >
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                <div className="flex justify-end pt-4">
                    <button
                        type="submit"
                        disabled={processing}
                        className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white font-bold rounded-xl shadow-sm hover:bg-emerald-700 disabled:opacity-50 transition-colors"
                    >
                        <Save className="w-5 h-5" />
                        {processing ? 'Menyimpan...' : 'Simpan Perubahan'}
                    </button>
                </div>
            </form>
        </AdminLayout>
    );
}
