# Phase 15 — UI/UX Polish & MSI Audio Visual Identity (REPORT)

## Ringkasan
Fase ini fokus UI/UX saja. **Tidak ada perubahan** pada business logic, schema DB, authentication,
authorization, repository, player provider, YouTube architecture, bookmark/notes/progress/search,
maupun admin CRUD logic. Semua perubahan adalah styling/tampilan + pemasangan tombol yang tadinya
stub (bookmark/note/share pada player). Ditemukan & diperbaiki 1 bug UI nyata: `SpeakerCard`
menautkan `/speaker/{slug}` yang tidak ada (404) → sekarang `/pemateri/{slug}`.

## 1. Homepage Improvements
- **Hero baru**: value proposition kuat — "Dengarkan kajian. Belajar dengan lebih terarah." + badge
  "Platform Audio Kajian Islam", CTA "Mulai Mendengarkan" → `/explore`. Menghapus link audio
  hardcoded (`/audio/adab-sehari-hari-muslim-sesi-1`) dan teks placeholder.
- **Menghapus data palsu**: komponen `features/home/components/continue-learning.tsx`
  (hardcoded "Kitab Bulughul Maram", 65%, link audio tidak valid) dan `progress-stats.tsx`
  (angka hardcoded 3/12/270/1) dihapus. Kini memakai `ContinueLearning` **asli**
  (`features/progress/continue-learning.tsx`) yang membaca DB dan return null jika tidak ada
  progress (anonim).
- **Menghapus "Statistik MSI Audio"** (angka fiktif 300+/8.000+).
- **Urutan section baru**: Hero → Lanjutkan Belajar (real) → Kajian Terbaru → Pilihan Kitab →
  Pemateri → Kategori → Series Terbaru → Temukan Kajian (CTA pencarian). Ringan, tidak ramai.
- Dekorasi hero: sound-wave bars teal subtle (bukan stock image), gradien kalem.

## 2. Explore Improvements
- Header discovery diubah menjadi **"Temukan Kajian"** + deskripsi yang menjelaskan manfaat.
- Ditambah **search bar** ("Cari series, kitab, ustadz, atau tema...") yang submit ke `/search`.
- Mode tab (Series/Audio + filter kategori/kitab/pemateri/tag/durasi) tetap dipertahankan.

## 3. Series Improvements
- Struktur detail series sudah kuat (cover, judul, pemateri, kitab, kategori, progress, daftar
  sesi, series terkait) — dipertahankan; hanya merapikan konsistensi hover/spacing yang sama
  dengan kartu lain.
- Catatan: `dynamicParams=false` di `/series/[slug]` dipertahankan (keputusan Phase 14); ini
  berarti series baru pasca-build butuh rebuild untuk tampil. Didefer ke keputusan berikutnya.

## 4. Player Improvements (prioritas utama)
- **Progress bar**: ditulis ulang (`player-progress-track/fill/thumb`) — sekarang **bisa
  di-drag** (pointer events + pointer capture), **keyboard** (←/→ 10 detik, Home/End),
  hover thumb, tinggi 6–8px desktop / 12px mobile dengan thumb selalu terlihat, label waktu
  `00:34 42:15`. (Sebelumnya class `progress-bar/progress-bar-fill/thumb` tidak terdefinisi.)
- **Urutan kontrol sesuai spec**: Previous → −10s → **Play/Pause (fokus, 64px)** → +30s → Next.
  Bookmark dikeluarkan dari transport controls.
- **Quick Actions di-wire** (sebelumnya stub `() => {}`):
  - Bookmark → pakai hook `useBookmark` nyata (toggle ON/OFF).
  - Catatan → membuka `NoteEditor` (dengan posisi saat ini).
  - Bagikan → `navigator.share`, fallback copy-link + feedback "Tersalin". (Focus mode dihapus
    dari quick actions sesuai hierarki spec; tetap ada `player-sleep-timer` terpisah.)
- **Player deck**: kontrol/progress/durasi/kecepatan/volume kini dibungkus kartu
  (`card-outlined`) yang terasa seperti audio player, bukan halaman YouTube.
- Tombol "Putar Audio" pra-load menjadi play button melingkar besar (audio-app-like).
- YouTube iframe tetap tersembunyi (`h-1 w-1 opacity-0`) — audio-first.
- **Audio Terkait** ditambahkan di halaman audio (server-rendered via repo existing):
  sesi series yang sama + kajian pemateri sama, dedupe, maks 6.
