# MSI Audio — Player State & Architecture

**Product Requirement — Player State, Arsitektur, Background Play**

| | |
|---|---|
| Produk | MSI Audio |
| Scope | State machine player, daftar state, struktur store, isolasi transport (provider), persistensi, background play & PWA |
| Referensi | `architecture.md` §9.2 (`features/player/`) · `player.md` · `continue-learning.md` · `schema.prisma` |
| Status | Draft v1.0 — rancangan, bukan kode |

---

## 1. Tujuan

1. **Satu sumber kebenaran** — mini player & full player membaca state yang sama (Zustand `player-store`), tidak ada duplikasi.
2. **Transport agnostik** — UI tidak pernah tahu apakah sumbernya YouTube IFrame atau `<audio>`; isolasi di hook (`use-youtube-player`, `use-html-audio`).
3. **Pulih dari apa pun** — setiap state punya jalur keluar (error → retry, buffering → resume, dst.).
4. **Siap future** — background play/PWA/mobile cukup menambah transport tanpa mengubah state machine.

---

## 2. State Machine

```
                              ┌──────────┐
                    user pilih│          │ source resolve
           ┌──────────       ▼          │
           │         ┌───────────────┐  │
           │         │     IDLE      │──┘  (belum ada audio / ditutup)
           │         └───────────────┘
           │  play   │  load(audio)
           │         ▼
           │   ┌────────────┐  error
           │   │  LOADING   ├───────────────► ERROR
           │   └────────────┘
           │         │ ready
           │         ▼
           │   ┌────────────┐   stall
           │   │   READY    │───────────────┐
           │   └────────────┘               ▼
           │  play│    │pause          ┌──────────┐
           │     ▼    ▼                │BUFFERING │
           │  ┌────────────┐  play/ready└──────────┘
           │  │  PLAYING   │◄──────────────────┘
           │  └────────────┘   network lost ┌──────────┐
           │  │      │         ┌───────────►│ OFFLINE  │
           │  │      │  end    │            └──────────┘
           │  │      ▼         │  online │       │ (tidak ada
           │  │  ┌─────────┐   │  ◄──────┘       │  sumber lokal)
           │  │  │  ENDED  │   │                 │ gagal permanen
           │  │  └─────────┘   │                 ▼
           │  │  │ play ulang  │            ┌─────────┐
           │  │  │             │  next/prev │         │
           │  │  ▼             │  ┌───────► │  ERROR  │
           │  └────► load ─────┘  │         │         │
           │          ▲          │          └─────────┘
           │          └──────────┘   retry ──► LOADING
           │                                  close ──► IDLE
           └──── play/pause toggle (semua arah kembali ke loop)
```

> `ended` dan `error` punya cabang jelas di tabel di bawah. `offline` adalah **state tambahan** saat koneksi terputus — masuk dari `playing`/`buffering`, keluar ke `buffering`/`ready` saat online kembali (bila ada sumber lokal) atau `error` (tanpa sumber offline).

### Deskripsi state

| State | Arti | Masuk dari | Keluar ke |
|---|---|---|---|
| `idle` | Belum ada audio aktif; mini player tersembunyi | close, error (close) | `loading` (load audio) |
| `loading` | Memuat metadata + resolve source (`player-service`) | idle, next/prev, retry | `ready` · `error` |
| `ready` | Sumber siap, belum diputar | loading | `playing` · `paused` · `error` |
| `buffering` | Playback terhenti menunggu data (stall) | playing, offline (online) | `playing` (resume) · `offline` · `error` |
| `playing` | Sedang diputar | ready, paused, buffering | `paused` · `buffering` · `ended` · `offline` · `error` |
| `paused` | Dijeda (posisi dipertahankan) | playing, ready | `playing` |
| `ended` | Mencapai akhir; dialog selesai / autoplay | playing | `loading` (next) · `playing` (ulang) · `paused` |
| `offline` | Koneksi terputus saat pemutaran; menunggu koneksi (atau gagal tanpa sumber lokal) | playing, buffering | `buffering`/`ready` (online) · `error` (tanpa sumber offline) |
| `error` | Gagal memutar | loading, playing, buffering, offline | `loading` (retry) · `idle` (close) |

> **Catatan:** `loading` = mempersiapkan sumber; `buffering` = menunggu data saat sudah berjalan. Keduanya berbeda dan tampilannya pun berbeda (skeleton penuh vs spinner kecil).

---

## 3. State Store (Zustand `player-store`)

