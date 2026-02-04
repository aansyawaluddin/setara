'use client';

import React, { useEffect, useState } from 'react';
import { ArrowLeft, User, FileText, Loader2, Printer, CheckCircle, Clock } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useSearchParams } from 'next/navigation';
import SuratSKRD from '@/lib/components/SuratSKRD';

const DetailSKRDPage = () => {
    const searchParams = useSearchParams();
    const nomorSuratParam = searchParams.get('nomor_surat');

    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);


    useEffect(() => {
        const fetchDetail = async () => {
            if (!nomorSuratParam) return;

            setLoading(true);
            try {
                const { data: result, error } = await supabase
                    .from('skrd')
                    .select(`
                        *,
                        penanggung_jawab:profiles!kepala_dinas (
                            nama_lengkap,
                            nip,
                            ttd_barcode
                        ),
                        pemberi_persetujuan:profiles!approved_by (
                            nama_lengkap,
                            nip,
                            ttd_barcode
                        )
                    `)
                    .eq('nomor_surat', nomorSuratParam)
                    .single();

                if (error) throw error;
                setData(result);
            } catch (error) {
                console.error("Gagal mengambil detail:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchDetail();
    }, [nomorSuratParam]);

    const formatRupiah = (angka: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0
        }).format(angka);
    };

    // Print
    const handlePrint = () => {
        window.print();
    };

    if (loading) {
        return (
            <div style={{ minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', backgroundColor: '#ffffff', color: '#374151' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
                    <Loader2 size={48} className="animate-spin text-[#172433]" />
                    <p style={{ fontWeight: '500' }}>Memuat detail surat...</p>
                </div>
            </div>
        );
    }

    if (!data) {
        return (
            <div style={{ minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', backgroundColor: '#ffffff' }}>
                <p>Data tidak ditemukan.</p>
            </div>
        );
    }

    return (
        <div style={{ minHeight: '100vh', backgroundColor: '#ffffff', fontFamily: 'sans-serif', color: '#111827' }}>

            <SuratSKRD
                data={{
                    ...data,
                    kadis_profile: data.penanggung_jawab,
                    approved_by_profile: data.pemberi_persetujuan
                }}
            />

            <div className="screen-only">

                {/* Navbar */}
                <nav style={{
                    display: 'flex', height: '80px', alignItems: 'center', justifyContent: 'space-between',
                    backgroundColor: '#172433', padding: '0 40px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <div style={{ fontSize: '30px', fontWeight: '800', letterSpacing: '0.025em', color: '#ffffff' }}>
                            <span>SIM</span><span style={{ color: '#FFCC00' }}>REDA</span>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', lineHeight: '1.2' }}>
                            <span style={{ fontSize: '11px', fontWeight: '500', color: '#ffffff' }}>Sistem Informasi Manajemen</span>
                            <span style={{ fontSize: '11px', fontWeight: '500', color: '#ffffff' }}>Retribusi Daerah</span>
                        </div>
                    </div>
                </nav>

                <main style={{
                    width: '100%',
                    paddingTop: '40px',
                    paddingBottom: '80px',
                    paddingLeft: '120px',
                    paddingRight: '120px',
                    boxSizing: 'border-box'
                }}>

                    <div style={{ marginBottom: '40px' }}>
                        <h1 style={{ fontSize: '36px', fontWeight: '800', marginBottom: '8px', color: '#000000' }}>Detail SKRD</h1>
                        <p style={{ fontSize: '16px', color: '#374151' }}>No. Surat : {data.nomor_surat}</p>
                    </div>

                    <button
                        type="button"
                        onClick={() => window.history.back()}
                        style={{
                            display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', fontWeight: '600',
                            marginBottom: '32px', color: '#374151', background: 'none', border: 'none', cursor: 'pointer'
                        }}
                    >
                        <ArrowLeft size={18} /> Kembali ke Beranda
                    </button>

                    <div style={{ borderBottom: '1px solid #e5e7eb', marginBottom: '32px' }}>
                        <div style={{
                            display: 'inline-block',
                            padding: '12px 0',
                            color: '#007bff',
                            fontWeight: '700',
                            borderBottom: '2px solid #007bff',
                            marginBottom: '-1px',
                            cursor: 'pointer'
                        }}>
                            Data Pemilik SKRD
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', columnGap: '64px', rowGap: '32px', marginBottom: '48px' }}>
                        <div>
                            <p style={{ fontSize: '14px', fontWeight: '700', color: '#000000', marginBottom: '8px' }}>Nama Pemilik Bangunan</p>
                            <p style={{ fontSize: '16px', color: '#374151' }}>{data.nama_pemilik}</p>
                        </div>
                        <div>
                            <p style={{ fontSize: '14px', fontWeight: '700', color: '#000000', marginBottom: '8px' }}>Alamat Bangunan</p>
                            <p style={{ fontSize: '16px', color: '#374151' }}>{data.alamat_bangunan}</p>
                        </div>
                        <div>
                            <p style={{ fontSize: '14px', fontWeight: '700', color: '#000000', marginBottom: '8px' }}>Kode Rekening</p>
                            <p style={{ fontSize: '16px', color: '#374151' }}>{data.kode_rekening}</p>
                        </div>
                        <div>
                            <p style={{ fontSize: '14px', fontWeight: '700', color: '#000000', marginBottom: '8px' }}>Jenis Retribusi</p>
                            <div style={{ fontSize: '16px', color: '#374151', lineHeight: '1.6', whiteSpace: 'pre-line' }}>{data.jenis_retribusi}</div>
                        </div>
                        <div>
                            <p style={{ fontSize: '14px', fontWeight: '700', color: '#000000', marginBottom: '8px' }}>Jumlah Ketetapan Pokok Retribusi</p>
                            <p style={{ fontSize: '16px', color: '#374151' }}>{formatRupiah(data.jumlah)}</p>
                        </div>
                        <div>
                            <p style={{ fontSize: '14px', fontWeight: '700', color: '#000000', marginBottom: '8px' }}>Terbilang</p>
                            <p style={{ fontSize: '16px', color: '#374151', lineHeight: '1.6', textTransform: 'capitalize' }}>{data.terbilang}</p>
                        </div>
                    </div>

                    <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: '#007bff', marginBottom: '24px' }}>Status Permohonan</h3>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '30px', alignItems: 'start' }}>

                        {/* Kolom 1: Penanggung Jawab */}
                        <div>
                            <p style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '10px' }}>
                                Kepala Dinas Penanggung Jawab
                            </p>
                            {/* Mengambil nama dari hasil join penanggung_jawab */}
                            <p style={{ fontSize: '15px', color: '#374151', margin: 0 }}>
                                {data.penanggung_jawab?.nama_lengkap || 'Data tidak tersedia'}
                            </p>
                            <p style={{ fontSize: '13px', color: '#6b7280' }}>
                                NIP. {data.penanggung_jawab?.nip || '-'}
                            </p>
                        </div>

                        {/* Kolom 2: Status */}
                        <div>
                            <p style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '10px' }}>Status</p>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: data.status ? '#10b981' : '#f59e0b', fontWeight: '600' }}>
                                {data.status ? <CheckCircle size={18} /> : <Clock size={18} />}
                                {data.status ? "Diterbitkan" : "Menunggu Validasi"}
                            </div>
                        </div>

                        {/* Kolom 3: Tanggal */}
                        <div>
                            <p style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '10px' }}>Tanggal Permohonan SKRD</p>
                            <p style={{ fontSize: '15px', color: '#374151' }}>{new Date(data.tanggal_permohonan).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                        </div>

                        {/* Kolom 4: Button Print (Hanya Muncul Jika Status TRUE) */}
                        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                            {data.status === true ? (
                                <div style={{ width: '180px', border: '1px solid #d1d5db', borderRadius: '12px', overflow: 'hidden', textAlign: 'center' }}>
                                    <button
                                        onClick={handlePrint}
                                        style={{ width: '100%', padding: '12px', backgroundColor: '#172433', color: 'white', border: 'none', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                                    >
                                        <Printer size={16} /> Lihat File
                                    </button>
                                </div>
                            ) : (
                                <div style={{ padding: '16px', backgroundColor: '#fff7ed', border: '1px solid #ffedd5', borderRadius: '8px', color: '#9a3412', fontSize: '13px' }}>
                                    Tombol cetak akan muncul setelah dokumen divalidasi oleh Kepala Dinas.
                                </div>
                            )}
                        </div>

                    </div>
                </main>
            </div>
        </div>
    );
};

export default DetailSKRDPage;