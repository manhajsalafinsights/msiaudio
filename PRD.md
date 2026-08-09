# PRD — MSI Audio

**Product Requirement Document**

| | |
|---|---|
| Nama Produk | **MSI Audio** |
| Ekosistem | Manhaj Salaf Insights (MSI) |
| Tanggal | 6 Agustus 2026 |
| Status | Draft v1.0 |
| Tipe Dokumen | PRD (Product Requirement Document) |

---

## 1. Visi Produk

**MSI Audio** adalah website khusus audio kajian Islam yang berdiri sendiri dalam ekosistem **Manhaj Salaf Insights**. Tujuannya adalah menjadi pusat belajar ilmu syar'i berbasis audio — mirip Apple Podcasts, Audible, atau iPod — tetapi fokus pada kajian-kajian Islam dari para ustadz.

**Statement Visi:**

> Menjadikan kajian Islam dapat diakses kapan saja dan di mana saja, dengan pengalaman mendengarkan yang nyaman, terorganisir, dan mendukung proses belajar bertahap (kurikulum syar'i).

**Nilai Utama:**
- **Fokus Syar'i** — konten hanya kajian Islam dengan referensi yang jelas.
- **Belajar Bertahap** — kajian disusun dalam playlist/kitab berurutan sehingga memudahkan belajar sistematis.
- **Minimalis** — UI bersih, tidak ramai, fokus ke konten dan pemutar audio.
- **Praktis** — admin cukup menempel URL YouTube, tidak perlu upload audio.

---

## 2. Target Pengguna

### 2.1 Persona Utama — Pendengar (User)
- Muslim yang ingin belajar ilmu syar'i secara audio.
- Pelajar / santri / mahasiswa yang mengikuti kajian tertentu.
- Orang yang sulit menghadiri kajian langsung (kesibukan, jarak).
- Orang yang belajar sambil beraktivitas (berkendara, kerja, rumah tangga).

### 2.2 Persona Kedua — Admin
- Pengurus/divisi media MSI.
- Ustadz atau staf teknis yang mengelola konten kajian.
- Tidak harus paham teknis mendalam — cukup memahami YouTube dan data dasar.

### 2.3 Kebutuhan Pengguna
| Kebutuhan | Solusi di Produk |
|---|---|
| Mendengarkan kajian dari mana saja | Player selalu tersedia di layar |
| Melanjutkan kajian yang belum selesai | Continue Listening |
| Melacak kajian yang sudah didengar | Riwayat + Progress belajar |
| Mengulang / mencatat materi | Bookmark + Catatan |
| Belajar urut sesuai kitab | Playlist / Kitab dengan nomor sesi |
| Mencari kajian tertentu | Search + Filter |
| Menghindari konten yang tidak jelas sumbernya | Metadata lengkap: ustadz, kategori, kitab |

---

## 3. Arsitektur Produk

### 3.1 Posisi dalam Ekosistem MSI

```
Ekosistem Manhaj Salaf Insights
│
├── manhajsalafinsights.com        (website utama)
├── audio.manhajsalafinsights.com  (MSI Audio — produk ini)  ← BARU
└── [produk MSI lain di masa depan]
```

- **MSI Audio berdiri sendiri** sebagai aplikasi web terpisah (subdomain), bukan bagian dari website utama.
- Ini meniru pola **Perpustakaan MSI** (produk serupa yang sudah berdiri sendiri dalam ekosistem).

### 3.2 Arsitektur Teknis

```
┌─────────────────────────────────────────────────────┐
│                     VERCEL                          │
│                                                     │
│   Next.js (App Router) — Frontend + API Routes      │
│   ┌─────────────────────────────────────────────┐   │
│   │  Client: Halaman publik (Home, Kategori,    │   │
│   │           Ustadz, Playlist, Detail, Player,  │   │
│   │           Bookmark, History, dst.)          │   │
│   ├─────────────────────────────────────────────┤   │
│   │  Client: Dashboard Admin (CRUD)             │   │
│   ├─────────────────────────────────────────────┤   │
│   │  Server: Server Actions / API Routes        │   │
│   │           (auth, data akses, validasi)      │   │
│   └─────────────────────────────────────────────┘   │
│                     │                               │
└─────────────────────┼───────────────────────────────┘
                      │ Prisma (ORM) + Supabase Client
                      ▼
              ┌─────────────────┐
              │    SUPABASE     │
              │  PostgreSQL DB  │  → hanya METADATA
              │  (Auth optional)│  → TIDAK ada file audio
              └─────────────────┘
```

**Aturan Penting Arsitektur:**
1. **Audio TIDAK disimpan di server.** Tidak ada upload file, tidak ada bucket file audio.
2. Audio **100% berasal dari YouTube**. Admin hanya menempel **URL YouTube**.
3. **Supabase hanya menyimpan metadata** kajian (judul, ustadz, kategori, playlist, URL, durasi, dll).
4. Pemutaran audio dilakukan dengan men-embed/memanggil YouTube di dalam player.
5. Aplikasi disimpan dan di-deploy ke **Vercel**.

### 3.3 Bagaimana Audio "Dimainkan" dari YouTube
| Metode | Penjelasan | Dipakai? |
|---|---|---|
| YouTube Embed (iframe) | Player YouTube standar di halaman | **Ya (utama)** — paling stabil |
| YouTube IFrame Player API | Kontrol player (play/pause/seek) via JS | **Ya (untuk fitur progress)** |
| Audio HTML5 | Tidak mungkin — audio bukan file kita | Tidak |

> Catatan: durasi, posisi pemutaran, dan progress diperoleh dari metadata + log pemutaran di Supabase. Kita **tidak** mengunduh audio.

---

## 4. Sitemap

### 4.1 Sisi Publik (User)

```
audio.manhajsalafinsights.com
│
├── /                                  → Home
│     · Kajian terbaru
│     · Continue Listening
│     · Kategori populer
│     · Playlist terbaru
│     · Ustadz unggulan
│
├── /kategori                          → Daftar semua kategori
├── /kategori/[slug]                   → Detail kategori + daftar kajian
│
├── /ustadz                            → Daftar semua ustadz
├── /ustadz/[slug]                     → Profil ustadz + daftar kajiannya
│
├── /playlist                          → Daftar semua playlist/kitab
├── /playlist/[slug]                   → Detail playlist (isi sesi, urutan)
│
├── /kajian/[slug]                     → Detail audio (halaman pemutar)
│
├── /login                             → Halaman login (user & admin)
│
├── /profil                            → Profil user (protected)
│
├── /bookmark                          → Daftar bookmark user (protected)
├── /riwayat                           → Riwayat pemutaran (protected)
├── /lanjutkan                         → Continue Listening (protected)
│
└── /admin                             → Dashboard Admin (role: admin)
      ├── /admin/kajian                → CRUD Kajian
      ├── /admin/kategori              → CRUD Kategori
      ├── /admin/ustadz                → CRUD Ustadz
      └── /admin/playlist              → CRUD Playlist/Kitab
```

### 4.2 Ringkasan Navigasi

| Halaman | URL | Akses |
|---|---|---|
| Home | `/` | Publik |
| Kategori | `/kategori`, `/kategori/[slug]` | Publik |
| Ustadz | `/ustadz`, `/ustadz/[slug]` | Publik |
| Playlist | `/playlist`, `/playlist/[slug]` | Publik |
| Detail Audio | `/kajian/[slug]` | Publik |
| Login | `/login` | Publik |
| Profil | `/profil` | Login |
| Bookmark | `/bookmark` | Login |
| Riwayat | `/riwayat` | Login |
| Lanjutkan | `/lanjutkan` | Login |
| Admin | `/admin/*` | Role admin |

---

## 5. User Flow (Sisi Pengguna)

### 5.1 Flow Utama — Mendengarkan Kajian

```
Mulai
  │
  ▼
Home → Lihat Kajian Terbaru / Continue Listening / Pilih Kategori
  │
  ▼
Klik kajian → Halaman Detail Audio
  │
  ▼
Player muncul → Tekan Play
  │
  ▼
Audio YouTube diputar (embed player)
  │
  ├──→ Ketuk Bookmark → tersimpan
  ├──→ Ketuk Catatan → tulis catatan
  ├──→ Tutup halaman / berpindah halaman → Player mini tetap muncul
  └──→ Berhenti di tengah → Progress tersimpan otomatis
  │
  ▼
Kembali lagi → Muncul di Continue Listening dengan posisi yang sama
```

### 5.2 Flow — Menjelajah Playlist / Kitab

```
Detail Playlist
  │
  ▼
Lihat daftar sesi (Sesi 1, Sesi 2, ... Sesi N) — berurutan
  │
  ▼
Ketuk Sesi → Play kajian tersebut
  │
  ▼
Sesi selesai → Muncul saran "Sesi Berikutnya"
  │
  ▼
Ketuk → lanjut ke sesi berikutnya (otomatis)
```

### 5.3 Flow — Search & Filter

```
Pencarian
  │
  ▼
Ketuk ikon cari (di header) → masukkan kata kunci
  │
  ▼
Hasil dicocokkan ke: judul kajian, nama ustadz, kategori, judul playlist
  │
  ▼
Tampil daftar hasil → bisa difilter lagi
```

---

## 6. Admin Flow

### 6.1 Alur Umum

```
Admin login → Dashboard Admin
  │
  ▼
Pilih menu (Kajian / Kategori / Ustadz / Playlist)
  │
  ▼
List data → Tombol Tambah / Edit / Hapus / Publish-Unpublish
  │
  ▼
Simpan → data masuk ke Supabase → langsung tampil di sisi publik
```

### 6.2 Flow — Tambah Kajian (Paling Penting)

```
Menu Kajian → Tombol "+ Tambah Kajian"
  │
  ▼
Form Kajian
  │
  ├── PASTE URL YOUTUBE  ← satu-satunya input "berat"
  │     │
  │     ▼
  │   Sistem otomatis ambil:
  │   · Video ID dari URL
  │   · Judul video (opsional, bisa diedit)
  │   · Thumbnail/Cover (opsional)
  │   · Durasi (dari metadata YouTube, jika tersedia)
  │
  ├── Judul Kajian (bisa diedit manual)
  ├── Pilih Ustadz (dropdown dari tabel ustadz)
  ├── Pilih Kategori (dropdown)
  ├── Pilih Playlist/Kitab + Nomor Sesi
  ├── Deskripsi
  ├── Cover (upload/ganti manual — opsional)
  └── Status Publish (Draft / Publish)
  │
  ▼
Simpan → kajian tampil di website sesuai status
```

**Kemudahan:**
- Admin **tidak perlu mengunggah audio apa pun**.
- URL YouTube **wajib**; metadata lain sebagian dapat terisi otomatis.

### 6.3 Publish / Unpublish

| Aksi | Efek |
|---|---|
| `Publish` | Kajian tampil di halaman publik |
| `Draft` | Kajian tersimpan, tidak tampil di publik |
| `Unpublish` | Kajian disembunyikan dari publik (tidak dihapus) |

### 6.4 Role & Permission

| Fitur | Admin | User (terdaftar) | Pengunjung |
|---|---|---|---|
| Lihat kajian publik | ✔ | ✔ | ✔ |
| Cari / filter | ✔ | ✔ | ✔ |
| Putar audio | ✔ | ✔ | ✔ |
| Bookmark | ✔ | ✔ | — |
| Catatan | ✔ | ✔ | — |
| Riwayat & Continue Listening | ✔ | ✔ | — |
| Progress belajar | ✔ | ✔ | — |
| Login | ✔ | ✔ | — |
| CRUD Kajian | ✔ | — | — |
| CRUD Kategori | ✔ | — | — |
| CRUD Ustadz | ✔ | — | — |
| CRUD Playlist | ✔ | — | — |
| Publish/Unpublish | ✔ | — | — |

---

## 7. Database Concept

Database berada di **Supabase (PostgreSQL)**, diakses via **Prisma ORM** dari Next.js.

> Prinsip: hanya menyimpan **metadata**, tidak ada file audio maupun URL besar berlebihan.

### 7.1 Entitas Utama

```
┌──────────────────┐     ┌──────────────────┐
│      Users       │     │     Playlists    │
│──────────────────│     │──────────────────│
│ id               │     │ id               │
│ name             │     │ title            │
│ email            │     │ slug             │
│ passwordHash     │     │ description      │
│ role (USER/ADMIN)│     │ cover            │
│ image            │     │ order            │
│ createdAt        │     │ status           │
└──────────────────┘     └────────┬─────────┘
        ▲                          │
        │                          │
┌───────┴──────────┐   ┌──────────▼──────────┐
│    Bookmarks     │   │     Categories      │
│──────────────────│   │─────────────────────│
│ id               │   │ id                  │
│ userId ──────────┼──►│ name                │
│ kajianId         │   │ slug                │
│ createdAt        │   │ description         │
└──────────────────┘   │ image               │
                       └─────────────────────┘

┌──────────────────┐     ┌──────────────────┐
│    Ustadz        │     │      Kajian      │
│──────────────────│     │──────────────────│
│ id               │     │ id               │
│ name             │     │ title            │
│ slug             │     │ slug             │
│ bio              │     │ description      │
│ photo            │     │ cover            │
│ createdAt        │     │ youtubeUrl       │
└──────────────────┘     │ youtubeId        │
                          │ duration         │
                          │ categoryId ──────┼──► Categories
                          │ ustadzId ────────┼──► Ustadz
                          │ playlistId ──────┼──► Playlists
                          │ sessionNumber    │
                          │ status           │
                          │ viewCount        │
                          │ publishedAt      │
                          │ createdAt        │
                          └──────────────────┘

┌──────────────────┐     ┌──────────────────┐
│  ListeningLogs   │     │     Notes        │
│ (Riwayat)        │     │──────────────────│
│──────────────────│     │ id               │
│ id               │     │ userId           │
│ userId           │     │ kajianId         │
│ kajianId         │     │ content          │
│ positionSeconds  │     │ createdAt        │
│ progressPercent  │     │ updatedAt        │
│ completed (bool) │     └──────────────────┘
│ lastPlayedAt     │
└──────────────────┘
```

### 7.2 Detail Kolom Penting

#### Users
| Kolom | Tipe | Keterangan |
|---|---|---|
| `id` | UUID | PK |
| `name` | String | Nama lengkap |
| `email` | String | Unik, untuk login |
| `passwordHash` | String | Hash (bcrypt) / pakai auth Supabase |
| `role` | Enum | `USER` atau `ADMIN` |
| `image` | String? | Foto profil |
| `createdAt` | Timestamp | |

#### Kajian (Tabel Inti)
| Kolom | Tipe | Keterangan |
|---|---|---|
| `id` | UUID | PK |
| `title` | String | Judul kajian |
| `slug` | String | URL-friendly, unik |
| `description` | Text? | Deskripsi |
| `cover` | String? | URL cover/thumbnail |
| `youtubeUrl` | String | **Wajib** — URL YouTube |
| `youtubeId` | String | Video ID hasil parse URL |
| `duration` | Int? | Durasi dalam detik |
| `ustadzId` | FK | Relasi ke Ustadz |
| `categoryId` | FK | Relasi ke Kategori |
| `playlistId` | FK? | Relasi ke Playlist (opsional) |
| `sessionNumber` | Int? | Nomor sesi dalam playlist |
| `status` | Enum | `DRAFT` / `PUBLISHED` |
| `viewCount` | Int | Hitungan dibuka |
| `publishedAt` | Timestamp? | |
| `createdAt` | Timestamp | |
| `updatedAt` | Timestamp | |

#### Playlists (Kitab / Seri)
| Kolom | Tipe | Keterangan |
|---|---|---|
| `id` | UUID | PK |
| `title` | String | Nama kitab/seri |
| `slug` | String | Unik |
| `description` | Text? | |
| `cover` | String? | |
| `order` | Int | Urutan tampil |
| `status` | Enum | DRAFT/PUBLISHED |

#### Categories, Ustadz
- Struktur serupa: `id`, `name`, `slug`, `description`, `cover/photo`, `createdAt`.

#### ListeningLogs (Riwayat + Continue Listening + Progress)
| Kolom | Tipe | Keterangan |
|---|---|---|
| `id` | UUID | PK |
| `userId` | FK | |
| `kajianId` | FK | |
| `positionSeconds` | Int | Posisi terakhir (detik) |
| `progressPercent` | Float | 0–100 |
| `completed` | Boolean | Sudah selesai/tidak |
| `lastPlayedAt` | Timestamp | Untuk urutan Continue Listening |

- **Unique constraint** pada `(userId, kajianId)` → satu riwayat per kajian per user.

### 7.3 Index yang Disarankan
- `Kajian.status`, `Kajian.publishedAt` — untuk daftar publik.
- `Kajian.categoryId`, `Kajian.ustadzId`, `Kajian.playlistId` — filter.
- `ListeningLogs.userId` — ambil riwayat/continue.
- `Kajian.slug` — lookup halaman.

### 7.4 Catatan Auth
- Bisa memakai **Supabase Auth** (email/password) atau **Auth.js (NextAuth)** dengan provider credentials.
- Perlu data `role` untuk membedakan Admin vs User.

---

## 8. Fitur Lengkap

### 8.1 Fitur Publik (Tanpa Login)

| # | Fitur | Deskripsi |
|---|---|---|
| 1 | Home | Kajian terbaru, continue listening, kategori, playlist, ustadz unggulan |
| 2 | Daftar Kajian | Grid/list kajian publik |
| 3 | Detail Audio | Halaman pemutar: info kajian, ustadz, kategori, playlist, deskripsi |
| 4 | Search | Pencarian global (judul, ustadz, kategori, playlist) |
| 5 | Filter | Filter kategori, ustadz, playlist, urutan terbaru/terlama |
| 6 | Daftar Kategori | Lihat kategori + kajian di dalamnya |
| 7 | Profil Ustadz | Bio ustadz + semua kajiannya |
| 8 | Daftar Playlist | Semua playlist/kitab |
| 9 | Detail Playlist | Sesi berurutan, navigasi sesi, progress per sesi |
| 10 | Player YouTube | Putar/jeda/seek/mute/fullscreen via embed player |
| 11 | Player Mini | Player kecil menempel di bawah layar saat berpindah halaman |
| 12 | Responsive | Berfungsi di HP, tablet, desktop |

### 8.2 Fitur User (Perlu Login)

| # | Fitur | Deskripsi |
|---|---|---|
| 13 | Login / Daftar | Email + password |
| 14 | Bookmark | Simpan kajian favorit, daftar di `/bookmark` |
| 15 | Catatan | Tulis catatan per kajian, edit/hapus |
| 16 | Riwayat | Daftar kajian yang pernah diputar, urut waktu |
| 17 | Continue Listening | Melanjutkan dari posisi terakhir dengan satu ketukan |
| 18 | Progress Belajar | Persentase per kajian + persentase per playlist |
| 19 | Tandai Selesai | Menandai kajian selesai, checklist di playlist |
| 20 | Profil | Kelola profil, logout |

### 8.3 Fitur Admin

| # | Fitur | Deskripsi |
|---|---|---|
| 21 | Login Admin | Role `ADMIN` |
| 22 | Dashboard | Ringkasan jumlah kajian, ustadz, kategori, playlist |
| 23 | CRUD Kajian | Tambah/edit/hapus kajian; paste URL YouTube |
| 24 | CRUD Kategori | Tambah/edit/hapus kategori |
| 25 | CRUD Ustadz | Tambah/edit/hapus ustadz |
| 26 | CRUD Playlist | Tambah/edit/hapus playlist/kitab |
| 27 | Publish/Unpublish | Atur status tampil/tersembunyi |
| 28 | Auto-fetch Metadata | Ambil judul/thumbnail/durasi dari URL YouTube |
| 29 | Preview | Lihat tampilan kajian sebelum publish |

### 8.4 Perilaku Detail Penting

- **Player mini** tetap berjalan saat user berpindah halaman.
- **Progress otomatis** disimpan setiap ±5 detik pemutaran dan saat pause/unmount.
- **Halaman detail** memuat posisi terakhir user untuk melanjutkan.
- **Filter** dapat dikombinasikan (kategori + ustadz sekaligus).
- **Cari** melakukan debounce agar tidak membebani server.
- Halaman publik **tidak butuh login**; fitur personal (bookmark, dll.) butuh login.
- Konten **DRAFT** tidak pernah terlihat di halaman publik.

---

## 9. Future Feature (Roadmap)

| # | Fitur | Prioritas | Keterangan |
|---|---|---|---|
| F1 | Transkrip kajian | Tinggi | Tautan/bacaan transkrip per sesi |
| F2 | Sinkronisasi akun lintas perangkat | Tinggi | Sudah didukung database, tinggal sempurnakan UI |
| F3 | Notifikasi kajian baru | Sedang | Email/push saat playlist baru dirilis |
| F4 | Rekomendasi kajian | Sedang | Berbasis kategori/playlist yang sering didengar |
| F5 | Podcast RSS Feed | Sedang | Ekspor feed ke aplikasi podcast lain |
| F6 | Unduhan (offline) | Rendah | Bergantung kebijakan YouTube, perlu kajian teknis |
| F7 | Kecepatan pemutaran | Sedang | 0.75x / 1x / 1.25x / 1.5x |
| F8 | Mode fokus / layar kunci | Sedang | Minimalis, seperti iPod |
| F9 | Statistik admin | Sedang | Grafik pendengar, kajian terpopuler |
| F10 | Fitur "Jadwal Kajian" | Rendah | Jadwal rutin kajian mingguan |
| F11 | Playlist publik yang dibuat user | Rendah | Playlist kustom per user |
| F12 | Integrasi dengan website utama MSI | Sedang | SSO / link silang antar produk |

---

## 10. Wireframe Sederhana (Text)

### 10.1 Home

```
┌──────────────────────────────────────────────────────────┐
│  [logo MSI Audio]   [Cari...]    [Bookmark] [Riwayat]   │
├──────────────────────────────────────────────────────────┤
│  ▶ Lanjutkan Mendengarkan                                │
│  ┌───────────────────────────────┐                       │
│  │ (cover)  Judul Kajian         │   [▶ Lanjutkan]       │
│  │          Ustadz · 12:34/45:00 │                       │
│  └───────────────────────────────┘                       │
├──────────────────────────────────────────────────────────┤
│  Kajian Terbaru                                          │
│  [cover] [cover] [cover] [cover] [cover] [cover]         │
│   Judul   Judul   Judul   Judul   Judul   Judul          │
├──────────────────────────────────────────────────────────┤
│  Kategori Populer                                        │
│  [Fiqih] [Aqidah] [Tafsir] [Hadits] [Akhlak] [Sirah]     │
├──────────────────────────────────────────────────────────┤
│  Playlist / Kitab                                        │
│  [cover] [cover] [cover] [cover]                         │
│   Kitab   Kitab   Kitab   Kitab                          │
├──────────────────────────────────────────────────────────┤
│  [Mini Player ▸ ▷ ⏸  ... Judul Kajian   ]  ← menempel    │
└──────────────────────────────────────────────────────────┘
```

### 10.2 Detail Audio (Halaman Pemutar)

```
┌──────────────────────────────────────────────────────────┐
│  ← Kembali            Detail Kajian               [⋮]    │
├──────────────────────────────────────────────────────────┤
│                                                          │
│              ┌──────────────────────┐                    │
│              │      (COVER)         │                    │
│              └──────────────────────┘                    │
│                                                          │
│              Judul Kajian                                │
│              Ustadz · Kategori · 45:00                   │
│              Playlist: Kitab X — Sesi 3                  │
│                                                          │
│   ┌───────────────▶▶───────────────┐                     │
│   00:12                    44:48   │                     │
│   [⏮]         [▶⏸]         [⏭]    │                     │
│                                                          │
│   [🔖 Bookmark]   [📝 Catatan]   [↻ Ulang]               │
├──────────────────────────────────────────────────────────┤
│  Deskripsi                                               │
│  ...                                                     │
├──────────────────────────────────────────────────────────┤
│  Daftar Sesi Playlist                                    │
│  ✔ Sesi 1 — Judul               ▶                       │
│  ● Sesi 2 — Judul (sedang)      ▶                       │
│  ◌ Sesi 3 — Judul               ▶                       │
│  ◌ Sesi 4 — Judul               ▶                       │
├──────────────────────────────────────────────────────────┤
│  [Mini Player ▸ ▷ ⏸  ... Judul Kajian   ]               │
└──────────────────────────────────────────────────────────┘
```

### 10.3 Detail Playlist

```
┌──────────────────────────────────────────────────────────┐
│  ← Kembali                                               │
│  ┌──────────────────────────────────────────┐            │
│  │ (cover besar)  Kitab X                   │            │
│  │                Ustadz · 24 Sesi          │            │
│  │                [▶ Putar Semua]           │            │
│  │                Progress: 40% ████░░░░    │            │
│  └──────────────────────────────────────────┘            │
├──────────────────────────────────────────────────────────┤
│  Daftar Sesi                                             │
│  ✔  1  Sesi 1 — Judul             45:00   ▶              │
│  ✔  2  Sesi 2 — Judul             40:00   ▶              │
│  ●  3  Sesi 3 — Judul (berjalan)  42:00   ▶              │
│  ◌  4  Sesi 4 — Judul             50:00   ▶              │
│  ◌  5  Sesi 5 — Judul             38:00   ▶              │
│  ...                                                     │
└──────────────────────────────────────────────────────────┘
```

### 10.4 Halaman Kategori / Ustadz / Playlist (Daftar)

```
┌──────────────────────────────────────────────────────────┐
│  ← Kembali       [Judul / Nama]                    [Cari]│
├──────────────────────────────────────────────────────────┤
│  [Filter: Kategori ▾] [Urutkan: Terbaru ▾]               │
├──────────────────────────────────────────────────────────┤
│  [cover] [cover] [cover] [cover]                         │
│   Judul   Judul   Judul   Judul                          │
│   Ustadz  Ustadz  Ustadz  Ustadz                         │
│  [cover] [cover] [cover] [cover]                         │
│   Judul   Judul   Judul   Judul                          │
│   Ustadz  Ustadz  Ustadz  Ustadz                         │
├──────────────────────────────────────────────────────────┤
│  [Mini Player ▸ ▷ ⏸  ... Judul Kajian   ]               │
└──────────────────────────────────────────────────────────┘
```

### 10.5 Bookmark / Riwayat / Continue Listening

```
┌──────────────────────────────────────────────────────────┐
│  ← Kembali    Bookmark (atau: Riwayat / Lanjutkan)       │
├──────────────────────────────────────────────────────────┤
│  (▶ Lanjutkan, status ▶)                                 │
│  [cover] Judul Kajian          Progress 40%  [▶]        │
│          Ustadz · terakhir: 2 jam lalu                  │
│  [cover] Judul Kajian          Selesai ✔   [▶]           │
│  [cover] Judul Kajian          Progress 10%  [▶]         │
│  ...                                                     │
├──────────────────────────────────────────────────────────┤
│  [Mini Player ▸ ▷ ⏸  ... Judul Kajian   ]               │
└──────────────────────────────────────────────────────────┘
```

### 10.6 Admin — Dashboard & Form Kajian

```
┌──────────────────────────────────────────────────────────┐
│  [MSI Audio]  [Kajian] [Kategori] [Ustadz] [Playlist]    │
├──────────────────────────────────────────────────────────┤
│  Dashboard Admin                                         │
│  [Total Kajian] [Total Ustadz] [Total Kategori] [Playlist]│
│                                                          │
│  Kajian Terbaru                                          │
│  | Judul | Ustadz | Status | Aksi |                      │
│  | ...   | ...    | ...    | ...  |                      │
├──────────────────────────────────────────────────────────┤
│  FORM TAMBAH KAJIAN                                      │
│  URL YouTube    : [________________________________]     │
│  Judul          : [________________________________]     │
│  Ustadz         : [ Pilih Ustadz ▾ ]                     │
│  Kategori       : [ Pilih Kategori ▾ ]                   │
│  Playlist       : [ Pilih Playlist ▾ ] [Sesi: ___]       │
│  Deskripsi      : [________________________________]     │
│  Cover          : [Upload / URL]                         │
│  Status         : (●) Draft  ( ) Publish                 │
│                    [ Simpan ]   [ Batal ]                │
└──────────────────────────────────────────────────────────┘
```

---

## 11. Catatan Teknis

### 11.1 Teknologi
| Komponen | Pilihan |
|---|---|
| Framework | Next.js (App Router) |
| Bahasa | TypeScript |
| Database | PostgreSQL via Supabase |
| ORM | Prisma |
| Auth | Supabase Auth atau Auth.js (NextAuth) |
| Hosting / Deploy | Vercel |
| Domain | `audio.manhajsalafinsights.com` |
| Player | YouTube IFrame Player API / Embed |

### 11.2 Poin Teknis Penting

1. **Tidak menyimpan audio.** Supabase hanya metadata. Semua audio dari YouTube.
2. **Parsing URL YouTube:** dapatkan `youtubeId` dari URL (`youtu.be/`, `watch?v=`, `youtube.com/embed/`). Tampilkan preview dan minta konfirmasi admin sebelum simpan.
3. **Otomatis-metadata:** gunakan YouTube oEmbed API (`https://www.youtube.com/oembed?url=...&format=json`) untuk mengambil judul & thumbnail. Durasi hanya dapat penuh via YouTube Data API (butuh API key) — jadikan opsional/estimasi.
4. **Progress & riwayat:** simpan `positionSeconds` + `progressPercent`; update berkala (mis. tiap 5–10 detik) dan saat pause. Gunakan callback YouTube API (`onStateChange`).
5. **Player mini:** pertahankan state pemutaran lintas rute (context/state global, atau `use` React / Redux / Zustand). Player mini berhenti di halaman yang sepenuhnya berbeda bila perlu (bergantung kebijakan produk).
6. **Loading & SEO:** halaman publik didukung Server Components + ISR/SSR untuk performa; metadata `title`/`description` per halaman kajian agar bagus dibagikan.
7. **Keamanan:** validasi input di server (Server Actions/API), proteksi route admin (middleware + role check), jangan pernah mengekspos kunci API ke client.
8. **Slug unik** untuk kajian, kategori, ustadz, playlist — di-generate otomatis dari judul/nama.
9. **Soft delete vs hard delete:** pertimbangkan soft delete untuk kajian agar riwayat/playlist tidak rusak; status `DRAFT`/`ARCHIVED`.
10. **Env variables:** `DATABASE_URL`, `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `YOUTUBE_API_KEY` (opsional), `AUTH_SECRET`.
11. **Migrasi Prisma** dengan `prisma migrate dev` di dev dan `prisma migrate deploy` di production.
12. **Skalabilitas:** mulai dari satu instance Vercel; static pages + caching untuk konten publik.

### 11.3 Risiko & Pertimbangan
| Risiko | Mitigasi |
|---|---|
| Video YouTube dihapus / tidak tersedia | Tampilkan pesan error pemutaran; admin bisa cek status via Data API |
| Durasi tidak akurat | Jadikan metadata tambahan; tampilkan estimasi |
| Player YouTube tidak bisa download/offline | Future feature perlu kebijakan; tidak termasuk v1 |
| Batasan CORS/otomatis-metadata | Gunakan oEmbed (server-side), tidak dari browser |
| Abuse akun admin | Role admin terpisah, audit log opsional |

### 11.4 Non-Fungsional
| Aspek | Target |
|---|---|
| Performa | LCP < 2,5s pada koneksi 4G |
| Responsif | Mobile-first, bekerja di layar kecil |
| SEO | Judul/deskripsi/OG image per halaman kajian |
| Aksesibilitas | Kontras cukup, tombol berlabel, keyboard navigable |
| Keamanan | Enkripsi password, proteksi admin, validasi server |
| Backup | Backup metadata Supabase (point-in-time) |

---

## 12. Kriteria Selesai (Definition of Done — v1)

1. Home menampilkan kajian terbaru, kategori, dan continue listening.
2. Halaman kategori, ustadz, playlist, dan detail audio dapat dibuka publik.
3. Search dan filter berfungsi.
4. Player dapat memutar audio YouTube, dengan player mini dan simpan progress.
5. User login dapat: bookmark, catatan, riwayat, continue listening, progress.
6. Admin dapat login dan melakukan CRUD kajian/kategori/ustadz/playlist.
7. Tambah kajian cukup dengan paste URL YouTube (metadata otomatis).
8. Publish/Unpublish berfungsi.
9. Terdeploy di Vercel dengan domain `audio.manhajsalafinsights.com`.
10. Data tersimpan di Supabase; **tidak ada file audio di server**.

---

*Dokumen ini siap digunakan sebagai acuan pengembangan MSI Audio. Belum ada kode yang ditulis.*