- Cover fallback emoji (`🎧`) diganti ikon `Headphones` di gradien brand.

## 5. User Dashboard Improvements
- Struktur tetap sesuai prioritas spec (Statistik → Lanjutkan Belajar → Kemajuan Series →
  Terakhir Diputar → Bookmark/Catatan). Perbaikan token warna (hardcoded `text-green-600` →
  `text-success`) agar konsisten light/dark.

## 6. Admin Dashboard Improvements
- Stat card Series & Audio kini menampilkan **jumlah draft** eksplisit
  ("X terbit · Y draft"), sesuai prioritas spec (Total/Draft/Published).
- **Aksi Cepat** ditambah "Tambah Kitab" → grid jadi 5 kolom.
- Tampilan CMS (sidebar admin terpisah dari UI user) dipertahankan.

## 7. Responsive Improvements
- Progress bar player: touch-friendly (12px mobile, thumb selalu tampak).
- Hero: layout stack mobile, sound-wave hanya lg+.
- Quick actions & tombol kontrol memakai target sentuh ≥44px (`btn-player` h-11/w-11).
- Grid section: 1→2→4 kolom sesuai breakpoint (tidak ada horizontal overflow baru).

## 8. Dark Mode Improvements
- Token yang **belum terdefinisi** kini ada: `--color-brand-strong`, `--color-destructive`,
  `--color-ring`. Sebelumnya `text/bg-destructive` (error player/notes/error page), `ring-ring`
  (focus seluruh UI), dan `brand-strong` (hover) **tidak menghasilkan CSS sama sekali** → pesan
  error tak terlihat & focus ring hilang. Sekarang berfungsi penuh di light & dark.
- Warna hardcoded yang tidak kontras di dark (`text-green-600`) diganti token `text-success`.
- Gradient brand yang sama (light/dark) dipakai konsisten untuk CTA, cover, dan player.

## 9. Accessibility Improvements
- Focus ring sekarang benar-benar tampil (`focus-visible:ring-ring`, outline player).
- Progress bar: `role="slider"`, aria-valuenow/min/max/text, keyboard navigasi.
- Tombol ikon punya `aria-label`; quick actions icon+label teks.
- `prefers-reduced-motion` tetap menghormati seluruh animasi.
- Semantic HTML dipertahankan (heading hierarchy, `role="region"`, tablist).

## 10. Performance Impact
- **Tidak ada library baru**; hanya class CSS + komponen existing (lucide icons).
- `next/image` tetap dipakai (Cover/related/player), lazy by default.
- Server Components dipertahankan; homepage sections dibungkus `Suspense`; ISR `revalidate=60`
  pada public pages tidak berubah.
- CSS custom kecil (`btn-player`, `player-progress-*`, `card-msi`, `tab-button`) ditulis di
  `globals.css` — tidak menambah bundle besar. Build: 78 static pages, compiled success.

## 11. Files Created
- Tidak ada file baru.

## 12. Files Modified
- `app/globals.css` — token baru (brand-strong/destructive/ring) + class `btn-player`,
  `card-msi`, `tab-button`, `player-progress-track/fill/thumb` + dark mode values.
- `app/(public)/page.tsx` — homepage baru (hero nyata, section real, hapus fake stats).
- `app/(public)/explore/page.tsx` — "Temukan Kajian" + search bar.
- `app/(learning)/audio/[slug]/page.tsx` — section "Audio Terkait" (repo existing).
- `app/admin/dashboard/page.tsx` — draft counts pada stat card.
- `features/home/components/hero-section.tsx` — hero baru.
- `features/player/components/player-full.tsx` — player deck, controls wiring, play button.
- `features/player/components/player-controls.tsx` — urutan Prev/-10/Play/+30/Next.
- `features/player/components/player-progress.tsx` — draggable + keyboard + class baru.
- `features/player/components/player-quick-actions.tsx` — bookmark/note/share di-wire.
- `features/player/components/player-cover.tsx`, `player-related.tsx`, `player-next-session.tsx`
  — fallback emoji → ikon/`Cover`.
