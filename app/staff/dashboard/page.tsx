'use client';

import React, { useEffect, useState } from 'react';
import {
    Search,
    User,
    ArrowUpDown,
    Trash2,
    Plus,
    FileText,
    ChevronLeft,
    ChevronRight,
    Loader2,
    CheckCircle,
    Clock,
    AlertCircle,
    Edit,
    CreditCard,
    Upload,
    File,
    X
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
    const [dataSKRD, setDataSKRD] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [userName, setUserName] = useState('');

    const [activeTab, setActiveTab] = useState<'pending' | 'published'>('pending');

    const [countPending, setCountPending] = useState(0);
    const [countPublished, setCountPublished] = useState(0);

    const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; id: number | null }>({
        isOpen: false, id: null
    });
    const [isDeleting, setIsDeleting] = useState(false);

    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [selectedIdPay, setSelectedIdPay] = useState<number | null>(null);
    const [selectedNomorPay, setSelectedNomorPay] = useState('');
    const [paymentFile, setPaymentFile] = useState<File | null>(null);

    const [isPaying, setIsPaying] = useState(false);

    const fetchData = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('skrd')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;

            const allData = data || [];
            setDataSKRD(allData);

            const pending = allData.filter((item: any) => item.status === false).length;
            const published = allData.filter((item: any) => item.status === true).length;

            setCountPending(pending);
            setCountPublished(published);

        } catch (error: any) {
            console.error("Detail Error:", JSON.stringify(error, null, 2));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
        fetchUserName();
    }, []);

    const fetchUserName = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (user?.user_metadata?.nama_lengkap) {
                setUserName(user.user_metadata.nama_lengkap);
            }
        } catch (error) {
            console.error("Gagal mengambil data pengguna:", error);
        }
    };

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

    const openDeleteModal = (id: number, status: boolean) => {
        if (status === true) return;
        setDeleteModal({ isOpen: true, id });
    };

    const openPaymentModal = (id: number, nomor: string) => {
        setSelectedIdPay(id);
        setSelectedNomorPay(nomor);
        setPaymentFile(null);
        setShowPaymentModal(true);
    };

    const executeDelete = async () => {
        const idToDelete = deleteModal.id;
        if (!idToDelete) return;

        setIsDeleting(true);
        try {
            const { error } = await supabase.from('skrd').delete().eq('id', idToDelete);
            if (error) throw error;

            setDataSKRD(prev => prev.filter(item => item.id !== idToDelete));
            setCountPending(prev => prev > 0 ? prev - 1 : 0);
            setDeleteModal({ isOpen: false, id: null });
        } catch (error) {
            console.error("Gagal menghapus:", error);
            alert("Gagal menghapus data.");
        } finally {
            setIsDeleting(false);
        }
    };

    const executePayment = async () => {
        if (!selectedIdPay) return;

        setIsPaying(true); 
        try {
            let publicUrl = null;

            if (paymentFile) {
                const fileExt = paymentFile.name.split('.').pop();
                const fileName = `${selectedIdPay}_${Date.now()}.${fileExt}`;
                const filePath = `${fileName}`;

                const { error: uploadError } = await supabase.storage
                    .from('bukti_pembayaran')
                    .upload(filePath, paymentFile);

                if (uploadError) throw uploadError;

                const { data: urlData } = supabase.storage
                    .from('bukti_pembayaran')
                    .getPublicUrl(filePath);

                publicUrl = urlData.publicUrl;
            }

            const { error } = await supabase
                .from('skrd')
                .update({
                    status_pembayaran: 'LUNAS',
                    bukti_pembayaran_url: publicUrl
                })
                .eq('id', selectedIdPay);

            if (error) throw error;

            setDataSKRD(prev => prev.map(item =>
                item.id === selectedIdPay ? {
                    ...item,
                    status_pembayaran: 'LUNAS',
                    tanggal_pelunasan: new Date().toISOString(),
                    bukti_pembayaran_url: publicUrl
                } : item
            ));

            setShowPaymentModal(false);
        } catch (error: any) {
            console.error("Gagal update pembayaran:", error);
            alert("Gagal memproses: " + error.message);
        } finally {
            setIsPaying(false); 
        }
    };

    return (
        <div className={poppins.className} style={{ minHeight: '100vh', backgroundColor: '#ffffff', color: '#1f2937', fontFamily: 'var(--font-poppins)' }}>

            {/* Navbar */}
            <nav style={{ display: 'flex', height: '80px', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#172433', padding: '0 60px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{ fontSize: '30px', fontWeight: '800', letterSpacing: '0.025em', color: '#ffffff' }}>
                        <span>Se</span><span style={{ color: '#FFCC00' }}>tara</span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', lineHeight: '1.2' }}>
                        <span style={{ fontSize: '11px', fontWeight: '500', color: '#ffffff' }}>Sistem Ketetapan</span>
                        <span style={{ fontSize: '11px', fontWeight: '500', color: '#ffffff' }}>Retribusi Daerah</span>
                    </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#ffffff' }}>
                        <div style={{ display: 'flex', height: '32px', width: '32px', alignItems: 'center', justifyContent: 'center', borderRadius: '9999px', border: '1px solid rgba(255, 255, 255, 0.3)' }}>
                            <User size={18} />
                        </div>
                        <span style={{ fontSize: '14px', fontWeight: '500' }}>{userName}</span>
                    </div>
                    <button onClick={async () => { await supabase.auth.signOut(); window.location.href = '/'; }} style={{ borderRadius: '4px', backgroundColor: 'rgba(239, 68, 68, 0.8)', padding: '4px 12px', fontSize: '12px', fontWeight: 'bold', color: '#ffffff', border: 'none', cursor: 'pointer' }}>
                        Keluar
                    </button>
                </div>
            </nav>

            <main style={{ maxWidth: '1280px', margin: '0 auto', padding: '40px 60px' }}>
                <div style={{ marginBottom: '24px' }}>
                    <h1 style={{ fontSize: '36px', fontWeight: '800', marginBottom: '8px', color: '#000000' }}>Daftar SKRD</h1>
                </div>

                {/* TAB SWITCHER */}
                <div style={{ display: 'flex', gap: '24px', marginBottom: '40px', width: '100%', maxWidth: '650px' }}>
                    <div onClick={() => setActiveTab('pending')} style={{ flex: 1, minWidth: '250px', borderRadius: '12px', padding: '24px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid #e5e7eb', backgroundColor: activeTab === 'pending' ? '#172433' : '#F9F9F9' }}>
                        <div>
                            <p style={{ fontSize: '14px', fontWeight: '600', marginBottom: '8px', color: activeTab === 'pending' ? '#d1d5db' : '#6b7280' }}>Menunggu Validasi</p>
                            <h2 style={{ fontSize: '36px', fontWeight: '800', margin: 0, color: activeTab === 'pending' ? '#ffffff' : '#111827' }}>{loading ? '...' : countPending}</h2>
                        </div>
                        <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: '#fff7ed', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#f97316' }}>
                            <Clock size={24} />
                        </div>
                    </div>
                    <div onClick={() => setActiveTab('published')} style={{ flex: 1, minWidth: '250px', borderRadius: '12px', padding: '24px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid #e5e7eb', backgroundColor: activeTab === 'published' ? '#172433' : '#F9F9F9' }}>
                        <div>
                            <p style={{ fontSize: '14px', fontWeight: '600', marginBottom: '8px', color: activeTab === 'published' ? '#d1d5db' : '#6b7280' }}>Diterbitkan</p>
                            <h2 style={{ fontSize: '36px', fontWeight: '800', margin: 0, color: activeTab === 'published' ? '#ffffff' : '#111827' }}>{loading ? '...' : countPublished}</h2>
                        </div>
                        <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: '#dbeafe', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2563eb' }}>
                            <CheckCircle size={24} />
                        </div>
                    </div>
                </div>

                {/* Toolbar */}
                <div style={{ marginBottom: '24px', display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap' }}>
                    <div style={{ display: 'flex', flex: 1, alignItems: 'center', gap: '12px', minWidth: '300px' }}>
                        <div style={{ position: 'relative', width: '100%', maxWidth: '450px' }}>
                            <input type="text" placeholder="Cari Berdasarkan No.Surat / Nama Pemilik" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} style={{ width: '100%', borderRadius: '6px', border: '1px solid #9ca3af', padding: '8px 40px 8px 16px', fontSize: '14px', outline: 'none', color: '#374151' }} />
                            <div style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: '#000000', pointerEvents: 'none' }}><Search size={18} /></div>
                        </div>
                        <button style={{ display: 'flex', alignItems: 'center', gap: '8px', borderRadius: '6px', border: '1px solid #9ca3af', backgroundColor: '#ffffff', padding: '8px 16px', fontSize: '14px', fontWeight: '500', color: '#000000', cursor: 'pointer' }}>Sort <ArrowUpDown size={16} /></button>
                    </div>
                    <Link href="/staff/create" style={{ display: 'flex', alignItems: 'center', gap: '8px', borderRadius: '6px', backgroundColor: '#172433', padding: '8px 16px', fontSize: '14px', fontWeight: '500', color: '#ffffff', textDecoration: 'none' }}>
                        <Plus size={18} /><span>Buat Surat Ketetapan Retribusi Daerah</span>
                    </Link>
                </div>

                {/* Tabel Data */}
                <div style={{ overflowX: 'auto', borderRadius: '8px 8px 0 0', border: '1px solid #e5e7eb', backgroundColor: '#ffffff', boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)' }}>
                    <table style={{ width: '100%', minWidth: '1000px', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
                        <thead style={{ backgroundColor: '#f3f4f6', color: '#374151' }}>
                            <tr>
                                <th style={{ padding: '16px', borderBottom: '1px solid #e5e7eb', fontWeight: 'bold', textAlign: 'center', width: '64px' }}>No</th>
                                <th style={{ padding: '16px', borderBottom: '1px solid #e5e7eb', fontWeight: 'bold', textAlign: 'center', whiteSpace: 'nowrap' }}>Nomor Surat</th>
                                <th style={{ padding: '16px', borderBottom: '1px solid #e5e7eb', fontWeight: 'bold', textAlign: 'center', minWidth: '220px' }}>Nama Pemilik</th>
                                <th style={{ padding: '16px', borderBottom: '1px solid #e5e7eb', fontWeight: 'bold', textAlign: 'center', minWidth: '250px' }}>Alamat Bangunan</th>
                                <th style={{ padding: '16px', borderBottom: '1px solid #e5e7eb', fontWeight: 'bold', textAlign: 'center', width: '15%' }}>{activeTab === 'pending' ? 'Tanggal Permohonan' : 'Tanggal Terbit'}</th>
                                {activeTab === 'published' && (
                                    <th style={{ padding: '16px', borderBottom: '1px solid #e5e7eb', fontWeight: 'bold', textAlign: 'center', width: '15%' }}>Status Pelunasan</th>
                                )}
                                <th style={{ padding: '16px', borderBottom: '1px solid #e5e7eb', fontWeight: 'bold', textAlign: 'center' }}>Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan={activeTab === 'published' ? 7 : 6} style={{ padding: '40px', textAlign: 'center' }}><div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px' }}><Loader2 className="animate-spin" size={24} /><span>Memuat data...</span></div></td></tr>
                            ) : filteredData.length === 0 ? (
                                <tr><td colSpan={activeTab === 'published' ? 7 : 6} style={{ padding: '40px', textAlign: 'center', color: '#172433' }}>{activeTab === 'pending' ? 'Tidak ada surat yang menunggu validasi.' : 'Tidak ada surat yang diterbitkan.'}</td></tr>
                            ) : (
                                filteredData.map((item, index) => (
                                    <tr key={item.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                                        <td style={{ padding: '16px', textAlign: 'center', color: '#172433' }}>{index + 1}</td>
                                        <td style={{ padding: '16px', textAlign: 'center', color: '#172433' }}>{item.nomor_surat}</td>
                                        <td style={{ padding: '16px', textAlign: 'center', color: '#172433', fontWeight: '600' }}>{item.nama_pemilik}</td>
                                        <td style={{ padding: '16px', textAlign: 'center', color: '#172433' }}>{item.alamat_bangunan}</td>
                                        <td style={{ padding: '16px', textAlign: 'center' }}>
                                            <span style={{ fontWeight: '600', color: '#172433' }}>
                                                {activeTab === 'pending'
                                                    ? new Date(item.tanggal_permohonan).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
                                                    : (item.tanggal_terbit ? new Date(item.tanggal_terbit).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : '-')
                                                }
                                            </span>
                                            {activeTab === 'pending' && item.catatan_revisi && (
                                                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', backgroundColor: '#fee2e2', padding: '2px 8px', marginTop: '4px', borderRadius: '4px', border: '1px solid #fca5a5' }}>
                                                    <AlertCircle size={12} color="#ef4444" /><span style={{ fontSize: '11px', color: '#b91c1c', fontWeight: '700' }}>! Revisi</span>
                                                </div>
                                            )}
                                        </td>
                                        {activeTab === 'published' && (
                                            <td style={{ padding: '16px', textAlign: 'center' }}>
                                                <span style={{
                                                    backgroundColor: item.status_pembayaran === 'LUNAS' ? '#dcfce7' : '#fee2e2',
                                                    color: item.status_pembayaran === 'LUNAS' ? '#166534' : '#991b1b',
                                                    padding: '6px 16px', borderRadius: '9999px', fontSize: '12px', fontWeight: 'bold', textTransform: 'uppercase'
                                                }}>
                                                    {item.status_pembayaran === 'LUNAS' ? 'LUNAS' : 'BELUM'}
                                                </span>
                                            </td>
                                        )}
                                        <td style={{ padding: '16px' }}>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'center' }}>
                                                {/* Edit/Detail */}
                                                {item.catatan_revisi && !item.status ? (
                                                    <Link href={`/staff/revisi?nomor_surat=${encodeURIComponent(item.nomor_surat)}`} style={{ display: 'flex', width: '128px', alignItems: 'center', justifyContent: 'center', gap: '8px', borderRadius: '9999px', backgroundColor: '#f97316', padding: '6px 12px', fontSize: '12px', fontWeight: 'bold', color: '#ffffff', textDecoration: 'none' }}>
                                                        <Edit size={14} /> Perbaiki
                                                    </Link>
                                                ) : (
                                                    <Link href={`/staff/detail?nomor_surat=${encodeURIComponent(item.nomor_surat)}`} style={{ display: 'flex', width: '128px', alignItems: 'center', justifyContent: 'center', gap: '8px', borderRadius: '9999px', backgroundColor: '#172433', padding: '6px 12px', fontSize: '12px', fontWeight: 'bold', color: '#ffffff', textDecoration: 'none' }}>
                                                        <FileText size={14} /> Lihat Detail
                                                    </Link>
                                                )}

                                                {/* Tombol Lunas */}
                                                {activeTab === 'published' && item.status_pembayaran === 'BELUM' && (
                                                    <button
                                                        onClick={() => openPaymentModal(item.id, item.nomor_surat)}
                                                        style={{ display: 'flex', width: '128px', alignItems: 'center', justifyContent: 'center', gap: '8px', borderRadius: '9999px', backgroundColor: '#10b981', padding: '6px 12px', fontSize: '12px', fontWeight: 'bold', color: '#ffffff', border: 'none', cursor: 'pointer' }}
                                                    >
                                                        <CreditCard size={14} /> Tandai Lunas
                                                    </button>
                                                )}

                                                {/* TOMBOL LIHAT BUKTI DIHAPUS DARI SINI */}

                                                {/* Hapus */}
                                                {item.status === false && (
                                                    <button onClick={() => openDeleteModal(item.id, item.status)} style={{ display: 'flex', width: '128px', alignItems: 'center', justifyContent: 'center', gap: '8px', borderRadius: '9999px', backgroundColor: '#ffffff', border: '1px solid #f87171', padding: '6px 12px', fontSize: '12px', fontWeight: 'bold', color: '#ef4444', cursor: 'pointer' }}>
                                                        <Trash2 size={14} /> Hapus
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                <div style={{ marginTop: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <button style={{ display: 'flex', alignItems: 'center', gap: '4px', borderRadius: '9999px', border: '1px solid #172433', backgroundColor: '#ffffff', padding: '6px 16px', fontSize: '14px', fontWeight: '500', color: '#172433', cursor: 'pointer' }}><ChevronLeft size={16} /> Sebelumnya</button>
                    <button style={{ display: 'flex', alignItems: 'center', gap: '4px', borderRadius: '9999px', border: '1px solid #172433', backgroundColor: '#ffffff', padding: '6px 16px', fontSize: '14px', fontWeight: '500', color: '#172433', cursor: 'pointer' }}>Selanjutnya <ChevronRight size={16} /></button>
                </div>
            </main>

            {/* Modal Hapus */}
            <ModalConfirm
                isOpen={deleteModal.isOpen}
                onClose={() => setDeleteModal({ isOpen: false, id: null })}
                onConfirm={executeDelete}
                isLoading={isDeleting}
                title="Hapus Data SKRD"
                message="Apakah Anda yakin ingin menghapus data ini?"
                variant="danger"
                confirmLabel="Ya, Hapus"
            />

            {/* Modal Pembayaran */}
            {showPaymentModal && (
                <div style={{
                    position: 'fixed', inset: 0, zIndex: 1000,
                    backgroundColor: 'rgba(0, 0, 0, 0.5)',
                    display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '20px'
                }}>
                    <div style={{
                        backgroundColor: 'white', borderRadius: '12px',
                        width: '100%', maxWidth: '500px',
                        overflow: 'hidden', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)'
                    }}>
                        <div style={{ backgroundColor: '#172433', padding: '20px', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '600' }}>Konfirmasi Pembayaran</h3>
                            <button onClick={() => setShowPaymentModal(false)} style={{ background: 'transparent', border: 'none', color: 'white', cursor: 'pointer' }}>
                                <X size={24} />
                            </button>
                        </div>

                        <div style={{ padding: '24px' }}>
                            <p style={{ color: '#374151', marginBottom: '24px', lineHeight: '1.5' }}>
                                Apakah Anda yakin ingin menandai SKRD <strong>{selectedNomorPay}</strong> ini sebagai <strong>LUNAS</strong>?
                            </p>

                            <div style={{ marginBottom: '24px' }}>
                                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600', color: '#1f2937' }}>
                                    Unggah Bukti Pembayaran (Opsional)
                                </label>
                                <div style={{
                                    border: '2px dashed #d1d5db', borderRadius: '8px', padding: '20px',
                                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                                    backgroundColor: '#f9fafb', cursor: 'pointer', position: 'relative'
                                }}>
                                    <input
                                        type="file"
                                        accept="image/*,application/pdf"
                                        onChange={(e) => {
                                            if (e.target.files && e.target.files[0]) {
                                                setPaymentFile(e.target.files[0]);
                                            }
                                        }}
                                        style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer' }}
                                    />
                                    {paymentFile ? (
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#16a34a' }}>
                                            <File size={24} />
                                            <span style={{ fontSize: '14px', fontWeight: '500' }}>{paymentFile.name}</span>
                                        </div>
                                    ) : (
                                        <>
                                            <Upload size={24} color="#9ca3af" style={{ marginBottom: '8px' }} />
                                            <span style={{ fontSize: '12px', color: '#6b7280' }}>Klik untuk upload PDF atau Foto</span>
                                        </>
                                    )}
                                </div>
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                                <button
                                    onClick={() => setShowPaymentModal(false)}
                                    style={{ padding: '10px 20px', borderRadius: '8px', border: '1px solid #d1d5db', backgroundColor: 'white', color: '#374151', fontWeight: '600', cursor: 'pointer' }}
                                >
                                    Batal
                                </button>
                                <button
                                    onClick={executePayment}
                                    style={{
                                        padding: '10px 24px', borderRadius: '8px', border: 'none',
                                        backgroundColor: '#10b981', color: 'white', fontWeight: '600',
                                        cursor: 'pointer',
                                        display: 'flex', alignItems: 'center', gap: '8px'
                                    }}
                                >
                                    <CheckCircle size={18} />
                                    Ya, Tandai Lunas
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {isPaying && (
                <div style={{
                    position: 'fixed',
                    inset: 0,
                    zIndex: 9999,
                    backgroundColor: 'rgba(0, 0, 0, 0.6)',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    backdropFilter: 'blur(2px)'
                }}>
                    <div style={{
                        backgroundColor: 'white',
                        padding: '40px',
                        borderRadius: '16px',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
                    }}>
                        <Loader2 className="animate-spin" size={60} color="#172433" />
                        <p style={{ marginTop: '24px', fontSize: '18px', fontWeight: '600', color: '#1f2937' }}>
                            Mengunggah Bukti & Memproses...
                        </p>
                        <p style={{ marginTop: '8px', fontSize: '14px', color: '#6b7280' }}>
                            Mohon tunggu sebentar
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}