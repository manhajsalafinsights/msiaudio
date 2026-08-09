# MSI Audio — Rancangan Halaman Publik

**Product Requirement — Public Pages, UX & UI System**

| | |
|---|---|
| Produk | MSI Audio (ekosistem Manhaj Salaf Insights) |
| Stack | Next.js App Router · TypeScript · Tailwind CSS |
| Scope | Desain halaman publik, UX flow, layout, responsive, design system, aksesibilitas, SEO, performa |
| Referensi | `routing.md` (routing) · `wireframe.md` (wireframe teks) |
| Status | Draft v1.0 — rancangan, bukan kode |

---

## 1. Visi & Karakter Produk

**MSI Audio adalah platform belajar audio kajian Islam.**

Bukan website download MP3. Bukan Spotify. Bukan YouTube. Karakter yang ingin ditanamkan:

| Bukan | Yang ingin dibangun |
|---|---|
| Pemutar MP3 belaka | **Program belajar bertahap** (Series/Kitab) |
| Feed tak berujung | Fokus, kurasi, tanpa distraksi |
| Komentar & suara bising | Tenang, khidmat, informatif |
| Konten acak | Struktur: series → sesi → referensi ilmiah |

**Tiga prinsip UX:**
1. **Sederhana** — seorang santri atau orang tua bisa menggunakannya tanpa belajar.
2. **Fokus belajar** — progres, kelanjutan, dan referensi selalu dekat.
3. **Modern & nyaman** — desain bersih, membaca nyaman, mobile-first.

---

## 2. Target Pengguna

| Segmen | Kebutuhan utama | Solusi halaman |
|---|---|---|
| Penuntut ilmu | Belajar sistematis | Series Detail, Progress, Continue Learning, Learning Dashboard |
| Mahasiswa | Cari topik cepat | Search, Explore, Tag |
| Santri | Mengikuti kurikulum kitab | Series sesi berurutan, Chapter |
| Ustadz | Berbagi & memantau materi | Speaker Detail, Series |
| Orang tua | Mudah digunakan | Home, navigasi besar, tampilan sederhana |
| Pengguna umum | Penasaran/topik tertentu | Explore, Kategori, Search |

---

## 3. Sitemap (ringkas)

```
Home
├── Trending
├── Explore
├── Search
├── Series
│   └── Series Detail
│       ├── Audio Detail (Learning)
│       └── Related Content
├── Speaker
│   ├── Speaker Detail
│   └── Speaker Library (/speaker)
├── Category Detail
├── Tag Detail
└── Area Belajar (login)
    ├── Learning Dashboard (/belajar)
    ├── Continue Learning (/continue-listening)
    ├── Profile
    ├── Bookmark
    ├── History
    └── Favorite Series
```

Detail lengkap parameter & segment ada di `routing.md`.

---

## 4. Layout

### 4.1 Public Layout — `(public)`
Dipakaikan ke: Home, Explore, Search, Series, Speaker, Category, Tag, halaman statis.

| Zona | Isi | Perilaku |
|---|---|---|
| Header | Logo, nav (Beranda, Jelajahi, Cari), tombol Masuk/Daftar | Sticky |
| Breadcrumb | Home › ... › Halaman | Di bawah header |
| Konten | Isi halaman | Scroll |
| Footer | Tentang, tautan ekosistem MSI, kebijakan, © | Biasa |
| Player Bar | Player mini (muncul saat ada audio aktif) | Sticky bawah |

### 4.2 Learning Layout — `(learning)`
Dipakaikan ke: Audio Detail. **Fokus = mendengarkan.**

| Zona | Isi | Perilaku |
|---|---|---|
| Header ramping | Tombol kembali, judul singkat, tombol pencarian/menu | Sticky |
| Konten | Player, chapter, highlight, referensi, sesi | Scroll |
| Player Bar | Selalu terlihat | Sticky bawah |
| Footer | Tidak ada (supaya fokus) | — |

### 4.3 Learning Area Layout — `(profile)`
Dipakaikan ke: Learning Dashboard, Continue Learning, Bookmark, History, Favorite Series, Profile. (Login wajib.)