- `components/shared/cover.tsx` — fallback elegan (gradien + ikon).
- `components/shared/speaker-card.tsx` — **fix bug link** `/speaker/` → `/pemateri/`.
- `components/shared/kitab-card.tsx` — tambah `group` agar hover judul berfungsi.
- `components/admin/quick-actions.tsx` — "Tambah Kitab", grid 5 kolom.
- `features/note/note-editor.tsx`, `features/user/dashboard/recently-played.tsx`,
  `features/user/dashboard/series-progress.tsx`, `features/user/dashboard/history-list.tsx`
  — `text-green-600` → `text-success`.
- Dihapus: `features/home/components/continue-learning.tsx`, `features/home/components/progress-stats.tsx`
  (placeholder data palsu, tidak lagi dipakai).

## 13. Lint Result
- `npm run lint` → **0 errors / 0 warnings**.

## 14. Typecheck Result
- `npm run typecheck` → **lolos** (0 errors).

## 15. Build Result
- `npm run build` → **success**, 78 static pages, compiled OK.
- Production server `:3100` restart; semua route utama 200; unknown slug 404; log bersih
  (0 Error).

## Verifikasi Smoke (curl di prod :3100)
- `/` hero + semua section hadir; tidak ada sisa data palsu (Bulughul Maram / statistik fiktif).
- Link pemateri → `/pemateri/{slug}` (bukan `/speaker/`).
- `/audio/...` menampilkan "Audio Terkait" (3 sesi series yang sama).
- `/explore` → "Temukan Kajian" + search.
- `/admin/dashboard` → draft count + "Tambah Kitab".
- User dashboard → greeting + statistik real.
- `/speaker/...` kini 404 (tidak ada link yang menunjuk ke sana).

## Catatan / Didefer
- Browser automation interaktif (drag seek, share, dark mode toggle) tidak tersedia — diverifikasi
  via code review + curl.
- `dynamicParams=false` pada `/series/[slug]` (keputusan Phase 14) — series baru butuh rebuild;
  perlu keputusan untuk menyamakan dengan 5 halaman detail lain di fase berikutnya bila diinginkan.
- `player-panel.tsx` (tabs chapter/reference/highlight/notes/attachment/related) masih belum
  terpakai di player utama; data chapters/references/highlights tersedia di `PlayerAudio` namun
  tidak diisi seed. Didefer.

## Final Status
**SELESAI** — lint 0, typecheck 0, build success. UI/UX polish diterapkan sesuai spec
(audio-first, premium, calm, dark-mode safe, accessible). Tidak ada perubahan logic/business.

---

## Follow-up — Perbaikan Upload Gambar Admin (URL Eksternal Only)

### Laporan
- **Gejala**: `http://localhost:3000/admin/ustadz/new` (dan series/audio) gagal saat upload
  gambar → error **"Gagal menyiapkan bucket: fetch failed"**.
- **Akar masalah**: `.env` memakai kredensial Supabase placeholder
  (`SUPABASE_URL="https://placeholder.supabase.co"`, anon key 20 char, service role 28 char —
  key asli berupa JWT `eyJ...`). Domain tidak resolve sehingga `createBucket()` (Supabase
  Storage) gagal di lapisan jaringan. Upload/delete gambar satu-satunya fitur yang tergantung
  Supabase; auth (AUTH_SECRET) dan DB (DATABASE_URL) tidak terpengaruh.
- **Keputusan user**: hanya boleh **tempel URL gambar eksternal** (tanpa storage tambahan).

### Perubahan
- `features/admin/components/image-upload.tsx` → **DIGANTI** `image-preview.tsx` (`ImagePreview`):
  preview gambar + tombol "Hapus" saja; tombol "Upload Gambar" dan file input dihapus.
- `features/admin/ustadz/components/ustadz-form.tsx`, `series-form.tsx`, `audio-form.tsx`:
  import + hint diubah — "Tempel URL gambar eksternal (mis. thumbnail YouTube)"; kolom URL
  (`https://...`) yang sudah ada dipertahankan sebagai input utama.
- `features/admin/media/actions.ts` (uploadCoverImage/deleteCoverImage) **DIHAPUS** — tidak
  dipakai lagi setelah UI upload hilang.
- `lib/supabase/storage.ts`: `uploadCoverFile`/`ensureCoverBucket`/`COVER_MAX_SIZE`/
  `COVER_ALLOWED_TYPES` dihapus. Yang tersisa hanya `cleanupCover`/`deleteCoverByUrl`/
  `isManagedCoverUrl` — aman: untuk URL eksternal (tidak berawalan prefix bucket), delete jadi
  no-op tanpa network call, sehingga action admin (series/audio/ustadz) tetap jalan.

