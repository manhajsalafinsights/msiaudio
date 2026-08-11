# Catatan Sesi — Audiomsi (msi-audio)

> Dokumen handover agar sesi berikutnya bisa lanjut tanpa kehilangan konteks.
> Dibuat: 2026-08-12. Semua commit di bawah sudah ter-push ke `origin` (xroya24-pixel) DAN `backup` (manhajsalafinsights).

---

## 1. Konvensi Identitas Visual (PENTING — jangan dilanggar)

- **Audio individual** → identitasnya **CD**: `components/shared/audio-disc.tsx`, dipakai di `PlayerCover`, kartu audio.
- **Series** → identitasnya **KASET PITA**: `components/shared/audio-tape.tsx` (roda berputar + label cover + ikon musik).
- `SessionRow` → nomor sesi jadi **mini CD berputar saat hover** (track number + Play).
- `SeriesRow` → ikon jadi **roda kaset mini berputar saat hover**.
- `animate-spin-slow` kini **`@utility`** di `app/globals.css` agar varian `group-hover:` berfungsi (bukan plain CSS class).
- Kartu series (kaset) vs kartu audio (CD) TIDAK boleh tertukar.

Commit terkait: `5a35b13`, `235b6b8`, `863f0e0`, `24e17ea`, `28a0f27`, `d3bff7b`, `33b6400`.

## 2. Player & Auto-Next (fitur terbaru yang diuji)

- Player: CD miring berputar + transkrip karaoke dari caption YouTube (`67d0230`).
- Layout horizontal desktop — CD kiri, info & kontrol kanan; mobile tetap vertikal (`d562b55`, `b4bce86`).
- Player selebar penuh container (`f4b776c`), daftar sesi dropdown animasi (`503a333`).
- Tombol next/previous + auto-next saat pemutaran selesai (`a575a77`), fix tombol previous (`0c460bc`).
- **Fix auto-next terakhir (`d1e23d2`)**: di `features/player/hooks/use-youtube-player.ts`,
  ganti `cueVideoById` → **`loadVideoById`** + `store.actions.setStatus("playing")` di effect pemuatan video baru.
  Alasan: `cueVideoById` hanya mengantre; `playVideo()` setelahnya sering gagal diam-diam saat status player "ended".
  `loadVideoById` langsung memuat + memutar. Alur ENDED → `setStatus("ended")` + `next()` dieksekusi sinkron (di-batch).
- File kunci: `features/player/hooks/use-youtube-player.ts`, `features/player/store/player-store.ts` (queue, currentQueueIndex, next()).

## 3. Halaman Home (`app/(public)/page.tsx`)

Urutan section saat ini:
1. HeroSection (search + stats)
2. Kajian Terbaru (AutoRotatingList, 8 item)
3. Lanjutkan Belajar (`features/progress/continue-learning.tsx`)
4. Pilihan Untuk Belajar (`features/home/components/learning-picks.tsx`)
5. Pilihan Kitab (`KitabCard`, dari `listPublishedSeriesTypes`)
6. Series Terbaru (grid 4 SeriesCard)
7. **Tematik** (4 item SeriesCard kaset, moreHref `/kitab/tematik`) — commit `00141fe`
8. **Parenting** (baru, di bawah Tematik) — commit `6090ca7`
9. **Talk Show** (baru, di bawah Tematik) — commit `e1371fd`
10. Kategori (`/kategori/[slug]`)

- Tematik/Parenting/TalkShow memakai pola yang sama: `findPublishedSeriesTypeBySlug(...)` → grid 2/4 kolom `SeriesCard`, max 4 item, EmptyState jika kosong, fallback skeleton via `<Suspense>`.
- `AutoRotatingList` (`features/home/components/auto-rotating-list.tsx`): lebar kartu pakai `calc()` agar tepat N kartu muat; mobile jadi 2 kartu (`6d1f05d`).
- Search home (`features/home/components/home-search.tsx`): tombol Cari selalu di kanan field termasuk mobile; fix padding kiri icon yang tertimpa kelas `.input` (`6617e63`).
- Lanjutkan Belajar: hero "Up Next" (CD besar + progress ring) + baris ringkas mini CD (`b6f0aa5`, `1b71b45`); `AudioDisc` punya prop `hideBadge` untuk ukuran mini.
- LearningPicks badge judul di kanan agar tak tumpang tindih dengan ikon musik CD (`8e86576`).

## 4. Halaman Kitab Detail

- `/kitab/[slug]` kini menampilkan daftar series sebagai **grid kartu kaset pita (`SeriesCard`)**, bukan list `SeriesRow` (commit `54e03ac`).
- Revalidate memakai slug, bukan id (`e4b6a8d`).

