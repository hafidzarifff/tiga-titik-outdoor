import React, { useState } from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import { usePage, useForm } from '@inertiajs/react';
import { User, Mail, Phone, ShieldCheck, CalendarDays, Edit2, X, Save, Check } from 'lucide-react';

export default function ProfileIndex() {
    const { adminProfile, flash } = usePage().props;
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

    const { data, setData, post, processing, errors, reset, clearErrors } = useForm({
        name: adminProfile.name || '',
        email: adminProfile.email || '',
        phone_number: adminProfile.phone_number !== '-' ? adminProfile.phone_number : '',
    });

    const openEditModal = () => {
        setData({
            name: adminProfile.name || '',
            email: adminProfile.email || '',
            phone_number: adminProfile.phone_number !== '-' ? adminProfile.phone_number : '',
        });
        clearErrors();
        setIsEditModalOpen(true);
    };

    const closeEditModal = () => {
        setIsEditModalOpen(false);
        reset();
        clearErrors();
    };

    const submit = (e) => {
        e.preventDefault();
        post('/admin/profile', {
            preserveScroll: true,
            onSuccess: () => closeEditModal(),
        });
    };

    return (
        <AdminLayout title="Profil Saya">
            <div className="max-w-4xl mx-auto">
                {/* Flash Message */}
                {flash?.success && (
                    <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-2xl flex items-center gap-3">
                        <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center shrink-0">
                            <Check className="w-4 h-4 text-emerald-600" />
                        </div>
                        <p className="text-sm font-medium">{flash.success}</p>
                    </div>
                )}

                {/* Header Profile Card */}
                <div className="bg-white rounded-[24px] overflow-hidden shadow-sm border border-slate-100 mb-6">
                    <div className="h-24 bg-[#042217] w-full relative">
                        <div className="absolute inset-0 bg-emerald-900/20"></div>
                    </div>

                    <div className="px-6 md:px-10 pt-4 pb-6 flex flex-col md:flex-row items-center md:items-end gap-6 relative -mt-16">
                        {/* Avatar */}
                        <div className="relative z-10">
                            <div className="w-32 h-32 bg-white rounded-2xl p-2 shadow-sm border border-slate-100 flex items-center justify-center">
                                <div className="w-full h-full bg-slate-50 rounded-xl flex items-center justify-center">
                                    <User className="w-14 h-14 text-[#042217]" strokeWidth={2} />
                                </div>
                            </div>
                            <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center border-4 border-white shadow-sm text-white">
                                <ShieldCheck className="w-5 h-5" />
                            </div>
                        </div>

                        {/* Title Info */}
                        <div className="flex-1 text-center md:text-left">
                            <h1 className="text-2xl font-black text-slate-900 uppercase tracking-tight mb-2">
                                {adminProfile.name}
                            </h1>
                            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                                <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                                    {adminProfile.role}
                                </span>
                                <span className="text-slate-500 text-xs font-semibold flex items-center gap-1.5">
                                    <CalendarDays className="w-3.5 h-3.5" /> Terdaftar sejak {adminProfile.created_at}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Details Section */}
                <div className="bg-white rounded-[24px] p-6 md:p-8 shadow-sm border border-slate-100 relative">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest">Informasi Detail</h2>
                        <button
                            onClick={openEditModal}
                            className="bg-white border-2 border-emerald-500 text-emerald-500 hover:bg-emerald-500 hover:text-white flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all duration-300 hover:shadow-lg hover:shadow-emerald-500/30"
                        >
                            <Edit2 className="w-3.5 h-3.5" />
                            Edit Profil
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Nama Lengkap */}
                        <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100/50">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm">
                                    <User className="w-4 h-4 text-slate-500" />
                                </div>
                                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Nama Lengkap</span>
                            </div>
                            <p className="text-slate-900 font-semibold ml-11">{adminProfile.name}</p>
                        </div>

                        {/* Email Address */}
                        <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100/50">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm">
                                    <Mail className="w-4 h-4 text-slate-500" />
                                </div>
                                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Email Address</span>
                            </div>
                            <p className="text-slate-900 font-semibold ml-11">{adminProfile.email}</p>
                        </div>

                        {/* Phone Number */}
                        <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100/50">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm">
                                    <Phone className="w-4 h-4 text-slate-500" />
                                </div>
                                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Phone Number</span>
                            </div>
                            <p className="text-slate-900 font-semibold ml-11">{adminProfile.phone_number}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Edit Profile Modal */}
            {isEditModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
                    <div
                        className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
                        onClick={closeEditModal}
                    ></div>

                    <div className="bg-white rounded-[24px] shadow-2xl w-full max-w-lg relative z-10 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                        {/* Modal Header */}
                        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                                <Edit2 className="w-5 h-5 text-emerald-600" />
                                Edit Profil
                            </h3>
                            <button
                                onClick={closeEditModal}
                                className="w-8 h-8 rounded-full hover:bg-slate-200 flex items-center justify-center text-slate-500 transition-colors"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <form onSubmit={submit}>
                            <div className="p-6 space-y-5">
                                <div>
                                    <label htmlFor="name" className="block text-sm font-semibold text-slate-700 mb-1.5">Nama Lengkap</label>
                                    <input
                                        type="text"
                                        id="name"
                                        value={data.name}
                                        onChange={e => setData('name', e.target.value)}
                                        className={`w-full px-4 py-2.5 rounded-xl border ${errors.name ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20' : 'border-slate-200 focus:border-emerald-500 focus:ring-emerald-500/20'} transition-all`}
                                        placeholder="Masukkan nama lengkap"
                                    />
                                    {errors.name && <p className="mt-1 text-sm text-red-500">{errors.name}</p>}
                                </div>

                                <div>
                                    <label htmlFor="email" className="block text-sm font-semibold text-slate-700 mb-1.5">Email Address</label>
                                    <input
                                        type="email"
                                        id="email"
                                        value={data.email}
                                        onChange={e => setData('email', e.target.value)}
                                        className={`w-full px-4 py-2.5 rounded-xl border ${errors.email ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20' : 'border-slate-200 focus:border-emerald-500 focus:ring-emerald-500/20'} transition-all`}
                                        placeholder="Masukkan email address"
                                    />
                                    {errors.email && <p className="mt-1 text-sm text-red-500">{errors.email}</p>}
                                </div>

                                <div>
                                    <label htmlFor="phone_number" className="block text-sm font-semibold text-slate-700 mb-1.5">Nomor Telepon</label>
                                    <input
                                        type="text"
                                        id="phone_number"
                                        value={data.phone_number}
                                        onChange={e => setData('phone_number', e.target.value)}
                                        className={`w-full px-4 py-2.5 rounded-xl border ${errors.phone_number ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20' : 'border-slate-200 focus:border-emerald-500 focus:ring-emerald-500/20'} transition-all`}
                                        placeholder="Contoh: 081234567890"
                                    />
                                    {errors.phone_number && <p className="mt-1 text-sm text-red-500">{errors.phone_number}</p>}
                                    <p className="mt-1.5 text-xs text-slate-500">Opsional, bisa dikosongkan.</p>
                                </div>
                            </div>

                            {/* Modal Footer */}
                            <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex items-center justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={closeEditModal}
                                    className="px-5 py-2.5 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-200 transition-colors"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-2 transition-colors shadow-sm shadow-emerald-600/20"
                                >
                                    {processing ? (
                                        <>
                                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                            Menyimpan...
                                        </>
                                    ) : (
                                        <>
                                            <Save className="w-4 h-4" />
                                            Simpan Perubahan
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}
