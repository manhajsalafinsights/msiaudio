# MSI Audio — Routing & Sitemap (Next.js App Router)

**Product Requirement — Public Routing**

| | |
|---|---|
| Produk | MSI Audio (ekosistem Manhaj Salaf Insights) |
| Scope | Sitemap, routing App Router, route group, layout mapping, parameter, SEO hooks |
| Status | Draft v1.0 — rancangan, belum implementasi |

---

## 1. Prinsip Routing

1. **URL bersih & deskriptif** — semua slug `kebab-case`, tidak ada ID acak di URL publik.
2. **App Router dengan Route Group** untuk memisahkan area & layout:
   - `(public)` → Public Layout (header + footer + breadcrumb)
   - `(learning)` → Learning Layout (fokus player, minimal)
   - `(profile)` → Profile Layout (sidebar/tab user)
3. **`app/` hanya route** — halaman `page.tsx` men-compose komponen dari `features/` (lihat `architecture.md`).
4. **Dynamic route berbasis slug** (`[slug]`) dengan `generateStaticParams` + ISR untuk halaman publik (performa & SEO).
5. **Query string** hanya untuk filter/sorting/pagination/search — bukan bagian dari URL path.

---

## 2. Route Tree Lengkap

```
audio.manhajsalafinsights.com
│
├── /                                   → Home                     (public)
│
├── /belajar                            → Learning Dashboard       (profile · login)
│   ?tab=lanjutkan|seri|bookmark|catatan|riwayat
│
├── /explore                            → Explore                 (public)
│   ?kategori=, ?ustadz=, ?type=, ?tag=, ?sort=, ?page=
│
├── /trending                           → Trending                (public)
│   ?range=hari|minggu|bulan, ?sort=terbanyak_diputar|disimpan|selesai
│
├── /search                             → Search                  (public)
│   ?q=, ?tab=audio|series|speaker|tag|kategori, ?page=
│
├── /series                             → Daftar semua series     (public)
│   ?sort=, ?page=
├── /series/[slug]                      → Series Detail           (public)
│
├── /audio/[slug]                       → Audio Detail (player)   (learning)
│
├── /speaker                            → Speaker Library         (public)
│   ?sort=az|terbaru|series_terbanyak, ?page=
├── /speaker/[slug]                     → Speaker Detail          (public)
│
├── /category/[slug]                    → Category Detail         (public)
├── /tag/[slug]                         → Tag Detail              (public)
│
├── /bookmark                           → Bookmark user           (profile)
├── /history                            → Riwayat user           (profile)
├── /continue-listening                 → Continue Learning       (profile · login)
│   ?filter=sedang|hampir_selesai|baru_dimulai, ?sort=terakhir|progress
├── /favorite-series                    → Series favorit         (profile)
├── /profile                            → Profil & statistik     (profile)
│
├── /tentang                            → Tentang MSI Audio      (public)
├── /kebijakan-privasi                  → Kebijakan privasi      (public)
├── /syarat-ketentuan                   → Syarat & ketentuan     (public)
│
└── (404)  /not-found.tsx               → Halaman tidak ditemukan
```

---

## 3. Struktur App Router

