import React, { useState } from 'react';
import TextInput from '../../../Components/TextInput';
import { login } from '../../../services/api';
import { Head, Link } from '@inertiajs/react';
import { User, Lock, Tent, ArrowRight } from 'lucide-react';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const { data } = await login({ email, password });
            if (data.access_token) {
                localStorage.setItem('tto_auth_token', data.access_token);
                window.location.href = '/';
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Login gagal, periksa kredensial Anda.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex w-full bg-slate-50" style={{ fontFamily: "'Poppins', sans-serif" }}>
            <Head title="Masuk" />
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
                        Jelajahi Alam<br />Tanpa Batas.
                    </h1>
                </div>

                <div className="absolute bottom-10 left-10 text-white/50 text-xs font-medium">
                    © {new Date().getFullYear()} Tiga Titik Outdoor System.
                </div>
            </div>

            {/* Right Form Section */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-6 bg-[#F8FAFC]">
                <div className="w-full max-w-[420px] bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-10 relative">
                    <div className="text-center mb-8">
                        <h2 className="text-[#0f172a] text-2xl font-black italic uppercase tracking-wide">SELAMAT DATANG</h2>
                        <p className="text-slate-400 text-[13px] mt-1.5">Masuk untuk mulai petualangan Anda.</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <TextInput
                            id="email"
                            type="text"
                            label="EMAIL / USERNAME"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            icon={<User className="w-4 h-4" />}
                            className="!bg-slate-50 !text-slate-900 !border-slate-200 focus:!border-[#0B402B] focus:!ring-[#0B402B] !rounded-xl !text-sm"
                        />

                        <TextInput
                            id="password"
                            type="password"
                            label="PASSWORD"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            icon={<Lock className="w-4 h-4" />}
                            className="!bg-slate-50 !text-slate-900 !border-slate-200 focus:!border-[#0B402B] focus:!ring-[#0B402B] !rounded-xl !text-sm"
                        />

                        {error && (
                            <p className="text-sm text-red-500 font-medium">{error}</p>
                        )}

                        <div className="flex justify-end">
                            <Link href="/forgot-password" className="text-[13px] text-slate-500 hover:text-[#0B402B] hover:underline font-medium">Lupa Password?</Link>
                        </div>

                        <div className="pt-2 space-y-3">
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full flex items-center justify-center gap-2 bg-[#0B402B] hover:bg-[#082f1f] text-white font-bold py-3.5 px-4 rounded-xl transition-colors text-sm"
                            >
                                {loading ? 'Memproses...' : (
                                    <>
                                        Masuk Sekarang
                                        <ArrowRight className="w-4 h-4" strokeWidth={2.5} />
                                    </>
                                )}
                            </button>
                            
                            <Link
                                href="/catalog"
                                className="w-full flex items-center justify-center gap-2 bg-transparent border-2 border-slate-200 hover:border-[#1DD28B] hover:bg-[#1DD28B]/5 text-slate-600 hover:text-[#0B402B] font-bold py-3 px-4 rounded-xl transition-all text-sm"
                            >
                                Lanjutkan sebagai Tamu
                            </Link>
                        </div>
                    </form>

                    <div className="mt-8 text-center text-[13px]">
                        <span className="text-slate-400">Belum memiliki akun? </span>
                        <Link href="/register" className="text-[#0B402B] font-bold italic hover:underline">Daftar Sekarang</Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
