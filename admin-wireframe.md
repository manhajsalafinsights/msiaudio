# MSI Audio — Admin Wireframe

**Product Requirement — Wireframe Dashboard Admin**

| | |
|---|---|
| Produk | MSI Audio |
| Scope | Wireframe teks: layout admin, dashboard, setiap modul, state |
| Referensi | `admin-pages.md` · `admin-routing.md` |
| Status | Draft v1.0 — rancangan, bukan kode |

---

## 1. Admin Layout

### 1.1 Desktop (≥1024px) — Sidebar tetap

```
┌──────┬──────────────────────────────────────────────────────┐
│ SIDE │ TOPBAR                                               │
│ BAR  │ [≡ collapse]  Breadcrumb: Admin › Content › Audio    │
│ 256px │                                 [🔍 cari global] [👤]│
├──────┼──────────────────────────────────────────────────────┤
│      │                                                      │
│ MENU │  <Konten halaman>                                    │
│      │                                                      │
│ (lihat│                                                      │
│ §1.3)│                                                      │
│      │                                                      │
├──────┼──────────────────────────────────────────────────────┤
│ [keluar] │ (admin/system hidden utk Admin biasa)             │
└──────┴──────────────────────────────────────────────────────┘
```

### 1.2 Mobile (<768px) — Drawer

```
┌────────────────────────────────────────────┐
│ [≡]  ◈ MSI AUDIO · ADMIN      [👤]        │
├────────────────────────────────────────────┤
│ <Konten halaman>                          │
│ (tanpa sidebar — menu tersembunyi)         │
│                                            │
├────────────────────────────────────────────┤
│ [TOMBOL AKSI UTAMA] (sticky bila perlu)    │
└────────────────────────────────────────────┘
   Tap [≡] → drawer:
┌───────────────┐
│ ◈ MSI AUDIO   │
│ [x]           │
│ ▦ Dashboard   │
│ CONTENT ▾     │
│  Series       │
│  Audio        │
│  ...          │
│ 👤 Nama       │
│ [Keluar]      │
└───────────────┘
```

### 1.3 Menu Sidebar (konsisten semua halaman)

```
▦ Dashboard
▤ CONTENT
   Series · Audio · Speaker · Category · Tag · Series Type · Attachment
▥ LEARNING
   Chapter · Highlight · Reference · Transcript (badge: n)
▦ USER
   User
▦ MEDIA
   Media Library
▦ ANALYTICS
   Analytics
▦ SETTINGS
   Settings
▦ SYSTEM            ← hanya Super Admin
   System
```

> `▤`/`▥` = label grup (non-klik), item di bawahnya klik. Group bisa collapse.

---

## 2. Dashboard

```
┌──────────────────────────────────────────────────────────────┐
│ Halo, {Nama Admin} 👋                                        │
│ Ringkasan kondisi konten MSI Audio                           │
│ [+ Series Baru] [+ Audio Baru] [▤ Transcript Pending]        │
│                                                             │
│ STATISTIK (kartu, klik → ke list)                            │
│ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐       │
│ │128   │ │1.204 │ │ 47   │ │ 12   │ │ 3.501│ │ 9.207│       │
│ │Series│ │Audio │ │Speaker│ │Kategori│ │User  │ │Bookmark│   │
│ └──────┘ └──────┘ └──────┘ └──────┘ └──────┘ └──────┘       │
│ ┌──────┐ ┌──────┐                                            │
│ │24.589│ │18.430│   (opsional: Listening · Progress)          │
│ └──────┘ └──────┘                                            │
│                                                             │
│ 2 KOLOM                                                     │
│ ┌─ AUDIO TERBARU ────────────┐ ┌─ USER AKTIF ─────────────┐ │
│ │ ▀▀ Judul 1 · Series · Draft │ │ 👤 Nama · 3 jam lalu      │ │
│ │ ▀▀ Judul 2 · Series · Pub ✔ │ │ 👤 Nama · 5 jam lalu      │ │
│ │ ▀▀ Judul 3 · Series · Pub ✔ │ │ 👤 Nama · 1 hari lalu     │ │
│ │ [Lihat semua →]             │ │ [Lihat semua →]           │ │
│ └─────────────────────────────┘ └───────────────────────────┘ │
│                                                             │
│ STATISTIK SINGKAT 7 HARI (bar chart)                         │
│  [Audio baru ▓▓▓░░] [User baru ▓░░░] [Pemutaran ▓▓▓▓▓]      │
└──────────────────────────────────────────────────────────────┘
```

