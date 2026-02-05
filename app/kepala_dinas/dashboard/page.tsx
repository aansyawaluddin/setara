'use client';

import React, { useEffect, useState } from 'react';
import {
    Search,
    User,
    ArrowUpDown,
    FileText,
    ChevronLeft,
    ChevronRight,
    Loader2,
    Clock,
    CheckCircle
} from 'lucide-react';
import Link from "next/link"; // Import Link untuk navigasi
import { Poppins } from 'next/font/google';
import { supabase } from '@/lib/supabase';

const poppins = Poppins({
    subsets: ['latin'],
    weight: ['400', '500', '600', '700', '800'], // Menambahkan weight 800
    variable: '--font-poppins',
});

export default function DashboardPage() {
    const [dataSKRD, setDataSKRD] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [userName, setUserName] = useState('');

    // State untuk Tab Aktif ('pending' | 'published')
    const [activeTab, setActiveTab] = useState<'pending' | 'published'>('pending');

    const [countPending, setCountPending] = useState(0);
    const [countPublished, setCountPublished] = useState(0);

    const fetchData = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('skrd')
                .select('*')
                .order('tanggal_permohonan', { ascending: false });

            if (error) throw error;

            const allData = data || [];
            setDataSKRD(allData);

            const pending = allData.filter((item: any) => item.status === false).length;
            const published = allData.filter((item: any) => item.status === true).length;

            setCountPending(pending);
            setCountPublished(published);

        } catch (error) {
            console.error("Gagal mengambil data:", error);
            alert("Gagal memuat data.");
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

    const filteredData = dataSKRD.filter(item => {
        const matchesSearch = item.nomor_surat.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.nama_pemilik.toLowerCase().includes(searchQuery.toLowerCase());

        let matchesStatus = false;
        if (activeTab === 'pending') {
            matchesStatus = item.status === false;
        } else {
            matchesStatus = item.status === true;
        }

        return matchesSearch && matchesStatus;
    });

    return (
        <div className={poppins.className} style={{ minHeight: '100vh', backgroundColor: '#ffffff', color: '#1f2937', fontFamily: 'var(--font-poppins)' }}>

            {/* --- NAVBAR --- */}
            <nav style={{
                display: 'flex',
                height: '80px',
                alignItems: 'center',
                justifyContent: 'space-between',
                background: 'linear-gradient(90deg, #172433 48%, #3D4650 62%, #3D4650 72%, #172433 89%)',
                padding: '0 60px',
            }}>
                {/* 1. Bagian Logo (Kiri) */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{ fontSize: '30px', fontWeight: '800', letterSpacing: '0.025em', color: '#ffffff' }}>
                        <span>Se</span>
                        <span style={{ color: '#FFCC00' }}>tara</span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', lineHeight: '1.2' }}>
                        <span style={{ fontSize: '11px', fontWeight: '500', color: '#ffffff' }}>
                            Sistem Ketetapan
                        </span>
                        <span style={{ fontSize: '11px', fontWeight: '500', color: '#ffffff' }}>
                            Retribusi Daerah
                        </span>
                    </div>
                </div>

                {/* 2. Bagian Menu Navigasi (Tengah) - BARU DITAMBAHKAN */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '40px' }}>
                    <Link
                        href="/dashboard"
                        style={{
                            color: '#FFCC00', // Warna Kuning karena sedang aktif di halaman ini
                            fontSize: '16px',
                            fontWeight: '600',
                            textDecoration: 'none',
                            cursor: 'pointer'
                        }}
                    >
                        Beranda
                    </Link>
                    <Link
                        href="/kepala_dinas/rekapitulasi" 
                        style={{
                            color: '#e5e7eb',
                            fontSize: '16px',
                            fontWeight: '500',
                            textDecoration: 'none',
                            cursor: 'pointer',
                            transition: 'color 0.2s'
                        }}
                        onMouseOver={(e) => e.currentTarget.style.color = '#ffffff'}
                        onMouseOut={(e) => e.currentTarget.style.color = '#e5e7eb'}
                    >
                        Rekapitulasi Pembayaran
                    </Link>
                </div>

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

                <div style={{ marginBottom: '24px' }}>
                    <h1 style={{ fontSize: '36px', fontWeight: '800', marginBottom: '8px', color: '#000000' }}>Daftar SKRD</h1>
                </div>

                <div style={{
                    display: 'flex',
                    gap: '24px',
                    marginBottom: '40px',
                    width: '100%',
                    maxWidth: '650px'
                }}>
                    <div
                        onClick={() => setActiveTab('pending')}
                        style={{
                            flex: 1,
                            minWidth: '250px',
                            borderRadius: '12px',
                            padding: '24px',
                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                            cursor: 'pointer',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            transition: 'all 0.3s ease',
                            border: '1px solid #e5e7eb',
                            backgroundColor: activeTab === 'pending' ? '#172433' : '#F9F9F9',
                        }}
                    >
                        <div>
                            <p style={{
                                fontSize: '14px',
                                fontWeight: '600',
                                marginBottom: '8px',
                                color: activeTab === 'pending' ? '#d1d5db' : '#6b7280'
                            }}>
                                Menunggu Validasi
                            </p>
                            <h2 style={{
                                fontSize: '36px',
                                fontWeight: '800',
                                margin: 0,
                                color: activeTab === 'pending' ? '#ffffff' : '#111827'
                            }}>
                                {loading ? '...' : countPending}
                            </h2>
                        </div>
                        <div style={{
                            width: '48px', height: '48px',
                            borderRadius: '50%',
                            backgroundColor: '#fff7ed',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            color: '#f97316'
                        }}>
                            <Clock size={24} />
                        </div>
                    </div>

                    <div
                        onClick={() => setActiveTab('published')}
                        style={{
                            flex: 1,
                            minWidth: '250px',
                            borderRadius: '12px',
                            padding: '24px',
                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                            cursor: 'pointer',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            transition: 'all 0.3s ease',
                            border: '1px solid #e5e7eb',
                            backgroundColor: activeTab === 'published' ? '#172433' : '#F9F9F9',
                        }}
                    >
                        <div>
                            <p style={{
                                fontSize: '14px',
                                fontWeight: '600',
                                marginBottom: '8px',
                                color: activeTab === 'published' ? '#d1d5db' : '#6b7280'
                            }}>
                                Diterbitkan
                            </p>
                            <h2 style={{
                                fontSize: '36px',
                                fontWeight: '800',
                                margin: 0,
                                color: activeTab === 'published' ? '#ffffff' : '#111827'
                            }}>
                                {loading ? '...' : countPublished}
                            </h2>
                        </div>
                        <div style={{
                            width: '48px', height: '48px',
                            borderRadius: '50%',
                            backgroundColor: '#dbeafe',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            color: '#2563eb'
                        }}>
                            <CheckCircle size={24} />
                        </div>
                    </div>

                </div>

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
                        <div style={{ position: 'relative', width: '100%', maxWidth: '450px' }}>
                            <input
                                type="text"
                                placeholder="Cari Berdasarkan No.Surat / Nama Pemilik Bangunan"
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

                                <th style={{ padding: '16px', borderBottom: '1px solid #e5e7eb', fontWeight: 'bold', textAlign: 'center', whiteSpace: 'nowrap' }}>Nomor Surat</th>

                                <th style={{ padding: '16px', borderBottom: '1px solid #e5e7eb', fontWeight: 'bold', textAlign: 'center', minWidth: '220px', whiteSpace: 'nowrap' }}>
                                    Nama Pemilik
                                </th>

                                <th style={{ padding: '16px', borderBottom: '1px solid #e5e7eb', fontWeight: 'bold', textAlign: 'center', minWidth: '250px', whiteSpace: 'nowrap' }}>
                                    Alamat Bangunan
                                </th>

                                <th style={{ padding: '16px', borderBottom: '1px solid #e5e7eb', fontWeight: 'bold', textAlign: 'center', width: '15%' }}>
                                    {activeTab === 'pending' ? 'Tanggal Permohonan' : 'Tanggal Terbit'}
                                </th>

                                {activeTab === 'published' && (
                                    <th style={{ padding: '16px', borderBottom: '1px solid #e5e7eb', fontWeight: 'bold', textAlign: 'center', width: '15%' }}>
                                        Status Pelunasan
                                    </th>
                                )}

                                <th style={{ padding: '16px', borderBottom: '1px solid #e5e7eb', fontWeight: 'bold', textAlign: 'center' }}>Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan={activeTab === 'published' ? 7 : 6} style={{ padding: '40px', textAlign: 'center' }}>
                                        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px' }}>
                                            <Loader2 className="animate-spin" size={24} />
                                            <span>Memuat data...</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : filteredData.length === 0 ? (
                                <tr>
                                    <td colSpan={activeTab === 'published' ? 7 : 6} style={{ padding: '40px', textAlign: 'center', color: '#172433' }}>
                                        {activeTab === 'pending'
                                            ? 'Tidak ada surat yang menunggu validasi.'
                                            : 'Tidak ada surat yang diterbitkan.'
                                        }
                                    </td>
                                </tr>
                            ) : (
                                filteredData.map((item, index) => (
                                    <tr key={item.id} style={{ borderBottom: '1px solid #e5e7eb', transition: 'background-color 0.2s' }}>
                                        <td style={{ padding: '16px', color: '#172433', textAlign: 'center', fontWeight: '500' }}>{index + 1}</td>
                                        <td style={{ padding: '16px', color: '#172433', textAlign: 'center', fontWeight: '500' }}>{item.nomor_surat}</td>
                                        <td style={{ padding: '16px', color: '#172433', textAlign: 'center', fontWeight: '600' }}>{item.nama_pemilik}</td>
                                        <td style={{ padding: '16px', color: '#172433', textAlign: 'center', }}>{item.alamat_bangunan}</td>

                                        <td style={{ padding: '16px' }}>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                                <span style={{ fontWeight: '600', color: '#172433', textAlign: 'center', }}>
                                                    {activeTab === 'pending'
                                                        ? new Date(item.tanggal_permohonan).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
                                                        : (item.tanggal_terbit
                                                            ? new Date(item.tanggal_terbit).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
                                                            : '-')
                                                    }
                                                </span>
                                            </div>
                                        </td>

                                        {activeTab === 'published' && (
                                            <td style={{ padding: '16px', textAlign: 'center' }}>
                                                <span style={{
                                                    backgroundColor: item.status_pembayaran === 'LUNAS' ? '#dcfce7' : '#fee2e2',
                                                    color: item.status_pembayaran === 'LUNAS' ? '#166534' : '#991b1b',
                                                    padding: '6px 16px',
                                                    borderRadius: '9999px',
                                                    fontSize: '12px',
                                                    fontWeight: 'bold',
                                                    textTransform: 'uppercase'
                                                }}>
                                                    {item.status_pembayaran === 'LUNAS' ? 'LUNAS' : 'BELUM'}
                                                </span>
                                            </td>
                                        )}

                                        <td style={{ padding: '16px' }}>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'center', justifyContent: 'center' }}>
                                                <Link
                                                    href={`/kepala_dinas/detail?nomor_surat=${encodeURIComponent(item.nomor_surat)}`}
                                                    style={{
                                                        display: 'flex',
                                                        width: '128px',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        gap: '8px',
                                                        borderRadius: '9999px',
                                                        backgroundColor: '#172433',
                                                        padding: '6px 12px',
                                                        fontSize: '12px',
                                                        fontWeight: 'bold',
                                                        color: '#ffffff',
                                                        cursor: 'pointer',
                                                        textDecoration: 'none'
                                                    }}
                                                >
                                                    <FileText size={14} /> Lihat Detail
                                                </Link>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
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
        </div>
    );
}