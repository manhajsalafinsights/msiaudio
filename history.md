# MSI Audio — Listening History

**Product Requirement — Riwayat Mendengarkan**

| | |
|---|---|
| Produk | MSI Audio |
| Scope | Sistem riwayat, data yang disimpan, UX, manajemen, wireframe, privasi, future |
| Referensi | `schema.prisma` (model `ListeningHistory`) · `player.md` · `sync.md` |
| Status | Draft v1.0 — rancangan, bukan kode |

---

## 1. Konsep History

**History = jejak pemutaran per user — dasar untuk "recently played", statistik, dan audit belajar.**

| Ciri | Nilai |
|---|---|
| Pemilik | **Per-user** (pribadi) |
| Granularitas | Satu baris per (user, audio) |
| Isi | Sesi-sesi yang pernah diputar + status + waktu |

**Setiap baris history menyimpan:**

| Field | Contoh | Sumber (schema) |
|---|---|---|
| Audio | "Sesi 3 — Pengertian Tauhid" | `ListeningHistory.audioId` |
| Series | "Kitab Tauhid" | via `audio.series` |
| Waktu mulai | 2 Jan, 19:30 | `ListeningHistory.startedAt` *(evolusi)* |
| Waktu selesai | 2 Jan, 19:55 | `ListeningHistory.completedAt` *(evolusi)* |
| Posisi terakhir | 1503 (25:03) | `ListeningHistory.positionSeconds` |
| Durasi mendengar | 18 menit | `ListeningHistory.listeningDurationSeconds` *(evolusi)* |
| Status | selesai / berjalan | `ListeningHistory.completed` |
| Terakhir diputar | 2 Jan 19:55 | `ListeningHistory.lastPlayedAt` |

> **Catatan schema (evolusi yang direkomendasikan):** model saat ini sudah punya `positionSeconds, progressPercent, completed, playCount, lastPlayedAt, createdAt` dan unique `(userId, audioId)` + index `(userId, lastPlayedAt)`. Untuk "waktu mulai / selesai / durasi mendengar" tambahkan:
> 1. `startedAt DateTime?` — saat pemutaran sesi terakhir dimulai.
> 2. `completedAt DateTime?` — saat pertama kali `completed=true`.
> 3. `listeningDurationSeconds Int @default(0)` — akumulasi waktu aktif mendengar (paused tidak dihitung), diukur client (`use-session-tracker`, lihat `player-future.md` §6).

---

## 2. UX History

### 2.1 Sumber "Recently Played"
- History adalah data mentah **Recently Played** (Home / Dashboard) dan **Continue Learning** (filter `completed=false`).
- Peringkat: urut `lastPlayedAt DESC`.

### 2.2 Halaman History (`/history`)

| Kapabilitas | UX |
|---|---|
| Lihat semua | List dikelompokkan tanggal: **Hari Ini / Kemarin / minggu ini / bulan** |
| Resume | Item belum selesai → tap → lanjut dari posisi terakhir |
| Putar ulang | Item selesai → tap → putar dari awal (bukan resume) |
| Search | Cari judul audio / nama series |
| Filter | By series · by status (berjalan / selesai) |
| Hapus | Hapus satu baris · **Bersihkan Riwayat** (semua, dengan konfirmasi ganda) |
| Statistik mini | Per hari: jumlah audio & total durasi mendengar |

**UX note:** history tidak perlu tombol "tandai selesai" manual — status mengikuti aturan progress (`progress.md` §2).

---

## 3. Wireframe — Halaman History

### Desktop (≥1024px)

```
┌──────────────────────────────────────────────────────────────┐
│ History                                        [Bersihkan ⏳] │
│ [🔍 cari audio/series...]  [Status ▾]  [Series ▾]            │
│ ──────────────────────────────────────────────────────────── │
│ HARI INI · 3 audio · 45 menit                               │
│ ▶ 12:40  Sesi 1 Ushulus Sunnah        Ustadz B · berjalan ▶ │
│ ✔ 19:30  Sesi 3 Kitab Tauhid          Ustadz A · selesai  🗑 │
│ KEMARIN                                                      │
│ ✔ 10:05  Sesi 2 Kitab Tauhid          Ustadz A · selesai  🗑 │
│ ──────────────────────────────────────────────────────────── │
│ « 1 2 … »  ·  15 Jan (future: filter rentang tanggal)        │
└──────────────────────────────────────────────────────────────┘
```

### Mobile (<768px)

```
┌────────────────────────────────────────────┐
│ [←] History                      [🗑 all]  │
│ [🔍 cari...]                              │
│ HARI INI                                   │
│ ▶ 12:40 Sesi 1 Ushulus           [▶] [🗑]  │
│ ✔ 19:30 Sesi 3 Kitab Tauhid      [▶] [🗑]  │
│ ────────────────────────────────────────── │
│ (kartu per item + status badge)            │
└────────────────────────────────────────────┘
```

---

## 4. Privasi

- History pribadi: **hanya pemilik** yang bisa lihat. Tidak pernah di-publish.
- Admin **hanya dapat melihat dalam konteks dukungan** (halaman user read-only di `admin-pages.md` §7), tidak ada API publik history.
- "Bersihkan Riwayat" menghapus permanen baris user (bukan soft-delete) — didokumentasikan sebagai keputusan.

---

## 5. Future Ready

| Fitur | Persiapan |
|---|---|
| **AI Rekomendasi** | History + Progress = sinyal untuk "pengguna lain juga belajar" (`player-future.md` §7) |
| **Statistik belajar** | Agregasi `listeningDurationSeconds` per hari/bulan → dashboard & session summary |
| **Ekspor riwayat** | (future) export CSV/PDF — gabung pola ekspor Notes/Bookmark |
| **Retensi** | Kebijakan retensi (mis. simpan N bulan terakhir) ditentukan saat implementasi; desain memakai tanggal |

---

## 6. Ringkasan Non-Negotiable

1. **Satu baris per (user, audio)** — riwayat = status terakhir + akumulasi.
2. **Kelompokkan per tanggal** — mudah dipindai.
3. **Resume vs putar ulang** dibedakan dari status `completed`.
4. **Pribadi** — tidak pernah dibagikan/publik.
5. **Durasi mendengar** diukur waktu aktif (bukan kalender), dari client, di-flush saat selesai/keluar.

---

*Dokumen ini menyertai `bookmark.md`, `notes.md`, `progress.md`, `sync.md`, dan `learning-experience.md`. Belum ada kode yang diimplementasikan.*
