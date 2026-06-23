import React, { useState } from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import LoginModal from '../Components/LoginModal';
import { getProfile } from '../services/api';
import { LayoutDashboard, LayoutGrid, ShoppingCart, Clock, User, LogOut, Bell, Search, Tent, ChevronUp, Menu, X, HelpCircle } from 'lucide-react';

export default function ClientLayout({ children, cartCount = 0, isLoggedIn, user: initialUser, onLogout, title }) {
    const { url } = usePage();
    const [isLoginModalOpen, setLoginModalOpen] = useState(false);
    const [user, setUser] = useState(initialUser);
    const [showScrollTop, setShowScrollTop] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [showHelpTooltip, setShowHelpTooltip] = useState(false);

    const [localCartCount, setLocalCartCount] = useState(() => {
        if (cartCount > 0) return cartCount;
        try {
            if (typeof window !== 'undefined') {
                const saved = localStorage.getItem('tto_cart');
                const parsed = saved ? JSON.parse(saved) : [];
                return Array.isArray(parsed) ? parsed.reduce((acc, item) => acc + (item.qty || 0), 0) : 0;
            }
        } catch (e) {}
        return 0;
    });

    React.useEffect(() => {
        if (cartCount !== undefined && cartCount > 0) {
            setLocalCartCount(cartCount);
        }
    }, [cartCount]);

    React.useEffect(() => {
        if (isLoggedIn && !user) {
            getProfile()
                .then(res => {
                    setUser(res.data);
                })
                .catch(err => {
                    console.error('Failed to fetch profile', err);
                    if (err.response?.status === 401) {
                        localStorage.removeItem('tto_auth_token');
                        window.location.reload();
                    }
                });
        }

        if (isLoggedIn && !localStorage.getItem('tto_help_tooltip_dismissed')) {
            setShowHelpTooltip(true);
        }
    }, [isLoggedIn, user, initialUser]);

    React.useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY > 300) {
                setShowScrollTop(true);
            } else {
                setShowScrollTop(false);
            }
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const navItems = [
        { label: 'Dashboard', href: '/', icon: <LayoutDashboard className="w-5 h-5" /> },
        { label: 'Katalog Alat', href: '/catalog', icon: <LayoutGrid className="w-5 h-5" /> },
        { label: 'Keranjang', href: '/cart', badge: true, icon: <ShoppingCart className="w-5 h-5" /> },
        { label: 'Riwayat Sewa', href: '/booking', requiresAuth: true, icon: <Clock className="w-5 h-5" /> },
        { label: 'Profil Saya', href: '/profile', isProfile: true, requiresAuth: true, icon: <User className="w-5 h-5" /> },
        { label: 'Pusat Bantuan', href: '/bantuan', icon: <HelpCircle className="w-5 h-5" /> },
    ];

    const isActive = (href) => href === '/' ? url === '/' : url.startsWith(href);

    const handleProfileClick = (e, item) => {
        if (item.isProfile) {
            if (!isLoggedIn) {
                e.preventDefault();
                setLoginModalOpen(true);
            }
            // If logged in, we let the Link component do its job naturally to '/profile'
        }
    };

    const handleLogoutClick = (e) => {
        e.preventDefault();
        if (onLogout) onLogout();
        else {
            localStorage.removeItem('tto_auth_token');
            window.location.href = '/login';
        }
    };

    const dismissHelpTooltip = () => {
        localStorage.setItem('tto_help_tooltip_dismissed', 'true');
        setShowHelpTooltip(false);
    };

    return (
        <>
            <Head title={title} />
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Poppins:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,400;1,500;1,600;1,700;1,800;1,900&display=swap');
                
                :root {
                    --color-bg-dark: #072F1F;
                    --color-green-primary: #1DD28B;
                    --color-green-accent: #19B677;
                    --color-white: #FFFFFF;
                    --color-gray-bg: #F8F9FA;
                    --color-text-muted: #9CA3AF;
                    --radius-card: 24px;
                    --radius-button: 12px;
                }
                body {
                    overflow-x: hidden;
                    background-color: var(--color-gray-bg);
                    font-family: 'Poppins', sans-serif;
                }
                @keyframes float-right {
                    0%, 100% { transform: translate(0, -50%); }
                    50% { transform: translate(6px, -50%); }
                }
                .animate-float-right {
                    animation: float-right 3s ease-in-out infinite;
                }
                @keyframes float-left {
                    0%, 100% { transform: translate(0, -50%); }
                    50% { transform: translate(-6px, -50%); }
                }
                .animate-float-left {
                    animation: float-left 3s ease-in-out infinite;
                }
                @keyframes float-down {
                    0%, 100% { transform: translate(0, 0); }
                    50% { transform: translate(0, 6px); }
                }
                .animate-float-down {
                    animation: float-down 3s ease-in-out infinite;
                }
            `}</style>

            <div className="flex min-h-screen">
                {/* Desktop Sidebar */}
                <aside className="hidden md:flex flex-col w-[260px] fixed inset-y-0 left-0 text-white z-50" style={{ backgroundColor: 'var(--color-bg-dark)' }}>
                    <div className="p-8 flex items-center gap-3">
                        <div className="w-10 h-10 bg-[var(--color-green-primary)] rounded-[10px] flex items-center justify-center text-white">
                            <img src="/logo.svg" className="w-14 h-14" alt="Logo" />
                        </div>
                        <h1 className="font-bold text-sm tracking-widest leading-tight uppercase">TIGA TITIK<br />OUTDOOR</h1>
                    </div>

                    <div className="px-8 mt-4 mb-2">
                        <span className="text-[10px] font-bold tracking-widest text-[#1DD28B]/60">MENU UTAMA</span>
                    </div>

                    <nav className="flex-1 px-4 space-y-2">
                        {navItems.filter(item => !item.requiresAuth || isLoggedIn).map(item => {
                            const active = isActive(item.href);
                            return (
                                <div key={item.label} className="relative">
                                    <Link
                                        href={item.isProfile && !isLoggedIn ? '/login' : item.href}
                                        onClick={(e) => handleProfileClick(e, item)}
                                        className={`flex items-center gap-4 px-4 py-3.5 rounded-[var(--radius-button)] transition-all font-medium text-sm ${active
                                            ? 'bg-[var(--color-green-primary)] text-white shadow-lg shadow-[var(--color-green-primary)]/20'
                                            : 'text-white/60 hover:bg-white/5 hover:text-white'
                                            }`}
                                    >
                                        <div className={`${active ? 'text-white' : 'text-white/60'}`}>{item.icon}</div>
                                        <span>{item.label}</span>
                                        {item.badge && localCartCount > 0 && (
                                            <span className="ml-auto bg-white/20 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                                                {localCartCount}
                                            </span>
                                        )}
                                    </Link>
                                    {item.href === '/bantuan' && showHelpTooltip && (
                                        <div className="absolute left-full top-1/2 ml-5 w-64 bg-white rounded-xl shadow-[0_0_20px_rgba(29,210,139,0.4)] border-2 border-[var(--color-green-primary)] p-4 z-[60] animate-float-right">
                                            {/* Arrow pointer */}
                                            <div className="absolute -left-[9px] top-1/2 -translate-y-1/2 w-4 h-4 bg-white border-l-2 border-b-2 border-[var(--color-green-primary)] rotate-45"></div>
                                            
                                            <h4 className="font-bold text-emerald-800 text-sm mb-1 flex items-center gap-1.5 relative z-10"><span className="w-4 h-4 flex items-center justify-center font-black"> <HelpCircle className="w-4 h-4 text-[var(--color-green-primary)]" /> </span> Wajib Dibaca!</h4>
                                            <p className="text-xs text-slate-600 mb-3 leading-relaxed relative z-10">Ketahui Aturan Penyewaan & Syarat Ketentuan di sini agar tidak terjadi kesalahpahaman.</p>
                                            <button onClick={dismissHelpTooltip} className="w-full py-2 bg-emerald-600 text-white text-xs font-bold rounded-lg hover:bg-emerald-700 transition-colors relative z-10">Mengerti</button>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </nav>

                    <div className="p-6 mt-auto">
                        {isLoggedIn ? (
                            <button onClick={handleLogoutClick} className="flex items-center gap-4 px-4 py-3 text-white/60 hover:text-white transition-colors w-full text-sm font-medium bg-red-500/70 rounded-[var(--radius-button)]">
                                <LogOut className="w-5 h-5 bg-" />
                                <span>Logout</span>
                            </button>
                        ) : (
                            <button onClick={() => setLoginModalOpen(true)} className="flex items-center gap-4 px-4 py-3 text-white/60 hover:text-white transition-colors w-full text-sm font-medium">
                                <User className="w-5 h-5" />
                                <span>Login</span>
                            </button>
                        )}
                    </div>
                </aside>

                {/* Main Content Area */}
                <div className="flex-1 md:ml-[260px] pb-0 flex flex-col min-h-screen relative z-10">
                    {/* Dark Overlay when Tooltip is active */}
                    {showHelpTooltip && (
                        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm z-[45] transition-opacity duration-500"></div>
                    )}

                    {/* Top Navbar */}
                    <header className="hidden md:flex h-[90px] items-center justify-between px-10 bg-transparent">
                        <div className="flex-1 max-w-2xl">
                        </div>

                        <div className="flex items-center gap-6 ml-8">
                            <div className="flex items-center gap-4">
                                <div className="text-right hidden lg:block">
                                    <p className="text-sm font-bold text-green-900 leading-tight">
                                        {isLoggedIn ? user?.name : 'Tamu'}
                                    </p>
                                    <p className="text-[10px] font-bold text-[var(--color-green-primary)] tracking-wide uppercase mt-0.5">
                                        {isLoggedIn ? 'Member' : 'Belum Login'}
                                    </p>
                                </div>
                                <div className="w-11 h-11 rounded-full border-2 border-[var(--color-green-primary)] flex items-center justify-center bg-white text-[var(--color-green-primary)] shadow-sm cursor-pointer" onClick={() => !isLoggedIn && setLoginModalOpen(true)}>
                                    <User className="w-5 h-5" />
                                </div>
                            </div>
                        </div>
                    </header>

                    {/* Mobile Header (Simplified) */}
                    <header className="md:hidden h-[60px] bg-white flex items-center justify-between px-5 sticky top-0 z-50 shadow-sm">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-[var(--color-green-primary)] rounded-lg flex items-center justify-center text-white">
                                <img src="/logo.svg" className="w-12 h-12" alt="Logo" />
                            </div>
                            <span className="font-bold text-[13px] text-[var(--color-bg-dark)]">TIGA TITIK</span>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="relative z-[60]">
                                <Link href="/bantuan" className="text-[var(--color-bg-dark)] p-1 flex">
                                    <HelpCircle className="w-6 h-6" />
                                </Link>
                                {showHelpTooltip && (
                                    <div className="absolute right-0 top-full mt-3 w-56 bg-white rounded-xl shadow-[0_0_20px_rgba(29,210,139,0.4)] border-2 border-[var(--color-green-primary)] p-4 z-[60] animate-float-down">
                                        {/* Arrow pointer pointing up */}
                                        <div className="absolute right-2 -top-[9px] w-4 h-4 bg-white border-l-2 border-t-2 border-[var(--color-green-primary)] rotate-45"></div>
                                        
                                        <h4 className="font-bold text-emerald-800 text-sm mb-1 flex items-center gap-1.5 relative z-10"><span className="w-4 h-4 flex items-center justify-center font-black"> <HelpCircle className="w-4 h-4 text-[var(--color-green-primary)]" /> </span> Wajib Dibaca!</h4>
                                        <p className="text-[11px] text-slate-600 mb-3 leading-relaxed relative z-10">Ketahui Aturan Penyewaan & Syarat Ketentuan di sini.</p>
                                        <button onClick={dismissHelpTooltip} className="w-full py-1.5 bg-emerald-600 text-white text-xs font-bold rounded-lg hover:bg-emerald-700 transition-colors relative z-10">Mengerti</button>
                                    </div>
                                )}
                            </div>
                            <Link href="/cart" className="relative text-[var(--color-bg-dark)] p-1">
                                <ShoppingCart className="w-6 h-6" />
                                {localCartCount > 0 && (
                                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center border-2 border-white">
                                        {localCartCount}
                                    </span>
                                )}
                            </Link>
                            <button
                                onClick={() => setIsMobileMenuOpen(true)}
                                className="text-[var(--color-bg-dark)] p-1"
                            >
                                <Menu className="w-7 h-7" />
                            </button>
                        </div>
                    </header>

                    {/* Mobile Sidebar Overlay */}
                    <div className={`md:hidden fixed inset-0 z-[70] transition-all duration-300 ${isMobileMenuOpen ? 'visible' : 'invisible'}`}>
                        {/* Backdrop */}
                        <div
                            className={`absolute inset-0 bg-black/50 transition-opacity duration-300 ${isMobileMenuOpen ? 'opacity-100' : 'opacity-0'}`}
                            onClick={() => setIsMobileMenuOpen(false)}
                        ></div>

                        {/* Sidebar */}
                        <div className={`absolute top-0 right-0 w-[280px] h-full bg-[#072F1F] shadow-2xl transition-transform duration-300 transform flex flex-col ${isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}>
                            <div className="p-6 flex items-center justify-between border-b border-white/10">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 bg-[var(--color-green-primary)] rounded-lg flex items-center justify-center text-white">
                                        <img src="/logo.svg" className="w-12 h-12" alt="Logo" />
                                    </div>
                                    <span className="font-bold text-sm text-white tracking-widest uppercase">MENU</span>
                                </div>
                                <button onClick={() => setIsMobileMenuOpen(false)} className="text-white/60 hover:text-white p-1">
                                    <X className="w-6 h-6" />
                                </button>
                            </div>

                            <div className="flex-1 overflow-y-auto py-6 px-4 space-y-2">
                                {navItems.filter(item => !item.requiresAuth || isLoggedIn).map(item => {
                                    const active = isActive(item.href);
                                    return (
                                        <div key={item.label} className="relative">
                                            <Link
                                                href={item.isProfile && !isLoggedIn ? '/login' : item.href}
                                                onClick={(e) => {
                                                    handleProfileClick(e, item);
                                                    if (!item.isProfile || isLoggedIn) setIsMobileMenuOpen(false);
                                                }}
                                                className={`flex items-center gap-4 px-4 py-4 rounded-2xl transition-all font-bold text-sm ${active
                                                    ? 'bg-[var(--color-green-primary)] text-white shadow-lg shadow-[var(--color-green-primary)]/20'
                                                    : 'text-white/70 hover:bg-white/10 hover:text-white'
                                                    }`}
                                            >
                                                <div className={`${active ? 'text-white' : 'text-white/60'}`}>{item.icon}</div>
                                                <span>{item.label}</span>
                                                {item.badge && localCartCount > 0 && (
                                                    <span className="ml-auto bg-white/20 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                                                        {localCartCount}
                                                    </span>
                                                )}
                                            </Link>
                                        </div>
                                    );
                                })}
                            </div>

                            <div className="p-6 border-t border-white/10">
                                {isLoggedIn ? (
                                    <div className="flex flex-col gap-4">
                                        <div className="flex items-center gap-3 px-2">
                                            <div className="w-10 h-10 rounded-full border-2 border-[var(--color-green-primary)] flex items-center justify-center text-[var(--color-green-primary)] font-bold bg-white">
                                                {user?.name?.charAt?.(0) || 'U'}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-bold text-white truncate">{user?.name}</p>
                                                <p className="text-[10px] text-[var(--color-green-primary)] uppercase tracking-widest font-bold">Member</p>
                                            </div>
                                        </div>
                                        <button onClick={handleLogoutClick} className="flex items-center justify-center gap-3 w-full py-3.5 bg-red-500/20 hover:bg-red-500/40 text-red-400 font-bold rounded-xl transition-colors">
                                            <LogOut className="w-4 h-4" />
                                            Logout
                                        </button>
                                    </div>
                                ) : (
                                    <button onClick={() => { setIsMobileMenuOpen(false); setLoginModalOpen(true); }} className="flex items-center justify-center gap-3 w-full py-3.5 bg-[var(--color-green-primary)] hover:bg-[var(--color-green-accent)] text-[#072F1F] font-black rounded-xl transition-colors uppercase tracking-widest text-xs">
                                        <User className="w-4 h-4" />
                                        Login / Daftar
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>

                    <main className="w-full max-w-[1400px] mx-auto px-5 md:px-10 pb-10">
                        {children}
                    </main>
                </div>
            </div>

            <LoginModal
                isOpen={isLoginModalOpen}
                onClose={() => setLoginModalOpen(false)}
                onSuccess={() => {
                    setLoginModalOpen(false);
                    window.location.reload();
                }}
            />

            {/* Scroll To Top Button */}
            <button
                onClick={scrollToTop}
                className={`fixed right-5 md:right-8 bottom-[80px] md:bottom-8 z-50 p-3 bg-[#072F1F] text-white rounded-full shadow-xl shadow-[#072F1F]/20 transition-all duration-300 transform ${showScrollTop ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0 pointer-events-none'}`}
                aria-label="Scroll to top"
            >
                <ChevronUp className="w-5 h-5 md:w-6 md:h-6" strokeWidth={2.5} />
            </button>
        </>
    );
}
