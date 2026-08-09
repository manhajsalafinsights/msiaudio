# MSI Audio — Admin Pages & UX

**Product Requirement — Dashboard Admin, Hak Akses, UX**

| | |
|---|---|
| Produk | MSI Audio (ekosistem Manhaj Salaf Insights) |
| Scope | Arsitektur dashboard admin, navigasi, halaman-halaman, UX, hak akses (role), workflow, responsive |
| Referensi | `schema.prisma` · `admin-routing.md` · `admin-wireframe.md` |
| Status | Draft v1.0 — rancangan, bukan kode |

---

## 1. Visi Dashboard Admin

**MSI Audio admin adalah "ruang kerja" bukan "mesin form".**

Prinsip:
1. **Sederhana** — dipakai admin non-teknis (ustadz/panitia) tanpa pelatihan.
2. **Sedikit klik** — aksi utama (tambah audio, publish) maksimal 2 klik.
3. **Konteks dulu** — admin bekerja per "Audio dalam Series", bukan tabel abstrak.
4. **Tidak ada mode gelap opsional yang memusingkan** — tampilan terang, bersih, tenang (konsisten dengan situs publik).
5. **Aman** — aksi mutasi dikonfirmasi; aksi berbahaya (hapus, sistem) butuh konfirmasi ganda.

---

## 2. Role & Hak Akses

Saat ini: **Super Admin**, **Admin**. Desain siap diperluas (Editor, Moderator, Content Manager, Translator).

### Matriks hak akses

| Modul | Super Admin | Admin | Editor *future* | Content Manager *future* | Translator *future* | Moderator *future* |
|---|---|---|---|---|---|---|
| Dashboard | ✔ | ✔ | ✔ | ✔ | ✔ | ✔ |
| Series/Audio (CRUD draft) | ✔ | ✔ | ✔ | ✔ | — | — |
| Publish / Unpublish | ✔ | ✔ | — | ✔ | — | — |
| Speaker, Category, Tag, Series Type | ✔ | ✔ | ✔ | ✔ | — | — |
| Chapter, Highlight, Reference | ✔ | ✔ | ✔ | ✔ | — | — |
| Attachment | ✔ | ✔ | ✔ | ✔ | — | — |
| Transcript (proses/ulang) | ✔ | ✔ | — | — | ✔ | — |
| Transcript (terjemahan) | ✔ | ✔ | — | — | ✔ | — |
| User (lihat data) | ✔ | ✔ | — | — | — | ✔ |
| Media Library | ✔ | ✔ | ✔ | ✔ | — | — |
| Analytics | ✔ | ✔ | — | ✔ | — | — |
| Settings | ✔ | ✔ (non-destruktif) | — | — | — | — |
| System (health/migrasi/env) | ✔ | — | — | — | — | — |
| Kelola Admin | ✔ | — | — | — | — | — |

> Enumerasi role di `schema.prisma` saat ini `Role { ADMIN, USER }`. Untuk Super Admin disarankan evolusi enum `{ SUPER_ADMIN, ADMIN, ... }` (lihat `admin-routing.md` §2). Selama belum bermigrasi, perbedaan ditandai flag `superAdmin` pada User.

---

## 3. Sidebar Admin

Desain sidebar **scalable**: dikelompokkan, bisa ditutup (collapsible), label jelas Bahasa Indonesia.

```
┌─────────────────────────────┐
│ ◈ MSI AUDIO · ADMIN         │
├─────────────────────────────┤
│ ▦ Dashboard                 │
│                             │
│ ▤ CONTENT                   │
│   ├ Series                  │
│   ├ Audio                   │
│   ├ Speaker                 │
│   ├ Category                │
│   ├ Tag                     │
│   ├ Series Type             │
│   └ Attachment              │
│                             │
│ ▥ LEARNING                  │
│   ├ Chapter                 │
│   ├ Highlight               │
│   ├ Reference               │
│   └ Transcript  (badge: 3)  │
│                             │
│ ▦ USER                      │
│   └ User                    │
│                             │
│ ▦ MEDIA                     │
│   └ Media Library           │
│                             │
│ ▦ ANALYTICS                 │
│   └ Analytics               │
│                             │
│ ▦ SETTINGS                  │
│   └ Settings                │
│                             │
│ ▦ SYSTEM  (Super Admin only)│
│   └ System                  │
├─────────────────────────────┤
│ 👤 {Nama Admin}  · [Keluar] │
└─────────────────────────────┘
```

