'use client';

import React, { useEffect, useState } from 'react';
import { ArrowLeft, User, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { konversiTerbilang } from '../../../lib/utils/terbilang';
import { useAutoNomor } from '../../../lib/hooks/useAutoNomor';
import ModalConfirm from '@/lib/components/ModalConfirm';

const SKRDPage = () => {
    const { nomorSurat, loadingNomor, refreshNomor } = useAutoNomor();

    const [loading, setLoading] = useState(false);
    const [daftarKadis, setDaftarKadis] = useState<any[]>([]);
    const [loadingKadis, setLoadingKadis] = useState(true);

    const [namaPemilik, setNamaPemilik] = useState('');
    const [alamatBangunan, setAlamatBangunan] = useState('');
    const [kodeRekening, setKodeRekening] = useState('');
    const [jenisRetribusi, setJenisRetribusi] = useState('');
    const [kepalaDinas, setKepalaDinas] = useState('');

    const [jumlah, setJumlah] = useState('');
    const [terbilang, setTerbilang] = useState('-');

    // STATE UNTUK MODAL
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

        if (!namaPemilik || !alamatBangunan || !jumlah || !kepalaDinas || !kodeRekening || !jenisRetribusi) {
            return;
        }

        setShowConfirmModal(true);
    };

    const handleExecuteSubmit = async () => {
        setLoading(true);

        try {
            const cleanJumlah = parseInt(jumlah.replace(/\./g, ''));
            const { data: existing } = await supabase
                .from('skrd')
                .select('id')
                .eq('nomor_surat', nomorSurat)
                .single();

            if (existing) {
                await refreshNomor();
                setLoading(false);
                setShowConfirmModal(false);
                alert("Nomor surat sudah terpakai. Nomor telah diperbarui otomatis. Silakan klik Buat lagi.");
                return;
            }

            const { error } = await supabase
                .from('skrd')
                .insert([{
                    nomor_surat: nomorSurat,
                    nama_pemilik: namaPemilik,
                    alamat_bangunan: alamatBangunan,
                    kode_rekening: kodeRekening,
                    jenis_retribusi: jenisRetribusi,
                    jumlah: cleanJumlah,
                    terbilang: terbilang,
                    kepala_dinas: kepalaDinas,
                    status: false
                }]);

            if (error) throw error;

            setShowConfirmModal(false);

            window.location.href = '/staff/dashboard';

        } catch (error: any) {
            console.error('Error saving SKRD:', error);
            setShowConfirmModal(false);
            alert('Gagal membuat surat: ' + (error.message || 'Unknown error'));
        } finally {
            setLoading(false);
        }
    };

    const selectedKadisName = daftarKadis.find(k => k.id === kepalaDinas)?.nama_lengkap || '-';

    return (
        <div style={{ minHeight: '100vh', backgroundColor: '#ffffff', fontFamily: 'sans-serif', color: '#111827' }}>

            {/* Navbar */}
            <nav style={{
                display: 'flex',
                height: '80px',
                alignItems: 'center',
                justifyContent: 'space-between',
                backgroundColor: '#172433',
                padding: '0 40px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{ fontSize: '30px', fontWeight: '800', letterSpacing: '0.025em', color: '#ffffff' }}>
                        <span>SIM</span>
                        <span style={{ color: '#FFCC00' }}>REDA</span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', lineHeight: '1.2' }}>
                        <span style={{ fontSize: '11px', fontWeight: '500', color: '#ffffff' }}>Sistem Informasi Manajemen</span>
                        <span style={{ fontSize: '11px', fontWeight: '500', color: '#ffffff' }}>Retribusi Daerah</span>
                    </div>
                </div>
            </nav>

            {/* Main Content */}
            <main
                style={{
                    width: '100%',
                    paddingTop: '40px', paddingBottom: '40px',
                    paddingLeft: '120px', paddingRight: '120px',
                    boxSizing: 'border-box'
                }}
            >
                <button
                    type="button"
                    onClick={() => window.history.back()}
                    style={{
                        display: 'flex', alignItems: 'center', gap: '8px',
                        fontSize: '14px', fontWeight: '600', marginBottom: '24px',
                        color: '#374151', background: 'none', border: 'none', cursor: 'pointer'
                    }}
                >
                    <ArrowLeft size={18} />
                    Kembali ke Beranda
                </button>

                <h2 style={{ fontSize: '30px', fontWeight: '800', marginBottom: '32px', color: '#000000' }}>
                    Surat Ketetapan Retribusi Daerah
                </h2>

                <form
                    onSubmit={handleValidate}
                    style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}
                >
                    {/* Nomor (Otomatis) */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <label style={{ fontSize: '14px', fontWeight: '600', color: '#111827' }}>Nomor</label>
                            <span style={{ color: '#3b82f6', fontSize: '12px', fontWeight: '500', fontStyle: 'italic' }}>Otomatis</span>
                        </div>
                        <input
                            disabled
                            type="text"
                            value={nomorSurat}
                            readOnly
                            style={{
                                width: '100%', padding: '12px 16px',
                                backgroundColor: '#e5e7eb', border: '1px solid #d1d5db', borderRadius: '8px',
                                color: '#4b5563', cursor: 'not-allowed', outline: 'none'
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
                            onChange={(e) => {
                                const onlyNumber = e.target.value.replace(/\D/g, '');
                                setKodeRekening(onlyNumber);
                            }}
                            style={{
                                width: '100%',
                                padding: '12px 16px',
                                border: '1px solid #d1d5db',
                                borderRadius: '8px',
                                outline: 'none',
                                backgroundColor: '#ffffff'
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
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <label style={{ fontSize: '14px', fontWeight: '600', color: '#111827' }}>Terbilang</label>
                            <span style={{ color: '#3b82f6', fontSize: '12px', fontWeight: '500', fontStyle: 'italic' }}>Otomatis</span>
                        </div>
                        <input
                            disabled
                            type="text"
                            value={terbilang}
                            readOnly
                            style={{
                                width: '100%', padding: '12px 16px',
                                backgroundColor: '#e5e7eb', border: '1px solid #d1d5db', borderRadius: '8px',
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
                                style={{ width: '100%', padding: '12px', border: '1px solid #d1d5db', borderRadius: '8px', appearance: 'none', backgroundColor: loadingKadis ? '#f3f4f6' : 'white' }}
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

                    {/* Tombol Buat */}
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
                            Buat Surat
                        </button>
                    </div>

                </form>
            </main>
            <ModalConfirm
                isOpen={showConfirmModal}
                onClose={() => setShowConfirmModal(false)}
                onConfirm={handleExecuteSubmit}
                isLoading={loading}
                title="Konfirmasi Pembuatan Surat"
                variant="info"
                confirmLabel="Ya, Buat Surat"
                message={
                    <div style={{ textAlign: 'left' }}>
                        <p style={{ textAlign: 'center' }}>Pastikan data berikut sudah benar:</p>
                        <ul style={{ marginTop: '10px', fontSize: '14px', color: '#374151', paddingLeft: '35px', lineHeight: '1.6' }}>
                            <li><strong>Nomor Surat:</strong> {nomorSurat}</li>
                            <li><strong>Pemilik:</strong> {namaPemilik}</li>
                            <li><strong>Alamat:</strong> {alamatBangunan}</li>
                            <li><strong>Rekening:</strong> {kodeRekening}</li>
                            <li style={{ display: 'flex', alignItems: 'flex-start', gap: '4px' }}>
                                <strong>Jenis:</strong>
                                <span style={{ whiteSpace: 'pre-wrap' }}>{jenisRetribusi}</span>
                            </li>

                            <li><strong>Jumlah:</strong> Rp {jumlah}</li>
                            <li><strong>Kepala Dinas:</strong> {selectedKadisName}</li>
                        </ul>
                    </div>
                }
            />

        </div>
    );
};

export default SKRDPage;