| Zona | Isi | Perilaku |
|---|---|---|
| Header | Header public | Sticky |
| Sidebar (desktop) | Foto, nama, nav belajar (Dashboard, Lanjutkan, Bookmark, History, Favorit, Profil, Keluar) | Tetap |
| Tab (mobile) | Navigasi belajar menjadi tab/segmented | Scroll |
| Konten | Isi halaman belajar | Scroll |

---

## 5. Navigation

### 5.1 Desktop — Header
```
[◈ MSI Audio]   Beranda  Jelajahi  Trending  Ustadz  Cari 🔍   [Masuk] [Daftar]
```
- Cari: tekan → pindah ke `/search` (fokus otomatis ke input) atau dropdown hasil cepat (future).
- Saat login, header menampilkan **Profil** (avatar → dropdown: Dashboard Belajar, Lanjutkan, Bookmark, Riwayat, Profil, Keluar) menggantikan tombol Masuk/Daftar.
- Link "Ustadz" → `/speaker` (Speaker Library).

### 5.2 Mobile — Bottom Navigation
```
[🏠] [🧭] [🔥] [▶] [👤]
```
| Tombol | Route |
|---|---|
| 🏠 | `/` |
| 🧭 | `/explore` |
| 🔥 | `/trending` |
| ▶ | expand player / `/continue-listening` (login) |
| 👤 | `/profile` (login) / `/login` |

- Bottom nav disembunyikan di halaman Audio Detail (Learning Layout) agar fokus.
- Setelah login, tapping ▶ membawa ke `/continue-listening` langsung.

### 5.3 Breadcrumb
- Format: `Beranda › Series › Kitab Tauhid › Sesi 3`.
- Dipakai di semua halaman detail & area dalam, membantu orientasi & SEO (struktur `BreadcrumbList`).
- Di mobile: potong jadi maksimal 2 level + "…".

### 5.4 Link Cepat
- Logo → Home. Judul series → Series Detail. Nama ustadz → Speaker Detail.
- Setiap audio selalu punya jalur ke: series induk (breadcrumb & daftar sesi).

---

## 6. UX Flow

### 6.1 Flow Utama — Belajar
```
Home
 ├── Continue Listening → tap [▶] → Audio Detail → play → progress tersimpan
 ├── (login) Dashboard Belajar → kartu "Lanjutkan" → lanjut dari posisi terakhir
 └── Series Populer → Series Detail
      └── [▶ Lanjutkan Sesi 3] / pilih sesi → Audio Detail
           └── selesai → saran "Sesi Berikutnya" → lanjut otomatis
```

### 6.2 Flow — Menemukan
```
Home → Jelajahi → filter kategori/ustadz/jenis/tag → pilih audio
Home → Trending → pilih range/sort → Series Detail
Home → Ustadz → Speaker Library → pilih ustadz → Speaker Detail → Series/Audio
Home → Cari → ketik kata kunci → tab hasil → pilih
Home → Kategori → Category Detail → Series → Audio
```

### 6.3 Flow — Personalisasi (login)
```
Audio Detail → [🔖 Bookmark] → cek di /bookmark
Audio Detail → [📝 Catatan] → tersimpan di profil
Audio Detail → progress → muncul di /continue-listening & dashboard
Audio Detail → Series → [♥ Series Favorit] → /favorite-series
Belajar → statistik & rekomendasi → ringkasan di /belajar
```

### 6.4 Flow — Lanjut Belajar (kunci UX)
```
Diputar sampai menit 25 → tutup aplikasi
Kembali → Home / Dashboard → "Lanjutkan" (baris teratas)
tap → langsung lanjut dari posisi 25:00 (bukan dari awal)
Filter "sedang" / "hampir selesai" → fokus pilih lanjutan
```

### 6.5 Flow — Tanpa Akun → Dengan Akun
```
Pengguna umum mendengarkan → coba bookmark → prompt "Masuk untuk menyimpan"
→ /login?next=/audio/[slug] → kembali ke posisi semula
```

---

## 7. Halaman Publik — Spesifikasi Desain

