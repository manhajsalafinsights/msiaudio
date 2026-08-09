# MSI Audio — Wireframe Halaman Publik

**Product Requirement — UX Wireframe (Text)**

Semua wireframe berupa **diagram teks** — bukan kode. Tanda:
- `[ ... ]` = tombol / elemen interaktif
- `▀▀` = gambar/cover
- `•••` = placeholder
- `[▶]` = tombol play

---

## 1. Komponen Global

### 1.1 Public Header (Desktop)

```
┌────────────────────────────────────────────────────────────────┐
│  [◈ MSI Audio]   Beranda  Jelajahi  Cari 🔍      [Masuk] [Daftar]│
└────────────────────────────────────────────────────────────────┘
```

### 1.2 Public Header (Mobile)

```
┌──────────────────────────────────────────┐
│  [◈ MSI Audio]                     [🔍]   │
└──────────────────────────────────────────┘
```

### 1.3 Bottom Navigation (Mobile)

```
┌──────────────────────────────────────────┐
│ [🏠 Beranda] [🧭 Jelajah] [▶ Player] [🔖] [👤] │
└──────────────────────────────────────────┘
        ↑ tombol Player = expand ke player aktif
```

### 1.4 Player Bar (sticky bawah — desktop & mobile)

```
┌────────────────────────────────────────────────────────────────┐
│ ▀▀ [▶]  Judul Kajian — Ustadz          12:34 / 45:00  ██████░░░░│
└────────────────────────────────────────────────────────────────┘
```

### 1.5 Breadcrumb

```
Beranda › Series › Kitab Tauhid › Sesi 1: Pengertian Tauhid
```

### 1.6 Card Audio / Series (gaya list)

```
┌──────────────────────────────────────────────┐
│ ▀▀  Judul Kajian                  [▶]        │
│     Ustadz · Kategori            ⏱ 45:00    │
│     Series: Kitab Tauhid · Sesi 3           │
└──────────────────────────────────────────────┘
```

---

## 2. Layout

### 2.1 Public Layout (Header + Footer)

```
┌─────────────────────────────────────────────────────────────┐
│ HEADER (sticky)                                             │
├─────────────────────────────────────────────────────────────┤
│ BREADCRUMB                                                  │
│                                                             │
│             (KONTEN HALAMAN — scroll)                       │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│ FOOTER · link · ekosistem MSI · ©                         │
└─────────────────────────────────────────────────────────────┘
│ PLAYER BAR (sticky, muncul saat ada audio aktif)            │
└─────────────────────────────────────────────────────────────┘
```

### 2.2 Learning Layout (Audio Detail — minimal, tanpa footer)

```
┌─────────────────────────────────────────────────────────────┐
│ HEADER RAMPING: [←]  Judul Singkat                 [🔍]     │
├─────────────────────────────────────────────────────────────┤
│                    (KONTEN AUDIO DETAIL)                    │
│  · player besar                                             │
│  · chapter / highlight / reference                          │
│  · daftar sesi                                              │
├─────────────────────────────────────────────────────────────┤
│ PLAYER BAR (tetap terlihat)                                 │
└─────────────────────────────────────────────────────────────┘
```

### 2.3 Profile Layout (Sidebar user)

```
┌─────────────────────────────────────────────────────────────┐
│ HEADER (public)                                             │
├───────────────┬─────────────────────────────────────────────┤
│ PROFILE NAV   │                                             │
│ ┌───────────┐ │                                             │
│ │ (foto)    │ │          (KONTEN HALAMAN PROFIL)            │
│ │ Nama      │ │                                             │
│ │ email     │ │                                             │
│ └───────────┘ │                                             │
│ [Profil]      │                                             │
│ [Progress]    │                                             │
│ [Bookmark]    │                                             │
│ [History]     │                                             │
│ [Lanjutkan]   │                                             │
│ [Series Fav]  │                                             │
│ [Keluar]      │                                             │
└───────────────┴─────────────────────────────────────────────┘
```

> Mobile: sidebar menjadi tab horizontal atau bottom nav.

---

## 3. Halaman

### 3.1 Home

