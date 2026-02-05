'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { ArrowLeft, Key, Eye, EyeOff } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';

import ModalConfirm from '@/lib/components/ModalConfirm';

const DetailUserContent = () => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const userId = searchParams.get('id');

    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    const [showConfirmModal, setShowConfirmModal] = useState(false);

    // State Form Profile
    const [namaLengkap, setNamaLengkap] = useState('');
    const [nip, setNip] = useState('');
    const [email, setEmail] = useState('');
    const [role, setRole] = useState('staff');
    const [isActive, setIsActive] = useState(true);
    const [ttdBarcodeUrl, setTtdBarcodeUrl] = useState('');
    const [newFileBarcode, setNewFileBarcode] = useState<File | null>(null);

    // State Form Password
    const [showPassword, setShowPassword] = useState(false);
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    useEffect(() => {
        if (!userId) {
            alert("ID User tidak ditemukan");
            router.push('/super_admin/dashboard');
            return;
        }

        const fetchUserDetail = async () => {
            setLoading(true);
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', userId)
                .single();

            if (error) {
                alert("Gagal mengambil data user");
            } else if (data) {
                setNamaLengkap(data.nama_lengkap || '');
                setNip(data.nip || '');
                setEmail(data.email || '');
                setRole(data.role || 'staff');
                setIsActive(data.is_active);
                setTtdBarcodeUrl(data.ttd_barcode || '');
            }
            setLoading(false);
        };

        fetchUserDetail();
    }, [userId, router]);

    const handleValidateUpdate = (e: React.FormEvent) => {
        e.preventDefault();

        if (newPassword && newPassword.length < 6) {
            alert("Password baru minimal 6 karakter!");
            return;
        }

        if (newPassword && newPassword !== confirmPassword) {
            alert("Konfirmasi password tidak cocok!");
            return;
        }

        if (role === 'kepala_dinas' && !ttdBarcodeUrl && !newFileBarcode) {
            alert("Role Kepala Dinas memerlukan Tanda Tangan Elektronik. Silakan upload barcode.");
            return;
        }

        setShowConfirmModal(true);
    };

    const handleExecuteUpdate = async () => {
        setUpdating(true);

        try {
            let finalTtdUrl = ttdBarcodeUrl;

            if (role === 'kepala_dinas' && newFileBarcode) {
                const fileExt = newFileBarcode.name.split('.').pop();
                const fileName = `${nip}-${Date.now()}.${fileExt}`;
                const filePath = `uploads/${fileName}`;

                const { error: uploadError } = await supabase.storage
                    .from('ttd_barcode')
                    .upload(filePath, newFileBarcode);

                if (uploadError) throw uploadError;

                const { data: { publicUrl } } = supabase.storage
                    .from('ttd_barcode')
                    .getPublicUrl(filePath);

                finalTtdUrl = publicUrl;
            }

            const { error: updateError } = await supabase
                .from('profiles')
                .update({
                    nama_lengkap: namaLengkap,
                    nip: nip,
                    role: role,
                    is_active: isActive,
                    ttd_barcode: finalTtdUrl
                })
                .eq('id', userId);

            if (updateError) throw updateError;

            if (newPassword) {
                const res = await fetch('/api/admin/update-password', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ userId, newPassword }),
                });

                const contentType = res.headers.get("content-type");
                if (contentType && contentType.indexOf("application/json") !== -1) {
                    const result = await res.json();
                    if (!res.ok) throw new Error(result.error || "Gagal memperbarui password.");
                } else {
                    const errorText = await res.text();
                    console.error("Server Response:", errorText);
                    throw new Error("Gagal update password (API Error).");
                }
            }

            setShowConfirmModal(false);

            setNewPassword('');
            setConfirmPassword('');

            router.push('/super_admin/dashboard');
            router.refresh();

        } catch (error: any) {
            console.error("Update Error:", error);
            setShowConfirmModal(false);
        } finally {
            setUpdating(false);
        }
    };

    if (loading) return (
        <div style={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center', gap: '12px' }}>
            <div className="animate-spin" style={{ width: '32px', height: '32px', border: '4px solid #f3f3f3', borderTop: '4px solid #172433', borderRadius: '50%' }}></div>
            <span>Memuat data...</span>
        </div>
    );

    return (
        <div style={{ minHeight: '100vh', backgroundColor: '#ffffff', fontFamily: 'sans-serif', color: '#111827' }}>
            <nav
                style={{
                    display: 'flex',
                    height: '80px',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    background: 'linear-gradient(90deg, #172433 48%, #3D4650 62%, #3D4650 72%, #172433 89%)',
                    padding: '0 60px',
                }}
            >
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
            </nav>

            <main style={{ width: '100%', maxWidth: '800px', margin: '0 auto', padding: '40px 20px' }}>
                <button onClick={() => router.back()} style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'none', border: 'none', cursor: 'pointer', marginBottom: '24px', color: '#4b5563' }}>
                    <ArrowLeft size={18} /> Kembali
                </button>

                <h2 style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '32px' }}>Edit Detail User</h2>

                <form onSubmit={handleValidateUpdate} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

                    {/* INFO AKUN */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', padding: '24px', border: '1px solid #e5e7eb', borderRadius: '12px' }}>
                        <h3 style={{ fontSize: '18px', fontWeight: 'bold', borderBottom: '1px solid #e5e7eb', paddingBottom: '10px' }}>Informasi Profil</h3>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <label style={{ fontSize: '14px', fontWeight: '600' }}>Email (Login)</label>
                            <input type="email" value={email} disabled style={{ padding: '12px', backgroundColor: '#f3f4f6', borderRadius: '8px', border: '1px solid #d1d5db' }} />
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <label style={{ fontSize: '14px', fontWeight: '600' }}>Nama Lengkap</label>
                            <input type="text" required value={namaLengkap} onChange={(e) => setNamaLengkap(e.target.value)} style={{ padding: '12px', border: '1px solid #d1d5db', borderRadius: '8px' }} />
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <label style={{ fontSize: '14px', fontWeight: '600' }}>NIP</label>
                            <input type="text" required value={nip} onChange={(e) => setNip(e.target.value)} style={{ padding: '12px', border: '1px solid #d1d5db', borderRadius: '8px' }} />
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <label style={{ fontSize: '14px', fontWeight: '600' }}>Role</label>
                            <select value={role} onChange={(e) => setRole(e.target.value)} style={{ padding: '12px', border: '1px solid #d1d5db', borderRadius: '8px', backgroundColor: 'white' }}>
                                <option value="staff">Staff</option>
                                <option value="kepala_dinas">Kepala Dinas</option>
                            </select>
                        </div>

                        {role === 'kepala_dinas' && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '10px' }}>
                                <label style={{ fontSize: '14px', fontWeight: '600' }}>Update Tanda Tangan (Opsional)</label>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => setNewFileBarcode(e.target.files?.[0] || null)}
                                    style={{ padding: '8px', border: '1px solid #d1d5db', borderRadius: '8px' }}
                                />
                                {ttdBarcodeUrl && !newFileBarcode && (
                                    <p style={{ fontSize: '12px', color: 'green' }}>* User ini sudah memiliki tanda tangan.</p>
                                )}
                            </div>
                        )}

                    </div>

                    {/* UBAH PASSWORD */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', padding: '24px', border: '1px solid #e5e7eb', borderRadius: '12px', backgroundColor: '#f9fafb' }}>
                        <h3 style={{ fontSize: '18px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <Key size={20} /> Keamanan & Password
                        </h3>
                        <p style={{ fontSize: '13px', color: '#6b7280' }}>Kosongkan jika tidak ingin mengubah password user.</p>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                <label style={{ fontSize: '14px', fontWeight: '600' }}>Password Baru</label>
                                <div style={{ position: 'relative' }}>
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        placeholder="Min. 6 karakter"
                                        style={{ padding: '12px', border: '1px solid #d1d5db', borderRadius: '8px', width: '100%', boxSizing: 'border-box' }}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af' }}
                                    >
                                        {showPassword ? <Eye size={18} /> : <EyeOff size={18} />}
                                    </button>
                                </div>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                <label style={{ fontSize: '14px', fontWeight: '600' }}>Konfirmasi Password</label>
                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    placeholder="Ulangi password"
                                    style={{ padding: '12px', border: '1px solid #d1d5db', borderRadius: '8px' }}
                                />
                            </div>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={updating}
                        style={{
                            padding: '16px',
                            backgroundColor: '#172433',
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            fontWeight: 'bold',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px',
                            fontSize: '16px',
                            marginTop: '20px'
                        }}
                    >
                        Simpan Perubahan User
                    </button>
                </form>
            </main>

            <ModalConfirm
                isOpen={showConfirmModal}
                onClose={() => setShowConfirmModal(false)}
                onConfirm={handleExecuteUpdate}
                isLoading={updating}
                title="Konfirmasi Perubahan"
                variant="info"
                confirmLabel="Ya, Simpan Perubahan"
                message={
                    <div style={{ textAlign: 'left' }}>
                        <p style={{ textAlign: 'center' }}>Apakah Anda yakin ingin menyimpan perubahan data untuk user ini?</p>
                        <ul style={{ marginTop: '10px', fontSize: '14px', color: '#374151', paddingLeft: '35px' }}>
                            <li><strong>Nama:</strong> {namaLengkap}</li>
                            <li><strong>NIP:</strong> {nip}</li>
                            <li><strong>Role:</strong> {role === 'kepala_dinas' ? 'Kepala Dinas' : 'Staff'}</li>
                            {newPassword && (
                                <li style={{ color: '#d97706', fontWeight: 'bold' }}>Password akan diperbarui.</li>
                            )}
                        </ul>
                    </div>
                }
            />
        </div>
    );
};

export default function DetailUserPage() {
    return (
        <Suspense fallback={<div style={{ padding: '20px' }}>Loading...</div>}>
            <DetailUserContent />
        </Suspense>
    );
}