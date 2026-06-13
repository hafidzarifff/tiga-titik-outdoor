import React, { useState } from 'react';
import TextInput from './TextInput';
import { login } from '../services/api';
import { router } from '@inertiajs/react';
import { User, Lock, ArrowRight, X } from 'lucide-react';

export default function LoginModal({ isOpen, onClose, onSuccess }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const { data } = await login({ email, password });
            if (data.access_token) {
                localStorage.setItem('tto_auth_token', data.access_token);
                if (onSuccess) onSuccess();
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Login gagal, periksa kredensial Anda.');
        } finally {
            setLoading(false);
        }
    };

    const handleRegisterClick = () => {
        onClose();
        router.visit('/register');
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose}></div>
            
            <div className="relative w-full max-w-[420px] bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] p-10 overflow-hidden animate-in fade-in zoom-in duration-200">
                <button 
                    onClick={onClose}
                    className="absolute top-5 right-5 w-8 h-8 flex items-center justify-center bg-slate-100 hover:bg-slate-200 text-slate-500 rounded-full transition-colors"
                >
                    <X className="w-4 h-4" />
                </button>

                <div className="text-center mb-8">
                    <h2 className="text-[#0f172a] text-2xl font-black italic uppercase tracking-wide">SELAMAT DATANG</h2>
                    <p className="text-slate-400 text-[13px] mt-1.5">Masuk untuk melanjutkan proses sewa.</p>
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

                    <div className="pt-2">
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
                    </div>
                </form>
                
                <div className="mt-8 text-center text-[13px]">
                    <span className="text-slate-400">Belum memiliki akun? </span>
                    <button onClick={handleRegisterClick} className="text-[#0B402B] font-bold italic hover:underline">
                        Daftar Sekarang
                    </button>
                </div>
            </div>
        </div>
    );
}