---

## 3. List (pola umum — dipakai Series/Audio/Speaker/Category/Tag/Series Type)

Contoh: **Series List**

```
┌──────────────────────────────────────────────────────────────┐
│ ADMIN › CONTENT › SERIES                                     │
│ Series                                [+ Series Baru]        │
│                                                             │
│ [🔍 cari judul...]  [Status ▾] [Type ▾] [Kategori ▾] [Sort ▾]│
│                                                             │
│ [▢]  Cover Judul              Type   Ses/Dur   Status  Aksi  │
│ [▢]  ▀▀ Kitab Tauhid          Kitab  24 · 18j  ● Draft   [▶] │
│ [▢]  ▀▀ Ushulus Sunnah        Kitab  12 · 9j   ✔ Pub    [▶] │
│ [▢]  ▀▀ Dauroh Aqidah         Dauroh  8 · 5j   ✔ Pub    [▶] │
│  ...                                                         │
│  [▢ semua] 3 dipilih → [Hapus] [Publish] [Unpublish]        │
│                                                             │
│  « 1 2 3 … 12 »   (atau "Muat Lebih Banyak" di mobile)       │
│  per halaman: [25 ▾]   Total 128                              │
└──────────────────────────────────────────────────────────────┘
  Aksi per baris [⋯]:  Edit · Publish/Unpublish · Duplicate (future) · Hapus
  Status: ● Draft (abu) / ✔ Published (hijau)
  [▶] pratinjau cepat → buka halaman publik (tab baru)
```

**Audio List** sama, beda kolom: `Series · Sesi · Durasi` + filter `?seriesId=` saat diakses dari dalam Series.

**Speaker/Category/Tag/Series Type List**: kolom ringkas `Nama · Slug · Jumlah Series · Status · Aksi` + tombol `+ Baru`. Tanpa filter status untuk Category/Tag (tidak punya field `status`).

---

## 4. Form (pola umum — buat/edit)

```
┌──────────────────────────────────────────────────────────────┐
│ ADMIN › CONTENT › SERIES › {Buat | Edit}                     │
│ Buat Series                          [Batal] [💾 Simpan]      │
│ ──────────────────────────────────────────────────────────── │
│ Judul *            [..............]                          │
│ Slug *             [auto-dari-judul............]  (auto)     │
│ Series Type *      [Kitab ▾]                                 │
│ Cover              [🖼 Pilih dari Media]  (preview ▀▀)        │
│ Deskripsi          [........................................]│
│                     [........................................]│
│ SPEAKER (multi)     [+ Tambah]                               │
│  [x] Ustadz A (pemateri_utama)  [x] Ustadz B                 │
│ KATEGORI (multi)    [Aqidah] [Fiqih] +                       │
│ TAG (multi)         [#tauhid] [#kitab] +                     │
│ Status              ( ) Draft   ( ) Published                │
│ ──────────────────────────────────────────────────────────── │
│                                        [Batal] [💾 Simpan]   │
└──────────────────────────────────────────────────────────────┘
  * = wajib. Slug unik. Error inline di bawah field bila gagal.
```

---

## 5. Audio — Form Cepat (Create) & Edit

```
┌──────────────────────────────────────────────────────────────┐
│ ADMIN › CONTENT › AUDIO › + Audio Baru                       │
│ + Audio Baru              (future: auto judul/thumb/durasi)  │
│                                                             │
│ 🔗 Link YouTube *   [https://youtu.be/xxxxxxxxxxxx]          │
│                      ✓ video ID: xxxxxxxxxxxx                │
│ Series *            [Kitab Tauhid ▾]                         │
│ Nomor Sesi *        [3]   (wajib unik per series)            │
│ Judul *             [................]   (future auto-fill)  │
│ Deskripsi           [......................................] │
│ Cover               [🖼 Pilih Media] (fallback thumb YT →)    │
│ Status              ( ) Draft   ( ) Published                │
│                                                             │
│ [💾 Simpan]   [💾 Simpan & Kelola Timeline]   [Batal]        │
└──────────────────────────────────────────────────────────────┘
  Simpan → membuat Audio + MediaSource(YOUTUBE, providerId).
```

