'use client';

import React, { useEffect, useState } from 'react';
import {
    Search,
    User,
    ArrowUpDown,
    UserMinus,
    Plus,
    FileText,
    ChevronLeft,
    ChevronRight,
    Loader2,
    CheckCircle,
    UserX,
    UserCheck
} from 'lucide-react';
import Link from "next/link";
import { Poppins } from 'next/font/google';
import { supabase } from '@/lib/supabase';
import ModalConfirm from '@/lib/components/ModalConfirm';

const poppins = Poppins({
    subsets: ['latin'],
    weight: ['400', '500', '600', '700'],
    variable: '--font-poppins',
});

export default function DashboardPage() {
    const [dataUsers, setDataUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [userName, setUserName] = useState('');

    const [modalConfig, setModalConfig] = useState<{
        isOpen: boolean;
        id: string | null;
        currentStatus: boolean;
    }>({ isOpen: false, id: null, currentStatus: false });

    const [actionLoading, setActionLoading] = useState(false);


    const fetchData = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setDataUsers(data || []);
        } catch (error: any) {
            console.error("Detail Error:", JSON.stringify(error, null, 2));
            alert(`Gagal memuat data: ${error.message || 'Cek console untuk detail'}`);
        } finally {
            setLoading(false);
        }
    };
    const fetchUserName = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();

            if (user) {
                if (user.user_metadata?.nama_lengkap) {
                    setUserName(user.user_metadata.nama_lengkap);
                } else {
                    const { data: profile } = await supabase
                        .from('profiles')
                        .select('nama_lengkap')
                        .eq('id', user.id)
                        .single();

                    if (profile) setUserName(profile.nama_lengkap);
                }
            }
        } catch (error) {
            console.error("Gagal mengambil data pengguna:", error);
        }
    };

    useEffect(() => {
        fetchData();
        fetchUserName();
    }, []);

    const openConfirmModal = (id: string, currentStatus: boolean) => {
        setModalConfig({ isOpen: true, id, currentStatus });
    };


    const handleConfirmAction = async () => {
        const { id, currentStatus } = modalConfig;
        if (!id) return;

        setActionLoading(true);
        try {
            const { error } = await supabase
                .from('profiles')
                .update({ is_active: !currentStatus })
                .eq('id', id);

            if (error) throw error;

            setDataUsers(prev =>
                prev.map(item => item.id === id ? { ...item, is_active: !currentStatus } : item)
            );

            setModalConfig({ ...modalConfig, isOpen: false });
        } catch (error) {
            console.error("Error:", error);
            alert("Gagal mengubah status.");
        } finally {
            setActionLoading(false);
        }
    };

    const filteredData = dataUsers.filter(item => {
        const q = searchQuery.toLowerCase();
        const email = (item.email || '').toString().toLowerCase();
        const nama = (item.nama_lengkap || '').toString().toLowerCase();
        const nip = (item.nip || '').toString().toLowerCase();
        return email.includes(q) || nama.includes(q) || nip.includes(q);
    });

    const countActive = dataUsers.filter(u => u.is_active === true).length;
    const countInactive = dataUsers.filter(u => u.is_active === false).length;

    const formatRole = (role: any) => {
        switch (role) {
            case 'super_admin':
                return 'Super Admin';
            case 'kepala_dinas':
                return 'Kepala Dinas';
            case 'staff':
                return 'Staff';
            default:
                return role || '-';
        }
    };

    return (
        <div className={poppins.className} style={{ minHeight: '100vh', backgroundColor: '#ffffff', color: '#1f2937', fontFamily: 'var(--font-poppins)' }}>

            {/* Navbar */}
            <nav style={{
                display: 'flex',
                height: '80px',
                alignItems: 'center',
                justifyContent: 'space-between',
                background: 'linear-gradient(90deg, #172433 48%, #3D4650 62%, #3D4650 72%, #172433 89%)',
                padding: '0 24px',
            }}>
                {/* Logo Kiri */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{ fontSize: '30px', fontWeight: '800', letterSpacing: '0.025em', color: '#ffffff' }}>
                        <span>SIM</span>
                        <span style={{ color: '#FFCC00' }}>REDA</span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', lineHeight: '1.2' }}>
                        <span style={{ fontSize: '11px', fontWeight: '500', color: '#ffffff' }}>
                            Sistem Informasi Manajemen
                        </span>
                        <span style={{ fontSize: '11px', fontWeight: '500', color: '#ffffff' }}>
                            Retribusi Daerah
                        </span>
                    </div>
                </div>

                {/* User Kanan */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#ffffff' }}>
                        <div style={{
                            display: 'flex', height: '32px', width: '32px',
                            alignItems: 'center', justifyContent: 'center',
                            borderRadius: '9999px', border: '1px solid rgba(255, 255, 255, 0.3)'
                        }}>
                            <User size={18} />
                        </div>
                        <span style={{ fontSize: '14px', fontWeight: '500' }}>{userName}</span>
                    </div>
                    <button
                        onClick={async () => {
                            await supabase.auth.signOut();
                            window.location.href = '/';
                        }}
                        style={{
                            borderRadius: '4px',
                            backgroundColor: 'rgba(239, 68, 68, 0.8)',
                            padding: '4px 12px',
                            fontSize: '12px',
                            fontWeight: 'bold',
                            color: '#ffffff',
                            border: 'none',
                            cursor: 'pointer',
                            transition: 'background-color 0.2s'
                        }}
                    >
                        Keluar
                    </button>
                </div>
            </nav>

            <main style={{
                maxWidth: '1280px',
                margin: '0 auto',
                padding: '40px 60px'
            }}>

                <div style={{ marginBottom: '40px' }}>
                    <h1 style={{ fontSize: '36px', fontWeight: '800', marginBottom: '8px', color: '#000000' }}>Daftar Pengguna</h1>
                </div>

                <div
                    style={{
                        display: 'flex',
                        gap: '24px',
                        marginBottom: '40px',
                        width: '100%',
                        maxWidth: '650px',
                    }}
                >
                    <div
                        style={{
                            flex: 1,
                            minWidth: '250px',
                            borderRadius: '12px',
                            padding: '24px',
                            boxShadow:
                                '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            border: '1px solid #e5e7eb',
                            backgroundColor: '#F9F9F9',
                        }}
                    >
                        <div>
                            <p
                                style={{
                                    fontSize: '14px',
                                    fontWeight: '600',
                                    marginBottom: '8px',
                                    color: '#6b7280',
                                }}
                            >
                                User Aktif
                            </p>
                            <h2
                                style={{
                                    fontSize: '36px',
                                    fontWeight: '800',
                                    margin: 0,
                                    color: '#111827',
                                }}
                            >
                                {loading ? '...' : countActive}
                            </h2>
                        </div>
                        <div
                            style={{
                                width: '48px',
                                height: '48px',
                                borderRadius: '50%',
                                backgroundColor: '#fff7ed',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: '#f97316',
                            }}
                        >
                            <UserCheck size={24} />
                        </div>
                    </div>

                    <div
                        style={{
                            flex: 1,
                            minWidth: '250px',
                            borderRadius: '12px',
                            padding: '24px',
                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            border: '1px solid #e5e7eb',
                            backgroundColor: 'red',
                        }}
                    >
                        <div>
                            <p
                                style={{
                                    fontSize: '14px',
                                    fontWeight: '600',
                                    marginBottom: '8px',
                                    color: '#ffffff',
                                }}
                            >
                                User Tidak Aktif
                            </p>
                            <h2
                                style={{
                                    fontSize: '36px',
                                    fontWeight: '800',
                                    margin: 0,
                                    color: '#ffffff',
                                }}
                            >
                                {loading ? '...' : countInactive}
                            </h2>
                        </div>
                        <div
                            style={{
                                width: '48px',
                                height: '48px',
                                borderRadius: '50%',
                                backgroundColor: '#dbeafe',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: '#2563eb',
                            }}
                        >
                            <UserX size={24} />
                        </div>
                    </div>
                </div>


                {/* Search, Sort, & Action Button */}
                <div style={{
                    marginBottom: '24px',
                    display: 'flex',
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '16px',
                    flexWrap: 'wrap'
                }}>

                    {/* Search & Sort */}
                    <div style={{ display: 'flex', flex: 1, alignItems: 'center', gap: '12px', minWidth: '300px' }}>
                        {/* Search Bar */}
                        <div style={{ position: 'relative', width: '100%', maxWidth: '450px' }}>
                            <input
                                type="text"
                                placeholder="Cari Berdasarkan Gmail / Nama Lengkap / NIP"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                style={{
                                    width: '100%',
                                    borderRadius: '6px',
                                    border: '1px solid #9ca3af',
                                    paddingTop: '8px',
                                    paddingBottom: '8px',
                                    paddingRight: '40px',
                                    paddingLeft: '16px',
                                    fontSize: '14px',
                                    outline: 'none',
                                    color: '#374151'
                                }}
                            />
                            {/* Ikon Search Absolute */}
                            <div style={{
                                position: 'absolute',
                                right: '12px',
                                top: '50%',
                                transform: 'translateY(-50%)',
                                color: '#000000',
                                pointerEvents: 'none'
                            }}>
                                <Search size={18} />
                            </div>
                        </div>

                        {/* Tombol Sort */}
                        <button style={{
                            display: 'flex', alignItems: 'center', gap: '8px',
                            borderRadius: '6px', border: '1px solid #9ca3af',
                            backgroundColor: '#ffffff',
                            padding: '8px 16px',
                            fontSize: '14px', fontWeight: '500', color: '#000000',
                            whiteSpace: 'nowrap', cursor: 'pointer'
                        }}>
                            Sort <ArrowUpDown size={16} />
                        </button>
                    </div>

                    {/* Tombol Buat User */}
                    <Link
                        href="/super_admin/create"
                        style={{
                            display: 'flex', alignItems: 'center', gap: '8px',
                            borderRadius: '6px',
                            backgroundColor: '#172433',
                            padding: '8px 16px',
                            fontSize: '14px', fontWeight: '500', color: '#ffffff',
                            whiteSpace: 'nowrap', textDecoration: 'none',
                            transition: 'background-color 0.2s'
                        }}
                    >
                        <Plus size={18} />
                        <span> Tambah User</span>
                    </Link>

                </div>

                {/* Tabel Data */}
                <div style={{
                    overflowX: 'auto',
                    borderRadius: '8px 8px 0 0',
                    border: '1px solid #e5e7eb',
                    backgroundColor: '#ffffff',
                    boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)'
                }}>
                    <table style={{ width: '100%', minWidth: '1000px', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
                        <thead style={{ backgroundColor: '#f3f4f6', color: '#374151' }}>
                            <tr>
                                <th style={{ padding: '16px', borderBottom: '1px solid #e5e7eb', fontWeight: 'bold', textAlign: 'center', width: '64px' }}>No</th>

                                <th style={{ padding: '16px', borderBottom: '1px solid #e5e7eb', fontWeight: 'bold', textAlign: 'center', whiteSpace: 'nowrap' }}>Gmail</th>

                                <th style={{
                                    padding: '16px',
                                    borderBottom: '1px solid #e5e7eb',
                                    fontWeight: 'bold',
                                    textAlign: 'center',
                                    minWidth: '220px',
                                    whiteSpace: 'nowrap'
                                }}>
                                    Nama Lengkap
                                </th>

                                <th style={{
                                    padding: '16px',
                                    borderBottom: '1px solid #e5e7eb',
                                    fontWeight: 'bold',
                                    textAlign: 'center',
                                    minWidth: '160px',
                                    whiteSpace: 'nowrap'
                                }}>
                                    NIP
                                </th>

                                <th style={{ padding: '16px', borderBottom: '1px solid #e5e7eb', fontWeight: 'bold', textAlign: 'center', width: '14%' }}>Role</th>
                                <th style={{ padding: '16px', borderBottom: '1px solid #e5e7eb', fontWeight: 'bold', textAlign: 'center', width: '14%' }}>Status Akun</th>
                                <th style={{ padding: '16px', borderBottom: '1px solid #e5e7eb', fontWeight: 'bold', textAlign: 'center' }}>Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan={7} style={{ padding: '40px', textAlign: 'center' }}>
                                        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px' }}>
                                            <Loader2 className="animate-spin" size={24} />
                                            <span>Memuat data...</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : filteredData.length === 0 ? (
                                <tr>
                                    <td colSpan={7} style={{ padding: '40px', textAlign: 'center', color: '#172433' }}>
                                        Belum ada data pengguna.
                                    </td>
                                </tr>
                            ) : (
                                filteredData.map((item, index) => (
                                    <tr key={item.id} style={{ borderBottom: '1px solid #e5e7eb', transition: 'background-color 0.2s' }}>
                                        <td style={{ padding: '16px', color: '#172433', textAlign: 'center', fontWeight: '500' }}>{index + 1}</td>
                                        <td style={{ padding: '16px', color: '#172433', textAlign: 'center', fontWeight: '500' }}>{item.email || '-'}</td>
                                        <td style={{ padding: '16px', color: '#172433', textAlign: 'center', fontWeight: '600' }}>{item.nama_lengkap || '-'}</td>
                                        <td style={{ padding: '16px', color: '#172433', textAlign: 'center' }}>{item.nip || '-'}</td>
                                        <td style={{ padding: '16px', color: '#172433', textAlign: 'center', fontWeight: '500' }}>{formatRole(item.role)}</td>
                                        <td style={{ padding: '16px', color: '#172433', textAlign: 'center', fontWeight: '600' }}>
                                            {item.is_active === true ? 'Aktif' : 'Tidak Aktif'}
                                        </td>
                                        <td style={{ padding: '16px' }}>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'center', justifyContent: 'center' }}>
                                                <Link
                                                    href={`/super_admin/detail?id=${item.id}`}
                                                    style={{
                                                        display: 'flex', width: '160px', alignItems: 'center', justifyContent: 'center', gap: '8px',
                                                        borderRadius: '9999px', backgroundColor: '#172433', padding: '6px 12px',
                                                        fontSize: '12px', fontWeight: 'bold', color: '#ffffff', textDecoration: 'none'
                                                    }}
                                                >
                                                    <FileText size={14} /> Lihat Detail
                                                </Link>

                                                {/* Tombol Dinamis: Aktifkan / Nonaktifkan */}
                                                <button
                                                    onClick={() => openConfirmModal(item.id, item.is_active)}
                                                    style={{
                                                        display: 'flex',
                                                        width: '160px',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        gap: '8px',
                                                        borderRadius: '9999px',
                                                        backgroundColor: '#ffffff',
                                                        border: `1px solid ${item.is_active ? '#f87171' : '#10b981'}`,
                                                        padding: '6px 12px',
                                                        fontSize: '12px',
                                                        fontWeight: 'bold',
                                                        color: item.is_active ? '#ef4444' : '#10b981',
                                                        cursor: 'pointer'
                                                    }}
                                                >
                                                    {item.is_active ? (
                                                        <>
                                                            <UserMinus size={14} /> Nonaktifkan
                                                        </>
                                                    ) : (
                                                        <>
                                                            <CheckCircle size={14} /> Aktifkan Akun
                                                        </>
                                                    )}
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination (Tampilan Statis) */}
                <div style={{ marginTop: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <button style={{
                        display: 'flex', alignItems: 'center', gap: '4px',
                        borderRadius: '9999px',
                        border: '1px solid #172433',
                        backgroundColor: '#ffffff',
                        padding: '6px 16px',
                        fontSize: '14px', fontWeight: '500',
                        color: '#172433',
                        cursor: 'pointer'
                    }}>
                        <ChevronLeft size={16} /> Sebelumnya
                    </button>
                    <button style={{
                        display: 'flex', alignItems: 'center', gap: '4px',
                        borderRadius: '9999px',
                        border: '1px solid #172433',
                        backgroundColor: '#ffffff',
                        padding: '6px 16px',
                        fontSize: '14px', fontWeight: '500',
                        color: '#172433',
                        cursor: 'pointer'
                    }}>
                        Selanjutnya <ChevronRight size={16} />
                    </button>
                </div>

            </main>

            <ModalConfirm
                isOpen={modalConfig.isOpen}
                onClose={() => setModalConfig({ ...modalConfig, isOpen: false })}
                onConfirm={handleConfirmAction}
                isLoading={actionLoading}
                title="Konfirmasi Perubahan Status"

                message={
                    <p>
                        Apakah Anda yakin ingin <strong>{modalConfig.currentStatus ? "menonaktifkan" : "mengaktifkan"}</strong> user ini?
                        <br />
                        <span style={{ fontSize: '13px' }}>
                            {modalConfig.currentStatus
                                ? "User tidak akan bisa login ke sistem."
                                : "User akan mendapatkan akses kembali."}
                        </span>
                    </p>
                }
                confirmLabel={modalConfig.currentStatus ? "Ya, Nonaktifkan" : "Ya, Aktifkan"}
                variant={modalConfig.currentStatus ? 'danger' : 'success'}
            />
        </div>
    );
}
