'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Loader2, XCircle } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

function VerifyContent() {
    const searchParams = useSearchParams();

    // 1. TANGKAP KEDUA KEMUNGKINAN PARAMETER
    const idParam = searchParams.get('id');
    const noSuratParam = searchParams.get('nomor_surat');

    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                // 2. LOGIKA PENCARIAN FLEKSIBEL
                let query = supabase.from('skrd').select('*');

                if (noSuratParam) {
                    // Prioritaskan cari pakai Nomor Surat
                    query = query.eq('nomor_surat', noSuratParam);
                } else if (idParam) {
                    // Fallback cari pakai ID
                    query = query.eq('id', idParam);
                } else {
                    setLoading(false);
                    return;
                }

                const { data: result, error } = await query.single();

                if (error) throw error;
                setData(result);
            } catch (err) {
                console.error("Data tidak ditemukan:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [idParam, noSuratParam]);

    // --- Helper Formatters ---
    const formatRupiah = (angka: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0
        }).format(angka);
    };

    const formatDate = (dateString: string | null) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleDateString('id-ID', {
            day: '2-digit', month: '2-digit', year: 'numeric'
        });
    };

    const formatDateTime = (dateString: string | null) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleString('id-ID', {
            day: '2-digit', month: '2-digit', year: 'numeric',
            hour: '2-digit', minute: '2-digit'
        });
    };
    // ------------------

    if (loading) {
        return (
            <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', backgroundColor: '#f3f4f6', color: '#6b7280' }}>
                <Loader2 className="animate-spin" size={40} style={{ marginBottom: '16px' }} />
                <p>Memverifikasi Data...</p>
            </div>
        );
    }

    if (!data) {
        return (
            <div style={{ minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', backgroundColor: '#f3f4f6', padding: '20px' }}>
                <div style={{ backgroundColor: 'white', padding: '40px', borderRadius: '16px', textAlign: 'center', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', maxWidth: '400px', width: '100%' }}>
                    <XCircle size={64} color="#ef4444" style={{ margin: '0 auto 24px' }} />
                    <h2 style={{ fontSize: '20px', fontWeight: 'bold', color: '#1f2937', marginBottom: '8px' }}>Data Tidak Ditemukan</h2>
                    <p style={{ color: '#6b7280', lineHeight: '1.5' }}>Maaf, QR Code yang Anda scan tidak valid atau data telah dihapus.</p>
                </div>
            </div>
        );
    }

    const isLunas = data.status_pembayaran === 'LUNAS';
    const qrValue = data.barcode_url || (typeof window !== 'undefined' ? window.location.href : '');

    return (
        <div style={{ minHeight: '100vh', backgroundColor: '#f3f4f6', display: 'flex', justifyContent: 'center', padding: '20px' }}>

            <div style={{
                width: '100%', maxWidth: '400px', backgroundColor: 'white',
                borderRadius: '16px', overflow: 'hidden',
                boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)',
                height: 'fit-content', marginTop: '20px'
            }}>

                <div style={{
                    backgroundColor: isLunas ? '#16a34a' : '#ef4444',
                    padding: '24px', textAlign: 'center'
                }}>
                    <h1 style={{ color: 'white', fontSize: '20px', fontWeight: '800', margin: 0, letterSpacing: '0.5px' }}>
                        {isLunas ? 'SKRD LUNAS' : 'BELUM LUNAS'}
                    </h1>
                </div>

                <div style={{ padding: '32px 24px' }}>

                    <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '32px' }}>
                        <div style={{ padding: '12px', border: '1px solid #e5e7eb', borderRadius: '12px', backgroundColor: 'white' }}>
                            <QRCodeSVG value={qrValue} size={180} level={"H"} />
                        </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

                        <div style={{ borderBottom: '1px solid #f3f4f6', paddingBottom: '12px' }}>
                            <p style={{ fontSize: '13px', color: '#6b7280', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Nomor SKRD</p>
                            <p style={{ fontSize: '16px', fontWeight: '700', color: '#111827' }}>{data.nomor_surat}</p>
                        </div>

                        <div style={{ borderBottom: '1px solid #f3f4f6', paddingBottom: '12px' }}>
                            <p style={{ fontSize: '13px', color: '#6b7280', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Nama Pemilik</p>
                            <p style={{ fontSize: '16px', fontWeight: '600', color: '#111827' }}>{data.nama_pemilik}</p>
                        </div>

                        <div style={{ borderBottom: '1px solid #f3f4f6', paddingBottom: '12px' }}>
                            <p style={{ fontSize: '13px', color: '#6b7280', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Alamat</p>
                            <p style={{ fontSize: '15px', color: '#374151', lineHeight: '1.4' }}>{data.alamat_bangunan}</p>
                        </div>

                        <div style={{ borderBottom: '1px solid #f3f4f6', paddingBottom: '12px' }}>
                            <p style={{ fontSize: '13px', color: '#6b7280', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Nilai Retribusi</p>
                            <p style={{ fontSize: '20px', fontWeight: '900', color: '#111827' }}>{formatRupiah(data.jumlah)}</p>
                        </div>

                        <div style={{ borderBottom: '1px solid #f3f4f6', paddingBottom: '12px' }}>
                            <p style={{ fontSize: '13px', color: '#6b7280', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Jatuh Tempo</p>
                            <p style={{ fontSize: '15px', color: '#374151', fontWeight: '500' }}>{formatDate(data.jatuh_tempo)}</p>
                        </div>

                        <div style={{ borderBottom: '1px solid #f3f4f6', paddingBottom: '12px' }}>
                            <p style={{ fontSize: '13px', color: '#6b7280', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Status Pembayaran</p>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', alignItems: 'flex-start' }}>
                                <span style={{
                                    backgroundColor: isLunas ? '#dcfce7' : '#fee2e2',
                                    color: isLunas ? '#166534' : '#991b1b',
                                    padding: '6px 16px',
                                    borderRadius: '9999px',
                                    fontSize: '13px',
                                    fontWeight: '800',
                                    textTransform: 'uppercase'
                                }}>
                                    {isLunas ? 'SUDAH LUNAS' : 'BELUM DIBAYAR'}
                                </span>
                                {isLunas && (
                                    <span style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>
                                        Tanggal Bayar: {data.tanggal_pelunasan ? formatDateTime(data.tanggal_pelunasan) : '-'}
                                    </span>
                                )}
                            </div>
                        </div>

                        <div>
                            <p style={{ fontSize: '13px', color: '#6b7280', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Tanggal Terbit SKRD</p>
                            <p style={{ fontSize: '15px', color: '#374151' }}>{formatDate(data.tanggal_terbit)}</p>
                        </div>

                    </div>
                </div>

                <div style={{ backgroundColor: '#f9fafb', padding: '20px', textAlign: 'center', borderTop: '1px solid #e5e7eb' }}>
                    <p style={{ fontSize: '12px', color: '#9ca3af', fontWeight: '500' }}>ptspgowakab.com</p>
                </div>
            </div>
        </div>
    );
}

export default function VerifyPage() {
    return (
        <Suspense fallback={<div className="flex h-screen items-center justify-center">Loading...</div>}>
            <VerifyContent />
        </Suspense>
    );
}