### Verifikasi
- Lint 0, typecheck 0, build success (78 static pages).
- Dev :3000 & prod :3100 restart. Form baru/edit untuk ustadz/series/audio:
  hint "Tempel URL gambar" tampil, string "Upload Gambar" tidak ada lagi.
- Tidak ada referensi tersisa ke `image-upload`, `media/actions`, `uploadCoverFile`,
  `ensureCoverBucket`, `COVER_MAX_SIZE`, `COVER_ALLOWED_TYPES`, `ImageUpload`.

---

## Follow-up 2 — Error `next/image` hostname tidak dikonfigurasi

### Laporan
- **Gejala**: saat admin menempel URL gambar dari Google Images di form (mis. URL
  `google.com/imgres?...`), console error:
  `Invalid src prop (...) on next/image, hostname "www.google.com" is not configured under
  images in your next.config.js`.
- **Akar masalah**: `next/image` hanya mengizinkan hostname pada `images.remotePatterns`
  (`i.ytimg.com`, `img.youtube.com`, `*.supabase.co`). Admin bebas menempel URL dari host
  mana pun (blogspot, wikimedia, dsb.) sehingga selalu berpeluang error. Selain itu URL
  `google.com/imgres?...` sebenarnya adalah halaman pencarian, bukan gambar langsung.
- **Catatan teknis**: validasi hostname dijalankan di `defaultLoader` (hanya saat
  development); saat `unoptimized=true`, loader dilewati dan `src` dipakai apa adanya —
  ini pola yang benar untuk gambar dari URL eksternal yang disuplai pengguna.

### Perubahan
- `next.config.ts`: tambah `images.unoptimized: true` (global) — semua `next/image` kini
  menampilkan gambar langsung dari `src` tanpa optimizer, sehingga hostname apa pun valid
  (di dev maupun prod). `remotePatterns` tetap dipertahankan untuk referensi.
- `features/admin/components/image-preview.tsx`: deteksi URL halaman pencarian
  (path `/imgres` atau parameter `imgurl`) → menampilkan peringatan "Ini URL halaman
  pencarian, bukan gambar langsung... gunakan 'Salin alamat gambar'" + rapi di bawah preview.

### Verifikasi
- Lint 0, typecheck 0, build success (78 static pages).
- Dev :3000 & prod :3100 restart; log bersih; halaman publik tidak lagi memuat
  URL `/_next/image?url=...` (gambar langsung dari `src`).
- Trade-off yang disengaja: optimasi/resize gambar otomatis nonaktif. Untuk platform audio
  (cover/thumbnail/avatar kecil) ini acceptable; CLS tetap dicegah lewat width/height/fill.

---

## Follow-up 3 — Tombol Hapus Admin "tidak bekerja" (feedback error hilang)

### Laporan
- **Gejala**: klik ikon hapus di `/admin/ustadz` (dan table admin lain) → tidak ada yang
  terjadi.
- **Akar masalah**: aksi `deleteUstadz` **berhasil dijalankan**, tetapi mengembalikan
  `{ ok: false, error: { code: "CONFLICT", message: "Ustadz tidak dapat dihapus karena masih
  dipakai series" } }` (semua ustadz seed memang terhubung ke series). Helper `run()` di tiap
  table menelan hasil aksi dan langsung `router.refresh()` tanpa menampilkan error → tampak
  seolah tombol tidak bekerja. Pola yang sama ada di 6 table admin (ustadz, series, audio,
  kitab, kategori, tag).
- **Catatan**: memblokir hapus ustadz/series/kitab yang masih dipakai adalah perilaku yang
  benar (integritas referensial); yang salah adalah tidak ada feedback.

### Perubahan
- `features/admin/lib/use-admin-action.ts` (BARU): hook `useAdminAction(refresh)` — membungkus
  `startTransition`, menangkap hasil `ActionState`, dan menyimpan `error.message` saat `!ok`.
- 6 table admin dipindah ke hook tersebut + menampilkan banner error inline (`role="alert"`,
  `bg-danger/10`, `text-danger`) di atas toolbar: ustadz, series, audio, kitab, kategori, tag.
- Tidak mengubah logika aksi; hanya menyajikan pesan error yang sudah dikembalikan aksi.

