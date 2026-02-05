'use client';

import React, { useState, useEffect } from 'react';
import {
    User,
    ArrowLeft,
    FileText,
    Wallet,
} from 'lucide-react';
import Link from "next/link";
import { Poppins } from 'next/font/google';
import { supabase } from '@/lib/supabase';

const poppins = Poppins({
    subsets: ['latin'],
    weight: ['400', '500', '600', '700', '800'],
    variable: '--font-poppins',
});

// Interface untuk data SKRD
interface SKRDData {
    id: number;
    status_pembayaran: string;
    jumlah: number;
    tanggal_pelunasan: string | null;
    tanggal_terbit: string | null;
}

export default function RekapitulasiPage() {
    const [userName, setUserName] = useState('');

    // State Statistik
    const [totalSKRD, setTotalSKRD] = useState(0);
    const [totalLunas, setTotalLunas] = useState(0);
    const [persenLunas, setPersenLunas] = useState(0);

    const [totalUangMasuk, setTotalUangMasuk] = useState(0);
    const [targetPendapatan, setTargetPendapatan] = useState(4000000000); // TARGET TETAP 4 Milyar
    const [persenUang, setPersenUang] = useState(0);

    // State Chart: 4 Triwulan, masing-masing 3 bulan
    const [chartData, setChartData] = useState<number[][]>([
        [0, 0, 0], [0, 0, 0], [0, 0, 0], [0, 0, 0]
    ]);
    const [maxChartValue, setMaxChartValue] = useState(1);

    // Helper Nama Bulan untuk Tooltip
    const monthNames = [
        ["Januari", "Februari", "Maret"],      // Triwulan 1
        ["April", "Mei", "Juni"],              // Triwulan 2
        ["Juli", "Agustus", "September"],      // Triwulan 3
        ["Oktober", "November", "Desember"]    // Triwulan 4
    ];

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

    const calculateStatistics = async () => {
        try {
            const { data, error } = await supabase
                .from('skrd')
                .select('id, status_pembayaran, jumlah, tanggal_pelunasan, tanggal_terbit');

            if (error) throw error;

            const skrdData = data as SKRDData[] || [];

            // 1. Hitung Total SKRD & Lunas
            const total = skrdData.length;
            const lunas = skrdData.filter(item => item.status_pembayaran === 'LUNAS').length;
            setTotalSKRD(total);
            setTotalLunas(lunas);
            setPersenLunas(total > 0 ? (lunas / total) * 100 : 0);

            // 2. Hitung Uang (Realisasi) vs Target 4 Milyar
            let uangMasuk = 0;
            const TARGET_FIXED = 4000000000;

            // Init Chart Temp
            const tempChart = [[0, 0, 0], [0, 0, 0], [0, 0, 0], [0, 0, 0]];

            skrdData.forEach(item => {
                const nilai = Number(item.jumlah) || 0;

                if (item.status_pembayaran === 'LUNAS') {
                    uangMasuk += nilai;

                    if (item.tanggal_pelunasan) {
                        const date = new Date(item.tanggal_pelunasan);
                        const month = date.getMonth();

                        const triwulanIdx = Math.floor(month / 3);
                        const monthIdx = month % 3;

                        if (triwulanIdx >= 0 && triwulanIdx < 4) {
                            tempChart[triwulanIdx][monthIdx] += nilai;
                        }
                    }
                }
            });

            setTotalUangMasuk(uangMasuk);
            setTargetPendapatan(TARGET_FIXED);
            setPersenUang((uangMasuk / TARGET_FIXED) * 100);

            // --- PERBAIKAN LOGIKA SKALA GRAFIK ---
            let maxTotalTriwulan = 0;
            tempChart.forEach(triwulan => {
                const totalPerTriwulan = triwulan.reduce((acc, curr) => acc + curr, 0);
                if (totalPerTriwulan > maxTotalTriwulan) {
                    maxTotalTriwulan = totalPerTriwulan;
                }
            });

            const calculatedMax = maxTotalTriwulan > 0 ? maxTotalTriwulan * 1.1 : 10000000;

            setMaxChartValue(calculatedMax);
            setChartData(tempChart);

        } catch (error) {
            console.error("Gagal menghitung statistik:", error);
        }
    };

    useEffect(() => {
        fetchUserName();
        calculateStatistics();

        const channel = supabase
            .channel('skrd-realtime')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'skrd' }, () => {
                calculateStatistics();
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    const formatRupiah = (angka: number) => {
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(angka);
    };

    return (
        <div className={poppins.className} style={{ minHeight: '100vh', backgroundColor: '#ffffff', color: '#1f2937', fontFamily: 'var(--font-poppins)' }}>

            {/* --- NAVBAR --- */}
            <nav style={{
                display: 'flex', height: '80px', alignItems: 'center', justifyContent: 'space-between',
                background: 'linear-gradient(90deg, #172433 48%, #3D4650 62%, #3D4650 72%, #172433 89%)',
                padding: '0 60px',
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{ fontSize: '30px', fontWeight: '800', letterSpacing: '0.025em', color: '#ffffff' }}>
                        <span>Se</span><span style={{ color: '#FFCC00' }}>tara</span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', lineHeight: '1.2' }}>
                        <span style={{ fontSize: '11px', fontWeight: '500', color: '#ffffff' }}>Sistem Ketetapan</span>
                        <span style={{ fontSize: '11px', fontWeight: '500', color: '#ffffff' }}>Retribusi Daerah</span>
                    </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '40px' }}>
                    <Link href="/kepala_dinas/dashboard" style={{ color: '#e5e7eb', fontSize: '16px', fontWeight: '500', textDecoration: 'none', cursor: 'pointer', transition: 'color 0.2s' }}>
                        Beranda
                    </Link>
                    <Link href="/kepala_dinas/rekapitulasi" style={{ color: '#FFCC00', fontSize: '16px', fontWeight: '600', textDecoration: 'none', cursor: 'pointer' }}>
                        Rekapitulasi Pembayaran
                    </Link>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#ffffff' }}>
                        <div style={{ display: 'flex', height: '32px', width: '32px', alignItems: 'center', justifyContent: 'center', borderRadius: '9999px', border: '1px solid rgba(255, 255, 255, 0.3)' }}>
                            <User size={18} />
                        </div>
                        <span style={{ fontSize: '14px', fontWeight: '500' }}>{userName || 'AdminPemda'}</span>
                    </div>
                </div>
            </nav>

            {/* --- CONTENT UTAMA --- */}
            <main style={{ maxWidth: '1280px', margin: '0 auto', padding: '40px 60px' }}>

                <div style={{ marginBottom: '32px' }}>
                    <Link href="/kepala_dinas/dashboard" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', fontSize: '14px', fontWeight: '500', color: '#111827', marginBottom: '16px', textDecoration: 'none', cursor: 'pointer' }}>
                        <ArrowLeft size={18} /> Kembali ke Beranda
                    </Link>
                    <h1 style={{ fontSize: '32px', fontWeight: '800', color: '#000000', marginBottom: '8px' }}>Rekapitulasi Pembayaran SKRD</h1>
                    <p style={{ fontSize: '16px', color: '#4b5563' }}>Realisasi penerimaan retribusi daerah dari Surat Ketetapan Retribusi Daerah yang telah dibayarkan</p>
                </div>

                {/* --- CARD SECTION --- */}
                <div style={{ display: 'flex', gap: '24px', marginBottom: '40px' }}>
                    {/* Card 1: Total SKRD Lunas */}
                    <div style={{ flex: 1, border: '1px solid #e5e7eb', borderRadius: '16px', padding: '24px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', backgroundColor: '#fff' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <div>
                                <p style={{ fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '12px' }}>Total SKRD Lunas</p>
                                <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                                    <h2 style={{ fontSize: '42px', fontWeight: '700', color: '#172433', margin: 0, lineHeight: 1 }}>{totalLunas}</h2>
                                </div>
                                <p style={{ fontSize: '14px', color: '#6b7280', marginTop: '8px', fontWeight: '500' }}>/ {totalSKRD} Surat</p>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', justifyContent: 'space-between', height: '100%', gap: '20px' }}>
                                <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: '#FEF3C7', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#D97706' }}>
                                    <FileText size={24} />
                                </div>
                                <span style={{ color: persenLunas < 50 ? '#EF4444' : '#166534', fontWeight: '600', fontSize: '14px' }}>{persenLunas.toFixed(1)}%</span>
                            </div>
                        </div>
                    </div>

                    {/* Card 2: Total Pembayaran Retribusi */}
                    <div style={{ flex: 1, border: '1px solid #e5e7eb', borderRadius: '16px', padding: '24px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', backgroundColor: '#fff' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <div>
                                <p style={{ fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '12px' }}>Total Pembayaran Retribusi</p>
                                <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                                    <h2 style={{ fontSize: '36px', fontWeight: '700', color: '#172433', margin: 0, lineHeight: 1 }}>{formatRupiah(totalUangMasuk)}</h2>
                                </div>
                                <p style={{ fontSize: '14px', color: '#6b7280', marginTop: '8px', fontWeight: '500' }}>
                                    / {formatRupiah(targetPendapatan)} (Target)
                                </p>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', justifyContent: 'space-between', height: '100%', gap: '20px' }}>
                                <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: '#FEF3C7', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#D97706' }}>
                                    <Wallet size={24} />
                                </div>
                                <span style={{ color: persenUang < 50 ? '#EF4444' : '#166534', fontWeight: '600', fontSize: '14px' }}>{persenUang.toFixed(1)}%</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* --- CHART SECTION --- */}
                <div style={{ border: '1px solid #e5e7eb', borderRadius: '16px', padding: '32px', backgroundColor: '#ffffff', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div style={{ width: '12px', height: '24px', backgroundColor: '#172433', borderRadius: '4px' }}></div>
                            <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#000' }}>Realisasi Penerimaan Retribusi Daerah per Triwulan</h3>
                        </div>
                        <div style={{ display: 'flex', gap: '24px' }}>
                            <LegendItem color="#0062D6" label="Bulan Ke-1" />
                            <LegendItem color="#FBBF24" label="Bulan Ke-2" />
                            <LegendItem color="#172433" label="Bulan Ke-3" />
                        </div>
                    </div>

                    <div style={{ display: 'flex', height: '350px', alignItems: 'flex-end', gap: '24px', paddingLeft: '0' }}>
                        {/* Y-Axis Scale */}
                        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '100%', textAlign: 'right', paddingRight: '16px', fontSize: '14px', color: '#1f2937', minWidth: '120px' }}>
                            <span>{formatRupiah(maxChartValue)}</span>
                            <span>{formatRupiah(maxChartValue * 0.75)}</span>
                            <span>{formatRupiah(maxChartValue * 0.5)}</span>
                            <span>{formatRupiah(maxChartValue * 0.25)}</span>
                            <span>Rp 0</span>
                        </div>

                        {/* Chart Bars Area */}
                        <div style={{ flex: 1, display: 'flex', justifyContent: 'space-around', alignItems: 'flex-end', height: '100%', paddingBottom: '0' }}>
                            {chartData.map((dataTriwulan, idx) => {
                                // Hitung total nominal untuk triwulan ini
                                const totalTriwulan = dataTriwulan.reduce((acc, curr) => acc + curr, 0);

                                return (
                                    <ChartBar
                                        key={idx}
                                        label={`Triwulan ${idx + 1}`}
                                        maxValue={maxChartValue}
                                        totalValue={totalTriwulan} // Kirim total ke komponen
                                        // Susunan data: Index 2 (Top/Bulan Ke-3), Index 1 (Middle/Bulan Ke-2), Index 0 (Bottom/Bulan Ke-1)
                                        data={[
                                            {
                                                color: '#172433',
                                                value: dataTriwulan[2],
                                                monthName: monthNames[idx][2]
                                            },
                                            {
                                                color: '#FBBF24',
                                                value: dataTriwulan[1],
                                                monthName: monthNames[idx][1]
                                            },
                                            {
                                                color: '#0062D6',
                                                value: dataTriwulan[0],
                                                monthName: monthNames[idx][0]
                                            }
                                        ]}
                                    />
                                );
                            })}
                        </div>
                    </div>
                </div>

            </main>
        </div>
    );
}

// --- SUB-COMPONENTS ---

function LegendItem({ color, label }: { color: string, label: string }) {
    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', border: '1px solid #e5e7eb', borderRadius: '999px', padding: '6px 12px' }}>
            <div style={{ width: '12px', height: '12px', backgroundColor: color, transform: 'rotate(45deg)' }}></div>
            <span style={{ fontSize: '13px', fontWeight: '500', color: '#1f2937' }}>{label}</span>
        </div>
    );
}

// ChartBar dengan Tooltip Detail & Total Triwulan
function ChartBar({ label, data, maxValue, totalValue }: { label: string, data: { color: string, value: number, monthName: string }[], maxValue: number, totalValue: number }) {
    const MAX_HEIGHT_PX = 280;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', height: '100%', justifyContent: 'flex-end' }}>
            {/* Stacked Bars Container */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', width: '40px', justifyContent: 'flex-end' }}>
                {data.map((item, index) => {
                    const heightPx = maxValue > 0 ? (item.value / maxValue) * MAX_HEIGHT_PX : 0;

                    return (
                        <div
                            key={index}
                            title={`${item.monthName}: ${new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(item.value)}`}
                            style={{
                                width: '100%',
                                height: item.value > 0 ? `${Math.max(heightPx, 6)}px` : '0px',
                                backgroundColor: item.color,
                                borderRadius: '12px',
                                transition: 'all 0.3s ease',
                                opacity: item.value === 0 ? 0 : 1
                            }}
                            onMouseOver={(e) => e.currentTarget.style.filter = 'brightness(1.2)'}
                            onMouseOut={(e) => e.currentTarget.style.filter = 'none'}
                        />
                    );
                })}
            </div>

            {/* Label Container (X-Axis Label + Total Amount) */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                <span style={{ fontSize: '14px', color: '#4b5563', fontStyle: 'italic', fontWeight: '500' }}>
                    {label}
                </span>
                {/* Menampilkan Total Jumlah Triwulan */}
                <span style={{ fontSize: '12px', color: '#111827', fontWeight: '700' }}>
                    {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(totalValue)}
                </span>
            </div>
        </div>
    );
}