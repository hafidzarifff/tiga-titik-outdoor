import React, { useState } from 'react';
import TextInput from '../../../Components/TextInput';
import { register } from '../../../services/api';
import { Head, Link } from '@inertiajs/react';
import { User, Mail, Phone, Lock, MapPin, Tent, UserPlus, X } from 'lucide-react';

export default function Register({ settings }) {
    const [agreedTnc, setAgreedTnc] = useState(false);
    const [showTncModal, setShowTncModal] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone_number: '',
        username: '', // Kept for UI consistency, though API might ignore
        address: '',
        password: '',
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.id]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!agreedTnc) {
            setError('Anda harus menyetujui Syarat & Ketentuan Penyewaan.');
            return;
        }

        if (formData.password.length < 8) {
            setError('Password minimal 8 karakter');
            return;
        }

        setLoading(true);

        try {
            // Include password_confirmation to satisfy Laravel's 'confirmed' rule
            const payload = {
                ...formData,
                password_confirmation: formData.password
            };

            const { data } = await register(payload);
            if (data.access_token) {
                localStorage.setItem('tto_auth_token', data.access_token);
                window.location.href = '/';
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Registrasi gagal, silakan periksa form Anda.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex w-full bg-slate-50 flex-col-reverse lg:flex-row" style={{ fontFamily: "'Poppins', sans-serif" }}>
            <Head title="Daftar" />
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Poppins:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,400;1,500;1,600;1,700;1,800;1,900&display=swap');
            `}</style>

            {/* Left Form Section */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-6 bg-[#F8FAFC]">
                <div className="w-full max-w-[500px] bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-10 relative">
                    <div className="mb-8">
                        <h2 className="text-[#0f172a] text-2xl font-black italic uppercase tracking-wide">DAFTAR AKUN</h2>
                        <p className="text-slate-400 text-[13px] mt-1.5">Lengkapi data untuk akses penuh penyewaan alat.</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <TextInput
                                id="name"
                                label="NAMA LENGKAP"
                                value={formData.name}
                                onChange={handleChange}
                                required
                                icon={<User className="w-4 h-4" />}
                                className="!bg-slate-50 !text-slate-900 !border-slate-200 focus:!border-[#0B402B] focus:!ring-[#0B402B] !rounded-xl !text-sm"
                            />
                            <TextInput
                                id="email"
                                type="email"
                                label="EMAIL"
                                value={formData.email}
                                onChange={handleChange}
                                required
                                icon={<Mail className="w-4 h-4" />}
                                className="!bg-slate-50 !text-slate-900 !border-slate-200 focus:!border-[#0B402B] focus:!ring-[#0B402B] !rounded-xl !text-sm"
                            />
                            <TextInput
                                id="phone_number"
                                type="tel"
                                label="WHATSAPP"
                                value={formData.phone_number}
                                onChange={handleChange}
                                required
                                icon={<Phone className="w-4 h-4" />}
                                className="!bg-slate-50 !text-slate-900 !border-slate-200 focus:!border-[#0B402B] focus:!ring-[#0B402B] !rounded-xl !text-sm"
                            />
                            <TextInput
                                id="instagram"
                                label="INSTAGRAM"
                                value={formData.instagram}
                                onChange={handleChange}
                                icon="@"
                                className="!bg-slate-50 !text-slate-900 !border-slate-200 focus:!border-[#0B402B] focus:!ring-[#0B402B] !rounded-xl !text-sm"
                            />
                        </div>

                        <TextInput
                            id="password"
                            type="password"
                            label="PASSWORD"
                            value={formData.password}
                            onChange={handleChange}
                            required
                            icon={<Lock className="w-4 h-4" />}
                            className="!bg-slate-50 !text-slate-900 !border-slate-200 focus:!border-[#0B402B] focus:!ring-[#0B402B] !rounded-xl !text-sm"
                        />

                        <div>
                            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                                ALAMAT LENGKAP
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3.5 pt-3.5 pointer-events-none text-slate-400">
                                    <MapPin className="w-4 h-4" />
                                </div>
                                <textarea
                                    id="address"
                                    required
                                    value={formData.address}
                                    onChange={handleChange}
                                    rows="3"
                                    className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 focus:border-[#0B402B] focus:ring-1 focus:ring-[#0B402B] rounded-xl text-slate-900 transition duration-200 outline-none text-sm resize-none"
                                ></textarea>
                            </div>
                        </div>

                        {error && (
                            <p className="text-sm text-red-500 font-medium">{error}</p>
                        )}

                        <div className="mt-4 mb-2">
                            {!agreedTnc ? (
                                <button type="button" onClick={() => setShowTncModal(true)} className="w-full text-left bg-orange-50 border border-orange-200 text-orange-700 text-[13px] p-4 rounded-xl flex items-center justify-between hover:bg-orange-100 transition-colors shadow-sm">
                                    <span>Silakan baca dan setujui <strong>Syarat & Ketentuan</strong></span>
                                    <span className="text-xl leading-none">&rarr;</span>
                                </button>
                            ) : (
                                <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 text-[13px] p-4 rounded-xl flex items-center justify-between shadow-sm">
                                    <span className="flex items-center gap-2">
                                        <div className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center text-xs">✓</div>
                                        Telah menyetujui <strong>Syarat & Ketentuan</strong>
                                    </span>
                                    <button type="button" onClick={() => setShowTncModal(true)} className="text-emerald-700 font-bold hover:underline text-xs">Lihat</button>
                                </div>
                            )}
                        </div>

                        <div className="pt-4">
                            <button
                                type="submit"
                                disabled={loading || !agreedTnc}
                                className={`w-full flex items-center justify-center gap-2 font-bold py-3.5 px-4 rounded-xl transition-colors text-sm shadow-lg ${(loading || !agreedTnc)
                                    ? 'bg-slate-200 text-slate-400 shadow-none cursor-not-allowed'
                                    : 'bg-[#0B402B] hover:bg-[#082f1f] text-white shadow-[#0B402B]/20'
                                    }`}
                            >
                                {loading ? 'Memproses...' : (
                                    <>
                                        <UserPlus className="w-4 h-4" />
                                        DAFTAR SEKARANG
                                    </>
                                )}
                            </button>
                        </div>
                    </form>

                    <div className="mt-8 text-center text-[13px]">
                        <span className="text-slate-400">Sudah memiliki akun? </span>
                        <Link href="/login" className="text-[#0B402B] font-bold italic hover:underline">Masuk di sini</Link>
                    </div>
                </div>
            </div>

            {/* Right Image Section */}
            <div className="hidden lg:flex w-1/2 relative overflow-hidden bg-[#0A2619]">
                <img
                    src="https://images.unsplash.com/photo-1523987355523-c7b5b0dd90a7?q=80&w=1470&auto=format&fit=crop"
                    className="absolute inset-0 w-full h-full object-cover mix-blend-overlay opacity-60"
                    alt="Tent View"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0A2619] via-[#0A2619]/40 to-transparent"></div>

                <div className="absolute top-10 right-10 flex items-center gap-3">
                    <span className="text-white font-bold tracking-widest text-sm">TIGA TITIK OUTDOOR</span>
                    <div className="bg-[#22C55E] text-white p-1.5 rounded">
                        <img src="/logo.svg" className="w-12 h-12" alt="Logo" />
                    </div>
                </div>

                <div className="absolute bottom-32 right-12 z-10 text-right">
                    <h1 className="text-white text-[56px] font-black italic leading-[1.1] tracking-tight">
                        Mulai<br />Petualanganmu.
                    </h1>
                </div>

                <div className="absolute bottom-10 right-10 text-white/50 text-xs font-medium opacity-80">
                    © {new Date().getFullYear()} Tiga Titik Outdoor System.
                </div>
            </div>

            {/* T&C Modal */}
            {showTncModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowTncModal(false)}></div>
                    <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] p-8 md:p-10 max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in duration-200">
                        <button
                            onClick={() => setShowTncModal(false)}
                            className="absolute top-6 right-6 w-8 h-8 flex items-center justify-center bg-slate-100 hover:bg-slate-200 text-slate-500 rounded-full transition-colors"
                        >
                            <X className="w-4 h-4" />
                        </button>
                        <h2 className="text-2xl font-black text-[#0f172a] mb-6 pr-8">Syarat & Ketentuan Penyewaan</h2>
                        <div
                            className="prose prose-sm md:prose-base max-w-none text-black overflow-hidden break-words whitespace-normal"
                            dangerouslySetInnerHTML={{ __html: (settings?.store_terms_conditions || '').replace(/&nbsp;/g, ' ') || '<p>Belum ada syarat dan ketentuan yang ditetapkan.</p>' }}
                        />
                        <div className="p-6 border-t border-slate-100 shrink-0">
                            <button 
                                type="button" 
                                onClick={() => {
                                    setAgreedTnc(true);
                                    setShowTncModal(false);
                                }} 
                                className="w-full bg-[#1DD28B] text-[#072F1F] py-4 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-[#15b879] transition-colors"
                            >
                                SAYA TELAH MEMBACA DAN MENYETUJUI
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