### Verifikasi
- Lint 0, typecheck 0, build success (78 static pages).
- Dev :3000 hot-reload OK, `POST /admin/ustadz` tetap terpanggil, log bersih.
- Kini ketika aksi gagal (mis. CONFLICT karena ustadz masih dipakai series), pesan alasan
  tampil di halaman. Untuk menghapus ustadz yang terhubung, lepas dulu dari series-nya.

---

## Follow-up 4 — Header mobile: login tampil, menu navigasi, dan dropdown Pemateri

### Laporan
- **Gejala**: tombol "Masuk" tersembunyi di mobile (punya class `hidden sm:inline-flex`);
  nav utama (`hidden md:flex`) juga tidak muncul sama sekali di layar kecil, sehingga
  pengguna mobile tidak bisa navigasi.

### Perubahan
- `components/layouts/site-header.tsx` (ditulis ulang):
  - Tombol **"Masuk" kini selalu tampil** di semua ukuran layar (dihapus `hidden sm:`);
    "Daftar" tetap di header desktop dan dipindah ke menu mobile.
  - Nama user yang login kini tampil juga di mobile (truncate).
  - Tombol **hamburger** (mobile) membuka panel navigasi berisi: link Beranda/Jelajahi/
    Series/Kitab, **dropdown Pemateri**, dan aksi auth (Masuk/Daftar atau Keluar).
  - Nav desktop tetap, dengan **Pemateri diganti dropdown** (bukan link biasa).
- `components/layouts/pemateri-dropdown.tsx` (BARU): dropdown "Pemateri" — daftar pemateri
  aktif (dari DB) + link "Semua Pemateri"; aksesibel (`aria-haspopup`, `aria-expanded`,
  tutup via Escape/klik luar), memakai mode `mobile` (list statis) di panel mobile.
- `app/(public)/layout.tsx`: jadi async server component — fetch `listActiveSpeakers()`
  dan kirim `speakers` ke `SiteHeader` (data server-rendered).
