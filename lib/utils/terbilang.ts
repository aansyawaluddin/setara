export function konversiTerbilang(nilai: number): string {
    const angka = Math.abs(nilai);
    const huruf = ["", "satu", "dua", "tiga", "empat", "lima", "enam", "tujuh", "delapan", "sembilan", "sepuluh", "sebelas"];
    let temp = "";

    if (angka < 12) {
        temp = " " + huruf[angka];
    } else if (angka < 20) {
        // 12 - 19
        temp = konversiTerbilang(angka - 10) + " belas";
    } else if (angka < 100) {
        // 20 - 99 (PULUHAN - Bagian ini sebelumnya hilang)
        temp = konversiTerbilang(Math.floor(angka / 10)) + " puluh" + konversiTerbilang(angka % 10);
    } else if (angka < 200) {
        // 100 - 199
        temp = " seratus" + konversiTerbilang(angka - 100);
    } else if (angka < 1000) {
        // 200 - 999
        temp = konversiTerbilang(Math.floor(angka / 100)) + " ratus" + konversiTerbilang(angka % 100);
    } else if (angka < 2000) {
        // 1.000 - 1.999
        temp = " seribu" + konversiTerbilang(angka - 1000);
    } else if (angka < 1000000) {
        // 2.000 - 999.999
        temp = konversiTerbilang(Math.floor(angka / 1000)) + " ribu" + konversiTerbilang(angka % 1000);
    } else if (angka < 1000000000) {
        // Juta
        temp = konversiTerbilang(Math.floor(angka / 1000000)) + " juta" + konversiTerbilang(angka % 1000000);
    } else if (angka < 1000000000000) {
        // Milyar
        temp = konversiTerbilang(Math.floor(angka / 1000000000)) + " milyar" + konversiTerbilang(angka % 1000000000);
    } else if (angka < 1000000000000000) {
        // Triliun
        temp = konversiTerbilang(Math.floor(angka / 1000000000000)) + " trilyun" + konversiTerbilang(angka % 1000000000000);
    }

    return temp;
}