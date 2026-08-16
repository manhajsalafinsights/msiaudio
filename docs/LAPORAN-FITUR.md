# Laporan Fitur — Audiomsi (msi-audio)

Website kajian audio Islami dengan sistem akun, pemutar audio YouTube, katalog series/kitab, dan panel admin. Dibuat 2026-08-12.

## 1. Halaman Publik (Pengunjung)

### 1.1 Beranda
- **Hero section** dengan pencarian cepat & statistik situs.
- **Kajian Terbaru** — carousel kartu audio yang berganti otomatis.
- **Lanjutkan Belajar** — hero "Up Next" (CD besar + progress ring) + baris ringkas, disesuaikan dengan progres pemakaian pengguna.
- **Pilihan Untuk Belajar** — rekomendasi pilihan belajar.
- **Pilihan Kitab** — grid kategori kitab/jenis kajian.
- **Series Terbaru** — grid kartu series (kaset pita).
- **Tematik** — section kajian tematik (maks. 4 item).
- **Parenting** — section kajian parenting (maks. 4 item).
- **Talk Show** — section talk show (maks. 4 item).
- **Kategori** — daftar kategori yang bisa di-klik.

### 1.2 Pencarian & Jelajah
- `/explore` — jelajah konten (kajian/series/kategori).
- `/search` — pencarian dengan parameter query.
- Filter berdasarkan **kategori**, **tag**, dan **pemateri/ustadz**.

### 1.3 Katalog
- `/kitab` — daftar kitab/jenis kajian; `/kitab/[slug]` — detail kitab dengan grid kartu series (kaset pita).
- `/series` — daftar series; `/series/[slug]` — detail series berisi daftar sesi audio.
- `/kategori/[slug]`, `/tag/[slug]`, `/pemateri/[slug]` — halaman filter per kategori/tag/pemateri.

### 1.4 Pemutar Audio (Player)
- Halaman `/audio/[slug]` dengan **player lengkap**.
- **CD miring berputar** sebagai identitas visual audio individual.
- **Transkrip karaoke** dari caption YouTube.
- Daftar sesi (dropdown) + tombol **next/previous**.
- **Auto-next** — saat audio selesai, otomatis lanjut ke sesi berikutnya dan langsung memutar (fix `loadVideoById`).

## 2. Akun Pengguna (Profile / Dashboard)

### 2.1 Autentikasi
- Registrasi, login, lupa kata sandi, reset kata sandi, verifikasi email.

### 2.2 Dashboard Pengguna
- **Bookmark** — simpan audio/series favorit.
- **Favorites** — daftar favorit.
- **History** — riwayat pemutaran.
- **Catatan (Notes)** — catatan pribadi per materi.
- **Profil & Pengaturan** — kelola data akun dan preferensi.

## 3. Panel Admin

- **Dashboard** — statistik dan ringkasan konten.
- **Kelola Audio** — daftar, buat, edit, hapus audio; kelola **transkrip**; **import playlist YouTube** (hingga 5000 video, skip video private/deleted, maxDuration 300 detik).
- **Kelola Series** — buat/edit series (judul, cover, jenis, sesi).
- **Kelola Kitab/Jenis Kajian** — buat/edit tipe series, termasuk tipe baru: **Tematik**, **Parenting**, **Talk Show**, dll.
- **Kelola Kategori, Tag, Ustadz** — CRUD lengkap.
- **Media** — manajemen berkas/gambar.
- **Pengguna** — kelola akun pengguna.
- **Pengaturan** — pengaturan situs.

## 4. Catatan Teknis

- Stack: Next.js (App Router), Prisma + Supabase (PostgreSQL), YouTube IFrame API.
- Deploy otomatis ke Vercel dari repo `backup`; setiap perubahan di-commit dan di-push ke `origin` dan `backup`.
