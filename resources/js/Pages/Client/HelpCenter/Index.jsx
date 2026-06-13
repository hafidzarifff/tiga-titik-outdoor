import React, { useState } from 'react';
import ClientLayout from '@/Layouts/ClientLayout';
import { Head, usePage } from '@inertiajs/react';
import { MapPin, Phone, Mail, ChevronDown } from 'lucide-react';

export default function Index({ settings }) {
    const { auth } = usePage().props;
    const faqs = settings.store_faqs || [];

    const [openFaqIndex, setOpenFaqIndex] = useState(null);

    const toggleFaq = (index) => {
        if (openFaqIndex === index) {
            setOpenFaqIndex(null);
        } else {
            setOpenFaqIndex(index);
        }
    };

    const isLoggedIn = !!auth?.user || (typeof window !== 'undefined' && !!localStorage.getItem('tto_auth_token'));

    return (
        <ClientLayout title="Pusat Bantuan" isLoggedIn={isLoggedIn} user={auth?.user}>
            <Head title="Pusat Bantuan - Tiga Titik Outdoor" />

            <div className="space-y-12 py-8 px-5 md:px-8 max-w-4xl mx-auto w-full overflow-x-hidden">

                {/* Hero Section */}
                <div className="text-center space-y-4">
                    <h1 className="text-3xl md:text-4xl font-black text-[var(--color-bg-dark)] uppercase tracking-tight">Pusat Bantuan</h1>
                    <p className="text-slate-500 max-w-xl mx-auto">Temukan jawaban atas pertanyaan Anda, pelajari aturan penyewaan kami, atau hubungi kami secara langsung jika Anda membutuhkan bantuan lebih lanjut.</p>
                </div>

                {/* Terms and Conditions */}
                <div className="bg-white rounded-[var(--radius-card)] shadow-sm border border-slate-100 p-6 md:p-8">
                    <h2 className="text-xl font-bold text-[var(--color-bg-dark)] mb-6">Aturan Penyewaan & Syarat Ketentuan</h2>
                    <div
                        className="prose prose-sm md:prose-base max-w-none text-black bg-white p-5 md:p-8 rounded-xl border border-slate-200 w-full overflow-hidden break-words whitespace-normal"
                        dangerouslySetInnerHTML={{ __html: (settings.store_terms_conditions || '').replace(/&nbsp;/g, ' ') || '<p>Belum ada syarat dan ketentuan yang ditetapkan.</p>' }}
                    />
                </div>

                {/* FAQs */}
                {faqs.length > 0 && (
                    <div className="bg-white rounded-[var(--radius-card)] shadow-sm border border-slate-100 p-6 md:p-8">
                        <h2 className="text-xl font-bold text-[var(--color-bg-dark)] mb-6">Pertanyaan yang Sering Ditanyakan</h2>
                        <div className="space-y-4">
                            {faqs.map((faq, index) => (
                                <div key={index} className="border border-slate-200 rounded-xl overflow-hidden transition-all duration-200">
                                    <button
                                        onClick={() => toggleFaq(index)}
                                        className="w-full flex items-center justify-between p-4 bg-slate-50 hover:bg-slate-100 text-left transition-colors"
                                    >
                                        <span className="font-semibold text-slate-800 text-sm md:text-base pr-4">{faq.question}</span>
                                        <ChevronDown className={`w-5 h-5 text-slate-500 shrink-0 transition-transform duration-300 ${openFaqIndex === index ? 'rotate-180' : ''}`} />
                                    </button>
                                    <div
                                        className={`overflow-hidden transition-all duration-300 ease-in-out ${openFaqIndex === index ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}
                                    >
                                        <div className="p-4 bg-white text-slate-600 text-sm leading-relaxed border-t border-slate-100">
                                            {faq.answer}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Contact Info */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                    <a href={`https://wa.me/${settings.store_phone}`} target="_blank" rel="noreferrer" className="flex flex-col items-center p-6 bg-white rounded-2xl shadow-sm border border-slate-100 hover:shadow-md hover:border-[var(--color-green-primary)] transition-all group">
                        <div className="w-12 h-12 bg-green-50 text-green-600 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                            <Phone className="w-6 h-6" />
                        </div>
                        <h3 className="font-bold text-sm text-slate-800 mb-1">WhatsApp</h3>
                        <p className="text-xs text-slate-500 text-center break-all">{settings.store_phone || '-'}</p>
                    </a>

                    <a href={`https://instagram.com/${settings.store_instagram?.replace('@', '')}`} target="_blank" rel="noreferrer" className="flex flex-col items-center p-6 bg-white rounded-2xl shadow-sm border border-slate-100 hover:shadow-md hover:border-[var(--color-green-primary)] transition-all group">
                        <div className="w-12 h-12 bg-pink-50 text-pink-600 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                                <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                            </svg>
                        </div>
                        <h3 className="font-bold text-sm text-slate-800 mb-1">Instagram</h3>
                        <p className="text-xs text-slate-500 text-center break-all">{settings.store_instagram || '-'}</p>
                    </a>

                    <a href={`mailto:${settings.store_email}`} className="flex flex-col items-center p-6 bg-white rounded-2xl shadow-sm border border-slate-100 hover:shadow-md hover:border-[var(--color-green-primary)] transition-all group">
                        <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                            <Mail className="w-6 h-6" />
                        </div>
                        <h3 className="font-bold text-sm text-slate-800 mb-1">Email</h3>
                        <p className="text-xs text-slate-500 text-center break-all">{settings.store_email || '-'}</p>
                    </a>

                    <a href={settings.store_maps_link} target="_blank" rel="noreferrer" className="flex flex-col items-center p-6 bg-white rounded-2xl shadow-sm border border-slate-100 hover:shadow-md hover:border-[var(--color-green-primary)] transition-all group">
                        <div className="w-12 h-12 bg-red-50 text-red-600 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                            <MapPin className="w-6 h-6" />
                        </div>
                        <h3 className="font-bold text-sm text-slate-800 mb-1">Lokasi Toko</h3>
                        <p className="text-xs text-slate-500 text-center line-clamp-2">{settings.store_address || '-'}</p>
                    </a>
                </div>

            </div>
        </ClientLayout>
    );
}
