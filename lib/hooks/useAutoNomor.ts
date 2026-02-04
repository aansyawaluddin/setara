import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';

interface UseAutoNomorResult {
    nomorSurat: string;
    loadingNomor: boolean;
    refreshNomor: () => Promise<void>;
}

export const useAutoNomor = (): UseAutoNomorResult => {
    const [nomorSurat, setNomorSurat] = useState<string>('Memuat nomor...');
    const [loadingNomor, setLoadingNomor] = useState<boolean>(true);

    // Helper: Konversi Bulan ke Romawi
    const getRomawiBulan = (bulan: number): string => {
        const romawi = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII"];
        return romawi[bulan - 1] || "I";
    };

    const generateNomor = useCallback(async () => {
        setLoadingNomor(true);
        try {
            const currentYear = new Date().getFullYear();
            const romawiBulan = getRomawiBulan(new Date().getMonth() + 1);

            // Cari nomor surat terakhir di tahun ini
            const { data, error } = await supabase
                .from('skrd')
                .select('nomor_surat')
                .ilike('nomor_surat', `%/${currentYear}`)
                .order('id', { ascending: false })
                .limit(1);

            if (error) throw error;

            let nextNumber = 1; 

            if (data && data.length > 0) {
                const lastNomor = data[0].nomor_surat;
                const parts = lastNomor.split('/');
                
                if (parts.length >= 3) {
                    const lastUrutan = parseInt(parts[2]);
                    if (!isNaN(lastUrutan)) {
                        nextNumber = lastUrutan + 1;
                    }
                }
            }

            // Format menjadi 3 digit (001, 010, 100)
            const formattedNumber = nextNumber.toString().padStart(3, '0');

            // Susun String Final
            const newNomor = `SKRD-PBG/PERKIMTAN-GW/${formattedNumber}/${romawiBulan}/${currentYear}`;
            
            setNomorSurat(newNomor);

        } catch (err) {
            console.error("Gagal generate nomor:", err);
            setNomorSurat("Error generating number");
        } finally {
            setLoadingNomor(false);
        }
    }, []);

    useEffect(() => {
        generateNomor();
    }, [generateNomor]);

    return { nomorSurat, loadingNomor, refreshNomor: generateNomor };
};