`features/player/store/player-store.ts` (lihat `architecture.md` §9.2). Field yang wajib:

### 3.1 Media
```ts
interface PlayerState {
  // media
  currentAudio: PlayerQueueItem | null   // audio + series + speaker + mediaSource
  queue: PlayerQueueItem[]               // sesi-sesi dalam series
  queueIndex: number                     // indeks currentAudio dalam queue
  duration: number                       // detik (dari Audio.durasi / metadata)
  position: number                       // detik (posisi lokal, update via timeupdate)
  coverUrl: string | null
}
```

### 3.2 Status & kontrol
```ts
  status: 'idle' | 'loading' | 'ready' | 'buffering' | 'playing' | 'paused' | 'ended' | 'error' | 'offline'
  playbackRate: 0.75 | 1 | 1.25 | 1.5 | 1.75 | 2      // default 1
  volume: number                                         // 0–100, default 80
  muted: boolean
  sleepTimerEndsAt: number | null                        // absolute timestamp
  error: PlayerError | null                              // { code, message, provider }
```

### 3.3 Derivasi (selector)
```ts
  hasPrev: boolean     // queueIndex > 0
  hasNext: boolean     // queueIndex < queue.length - 1
  isComplete: boolean  // position >= duration - 30 || position/duration >= 0.98
  progressPercent: number
```

### 3.4 Aksi (hanya lewat store — tidak ada mutasi luar)
```ts
  load(audio, queue)   // resolve source → set queue → status 'loading'
  play() / pause() / toggle()
  seek(seconds) / rewind(10) / forward(30)
  next() / prev()
  setRate(r) / setVolume(v) / toggleMute()
  setSleepTimer(minutes | 'end') / clearSleepTimer()
  retry() / close()
  reportEnded()        // dipanggil hook saat mendekati akhir → status 'ended'
```

> Persistensi ke server **bukan** bagian store — hook terpisah `use-audio-progress` membaca `position` dan men-schedule save (lihat `continue-learning.md` §2).

---

## 4. Arsitektur Modul (selaras `architecture.md` §9.2)

```
providers/player-provider.tsx          # inisialisasi store (client, sekali di root)
       │
features/player/
├── store/player-store.ts              # Zustand store (state + aksi, §3)
├── context/player-provider.tsx        # mount store ke React tree
├── hooks/
│   ├── use-player.ts                  # selector + helper dari store
│   ├── use-audio-progress.ts          # auto-save: tick 10s, pause, pagehide (sendBeacon)
│   └── use-youtube-player.ts          # TRANSPORT: YouTube IFrame API (web)
│   └── use-html-audio.ts              # TRANSPORT (future): <audio> utk R2/Bunny/offline
├── components/
│   ├── player-bar.tsx                 # mini player
│   ├── player-full.tsx                # full player (desktop/tablet/mobile sheet)
│   ├── player-controls.tsx            # ⏮ ▶ ⏭ ↺ ↻ (memanggil store)
│   ├── player-progress-bar.tsx
│   ├── player-speed-menu.tsx / player-sleep-menu.tsx
│   └── player-timeline.tsx            # panel Chapter/Highlight/Reference sinkron posisi
├── services/player-service.ts         # resolve MediaSource + build queue (server)
└── types/player.ts                    # PlayerQueueItem, PlayerStatus, PlayableSource
```

### Alur pemuatan (load)
```
UI pilih audio → store.load(audioId)
   └─ (server) player-service.resolve(audioId)
        ├─ ambil Audio + Series + Speakers + MediaSource (provider aktif)
        ├─ bangun queue = semua audio published series, urut nomorSesi
        └─ hasil → PlayableSource { url/iframeId, provider, queue }
   store: set currentAudio+queue → status 'loading'
   transport hook: init source → onReady → status 'ready'
```

### Isolasi transport
```
PlayerStatus & aksi (store)   ← UI hanya mengenal ini
        ▲
        │  (hook wrapper)
use-youtube-player ──► YouTube IFrame API (web)
use-html-audio     ──► <audio> + Media Session (future: R2/Bunny, offline, background)
```
- Ganti/ambil provider baru = **tambah hook + mapping di `player-service`**; UI, store, dan state machine tidak berubah.
- `PlayableSource` memakai `MediaProvider` dari schema (`YOUTUBE`, `CLOUDFLARE_R2`, `BUNNY_CDN`, `BACKBLAZE`, `LOCAL_STORAGE`).

---

## 5. Persistence (sinkron posisi → server)

Dipisah dari store agar auto-save efisien & teruji (detail: `continue-learning.md` §2):

