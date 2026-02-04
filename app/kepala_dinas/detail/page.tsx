'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { ArrowLeft, Loader2, Printer, RefreshCcw, Play, CheckCircle, Clock, X } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useSearchParams } from 'next/navigation';
import SuratSKRD from '@/lib/components/SuratSKRD';
import ModalConfirm from '@/lib/components/ModalConfirm';

const DetailSKRDPage = () => {
    const searchParams = useSearchParams();
    const nomorSuratParam = searchParams.get('nomor_surat');

    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    // State untuk Loading Proses
    const [validating, setValidating] = useState(false);
    const [submittingRevisi, setSubmittingRevisi] = useState(false);

    // State untuk Modal Kustom (Revisi)
    const [showModalRevisi, setShowModalRevisi] = useState(false);
    const [alasanRevisi, setAlasanRevisi] = useState("");

    // State untuk Modal Confirm (Validasi)
    const [showValidationModal, setShowValidationModal] = useState(false);

    const fetchDetail = useCallback(async () => {
        if (!nomorSuratParam) return;

        setLoading(true);
        try {
            const { data: result, error } = await supabase
                .from('skrd')
                .select(`
                    *,
                    staff_profile:profiles!created_by (
                        nama_lengkap,
                        nip
                    ),
                    kadis_profile:profiles!kepala_dinas (
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
    }, [nomorSuratParam]);

    useEffect(() => {
        fetchDetail();
    }, [fetchDetail]);

    const formatRupiah = (angka: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0
        }).format(angka);
    };

    const handlePrint = () => {
        window.print();
    };

    const executeValidasi = async () => {
        setValidating(true); 
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("Sesi login tidak ditemukan.");

            const { error } = await supabase
                .from('skrd')
                .update({
                    status: true,
                    approved_by: user.id,
                    tanggal_terbit: new Date().toISOString(),
                    catatan_revisi: null
                })
                .eq('id', data.id);

            if (error) throw error;

            setShowValidationModal(false); 
            await fetchDetail(); 

        } catch (error: any) {
            console.error("Gagal Validasi:", error);
            setShowValidationModal(false);
            alert("Terjadi kesalahan: " + error.message);
        } finally {
            setValidating(false);
        }
    };


    const handleAjukanRevisi = async () => {
        if (!alasanRevisi.trim()) {
            return;
        }

        setSubmittingRevisi(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("Sesi login tidak ditemukan.");

            const { error } = await supabase
                .from('skrd')
                .update({
                    status: false,
                    catatan_revisi: alasanRevisi,
                    approved_by: null,
                    tanggal_terbit: null
                })
                .eq('id', data.id);

            if (error) throw error;

            setShowModalRevisi(false);
            setAlasanRevisi("");
            await fetchDetail();

        } catch (error: any) {
            console.error("Gagal Revisi:", error);
            alert("Gagal mengajukan revisi: " + error.message);
        } finally {
            setSubmittingRevisi(false);
        }
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
        <div style={{ minHeight: '100vh', backgroundColor: '#ffffff', fontFamily: 'sans-serif', color: '#111827', position: 'relative' }}>

            <SuratSKRD data={data} />

            <div className="screen-only">
                {/* Navbar */}
                <nav style={{
                    display: 'flex', height: '80px', alignItems: 'center', justifyContent: 'space-between',
                    background: 'linear-gradient(90deg, #172433 48%, #3D4650 62%, #3D4650 72%, #172433 89%)', padding: '0 40px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
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

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', columnGap: '64px', rowGap: '32px', marginBottom: '32px' }}>
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

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', columnGap: '64px', alignItems: 'end', marginBottom: '24px' }}>
                        <div>
                            <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: '#007bff', margin: 0 }}>Status Permohonan</h3>
                        </div>
                        <div>
                            <p style={{ fontSize: '14px', fontWeight: '700', color: '#000000', marginBottom: '8px' }}>Status</p>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: data.status ? '#10b981' : '#f59e0b', fontWeight: '600', fontSize: '16px' }}>
                                {data.status ? <CheckCircle size={20} /> : <Clock size={20} />}
                                {data.status ? "Diterbitkan" : "Menunggu Validasi"}
                            </div>
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1.5fr', gap: '20px', alignItems: 'start' }}>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                            <div>
                                <p style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '4px' }}>Staff Penginput</p>
                                <p style={{ fontSize: '15px', color: '#111827', margin: 0 }}>{data.staff_profile?.nama_lengkap || '-'}</p>
                                <p style={{ fontSize: '13px', color: '#6b7280' }}>NIP. {data.staff_profile?.nip || '-'}</p>
                            </div>
                            <div>
                                <p style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '4px' }}>Kepala Dinas Penanggung Jawab</p>
                                <p style={{ fontSize: '15px', color: '#111827', margin: 0 }}>{data.kadis_profile?.nama_lengkap || '-'}</p>
                                <p style={{ fontSize: '13px', color: '#6b7280' }}>NIP. {data.kadis_profile?.nip || '-'}</p>
                            </div>
                        </div>

                        <div>{/* Spacer */}</div>

                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', height: '100%' }}>
                            <div style={{ display: 'flex', gap: '12px', marginTop: 'auto' }}>
                                {!data.status ? (
                                    <>
                                        <button
                                            onClick={() => setShowModalRevisi(true)}
                                            style={{
                                                display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px',
                                                backgroundColor: 'white', border: '1px solid #d1d5db', borderRadius: '8px',
                                                fontWeight: '600', cursor: 'pointer', fontSize: '14px'
                                            }}
                                        >
                                            <RefreshCcw size={16} /> Minta Staff Revisi
                                        </button>

                                        <button
                                            onClick={() => setShowValidationModal(true)}

                                            style={{
                                                display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 24px',
                                                backgroundColor: '#172433',
                                                color: 'white', border: 'none', borderRadius: '8px',
                                                fontWeight: '600', cursor: 'pointer', fontSize: '14px'
                                            }}
                                        >
                                            Validasi SKRD
                                            <Play size={14} fill="white" />
                                        </button>
                                    </>
                                ) : (
                                    <button
                                        onClick={handlePrint}
                                        style={{
                                            display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 24px',
                                            backgroundColor: '#172433', color: 'white', border: 'none', borderRadius: '8px',
                                            fontWeight: '600', cursor: 'pointer'
                                        }}
                                    >
                                        <Printer size={18} /> Cetak SKRD
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </main>
            </div>

            <ModalConfirm
                isOpen={showValidationModal}
                onClose={() => setShowValidationModal(false)}
                onConfirm={executeValidasi}
                isLoading={validating}
                title="Konfirmasi Validasi"
                message="Apakah Anda yakin data SKRD ini sudah benar dan ingin menerbitkannya? Tanda tangan elektronik Anda akan dibubuhkan."
                variant="success"
                confirmLabel="Ya, Validasi & Terbitkan"
            />

            {showModalRevisi && (
                <div style={{
                    position: 'fixed', inset: 0, zIndex: 1000,
                    backgroundColor: 'rgba(0, 0, 0, 0.5)',
                    display: 'flex', justifyContent: 'center', alignItems: 'center'
                }}>
                    <div style={{
                        backgroundColor: 'white',
                        borderRadius: '12px',
                        width: '100%', maxWidth: '600px',
                        overflow: 'hidden',
                        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)',
                        margin: '0 20px'
                    }}>
                        <div style={{
                            backgroundColor: '#172433',
                            padding: '20px 24px',
                            color: 'white',
                            display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                        }}>
                            <h2 style={{ fontSize: '18px', fontWeight: '600', margin: 0 }}>
                                Apa Alasan Anda Meminta Revisi?
                            </h2>
                            <button onClick={() => setShowModalRevisi(false)} style={{ background: 'transparent', border: 'none', color: 'white', cursor: 'pointer' }}>
                                <X size={20} />
                            </button>
                        </div>

                        <div style={{ padding: '24px' }}>
                            <textarea
                                value={alasanRevisi}
                                onChange={(e) => setAlasanRevisi(e.target.value)}
                                placeholder="Masukkan alasan revisi (Wajib diisi)"
                                style={{
                                    width: '100%',
                                    height: '150px',
                                    padding: '12px',
                                    borderRadius: '8px',
                                    border: '1px solid #d1d5db',
                                    resize: 'none',
                                    fontSize: '14px',
                                    outline: 'none',
                                    boxSizing: 'border-box',
                                    color: '#374151'
                                }}
                            />
                        </div>

                        <div style={{
                            padding: '0 24px 24px 24px',
                            display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                        }}>
                            <button
                                onClick={() => setShowModalRevisi(false)}
                                disabled={submittingRevisi}
                                style={{
                                    padding: '10px 32px',
                                    backgroundColor: 'white',
                                    border: '1px solid #d1d5db',
                                    borderRadius: '8px',
                                    fontWeight: '600',
                                    color: '#111827',
                                    cursor: 'pointer'
                                }}
                            >
                                Batal
                            </button>

                            <button
                                onClick={handleAjukanRevisi}
                                disabled={submittingRevisi}
                                style={{
                                    padding: '10px 24px',
                                    backgroundColor: '#172433',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '8px',
                                    fontWeight: '600',
                                    cursor: submittingRevisi ? 'not-allowed' : 'pointer',
                                    display: 'flex', alignItems: 'center', gap: '8px',
                                    minWidth: '120px', justifyContent: 'center'
                                }}
                            >
                                {submittingRevisi ? (
                                    <>
                                        <Loader2 className="animate-spin" size={14} />
                                        <span>Memproses...</span>
                                    </>
                                ) : (
                                    <>
                                        <span>Ajukan Revisi</span>
                                        <Play size={14} fill="white" />
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
};

export default DetailSKRDPage;