### 7.1 Home
**Tujuan:** mengantar pengguna ke aksi utama (lanjut belajar / mulai belajar).

| Section | Konten | Prioritas |
|---|---|---|
| Hero | Judul tagline, subtitle, 2 CTA (`Mulai Belajar`, `Jelajahi Series`) | 1 |
| Continue Learning | Audio terakhir (satu kartu besar + daftar kecil); hanya untuk user login | 1 |
| Kajian Terbaru | Grid audio `published` terbaru | 1 |
| Series Populer | Grid series (sesi + total durasi) | 2 |
| Kategori | Chip kategori (Aqidah, Fiqih, ...) → Category Detail | 2 |
| Ustadz | Profil ustadz aktif | 3 |
| Rekomendasi | Berdasar progres/bookmark (user) atau topik populer (anonim) | 3 |

**UX note:** Continue Learning selalu di atas setelah hero — pengalaman "lanjutkan" adalah nilai utama.

### 7.2 Explore
**Tujuan:** menjelajah seluruh konten dengan filter & sorting.

- Filter kombo: kategori, ustadz, series type, tag.
- Sorting: terbaru, terlama, A-Z, paling banyak diputar.
- Hasil: list/audio atau series (bisa toggle tampilan, future).
- Pagination "muat lebih banyak" (mobile-friendly) atau nomor (desktop).
- URL selalu merefleksikan state (`?kategori=...&sort=...`) agar bisa dibagikan/back.

### 7.3 Search
**Tujuan:** menemukan apa pun dengan cepat.

- Input besar + sugesti (tag populer: tauhid, shalat, hadits, ramadhan).
- Tab hasil: Audio · Series · Ustadz · Tag · Kategori.
- Highlight kata kunci pada judul.
- (Future) tab "Cari dalam isi kajian" → search transcript; desain disiapkan dengan memberi tempat panel hasil transcript.

### 7.4 Series Detail — "Halaman Utama Pembelajaran"
**Tujuan:** satu tempat semua informasi & tindakan belajar.

- Header: cover, judul, jenis, kategori, speaker, tag, total sesi/durasi.
- Deskripsi.
- **Progress belajar** (user): bar + "Terakhir: Sesi 3" + tombol `Lanjutkan` / `Mulai dari Awal`.
- Daftar sesi: status (`✔ selesai` / `● berjalan` / `◌ belum`), nomor, judul, durasi, tombol play. Sesuai `nomorSesi`.
- Related Content (artikel/ebook/video/QA via tabel `related_contents`).
- Aksi: `♥ Favorite Series`.

### 7.5 Audio Detail — Learning Layout
**Tujuan:** mendengarkan + akses materi pendukung posisi-waktu.

- Player besar: cover, judul, ustadz, kategori, series + sesi.
- Kontrol: previous/next sesi, play/pause, seek, kecepatan, ulang.
- **Chapter** — navigasi langsung ke bagian (click → seek).
- **Highlight** — poin penting kurasi admin.
- **Reference** — dalil/hadits muncul mengikuti posisi pemutaran.
- **Bookmark & Note** (user login).
- **Attachment** — PDF/kitab/slide.
- **Sesi dalam series** — daftar untuk pindah sesi tanpa kembali.
- Related Content; (future) komentar.

### 7.6 Speaker Detail
**Tujuan:** profil + seluruh karya satu pemateri.
- Foto, nama, bio, statistik (jumlah series/audio).
- Semua series (grid). Semua audio terbaru (list + pagination).

### 7.7 Category Detail & Tag Detail
**Tujuan:** eksplorasi taksonomi.
- Category: judul, deskripsi, semua series dalam kategori + sorting.
- Tag: judul `#tag`, semua series bertag tersebut.
- Layout identik (komponen `SeriesGrid` dipakai ulang).

### 7.8 Bookmark / History / Favorite Series
**Tujuan:** area pribadi user. Layout Learning Area.
- **Bookmark**: list kajian tersimpan + cari dalam bookmark.
- **History**: dikelompokkan tanggal (Hari Ini / Kemarin), tombol hapus.
- **Favorite Series**: grid series favorit.
- Semua punya **Empty State** dengan CTA.