```
┌──────────────────────────────────────────────────────────────┐
│ HEADER                                                       │
├──────────────────────────────────────────────────────────────┤
│ HERO                                                        │
│ ┌──────────────────────────────────────────┐                 │
│ │  Belajar Ilmu Syar'i Lewat Audio         │                 │
│ │  "Waktu adalah madrasah"                 │                 │
│ │  [ Mulai Belajar ]  [ Jelajahi Series ]  │                 │
│ └──────────────────────────────────────────┘                 │
├──────────────────────────────────────────────────────────────┤
│ ▶ LANJUTKAN MENDENGARKAN        [Lihat Semua]                │
│ ┌───────────────────────────────┐                            │
│ │ ▀▀  Kitab Tauhid              │   [▶ Lanjutkan]            │
│ │     Sesi 3 · 25:00/45:00      │   ██████░░░░ 55%           │
│ └───────────────────────────────┘                            │
├──────────────────────────────────────────────────────────────┤
│ KAJIAN TERBARU                    [Lihat Semua →]            │
│ [▀▀] [▀▀] [▀▀] [▀▀]                                        │
│  Judul  Judul  Judul  Judul                                │
│  Ustadz  Ustadz  Ustadz  Ustadz                            │
├──────────────────────────────────────────────────────────────┤
│ SERIES POPULER                  [Lihat Semua →]              │
│ [▀▀] [▀▀] [▀▀]                                              │
│  Kitab Tauhid  Ushulus Sunnah  Bulughul Maram               │
│  24 sesi · 18 jam  12 sesi · 9 jam  40 sesi · 30 jam       │
├──────────────────────────────────────────────────────────────┤
│ KATEGORI                                                    │
│ [Aqidah] [Fiqih] [Tafsir] [Hadits] [Akhlak] [Sirah]         │
├──────────────────────────────────────────────────────────────┤
│ USTADZ                                                  [→] │
│ [◉ Ust. A] [◉ Ust. B] [◉ Ust. C] [◉ Ust. D]                 │
├──────────────────────────────────────────────────────────────┤
│ REKOMENDASI UNTUKMU        (berdasar progress & bookmark)    │
│ [▀▀] [▀▀] [▀▀]                                              │
├──────────────────────────────────────────────────────────────┤
│ FOOTER                                                       │
└──────────────────────────────────────────────────────────────┘
```

**Mobile:** hero dipersingkat; grid 4 kolom → 2 kolom; kategori horizontal scroll.

---

### 3.2 Explore

```
┌──────────────────────────────────────────────────────────────┐
│ HEADER · BREADCRUMB: Beranda › Jelajahi                      │
├──────────────────────────────────────────────────────────────┤
│ JUDUL: Jelajahi Kajian                                      │
│                                                             │
│ FILTER BAR                                                  │
│ [Kategori ▾] [Ustadz ▾] [Jenis ▾] [Tag ▾]        [Reset ✕]  │
│ URUTKAN: (●) Terbaru ( ) Terlama ( ) A-Z ( ) Terbanyak ▶    │
│                                                             │
│ HASIL (list)                                                │
│ ┌──────────────────────────────────────────────┐             │
│ │ ▀▀  Judul 1  (series/audio)     [▶]        │             │
│ │     info...                             │             │
│ └──────────────────────────────────────────────┘             │
│ ┌──────────────────────────────────────────────┐             │
│ │ ▀▀  Judul 2                              │             │
│ │     info...                             │             │
│ └──────────────────────────────────────────────┘             │
│ ( ... )                                                      │
│                                                             │
│ PAGINATION:  [‹]  1  2  3  …  12  [›]                        │
├──────────────────────────────────────────────────────────────┤
│ FOOTER                                                       │
└──────────────────────────────────────────────────────────────┘
```

**Mobile:** filter menjadi *drawer* dari bawah (sheet); tombol "Filter" di atas daftar.

---

### 3.3 Search

```
┌──────────────────────────────────────────────────────────────┐
│ HEADER                                                       │
├──────────────────────────────────────────────────────────────┤
│ [ 🔍 Pencarian kajian, ustadz, topik...        ]  [Cari]     │
│                                                             │
│ SUGESTI: [tauhid] [shalat] [hadits] [ramadhan]              │
│                                                             │
│ TAB HASIL                                                   │
│ [ Audio ] [ Series ] [ Ustadz ] [ Tag ] [ Kategori ]        │
│ ────────────────────────────────────────────────             │
│ HASIL "tauhid" (tab Audio)                                  │
│ ┌──────────────────────────────────────────┐                 │
│ │ ▀▀  Judul Audio — Ustadz  · 45:00  [▶]  │                 │
│ └──────────────────────────────────────────┘                 │
│ ( ... )                                                      │
│                                                             │
│ (FUTURE) Pencarian Isi Transkrip: [🎙 Cari dalam isi kajian] │
├──────────────────────────────────────────────────────────────┤
│ FOOTER                                                       │
└──────────────────────────────────────────────────────────────┘
```

**Mobile:** input search menempel di atas; tab bisa scroll horizontal.

---

### 3.4 Series Detail (halaman utama belajar)

