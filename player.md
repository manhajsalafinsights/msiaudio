# MSI Audio — Player UX & Desain

**Product Requirement — Audio Player**

| | |
|---|---|
| Produk | MSI Audio (ekosistem Manhaj Salaf Insights) |
| Scope | UX player, kontrol, playback speed, volume, sleep timer, layout, panel, progress, error handling, offline (future), accessibility |
| Referensi | `schema.prisma` · `architecture.md` (§9.2 `features/player/`) · `player-state.md` · `player-wireframe.md` · `continue-learning.md` |
| Status | Draft v1.0 — rancangan, bukan kode |

---

## 1. Visi Player

**MSI Audio bukan pemutar musik — ia adalah "ruang belajar audio".**

Inspirasi: Apple Podcasts, Apple Music, Audible, iPod, Spotify — **tapi lebih sederhana**.

| Bukan | Yang dibangun |
|---|---|
| Feed pemutar random | Player berorientasi **program belajar** (Series → Sesi) |
| Artwork & visual berat | Desain tenang, teks Arab terbaca, minim distraksi |
| Navigasi rumit | Kontrol besar & jelas, 1 aksi = 1 ketukan |
| Terputus dari materi | Panel Chapter/Highlight/Reference yang sinkron posisi |

**Prinsip UX player:**
1. **Fokus** — saat belajar, tidak ada iklan/notifikasi/elemen mengganggu di dalam player.
2. **Kontinu** — posisi tersimpan, lanjut dari mana kita berhenti (lihat `continue-learning.md`).
3. **Konsisten** — mini player & full player memakai kontrol identik, kapan pun & di halaman mana pun.
4. **Tanpa teka-teki** — tiap ikon berlabel, tiap aksi ada umpan balik.

---

## 2. Informasi yang Ditampilkan

Player wajib menampilkan (semua ukuran):

| Item | Sumber (schema) |
|---|---|
| Cover | `Audio.cover` |
| Judul Audio | `Audio.judul` |
| Nama Series | `Audio.series.judul` |
| Nama Speaker | `series.speakers[].speaker.nama` (via pivot `SeriesSpeaker`) |
| Nomor Sesi | `Audio.nomorSesi` (format: "Sesi 3 dari 24") |
| Progress Bar | posisi / `Audio.durasi` |
| Current Time | posisi saat ini (mm:ss) |
| Total Duration | `Audio.durasi` (mm:ss) |

> **Aturan:** judul audio > judul series > nama speaker — hierarki 3 baris selalu utuh. Nomor sesi ditampilkan agar konteks belajar jelas ("Sesi 3" bukan sekadar "lagu #3").

---

## 3. Kontrol

### 3.1 Daftar kontrol (Full Player & Mini Player)

| Kontrol | Ikon | Perilaku |
|---|---|---|
| Play / Pause | ▶ / ⏸ | Toggle; tombol besar, selalu di tengah |
| Previous | ⏮ | Pindah ke sesi sebelumnya (jika ada) |
| Next | ⏭ | Pindah ke sesi berikutnya (jika ada) |
| Rewind 10s | ↺ 10 | Mundur 10 detik |
| Forward 30s | ↻ 30 | Maju 30 detik |
| Playback Speed | 1.0× | Menu pilih kecepatan |
| Volume | 🔊 | Slider volume + mute |
| Sleep Timer | 😴 | Menu pengatur waktu tidur |
| Expand/Collapse | ⤢ / ⤡ | Mini ↔ Full player |
| Selesai & tutup | ✕ | Menutup player (menghentikan) |

### 3.2 Perilaku Previous/Next

- **Previous:** hanya pindah ke sesi sebelumnya bila posisi < **5 detik** (di YouTube/audio, tombol mundur biasanya pindah ke awal dulu). Bila posisi > 5 detik → Previous **mengulang dari awal** sesi saat ini.
- **Next:** selalu pindah ke sesi berikutnya dalam queue. Bila sesi terakhir → tidak berpindah; tampilkan dialog selesai (lihat `continue-learning.md` §Autoplay).