## 5. Admin — Import Playlist YouTube

- File: `app/admin/audio/import/page.tsx`, `utils/youtube-playlist.ts`.
- Kapasitas Data API dinaikkan ke **5000 video** + import per-chunk (`ba6e0d2`, `eeabeac`).
- Skip video private/deleted (hapus 151 audio private di produksi) (`eae51cb`).
- `maxDuration = 300` (function) di `app/admin/audio/import/page.tsx` (`eeabeac`).
- UI text sekarang menyebut 5000 video.

## 6. Database Produksi (Supabase)

- Koneksi prod: `postgres.jnolwfwmvasacqbqdkfi` via pooler `aws-0-ap-southeast-1`. Kredensial di `.env.supabase` — **JANGAN di-commit/push**.
- Model `SeriesType` (`prisma/schema.prisma:246`): `id, nama, slug (unique), icon, description, isKitab (default true), viewCount, createdAt`.
- Daftar jenis series saat ini: Kajian Kitab, Dauroh, Podcast, Tematik, Ramadhan, Kajian Syaikh, Kajian Muslimah, Belajar Qur'an, Kitab Bahasa Arab, Tafsir Al Qur'an, Keluarga, Kitab Muslimah, Murotal, Kisah Para Ulama, **Talk Show** (baru), **Parenting** (baru).
- **Talk Show** (`talk-show`): dibuat `isKitab: false` (commit `e1371fd`).
- **Parenting** (`parenting`): dibuat `isKitab: false`; series "PARENTING" dipindahkan dari tipe **Tematik** → **Parenting** (commit `6090ca7`).
- Skrip akses prod yang dipakai: set `DATABASE_URL` + `DIRECT_URL` dari `.env.supabase` lalu jalankan `node -e` dengan PrismaClient.

## 7. Alur Kerja Git & Deploy (WAJIB)

- **Push SELALU ke 2 remote**: `git push origin main && git push backup main`.
- Vercel men-deploy dari repo `backup` (manhajsalafinsights).
- `player.jpg` masih **untracked** — JANGAN di-commit.
- File `.env`, `.env.supabase` — JANGAN di-commit.
- Lint/typecheck/build sebelum commit: `npm run lint && npm run typecheck && npm run build`.

## 8. Daftar Commit (terbaru ke lama)

| Hash | Deskripsi |
|------|-----------|
| `6090ca7` | Home: section Parenting di bawah Tematik (+ tipe Parenting di DB, series PARENTING dipindah dari Tematik) |
| `e1371fd` | Home: section Talk Show di bawah Tematik (+ tipe Talk Show di DB) |
| `d1e23d2` | Player: auto-next pakai `loadVideoById` agar lanjut + play otomatis |
| `eeabeac` | Import playlist 5000 video + maxDuration 300 |
| `54e03ac` | Kitab detail: grid SeriesCard (kaset pita) |
| `6617e63` | Search: tombol Cari kanan + fix padding icon |
| `6d1f05d` | AutoRotatingList: calc-width + mobile 2 kartu |
| `1b71b45` | Continue hero tetap horizontal mobile |
| `b6f0aa5` | Continue Learning hero Up Next + baris ringkas |
| `8e86576` | LearningPicks badge kanan |
| `33b6400` | PlayerCover hapus ikon musik mengambang |
| `28a0f27` | SessionRow mini CD hover |
| `d3bff7b` | SeriesRow roda kaset mini + @utility spin |
| `00141fe` | Tematik home 4 item kaset + Lihat Semua |
| `24e17ea` | AudioTape untuk cover series |
| `863f0e0` | CD ikon musik pojok |
| `235b6b8` | CD cover di label tengah |
| `daf1436` | CD tanpa cover di label tengah |
| `5a35b13` | Cover YouTube → animasi CD (AudioDisc) |
| `eae51cb` | Import skip video private/deleted |
| `ba6e0d2` | Import 2000 video per-chunk |
| `62a4271` | Kartu home berganti otomatis |
| `0c460bc` | Fix tombol previous |
| `a575a77` | Next/previous + auto-next |
| `503a333` | Dropdown daftar sesi |
| `f4b776c` | Player selebar container |
| `b4bce86` | Layout player desktop seimbang |
| `d562b55` | Layout horizontal desktop |
| `e4b6a8d` | Fix revalidate /audio/[slug] |
| `67d0230` | CD miring + transkrip karaoke |

## 9. Next Move (belum dikerjakan)

- Verifikasi di produksi: auto-next `loadVideoById` (sudah di-commit `d1e23d2` — jika masih gagal, cek alur `onStateChange` ENDED → `next()`).
- Isi konten untuk tipe Parenting & Talk Show (masih kosong / sedikit) agar section home tidak EmptyState.