Aturan:
- **Menu induk** (Content, Learning, USER, dll.) = label grup non-klik. Hanya item di bawahnya yang dapat diklik.
- Grup dapat di-*collapse*/expand (default terbuka). Item aktif ditandai aksen brand.
- **Badge** pada Transcript (jumlah `pending`) agar admin tahu pekerjaan tertunda.
- Item `System` hanya dirender untuk Super Admin.
- Mobile/tablet: sidebar berubah menjadi **drawer** yang dibuka tombol hamburger (lihat `admin-wireframe.md` §1).

---

## 4. Dashboard

**Tujuan:** gambaran kondisi konten & aktivitas dalam satu layar — bukan angka hiasan, melainkan pintu aksi.

| Section | Konten | Sumber (schema) |
|---|---|---|
| Statistik kartu (6) | Total Series · Total Audio · Total Speaker · Total Category · Total User · Total Bookmark | `Series`, `Audio`, `Speaker`, `Category`, `User`, `Bookmark` |
| Statistik lanjutan (opsional) | Total Listening (jumlah baris `ListeningHistory`) · Total Progress (`UserProgress`) | `ListeningHistory`, `UserProgress` |
| Audio Terbaru | 5–8 audio terbaru `createdAt` (judul, series, status publish) + aksi cepat | `Audio` |
| User Aktif | 5 user `lastPlayedAt` terbaru + progress-nya | `ListeningHistory` |
| Statistik Singkat | 7-hari: audio baru, user baru, total pemutaran (bar mini) | agregasi `createdAt`/`lastPlayedAt` |
| Shortcut | Tombol aksi: `+ Series Baru`, `+ Audio Baru`, `Buka Transcript Pending` | — |

**UX:** dashboard = 1 layar, scroll pendek. Klik statistik "Audio Terbaru" → `/admin/audio`. Tidak ada widget yang membutuhkan klik berlebih.

---

## 5. CONTENT — Modul

### 5.1 Series Management
**List:** judul, cover, type, kategori, speaker, jumlah sesi, durasi total, status publish, tanggal.
**Fitur:** search (`q`), filter (`status`, `type`, `kategori`, `speaker`), sort, pagination, hapus massal pilihan (checkbox).
**Detail/Edit:** semua field + relasi:
- Series Type (dropdown, wajib)
- Speaker (multi-pilih + urutan via pivot `SeriesSpeaker`)
- Kategori (multi-pilih, pivot `SeriesCategory`)
- Tag (multi-pilih, pivot `SeriesTag`)
- Tabel audio anak (ringkas) + tombol kelola → `/admin/series/[id]/audio`
**Aksi:** Create · Edit · Delete (soft-confirm: "Series beserta audio-nya akan dihapus") · **Publish/Unpublish** (toggle) · Duplicate (future).

### 5.2 Audio Management
**Filosofi:** admin non-teknis — buat audio **secepat mungkin**.

Form Cepat (Create):
```
[ 🔗 Paste Link YouTube ......... ]  →  (future: auto-fetch judul/thumb/durasi)
[ Series ▾.................... ]   wajib
[ Nomor Sesi ..........]      (uniqueness [seriesId, nomorSesi])
[ Judul ...............]        (prefill dari judul YouTube, future)
[ Deskripsi ...........]  (textarea)
[ Cover .......... ] [🖼 Pilih dari Media]  (fallback thumbnail YT, future)
[ 💾 Simpan & Kelola ] [💾 Simpan] [Batal]
```

- Simpan → buat `Audio` + `MediaSource` (provider `YOUTUBE`, `providerId` = video ID hasil parsing link, `url`).
- Parsing: ambil `v=` / `youtu.be/` → ID. Format salah → error inline.
- Detail/Edit: field utama + tab sub-resource (Chapter, Highlight, Reference, Attachment, Transcript) + link `Lanjutkan ke pengaturan timeline`.
- Cover: pilih dari Media Library atau unggah.