```
┌──────────────────────────────────────────────────────────────┐
│ HEADER · BREADCRUMB: Beranda › Series › Kitab Tauhid         │
├──────────────────────────────────────────────────────────────┤
│ ┌──────────────────────────────────────────────────────────┐ │
│ │ ▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀ │ │
│ │             (cover besar)                               │ │
│ └──────────────────────────────────────────────────────────┘ │
│  Kitab Tauhid                                                │
│  Jenis: Kajian Kitab · Kategori: Aqidah                      │
│  [◉ Ustadz A] [◉ Ustadz B]                                   │
│  Tags: [tauhid] [aqidah]                                     │
│  24 sesi · 18 jam 5 menit                                    │
│  ────────────────────────────────────────────────             │
│  Deskripsi: •••                                              │
│                                                             │
│ PROGRESS BELAJAR ANDA                                         │
│  ████████████░░░░░░░░░░░░░░░░░░░░░░ 8/24 · 33%              │
│  Terakhir: Sesi 3 — Pengertian Tauhid (25:00/45:00)          │
│  [▶ Lanjutkan Sesi 3]   [↻ Mulai dari Awal]                  │
│                                                             │
│ RELATED CONTENT                                              │
│  [📄 Artikel: Pengertian Tauhid] [📕 Ebook Tauhid]           │
├──────────────────────────────────────────────────────────────┤
│ DAFTAR SESI (24)                                             │
│ ✔  1   Sesi 1 — Pembukaan                  45:00   [▶]       │
│ ✔  2   Sesi 2 — Kedudukan Tauhid          40:00   [▶]       │
│ ●  3   Sesi 3 — Pengertian Tauhid         45:00   [▶ berjalan]│
│ ◌  4   Sesi 4 — Keutamaan Tauhid          50:00   [▶]        │
│ ◌  ( ... )                                                   │
│ PAGINATION / "Muat Lebih Banyak"                             │
├──────────────────────────────────────────────────────────────┤
│ FOOTER                                                       │
└──────────────────────────────────────────────────────────────┘
```

**Mobile:** cover penuh lebar; daftar sesi tanpa kolom; tombol lanjut besar.

---

### 3.5 Audio Detail (Learning Layout)

```
┌──────────────────────────────────────────────────────────────┐
│ HEADER RAMPING: [←] Kitab Tauhid · Sesi 3         [🔍] [⋮]   │
├──────────────────────────────────────────────────────────────┤
│ PLAYER BESAR                                                │
│ ┌──────────────────────────────────────────────┐             │
│ │              ▀▀ (cover)                      │             │
│ └──────────────────────────────────────────────┘             │
│  Sesi 3: Pengertian Tauhid                                   │
│  Ustadz A · Aqidah · Kitab Tauhid                            │
│                                                             │
│  ████████████░░░░░░░░░░░░░░░░  25:00/45:00                  │
│  [⏮ Sesi 2]   [▶⏸]   [Sesi 4 ⏭]                            │
│  [🔖 Bookmark] [📝 Catatan] [⚡ 1.0x] [🔁 Ulang]            │
├──────────────────────────────────────────────────────────────┤
│ TAB:  [Chapter] [Highlight] [Referensi] [Lampiran]           │
│ ────────────────────────────────────────────────             │
│ CHAPTER (aktif saat diputar)                                 │
│  ▶ 00:00 Pembukaan                                           │
│    05:22 Muqaddimah                                          │
│  ● 18:12 Dalil  ◀◀ (sedang berlangsung)                      │
│    42:55 Penjelasan                                          │
│    58:11 Tanya Jawab                                         │
│                                                             │
│ REFERENSI (muncul sesuai posisi)                             │
│  📖 18:20 — QS Al-Ikhlas                                     │
│  📖 18:35 — HR. Bukhari no. 52                               │
│                                                             │
│ HIGHLIGHT                                                    │
│  ✦ 12:00 Faedah Penting                                      │
│  ✦ 25:00 Kesimpulan                                          │
├──────────────────────────────────────────────────────────────┤
│ CATATAN ANDA                                                │
│  [📝 + Tambah Catatan]  ·  catatan pada 25:00 •••             │
├──────────────────────────────────────────────────────────────┤
│ LAMPIRAN                                                    │
│  [📄 PDF: Kitab Tauhid] [🖼 Slide Sesi 3]                    │
├──────────────────────────────────────────────────────────────┤
│ SESI DALAM SERIES (navigasi lanjut)                          │
│  ● Sesi 3 — Pengertian Tauhid   [▶]                          │
│  ◌ Sesi 4 — Keutamaan Tauhid    [▶]                          │
│  (desktop: sidebar kanan, bukan bawah)                       │
├──────────────────────────────────────────────────────────────┤
│ RELATED CONTENT                                              │
│  [Artikel Tauhid] [Video Pendukung] [Tanya Jawab]            │
│                                                             │
│ (FUTURE) KOMENTAR:  💬 Belum tersedia                        │
└──────────────────────────────────────────────────────────────┘
```

**Desktop:** konten 2 kolom — kiri player + info, kanan chapter/daftar sesi.
**Mobile:** semua bertumpuk; tab chapter/highlight/referensi.

