# Phase 13 — SEO & Performance

## Status
Selesai. Tidak ada redesign UI, tidak ada perubahan arsitektur YouTube/player, tidak ada fitur baru.

## Verifikasi
- `npm run lint` → 0 error, 0 warning
- `npm run typecheck` → lolos
- `npm run build` → sukses (77 halaman statis, semua prerender OK)
- Audit 15+ rute di prod server (port 3100) → semua 200; 404 slug tak dikenal; redirect role/legacy tetap bekerja

## 1. SEO Metadata (Open Graph, Twitter, Canonical, Title)
**Bug title terduplikasi diperbaiki:** root layout template `%s | MSI Audio` + halaman yang sudah memuat "MSI Audio" → `<title>Semua Series — MSI Audio | MSI Audio</title>`. Sekarang template `%s — MSI Audio` dan semua suffix hardcoded dihapus:
- Public list/detail: explore, series, kitab, pemateri, kategori, tag, audio → title bersih, template menambah brand sekali.
- User dashboard & auth pages: `Dashboard — MSI Audio`, `Masuk — MSI Audio` (tanpa duplikasi).
- Admin: `Series (Admin) — MSI Audio`, dst.

**Canonical** (tidak ada auto-canonical di Next — dikonfirmasi via curl):
- Semua halaman public kini punya `alternates.canonical` eksplisit: `/`, `/explore`, `/series`, `/kitab`, `/pemateri`, `/kategori`, dan semua detail (`/series/[slug]`, `/kitab/[slug]`, `/pemateri/[slug]`, `/kategori/[slug]`, `/tag/[slug]`, `/audio/[slug]`).

**Open Graph / Twitter:**
- Helper baru `lib/seo.ts`: `absoluteUrl`, `canonicalUrl`, `buildOpenGraph`, `buildTwitter`, `buildOpenGraphImages`, `buildBreadcrumbJsonLd`.
- Root layout kini punya `openGraph` + `twitter` default (siteName, locale `id_ID`, og:image default).
- Halaman detail memakai cover masing-masing untuk og:image, dengan fallback ke gambar OG default (saat cover null).
- Fix bug `absoluteUrl` untuk URL remote penuh (cover Supabase) — sebelumnya menghasilkan URL rusak `http://localhost:3000/https://...`.

**Gambar OG default:** `app/opengraph-image.tsx` (ImageResponse `next/og`) — 1200×630 PNG teal "MSI AUDIO", statis, terverifikasi 200 `image/png`.

**Domain:** semua URL SEO memakai `site.url` ← `NEXT_PUBLIC_APP_URL` (env). Tidak ada localhost hardcoded; di produksi cukup set env ke domain asli (saat ini `.env` masih `http://localhost:3000`, itu sumber `site.url`).

## 2. Robots + noindex + Sitemap
- `app/robots.ts`: `Disallow` untuk `/user/`, `/admin/`, `/login`, `/register`, `/forgot-password`, `/reset-password`, `/verify-email`, `/search/`; `Sitemap` absolut. Terverifikasi 200.
- Layout `app/user/layout.tsx` & `app/admin/layout.tsx` kini `robots: { index: false, follow: true }` → meta `<meta name="robots" content="noindex, follow"/>` terverifikasi di HTML.
- `app/sitemap.ts`: dinamis dari DB — rute statis + semua slug published (series, audio, kitab/series-type, pemateri/speaker, kategori, tag), dengan `lastmod`, `changefreq`, `priority`. Terverifikasi: 12 audio, 4 series, 3 kategori, 3 tag, 3 pemateri, dll. (Route handler statis, sesuai docs; tak diintersep proxy.)

## 3. Structured Data (JSON-LD)
- Series detail: `CollectionPage` + `BreadcrumbList` (baru).
- Kitab, Kategori, Tag detail: `BreadcrumbList` (baru).
- Pemateri detail: `Person` (baru) + `BreadcrumbList`.
- Audio detail: perbaiki URL `.../speaker/...` → `.../pemateri/...` di `contributor` (bug link rusak).
- Terverifikasi di HTML.

