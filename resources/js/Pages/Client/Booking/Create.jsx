import React, { useState, useEffect } from 'react';
import ClientLayout from '@/Layouts/ClientLayout';
import { Head, usePage, router } from '@inertiajs/react';
import { ShieldCheck, MapPin, Package, FileText, Upload, ChevronRight, CheckCircle2, QrCode, Download, AlertCircle, X, CreditCard, ImageIcon, Tent, CalendarClock } from 'lucide-react';
import api, { getProfile } from '@/services/api';

export default function Create({ cart, settings }) {
    const { auth } = usePage().props;

    const [userProfile, setUserProfile] = useState(auth.user || null);
    const [isQrisOpen, setIsQrisOpen] = useState(false);
    const [isTnCOpen, setIsTnCOpen] = useState(false);
    const [validationModal, setValidationModal] = useState({ isOpen: false, missingFields: [] });

    useEffect(() => {
        if (!userProfile && localStorage.getItem('tto_auth_token')) {
            getProfile()
                .then(res => setUserProfile(res.data))
                .catch(() => { });
        }
    }, []);

    const [data, setData] = useState({
        ktp: null,
        payment_proof: null,
        agree_tnc: false,
        expected_pickup_datetime: '',
        expected_return_datetime: '',
        payment_type: 'full_payment',
    });
    const [processing, setProcessing] = useState(false);
    const [errors, setErrors] = useState({});

    const getRentalDays = () => {
        if (!data.expected_pickup_datetime || !data.expected_return_datetime) return 1;
        const start = new Date(data.expected_pickup_datetime);
        const end = new Date(data.expected_return_datetime);
        if (end <= start) return 1;
        
        const diffMs = end - start;
        const diffHours = diffMs / (1000 * 60 * 60);
        const days = Math.ceil(diffHours / 24);
        return days > 0 ? days : 1;
    };

    const rentalDays = getRentalDays();
    const total = cart.reduce((acc, item) => acc + (item.price_per_day * item.qty * rentalDays), 0);
    const totalDeposit = cart.reduce((acc, item) => acc + ((item.deposit_amount || 0) * item.qty), 0);
    const amountToPay = data.payment_type === 'dp_30' ? total * 0.3 : total;

    const handleSubmit = async (e) => {
        e.preventDefault();

        let missingFields = [];
        if (!data.expected_pickup_datetime) missingFields.push('Waktu Pengambilan');
        if (!data.expected_return_datetime) missingFields.push('Waktu Pengembalian');
        if (!data.ktp) missingFields.push('Verifikasi KTP / SIM');
        if (!data.payment_proof) missingFields.push('Bukti Pembayaran');
        if (!data.agree_tnc) missingFields.push('Persetujuan Syarat & Ketentuan');

        if (missingFields.length > 0) {
            setValidationModal({ isOpen: true, missingFields: missingFields });
            if (!data.agree_tnc) {
                setErrors(prev => ({ ...prev, agree_tnc: 'Anda harus menyetujui Syarat & Ketentuan terlebih dahulu.' }));
            }
            return;
        }

        const formatDateTime = (dt) => {
            if (!dt) return '';
            return dt.replace('T', ' ') + (dt.length === 16 ? ':00' : '');
        };

        const formData = new FormData();
        formData.append('ktp', data.ktp);
        formData.append('payment_proof', data.payment_proof);
        formData.append('agree_tnc', data.agree_tnc ? '1' : '0');
        formData.append('expected_pickup_datetime', formatDateTime(data.expected_pickup_datetime));
        formData.append('expected_return_datetime', formatDateTime(data.expected_return_datetime));
        formData.append('payment_type', data.payment_type);
        formData.append('cart', JSON.stringify(cart));

        setProcessing(true);
        setErrors({});

        try {
            const response = await api.post('/client-booking', formData, {
                baseURL: '/api',
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            if (response.data.success) {
                localStorage.removeItem('tto_cart');
                router.visit(response.data.redirect);
            }
        } catch (error) {
            if (error.response && error.response.status === 422) {
                setErrors(error.response.data.errors || {});
            } else {
                alert('Terjadi kesalahan saat memproses pesanan.');
            }
        } finally {
            setProcessing(false);
        }
    };

    const handleFileChange = (e, field) => {
        if (e.target.files && e.target.files[0]) {
            setData(prev => ({ ...prev, [field]: e.target.files[0] }));
            setErrors(prev => ({ ...prev, [field]: null }));
        }
    };

    const isLoggedIn = !!auth.user || !!localStorage.getItem('tto_auth_token');

    return (
        <ClientLayout title="Konfirmasi Penyewaan" isLoggedIn={isLoggedIn} user={userProfile}>
            <Head title="Konfirmasi Penyewaan" />

            <div className="pt-6 pb-32 max-w-[800px] mx-auto w-full overflow-x-hidden">
                <form onSubmit={handleSubmit} className="space-y-6" noValidate>

                    {/* Header Card */}
                    <div className="bg-white border-2 border-[#1DD28B] rounded-[24px] md:rounded-full p-5 md:p-6 flex flex-col md:flex-row items-center justify-center md:justify-start gap-4 shadow-sm relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-[#1DD28B]/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl"></div>
                        <div className="w-12 h-12 rounded-full bg-[#1DD28B]/10 flex items-center justify-center shrink-0">
                            <ShieldCheck className="w-6 h-6 text-[#1DD28B]" strokeWidth={2.5} />
                        </div>
                        <div className="text-center md:text-left">
                            <h1 className="text-2xl md:text-3xl font-black italic uppercase tracking-tight text-[#072F1F] leading-none mb-1">
                                KONFIRMASI <span className="text-[#1DD28B]">PENYEWAAN</span>
                            </h1>
                            <p className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-slate-400">
                                PEMBAYARAN AMAN
                            </p>
                        </div>
                    </div>

                    {/* Alamat Pengiriman / Pickup */}
                    <div className="bg-white border-t-4 border-[#1DD28B] rounded-[24px] p-6 shadow-sm">
                        <div className="flex items-center gap-2 mb-4">
                            <MapPin className="w-5 h-5 text-[#1DD28B]" />
                            <h2 className="text-sm font-bold text-[#072F1F] uppercase tracking-widest">DATA PENGAMBILAN</h2>
                        </div>
                        <div className="pl-7">
                            <p className="text-sm font-bold text-slate-800 mb-1">
                                {userProfile?.name || 'Guest'} <span className="text-slate-300 font-normal mx-2">|</span> <span className="text-slate-500 font-normal">{userProfile?.customer_profile?.phone_number || '-'}</span>
                            </p>
                            <p className="text-sm text-slate-500 mb-2">
                                Pengambilan dilakukan di Toko Tiga Titik Outdoor
                            </p>
                            <div className="bg-orange-50 border border-orange-200 text-orange-600 text-xs p-3 rounded-xl flex items-start gap-2">
                                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                                <p>Harap bawa Kartu Identitas asli (KTP/SIM/Paspor) yang diunggah saat pengambilan barang untuk pemeriksaan identitas.</p>
                            </div>
                        </div>
                    </div>

                    {/* Jadwal Sewa */}
                    <div className="bg-white border border-slate-100 rounded-[24px] p-6 shadow-sm">
                        <div className="flex items-center gap-2 mb-6 border-b border-slate-100 pb-4">
                            <CalendarClock className="w-5 h-5 text-[#1DD28B]" />
                            <h2 className="text-sm font-bold text-[#072F1F] uppercase tracking-widest">JADWAL SEWA <span className="text-red-500">*</span></h2>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">WAKTU PENGAMBILAN</label>
                                <input
                                    type="datetime-local"
                                    required
                                    value={data.expected_pickup_datetime}
                                    onChange={(e) => setData(prev => ({ ...prev, expected_pickup_datetime: e.target.value }))}
                                    className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-sm rounded-xl focus:ring-[#1DD28B] focus:border-[#1DD28B] block p-3 transition-colors"
                                />
                                {errors.expected_pickup_datetime && <p className="text-red-500 text-xs mt-1">{errors.expected_pickup_datetime[0] || errors.expected_pickup_datetime}</p>}
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">WAKTU PENGEMBALIAN</label>
                                <input
                                    type="datetime-local"
                                    required
                                    value={data.expected_return_datetime}
                                    onChange={(e) => setData(prev => ({ ...prev, expected_return_datetime: e.target.value }))}
                                    className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-sm rounded-xl focus:ring-[#1DD28B] focus:border-[#1DD28B] block p-3 transition-colors"
                                />
                                {errors.expected_return_datetime && <p className="text-red-500 text-xs mt-1">{errors.expected_return_datetime[0] || errors.expected_return_datetime}</p>}
                            </div>
                        </div>
                        {data.expected_pickup_datetime && data.expected_return_datetime && (
                            <div className="mt-6 bg-[#1DD28B]/5 border border-[#1DD28B]/20 p-4 rounded-xl flex items-center justify-between">
                                <span className="text-xs font-bold text-[#072F1F] uppercase">DURASI SEWA</span>
                                <span className="text-lg font-black text-[#1DD28B]">{rentalDays} HARI</span>
                            </div>
                        )}
                    </div>

                    {/* Rincian Peralatan */}
                    <div className="bg-white border border-slate-100 rounded-[24px] p-6 shadow-sm">
                        <div className="flex items-center gap-2 mb-6 border-b border-slate-100 pb-4">
                            <Package className="w-5 h-5 text-[#1DD28B]" />
                            <h2 className="text-sm font-bold text-[#072F1F] uppercase tracking-widest">RINCIAN PERALATAN</h2>
                        </div>

                        <div className="space-y-4">
                            {cart.map((item, idx) => (
                                <div key={idx} className="flex gap-4 items-center">
                                    <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center border border-slate-100 shrink-0 p-2">
                                        {item.images && item.images.length > 0 ? (
                                            <img src={`/storage/${item.images[0].image_path}`} alt={item.name} className="w-full h-full object-contain mix-blend-multiply" />
                                        ) : (
                                            <img src="/logo.svg" className="w-14 h-14 text-slate-300" alt="Logo" />
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="text-xs md:text-sm font-bold text-slate-800 uppercase truncate mb-1">{item.name}</h3>
                                        <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold mb-1">
                                            {item.qty} UNIT <span className="mx-1 text-slate-300">•</span> {rentalDays} HARI
                                        </p>
                                        <p className="text-[#072F1F] font-black text-sm italic">
                                            Rp {Number(item.price_per_day * item.qty * rentalDays).toLocaleString('id-ID')}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="mt-6 pt-6 border-t border-slate-100 flex items-center justify-between">
                            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">TOTAL BIAYA SEWA</p>
                            <p className="text-2xl font-black text-[#1DD28B] italic">Rp {total.toLocaleString('id-ID')}</p>
                        </div>

                        {totalDeposit > 0 && (
                            <div className="mt-4 bg-amber-50 border border-amber-200 rounded-xl p-4">
                                <div className="flex items-start gap-2">
                                    <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                                    <div>
                                        <p className="text-xs font-bold text-amber-800 uppercase tracking-wider mb-1">INFORMASI UANG JAMINAN (DEPOSIT)</p>
                                        <p className="text-[11px] text-amber-700 mb-2">Deposit tidak termasuk dalam tagihan di atas. Pembayaran deposit dilakukan secara terpisah saat pengambilan barang di toko.</p>
                                        <div className="space-y-1">
                                            {cart.filter(item => (item.deposit_amount || 0) > 0).map((item, idx) => (
                                                <div key={idx} className="flex justify-between text-[11px]">
                                                    <span className="text-amber-700 truncate pr-2">{item.name} ({item.qty}x)</span>
                                                    <span className="text-amber-900 font-bold shrink-0">Rp {((item.deposit_amount || 0) * item.qty).toLocaleString('id-ID')}</span>
                                                </div>
                                            ))}
                                        </div>
                                        <div className="mt-2 pt-2 border-t border-amber-200 flex justify-between text-xs">
                                            <span className="font-bold text-amber-800">Total Deposit</span>
                                            <span className="font-black text-amber-900">Rp {totalDeposit.toLocaleString('id-ID')}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Pilihan Metode Bayar */}
                        <div className="mt-6 pt-6 border-t border-slate-100">
                            <p className="text-xs font-bold text-[#072F1F] uppercase tracking-widest mb-4">PILIHAN PEMBAYARAN</p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <label className={`cursor-pointer border-2 rounded-2xl p-4 transition-all flex items-start gap-3 ${data.payment_type === 'full_payment' ? 'border-[#1DD28B] bg-[#1DD28B]/5 shadow-sm' : 'border-slate-200 bg-white hover:border-[#1DD28B]/50'}`}>
                                    <div className="mt-0.5">
                                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${data.payment_type === 'full_payment' ? 'border-[#1DD28B]' : 'border-slate-300'}`}>
                                            {data.payment_type === 'full_payment' && <div className="w-2.5 h-2.5 bg-[#1DD28B] rounded-full"></div>}
                                        </div>
                                    </div>
                                    <div>
                                        <p className="font-bold text-slate-900 text-sm mb-1 uppercase tracking-wider">PELUNASAN PENUH</p>
                                        <p className="text-[#072F1F] font-black italic">Rp {total.toLocaleString('id-ID')}</p>
                                    </div>
                                    <input type="radio" name="payment_type" value="full_payment" className="hidden" checked={data.payment_type === 'full_payment'} onChange={(e) => setData(prev => ({ ...prev, payment_type: e.target.value }))} />
                                </label>
                                
                                <label className={`cursor-pointer border-2 rounded-2xl p-4 transition-all flex items-start gap-3 ${data.payment_type === 'dp_30' ? 'border-[#1DD28B] bg-[#1DD28B]/5 shadow-sm' : 'border-slate-200 bg-white hover:border-[#1DD28B]/50'}`}>
                                    <div className="mt-0.5">
                                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${data.payment_type === 'dp_30' ? 'border-[#1DD28B]' : 'border-slate-300'}`}>
                                            {data.payment_type === 'dp_30' && <div className="w-2.5 h-2.5 bg-[#1DD28B] rounded-full"></div>}
                                        </div>
                                    </div>
                                    <div>
                                        <p className="font-bold text-slate-900 text-sm mb-1 uppercase tracking-wider">DP 30% BOOKING</p>
                                        <p className="text-[#072F1F] font-black italic">Rp {(total * 0.3).toLocaleString('id-ID')}</p>
                                    </div>
                                    <input type="radio" name="payment_type" value="dp_30" className="hidden" checked={data.payment_type === 'dp_30'} onChange={(e) => setData(prev => ({ ...prev, payment_type: e.target.value }))} />
                                </label>
                            </div>
                        </div>
                    </div>

                    {/* Dokumen Wajib & Pembayaran */}
                    <div className="bg-white border border-slate-100 rounded-[24px] p-6 shadow-sm">
                        <div className="flex items-center gap-2 mb-6">
                            <FileText className="w-5 h-5 text-[#1DD28B]" />
                            <h2 className="text-sm font-bold text-[#072F1F] uppercase tracking-widest">DOKUMEN & PEMBAYARAN <span className="text-red-500">*</span></h2>
                        </div>

                        <div className="space-y-4">
                            {/* Upload KTP */}
                            <div>
                                <label className="flex items-center justify-between p-4 bg-slate-50 border border-slate-200 rounded-2xl hover:bg-slate-100 transition-colors cursor-pointer group">
                                    <div className="flex items-center gap-4">
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-colors ${data.ktp ? 'bg-[#1DD28B]/20 text-[#1DD28B]' : 'bg-white text-slate-400 group-hover:text-[#1DD28B] border border-slate-200'}`}>
                                            {data.ktp ? <CheckCircle2 className="w-5 h-5" /> : <Upload className="w-5 h-5" />}
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-0.5">VERIFIKASI KTP / SIM <span className="text-red-500">*</span></p>
                                            <p className="text-[10px] text-slate-500">{data.ktp ? data.ktp.name : 'Format JPG/PNG max 2MB'}</p>
                                        </div>
                                    </div>
                                    <ChevronRight className="w-5 h-5 text-slate-300" />
                                    <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileChange(e, 'ktp')} required />
                                </label>
                                {errors.ktp && <p className="text-red-500 text-xs mt-1 ml-2">{errors.ktp[0] || errors.ktp}</p>}
                            </div>

                            {/* Tombol QRIS */}
                            <div className="bg-[#1DD28B]/5 border border-[#1DD28B]/20 rounded-2xl p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                                <div>
                                    <p className="text-xs font-bold text-[#072F1F] uppercase tracking-wider mb-1">METODE PEMBAYARAN: QRIS</p>
                                    <p className="text-[10px] text-slate-500">Silakan scan kode QRIS untuk melakukan pembayaran.</p>
                                </div>
                                <button type="button" onClick={() => setIsQrisOpen(true)} className="w-full md:w-auto bg-[#072F1F] text-white px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-[#0a452d] transition-colors flex items-center justify-center gap-2">
                                    <QrCode className="w-4 h-4" />
                                    TAMPILKAN QRIS
                                </button>
                            </div>

                            {/* Upload Bukti Pembayaran */}
                            <div>
                                <label className="flex items-center justify-between p-4 bg-slate-50 border border-slate-200 rounded-2xl hover:bg-slate-100 transition-colors cursor-pointer group">
                                    <div className="flex items-center gap-4">
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-colors ${data.payment_proof ? 'bg-[#1DD28B]/20 text-[#1DD28B]' : 'bg-white text-slate-400 group-hover:text-[#1DD28B] border border-slate-200'}`}>
                                            {data.payment_proof ? <CheckCircle2 className="w-5 h-5" /> : <Upload className="w-5 h-5" />}
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-0.5">BUKTI PEMBAYARAN <span className="text-red-500">*</span></p>
                                            <p className="text-[10px] text-slate-500">{data.payment_proof ? data.payment_proof.name : 'Format JPG/PNG max 2MB'}</p>
                                        </div>
                                    </div>
                                    <ChevronRight className="w-5 h-5 text-slate-300" />
                                    <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileChange(e, 'payment_proof')} required />
                                </label>
                                {errors.payment_proof && <p className="text-red-500 text-xs mt-1 ml-2">{errors.payment_proof[0] || errors.payment_proof}</p>}
                            </div>
                        </div>
                    </div>

                    {/* S&K dan Submit */}
                    <div className="bg-[#072F1F] rounded-[32px] p-6 md:p-8 shadow-xl mt-8">
                        <label className="flex items-start gap-4 cursor-pointer group mb-8">
                            <div className="relative flex items-center justify-center mt-0.5">
                                <input
                                    type="checkbox"
                                    className="peer sr-only"
                                    checked={data.agree_tnc}
                                    onChange={(e) => setData(prev => ({ ...prev, agree_tnc: e.target.checked }))}
                                />
                                <div className="w-6 h-6 rounded-lg border-2 border-slate-500 peer-checked:border-[#1DD28B] peer-checked:bg-[#1DD28B] transition-all flex items-center justify-center">
                                    <CheckCircle2 className={`w-4 h-4 text-[#072F1F] transition-transform ${data.agree_tnc ? 'scale-100 opacity-100' : 'scale-0 opacity-0'}`} strokeWidth={3} />
                                </div>
                            </div>
                            <div className="flex-1">
                                <p className="text-sm text-slate-300 leading-relaxed">
                                    Saya telah membaca, memahami, dan menyetujui <button type="button" onClick={() => setIsTnCOpen(true)} className="text-[#1DD28B] font-bold hover:underline">Syarat & Ketentuan</button> penyewaan perlengkapan outdoor di Tiga Titik Outdoor.
                                </p>
                                {errors.agree_tnc && <p className="text-red-400 text-xs mt-1">{errors.agree_tnc[0] || errors.agree_tnc}</p>}
                            </div>
                        </label>

                        <button
                            type="submit"
                            disabled={processing}
                            className={`w-full h-14 font-black text-sm tracking-widest uppercase rounded-2xl flex items-center justify-center gap-3 transition-all ${processing 
                                ? 'bg-slate-700 text-slate-400 cursor-wait'
                                : 'bg-[#1DD28B] hover:bg-[#15b879] text-[#072F1F] shadow-lg shadow-[#1DD28B]/20 hover:-translate-y-1'
                                }`}
                        >
                            <CreditCard className="w-5 h-5" strokeWidth={2.5} />
                            {processing ? 'MEMPROSES...' : 'SELESAIKAN PENYEWAAN'}
                        </button>
                    </div>
                </form>
            </div>

            {/* Popup QRIS */}
            <div className={`fixed inset-0 z-[100] flex items-center justify-center transition-all duration-300 px-4 ${isQrisOpen ? 'visible opacity-100' : 'invisible opacity-0'}`}>
                <div className="absolute inset-0 bg-[#072F1F]/80 backdrop-blur-sm" onClick={() => setIsQrisOpen(false)}></div>
                <div className={`bg-white rounded-[32px] w-full max-w-sm overflow-hidden relative shadow-2xl transition-transform duration-300 ${isQrisOpen ? 'scale-100 translate-y-0' : 'scale-95 translate-y-10'}`}>
                    <div className="p-6 bg-[#1DD28B] flex items-center justify-between text-[#072F1F]">
                        <h3 className="font-black italic text-xl uppercase tracking-tight">PEMBAYARAN QRIS</h3>
                        <button onClick={() => setIsQrisOpen(false)} className="bg-white/20 hover:bg-white/40 p-2 rounded-full transition-colors">
                            <X className="w-5 h-5" strokeWidth={3} />
                        </button>
                    </div>
                    <div className="p-8 text-center flex flex-col items-center">
                        <p className="text-sm text-slate-500 mb-6 font-medium">Scan QR Code di bawah ini menggunakan aplikasi m-Banking atau e-Wallet Anda.</p>

                        <div className="w-64 h-64 bg-slate-100 rounded-3xl mb-6 flex flex-col items-center justify-center border-4 border-[#1DD28B]/20 border-dashed relative overflow-hidden group">
                            {settings?.store_qris ? (
                                <img src={`/storage/${settings.store_qris}`} alt="QRIS Tiga Titik Outdoor" className="w-full h-full object-contain p-2 group-hover:scale-105 transition-transform duration-500" />
                            ) : (
                                <QrCode className="w-32 h-32 text-slate-300 group-hover:scale-110 transition-transform duration-500" strokeWidth={1} />
                            )}
                            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/50 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
                        </div>

                        <h4 className="text-2xl font-black text-[#072F1F] italic mb-1">Rp {amountToPay.toLocaleString('id-ID')}</h4>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-8">A.N TIGA TITIK OUTDOOR</p>

                        {settings?.store_qris ? (
                            <a href={`/storage/${settings.store_qris}`} download="QRIS-TigaTitikOutdoor" className="w-full bg-[#072F1F] text-white py-4 rounded-2xl text-xs font-bold uppercase tracking-widest hover:bg-[#0a452d] transition-colors flex items-center justify-center gap-2">
                                <Download className="w-4 h-4" />
                                DOWNLOAD QRIS
                            </a>
                        ) : (
                            <button disabled className="w-full bg-slate-200 text-slate-400 py-4 rounded-2xl text-xs font-bold uppercase tracking-widest cursor-not-allowed flex items-center justify-center gap-2">
                                <Download className="w-4 h-4" />
                                QRIS BELUM TERSEDIA
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Popup Syarat & Ketentuan */}
            <div className={`fixed inset-0 z-[100] flex items-center justify-center transition-all duration-300 px-4 py-10 ${isTnCOpen ? 'visible opacity-100' : 'invisible opacity-0'}`}>
                <div className="absolute inset-0 bg-[#072F1F]/80 backdrop-blur-sm" onClick={() => setIsTnCOpen(false)}></div>
                <div className={`bg-white rounded-[32px] w-full max-w-2xl max-h-full flex flex-col relative shadow-2xl transition-transform duration-300 ${isTnCOpen ? 'scale-100' : 'scale-95'}`}>
                    <div className="p-6 md:p-8 border-b border-slate-100 flex items-center justify-between shrink-0">
                        <div className="flex items-center gap-3">
                            <FileText className="w-6 h-6 text-[#1DD28B]" strokeWidth={2.5} />
                            <h3 className="font-black italic text-xl uppercase tracking-tight text-[#072F1F]">SYARAT & KETENTUAN</h3>
                        </div>
                        <button onClick={() => setIsTnCOpen(false)} className="bg-slate-100 hover:bg-slate-200 text-slate-500 p-2 rounded-full transition-colors">
                            <X className="w-5 h-5" strokeWidth={3} />
                        </button>
                    </div>

                    <div className="p-6 md:p-8 overflow-y-auto overflow-x-hidden text-sm text-slate-600 leading-relaxed space-y-6 flex-1 w-full">
                        {settings?.store_terms_conditions ? (
                            <div className="prose prose-sm max-w-none w-full break-words whitespace-normal text-slate-600 prose-headings:text-slate-800 prose-a:text-[#1DD28B] [&_*]:whitespace-normal" dangerouslySetInnerHTML={{ __html: settings.store_terms_conditions }} />
                        ) : (
                            <>
                                <div>
                                    <h4 className="font-bold text-slate-800 uppercase mb-2">1. Dokumen Jaminan</h4>
                                    <p>Penyewa wajib menitipkan kartu identitas asli (KTP/SIM/Paspor) yang masih berlaku sebagai jaminan selama masa penyewaan. Identitas yang dititipkan harus sesuai dengan yang diunggah pada saat pemesanan.</p>
                                </div>
                                <div>
                                    <h4 className="font-bold text-slate-800 uppercase mb-2">2. Waktu Pengambilan & Pengembalian</h4>
                                    <p>Pengambilan dan pengembalian alat dilakukan di toko Tiga Titik Outdoor sesuai dengan jam operasional. Keterlambatan pengembalian akan dikenakan denda sesuai dengan tarif yang berlaku per item per jam keterlambatan.</p>
                                </div>
                                <div>
                                    <h4 className="font-bold text-slate-800 uppercase mb-2">3. Kerusakan & Kehilangan</h4>
                                    <p>Segala bentuk kerusakan (robek, patah, terbakar, dll) maupun kehilangan perlengkapan selama masa sewa menjadi tanggung jawab penuh penyewa. Biaya perbaikan atau penggantian barang akan ditagihkan kepada penyewa sesuai dengan harga pasar barang tersebut.</p>
                                </div>
                                <div>
                                    <h4 className="font-bold text-slate-800 uppercase mb-2">4. Kebersihan</h4>
                                    <p>Peralatan disewakan dalam kondisi bersih dan harus dikembalikan dalam kondisi bersih pula (terutama tenda, alat masak, dan sepatu). Pengembalian alat dalam kondisi kotor ekstrim akan dikenakan biaya tambahan pembersihan.</p>
                                </div>
                                <div>
                                    <h4 className="font-bold text-slate-800 uppercase mb-2">5. Pembatalan</h4>
                                    <p>Pembatalan yang dilakukan kurang dari 24 jam sebelum waktu pengambilan akan menyebabkan uang pembayaran / DP hangus (tidak dapat dikembalikan).</p>
                                </div>
                            </>
                        )}
                    </div>

                    <div className="p-6 border-t border-slate-100 shrink-0">
                        <button onClick={() => setIsTnCOpen(false)} className="w-full bg-[#1DD28B] text-[#072F1F] py-4 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-[#15b879] transition-colors">
                            SAYA MENGERTI
                        </button>
                    </div>
                </div>
            </div>

            {/* Popup Validasi */}
            <div className={`fixed inset-0 z-[100] flex items-center justify-center transition-all duration-300 px-4 ${validationModal.isOpen ? 'visible opacity-100' : 'invisible opacity-0'}`}>
                <div className="absolute inset-0 bg-[#072F1F]/80 backdrop-blur-sm" onClick={() => setValidationModal({ isOpen: false, missingFields: [] })}></div>
                <div className={`bg-white rounded-[32px] w-full max-w-sm overflow-hidden relative shadow-2xl transition-transform duration-300 ${validationModal.isOpen ? 'scale-100 translate-y-0' : 'scale-95 translate-y-10'}`}>
                    <div className="p-6 bg-red-50 flex items-center gap-4 text-red-600 border-b border-red-100">
                        <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center shrink-0">
                            <AlertCircle className="w-6 h-6 text-red-500" strokeWidth={2.5} />
                        </div>
                        <h3 className="font-black italic text-lg uppercase tracking-tight">DATA BELUM LENGKAP</h3>
                    </div>
                    <div className="p-6">
                        <p className="text-sm text-slate-600 mb-4">Harap lengkapi data berikut sebelum melanjutkan penyewaan:</p>
                        <ul className="space-y-2 mb-6">
                            {validationModal.missingFields.map((field, idx) => (
                                <li key={idx} className="flex items-start gap-2 text-sm text-slate-700 font-bold">
                                    <div className="w-1.5 h-1.5 rounded-full bg-red-500 mt-1.5 shrink-0"></div>
                                    {field}
                                </li>
                            ))}
                        </ul>
                        <button onClick={() => setValidationModal({ isOpen: false, missingFields: [] })} className="w-full bg-slate-100 text-slate-700 py-3 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-slate-200 transition-colors">
                            KEMBALI & LENGKAPI
                        </button>
                    </div>
                </div>
            </div>
        </ClientLayout>
    );
}