### 3.3 Rewind/Forward
- `↺ 10` dan `↻ 30` bekerja pada posisi **tanpa mengubah kecepatan/volume**.
- Di mobile, tombol ini juga berfungsi sebagai *seek* utama (bukan drag bar) agar presisi.

### 3.4 Playback Speed
Pilihan tetap: `0.75× · 1× · 1.25× · 1.5× · 1.75× · 2×`.

| Aspek | Aturan |
|---|---|
| Default | 1× |
| Persistensi | Disimpan per-user (localStorage untuk anonim; sync ke profil saat login) |
| Indikator | Badge "1.25×" pada tombol; tidak mengubah pitch |
| Sinkron | Kecepatan berlaku global (mini + full player) |

### 3.5 Volume & Mute
- Slider volume (0–100%), default 80%, disimpan per-user.
- Tombol mute (🔇) → kembali ke level sebelumnya saat unmute.
- Keyboard: `↑`/`↓` volume, `M` mute.

### 3.6 Sleep Timer
Pilihan durasi: **5 · 10 · 15 · 30 · 45 · 60 · 90** menit + **"Sampai akhir sesi ini"** + **"Matikan"**.

| Aspek | Aturan |
|---|---|
| Cara kerja | Hitung waktu absolut (`now + durasi`), bukan interval browser (kebal terhadap tab-throttling) |
| Saat habis | Player **pause** (bukan stop/tutup) — posisi tetap tersimpan |
| Umpan balik | Badge "😴 15:00" di full player; toast 1 menit sebelum habis (jika tersedia) |
| Prioritas | Fitur ini menempati urutan rendah (MVP bisa tunda), arsitektur disiapkan |

---

## 4. Player Layout

### 4.1 Mini Player (bar global, sticky bawah)

Muncul di **semua halaman** (public, learning, profile) saat ada audio aktif. Komponen `components/layouts/player-bar.tsx`.

```
┌────────────────────────────────────────────────────────────────┐
│ ▀▀  Sesi 3 — Kitab Tauhid            ⏮  ▶  ⏭     1× 🔊 [⤢]  │
│ ████████░░░░░░░░░  25:03 / 45:00   Ustadz A · Sesi 3/24       │
└────────────────────────────────────────────────────────────────┘
```

- Baris 1: cover + judul + kontrol utama + aksi expand.
- Baris 2: progress bar (tipis, klik → seek) + waktu + konteks series.
- Klik area judul → buka Full Player (bukan navigasi halaman).
- **Tetap terlihat** saat scroll; di `(learning)` layout tetap ada (bukan duplikat).

### 4.2 Full Player

Dua jalur menuju full player:
1. Klik mini player → **bottom sheet** (mobile) / panel (desktop) tanpa navigasi halaman.
2. Halaman Audio Detail `/audio/[slug]` (Learning Layout) → full player utama.

Struktur (lihat `player-wireframe.md` §3–§6):

| Zona | Isi |
|---|---|
| Header | Tombol kembali/collapse · judul audio · nomor sesi |
| Media | Cover besar + badge kecepatan + sleep timer |
| Timeline | Progress bar (drag/seek) + current time / duration |
| Kontrol | Rewind 10 · Play/Pause · Forward 30 (+ Prev/Next) |
| Speed/Volume/Timer | Menu sekunder |
| Panel | Tab: Chapter · Highlight · Reference · Notes · Attachment · Related Content |

### 4.3 Responsive

| Perangkat | Mini Player | Full Player |
|---|---|---|
| **Desktop (≥1024)** | Bar penuh, judul + kontrol inline | 2 kolom: media+kontrol kiri, panel kanan (konten panel sinkron posisi) |
| **Tablet (768–1023)** | Bar penuh | Kolom tunggal bertumpuk: media atas, panel bawah |
| **Mobile (<768)** | Bar kompak (cover kecil + kontrol) | Fullscreen sheet: cover, kontrol besar, panel di bawah |

