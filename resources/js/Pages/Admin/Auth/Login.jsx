import React from 'react';
import { useForm, Head, Link } from '@inertiajs/react';
import { Tent, Mail, Lock } from 'lucide-react';

export default function Login() {
    const { data, setData, post, processing, errors } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        // Menggunakan route laravel jika tersedia via Ziggy, fallback ke path manual
        const loginUrl = typeof route === 'function' ? route('admin.login') : '/admin/login';
        post(loginUrl);
    };

    return (
        <>
            <Head title="Admin Login" />
            <div className="min-h-screen flex w-full font-sans text-emerald-50">
                {/* Panel Kiri (Hero Image & Branding) - 50% di Desktop, Hidden di Mobile */}
                <div
                    className="hidden lg:flex lg:w-1/2 relative bg-[#031d12] bg-cover bg-center"
                    style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuAhJg5Inf7cBiM555T-mS_-ZIh59GWNK8K3qYwc81390kjz92DJTg77QdDbVGczvoN4jcFEquDhhWtftKWF6MilV1pLT0vY9wCxOEfhTVn6RcjR05NrsPA4Z43aDEA0jDvFFB8KimmB0nnn8DsYyTpbm0YUQv3FiipsIWTSIitDaZv62uH8YhG-x0_fEbh3yQMirlgrKEBVXuyocEeuWAfpsREzvGXY2cMQSHrGoswlc90J8KrezBPIQqJuu4OtMCWv7A3Wdx0s1L0T")' }}
                >
                    {/* Overlay gradient gelap di bawah */}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#00040d] via-[#031d12]/70 to-transparent"></div>

                    {/* Konten Kiri Bawah */}
                    <div className="absolute bottom-0 left-0 p-12 lg:p-16 z-10 w-full max-w-2xl">
                        {/* Logo Tenda */}
                        <div className="text-green-500 mb-6">
                            <Tent className="w-12 h-12" />
                        </div>

                        <h1 className="text-5xl font-extrabold text-white leading-tight mb-2">
                            Siap Berpetualang?
                            <br />
                            <span className="text-green-500">Atur Semuanya di Sini.</span>
                        </h1>
                        <p className="text-gray-300 mt-4 max-w-lg text-lg">
                            Optimalkan operasional rental alat dan bantu pelanggan memulai petualangan mereka lebih cepat.
                        </p>

                        {/* Indikator Slider */}
                        <div className="flex items-center gap-2 mt-10">
                            <div className="w-12 h-1.5 bg-emerald-500 rounded-full"></div>
                            <div className="w-2 h-2 bg-gray-500 rounded-full opacity-50"></div>
                            <div className="w-2 h-2 bg-gray-500 rounded-full opacity-50"></div>
                        </div>
                    </div>
                </div>

                {/* Panel Kanan (Form Login) - 100% di Mobile, 50% di Desktop */}
                <div className="w-full lg:w-1/2 bg-[#042217] relative flex items-center justify-center p-8 sm:p-12">
                    {/* Header Kanan Atas */}
                    <div className="absolute top-8 right-8 flex items-center gap-2 text-white opacity-80">
                        <Tent className="w-5 h-5 text-green-500" />
                        <span className="text-sm font-semibold tracking-wider">TIGA TITIK OUTDOOR</span>
                    </div>

                    {/* Form Container */}
                    <div className="w-full max-w-md">
                        <div className="mb-10">
                            <h2 className="text-3xl font-bold text-white">Selamat Datang, Ranger.</h2>
                            <p className="mt-3 text-emerald-300/70">Masukkan Email dan Password Anda untuk masuk ke dalam sistem.</p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Input Email */}
                            <div>
                                <label className="block text-sm font-medium text-emerald-100 mb-2" htmlFor="email">
                                    Email
                                </label>
                                <div className="relative">
                                    <input
                                        id="email"
                                        type="email"
                                        className="w-full pl-4 pr-11 py-3 bg-[#02160f]/60 border border-emerald-800/40 focus:border-green-500 focus:ring-1 focus:ring-green-500 rounded-lg text-white placeholder-emerald-700/50 transition duration-200 outline-none"
                                        placeholder="admin@test.com"
                                        value={data.email}
                                        onChange={(e) => setData('email', e.target.value)}
                                        required
                                    />
                                    <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-emerald-600/75">
                                        <Mail className="w-5 h-5" />
                                    </div>
                                </div>
                                {errors.email && (
                                    <p className="mt-2 text-sm text-red-500">{errors.email}</p>
                                )}
                            </div>

                            {/* Input Password */}
                            <div>
                                <label className="block text-sm font-medium text-emerald-100 mb-2" htmlFor="password">
                                    Password
                                </label>
                                <div className="relative">
                                    <input
                                        id="password"
                                        type="password"
                                        className="w-full pl-4 pr-11 py-3 bg-[#02160f]/60 border border-emerald-800/40 focus:border-green-500 focus:ring-1 focus:ring-green-500 rounded-lg text-white placeholder-emerald-700/50 transition duration-200 outline-none"
                                        placeholder="••••••••"
                                        value={data.password}
                                        onChange={(e) => setData('password', e.target.value)}
                                        required
                                    />
                                    <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-emerald-600/75">
                                        <Lock className="w-5 h-5" />
                                    </div>
                                </div>
                                {errors.password && (
                                    <p className="mt-2 text-sm text-red-500">{errors.password}</p>
                                )}
                            </div>

                            {/* Tombol Submit */}
                            <button
                                type="submit"
                                disabled={processing}
                                className="w-full mt-3 py-3 px-4 bg-emerald-500 hover:bg-emerald-400 text-[#042217] font-semibold rounded-md transition duration-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:ring-offset-[#042217] disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                                {processing ? 'Memproses...' : 'Masuk'}
                            </button>
                        </form>
                    </div>

                    {/* Status Indicator */}
                    <div className="absolute bottom-8 left-0 right-0 flex items-center justify-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                        <span className="text-xs text-emerald-600 font-medium tracking-widest">SYSTEM OPERATIONAL</span>
                    </div>
                </div>
            </div>
        </>
    );
}
