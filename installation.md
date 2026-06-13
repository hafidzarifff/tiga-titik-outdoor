# Panduan Instalasi Lokal

Dokumen ini berisi panduan langkah demi langkah untuk menginstal dan menjalankan project **Tiga Titik Outdoor** di komputer lokal Anda setelah melakukan `git clone`.

## Prasyarat
Pastikan komputer Anda sudah terinstal:
- **PHP** (sesuai versi yang dibutuhkan, minimal PHP 8.3)
- **Composer** (untuk manajemen dependensi PHP)
- **Node.js & npm** (untuk manajemen dependensi frontend)
- **Git**

---

## Langkah-Langkah Instalasi

1. **Masuk ke direktori project**
   Setelah melakukan `git clone`, buka terminal/command prompt dan masuk ke folder project:
   ```bash
   cd tiga-titik-outdoor
   ```

2. **Install dependensi PHP (Composer)**
   Jalankan perintah berikut untuk mengunduh semua library PHP yang dibutuhkan oleh Laravel:
   ```bash
   composer install
   ```

3. **Salin file konfigurasi environment (.env)**
   Project membutuhkan file `.env` untuk konfigurasi environment lokal. Salin dari file contoh yang sudah disediakan:
   ```bash
   cp .env.example .env
   ```
   *(Pengguna Windows Command Prompt bisa menggunakan perintah `copy .env.example .env`)*

4. **Generate Application Key**
   Buat application key baru untuk keamanan sesi dan data enkripsi Laravel:
   ```bash
   php artisan key:generate
   ```
   atur configuration database nya seperti ini:
   DB_CONNECTION=mysql
   DB_HOST=127.0.0.1
   DB_PORT=3306
   DB_DATABASE=db_tiga_titik_outdoor
   DB_USERNAME=root
   DB_PASSWORD=

5. **Konfigurasi Database**
   Membuat Database MySQL di Database HeidiSQL Laragon, dengan nama database 'db_tiga_titik_outdoor'

   
6. **Jalankan Migrasi Database**
   Migrasi diperlukan untuk membuat tabel-tabel di database:
   ```bash
   php artisan migrate:fresh --seed
   ```
   *(Jika ditanya apakah ingin membuat database SQLite karena belum ada, pilih **Yes**)*

7. **Install dependensi Frontend (NPM)**
   Unduh library frontend seperti Tailwind, Vue/React, atau dependensi Vite lainnya:
   ```bash
   npm install
   ```

8. **Menjalankan Local Development Server**
   Terakhir, Anda bisa menjalankan server backend (Laravel) dan frontend (Vite) secara bersamaan menggunakan perintah bawaan project ini:
   ```bash
   composer run dev
   ```

   Perintah di atas akan menjalankan Laravel local server (`php artisan serve`), queue worker, dan Vite dev server secara bersamaan.

---

## Opsi Alternatif (Satu Perintah)
Project ini memiliki script otomatis (lihat `composer.json`). Jika Anda sudah menjalankan `composer install`, Anda juga bisa menyelesaikan sebagian besar proses di atas (copy .env, key:generate, migrate, npm install, build) hanya dengan:
```bash
composer run setup
```
Setelah itu, cukup jalankan `composer run dev`.

---
## Selesai! 🎉
Buka browser Anda dan akses aplikasi melalui URL yang tertera di terminal (biasanya `http://localhost:8000`).