- **Mobile:** kontrol utama (▶ ⏮ ⏭) minimum 44×44px; tombol rewind/forward tetap besar agar mudah saat satu tangan.
- **Desktop:** panel kanan bisa di-scroll independen; kontrol tidak berpindah.

---

## 5. Player Panel

Panel muncul di Full Player (mobile: di bawah kontrol; desktop: kolom kanan). Semua panel **sinkron dengan posisi pemutaran**:

| Tab | Isi | Sumber | Perilaku |
|---|---|---|---|
| Chapter | Daftar chapter + marker aktif | `Chapter` (`startSecond`/`endSecond`) | Klik → seek; item aktif disorot |
| Highlight | Poin penting admin | `Highlight` | Klik → seek; yang aktif (posisi dalam rentang) disorot |
| Reference | Ayat/hadits/atsar/kutipan | `Reference` | Muncul mengikuti posisi; klik → seek |
| Notes | Catatan pribadi user | `Note` | Menambah/membaca catatan pada posisi; timestamp otomatis |
| Attachment | PDF/slide/kitab | `Attachment` | Buka di tab baru / unduh |
| Related Content | Artikel/ebook/video | `RelatedContent` | Link keluar ke produk MSI |

**UX panel:**
- Auto-scroll ke item aktif saat posisi berubah (hanya jika user tidak sedang menggulir manual).
- Di mobile, panel berupa accordion/tab di bawah; satu tab terbuka dalam satu waktu.
- Empty state per tab ("Belum ada chapter").

---

## 6. Progress & Status Selesai

Dijelaskan lengkap di `continue-learning.md` §4. Ringkasan:

| Konsep | Nilai |
|---|---|
| Dianggap selesai (audio) | posisi ≥ `durasi − 30 detik` ATAU ≥ 98% durasi |
| Progress audio | `posisi / durasi × 100` (cap 99% sebelum benar-benar selesai) |
| Progress series | `(audio selesai / totalSesi) × 100` via `completedCount` |
| Persistensi | `UserProgress` (per series) + `ListeningHistory` (per audio) |

---

## 7. Error Handling

| Skenario | Deteksi | UX |
|---|---|---|
| **Audio gagal diputar** (URL rusak) | Error event `onError` dari player | Overlay error di player: "Audio gagal diputar" + tombol [Coba Lagi] + [Lapor] (server action/log) |
| **Provider gagal** (YouTube IFrame error 2/5/100/101/150) | `onError` IFrame API + kode error | Pesan ramah + [Coba Lagi]; opsi buka di YouTube (tab baru) bila terus gagal |
| **Internet putus** | `online`/`offline` event + timeouts | Banner ringan "Koneksi bermasalah — melanjutkan saat online"; posisi tetap berjalan lokal |
| **YouTube tidak tersedia** (region/embed dilarang) | Error 101/150, region | Pesan + tombol buka di YouTube; jangan loop retry otomatis |
| **MediaSource hilang** | `player-service` gagal resolve | State error + kembali ke daftar sesi (bukan layar mati) |
| **Stall/buffering lama** | `waiting` > N detik | Indikator buffering + (future) tombol turunkan kualitas |

Prinsip: **never silent** — setiap kegagalan ada pesan + 1 aksi pulih. Log dengan `lib/logger` (context `player`), tanpa detail teknis ke user (lihat `architecture.md` §15–§16).

---

## 8. Offline (Future — desain disiapkan)

Belum diimplementasikan. Desain:

| Aspek | Rencana |
|---|---|
| Media yang bisa diunduh | Hanya provider **file langsung** (`MediaSource.provider` = `CLOUDFLARE_R2`/`BUNNY_CDN`/`BACKBLAZE`). **YouTube tidak bisa diunduh legal** → tombol unduh disembunyikan untuk provider YOUTUBE |
| Store | Cache API + IndexedDB; daftar "Unduhan" per user (future tabel/download manager) |
| Play offline | `<audio>` dari sumber lokal; `navigator.onLine` untuk tahu mode |
| Sinkron progress | Progress tetap disimpan lokal (queue), di-flush saat kembali online (`sendBeacon`/fetch retry) |
| Manifes | Halaman audio diberi `manifest`/PWA sehingga masuk `Install` |
| Batas kuota | Cek `navigator.storage.estimate()`; konfirmasi sebelum unduh |