```
use-audio-progress
   │  membaca store.position (berubah cepat)
   │
   ├─ tick setiap 10s  ── jika delta >= 5s ──► progress-service.upsert (server action)
   ├─ pause event      ──► flush segera
   ├─ pagehide         ──► navigator.sendBeacon (flush)
   └─ ended            ──► tandai completed + hitung ulang progress series
```

- **Guest (anonim):** tulis ke `localStorage` (per audio), di-merge saat login.
- **Server:** `services/progress-service.ts` → satu `$transaction`: upsert `ListeningHistory` + `UserProgress` (lihat `continue-learning.md` §1).

---

## 6. Background Play & PWA — persiapan

| Lapisan | Persiapan |
|---|---|
| Media Session API | Hook `use-html-audio` mengisi `navigator.mediaSession`: metadata (judul/artis=ustadz/album=series/artwork=cover) + handlers `play/pause/next/previous/seekbackward/seekforward`. Kontrol lock screen & headset otomatis |
| PWA | `public/manifest.webmanifest` (standalone, theme, icons) + service worker (sudah direncanakan di `architecture.md` §17) |
| Continue saat layar kunci | `<audio>` langsung (provider non-YouTube) berjalan saat PWA di-install; YouTube IFrame tidak — **constraint iOS/web diketahui** (lihat `player.md` §9) |
| Native app (future) | State machine di server-agnostic; mobile memakai REST API + queue yang sama (`player-service`), state lokal di platform masing-masing |

**Prinsip:** state machine & store TIDAK bergantung pada transport, sehingga background play tinggal memastikan transportnya (`<audio>` + Media Session) — bukan menulis ulang player.

---

## 7. Instance Tunggal vs Halaman Audio Detail

| Area | Instans |
|---|---|
| Root layout | Satu `PlayerProvider` (Zustand) → mini player di semua halaman |
| `/audio/[slug]` (Learning) | Memakai **instance yang sama** (store global). Halaman hanya me-render `PlayerFull` yang membaca store; audio yang dipilih = `load()` |

**Konsekuensi:** berpindah halaman tidak menghentikan audio; mini player muncul di mana saja; tidak ada dua audio berjalan bersamaan. Ini prinsip "satu pemutaran sejagat" (seperti Apple Podcasts).

### Navigasi saat memutar
```
Berpindah halaman lain → audio tetap jalan (store global)
klik audio lain (dari daftar) → load() mengganti queue → status 'loading' → play
klik "Sesi 3" di Series Detail → load(S3, queue=series) → restore posisi S3 (auto-save)
```

---

## 8. Edge Cases

| Kasus | Penanganan |
|---|---|---|
| Dua tab terbuka memutar bersamaan | (future) BroadcastChannel `player-sync` → tab aktif menang, lainnya pause; dicatat sebagai enhancement, bukan MVP |
| Internet putus saat memutar | `online`/`offline` event → status `offline` + banner ringan; posisi jalan lokal, di-flush saat online (`player.md` §7) |
| Audio dihapus admin saat diputar | `player-service.resolve` gagal → status `error` → "Audio tidak tersedia" + daftar sesi |
| Series di-unpublish saat diputar | Queue dibangun dari data `published`; saat next gagal → `ended` + dialog |
| Sleep timer habis di background | Berbasis timestamp absolut (`sleepTimerEndsAt`) → pause tepat waktu walau tab di-throttle |
| Restore posisi melebihi durasi (audio diedit) | `position = min(position, duration − 1)` di `load()` |
| `pagehide` saat tab hilang | `sendBeacon` (tidak diblokir browser) → posisi tersimpan |
| Audio yang sama di queue diputar ulang | `load()` dengan `forceReload` → posisi reset 0 (opsi "Ulang dari awal") |

---

## 9. Ringkasan Non-Negotiable

1. **Satu store global** — mini & full player share state; berpindah halaman tidak menghentikan audio.
2. **State machine jelas** (`idle→loading→ready→playing/paused/buffering→ended`, + `offline` & `error`).
3. **Transport terisolasi** di hook — UI tak tahu sumbernya.
4. **Auto-save terpisah dari store** (hook + `progress-service` atomik) — efisien & bisa diuji.
5. **Siap background/PWA/mobile** — media session + manifest + abstraksi provider tanpa menulis ulang player.

---

*Dokumen ini menyertai `player.md`, `continue-learning.md`, dan `player-wireframe.md`. Belum ada kode, komponen, player, atau API yang diimplementasikan.*