### 5.3 Speaker Management
CRUD `Speaker` (nama, slug otomatis, foto dari media, bio, status ACTIVE/INACTIVE).
List menampilkan jumlah series (COUNT pivot). Hapus ditolak bila masih punya series (onDelete Restrict) → tombol nonaktif dengan penjelasan.

### 5.4 Category Management
CRUD `Category` (nama, slug, icon). List menampilkan jumlah series. Slug otomatis dari nama; bisa diedit.

### 5.5 Tag Management
CRUD `Tag` (nama, slug). Mampu dikombinasikan (banyak tag per series). Daftar menampilkan jumlah series.

### 5.6 Series Type Management
CRUD `SeriesType` (nama, slug, icon, description). Dipakai dropdown pada Series. Menampilkan jumlah series per tipe. **Dilarang hapus bila masih dipakai Series** (Restrict).

### 5.7 Attachment Management
**Global:** library semua `Attachment` (list, filter by `type` dan audio). Aksi utama dari dalam Audio Detail (`/admin/audio/[id]/attachments`):
- Type: PDF · EBOOK · KITAB · SLIDE · GAMBAR · REFERENSI · LINK_EKSTERNAL.
- Title + URL (file diunggah ke Storage → URL) + fileSize (byte, otomatis).
- Upload langsung (drag & drop) atau link eksternal.

---

## 6. LEARNING — Modul

Semua modul learning **terikat posisi waktu audio** (`startSecond`/`endSecond`). UX inti: admin bekerja **sambil mendengarkan** — panel audio mini menempel di kanan/bawah form.

### 6.1 Chapter
- Editor per audio: daftar chapter (`urutan`, `title`, `startSecond`, `endSecond`) — ditampilkan sebagai timeline.
- Tombol `[+] Tambah Chapter` → isi di posisi sekarang (jika audio sedang diputar).
- Drag untuk mengatur urutan (auto-update `urutan`, unique `[audioId, urutan]`).

### 6.2 Highlight
- Daftar per audio + global (filter audio).
- Field: `title`, `description`, `startSecond`, `endSecond`.
- Preset judul cepat: "Faedah Penting", "Kesimpulan", "Peringatan".

### 6.3 Reference
- Kelola dalil: `type` (QURAN · HADITH · KITAB · ARTICLE · QUOTE · NOTE), `title`, `reference` (mis. "HR. Bukhari no. 52"), `content`, `startSecond`, `endSecond`.
- Filter global: by type, by audio. Tampil rapi sebagai kartu kutipan.

### 6.4 Transcript
**Status lifecycle:**
```
PENDING → PROCESSING → COMPLETED
              └─────────→ FAILED (bisa di-"Proses Ulang")
```

| Status | Warna | Aksi |
|---|---|---|
| PENDING | abu | Jadwalkan proses |
| PROCESSING | biru | (spin) — nonaktif |
| COMPLETED | hijau | Lihat, salin, (future) export |
| FAILED | merah | **Proses Ulang**, lihat pesan error |

- List: filter `status`, `language`; badge jumlah pending di sidebar.
- Detail: isi transkrip (textarea/preview), provider (`OPENAI`/`WHISPER`/`MANUAL`), per-bar timestamp optional.
- Future: Generate AI, Import, Export (SRT/JSON), terjemahan per bahasa (unique `[audioId, language]`).

---

## 7. USER — Modul

**Tujuan:** dukung user + audit — bukan mengintip. Data pribadi dibatasi admin.

### 7.1 User List
Search (`nama`/`email`), filter role, sort by `createdAt`. Kolom: nama, email, role, jumlah bookmark/progress, daftar tanggal. **Hanya lihat — tanpa tombol edit data user.**

### 7.2 User Detail (ringkasan)
- Identitas + role.
- Statistik: total progress (`UserProgress`), audio selesai, total jam (`ListeningHistory`), bookmark, catatan.
- **Continue Learning**: item dari `UserProgress` + `ListeningHistory` terbaru (posisi terakhir) — tampilan sama seperti halaman user tapi read-only.
- Tab: `Ringkasan` · `Progress` · `Bookmarks` · `History`.
- Aksi admin: (future) reset progress, nonaktifkan akun — butuh konfirmasi + audit.