```
app/
├── layout.tsx                    # Root layout — font, provider global, <html><body>
├── globals.css
├── not-found.tsx                 # 404 global (dipakai semua segment)
├── loading.tsx                   # fallback global (optional)
├── sitemap.ts
├── robots.ts
│
├── (public)/
│   ├── layout.tsx                # PUBLIC LAYOUT — header + footer + breadcrumb
│   ├── page.tsx                  # Home
│   ├── explore/
│   │   └── page.tsx
│   ├── trending/
│   │   └── page.tsx
│   ├── search/
│   │   └── page.tsx
│   ├── series/
│   │   ├── page.tsx              # Daftar series
│   │   └── [slug]/
│   │       └── page.tsx          # Series Detail
│   ├── speaker/
│   │   ├── page.tsx              # Speaker Library
│   │   └── [slug]/
│   │       └── page.tsx
│   ├── category/
│   │   └── [slug]/
│   │       └── page.tsx
│   ├── tag/
│   │   └── [slug]/
│   │       └── page.tsx
│   └── (static)/
│       ├── tentang/page.tsx
│       ├── kebijakan-privasi/page.tsx
│       └── syarat-ketentuan/page.tsx
│
├── (learning)/
│   ├── layout.tsx                # LEARNING LAYOUT — minimal, player sticky
│   └── audio/
│       └── [slug]/
│           └── page.tsx          # Audio Detail (halaman pemutar)
│
└── (profile)/
    ├── layout.tsx                # PROFILE LAYOUT — sidebar navigasi user
    ├── belajar/
    │   └── page.tsx              # Learning Dashboard (halaman utama setelah login)
    ├── bookmark/page.tsx
    ├── history/page.tsx
    ├── continue-listening/page.tsx   # Continue Learning (lengkap)
    ├── favorite-series/page.tsx
    └── profile/page.tsx
```

### Alasan route group
| Route group | URL tetap | Layout yang dikenakan |
|---|---|---|
| `(public)` | tanpa prefix | Header situs + footer + breadcrumb |
| `(learning)` | tanpa prefix | Layout pemutar minimal (tanpa footer) |
| `(profile)` | tanpa prefix | Sidebar/tab profil + proteksi login |

> Route group **tidak mengubah URL** — hanya mekanisme pengelompokan layout Next.js.

---

## 4. Layout Mapping

| Halaman | Root | Public | Learning | Profile | Proteksi |
|---|---|---|---|---|---|
| Home, Explore, Trending, Search, Series, Speaker, Category, Tag, Statis | ✔ | ✔ | | | publik |
| Audio Detail | ✔ | | ✔ | | publik |
| Learning Dashboard (`/belajar`) | ✔ | | | ✔ | login |
| Bookmark, History, Continue Learning, Favorite Series, Profile | ✔ | | | ✔ | login |

---

## 5. Dynamic Route & Rendering

| Route | Parameter | Rendering yang disarankan |
|---|---|---|
| `/series/[slug]` | `slug` unik | `generateStaticParams` + ISR (revalidate) |
| `/audio/[slug]` | `slug` unik | `generateStaticParams` + ISR |
| `/speaker/[slug]` | `slug` unik | ISR |
| `/category/[slug]`, `/tag/[slug]` | `slug` unik | ISR |
| Halaman profil user | — | Server-rendered per request (data personal, tidak di-cache) |

```
generateStaticParams() → daftar semua slug (published)
generateMetadata({ params }) → title, description, OG, structured data
```

> Halaman publik yang berubah jarang (series, audio, speaker) di-render statis lalu di-revalidate berkala. Halaman personal (bookmark, history, progress) selalu fresh per user.

---

## 6. Query Parameter

| Halaman | Parameter | Nilai | Keterangan |
|---|---|---|---|
| Learning Dashboard | `tab` | `lanjutkan` \| `seri` \| `bookmark` \| `catatan` \| `riwayat` | section aktif (mobile) |
| Explore | `kategori` | slug kategori | filter |
| | `ustadz` | slug ustadz | filter |
| | `type` | slug series type | filter |
| | `tag` | slug tag | filter |
| | `sort` | `terbaru` \| `terlama` \| `az` \| `populer` | sorting |
| | `page` | angka | pagination |
| Trending | `range` | `hari` \| `minggu` \| `bulan` | jendela waktu |
| | `sort` | `diputar` \| `disimpan` \| `selesai` | metrik popularitas |
| | `page` | angka | pagination |
| Speaker Library | `sort` | `az` \| `terbaru` \| `series_terbanyak` | sorting |
| | `page` | angka | pagination |
| Continue Learning | `filter` | `sedang` \| `hampir_selesai` \| `baru_dimulai` | filter progress |
| | `sort` | `terakhir` \| `progress` | urutan |
| Search | `q` | kata kunci | teks |
| | `tab` | `audio` \| `series` \| `speaker` \| `tag` \| `kategori` | jenis hasil |
| | `page` | angka | pagination |
| Auth redirect | `next` | URL asal | setelah login kembali ke halaman (default `/belajar`) |