---

### 3.6 Speaker Detail

```
┌──────────────────────────────────────────────────────────────┐
│ HEADER · BREADCRUMB: Beranda › Ustadz › Ustadz A             │
├──────────────────────────────────────────────────────────────┤
│ ┌─────────┐                                                  │
│ │  (foto) │  Nama: Ustadz A                                  │
│ └─────────┘  Status: Aktivis dakwah                          │
│              Bio: •••                                        │
│              Jumlah: 12 Series · 240 Audio                   │
│                                                             │
│ SEMUA SERIES (diikuti)                                       │
│ [▀▀ Kitab Tauhid] [▀▀ Ushulus Sunnah] [▀▀ Akhlak]           │
│                                                             │
│ SEMUA AUDIO TERBARU                                        │
│ ┌──────────────────────────────────────────┐                 │
│ │ ▀▀  Judul  · 45:00              [▶]      │                 │
│ └──────────────────────────────────────────┘                 │
│ ( ... ) + Pagination                                         │
├──────────────────────────────────────────────────────────────┤
│ FOOTER                                                       │
└──────────────────────────────────────────────────────────────┘
```

---

### 3.7 Category Detail

```
┌──────────────────────────────────────────────────────────────┐
│ HEADER · BREADCRUMB: Beranda › Kategori › Aqidah             │
├──────────────────────────────────────────────────────────────┤
│ JUDUL: Aqidah                                               │
│ Deskripsi kategori •••                                       │
│ Sort: [Terbaru ▾]                                           │
│                                                             │
│ SEMUA SERIES KATEGORI AQIDAH                                 │
│ [▀▀ Kitab Tauhid] [▀▀ Ushulus Sunnah]                       │
│  24 sesi · 18 jam        12 sesi · 9 jam                    │
│ [▀▀ ...]                                                    │
│ + Pagination                                                 │
├──────────────────────────────────────────────────────────────┤
│ FOOTER                                                       │
└──────────────────────────────────────────────────────────────┘
```

---

### 3.8 Tag Detail

```
┌──────────────────────────────────────────────────────────────┐
│ HEADER · BREADCRUMB: Beranda › Tag › #ramadhan               │
├──────────────────────────────────────────────────────────────┤
│ JUDUL: #Ramadhan                                            │
│                                                             │
│ SEMUA SERIES BERTAG RAMADHAN                                 │
│ [▀▀ Kajian Ramadhan 1] [▀▀ Kajian Ramadhan 2]               │
│ + Pagination                                                 │
├──────────────────────────────────────────────────────────────┤
│ FOOTER                                                       │
└──────────────────────────────────────────────────────────────┘
```

---

### 3.9 Bookmark

```
┌──────────────────────────────────────────────────────────────┐
│ HEADER · PROFILE NAV (sidebar/tab)                           │
├──────────────────────────────────────────────────────────────┤
│ JUDUL: Bookmark  (12 kajian)                                │
│ [Cari dalam bookmark...]              [Urutkan ▾]           │
│                                                             │
│ ┌──────────────────────────────────────────┐                 │
│ │ ▀▀  Judul Kajian   [▶]   🔖 Ter-bookmark │                 │
│ │     Ustadz · 45:00                      │                 │
│ └──────────────────────────────────────────┘                 │
│ ( ... )                                                      │
│ (Kosong → Empty State: "Belum ada bookmark")                 │
├──────────────────────────────────────────────────────────────┤
│ FOOTER                                                       │
└──────────────────────────────────────────────────────────────┘
```

---

### 3.10 History

```
┌──────────────────────────────────────────────────────────────┐
│ HEADER · PROFILE NAV                                         │
├──────────────────────────────────────────────────────────────┤
│ JUDUL: Riwayat Mendengarkan                                 │
│                                                             │
│ KELOMPOK: Hari Ini                                          │
│  ┌────────────────────────────────────────┐                  │
│  │ ▀▀  Judul 1  · 45:00      [▶]         │                  │
│  └────────────────────────────────────────┘                  │
│  ( ... )                                                     │
│ KELOMPOK: Kemarin                                           │
│  ┌────────────────────────────────────────┐                  │
│  │ ▀▀  Judul 3  · 30:00      [▶]         │                  │
│  └────────────────────────────────────────┘                  │
│  ( ... )                                                     │
│ [Hapus Riwayat]                                              │
├──────────────────────────────────────────────────────────────┤
│ FOOTER                                                       │
└──────────────────────────────────────────────────────────────┘
```

---

### 3.11 Continue Learning (halaman lengkap)

**Desktop (≥1024px):**

