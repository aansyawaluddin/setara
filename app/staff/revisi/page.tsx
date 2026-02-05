'use client';

import React, { useEffect, useState, useCallback, Suspense } from 'react';
import { ArrowLeft, Loader2, AlertCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useSearchParams, useRouter } from 'next/navigation';
import { konversiTerbilang } from '@/lib/utils/terbilang';
import ModalConfirm from '@/lib/components/ModalConfirm';

// 1. KOMPONEN KONTEN UTAMA (Berisi Logic & useSearchParams)
const RevisiContent = () => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const nomorSuratParam = searchParams.get('nomor_surat');

    const [loading, setLoading] = useState(false);
    const [fetchingData, setFetchingData] = useState(true);

    const [idSurat, setIdSurat] = useState<number | null>(null);
    const [nomorSurat, setNomorSurat] = useState('');
    const [namaPemilik, setNamaPemilik] = useState('');
    const [alamatBangunan, setAlamatBangunan] = useState('');
    const [kodeRekening, setKodeRekening] = useState('');
    const [jenisRetribusi, setJenisRetribusi] = useState('');
    const [kepalaDinas, setKepalaDinas] = useState('');
    const [catatanRevisi, setCatatanRevisi] = useState<string | null>(null);

    const [jumlah, setJumlah] = useState('');
    const [terbilang, setTerbilang] = useState('-');

    const [daftarKadis, setDaftarKadis] = useState<any[]>([]);
    const [loadingKadis, setLoadingKadis] = useState(true);

    // STATE MODAL
    const [showConfirmModal, setShowConfirmModal] = useState(false);

    useEffect(() => {
        const fetchKadis = async () => {
            try {
                const { data, error } = await supabase
                    .from('profiles')
                    .select('id, nama_lengkap')
                    .eq('role', 'kepala_dinas')
                    .eq('is_active', true);

                if (error) throw error;
                setDaftarKadis(data || []);
            } catch (error) {
                console.error('Gagal mengambil data Kepala Dinas:', error);
            } finally {
                setLoadingKadis(false);
            }
        };

        fetchKadis();
    }, []);

    const fetchDetailSKRD = useCallback(async () => {
        if (!nomorSuratParam) return;

        setFetchingData(true);
        try {
            const { data, error } = await supabase
                .from('skrd')
                .select('*')
                .eq('nomor_surat', nomorSuratParam)
                .single();

            if (error) throw error;

            if (data) {
                setIdSurat(data.id);
                setNomorSurat(data.nomor_surat);
                setNamaPemilik(data.nama_pemilik);
                setAlamatBangunan(data.alamat_bangunan);
                setKodeRekening(data.kode_rekening);
                setJenisRetribusi(data.jenis_retribusi);
                setKepalaDinas(data.kepala_dinas);
                setCatatanRevisi(data.catatan_revisi);

                const formattedJumlah = data.jumlah.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
                setJumlah(formattedJumlah);
                setTerbilang(data.terbilang);
            }
        } catch (error) {
            console.error("Gagal mengambil detail:", error);
            router.push('/staff/dashboard');
        } finally {
            setFetchingData(false);
        }
    }, [nomorSuratParam, router]);

    useEffect(() => {
        fetchDetailSKRD();
    }, [fetchDetailSKRD]);

    const handleJumlahChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const rawValue = e.target.value.replace(/[^0-9]/g, '');

        if (rawValue === '') {
            setJumlah('');
            setTerbilang('-');
            return;
        }

        const formattedValue = rawValue.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
        setJumlah(formattedValue);

        const teksTerbilang = konversiTerbilang(parseInt(rawValue));
        setTerbilang(teksTerbilang.trim() + " rupiah");
    };

    const handleValidate = (e: React.FormEvent) => {
        e.preventDefault();

        if (!namaPemilik || !alamatBangunan || !jumlah || !kepalaDinas) {
            return;
        }

        setShowConfirmModal(true);
    };

    const handleExecuteUpdate = async () => {
        setLoading(true);

        try {
            const cleanJumlah = parseInt(jumlah.replace(/\./g, ''));

            const { error } = await supabase
                .from('skrd')
                .update({
                    nama_pemilik: namaPemilik,
                    alamat_bangunan: alamatBangunan,
                    kode_rekening: kodeRekening,
                    jenis_retribusi: jenisRetribusi,
                    jumlah: cleanJumlah,
                    terbilang: terbilang,
                    kepala_dinas: kepalaDinas,
                    catatan_revisi: null,
                    status: false,
                })
                .eq('id', idSurat);

            if (error) throw error;

            // SUKSES
            setShowConfirmModal(false);

            // Redirect
            router.push('/staff/dashboard');

        } catch (error: any) {
            console.error('Error updating SKRD:', error);
            setShowConfirmModal(false);
            alert('Gagal menyimpan perubahan: ' + (error.message || 'Unknown error'));
        } finally {
            setLoading(false);
        }
    };

    if (fetchingData) {
        return (
            <div style={{ minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', backgroundColor: '#ffffff', color: '#374151' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
                    <Loader2 size={48} className="animate-spin text-[#172433]" />
                    <p style={{ fontWeight: '500' }}>Memuat data revisi...</p>
                </div>
            </div>
        );
    }

    return (
        <div style={{ minHeight: '100vh', backgroundColor: '#ffffff', fontFamily: 'sans-serif', color: '#111827' }}>

            {/* Navbar */}
            <nav style={{
                display: 'flex',
                height: '80px',
                alignItems: 'center',
                justifyContent: 'space-between',
                backgroundColor: '#172433',
                padding: '0 60px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{ fontSize: '30px', fontWeight: '800', letterSpacing: '0.025em', color: '#ffffff' }}>
                        <span>Se</span>
                        <span style={{ color: '#FFCC00' }}>tara</span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', lineHeight: '1.2' }}>
                        <span style={{ fontSize: '11px', fontWeight: '500', color: '#ffffff' }}>Sistem Ketetapan</span>
                        <span style={{ fontSize: '11px', fontWeight: '500', color: '#ffffff' }}>Retribusi Daerah</span>
                    </div>
                </div>
            </nav>

            {/* Main Content */}
            <main style={{
                width: '100%', paddingTop: '40px', paddingBottom: '40px',
                paddingLeft: '60px', paddingRight: '120px', boxSizing: 'border-box'
            }}>
                <button
                    type="button"
                    onClick={() => router.back()}
                    style={{
                        display: 'flex', alignItems: 'center', gap: '8px',
                        fontSize: '14px', fontWeight: '600', marginBottom: '24px',
                        color: '#374151', background: 'none', border: 'none', cursor: 'pointer'
                    }}
                >
                    <ArrowLeft size={18} /> Kembali
                </button>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                    <h2 style={{ fontSize: '30px', fontWeight: '800', color: '#000000', margin: 0 }}>
                        Revisi SKRD
                    </h2>
                </div>

                {catatanRevisi && (
                    <div style={{
                        backgroundColor: '#fef2f2',
                        border: '1px solid #fecaca',
                        borderRadius: '8px',
                        padding: '20px',
                        marginBottom: '32px',
                        display: 'flex',
                        gap: '16px',
                        alignItems: 'start'
                    }}>
                        <AlertCircle size={24} color="#dc2626" style={{ marginTop: '2px' }} />
                        <div>
                            <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#991b1b', margin: '0 0 4px 0' }}>
                                Catatan Revisi dari Kepala Dinas
                            </h3>
                            <p style={{ fontSize: '15px', color: '#7f1d1d', margin: 0, lineHeight: '1.5' }}>
                                "{catatanRevisi}"
                            </p>
                            <p style={{ fontSize: '13px', color: '#ef4444', marginTop: '8px', fontStyle: 'italic' }}>
                                *Silakan perbaiki data di bawah ini sesuai catatan tersebut.
                            </p>
                        </div>
                    </div>
                )}

                <form onSubmit={handleValidate} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

                    {/* Nomor */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <label style={{ fontSize: '14px', fontWeight: '600', color: '#111827' }}>Nomor Surat</label>
                        <input
                            disabled
                            type="text"
                            value={nomorSurat}
                            style={{
                                width: '100%', padding: '12px 16px',
                                backgroundColor: '#f3f4f6', border: '1px solid #d1d5db', borderRadius: '8px',
                                color: '#4b5563', cursor: 'not-allowed', outline: 'none', fontWeight: '600'
                            }}
                        />
                    </div>

                    {/* Nama Pemilik Bangunan */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <label style={{ fontSize: '14px', fontWeight: '600', color: '#111827' }}>
                            Nama Pemilik Bangunan <span style={{ color: '#ef4444' }}>*</span>
                        </label>
                        <input
                            type="text"
                            placeholder="Masukkan Nama Pemilik Bangunan"
                            value={namaPemilik}
                            onChange={(e) => setNamaPemilik(e.target.value)}
                            style={{
                                width: '100%', padding: '12px 16px',
                                border: '1px solid #d1d5db', borderRadius: '8px',
                                outline: 'none', backgroundColor: '#ffffff'
                            }}
                        />
                    </div>

                    {/* Alamat Bangunan */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <label style={{ fontSize: '14px', fontWeight: '600', color: '#111827' }}>
                            Alamat Bangunan <span style={{ color: '#ef4444' }}>*</span>
                        </label>
                        <input
                            type="text"
                            placeholder="Masukkan Alamat Bangunan"
                            value={alamatBangunan}
                            onChange={(e) => setAlamatBangunan(e.target.value)}
                            style={{
                                width: '100%', padding: '12px 16px',
                                border: '1px solid #d1d5db', borderRadius: '8px',
                                outline: 'none', backgroundColor: '#ffffff'
                            }}
                        />
                    </div>

                    {/* Kode Rekening */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <label style={{ fontSize: '14px', fontWeight: '600', color: '#111827' }}>
                            Kode Rekening <span style={{ color: '#ef4444' }}>*</span>
                        </label>
                        <input
                            type="text"
                            inputMode="numeric"
                            pattern="[0-9]*"
                            placeholder="Masukkan Kode Rekening"
                            value={kodeRekening}
                            onChange={(e) => setKodeRekening(e.target.value.replace(/\D/g, ''))}
                            style={{
                                width: '100%', padding: '12px 16px',
                                border: '1px solid #d1d5db', borderRadius: '8px',
                                outline: 'none', backgroundColor: '#ffffff'
                            }}
                        />
                    </div>

                    {/* Jenis Retribusi */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <label style={{ fontSize: '14px', fontWeight: '600', color: '#111827' }}>
                            Jenis Retribusi <span style={{ color: '#ef4444' }}>*</span>
                        </label>
                        <textarea
                            rows={4}
                            placeholder="Masukkan Jenis Retribusi"
                            value={jenisRetribusi}
                            onChange={(e) => setJenisRetribusi(e.target.value)}
                            style={{
                                width: '100%', padding: '12px 16px',
                                border: '1px solid #d1d5db', borderRadius: '8px',
                                outline: 'none', backgroundColor: '#ffffff',
                                resize: 'none', fontFamily: 'inherit'
                            }}
                        />
                    </div>

                    {/* Jumlah */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <label style={{ fontSize: '14px', fontWeight: '600', color: '#111827' }}>
                            Jumlah <span style={{ color: '#ef4444' }}>*</span>
                        </label>
                        <input
                            type="text"
                            placeholder="Masukkan Jumlah (Contoh: 3000)"
                            value={jumlah}
                            onChange={handleJumlahChange}
                            style={{
                                width: '100%', padding: '12px 16px',
                                border: '1px solid #d1d5db', borderRadius: '8px',
                                outline: 'none', backgroundColor: '#ffffff'
                            }}
                        />
                    </div>

                    {/* Terbilang (Otomatis) */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <label style={{ fontSize: '14px', fontWeight: '600', color: '#111827' }}>Terbilang (Otomatis)</label>
                        <input
                            disabled
                            type="text"
                            value={terbilang}
                            readOnly
                            style={{
                                width: '100%', padding: '12px 16px',
                                backgroundColor: '#f3f4f6', border: '1px solid #d1d5db', borderRadius: '8px',
                                color: '#4b5563', cursor: 'not-allowed', outline: 'none',
                                fontStyle: 'italic', textTransform: 'capitalize'
                            }}
                        />
                    </div>

                    {/* Kepala Dinas */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <label style={{ fontSize: '14px', fontWeight: '600' }}>Kepala Dinas Penanggung Jawab *</label>
                        <div style={{ position: 'relative' }}>
                            <select
                                value={kepalaDinas}
                                onChange={(e) => setKepalaDinas(e.target.value)}
                                disabled={loadingKadis}
                                style={{
                                    width: '100%', padding: '12px',
                                    border: '1px solid #d1d5db', borderRadius: '8px',
                                    appearance: 'none', backgroundColor: loadingKadis ? '#f3f4f6' : 'white'
                                }}
                            >
                                <option value="" disabled>Pilih Kepala Dinas</option>
                                {daftarKadis.map((item) => (
                                    <option key={item.id} value={item.id}>
                                        {item.nama_lengkap}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Tombol Simpan */}
                    <div style={{ paddingTop: '16px' }}>
                        <button
                            type="submit"
                            disabled={loading}
                            style={{
                                width: '100%',
                                backgroundColor: '#172433',
                                color: '#ffffff',
                                padding: '12px',
                                borderRadius: '8px',
                                fontSize: '16px', fontWeight: 'bold',
                                border: 'none', cursor: 'pointer',
                                boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
                                display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px'
                            }}
                        >
                            Simpan Perubahan & Kirim Ulang
                        </button>
                    </div>

                </form>
            </main>

            <ModalConfirm
                isOpen={showConfirmModal}
                onClose={() => setShowConfirmModal(false)}
                onConfirm={handleExecuteUpdate}
                isLoading={loading}
                title="Konfirmasi Revisi"
                message="Apakah Anda yakin data revisi ini sudah benar? Data akan dikirim ulang untuk divalidasi Kepala Dinas."
                variant="info"
                confirmLabel="Ya, Kirim Revisi"
            />

        </div>
    );
};

// 2. EXPORT HALAMAN UTAMA DENGAN SUSPENSE BOUNDARY
// Ini yang memperbaiki error "missing-suspense-with-csr-bailout"
export default function RevisiSKRD() {
    return (
        <Suspense fallback={
            <div style={{ minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', backgroundColor: '#ffffff' }}>
                <Loader2 size={48} className="animate-spin text-[#172433]" />
            </div>
        }>
            <RevisiContent />
        </Suspense>
    );
}