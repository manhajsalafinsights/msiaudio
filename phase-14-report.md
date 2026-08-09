# Phase 14 — Testing, Security & Production Readiness

## Status
Selesai. Verifikasi menyeluruh semua fitur Phase 1–13 (auth, otorisasi, isolasi data, CRUD, player, progress, bookmark, notes, search, explore, SEO, database, env, build). Ditemukan & diperbaiki 1 regresi produksi baru (unknown slug detail → 500/200) akibat `dynamicParams=true` dari Phase 14. **Final Status: READY FOR PHASE 15.**

## Verifikasi Umum
- `npm run lint` → 0 error, 0 warning
- `npm run typecheck` → lolos
- `npm run build` → sukses (78 halaman statis, semua prerender OK)
- `npx prisma validate` → schema valid; `npx prisma migrate status` → database up to date (3 migrations); `npx prisma generate` → OK
- Prod server aktif di `:3100` (PID restart, `next start -p 3100`), dev di `:3000`

## Route Audit
- Semua rute publik 200: `/`, `/explore`, `/series`, `/series/[slug]`, `/audio/[slug]`, `/pemateri`, `/pemateri/[slug]`, `/kategori`, `/kategori/[slug]`, `/tag/[slug]`, `/kitab`, `/kitab/[slug]`, `/search`, `/robots.txt`, `/sitemap.xml`
- Semua rute auth 200: `/login`, `/register`, `/forgot-password`, `/reset-password`, `/verify-email`
- Semua rute user 200 (sesi USER): dashboard, history, bookmarks, favorites, notes, profile, settings
- Semua rute admin 200 (sesi ADMIN): dashboard, ustadz, kitab, series, audio, kategori, tag, media, + halaman new/edit. Catatan: nama rute aktual adalah `/admin/kategori` & `/admin/tag` (bukan `/admin/categories`/`/admin/tags`)
- Redirect role: USER→`/admin/*` = 307→`/user/dashboard`; ADMIN→`/user/*` = 307→`/admin/dashboard`; `/admin/login` = 307→`/login?next=...`
- Redirect legacy (307) dipertahankan (proxy)
- Slug tak dikenal kini **404 di semua prefix detail** (series, kategori, tag, pemateri, kitab, audio) — lihat Issues Found

## Authentication
- Login/register/logout/get-session terverifikasi live di prod (`/api/auth/sign-in/email`, `/sign-up/email`, `/sign-out`, `/get-session`)
- Flow logout/session live: login → token sesi ada → protected 200 → logout (200) → `get-session` = null (sesi di-revoke) → protected 307 ke `/login?next=...`. Sesi bertahan lintas request (cookie) = "session after refresh" OK. Expired sesi (1 tahun) tidak diuji live.
- CSRF: POST `/api/auth/*` tanpa `Origin: http://localhost:3000` (trusted origin) → `INVALID_ORIGIN`
- Register: email duplikat → `USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL`; password < 8 → `PASSWORD_TOO_SHORT`; user baru selalu role USER (field role `input:false`)
- Anti-enumeration: forgot-password selalu sukses; login invalid/gagal → pesan generik (termasuk email tak terdaftar)
- Cookie sesi `#HttpOnly_localhost` (HttpOnly, Secure saat applicable)
- Password tersimpan sebagai hash Better Auth (161-char), tidak pernah plaintext
- Auth pages saat sudah login → redirect ke `/dashboard` (proxy AUTH_PATHS)

## Authorization
- Server actions admin: seluruh `features/admin/**/actions.ts` diawali `await requireAdmin()` (39 call site, verified via grep)
- `features/auth/*`, `features/audio/*`, `features/series/*` tanpa role guard (aksi baca publik, aman)
- `app/api/` tanpa endpoint admin publik; semua endpoint user memakai `getCurrentUser()`
- Server action dipanggil manual (curl, tanpa sesi) → tidak ada data bocor (`{}`)

