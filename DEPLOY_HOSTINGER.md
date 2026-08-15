# Panduan Deploy ke Hostinger Business Web Hosting

Proyek ini telah dikonfigurasi agar kompatibel penuh dengan **Hostinger Business Web Hosting** (LiteSpeed/Apache).

---

## Cara 1: Build di Komputer & Upload ke Hostinger (Paling Mudah)

1. **Jalankan Build Proyek:**
   Buka terminal di folder proyek (`E:\backup file F\Cavallery-Website`) lalu jalankan:
   ```bash
   npm run build
   ```

2. **Hasil Build:**
   Setelah proses selesai, akan terbentuk folder bernama **`out/`**.

3. **Upload ke Hostinger hPanel:**
   * Buka **Hostinger hPanel** > **Websites** > Pilih Website Anda > **File Manager**.
   * Masuk ke folder **`public_html/`**.
   * Hapus file bawaan (jika ada file seperti `default.php`).
   * **Buka folder `out/` di komputer Anda, lalu upload SEMUA ISI di dalam folder `out/`** (termasuk folder `_next`, file `.html`, file `.htaccess`, dll.) langsung ke dalam `public_html/`.
   
   *(⚠️ Pastikan file `index.html` dan `.htaccess` berada tepat di root `public_html/`, bukan di dalam subfolder `public_html/out/`).*

4. **Selesai!** Website Cavallery Anda sudah online dan dapat diakses dengan cepat.

---

## Cara 2: Deploy Otomatis via GitHub Actions ke Hostinger FTP

Jika Anda menggunakan Git/GitHub, Anda bisa membuat deploy otomatis setiap kali Anda melakukan `git push`.
File konfigurasi `.htaccess` dan `next.config.ts` sudah disiapkan.