## 4. Image Optimization (`<img>` → `next/image`)
Semua `<img>` mentah dikonversi (0 tersisa):
- Public: search `SpeakerRow`, `pemateri-card`, pemateri detail avatar.
- Dashboard & progress: `continue-learning`, user dashboard `history-list`, `bookmarks-list`, `recently-played`, `latest-bookmarks`, `series-progress`, `bookmark-list`.
- Player: `player-related`, `player-next-session` (fill + sizes responsive).
- Admin: `series-table`, `audio-table`, `kitab-table`, `ustadz-table`, `image-upload` (preview cover), `audio-form` (thumb YouTube), `youtube-parser`.
- Memakai `fill` + `sizes` untuk thumbnail, `width/height` untuk avatar tetap; lazy default, tanpa `priority` berlebih. `remotePatterns` di `next.config.ts` sudah ada untuk YouTube & Supabase.

## 5. Database Query & Index Audit
- **Index:** Audit `prisma/schema.prisma` — semua pola query publik sudah ter-index: `Series[published,createdAt]`, `Series[seriesTypeId,published]`, `Audio[seriesId,published,nomorSesi]`, `Audio[published,createdAt]`, `Speaker[status]`, slug `@unique` untuk series/kitab/kategori/tag/speaker, join tables `[speakerId]`/`[categoryId]`/`[tagId]`, serta semua index user data (ListeningHistory, Bookmark, UserProgress, Favorite, dst). **Tidak diperlukan migration baru** (tidak ada query N+1 struktural; search pakai `contains` di dataset kecil).
- **Dedupe query:** fungsi detail yang dipanggil di `generateMetadata` DAN body page dibungkus React `cache()` (dedupe per-request) — `findPublishedSeriesBySlug`, `findPublishedSeriesTypeBySlug`, `findPublishedCategoryBySlug`, `findPublishedTagBySlug`, `findPublishedSpeakerBySlug`, `findPublishedAudioBySlug`, dan `getPlayerContext`. Mengurangi query ganda di `/series/[slug]`, `/kitab/[slug]`, `/kategori/[slug]`, `/tag/[slug]`, `/pemateri/[slug]`, `/audio/[slug]`. Tidak dipakai di admin/route handlers (aman).

## 6. Server Components & Caching
- Audit: komponen shared public (SeriesCard, AudioRow, SpeakerCard, KitabCard, PemateriCard, Breadcrumb, Cover, SectionHeader) semuanya Server Component; hanya komponen interaktif yang "use client" (Pagination, FilterPanel, SearchInput, form admin, player). Tidak ada konversi berisiko.
- Strategi data publik: tetap ISR `revalidate=60` + `generateStaticParams`/`dynamicParams=false` (perlu deploy/rebuild untuk slug baru — tradeoff yang sudah dipilih di fase sebelumnya; proxy Phase 11 menangani 404 untuk series/kategori/tag yang dynamic).
- **Revalidasi setelah publish:** admin actions series & audio (`create/update/delete/status/bulk`) kini memanggil `revalidatePath("/", "layout")` → konten update tampil tanpa menunggu window ISR.
- User data (progress/history/bookmark/notes/favorit) tetap per-user, tidak pernah di-cache global.

## 7. Loading, Error, 404
- `app/(public)/series/loading.tsx` (baru), `app/user/dashboard/loading.tsx` (baru).
- `app/error.tsx`: hapus tampilan `error.message` (mencegah bocor pesan/stack internal Prisma/DB).
- `app/user/error.tsx` (baru) — pesan aman, tombol retry.
- Fix bug `app/admin/error.tsx`: prop `retry` (tidak pernah diteruskan Next, tombol mati) → `reset` (API resmi Next 16).
- 404 terverifikasi: slug series/audio/kitab tak dikenal → 404 (proxy + `dynamicParams=false`).

## Catatan & Keputusan
- Tidak mengaktifkan `cacheComponents`/`use cache` — perubahan arsitektur besar berisiko; ISR 60s + `cache()` sudah cukup.
- Gambar OG default memakai font system (bukan font custom) — tidak ada font asset di repo.
- `public/` tetap kosong; default OG dihasilkan via route `opengraph-image`.
- Issue visual (jika ada dari perubahan image) di-defer ke **Phase 15**; tidak memulai Phase 14.
