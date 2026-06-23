import React, { useState } from 'react';
import TextInput from '../../../Components/TextInput';
import axios from 'axios';
import { Head, Link } from '@inertiajs/react';
import { Mail, ArrowLeft, ArrowRight, CheckCircle2 } from 'lucide-react';

export default function ForgotPassword() {
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setLoading(true);

        try {
            const { data } = await axios.post('/api/forgot-password', { email });
            setSuccess(data.message || 'Tautan reset password telah dikirim ke email Anda.');
            setEmail('');
        } catch (err) {
            setError(err.response?.data?.message || 'Gagal mengirim tautan, pastikan email Anda terdaftar.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex w-full bg-slate-50" style={{ fontFamily: "'Poppins', sans-serif" }}>
            <Head title="Lupa Password" />
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Poppins:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,400;1,500;1,600;1,700;1,800;1,900&display=swap');
            `}</style>

            {/* Left Image Section */}
            <div className="hidden lg:flex w-1/2 relative overflow-hidden bg-[#0A2619]">
                <img
                    src="https://images.unsplash.com/photo-1523987355523-c7b5b0dd90a7?q=80&w=1470&auto=format&fit=crop"
                    className="absolute inset-0 w-full h-full object-cover mix-blend-overlay opacity-60"
                    alt="Tent View"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0A2619] via-[#0A2619]/40 to-transparent"></div>

                <div className="absolute top-10 left-10 flex items-center gap-3">
                    <div className="bg-[#22C55E] text-white p-1.5 rounded">
                        <img src="/logo.svg" className="w-12 h-12" alt="Logo" />
                    </div>
                    <span className="text-white font-bold tracking-widest text-sm">TIGA TITIK OUTDOOR</span>
                </div>

                <div className="absolute bottom-32 left-12 z-10">
                    <h1 className="text-white text-[56px] font-black italic leading-[1.1] tracking-tight">
                        Jangan Panik,<br />Kami Bantu.
                    </h1>
                </div>
            </div>

            {/* Right Form Section */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-6 bg-[#F8FAFC]">
                <div className="w-full max-w-[420px] bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-10 relative">
                    <div className="mb-6">
                        <Link href="/login" className="inline-flex items-center gap-2 text-slate-400 hover:text-[#0B402B] text-sm font-medium transition-colors">
                            <ArrowLeft className="w-4 h-4" /> Kembali ke Login
                        </Link>
                    </div>

                    <div className="text-center mb-8">
                        <h2 className="text-[#0f172a] text-2xl font-black italic uppercase tracking-wide">LUPA PASSWORD</h2>
                        <p className="text-slate-400 text-[13px] mt-1.5 leading-relaxed">
                            Masukkan email yang terdaftar, kami akan mengirimkan tautan untuk mengatur ulang password Anda.
                        </p>
                    </div>

                    {success ? (
                        <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-6 text-center space-y-4">
                            <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                                <CheckCircle2 className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="font-bold text-emerald-800 text-sm">Email Terkirim!</h3>
                                <p className="text-xs text-emerald-600 mt-1">{success}</p>
                            </div>
                            <p className="text-[11px] text-slate-400 mt-4">Penting: Jika tidak menemukan email, coba periksa folder Spam/Junk Anda.</p>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-5">
                            <TextInput
                                id="email"
                                type="email"
                                label="ALAMAT EMAIL"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                icon={<Mail className="w-4 h-4" />}
                                className="!bg-slate-50 !text-slate-900 !border-slate-200 focus:!border-[#0B402B] focus:!ring-[#0B402B] !rounded-xl !text-sm"
                            />

                            {error && (
                                <p className="text-sm text-red-500 font-medium">{error}</p>
                            )}

                            <div className="pt-2">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full flex items-center justify-center gap-2 bg-[#0B402B] hover:bg-[#082f1f] text-white font-bold py-3.5 px-4 rounded-xl transition-colors text-sm disabled:opacity-70 disabled:cursor-not-allowed"
                                >
                                    {loading ? 'Mengirim...' : (
                                        <>
                                            Kirim Tautan Reset
                                            <ArrowRight className="w-4 h-4" strokeWidth={2.5} />
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}