## Security
- Env: semua secret server-only (`DATABASE_URL`, `DIRECT_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `AUTH_SECRET`) tanpa prefix `NEXT_PUBLIC`; `NEXT_PUBLIC_*` hanya nilai non-secret; `lib/config/env.ts` melempar pada var invalid/missing; `.env` di-exclude git; `.env.example` mendokumentasikan server-only vs NEXT_PUBLIC
- No leak stack/detail internal: `app/error.tsx`, `app/user/error.tsx` menampilkan pesan aman tanpa `error.message`
- API notes/progress/history/bookmark/favorites memakai `user.id` dari sesi; `userId` dari body diabaikan
- Delete-safety (fiks Phase 14): `deleteUstadz`/`bulkDeleteUstadz`, `bulkDeleteSeries`, `bulkDeleteKitab` pre-check penggunaan dan blokir saat masih terpakai (`CONFLICT`, pesan ramah); `deleteSeries`/`deleteKitab` menangkap FK Restrict → pesan ramah (`error.message.toLowerCase().includes("restrict")`)
- Live test delete-safety di prod:
  - `deleteUstadz` pemateri ter-link → `{"code":"CONFLICT","message":"Ustadz tidak dapat dihapus karena masih dipakai series"}`
  - `deleteSeries` dgn audio → blokir, pesan "Series tidak dapat dihapus karena masih memiliki audio"
  - `deleteKitab` terpakai → blokir, pesan "Kitab tidak dapat dihapus karena masih dipakai series"
  - `bulkDeleteSeries` (4 series) → `CONFLICT`, "4 series tidak dapat dihapus…" — tidak ada data hilang
  - `bulkDeleteUstadz` (3 ustadz) → `CONFLICT`, "3 ustadz tidak dapat dihapus…" — tidak ada data hilang
  - Delete ustadz bebas-link (CRUD cycle) → sukses; data bersih setelahnya

## User Data Isolation
- IDOR live test (Phase 14): User A mencoba baca/ubah/hapus data User B (progress, history, bookmark, note, favorite) → kosong/404/false; tidak ada data bocor
- Progress GET mengembalikan null saat tidak dimiliki; anonymous progress POST → 401
- QA user + seluruh datanya telah dibersihkan

## CRUD
- CRUD ustadz/series/audio/kategori/tag/kitab terverifikasi (create/update/status/delete), termasuk pivot speaker/kategori/tag
- Wire protocol server action diverifikasi: arg tunggal body `["id"]`, arg array body `[["a","b"]]`
- `dynamicParams = true` + ISR `revalidate = 60` pada 5 halaman detail → konten baru yang dibuat setelah build langsung 200 (verifikasi post-build)

## Player
- Kode player di-review (tanpa browser automation): `use-youtube-player.ts`, `player-provider.tsx`, `player-store.ts`, `player-full.tsx`, `use-player-keyboard.ts`, `use-progress.ts`
- Single instance aman (`initializingRef` + `playerRef`); `destroy()` pada unmount; interval polling di-clear; event handler via constructor (tidak bocor); API IFrame dimuat sekali + di-cache; timeout load API & onReady; error state untuk embed-restriction (101/150) tanpa bypass
- Resume: `handleInit` fetch `/api/progress` dan seek bila posisi > 30s & belum completed
- Progress reporter: throttle 10 detik + kirim saat pause/end/near-end (threshold 95%)
- **Tidak ada browser automation** → interaksi play/pause/seek/screenshot responsif tidak diuji otomatis (catatan: terdefer, lihat Deferred)
- Limitation: provider non-YouTube (direct URL) dikenali namun player saat ini menampilkan error "belum didukung" (konsisten dgn keputusan YouTube-only)

## Progress
- POST `/api/progress` menghitung percent + completed (threshold 95%), upsert `ListeningHistory` + `UserProgress`
- Live: 600s audio @ 570s → `progressPercent:95`, `completed:true`; GET mengembalikan history; isolasi per-user; anonymous → 401

## Bookmark
- Toggle ON/OFF, check, daftar, isolasi per-user; anonymous → false; tombol ter-wire di `PlayerControls` via `useBookmark`

## Notes
- CRUD via `/api/notes` + `/api/notes/[id]`; ownership di-verifikasi (delete/patch user lain → 404); `userId` body diabaikan
- Note menyimpan `positionSeconds` (timestamp) dan menampilkannya sebagai durasi; tombol "jump ke posisi" dari daftar note belum di-wire (lihat Deferred)

## Search & Explore
- `/search?q=tauhid` → series + audio; draft tidak muncul (repo semua published-only); empty state "tidak ditemukan"; `q=` kosong → 200
- Search lintas kolom terverifikasi: judul/slug (`tauhid` → Syarah Kitab At-Tauhid), **nama ustadz** (`ustadz abu bakar` → Fiqih Thaharah Ringkas), **nama kitab/seriesType** (`kajian kitab` → series bertipe Kajian Kitab), **tag** (`thaharah` → Fiqih Thaharah Ringkas)
- Explore menampilkan series/audio published; konten baru setelah publish muncul

## SEO
- Title bersih (`Muqaddimah & Keutamaan Tauhid — Syarah Kitab At-Tauhid — MSI Audio`), canonical eksplisit, JSON-LD (`PodcastEpisode`+`BreadcrumbList` di audio, `Person` di pemateri), `noindex, follow` di `/user`+`/admin`, robots.txt, sitemap 32 URL, OG/Twitter (Phase 13) — terverifikasi ulang

## Database
- Data bersih & konsisten pasca semua tes: 3 speaker (semua ACTIVE & ter-link), 4 series (semua published; At-Tauhid 4, Al-'Aqidah 2, Fiqih Thaharah 3, Adab Sehari-Hari 3 = 12 audio), 9 kategori, 6 tag, 7 seriesType, tanpa orphan speaker/series/audio
- Seed speaker `Ustadz Muhammad Abdullah` (rusak oleh tes cascade Phase 14) **dipulihkan** + 2 link `seriesSpeaker` (Al-'Aqidah Al-Wasithiyyah & Adab Sehari-Hari Muslim)
- Kategori `Tauhid` & tag `akidah` (terhapus tak sengaja saat tes delete kategori/tag) **dipulihkan** beserta link-nya
- Migrations up to date; tidak ada migration baru

## Environment Variables
- Semua secret server-only; schema env melempar saat invalid; `.env.example` up to date

## Build
- `npm run build` sukses (78 halaman statis + dynamic); prod restart di `:3100`, home & semua rute 200; log bersih (0 error)

## Testing
- Live curl terhadap prod `:3100` untuk: auth, otorisasi, CSRF, IDOR, CRUD, delete-safety, progress, bookmark, notes, search, SEO, slug-404, route audit, redirect role
- `lint` + `typecheck` + `build` lulus setelah seluruh fiks
- Tidak ada browser automation (Playwright/Puppeteer tidak tersedia di sesi ini)

## Issues Found
1. **[FIXED] Unknown slug audio → HTTP 500.** `getPlayerContext`/`getAudioBySlug` melempar `new Error("Audio tidak ditemukan")` (bukan `NotFoundError`), sehingga `if (error instanceof NotFoundError) notFound()` di `app/(learning)/audio/[slug]/page.tsx` tidak terpenuhi → 500. Diperbaiki: kedua fungsi kini melempar `NotFoundError`.
2. **[FIXED] Unknown slug pemateri/kitab → HTTP 200** (konten 404 tapi status 200 — streaming shell / ISR). Proxy hanya menangani series/kategori/tag. Diperbaiki: `proxy.ts` `isMissingDynamicSlug` kini juga memeriksa `pemateri` (ACTIVE + series published), `kitab` (seriesType dgn series published), dan `audio` (published) → rewrite `/_not-found` status 404. Keduanya adalah regresi dari `dynamicParams = true` (sebelumnya unknown slug di-404 oleh router).
3. **[MINOR] Kode error delete tunggal `deleteSeries`/`deleteKitab`** mengembalikan `UNKNOWN_ERROR` (dengan pesan ramah) sedangkan `bulkDelete*` mengembalikan `CONFLICT`. Pesan sudah benar & blokir bekerja; penyelarasan label kode didefer.
4. **[MINOR] Kategori/Tag delete meng-cascade link pivot secara diam-diam** (FK Cascade). Tidak menyebabkan orphan (series aman), namun admin tidak diberi konfirmasi bahwa N series akan di-unlink. Defer ke Phase 15 (UI confirm dialog).
5. **[MINOR] Player:** `PlayerProvider.initializePlayer` memakai `console.log` tanpa gate NODE_ENV; interval polling YT di-recreate saat posisi berubah (~4x/detik) dan efek sync memanggil `playVideo()`+`seekTo()` pada setiap perubahan posisi (potensi micro-stutter); next/prev tidak memanggil `loadSource` (hanya relevan bila queue > 1). Tidak ada leak/duplikat player.
6. **[MINOR] Notes:** timestamp note tersimpan & ditampilkan, tapi belum ada tombol "kembali ke posisi audio" dari daftar note.

## Deferred to Phase 15
- Automated browser tests (player play/pause/seek/volume/speed/destroy, screenshots responsive) — perlu tooling browser
- Confirm dialog delete kategori/tag (pemberitahuan unlink pivot)
- Penyamarataan kode error delete tunggal → `CONFLICT`
- Gate `console.log` di `player-provider.tsx`; optimasi polling/sync player (efek posisi)
- Wire-up `loadSource` untuk next/prev multi-sesi; wiring QuickActions (bookmark sudah via PlayerControls, note via NoteEditor; focus/share masih stub)
- Tombol "jump ke posisi" dari daftar note
- Issue visual responsif apa pun (perlu inspeksi visual)

## Final Status
**READY FOR PHASE 15** — semua audit lulus, regresi produksi yang ditemukan telah diperbaiki & diverifikasi, build/lint/typecheck hijau, data seed bersih & konsisten.