### 7.9 Profile
**Tujuan:** ringkasan perjalanan belajar.
- Foto/nama/email + edit.
- Statistik: audio selesai, total jam, series aktif, series favorit.
- Progress per series (bar + tombol lanjut).
- Aktivitas terbaru.
- Link menuju Learning Dashboard (`/belajar`).

### 7.10 Learning Dashboard (`/belajar`)
**Tujuan:** halaman beranda pengguna yang login — ringkasan perjalanan belajar & aksi lanjut.
Login wajib; anonim diarahkan ke `/login?next=/belajar`.

| Section | Konten | Prioritas |
|---|---|---|
| Sapaan | "Assalamu'alaikum, {Nama}" + subtitle singkat | 1 |
| Statistik | Total series dipelajari, total audio selesai, total jam didengar, progress minggu ini | 1 |
| Continue Learning | Kartu besar serupa `/continue-listening` (baris teratas) + link "Lihat semua →" | 1 |
| Series aktif | Grid series dalam progres dengan bar progress + `Lanjutkan` | 2 |
| Bookmark terbaru | 2–3 item + "Lihat semua →" | 2 |
| Catatan terbaru | 2–3 catatan terakhir (judul + cuplikan + timestamp) | 2 |
| Riwayat terakhir | 2–3 item + "Lihat semua →" | 2 |
| Series favorit | Grid kecil + "Lihat semua →" | 3 |
| Rekomendasi belajar berikutnya | "Sesi berikutnya" dari series aktif (sesuai `nomorSesi`) | 3 |

**UX note:** dashboard = "jembatan lanjut", bukan sekadar statistik. Setiap section menampilkan maksimal 3 item agar halaman tetap fokus; semua section wajib punya Empty State yang mengarah ke eksplorasi.

Query: `?tab=lanjutkan|seri|bookmark|catatan|riwayat` (mobile menggunakan tab section).

### 7.11 Continue Learning (`/continue-listening`)
**Tujuan:** daftar lengkap kajian yang sedang dipelajari — melanjutkan dari posisi terakhir.
Login wajib.

- Kartu per series: cover, judul series, sesi terakhir, progress bar + % + `terakhir: X waktu lalu`, **estimasi waktu tersisa**.
- Tombol `[▶▶ Lanjutkan]` → buka Audio Detail langsung di posisi tersimpan.
- Tombol `[🧭 Buka Series]` → Series Detail.
- Tombol `[🗑 Hapus dari daftar]` → hapus entri progres (dengan konfirmasi).
- Filter: `sedang` / `hampir selesai` / `baru dimulai`.
- Sort: `terakhir` (default) / `progress`.
- (Future) "Tandai selesai" untuk memindahkan ke riwayat selesai.

**UX note:** kartu besar, tombol lanjut selalu terlihat, posisi tersimpan diprioritaskan. Halaman ini adalah "titik balik" utama pengguna belajar.

### 7.12 Speaker Library (`/speaker`)
**Tujuan:** direktori semua pemateri kajian.
Publik.

- Grid kartu ustadz: foto, nama, jumlah series, jumlah audio, **total durasi**, kategori paling sering dibahas (badge).
- Sort: `A-Z` / `terbaru` / `paling banyak series`.
- Cari nama ustadz.
- Tap kartu → Speaker Detail.
- (Future) filter kategori pada direktori.
- Empty State saat tidak ada ustadz.

### 7.13 Trending (`/trending`)
**Tujuan:** menunjukkan kajian yang paling diminati komunitas — bahan temuan tanpa login.
Publik.

- Tab range waktu: **Hari Ini / Minggu Ini / Bulan Ini**.
- Sort metrik: **Terbanyak Diputar / Disimpan / Diselesaikan**.
- Banner `#1` terpopuler (cover besar + tombol play) diikuti grid peringkat `#2 dst`.
- Badge 🔥 pada peringkat teratas.
- Tap → Series Detail / Audio Detail.
- (Future) "Editor's picks".
- Empty State + loading skeleton (kueri agregasi bisa berat).