**Audio Detail (Edit) — tab:**
```
┌──────────────────────────────────────────────────────────────┐
│ ADMIN › AUDIO › Sesi 3 — Kitab Tauhid                        │
│ TAB: [✏ Edit] [⌚ Timeline] [🔖 Highlight] [📖 Reference]     │
│      [📎 Attachment] [📝 Transcript]                          │
│ ──────────────────────────────────────────────────────────── │
│ <sesuai tab aktif — lihat §6–§9>                              │
└──────────────────────────────────────────────────────────────┘
```

---

## 6. Timeline Editor — Chapter / Highlight / Reference (dengan mini player)

```
┌──────────────────────────────────────────────────────────────┐
│ ADMIN › AUDIO › [id] › ⌚ Timeline · Chapter                  │
│ Chapter — Sesi 3 Kitab Tauhid                                │
│                                                             │
│ MINI PLAYER (sticky, untuk ambil posisi saat ini)            │
│ ┌──────────────────────────────────────────────────────────┐ │
│ │ ▀▀ Sesi 3 ...  ⏮ ⏯ ⏭  [────────●───────] 25:03 / 45:00  │ │
│ │            posisi saat ini: 25:03  [↥ Gunakan posisi ini] │ │
│ └──────────────────────────────────────────────────────────┘ │
│                                                             │
│ DAFTAR CHAPTER                                               │
│  [↑] [↓] 01  00:00   Pembukaan                       [✏][🗑]  │
│  [↑] [↓] 02  05:22   Muqaddimah                     [✏][🗑]  │
│  [↑] [↓] 03  18:12   Dalil                          [✏][🗑]  │
│                                                             │
│ [+ Tambah Chapter]   (startSecond otomatis = posisi player)  │
│ Modal tambah/edit: Title * | start | end | [Simpan] [Batal]  │
└──────────────────────────────────────────────────────────────┘
  Highlight & Reference memakai pola serupa (field berbeda):
  - Highlight: title + description + presets (Faedah/Kesimpulan/Peringatan)
  - Reference: type ▾ + title + reference (HR.…) + content + start/end
```

---

## 7. Attachment (dalam Audio)

```
┌──────────────────────────────────────────────────────────────┐
│ ADMIN › AUDIO › [id] › 📎 Attachment                         │
│ [+ Unggah File]  [+ Link Eksternal]                          │
│ [▢]  PDF  Kitab-Tauhid-01.pdf    2,4 MB   [⋯]                │
│ [▢]  SLIDE  Ushulus-Sesi-2.pptx  8,1 MB   [⋯]                │
│ [▢]  LINK  https://manhajsalaf...   —       [⋯]              │
│ (+ unggah drag & drop: PDF · slide · gambar)                 │
└──────────────────────────────────────────────────────────────┘
```

**Library global (`/admin/attachments`):** filter `type` + audio, semua attachment lintas audio.

---

## 8. Transcript

### 8.1 List
```
┌──────────────────────────────────────────────────────────────┐
│ ADMIN › LEARNING › TRANSCRIPT                                │
│ Transcript                    [+ Buat Manual (future)]        │
│ [Status ▾: semua] [Bahasa ▾] [🔍 cari audio...]              │
│ ──────────────────────────────────────────────────────────── │
│ Audio (series · sesi)      Bahasa  Provider  Status   Aksi    │
│ Sesi 3 Kitab Tauhid        id      openai    ● pending  [▶]   │
│ Sesi 1 Ushulus Sunnah      id      whisper   ⟳ processing      │
│ Sesi 2 Kitab Tauhid        ar      manual    ✔ completed [⋯] │
│ Sesi 5 Dauroh Aqidah       id      openai    ✖ failed   [⟳]   │
│                                                             │
│  Status badge: ● pending (abu) ⟳ processing (biru)           │
│                ✔ completed (hijau) ✖ failed (merah)          │
└──────────────────────────────────────────────────────────────┘
```