> Pemisahan provider di `MediaSource` + abstraksi `player-service` adalah fondasi offline: tambah metode `getLocalSource()` nanti tanpa mengubah UI player.

---

## 9. Background Play & PWA (Future — arsitektur disiapkan)

| Lapisan | Persiapan di rancangan ini |
|---|---|
| **Media Session API** | `navigator.mediaSession.metadata` (judul, artis=ustadz, album=series, artwork=cover); handlers `play/pause/next/previous/seekbackward/seekforward` → kontrol lock screen & headset |
| **PWA** | `public/manifest.webmanifest` (standalone, theme), service worker, `next.config.ts`; sudah tercantum di `architecture.md` §17 |
| **Provider abstraction** | YouTube = IFrame API (web). R2/Bunny/Backblaze = `<audio>` + MediaSource (mendukung background). Tersedia `MediaProvider` enum di schema |
| **iOS constraint (diketahui)** | IFrame YouTube **tidak** terus berputar di background iOS Safari; solusi permanen = konten langsung (`<audio>`) atau native app. Dicatat sebagai keputusan produk |
| **Native app (future)** | Arsitektur `player-state.md` §5 memisahkan state dari transport → REST API + WebSocket (atau download) bisa dipakai ulang |

---

## 10. Accessibility

| Aspek | Ketentuan |
|---|---|
| Keyboard shortcut | Lihat tabel di bawah |
| Focus state | `focus-visible` ring jelas (2px brand) pada semua kontrol; urutan Tab logis (kontrol → timeline → panel) |
| Screen reader | Setiap tombol `aria-label` ("Putar", "Jeda", "Maju 30 detik"); progress bar `role="slider"` + `aria-valuenow` + `aria-valuemin/max`; status diputar diumumkan via `aria-live` |
| Label | Ikon tidak pernah berdiri sendiri — selalu ada label teks/aria |
| Kontras | Tombol vs background ≥ 4.5:1; teks waktu ≥ 4.5:1 |
| Reduced motion | Hormati `prefers-reduced-motion` (animasi panel/overlay dimatikan) |
| Caption | Saat transcript tersedia (future), ada tombol CC toggle |

### Keyboard Shortcut

| Tombol | Aksi |
|---|---|
| `Space` / `K` | Play / Pause |
| `←` / `→` | Mundur / maju 10 detik |
| `J` / `L` | Mundur 10 / maju 30 detik |
| `↑` / `↓` | Naik / turun volume |
| `M` | Mute / unmute |
| `[` / `]` | Kecepatan turun / naik |
| `0–9` | Seek ke persen (0–90%) |
| `Shift+<` / `Shift+>` | Sesi sebelumnya / berikutnya |

- Shortcut aktif hanya saat player fokus/full screen — tidak mengganggu typing di form/search.
- `?` membuka panel shortcut (dokumentasi dalam aplikasi).

---

## 11. Ringkasan Non-Negotiable

1. **Fokus belajar**: tidak ada elemen pengganggu di dalam player.
2. **Kontinu**: posisi selalu tersimpan, lanjut dari mana berhenti.
3. **Kontrol konsisten** antara mini & full player.
4. **Setiap kontrol bisa keyboard + screen reader.**
5. **Setiap error punya pesan + aksi pulih.**
6. **Provider terisolasi** (`player-service` + hook wrapper) — siap YouTube hari ini, R2/Bunny/offline besok.

---

*Dokumen ini menyertai `continue-learning.md`, `player-wireframe.md`, dan `player-state.md`. Belum ada kode, komponen, player, atau API yang diimplementasikan.*