**UX note:** metrik berbasis **pengguna yang selesai/dipelajari** (tidak hanya klik) — konsisten dengan nilai "belajar".

### 7.14 State Pages
- **404** — pesan ramah + aksi (kembali beranda, cari) + saran konten.
- **Empty State** — ikon, judul, penjelasan, tombol aksi (lihat `wireframe.md` §3.18).
- **Loading** — skeleton meniru struktur halaman (bukan spinner raksasa).
- **Error** — pesan jelas + `Coba Lagi`; tidak meninggalkan layout.

---

## 8. Responsive Design

| Breakpoint | Lebar | Perilaku |
|---|---|---|
| Mobile | < 768px | 1 kolom, bottom nav, konten besar |
| Tablet | 768–1023px | 2–3 kolom, header penuh |
| Desktop | ≥ 1024px | 3–4 kolom, sidebar profil |

Aturan umum:
- **Mobile-first** — desain dasar untuk layar kecil, lalu diperluas.
- Gambar/cover memakai `aspect-ratio` tetap (mis. 1:1 / 16:9) agar tidak melompat saat load.
- Area ketuk minimal 44×44px.
- Bottom nav hanya di mobile; header nav di tablet/desktop.
- Learning Layout memprioritaskan tombol besar untuk pemutaran.

---

## 9. Design System

### 9.1 Warna (token — contoh palet)
| Token | Nilai (contoh) | Penggunaan |
|---|---|---|
| `bg` | near-white `#FAFAF9` | latar situs |
| `bg-surface` | putih `#FFFFFF` | card |
| `text-primary` | `#1C1917` (stone-900) | teks utama |
| `text-muted` | `#78716C` (stone-500) | teks sekunder |
| `brand` | hijau/teal `#0F766E` | aksen utama (Islami, tenang) |
| `brand-strong` | `#115E59` | hover |
| `danger` | `#DC2626` | error/hapus |
| `success` | `#16A34A` | "selesai ✔" |

- Mode gelap (dark) untuk Learning Layout/player (nyaman saat fokus). *(direkomendasikan, dapat bertahap)*.

### 9.2 Spacing — skala 4px
`4 · 8 · 12 · 16 · 24 · 32 · 48 · 64 · 96`
- Card padding: 16–24. Section gap: 48. Konten: 24. Mobile lebih rapat (16).

### 9.3 Radius
| Token | Nilai | Contoh |
|---|---|---|
| `sm` | 4px | badge, chip |
| `md` | 8px | input, button |
| `lg` | 12px | card |
| `xl` | 16px | hero, modal |
| `full` | 999px | avatar, pill |

### 9.4 Shadow
- `shadow-xs` — tepi card.
- `shadow-md` — card hover / floating.
- `shadow-lg` — modal, dropdown, player bar.
- Hindari shadow tebal; prioritas kedalaman lembut.

### 9.5 Typography
| Element | Stack | Ukuran (mobile → desktop) |
|---|---|---|
| Judul halaman | Sans (Inter/Plus Jakarta Sans) | 28 → 36px, bold |
| Subjudul/section | Sans | 18 → 20px, semibold |
| Body | Sans | 15–16px |
| Kecil/meta | Sans | 12–13px |
| Arab (ayat/hadits) | Font Arab (Amiri/Scheherazade New) | 20–24px |
| Angka durasi | Tabular-nums | — |

- Kontras teks ≥ 4.5:1 untuk body, ≥ 3:1 untuk besar.
- Bahasa antarmuka: Indonesia (RTL tidak berlaku; hanya blok Arab yang RTL).

### 9.6 Grid & Container
- **Container:** `max-w-6xl` (1152px) konten utama; `max-w-7xl` (1280px) untuk hero/explore; padding `px-4 sm:px-6 lg:px-8`.
- **Grid:** 12 kolom (desktop); card menggunakan grid responsive:
  - Audio grid: `grid-cols-2 md:grid-cols-3 lg:grid-cols-4`.
  - Series grid: `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3`.
- **Gap:** `gap-4 md:gap-6`.

