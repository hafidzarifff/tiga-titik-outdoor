<?php

namespace App\Helpers;

class TerbilangHelper
{
    public static function terbilang($angka)
    {
        $angka = abs($angka);
        $baca = array("", "Satu", "Dua", "Tiga", "Empat", "Lima", "Enam", "Tujuh", "Delapan", "Sembilan", "Sepuluh", "Sebelas");
        $terbilang = "";

        if ($angka < 12) {
            $terbilang = " " . $baca[$angka];
        } else if ($angka < 20) {
            $terbilang = self::terbilang($angka - 10) . " Belas";
        } else if ($angka < 100) {
            $terbilang = self::terbilang($angka / 10) . " Puluh" . self::terbilang($angka % 10);
        } else if ($angka < 200) {
            $terbilang = " Seratus" . self::terbilang($angka - 100);
        } else if ($angka < 1000) {
            $terbilang = self::terbilang($angka / 100) . " Ratus" . self::terbilang($angka % 100);
        } else if ($angka < 2000) {
            $terbilang = " Seribu" . self::terbilang($angka - 1000);
        } else if ($angka < 1000000) {
            $terbilang = self::terbilang($angka / 1000) . " Ribu" . self::terbilang($angka % 1000);
        } else if ($angka < 1000000000) {
            $terbilang = self::terbilang($angka / 1000000) . " Juta" . self::terbilang($angka % 1000000);
        } else if ($angka < 1000000000000) {
            $terbilang = self::terbilang($angka / 1000000000) . " Milyar" . self::terbilang(fmod($angka, 1000000000));
        } else if ($angka < 1000000000000000) {
            $terbilang = self::terbilang($angka / 1000000000000) . " Trilyun" . self::terbilang(fmod($angka, 1000000000000));
        }

        return $terbilang;
    }

    public static function formatRupiah($angka)
    {
        if ($angka == 0) return "Nol Rupiah";
        $hasil = trim(self::terbilang($angka));
        return $hasil . " Rupiah";
    }
}
