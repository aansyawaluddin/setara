import React from 'react';
import { QRCodeSVG } from 'qrcode.react';

interface SuratSKRDProps {
    data: {
        nomor_surat: string;
        nama_pemilik: string;
        alamat_bangunan: string;
        kode_rekening: string;
        jenis_retribusi: string;
        jumlah: number;
        terbilang: string;
        kepala_dinas: string;
        created_at: string;
        barcode_url?: string;
        kadis_profile?: {
            nama_lengkap: string;
            nip: string;
        };
        approved_by_profile?: {
            nama_lengkap: string;
            nip: string;
        };
    };
}

const SuratSKRD = ({ data }: SuratSKRDProps) => {
    if (!data) return null;

    const profile = data.kadis_profile || data.approved_by_profile;

    const tglBuat = new Date(data.created_at);
    const tglJatuhTempo = new Date(tglBuat);
    tglJatuhTempo.setDate(tglBuat.getDate() + 30);

    const qrValue = data.barcode_url || "";

    return (
        <div className="print-wrapper">
            <style jsx global>{`
                @media screen {
                    .print-wrapper { display: none; }
                }
                @media print {
                    @page {
                        size: A4 landscape;
                        margin: 10mm;
                    }
                    body {
                        margin: 0;
                        padding: 0;
                        background-color: white;
                        -webkit-print-color-adjust: exact !important;
                    }
                    body * { visibility: hidden; }
                    .print-wrapper, .print-wrapper * {
                        visibility: visible;
                    }
                    .print-wrapper {
                        position: absolute;
                        left: 0; top: 0; width: 100%;
                        display: block;
                    }
                    .main-container {
                        width: 100%;
                        border: 2px solid black;
                        font-family: Arial, sans-serif;
                        font-size: 10pt;
                        color: black;
                    }
                    table {
                        width: 100%;
                        border-collapse: collapse;
                    }
                    td, th {
                        padding: 5px 8px;
                        vertical-align: top;
                        border: 1px solid black;
                    }
                    .no-border td { border: none; padding: 2px 0; }
                    .text-center { text-align: center; }
                    .text-right { text-align: right; }
                    .font-bold { font-weight: bold; }
                    
                    .barcode-container {
                        width: 100%;
                        height: auto;
                        min-height: 100px;
                        display: flex;
                        justify-content: center;
                        align-items: center;
                        padding: 10px;
                    }
                }
            `}</style>

            <div className="main-container">
                {/* HEADER */}
                <table>
                    <tbody>
                        <tr>
                            <td style={{ width: '68%' }} className="text-center">
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                                    <img src="/gowa.png" alt="Logo" style={{ width: '45px' }} />
                                    <div style={{ textAlign: 'center' }}>
                                        <div className="font-bold" style={{ fontSize: '12pt' }}>PEMERINTAH KABUPATEN GOWA</div>
                                        <div className="font-bold" style={{ fontSize: '12pt' }}>DINAS PERUMAHAN, KAWASAN PERMUKIMAN, DAN PERTANAHAN
                                        </div>
                                        <div className="" style={{ fontSize: '10pt' }}>Jl. Beringin No. 8 Sungguminasa Gowa</div>
                                    </div>
                                </div>
                            </td>
                            <td style={{ width: '15%' }} className="text-center">
                                <div className="font-bold" style={{ fontSize: '16pt' }}>SKRD</div>
                                <div style={{ fontSize: '10pt' }}>SURAT KETETAPAN RETRIBUSI DAERAH</div>
                            </td>
                            <td style={{ width: '17%' }} className="text-center">
                                <div className="font-bold">NOMOR</div>
                                <div style={{ fontSize: '10pt' }}>{data.nomor_surat}</div>
                            </td>
                        </tr>
                    </tbody>
                </table>

                {/* DATA PEMILIK */}
                <table style={{ borderTop: 'none', fontSize: '12pt' }}>
                    <tbody>
                        <tr>
                            <td style={{ padding: '8px 15px' }}>
                                <table className="no-border">
                                    <tbody>
                                        <tr>
                                            <td style={{ width: '180px' }}>Nama Pemilik Bangunan</td>
                                            <td style={{ width: '15px' }}>:</td>
                                            <td className="font-bold">{data.nama_pemilik}</td>
                                        </tr>
                                        <tr>
                                            <td>Alamat Bangunan</td>
                                            <td>:</td>
                                            <td>{data.alamat_bangunan}</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </td>
                        </tr>
                    </tbody>
                </table>

                {/* RINCIAN RETRIBUSI */}
                <table style={{ fontSize: '12pt' }}>
                    <thead>
                        <tr className="text-center font-bold">
                            <td style={{ width: '5%' }}>No</td>
                            <td style={{ width: '15%' }}>Kode Rekening</td>
                            <td style={{ width: '55%' }}>Jenis Retribusi</td>
                            <td style={{ width: '25%' }}>Jumlah (Rp)</td>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td className="text-center">1.</td>
                            <td className="text-center">{data.kode_rekening}</td>
                            <td>
                                <div style={{ marginTop: '5px' }}>
                                    {data.jenis_retribusi ? (
                                        data.jenis_retribusi.split('\n').map((line, index) => (
                                            <div key={index} style={{ fontWeight: index === 0 ? 'bold' : 'normal', marginBottom: '2px' }}>
                                                {line}
                                            </div>
                                        ))
                                    ) : '-'}
                                </div>
                            </td>
                            <td className="text-right" style={{ verticalAlign: 'bottom' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span>Rp</span>
                                    <span>{new Intl.NumberFormat('id-ID').format(data.jumlah)}</span>
                                </div>
                            </td>
                        </tr>
                        <tr className="font-bold">
                            <td colSpan={2} style={{ borderRight: 'none' }}></td>
                            <td className="text-left">Jumlah Ketetapan Pokok Retribusi</td>
                            <td className="text-right">
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span>Rp</span>
                                    <span>{new Intl.NumberFormat('id-ID').format(data.jumlah)}</span>
                                </div>
                            </td>
                        </tr>
                    </tbody>
                </table>

                {/* TERBILANG */}
                <table style={{ fontSize: '12pt' }}>
                    <tbody>
                        <tr>
                            <td className="text-center font-bold" style={{ width: '20%', fontStyle: 'italic' }}>Terbilang</td>
                            <td className="font-bold" style={{ fontStyle: 'italic', textTransform: 'capitalize' }}>
                                {data.terbilang}
                            </td>
                        </tr>
                    </tbody>
                </table>

                {/* TANDA TANGAN / QR CODE */}
                <table style={{ fontSize: '12pt' }}>
                    <tbody>
                        <tr>
                            {/* KOLOM KIRI: PENERIMA */}
                            <td className="text-center" style={{ width: '33%', borderRight: 'none', verticalAlign: 'top' }}>
                                {/* Spacer atas agar sejajar dengan "Kepala Dinas" di kanan */}
                                <div style={{ marginTop: '35px', marginBottom: '5px' }}>Yang Menerima,</div>

                                {/* Spacer Tanda Tangan (Disamakan tingginya dengan area TTE di kanan) */}
                                <div style={{ height: '40px' }}></div>

                                <div className="font-bold">{data.nama_pemilik}</div>
                            </td>

                            {/* KOLOM TENGAH: QR CODE VERIFIKASI */}
                            <td className="text-center" style={{ width: '34%', borderLeft: 'none', borderRight: 'none', verticalAlign: 'middle' }}>
                                <div className="barcode-container">
                                    {qrValue ? (
                                        <QRCodeSVG value={qrValue} size={100} />
                                    ) : (
                                        <div style={{ fontSize: '10pt', color: '#ccc' }}>Belum Divalidasi</div>
                                    )}
                                </div>
                            </td>

                            {/* KOLOM KANAN: KEPALA DINAS */}
                            <td className="text-center" style={{ width: '33%', borderLeft: 'none', verticalAlign: 'top' }}>
                                <div style={{ marginTop: '10px' }}>Gowa, {tglBuat.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
                                <div className="font-bold" style={{ marginBottom: '5px' }}>Kepala Dinas,</div>

                                {/* TTE (Jarak diperpendek menjadi 20px) */}
                                <div className="font-bold" style={{ marginBottom: '20px' }}>TTE</div>

                                <div className="font-bold" style={{ textDecoration: 'underline' }}>
                                    {profile?.nama_lengkap || '................................................'}
                                </div>
                                <div>NIP: {profile?.nip || '................................................'}</div>
                            </td>
                        </tr>
                    </tbody>
                </table>

                <div style={{ padding: '8px', fontSize: '8pt', borderTop: '1px solid black' }}>
                    <strong>Perhatian:</strong> Pembayaran dilakukan paling lambat 30 hari sejak tanggal Terbit SKRD Ini.

                </div>
            </div>
        </div>
    );
};

export default SuratSKRD;