### 8.2 Detail
```
┌──────────────────────────────────────────────────────────────┐
│ ADMIN › TRANSCRIPT › Sesi 3 Kitab Tauhid (id)                │
│ Status: ✔ Completed · Provider: openai · Bahasa: id          │
│ Audio: Sesi 3 Kitab Tauhid · [Buka audio]                    │
│ [⟳ Proses Ulang]   [📋 Salin]   [⬇ Export (future)]          │
│ ──────────────────────────────────────────────────────────── │
│ 00:00  Bismillah...                                          │
│ 00:05  Pembukaan kajian pada kesempatan ini...               │
│ 05:22  Adapun muqaddimah, ...                                │
│  [textarea besar bila edit manual; preview bila completed]   │
└──────────────────────────────────────────────────────────────┘
  Error FAILED → panel: pesan error + tombol [Proses Ulang].
```

---

## 9. Speaker / Category / Tag / Series Type — Form

```
┌──────────────────────────────────────────────────────────────┐
│ ADMIN › SPEAKER › {Buat | Edit} Ustadz                       │
│ Nama *        [Ustadz Abu Ahmad............]                 │
│ Slug *        [ustadz-abu-ahmad...........]  (auto)          │
│ Foto          [🖼 Pilih Media]  (preview ○)                   │
│ Bio           [.....................................]        │
│ Status        ( ) Aktif  ( ) Nonaktif                        │
│ ──────────────────────────────────────────────────────────── │
│ Jumlah Series: 12   (dihitung; hapus diblokir bila >0)       │
│                                       [💾 Simpan] [Batal]    │
└──────────────────────────────────────────────────────────────┘
  Category/Tag/Series Type: Nama + Slug (+ Icon + Deskripsi utk type).
```

---

## 10. User

### 10.1 List
```
┌──────────────────────────────────────────────────────────────┐
│ ADMIN › USER                                                 │
│ User                          (read-only — dukungan & audit) │
│ [🔍 cari nama/email...]  [Role ▾]  [Sort ▾]                  │
│ Nama        Email               Role   Bookmark Progress  Tgl │
│ Ahmad F.    ahmad@mail.com      USER   12      3        2 jan│
│ Siti R.     siti@mail.com       USER    4      1       28 des│
│ ...
└──────────────────────────────────────────────────────────────┘
```

### 10.2 Detail (read-only)
```
┌──────────────────────────────────────────────────────────────┐
│ ADMIN › USER › Ahmad F.                                      │
│ ○ Ahmad F. · ahmad@mail.com · USER · daftar 2 Jan            │
│ Statistik: 3 series dipelajari · 2 audio selesai · 4,5 jam   │
│            · 12 bookmark · 3 catatan                          │
│                                                             │
│ CONTINUE LEARNING (read-only, = halaman user)                │
│ ▀▀ Kitab Tauhid · Sesi 3 · 25:00/45:00 · 55% · 2 jam lalu    │
│                                                             │
│ TAB: [Ringkasan] [Progress] [Bookmarks] [History]            │
│ ── Progress ──────────────────────────────────────────────   │
│  Series             Audio terakhir   Pos   %      Updated    │
│  Kitab Tauhid       Sesi 3           25:00 55%    2 jam lalu │
│  ── Bookmarks / History: tabel read-only serupa ──           │
└──────────────────────────────────────────────────────────────┘
```

---

## 11. Media Library

```
┌──────────────────────────────────────────────────────────────┐
│ ADMIN › MEDIA                                                │
│ Media Library                [+ Unggah]  (drag & drop area)   │
│ [Type ▾: semua] [🔍 cari...]  [Sort ▾]                       │
│ ┌─────┐ ┌─────┐ ┌─────┐                                      │
│ │ ▀▀  │ │ ▀▀  │ │ ▀▀  │    grid gambar + nama file           │
│ │ tauhid│ │ logoS│ │ fotoA│                                  │
│ │ .jpg │ │ .png │ │ .jpg │                                  │
│ │ [📋 copy URL] │                                            │
│ └─────┘ └─────┘ └─────┘                                      │
│  (hover → aksi: Salin URL · Info · Hapus)                    │
│  Info modal: ukuran, dipakai N item → konfirmasi hapus       │
└──────────────────────────────────────────────────────────────┘
```

---

## 12. Analytics

