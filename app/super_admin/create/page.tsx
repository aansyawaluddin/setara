'use client';

import React, { useState } from 'react';
import { ArrowLeft, User, Loader2, UploadCloud } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import ModalConfirm from '@/lib/components/ModalConfirm';

const TambahUserPage = () => {
    const router = useRouter();

    const [namaLengkap, setNamaLengkap] = useState('');
    const [nip, setNip] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('staff');
    const [fileBarcode, setFileBarcode] = useState<File | null>(null);

    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleValidate = (e: React.FormEvent) => {
        e.preventDefault();

        if (!email || !password || !namaLengkap || !nip) {
            alert("Harap isi semua bidang bertanda bintang (*)");
            return;
        }

        if (role === 'kepala_dinas' && !fileBarcode) {
            alert("Kepala Dinas wajib mengunggah Tanda Tangan Elektronik (Barcode)");
            return;
        }

        setShowConfirmModal(true);
    };

    const handleExecuteSubmit = async () => {
        setLoading(true);

        try {
            let ttd_url = null;

            if (role === 'kepala_dinas' && fileBarcode) {
                const fileExt = fileBarcode.name.split('.').pop();
                const fileName = `${nip}-${Date.now()}.${fileExt}`;
                const filePath = `uploads/${fileName}`;

                const { error: uploadError } = await supabase.storage
                    .from('ttd_barcode')
                    .upload(filePath, fileBarcode, {
                        cacheControl: '3600',
                        upsert: false
                    });

                if (uploadError) {
                    throw new Error(`Gagal unggah barcode: ${uploadError.message}`);
                }

                const { data: { publicUrl } } = supabase.storage
                    .from('ttd_barcode')
                    .getPublicUrl(filePath);

                ttd_url = publicUrl;
            }

            const response = await fetch('/api/admin/create-user', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email,
                    password,
                    nama_lengkap: namaLengkap,
                    nip,
                    role,
                    ttd_barcode: ttd_url
                }),
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || "Gagal membuat akun user.");
            }

            setShowConfirmModal(false);

            setNamaLengkap('');
            setNip('');
            setEmail('');
            setPassword('');
            setRole('staff');
            setFileBarcode(null);

            router.push('/super_admin/dashboard');
            router.refresh();

        } catch (error: any) {
            console.error("Terjadi Kesalahan:", error);
            setShowConfirmModal(false);
            alert("Error: " + error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ minHeight: '100vh', backgroundColor: '#ffffff', fontFamily: 'sans-serif', color: '#111827' }}>
            {/* Loading Overlay */}
            {loading && (
                <div
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: 'rgba(0, 0, 0, 0.5)',
                        zIndex: 9999,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backdropFilter: 'blur(4px)',
                    }}
                >
                    <div
                        style={{
                            backgroundColor: '#ffffff',
                            padding: '32px',
                            borderRadius: '12px',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
                        }}
                    >
                        <Loader2 size={48} className="animate-spin text-[#172433]" style={{ marginBottom: '16px' }} />
                        <p style={{ fontSize: '16px', fontWeight: '600', color: '#1f2937' }}>Menyimpan Data User...</p>
                    </div>
                </div>
            )}

            <nav
                style={{
                    display: 'flex',
                    height: '80px',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    background: 'linear-gradient(90deg, #172433 48%, #3D4650 62%, #3D4650 72%, #172433 89%)',
                    padding: '0 24px',
                }}
            >
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
            </nav>

            <main
                style={{
                    width: '100%',
                    maxWidth: '800px',
                    margin: '0 auto',
                    paddingTop: '40px',
                    paddingBottom: '40px',
                    paddingLeft: '20px',
                    paddingRight: '20px',
                    boxSizing: 'border-box',
                }}
            >
                <button
                    onClick={() => window.history.back()}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        marginBottom: '24px',
                        color: '#4b5563'
                    }}
                >
                    <ArrowLeft size={18} /> Kembali
                </button>

                <h2 style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '32px' }}>Tambah User Baru</h2>

                <form onSubmit={handleValidate} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <label style={{ fontSize: '14px', fontWeight: '600' }}>
                            Nama Lengkap <span style={{ color: 'red' }}>*</span>
                        </label>
                        <input
                            type="text"
                            required
                            placeholder="Masukkan Nama Lengkap"
                            value={namaLengkap}
                            onChange={(e) => setNamaLengkap(e.target.value)}
                            style={{ padding: '12px', border: '1px solid #d1d5db', borderRadius: '8px' }}
                        />
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <label style={{ fontSize: '14px', fontWeight: '600' }}>
                            NIP <span style={{ color: 'red' }}>*</span>
                        </label>
                        <input
                            type="text"
                            inputMode="numeric"
                            pattern="[0-9 ]*"
                            required
                            placeholder="Masukkan NIP"
                            value={nip}
                            onChange={(e) => {
                                const onlyNumberAndSpace = e.target.value.replace(/[^0-9 ]/g, '');
                                setNip(onlyNumberAndSpace);
                            }}
                            style={{ padding: '12px', border: '1px solid #d1d5db', borderRadius: '8px' }}
                        />

                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <label style={{ fontSize: '14px', fontWeight: '600' }}>
                            Email <span style={{ color: 'red' }}>*</span>
                        </label>
                        <input
                            type="email"
                            required
                            placeholder="Masukkan Email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            style={{ padding: '12px', border: '1px solid #d1d5db', borderRadius: '8px' }}
                        />
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <label style={{ fontSize: '14px', fontWeight: '600' }}>
                            Password <span style={{ color: 'red' }}>*</span>
                        </label>
                        <input
                            type="password"
                            required
                            placeholder="Masukkan Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            style={{ padding: '12px', border: '1px solid #d1d5db', borderRadius: '8px' }}
                        />
                    </div>

                    {/* Select Role */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <label style={{ fontSize: '14px', fontWeight: '600' }}>Role <span style={{ color: 'red' }}>*</span></label>
                        <select
                            value={role}
                            onChange={(e) => setRole(e.target.value)}
                            style={{ padding: '12px', border: '1px solid #d1d5db', borderRadius: '8px', backgroundColor: 'white' }}
                        >
                            <option value="staff">Staff</option>
                            <option value="kepala_dinas">Kepala Dinas</option>
                        </select>
                    </div>

                    {role === 'kepala_dinas' && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <label style={{ fontSize: '14px', fontWeight: '600' }}>
                                Tanda Tangan Elektronik (Barcode) <span style={{ color: 'red' }}>*</span>
                            </label>
                            <div
                                style={{
                                    border: '2px dashed #d1d5db',
                                    borderRadius: '12px',
                                    padding: '40px',
                                    textAlign: 'center',
                                    cursor: 'pointer',
                                    backgroundColor: '#f9fafb'
                                }}
                                onClick={() => document.getElementById('fileInput')?.click()}
                            >
                                <input
                                    type="file"
                                    id="fileInput"
                                    hidden
                                    accept="image/*"
                                    onChange={(e) => setFileBarcode(e.target.files?.[0] || null)}
                                />
                                <UploadCloud size={40} style={{ color: '#9ca3af', marginBottom: '12px' }} />
                                <p style={{ fontSize: '16px', fontWeight: '600' }}>
                                    {fileBarcode ? fileBarcode.name : 'Klik untuk Upload atau Drag and Drop'}
                                </p>
                                <p style={{ fontSize: '12px', color: '#6b7280' }}>(Max. File size: 20 MB)</p>
                            </div>
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        style={{
                            marginTop: '16px',
                            padding: '14px',
                            backgroundColor: loading ? '#9ca3af' : '#172433',
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            fontWeight: 'bold',
                            cursor: loading ? 'not-allowed' : 'pointer',
                            transition: 'background-color 0.2s'
                        }}
                    >
                        {loading ? 'Sedang Memproses...' : 'Buat User'}
                    </button>
                </form>
            </main>

            <ModalConfirm
                isOpen={showConfirmModal}
                onClose={() => setShowConfirmModal(false)}
                onConfirm={handleExecuteSubmit}
                isLoading={loading}
                title="Konfirmasi Pembuatan User"
                variant="info"
                confirmLabel="Ya, Buat User"
                message={
                    <div style={{ textAlign: 'left' }}>
                        <p style={{
                            textAlign:
                                'center'
                        }}>Apakah data berikut sudah benar?</p>
                        <ul style={{ marginTop: '10px', fontSize: '14px', color: '#374151', paddingLeft: '35px' }}>
                            <li><strong>Nama:</strong> {namaLengkap}</li>
                            <li><strong>NIP:</strong> {nip}</li>
                            <li><strong>Role:</strong> {role === 'kepala_dinas' ? 'Kepala Dinas' : 'Staff'}</li>
                            <li><strong>Email:</strong> {email}</li>
                        </ul>
                    </div>
                }
            />
        </div>
    );
};

export default TambahUserPage;