```
┌──────────────────────────────────────────────────────────────┐
│ HEADER · BREADCRUMB: Beranda › Lanjutkan Belajar             │
├──────────────────────────────────────────────────────────────┤
│ JUDUL: Lanjutkan Belajar                                     │
│ "Teruskan dari tempat terakhirmu"                            │
│                                                             │
│ FILTER: [Semua ▾] [🔎 cari series...]     [Urut: Terakhir ▾]│
│         (sedang / hampir selesai / baru dimulai)             │
│                                                             │
│ ┌──────────────────────────────────────────────────────────┐ │
│ │ ▀▀ ▀▀  Kitab Tauhid                                [▶▶]  │ │
│ │        Sesi 3 — Pengertian Tauhid                        │ │
│ │        ████████████░░░░░░░░░░ 25:00 / 45:00 · 55%       │ │
│ │        Estimasi sisa: ±20 mnt · terakhir 2 jam lalu      │ │
│ │        [🧭 Buka Series]        [🗑 Hapus dari daftar]     │ │
│ └──────────────────────────────────────────────────────────┘ │
│ ┌──────────────────────────────────────────────────────────┐ │
│ │ ▀▀ ▀▀  Ushulus Sunnah                             [▶▶]  │ │
│ │        Sesi 7 — Bahaya Taklid Buta                       │ │
│ │        ██████░░░░░░░░░░░░░░░░░░ 12:00 / 40:00 · 30%     │ │
│ │        Estimasi sisa: ±28 mnt · terakhir 3 hari lalu     │ │
│ │        [🧭 Buka Series]        [🗑 Hapus dari daftar]     │ │
│ └──────────────────────────────────────────────────────────┘ │
│ ( ... lebih banyak series dalam progres )                    │
│                                                             │
│ (Kosong → Empty State: "Belum ada kajian yang diputar"      │
│   + tombol [Jelajahi Kajian])                               │
├──────────────────────────────────────────────────────────────┤
│ FOOTER                                                       │
└──────────────────────────────────────────────────────────────┘
```

**Mobile (<768px):**

```
┌────────────────────────────────────────────┐
│ HEADER · [←] Lanjutkan Belajar              │
├────────────────────────────────────────────┤
│ [▀▀]  Kitab Tauhid                [▶▶]     │
│       Sesi 3 · Pengertian Tauhid            │
│       ██████████░░░░░░ 25:00/45:00 · 55%   │
│       Estimasi sisa ±20 mnt                 │
│       [🧭 Series] [🗑]                      │
│ ─────────────────────────────────────────── │
│ [▀▀]  Ushulus Sunnah              [▶▶]     │
│       Sesi 7 · Bahaya Taklid Buta           │
│       █████░░░░░░░░░░ 12:00/40:00 · 30%    │
│       Estimasi sisa ±28 mnt                 │
│       [🧭 Series] [🗑]                      │
│ ─────────────────────────────────────────── │
│ ( ... )                                     │
├────────────────────────────────────────────┤
│ [PLAYER BAR] · [BOTTOM NAV]                 │
└────────────────────────────────────────────┘
```

**Tablet (768–1023px):** daftar satu kolom penuh, kartu seperti desktop dengan grid 1 kolom, filter menjadi dropdown ringkas.

---

### 3.12 Favorite Series

```
┌──────────────────────────────────────────────────────────────┐
│ HEADER · PROFILE NAV                                         │
├──────────────────────────────────────────────────────────────┤
│ JUDUL: Series Favorit                                       │
│ [▀▀ Kitab Tauhid] [▀▀ Bulughul Maram]                       │
│  (seperti grid series)                                      │
│ (Kosong → Empty State)                                      │
├──────────────────────────────────────────────────────────────┤
│ FOOTER                                                       │
└──────────────────────────────────────────────────────────────┘
```

---

### 3.13 Profile

```
┌──────────────────────────────────────────────────────────────┐
│ HEADER · PROFILE NAV                                         │
├──────────────────────────────────────────────────────────────┤
│ ┌─────────┐  Nama                                            │
│ │ (foto)  │  email@example.com                               │
│ └─────────┘  [Edit Profil]                                  │
│                                                             │
│ STATISTIK BELAJAR                                            │
│ ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐                  │
│ │ 24     │ │ 12 jam │ │ 8/24   │ │ 5      │                  │
│ │ Audio  │ │ Didengar│ │ Series │ │ Series │                  │
│ │ Selesai│ │        │ │ Aktif  │ │ Favorit│                  │
│ └────────┘ └────────┘ └────────┘ └────────┘                  │
│                                                             │
│ PROGRESS PER SERIES                                          │
│ Kitab Tauhid      ██████░░░░░░ 8/24  [▶ Lanjut]             │
│ Ushulus Sunnah    ██░░░░░░░░░░ 2/12  [▶ Lanjut]             │
│                                                             │
│ KEGIATAN TERBARU                                             │
│ [▀▀ Judul — diputar 2 jam lalu]  [🔖 Bookmark terbaru]      │
├──────────────────────────────────────────────────────────────┤
│ FOOTER                                                       │
└──────────────────────────────────────────────────────────────┘
```