- `features/home/components/hero-section.tsx`: CTA **"Jelajahi Series" dihapus**; hero kini
  hanya "Mulai Mendengarkan" → `/explore`. (Teks hero sudah sesuai: "Platform Audio Kajian
  Islam", "Dengarkan kajian. / Belajar dengan lebih terarah.", deskripsi, dan CTA.)
- `lib/config/site.ts`: tidak diubah; item "Pemateri" di `publicNav` difilter di header dan
  diganti dropdown.

### Verifikasi
- Lint 0, typecheck 0, build success (78 static pages); prod :3100 restart, log bersih.
- SSR homepage: hamburger + trigger "Pemateri" + data speaker ter-serialize; "Jelajahi
  Series" tidak ada lagi.
- Catatan: tombol auth (Masuk/Daftar/Keluar) dirender setelah hydration (sama seperti
  sebelumnya via `isPending`), jadi tidak tampak di HTML curl murni.

---

## Follow-up 5 — Hapus hero homepage

### Perubahan
- Hero teks (badge "Platform Audio Kajian Islam", headline "Dengarkan kajian. / Belajar dengan
  lebih terarah.", deskripsi, dan CTA "Mulai Mendengarkan") **dihapus** sesuai permintaan.
- `features/home/components/hero-section.tsx` dihapus (dir `features/home/` ikut dibersihkan);
  pemakaian di `app/(public)/page.tsx` dilepas. Homepage kini mulai langsung dari "Lanjutkan
  Belajar" → Kajian Terbaru → Pilihan Kitab → Pemateri → Kategori → Series Terbaru →
  Temukan Kajian.
- Bila ingin teks pengganti atau hero baru, silakan berikan kopinya.

---

## Follow-up 5b — Hero homepage dikembalikan

- Hero teks **dikembalikan** sesuai permintaan ("kembalikan lagi"), persis versi Follow-up 4:
  badge "Platform Audio Kajian Islam", headline "Dengarkan kajian. / Belajar dengan lebih
  terarah.", deskripsi, dan CTA tunggal "Mulai Mendengarkan" → `/explore` (tanpa
  "Jelajahi Series").
- `features/home/components/hero-section.tsx` dibuat ulang dan dipasang kembali sebagai
  bagian pertama `app/(public)/page.tsx` (sebelum "Lanjutkan Belajar").
- Verifikasi: lint 0, typecheck 0, build success, prod :3100 restart; curl SSR homepage
  memuat teks hero, tidak ada "Jelajahi Series"; log bersih.

---

## Follow-up 6 — Tombol play/pause "bergerak sendiri" di halaman audio

### Gejala
- Di `/audio/syarah-shahih-bukhari-1` (200), tombol play/pause tampak bergeser sendiri
  saat diklik.

### Root cause (dari kode)
- Dua UI tombol terpisah di `features/player/components/player-full.tsx`:
  1. Tombol play besar di sisi hero ("Putar audio") — hanya dirender saat `!hasLoaded`.
  2. Deck player (`PlayerControls`) yang baru muncul saat `hasLoaded` — letaknya lebih
     rendah di halaman dan tombolnya nyaris identik.
- Di mount, effect `loadAudio` langsung jalan (status idle → loading), sehingga `hasLoaded`
  berubah true setelah render pertama → tombol hero **hilang/unmount** dan deck muncul di
  posisi lain → secara visual tombol "pindah sendiri".
- Selain itu `actions.play()` di deck tidak pernah menginisialisasi player YouTube
  (inisialisasi hanya di `handleInit` tombol hero), jadi tombol lama mengandalkan dua klik.

### Perubahan
- `features/player/components/player-full.tsx`:
  - Tombol play hero-side dihapus; **deck player selalu dirender** (tidak lagi kondisional
    pada `hasLoaded`) sehingga posisi tombol play/pause tetap — tidak ada lompatan layout.
  - `handlePlayPause`: klik play pertama menginisialisasi player via `handleInit` (dengan
    try/catch), lalu baru `actions.play()`; klik berikutnya toggle pause/play normal.
    `onPlay` di `PlayerControls` memakai `handlePlayPause` (bukan `actions.play` langsung).
  - Import `Play` (lucide) yang tidak terpakai dihapus.
- Tidak ada perubahan arsitektur/store/player provider; hanya UI wiring.

### Verifikasi
- Lint 0, typecheck 0, build success; prod :3100 restart, log bersih, halaman 200.
- Catatan: tanpa browser automation, perilaku klik tidak bisa dicek otomatis; logika
  sekarang menjamin satu tombol di satu posisi dan klik pertama memainkan audio.

---

## Follow-up 7 — Tombol play/pause berkedip (berubah-ubah terus) saat diputar

### Gejala
- Setelah Follow-up 6, tombol play/pause masih "selalu berubah ubah" (kedip antara ikon
  Play dan Pause) selama audio diputar.

### Root cause (dari kode)
- `features/player/hooks/use-youtube-player.ts` sync effect (sebelumnya baris 345-370)
  memiliki dependency `store.position`, yang diperbarui oleh poll interval tiap 250ms saat
  status "playing". Setiap tick effect jalan ulang dan memanggil `player.seekTo(position, true)`
  → YouTube masuk state BUFFERING → `onStateChange` set status "buffering" → `isPlaying`
  jadi false → ikon berubah jadi Play → video lanjut (PLAYING) → status "playing" → ikon
  jadi Pause lagi. Loop ini berulang tiap tick → tombol terus berkedip.

### Perubahan
- `use-youtube-player.ts`: sync effect sekarang **tidak lagi men-depend pada
  `store.position`** dan tidak lagi memanggil `seekTo` saat status playing; hanya
  `playVideo`/`pauseVideo`/`seekTo(0)` sesuai status. Dipecah jadi **effect terpisah untuk
  seek** yang hanya mengeksekusi `seekTo` bila posisi melompat (diff > 2 detik) —
  mis. drag progress atau restore history — bukan dari poll.
- `features/player/components/player-full.tsx`: `isPlaying` kini menyertakan status
  `"buffering"` sehingga ikon tidak berubah ke Play selama buffering normal.
- Tidak ada perubahan arsitektur/store/provider; hanya wiring effect + UI.

### Verifikasi
- Lint 0, typecheck 0, build success; prod :3100 restart, log bersih, halaman 200.
- Catatan: tanpa browser automation, kedip tidak bisa dicek otomatis; logika sekarang
  menghilangkan pemicu seek-per-tick yang menyebabkan flapping status.

---

## Follow-up 8 — Auto-fill metadata YouTube di form admin audio

### Fitur
- Saat admin menempel URL YouTube yang valid di form audio, **judul, durasi, dan cover**
  terisi otomatis (tanpa API key). Dalil/Referensi/Transcript tidak bisa otomatis (konten
  kurasi; tidak ada sumber dari link YouTube).
- Judul dari oEmbed + scrape `ytInitialPlayerResponse`; durasi dari `lengthSeconds`.
- Hanya mengisi field yang masih kosong; hanya sekali per URL (edit-mode tidak menimpa data).

### Perubahan
- `features/admin/audio/actions.ts`: server action `fetchYouTubeMetadata(url)` → `ActionState<YouTubeMetadata>`.
- `features/admin/audio/components/audio-form.tsx`: effect debounced 800ms memanggil action
  saat `videoId` valid; indicator loading + status sukses/gagal di field Media Source.

### Verifikasi
- Fetch logic diuji langsung: video `dRJghWMqlJI` → title "Syarah Shahih Bukhari #1 - Mukadimah
  - Ustadz Dr. Firanda Andirja, MA", durasi 6071 detik, thumbnail tersedia.
- Lint 0, typecheck 0, build success; action ter-compile di server + client bundle.
- Halaman `/admin/audio/new` 200 (SSR). Interaksi auto-fill memerlukan browser (client-side).

---

## Follow-up 9 — Sembunyikan panel Debug & teks "Sesi X dari Y"

- Panel Debug (`Video/Ready/Status/Error`) di `player-full.tsx` disembunyikan via konstanta
  `SHOW_DEBUG_PANEL = false` (kode tetap ada; set `true` untuk memunculkan lagi).
- Teks "Sesi X dari Y" disembunyikan di subtitle kartu player (`player-full.tsx`) dan header
  halaman audio (`app/(learning)/audio/[slug]/page.tsx`). Kemunculan di SEO metadata dibiarkan.
- Lint/typecheck/build bersih; prod :3100 restart; halaman 200.

## Follow-up 10 — Urutan daftar audio admin & status sesi palsu di player

### Urutan admin audio (sesi naik)
- `listAudioAdmin` (`repositories/audio-repository.ts`) semula `orderBy: { updatedAt: "desc" }`
  sehingga nomor sesi tampak acak. Diubah ke `orderBy: [{ nomorSesi: "asc" }, { updatedAt: "desc" }]`
  (sesi 1,2,3,4,...; tie-breaker update terbaru).

### Retry fetch metadata YouTube
- Pesan "Tidak dapat mengambil metadata video" muncul karena DNS `www.youtube.com` sesekali
  gagal (intermittent; `node dns.lookup` sempat ENOTFOUND padahal `dig` OK). Saat itu oEmbed dan
  scrape watch page gagal bersamaan → `!title && !durationSeconds`.
- Tambah `withRetry` (3 percobaan, jeda 500ms) di `features/admin/audio/actions.ts` untuk oEmbed
  dan scrape. Action teruji di dev & prod: judul + durasi (mis. 6216s) benar.

### Status "completed" sesi palsu di player audio
- **Gejala**: lompat langsung ke sesi 5 → sesi 1-4 tampil "tercentang/selesai" padahal belum
  diputar, dan klik sesi tidak berfungsi (`onSessionClick={() => {}}`).
- **Root cause**: `player-full.tsx` mengarang `isCompleted: i + 1 < audio.nomorSesi` dan
  `completedSessions = audio.nomorSesi - 1` — asumsi berdasarkan urutan angka, bukan data listening.
- **Perubahan**:
  - `app/(learning)/audio/[slug]/page.tsx`: bangun `sessions` dari `playerContext.queue` (slug,
    judul, durasi nyata) + status `isCompleted` dari `getListeningByAudioIds` (progress nyata,
    hanya jika login), kirim ke `<PlayerFull sessions completedSessions>`.
  - `player-full.tsx`: terima props `sessions`/`completedSessions`, hapus sesi palsu; `ProgressSeries`
    pakai jumlah selesai nyata.
  - `player-session-list.tsx`: setiap sesi jadi `<Link href="/audio/{slug}">` — tetap bisa diputar
    meski status selesai (tanpa `disabled`/`Lock`); ikon centang hijau hanya untuk yang benar-benar
    selesai; hover menampilkan "Putar".
- **Verifikasi**: dev & prod sesi 5 → "0 dari 5 sesi selesai", 0 badge "Selesai", link kelima sesi
  benar; lint/typecheck/build bersih; prod :3100 restart.