### 9.7 Ikon
- Ikon garis (line icon) — konsisten, satu set (lucide/heroicons), stroke konsisten 1.5–2px.
- Ikon selalu punya label/aria untuk aksesibilitas.

---

## 10. Accessibility

| Aspek | Ketentuan |
|---|---|
| Skip link | "Langsung ke konten" di awal halaman |
| Keyboard | Semua kontrol player dapat dioperasikan keyboard (Tab, Enter, Space, Arrow untuk seek) |
| Focus state | `focus-visible` ring jelas (2px brand) pada semua interaktif |
| Screen reader | Player: tombol berlabel ("Putar", "Jeda"); progress bar punya `role="slider"` + `aria-valuenow`; chapter tiap item `aria-label` |
| Gambar | `alt` deskriptif; cover kosong → placeholder |
| Kontras | Sesuai WCAG AA |
| Teks | Tidak hanya ikon; label teks menyertai |
| Form | `label` terhubung `htmlFor`, pesan error dengan `aria-live` |
| Durasi/sesi | Status "selesai/berjalan" tidak hanya warna — disertai teks |
| Reduksi gerak | Hormati `prefers-reduced-motion` |

---

## 11. SEO

| Aspek | Penerapan |
|---|---|
| Metadata | `generateMetadata` per halaman: title (format "Sesi 3 — Kitab Tauhid | MSI Audio"), description, canonical |
| Open Graph / Twitter | OG image per konten (cover + judul), `og:type=music.song` (audio) / `website` |
| Structured Data | `AudioObject`, `PodcastEpisode`, `LearningResource`, `CollectionPage`, `Person`, `BreadcrumbList`, `WebSite` (JSON-LD di `page.tsx`) |
| Robots | `sitemap.ts` + `robots.ts`; halaman profil `noindex` |
| URLs | Slug deskriptif, kanonik, tanpa parameter berlebih |
| Performance signal | LCP cepat (lihat §12) berpengaruh ke ranking |

---

## 12. Performance

| Aspek | Teknik |
|---|---|
| Image Optimization | `next/image` (srcset, webp, lazy), remotePatterns untuk `i.ytimg.com`; placeholder blur |
| Streaming | `loading.tsx` + `Suspense` per section (Continue Learning terpisah dari grid besar) |
| Lazy Loading | Komponen di bawah fold (rekomendasi, footer) lazy; `dynamic(import)` untuk komponen berat |
| Preload | Audio/cover sesi berikutnya di-preload ringan (future); pratinjau `preconnect` ke YouTube |
| Rendering | ISR untuk halaman publik; SSR per-request hanya data personal |
| Bundle | Server components meminimalkan JS client; hanya import `"use client"` saat perlu |
| Cache | `unstable_cache`/revalidate untuk kueri publik yang sama |
| CDN | Aset statis via Vercel; font self-hosted (`next/font`) |

---

## 13. Prinsip Desain Non-Negotiable

1. **Konten dulu, dekorasi kemudian.** Tidak ada elemen yang mengganggu teks kajian.
2. **Konsisten.** Setiap halaman detail mengikuti pola header → konten → aksi → daftar → footer.
3. **Aksi utama terlihat tanpa scroll** sedapat mungkin (lanjutkan, play).
4. **Tidak ada yang mengejutkan.** Transisi halus, tidak ada animasi berlebihan.
5. **Teks Arab selalu terbaca** (font Arab yang benar + RTL blok).
6. **Selalu ada jalan pulang** — breadcrumb, tombol kembali, logo.

---

## 14. Roadmap Halaman (urutan implementasi)

| Fase | Halaman |
|---|---|
| 1 | Home · Audio Detail (skeleton player) · Series Detail |
| 2 | Explore · Search · Category · Tag · Speaker Detail · Speaker Library |
| 3 | Profile · Bookmark · History · Favorite Series · Continue Learning · Learning Dashboard |
| 4 | Trending · State (404, empty, loading, error) & polish responsive |
| 5 | (Future) Transcript, komentar, mode gelap |

---

*Dokumen ini menyertai `routing.md` dan `wireframe.md`. Belum ada kode UI, halaman, atau player yang diimplementasikan.*