---

### 3.14 Speaker Library

**Desktop (≥1024px):**

```
┌──────────────────────────────────────────────────────────────┐
│ HEADER · BREADCRUMB: Beranda › Ustadz                        │
├──────────────────────────────────────────────────────────────┤
│ JUDUL: Perpustakaan Ustadz                                  │
│ "Para pemateri kajian di MSI Audio"                          │
│                                                             │
│ SORT:  [A-Z] [Terbaru] [Paling Banyak Series]    [🔍 cari]  │
│ ────────────────────────────────────────────────             │
│ ┌───────────┐ ┌───────────┐ ┌───────────┐ ┌───────────┐      │
│ │ (foto)    │ │ (foto)    │ │ (foto)    │ │ (foto)    │      │
│ │ Ust. A    │ │ Ust. B    │ │ Ust. C    │ │ Ust. D    │      │
│ │ 12 Series │ │ 8 Series  │ │ 20 Series│ │ 5 Series  │      │
│ │ 240 Audio │ │ 95 Audio  │ │ 310 Audio│ │ 40 Audio  │      │
│ │ 120 jam   │ │ 40 jam    │ │ 160 jam  │ │ 18 jam    │      │
│ │ [Aqidah]  │ │ [Fiqih]   │ │ [Tafsir] │ │ [Hadits]  │      │
│ └───────────┘ └───────────┘ └───────────┘ └───────────┘      │
│ ( ... lebih banyak ustadz )                                  │
│ + Pagination                                                 │
├──────────────────────────────────────────────────────────────┤
│ FOOTER                                                       │
└──────────────────────────────────────────────────────────────┘
```

**Mobile (<768px):**

```
┌────────────────────────────────────────────┐
│ HEADER · [←] Ustadz              [🔍]      │
├────────────────────────────────────────────┤
│ [SORT ▾]  [A-Z | Terbaru | Banyak Series]  │
│ ─────────────────────────────────────────── │
│ ┌───────────┐ ┌───────────┐                │
│ │ (foto)    │ │ (foto)    │                │
│ │ Ust. A    │ │ Ust. B    │                │
│ │ 12 Series │ │ 8 Series  │                │
│ └───────────┘ └───────────┘                │
│  (grid 2 kolom, info ringkas)              │
├────────────────────────────────────────────┤
│ [PLAYER BAR] · [BOTTOM NAV]                │
└────────────────────────────────────────────┘
```

**Tablet:** grid 3 kolom.

---

### 3.15 Trending

**Desktop (≥1024px):**

```
┌──────────────────────────────────────────────────────────────┐
│ HEADER · BREADCRUMB: Beranda › Trending                      │
├──────────────────────────────────────────────────────────────┤
│ JUDUL: 🔥 Trending                                             │
│ "Kajian yang paling banyak dipelajari pengguna"              │
│                                                             │
│ TAB RANGE:  [Hari Ini] [Minggu Ini] [Bulan Ini]             │
│ SORT:       [Terbanyak Diputar] [Disimpan] [Diselesaikan]   │
│ ────────────────────────────────────────────────             │
│ [BANNER #1 TERPOPULER]                                       │
│ ┌──────────────────────────────────────────────────────────┐ │
│ │  🔥 #1  ▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀  [▶]│ │
│ │        Kitab Tauhid — 24 sesi · 18 jam                  │ │
│ │        Ustadz A · 1,2 jt diputar · 3 rb bookmark        │ │
│ └──────────────────────────────────────────────────────────┘ │
│ GRID POPULER                                                 │
│ ┌──────────┐ ┌──────────┐ ┌──────────┐                      │
│ │🔥 ▀▀     │ │🔥 ▀▀     │ │🔥 ▀▀     │                      │
│ │ Judul    │ │ Judul    │ │ Judul    │                      │
│ │ Ustadz   │ │ Ustadz   │ │ Ustadz   │                      │
│ │ 24 sesi  │ │ 12 sesi  │ │ 8 sesi   │                      │
│ │ 18 jam   │ │ 9 jam    │ │ 5 jam    │                      │
│ └──────────┘ └──────────┘ └──────────┘                      │
│ ( #4, #5, #6 ... ) + Pagination                              │
├──────────────────────────────────────────────────────────────┤
│ FOOTER                                                       │
└──────────────────────────────────────────────────────────────┘
```

**Mobile (<768px):**