### 7.3 Progress / Bookmarks / History (per user)
- **Progress**: tabel `UserProgress` (series, audio terakhir, posisi detik, % progress, completedCount, updatedAt).
- **Bookmarks**: tabel `Bookmark` (audio, waktu dibuat) — bukan konten yang diedit, murni lihat.
- **History**: tabel `ListeningHistory` (audio, posisi, %, completed, playCount, lastPlayedAt) + filter completed.

> Bookmark/Progress/History **tidak punya halaman CRUD mandiri** — selalu dalam konteks user (lihat `admin-routing.md`). Data ini ditulis oleh sistem, bukan admin.

---

## 8. MEDIA — Media Library

**Tujuan:** pusat semua gambar (cover series/audio, foto speaker, ikon) & file lampiran.

- Grid gambar dengan preview (thumbnail), upload drag & drop, filter `type` (cover/foto/dokumen).
- Tombol **Salin URL** — dipakai saat mengisi field cover (pola copy-paste, konsisten dengan data model yang menyimpan URL string di `cover`/`foto`).
- Penggunaan: cek berapa item memakai file ini (jangan hapus yang terpakai).
- Storage: Supabase Storage (bucket publik/`cover`). Metadata bisa disimpan tabel future `MediaAsset` — di luar `schema.prisma` saat ini (dokumen ini tidak menambah model).

---

## 9. ANALYTICS

Halaman baca-saja; data dihitung dari agregasi Prisma.

| Halaman | Konten |
|---|---|
| Series Terpopuler | Top series by `UserProgress` count / `ListeningHistory`; + durasi, % rata-rata |
| Audio Terpopuler | Top audio by `playCount` / bookmark; + selesai vs belum |
| Speaker Terpopuler | Top speaker by jumlah series + total pemutaran |
| Kategori Terpopuler | Top kategori by jumlah series & pemutaran |
| Listening Time | Total detik didengar per hari/minggu/bulan (agregasi `ListeningHistory`) — bar chart |
| Progress User | Distribusi % progress (belum mulai / <50% / >50% / selesai) |

- Range: `7 · 30 · 90 · 365` hari.
- Tampilan: kartu ringkas + tabel + chart sederhana (library chart — dipilih saat implementasi, bukan bagian dokumen ini).
- (Future) realtime/periodik; cukup server-render untuk sekarang.

---

## 10. SETTINGS

Pengaturan aplikasi (belum ada tabel di schema — diimplementasikan sebagai tabel future `AppSetting` (key-value JSON) atau `next.config`/env yang ditampilkan lewat admin).

| Sub-menu | Field (contoh) |
|---|---|
| General | Nama situs, tagline, bahasa default, aktif/tidak situs (maintenance) |
| SEO | Title template, meta description default, OG image, Twitter card |
| Logo | Logo utama, logo kecil (favicon), mode terang/gelap |
| Social Media | Link YouTube, Instagram, Telegram, X |
| Analytics | Kode script analytics eksternal (disisipkan ke layout) |
| YouTube Provider | API key, base URL, apakah fitur auto-fetch aktif, proxy/preconnect |

UX: form per halaman, satu tombol simpan per halaman, indikator "Tersimpan".

---

## 11. SYSTEM (Super Admin only)

| Halaman | Isi |
|---|---|
| Health Check | Status DB (Supabase), status storage, status YouTube provider, latency, waktu cek |
| Version | Versi aplikasi, versi schema, commit (dari env/build), tanggal deploy |
| Migrations | Daftar migrasi Prisma terpasang, status pending, tombol cek (`prisma migrate status` di server) |
| Environment | Variabel env penting (nilai di-mask: `••••`), region, node version, provider |

- Semua read-only kecuali Health "Cek Ulang".
- Akses: guard `requireRole("SUPER_ADMIN")` di halaman + middleware.

---

## 12. Workflow Utama

### W1 — Menambahkan Audio (5 langkah singkat)
```
1. /admin/audio → [+ Audio Baru]
2. Paste link YouTube + pilih Series + nomor sesi
3. Isi judul & deskripsi (future: otomatis dari YT)
4. Pilih/pasang cover
5. Simpan → otomatis tersimpan MediaSource
   Lalu (opsional) kelola timeline dari tab Audio Detail
```

### W2 — Publish Konten
```
Draft (published=false) → lihat pratinjau → [Publish]
Published → [Unpublish] → kembali draft (konten publik hilang dari list publik, data aman)
```
- Series & Audio masing-masing punya status sendiri. Series `published=false` menyembunyikan seri dari publik **dan** seluruh audio-nya di halaman publik (guard di query publik).