---

## 7. Sitemap

```
/
/explore
/trending
/search
/series
/series/{slug}           → setiap series published
/audio/{slug}            → setiap audio published
/speaker
/speaker/{slug}          → setiap speaker aktif
/category/{slug}         → setiap kategori
/tag/{slug}              → setiap tag
/tentang
/kebijakan-privasi
/syarat-ketentuan
```

- Dihasilkan lewat `sitemap.ts` (dinamis dari DB, hanya konten `published`/`active`).
- `robots.ts` membolehkan index semua route publik; blokir area `(profile)` — area user tidak di-index.
- Halaman user (`/belajar`, `/bookmark`, `/history`, `/continue-listening`, `/profile`, dll.) **tidak boleh** masuk sitemap dan diberi meta `robots: noindex`.
- `/trending` masuk sitemap (konten publik & stabil per rentang waktu).

---

## 8. URL Naming Convention

| Aturan | Contoh |
|---|---|
| Path segment: `kebab-case` | `/continue-listening` |
| Slug dinamis: kata-kata, tanpa ID | `/series/kitab-tauhid` |
| Parameter: `camelCase` singkat | `?sort=terbaru` |
| URL pasti mengarah ke konten yang sama (slug unik di DB) | tidak ada 2 series dengan slug sama |

---

## 9. 404 & Error Handling

| File | Fungsi |
|---|---|
| `app/not-found.tsx` | Halaman 404 global — untuk semua segmen |
| `app/error.tsx` | Error boundary per segment (fallback + tombol coba lagi) |
| `app/global-error.tsx` | Error fatal root |

- Slug tidak ditemukan → `notFound()` dari dalam `page.tsx` (menampilkan 404 dengan saran konten lain).
- State kosong (belum ada bookmark/history) → komponen `EmptyState` (lihat `wireframe.md`).

---

## 10. SEO Hooks per Route

| Route | generateMetadata | Structured Data (JSON-LD) |
|---|---|---|
| Home | `WebSite` | |
| Explore/Search | `noindex` opsional (konten dinamis) | `BreadcrumbList` |
| `/trending` | title+desc (per `range`) | `CollectionPage`, `BreadcrumbList` |
| `/series/[slug]` | title+desc+OG | `LearningResource`, `CollectionPage`, `BreadcrumbList` |
| `/audio/[slug]` | title+desc+OG | `PodcastEpisode`, `AudioObject`, `BreadcrumbList` |
| `/speaker` (Library) | title+desc | `CollectionPage`, `BreadcrumbList` |
| `/speaker/[slug]` | nama+bio+OG | `Person`, `BreadcrumbList` |
| `/category/[slug]`, `/tag/[slug]` | title+desc | `CollectionPage`, `BreadcrumbList` |
| Halaman profil (`/belajar`, dll.) | `noindex` + title | — |

---

## 11. Future Route (tidak dibangun sekarang, sudah direncanakan)

| Fitur | Route yang akan muncul |
|---|---|
| Transkrip halaman | `/audio/[slug]/transcript` (atau tab dalam Audio Detail) |
| Terjemahan | `/audio/[slug]?lang=ar\|id\|en` |
| Komentar kajian | `/audio/[slug]#komentar` |
| PWA/manifest | `/manifest.webmanifest`, service worker |
| Public REST API | `/api/v1/...` |
| Video/Ebook/Artikel | `/video/[slug]`, `/ebook/[slug]`, `/artikel/[slug]` — mengikuti pola `/audio/[slug]` |