```
┌────────────────────────────────────────────┐
│ HEADER · [←] Trending                      │
├────────────────────────────────────────────┤
│ TAB: [Hari] [Minggu] [Bulan]  (scroll)     │
│ SORT: [▾ Diputar]                         │
│ ─────────────────────────────────────────── │
│ 🔥 #1 [▀▀] Kitab Tauhid          [▶]      │
│      Ustadz A · 24 sesi · 18 jam          │
│      👁 1,2 jt · 🔖 3 rb                  │
│ ─────────────────────────────────────────── │
│ 🔥 #2 [▀▀] Ushulus Sunnah        [▶]      │
│      Ustadz B · 12 sesi · 9 jam           │
│ (list #1 #2 #3 teratas, lalu grid 2 kolom) │
├────────────────────────────────────────────┤
│ [PLAYER BAR] · [BOTTOM NAV]                │
└────────────────────────────────────────────┘
```

**Tablet:** banner penuh lebar; grid 3 kolom.

---

### 3.16 Learning Dashboard (`/belajar`)

**Desktop (≥1024px):**

```
┌──────────────────────────────────────────────────────────────┐
│ HEADER (public)                                              │
├──────────────────────────────────────────────────────────────┤
│ SAPAAN: Assalamu'alaikum, {Nama} 👋                           │
│ Sub: "Lanjutkan perjalanan ilmumu"      [🗓 Progress Minggu ▾]│
│                                                             │
│ STATISTIK                                                    │
│ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐             │
│ │ 8       │ │ 24      │ │ 12,5 jam│ │ ██ 3 jam│             │
│ │ Series  │ │ Audio   │ │ Didengar│ │ Minggu │             │
│ │ Dipelajari│ │ Selesai │ │         │ │ ini    │             │
│ └─────────┘ └─────────┘ └─────────┘ └─────────┘             │
│                                                             │
│ CONTINUE LEARNING (baris teratas)                            │
│ ┌──────────────────────────────────────────────────────────┐ │
│ │ ▀▀  Kitab Tauhid · Sesi 3                        [▶▶]    │ │
│ │     25:00/45:00 · 55% · terakhir 2 jam lalu              │ │
│ └──────────────────────────────────────────────────────────┘ │
│ [Lihat semua → /continue-listening]                          │
│                                                             │
│ SERIES YANG SEDANG DIPELAJARI (grid + progress)              │
│ [▀▀ Kitab Tauhid 8/24] [▀▀ Ushulus 2/12] [▀▀ Akhlak 1/10]   │
│                                                             │
│ 2 KOLOM:                                                     │
│ ┌─ BOOKMARK TERBARU ────────┐ ┌─ CATATAN TERBARU ─────────┐ │
│ │ ▀▀ Judul 1          [▶]   │ │ 📝 "Ikhtilaf ..." · 25:00  │ │
│ │ ▀▀ Judul 2          [▶]   │ │ 📝 "Dalil: QS Al-Ikhlas"   │ │
│ │ [Lihat semua →]           │ │ [Lihat semua →]           │ │
│ └───────────────────────────┘ └───────────────────────────┘ │
│ ┌─ RIWAYAT TERAKHIR ────────┐ ┌─ SERIES FAVORIT ──────────┐ │
│ │ ▀▀ Judul · 2 jam lalu     │ │ [▀▀ Kitab Tauhid]         │ │
│ │ ▀▀ Judul · 3 hari lalu    │ │ [▀▀ Bulughul Maram]       │ │
│ │ [Lihat semua →]           │ │ [Lihat semua →]           │ │
│ └───────────────────────────┘ └───────────────────────────┘ │
│                                                             │
│ REKOMENDASI BELAJAR BERIKUTNYA                              │
│ "Berdasarkan series yang sedang kamu pelajari"               │
│ [▀▀ Sesi 4 — Keutamaan Tauhid] [▀▀ Sesi 3 — Ushulus]        │
│                                                             │
│ [Semua halaman punya Empty/Loading/Error State]              │
├──────────────────────────────────────────────────────────────┤
│ FOOTER                                                       │
└──────────────────────────────────────────────────────────────┘
```

**Mobile (<768px):**

```
┌────────────────────────────────────────────┐
│ HEADER · [◈ MSI Audio]             [🔍]    │
├────────────────────────────────────────────┤
│ Assalamu'alaikum, {Nama} 👋                 │
│ "Lanjutkan perjalanan ilmumu"               │
│                                            │
│ STATISTIK (scroll horizontal)               │
│ [8 Series] [24 Audio] [12,5 jam] [3 jam/mg] │
│ ─────────────────────────────────────────── │
│ LANJUTKAN (kartu besar)                    │
│ ▀▀ Kitab Tauhid · Sesi 3         [▶▶]      │
│ ████████░░░░ 25:00/45:00 · 55%             │
│ ─────────────────────────────────────────── │
│ SERIES AKTIF (2 kolom + progress)           │
│ [▀▀ Tauhid 8/24] [▀▀ Ushulus 2/12]         │
│ ─────────────────────────────────────────── │
│ TAB SECTION: [Bookmark][Catatan][Riwayat]   │
│  (menampilkan 3 item + "Lihat semua")       │
│ ─────────────────────────────────────────── │
│ REKOMENDASI BERIKUTNYA                      │
│ [▀▀ Sesi 4 — Keutamaan Tauhid]             │
├────────────────────────────────────────────┤
│ [PLAYER BAR] · [BOTTOM NAV]                │
└────────────────────────────────────────────┘
```