### W3 — Transcript
```
Audio dibuat → Transcript (PENDING) dibuat otomatis (future)
Admin lihat /admin/learning/transcripts → [Proses] → PROCESSING
Engine selesai → COMPLETED (isi terisi) / FAILED (pesan error)
FAILED → [Proses Ulang]
```

### W4 — Kurasi Timeline (Chapter/Highlight/Reference)
```
Buka /admin/audio/[id] → tab "Timeline" (chapters/highlights/references)
Putar audio di panel mini → [+] tambah item → posisi terisi otomatis (startSecond = posisi saat ini)
```
> Inilah kunci "sedikit klik": posisi waktu tidak diketik manual, diambil dari pemutaran.

---

## 13. UX Guidelines (non-negotiable)

1. **Aksi utama maksimal 2 klik** dari list (mis. publish langsung dari baris, bukan masuk ke form).
2. **Form pendek dulu, lanjutan nanti** — form buat hanya field wajib; field relasi detail dipindah ke tab detail.
3. **Konfirmasi untuk destruktif**: hapus → modal konfirmasi (sebutkan konsekuensi); hapus massal → konfirmasi + hitung jumlah; System → konfirmasi ganda.
4. **Selalu ada jalan pulang**: breadcrumb `Admin › Content › Audio › Edit`, tombol kembali, logo → dashboard.
5. **Umpan balik jelas**: simpan → toast "Tersimpan"; gagal → error inline + toast, input tidak hilang.
6. **Label Bahasa Indonesia** dan konsisten ("Publish", "Simpan", "Batal").
7. **Read-only itu jelas**: halaman baca-saja (User data, System) tidak punya tombol aksi.
8. **Aksesibilitas**: skip-link, keyboard untuk semua aksi, focus ring, `aria-label` pada ikon, tabel dengan `scope`.
9. **Konsisten dengan situs publik**: token warna/spacing yang sama (lihat `public-pages.md` §9).

---

## 14. Responsive

| Perangkat | Perilaku |
|---|---|
| **Desktop (≥1024)** | Sidebar tetap (kiri) + topbar + konten. Sidebar lebar 256px, bisa collapse ke 64px (ikon saja) |
| **Tablet (768–1023)** | Sidebar tetap lebih ramping (icon + label pendek), atau drawer jika sempit; tabel list jadi kartu ringkas |
| **Mobile (<768)** | Sidebar jadi **drawer** (hamburger). Tabel → kartu. Tombol aksi full-width. Panel audio mini menempel bawah |

Aturan:
- Tabel data: desktop = tabel penuh; mobile = kartu per baris (desain card-list), hindari scroll horizontal.
- Form: 1 kolom (mobile) → 2 kolom (desktop); tombol simpan selalu terlihat (sticky di bagian bawah form/mobile).
- Pagination: mobile pakai "Muat Lebih Banyak", desktop pakai nomor halaman.

---

## 15. State & Error

| State | Perilaku |
|---|---|
| Empty | Ikon + "Belum ada {item}" + tombol aksi pertama (mis. "+ Audio Baru") |
| Loading | Skeleton meniru struktur halaman (`admin/loading.tsx`) |
| Error | `admin/error.tsx` + pesan jelas + `Coba Lagi`; layout admin tetap utuh |
| 404 | `admin/not-found.tsx` dengan sidebar tetap + tombol kembali |
| Akses ditolak | Halaman `403` untuk role kurang; redirect ke `/` untuk non-admin |

---

## 16. Keamanan

- Dua lapis auth: `middleware.ts` + pengecekan session/role di Server Component (layout & halaman) — **semua server action divalidasi ulang role-nya**.
- Sistem (health/env/version/migrasi) hanya Super Admin.
- Data user: view-only, tidak ada form edit/delete oleh admin biasa.
- Audit log (future): catat siapa mem-publish/menghapus/mengubah System.
- Tidak ada sekret tersimpan di frontend; env hanya di server.

---

*Dokumen ini menyertai `admin-routing.md` dan `admin-wireframe.md`. Belum ada kode, halaman, atau API yang diimplementasikan.*