```
┌──────────────────────────────────────────────────────────────┐
│ ADMIN › ANALYTICS                                            │
│ Analytics                     Range: [30 hari ▾]             │
│ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐          │
│ │ 1.204    │ │ 24.589   │ │ 18.430   │ │ 12.400   │          │
│ │ Audio    │ │ Pemutaran│ │ Progress │ │ Jam      │          │
│ │          │ │          │ │          │ │ Didengar │          │
│ └──────────┘ └──────────┘ └──────────┘ └──────────┘          │
│ TAB: [Series] [Audio] [Speaker] [Kategori] [Listening][Progr.]│
│ ── SERIES TERPOPULER ──────────────────────────────────────  │
│  Rank  Series          Pemakai   Rata² %   Audio   Aksi      │
│  1     Kitab Tauhid    1.204     62%       24      [lihat]   │
│  2     Ushulus Sunnah   980      48%       12      [lihat]   │
│  [chart bar di atas tabel]                                   │
└──────────────────────────────────────────────────────────────┘
```

---

## 13. Settings

```
┌──────────────────────────────────────────────────────────────┐
│ ADMIN › SETTINGS                                             │
│ TAB: [General] [SEO] [Logo] [Social] [Analytics] [YouTube]   │
│ ── GENERAL ────────────────────────────────────────────────  │
│ Nama Situs      [MSI Audio...........]                       │
│ Tagline         [Audio Kajian Islam...]                      │
│ Bahasa default  [Indonesia ▾]                                │
│ Maintenance     ( ) Aktif  ( ) Nonaktif                      │
│                                      [💾 Simpan] [Batal]     │
│ (tiap tab = form sendiri, tombol simpan per tab)             │
└──────────────────────────────────────────────────────────────┘
  SEO: title template · meta description · OG image · Twitter.
  Logo: unggah logo + favicon (preview). Social: link YT/IG/TG/X.
  Analytics: kode script eksternal (textarea). YouTube: API key (masked), proxy.
```

---

## 14. System (Super Admin)

```
┌──────────────────────────────────────────────────────────────┐
│ ADMIN › SYSTEM                                               │
│ TAB: [Health] [Version] [Migration] [Environment]            │
│ ── HEALTH CHECK ───────────────────────────────────────────  │
│  ● Database (Supabase)     OK · 12 ms · terakhir: 10:05     │
│  ● Storage                 OK · 8 ms                         │
│  ● YouTube Provider        OK · 210 ms                       │
│  ● CDN                     OK · 22 ms                        │
│  [⟳ Cek Ulang]                                              │
│ ── VERSION ────────────────────────────────────────────────  │
│  Aplikasi   v1.0.0 · commit a1b2c3d · deploy 2 Jan 2026     │
│  Prisma schema v1 (12 model)                                 │
│ ── MIGRATION ─────────────────────────────────────────────  │
│  ✔ 0001_init (applied) · ✔ 0002_... · ⏳ 0003 (pending)      │
│  [Cek Status]  (tidak ada tombol migrasi otomatis dari UI)   │
│ ── ENVIRONMENT ────────────────────────────────────────────  │
│  DATABASE_URL   postgresql://•••••@supabase... · prod        │
│  NODE_ENV       production · REGION id-1 · Node 20           │
└──────────────────────────────────────────────────────────────┘
```

---

## 15. State & Pengecualian

### 15.1 Empty
```
┌──────────────────────────────────────────────────────────────┐
│ (ikon)  Belum Ada Audio                                     │
│ "Mulai dengan menambahkan audio pertama"                     │
│ [ + Audio Baru ]                                             │
└──────────────────────────────────────────────────────────────┘
```

### 15.2 Loading (skeleton)
```
┌──────────────────────────────────────────────────────────────┐
│ [░░░░░░] [░░░░░░] [░░░░░░] [░░░░░░]                          │
│ ░░░░░░░░░░░  ░░░░  ░░░░  ░░░░░  ░░░                          │
│ ░░░░░░░░░░░  ░░░░  ░░░░  ░░░░░  ░░░                          │
└──────────────────────────────────────────────────────────────┘
```

### 15.3 Error / 403 / 404
```
Error:  ⚠ Terjadi Kesalahan — "Gagal memuat data." [Coba Lagi]
403:    ⛔ Akses Ditolak — "Halaman ini khusus Super Admin." [Kembali]
404:    🔍 Tidak Ditemukan — [Kembali ke List]
```

---

*Dokumen ini menyertai `admin-pages.md` dan `admin-routing.md`. Belum ada kode, halaman, atau API yang diimplementasikan.*