**Tablet:** statistik 4 kolom, layout 2 kolom dipertahankan.

---

### 3.17 404

```
┌──────────────────────────────────────────────────────────────┐
│ HEADER                                                       │
├──────────────────────────────────────────────────────────────┤
│                                                             │
│              404                                            │
│        Halaman tidak ditemukan                               │
│        "Mungkin kajiannya sudah dipindahkan"                 │
│        [ Kembali ke Beranda ]  [ Cari Kajian ]              │
│                                                             │
│        Saran: [▀▀ Kajian Populer] [▀▀ Series Terbaru]       │
├──────────────────────────────────────────────────────────────┤
│ FOOTER                                                       │
└──────────────────────────────────────────────────────────────┘
```

---

### 3.18 Empty State

```
┌──────────────────────────────────────────────────────────────┐
│ (ikon besar — mis. 🔖 / 🕘 / ▶ / 🎯)                          │
│  Judul Empty (mis. "Belum Ada Bookmark")                     │
│  Penjelasan singkat + ajakan aksi                            │
│  [ Tombol Aksi — mis. "Jelajahi Kajian" ]                    │
└──────────────────────────────────────────────────────────────┘
```

Pola Empty State dipakai di: Bookmark, History, Continue Learning, Favorite Series, Learning Dashboard (per section), hasil pencarian kosong, daftar sesi kosong, Speaker Library (tanpa data).

---

### 3.19 Loading State

```
┌──────────────────────────────────────────────────────────────┐
│ SKELETON                                                     │
│ ┌───────────────────────────────┐                            │
│ │ ░░░░░░░░░░  ░░░░░░░           │                            │
│ │ ░░░  ░░░░░░  ░░░░░░           │                            │
│ └───────────────────────────────┘                            │
│  (grid/skeleton mengikuti struktur halaman asli)             │
│  [◠ spinner kecil] "Memuat..." (untuk aksi/lazy)             │
└──────────────────────────────────────────────────────────────┘
```

- Halaman → `loading.tsx` (skeleton meniru layout konten).
- Komponen → komponen `Skeleton` per card.
- Aksi (pagination "muat lebih banyak") → spinner inline + nonaktif tombol.
- Learning Dashboard → skeleton statistik + skeleton card continue.

---

### 3.20 Error State

```
┌──────────────────────────────────────────────────────────────┐
│ ⚠ (ikon)                                                     │
│  Terjadi Kesalahan                                           │
│  "Gagal memuat halaman. Silakan coba lagi."                  │
│  [ Coba Lagi ]   (opsional) [ Lapor Masalah ]               │
└──────────────────────────────────────────────────────────────┘
```

- `error.tsx` per segment (fallback lokal, tidak merusak layout).
- Server action gagal → toast di form: "Gagal menyimpan — coba lagi".

---

## 4. Responsive Ringkas

| Halaman | Desktop (≥1024) | Tablet (768–1023) | Mobile (<768) |
|---|---|---|---|
| Home | hero besar, grid 4 kolom | grid 3 kolom | grid 2 kolom, hero pendek |
| Explore | filter bar inline | filter bar inline | filter di drawer |
| Search | tab penuh | tab penuh | tab scroll horizontal |
| Series Detail | cover kiri, info kanan, daftar sesi | bertumpuk | bertumpuk, tombol besar |
| Audio Detail | 2 kolom: player + panel | 1 kolom, panel bawah | 1 kolom, panel bawah |
| Speaker/Category/Tag | grid 3–4 | grid 3 | grid 2 |
| Speaker Library | grid 4 kolom, info lengkap | grid 3 kolom | grid 2 kolom ringkas |
| Trending | banner #1 + grid 3 | banner penuh + grid 3 | 3 list teratas + grid 2 |
| Continue Learning | kartu baris penuh | kartu baris penuh | kartu bertumpuk kompak |
| Learning Dashboard | 4 statistik + grid 2 kolom | 4 statistik + grid 2 kolom | statistik scroll horizontal + tab section |
| Profile | sidebar kiri | sidebar menyempit | tab horizontal |
| Player Bar | bar penuh | bar penuh | bar kompak + bottom nav |
| Navigation | header atas | header atas | bottom nav 5 tombol |

> Prinsip: **mobile-first** — wireframe desktop adalah perluasan dari versi mobile, bukan sebaliknya.
