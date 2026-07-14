import React, { useState, useEffect } from 'react';
import ClientLayout from '@/Layouts/ClientLayout';
import { Head, usePage } from '@inertiajs/react';
import { User, ShieldCheck, Mail, Phone, Lock, Edit2, CheckCircle2, Award, Tent, Save, X, ArrowBigRightDash, ArrowBigRight, ArrowUpRightIcon, HistoryIcon, AtSign } from 'lucide-react';
import { getProfile, updateProfile } from '@/services/api';

export default function Index() {
    const { auth } = usePage().props;
    const isLoggedIn = !!auth.user || !!localStorage.getItem('tto_auth_token');

    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone_number: '',
        instagram: '',
        password: '',
    });
    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (!isLoggedIn) {
            window.location.href = '/login';
            return;
        }
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        setIsLoading(true);
        try {
            const response = await getProfile();
            const userData = response.data;
            setUser(userData);
            setFormData({
                name: userData.name || '',
                email: userData.email || '',
                phone_number: userData.customer_profile?.phone_number || '',
                instagram: userData.customer_profile?.instagram || '',
                password: '',
            });
        } catch (error) {
            console.error('Failed to fetch profile:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setErrors({ ...errors, [e.target.name]: null });
    };

    const handleSave = async () => {
        setIsSaving(true);
        setErrors({});
        try {
            const response = await updateProfile(formData);
            setUser(response.data.data);
            setIsEditing(false);
            setFormData(prev => ({ ...prev, password: '' })); // Reset password field
            alert('Profil berhasil diperbarui!');
        } catch (error) {
            if (error.response && error.response.status === 422) {
                setErrors(error.response.data.errors);
            } else {
                alert('Gagal memperbarui profil.');
            }
        } finally {
            setIsSaving(false);
        }
    };

    const getMemberSince = (dateString) => {
        if (!dateString) return '-';
        const date = new Date(dateString);
        return date.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' }).toUpperCase();
    };

    const getFirstName = (fullName) => {
        if (!fullName) return '';
        return fullName.split(' ')[0].toLowerCase();
    };

    if (isLoading || !user) {
        return (
            <ClientLayout title="Profil Saya" isLoggedIn={isLoggedIn} user={auth.user}>
                <div className="flex flex-col items-center justify-center py-32">
                    <div className="w-10 h-10 border-4 border-[#1DD28B] border-t-transparent rounded-full animate-spin mb-4"></div>
                    <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Memuat profil...</p>
                </div>
            </ClientLayout>
        );
    }

    return (
        <ClientLayout title="Profil Saya" isLoggedIn={isLoggedIn} user={user}>
            <Head title="Profil Saya" />

            <div className="pt-6 pb-24 max-w-[1000px] mx-auto px-4 xl:px-0 w-full">

                {/* Header Banner Card */}
                <div className="bg-white rounded-[32px] overflow-hidden shadow-sm border border-slate-100 mb-8 relative">
                    {/* Top Green Banner */}
                    <div className="h-32 md:h-40 bg-[#072F1F] w-full relative">
                        {/* Decorative pattern/blur could go here */}
                    </div>

                    {/* User Info Container */}
                    <div className="px-6 md:px-10 pb-8 flex flex-col md:flex-row items-center md:items-end gap-6 relative -mt-16 md:-mt-20">
                        {/* Avatar */}
                        <div className="relative z-10">
                            <div className="w-32 h-32 md:w-40 md:h-40 bg-white rounded-[32px] p-2 shadow-sm border border-slate-100 flex items-center justify-center">
                                <div className="w-full h-full bg-slate-50 rounded-[24px] flex items-center justify-center">
                                    <User className="w-12 h-12 md:w-16 md:h-16 text-[#072F1F]" strokeWidth={2} />
                                </div>
                            </div>
                            <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-[#1DD28B] rounded-xl flex items-center justify-center border-4 border-white shadow-sm">
                                <ShieldCheck className="w-5 h-5 text-white" />
                            </div>
                        </div>

                        {/* Text Info */}
                        <div className="flex-1 text-center md:text-left mb-2">
                            <h1 className="text-2xl md:text-[32px] font-black text-[#072F1F] uppercase italic tracking-tight leading-none mb-3">
                                {user.name}
                            </h1>
                            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-xs font-bold uppercase tracking-widest text-slate-400">
                                <div className="flex items-center gap-1.5">
                                    <CheckCircle2 className="w-4 h-4 text-[#1DD28B]" />
                                    <span>Member Sejak: {getMemberSince(user.customer_profile?.registration_date || user.created_at)}</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <HistoryIcon className="w-4 h-4 text-[#1DD28B]" />
                                    <span className="text-[#1DD28B]">{user.order_count || 0}X SEWA ALAT</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Content Grid */}
                <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">

                    {/* Left Column: Form */}
                    <div className="flex-1 bg-white rounded-[32px] p-6 md:p-10 shadow-sm border border-slate-100">
                        <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-50">
                            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Informasi Pribadi</h2>
                            {!isEditing ? (
                                <button
                                    onClick={() => setIsEditing(true)}
                                    className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-[#072F1F] bg-white-100 border border-[#1DD28B] hover:border-[#1DD28B] hover:bg-[#1DD28B] rounded-xl transition-colors uppercase tracking-widest"
                                >
                                    <Edit2 className="w-3.5 h-3.5" />
                                    Edit Data
                                </button>
                            ) : (
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => {
                                            setIsEditing(false);
                                            setFormData({
                                                name: user.name || '',
                                                email: user.email || '',
                                                phone_number: user.customer_profile?.phone_number || '',
                                                instagram: user.customer_profile?.instagram || '',
                                                password: '',
                                            });
                                            setErrors({});
                                        }}
                                        className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-slate-500 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors uppercase tracking-widest"
                                    >
                                        <X className="w-3.5 h-3.5" />
                                        Batal
                                    </button>
                                    <button
                                        onClick={handleSave}
                                        disabled={isSaving}
                                        className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-[#1DD28B] hover:bg-[#15b879] rounded-xl transition-colors uppercase tracking-widest disabled:opacity-70"
                                    >
                                        <Save className="w-3.5 h-3.5" />
                                        {isSaving ? 'Menyimpan...' : 'Simpan'}
                                    </button>
                                </div>
                            )}
                        </div>

                        <div className="space-y-6">
                            {/* NAMA LENGKAP */}
                            <div>
                                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Nama Lengkap</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <User className={`w-5 h-5 ${isEditing ? 'text-[#1DD28B]' : 'text-slate-400'}`} />
                                    </div>
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        disabled={!isEditing}
                                        className={`w-full pl-12 pr-4 py-3.5 rounded-2xl text-sm font-semibold transition-all ${isEditing
                                            ? 'bg-white border-2 border-[#1DD28B]/20 focus:border-[#1DD28B] focus:ring-0 text-slate-900'
                                            : 'bg-slate-50 border-transparent text-slate-600 cursor-not-allowed'
                                            }`}
                                    />
                                </div>
                                {errors.name && <p className="text-red-500 text-xs mt-1.5">{errors.name[0]}</p>}
                            </div>

                            {/* EMAIL ADDRESS */}
                            <div>
                                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Email Address</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <Mail className={`w-5 h-5 ${isEditing ? 'text-[#1DD28B]' : 'text-slate-400'}`} />
                                    </div>
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        disabled={!isEditing}
                                        className={`w-full pl-12 pr-4 py-3.5 rounded-2xl text-sm font-semibold transition-all ${isEditing
                                            ? 'bg-white border-2 border-[#1DD28B]/20 focus:border-[#1DD28B] focus:ring-0 text-slate-900'
                                            : 'bg-slate-50 border-transparent text-slate-600 cursor-not-allowed'
                                            }`}
                                    />
                                </div>
                                {errors.email && <p className="text-red-500 text-xs mt-1.5">{errors.email[0]}</p>}
                            </div>

                            {/* KATA SANDI */}
                            <div>
                                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
                                    Kata Sandi {isEditing && <span className="text-slate-300 normal-case tracking-normal ml-1">(Kosongkan jika tidak diubah)</span>}
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <Lock className={`w-5 h-5 ${isEditing ? 'text-[#1DD28B]' : 'text-slate-400'}`} />
                                    </div>
                                    <input
                                        type="password"
                                        name="password"
                                        value={isEditing ? formData.password : '........'}
                                        onChange={handleChange}
                                        disabled={!isEditing}
                                        placeholder={isEditing ? 'Masukkan kata sandi baru' : ''}
                                        className={`w-full pl-12 pr-4 py-3.5 rounded-2xl text-sm font-semibold transition-all ${isEditing
                                            ? 'bg-white border-2 border-[#1DD28B]/20 focus:border-[#1DD28B] focus:ring-0 text-slate-900'
                                            : 'bg-slate-50 border-transparent text-slate-600 cursor-not-allowed tracking-widest'
                                            }`}
                                    />
                                </div>
                                {errors.password && <p className="text-red-500 text-xs mt-1.5">{errors.password[0]}</p>}
                            </div>

                            {/* WHATSAPP */}
                            <div>
                                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">WhatsApp</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <Phone className={`w-5 h-5 ${isEditing ? 'text-[#1DD28B]' : 'text-slate-400'}`} />
                                    </div>
                                    <input
                                        type="text"
                                        name="phone_number"
                                        value={formData.phone_number}
                                        onChange={handleChange}
                                        disabled={!isEditing}
                                        className={`w-full pl-12 pr-4 py-3.5 rounded-2xl text-sm font-semibold transition-all ${isEditing
                                            ? 'bg-white border-2 border-[#1DD28B]/20 focus:border-[#1DD28B] focus:ring-0 text-slate-900'
                                            : 'bg-slate-50 border-transparent text-slate-600 cursor-not-allowed'
                                            }`}
                                    />
                                </div>
                                {errors.phone_number && <p className="text-red-500 text-xs mt-1.5">{errors.phone_number[0]}</p>}
                            </div>

                            {/* INSTAGRAM */}
                            <div>
                                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Instagram <span className="text-slate-300 normal-case tracking-normal ml-1">(Opsional)</span></label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <AtSign className={`w-5 h-5 ${isEditing ? 'text-[#1DD28B]' : 'text-slate-400'}`} />
                                    </div>
                                    <input
                                        type="text"
                                        name="instagram"
                                        value={formData.instagram}
                                        onChange={handleChange}
                                        disabled={!isEditing}
                                        placeholder="@username"
                                        className={`w-full pl-12 pr-4 py-3.5 rounded-2xl text-sm font-semibold transition-all ${isEditing
                                            ? 'bg-white border-2 border-[#1DD28B]/20 focus:border-[#1DD28B] focus:ring-0 text-slate-900'
                                            : 'bg-slate-50 border-transparent text-slate-600 cursor-not-allowed'
                                            }`}
                                    />
                                </div>
                                {errors.instagram && <p className="text-red-500 text-xs mt-1.5">{errors.instagram[0]}</p>}
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Widgets */}
                    <div className="w-full lg:w-80 flex flex-col gap-6">

                        {/* Call to Action Widget */}
                        <div className="bg-[#1DD28B] rounded-[32px] p-8 text-white relative overflow-hidden shadow-sm hover:-translate-y-1 transition-transform group cursor-pointer" onClick={() => window.location.href = '/catalog'}>
                            {/* Decorative Shield Icon BG */}
                            <img src="/logo.svg" className="absolute -right-9 -bottom-5 w-32 h-32 text-white/20 -rotate-12 group-hover:scale-110 transition-transform duration-500" alt="Logo" />

                            <h3 className="text-xl font-black italic uppercase tracking-tight leading-tight relative z-10">
                                SIAP UNTUK<br />KEMAH LAGI?
                            </h3>
                            <button className="mt-4 inline-flex items-center justify-center px-8 py-3 bg-white/20 backdrop-blur-sm rounded-full relative z-10 group-hover:bg-white/30 transition-colors">
                                Jelajahi Katalog
                                <ArrowUpRightIcon className="w-5 h-5 ml-2 text-white" />
                            </button>
                        </div>

                        {/* Aturan Penyewaan Widget */}
                        <div className="bg-white rounded-[32px] p-6 shadow-sm border border-slate-100 flex items-center justify-between group cursor-pointer hover:border-[#1DD28B] transition-colors" onClick={() => window.location.href = '/help-center'}>
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-slate-50 group-hover:bg-[#1DD28B]/10 rounded-2xl flex items-center justify-center transition-colors">
                                    <ShieldCheck className="w-6 h-6 text-slate-400 group-hover:text-[#1DD28B] transition-colors" />
                                </div>
                                <div>
                                    <h3 className="text-sm font-black text-slate-800 uppercase tracking-wide group-hover:text-[#1DD28B] transition-colors">Aturan Penyewaan</h3>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Syarat & Ketentuan</p>
                                </div>
                            </div>
                            <ArrowBigRightDash className="w-5 h-5 text-slate-300 group-hover:text-[#1DD28B] group-hover:translate-x-1 transition-all" />
                        </div>

                    </div>
                </div>
            </div>
        </ClientLayout>
    );
}
