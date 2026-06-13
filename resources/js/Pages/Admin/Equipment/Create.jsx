import React from 'react';
import AdminLayout from '@/Layouts/AdminLayout';

export default function Create({ equipmentId }) {
    const isEditing = !!equipmentId;

    return (
        <AdminLayout title={isEditing ? 'Edit Alat' : 'Tambah Alat'}>
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-white">
                    {isEditing ? 'Edit Alat' : 'Tambah Alat Baru'}
                </h1>
                <p className="text-sm text-slate-400 mt-1">
                    {isEditing ? 'Perbarui data peralatan kemah.' : 'Isi formulir di bawah untuk menambahkan peralatan baru.'}
                </p>
            </div>

            {/* Placeholder — form akan diisi setelah model Equipment dibuat */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-12 text-center">
                <div className="w-16 h-16 mx-auto rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                    </svg>
                </div>
                <h3 className="text-lg font-semibold text-white mb-1">Formulir Peralatan</h3>
                <p className="text-sm text-slate-500">Form input akan ditampilkan di sini.</p>
            </div>
        </AdminLayout>
    );
}
