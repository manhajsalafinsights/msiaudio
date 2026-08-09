# MSI Audio — Continue Learning & Progress

**Product Requirement — Auto Save, Autoplay, Queue, Progress**

| | |
|---|---|
| Produk | MSI Audio (ekosistem Manhaj Salaf Insights) |
| Scope | Auto-save posisi, strategi efisien DB, autoplay sesi berikutnya, queue dalam series, kapan selesai, perhitungan progress |
| Referensi | `schema.prisma` (`UserProgress`, `ListeningHistory`) · `player.md` · `player-state.md` · `architecture.md` (§9.2) |
| Status | Draft v1.0 — rancangan, bukan kode |

---

## 1. Data yang Disimpan

Setiap sesi pemutaran, sistem wajib menyimpan 3 hal (diminta + dipakai untuk Continue Learning):

| Data | Kolom | Lokasi |
|---|---|---|
| Audio terakhir | `UserProgress.lastAudioId` | per (user, series) |
| Posisi detik terakhir | `UserProgress.positionSeconds` · `ListeningHistory.positionSeconds` | keduanya |
| Waktu terakhir diputar | `UserProgress.updatedAt` · `ListeningHistory.lastPlayedAt` | keduanya |

Dua tabel, satu transaksi (atomik, via `services/progress-service.ts`):

```
ListeningHistory  (per user, per AUDIO) — riwayat + state per audio
  userId · audioId · positionSeconds · progressPercent · completed · playCount · lastPlayedAt

UserProgress      (per user, per SERIES) — "di mana saya dalam program belajar ini?"
  userId · seriesId · lastAudioId · positionSeconds · completedCount · progressPercent · updatedAt
```

> Prinsip: **ListeningHistory = jejak, UserProgress = posisi dalam series.** Keduanya diperbarui bersamaan dalam satu `$transaction` (lihat `architecture.md` §3.6 `progress-service.ts`).

---

## 2. Auto Save — Kapan

Posisi disimpan otomatis pada **4 momen** + strategi cadangan:

| # | Momen | Keterangan |
|---|---|---|
| 1 | **Setiap 10 detik** | Interval tick pemutaran (menyelaraskan dengan API browser) |
| 2 | **Saat pause** | Flush segera (posisi pasti) |
| 3 | **Saat keluar halaman / tab tertutup** | `pagehide` + `visibilitychange` → flush cepat |
| 4 | **Saat audio selesai** | Tandai `completed` + perbarui `completedCount` series |

### Strategi efisien (tidak membebani DB)

1. **Throttle di sisi klien**: meski event `timeupdate` bisa puluhan kali per detik, **simpan maksimal 1× per 10 detik** — hanya jika posisi berubah ≥ 5 detik dari simpan terakhir.
2. **Debounce + queue**: posisi terkini selalu dipegang di memory (`player-store`); pengiriman dijadwalkan via `setTimeout` 10 detik. Bila terjadi pause/keluar → batalkan timer, **flush langsung**.
3. **`pagehide` → `navigator.sendBeacon` (atau `fetch(keepalive: true)`)** — cara paling andal saat tab ditutup; tidak diblokir browser.
4. **Delta-based**: kalau posisi hanya berubah 2 detik dari yang sudah tersimpan → **jangan kirim** (hemat 1 write). Ambang kirim: delta ≥ 5 detik.
5. **Tidak ada polling** — murni push dari klien. Server tidak pernah menanyai posisi.
6. **User anonim (belum login)**: simpan progress sementara di `localStorage` (posisi, audioId, timestamp) per audio; **saat login → merge ke DB**. Dengan begitu fitur "lanjutkan" tetap jalan untuk guest dan tidak bocor data.

### Estimasi beban
- Pemutaran 45 menit → ± (2700s / 10s) = **270 kiriman maks** per sesi, riilnya jauh lebih sedikit karena delta-based + pause flush.
- Satu write = 1 `upsert` ListeningHistory + 1 `update`/`upsert` UserProgress dalam satu transaksi. Beban ini kecil untuk Supabase Postgres; `@@index([userId, lastPlayedAt])` & `@@index([userId, seriesId])` sudah memadai.

---

## 3. Autoplay & Dialog Selesai

Ketika posisi mencapai akhir sesi (lihat §4 definisi selesai):

```
[AUDIO SELESAI]
     │
     ├─ ada sesi berikutnya (queue) ──► [dialog Selesai Sesi]
     │                                   "Sesi 3 selesai ✅"
     │                                   1. ▶ Putar Sesi 4 (autoplay — default 5s)
     │                                   2. [Buka Series] (lanjut meninjau)
     │                                   3. [Tutup]
     │
     └─ sesi terakhir (akhir series) ──► [dialog Series Selesai]
                                          "Selamat! Series tuntas 🎉"
                                          - Progress series: 100%
                                          - [Kembali ke Series] · [Buka Series Berikutnya (rekomendasi)]
```

| Aturan autoplay |
|---|
| Setelah **3 detik tanpa interaksi** pada dialog → otomatis putar sesi berikutnya (opsi default). Interaksi apa pun (klik/scroll) membatalkan hitungan. |
| Autoplay bisa dimatikan di setelan ("Putar otomatis sesi berikutnya": ON/OFF). |
| Autoplay **tidak** menyela: hanya berjalan setelah sesi dinyatakan selesai, bukan di tengah. |
| Saat sesi selesai → tandai `completed=true` pada ListeningHistory + tambah `completedCount` series + hitung ulang `progressPercent` series. |

---

## 4. Progress — Perhitungan

### 4.1 Kapan audio dianggap selesai
Dua aturan (ambil yang tercapai lebih dulu):

```
completed = (positionSeconds >= duration − 30)   ATAU   (positionSeconds / duration >= 0.98)
```

- Ambang tetap 30 detik terakhir = praktis (pengguna yang sampai segitu dianggap selesai).
- `completed=true` hanya ditulis **sekali**; pemutaran ulang menurunkan status lagi menjadi berjalan.

### 4.2 Progress per audio
```
progressPercent = round(positionSeconds / duration × 100)   → cap di 99%
```
- Disimpan di `ListeningHistory.progressPercent`. Cap 99% menjaga konsistensi dengan status `completed` (yang baru 100% saat benar-benar selesai).

### 4.3 Progress per series (persentase program belajar)
```
completedCount   = jumlah Audio dalam series dengan progress >= ambang selesai (atau ListeningHistory.completed)
progressPercent (series) = round(completedCount / totalSesi × 100)
lastAudioId      = audio yang terakhir diputar user
positionSeconds  = posisi lastAudio
```
- Disimpan di `UserProgress` (field `completedCount`, `progressPercent`, `lastAudioId`, `positionSeconds`) — **denormalisasi disengaja** agar list "Continue Learning"/dashboard tidak butuh COUNT mahal per request.
- `Series.totalSesi` dijadikan penyebut (nilai denormalisasi di tabel Series, dijaga konsisten saat audio ditambah/dihapus).

### 4.4 Contoh
Series "Kitab Tauhid" = 24 sesi, durasi sesi 3 = 45:00 (2700s):

| Kondisi | ListeningHistory (audio 3) | UserProgress (series) |
|---|---|---|
| Sesi 3 diputar ke 25:03 | position 1503 · 55% · completed=false | lastAudio=S3 · pos 1503 · completedCount 2 (S1,S2) · 2/24 = 8% |
| Sesi 3 selesai (2670s ≥ 2670) | completed=true · 100% | completedCount 3 · 3/24 = 13% |
| Putar ulang Sesi 3 → 10:00 | completed=false · 22% | lastAudio=S3 · pos 600 · completedCount tetap 3 |

---

## 5. Queue dalam Series

### 5.1 Bentuk queue
```
Queue = daftar Audio dalam Series yang sama, diurutkan (seriesId, nomorSesi ASC)
```
| Sesi | Nomor | Durasi |
|---|---|---|
| Sesi 3 — Pengertian Tauhid | 3 | 45:00 |
| Sesi 4 — Keutamaan Tauhid | 4 | 50:00 |
| Sesi 5 — Syarat-syarat | 5 | 40:00 |

- Sesi sebelumnya = `nomorSesi − 1`, sesi berikutnya = `nomorSesi + 1` (dari kumpulan audio `published` series tersebut).
- Queue dibangun oleh `services/player-service.ts` (lihat `architecture.md` §9.2): input `audioId` → output `{ current, prev, next, series, speakers }`.

### 5.2 Perilaku di mini/full player
- `⏮`/`⏭` bergerak dalam queue ini — **tidak pernah** berpindah ke series lain.
- Saat pindah sesi via Next → **state di-reset** (posisi 0, buffer baru) tapi setting (kecepatan, volume) dipertahankan.
- Navigasi sesi juga tersedia lewat tab "Chapter"? — tidak; daftar sesi ada di halaman Audio Detail & Series Detail (konteks berbeda: queue = sesi yang sedang belajar, daftar = seluruh seri).

### 5.3 Di luar series (audio tunggal)
- Jika audio tidak berada dalam series yang dipublikasikan (praktis selalu dalam series), queue = `[audio]` saja; `prev`/`next` disabled.

---

## 6. Dialog "Lanjutkan dari posisi terakhir?"

Muncul saat user **membuka** audio yang sudah punya progress (konteks browse — dari daftar/explore/search/Series Detail). Kartu **Continue Learning tidak memunculkan dialog** karena tap `[▶▶]` sudah berarti "lanjut".

```
┌────────────────────────────────────────────┐
│ ▀▀ Sesi 3 — Pengertian Tauhid             │
│ "Kamu berhenti di 25:03"                  │
│                                            │
│  [▶ Lanjutkan dari 25:03]        (utama)   │
│  [↺ Mulai dari Awal]                       │
│                                            │
│ (tanpa autoplay — user yang memutuskan)    │
└────────────────────────────────────────────┘
```

| Aturan dialog |
|---|
| Tombol utama = **Lanjutkan** (default Enter); aksi kedua = **Mulai dari Awal**. |
| Tidak autoplay — menghormati kebijakan autoplay browser & pilihan user. |
| Tidak muncul bila progress < 10 detik **atau** < 5% durasi (dianggap belum mulai). |
| Tidak muncul untuk audio yang sudah `completed` (langsung dari awal / "Putar Ulang"). |
| Aksesibel: `role="dialog"`, `aria-label`, fokus awal ke tombol Lanjutkan, bisa dioperasikan keyboard. |

> Pilihan user **tidak** disimpan permanen (kecuali di masa depan sebagai setelan "Selalu mulai dari awal").

---

## 7. Alur End-to-End "Lanjutkan"

```
1. User memutar Sesi 3 sampai 25:03 lalu menutup tab.
      → pagehide → sendBeacon → progress-service.upsert:
        ListeningHistory(S3, 1503, 55%, false) + UserProgress(series, lastAudio=S3, 1503, ...)
2. User kembali (dashboard / home / continue-listening).
      → query urut `UserProgress.updatedAt DESC` → "Kitab Tauhid · Sesi 3 · 55%"
3. a. User tap kartu Continue [▶▶] → langsung restore posisi 1503 → play dari 25:03. ✅
   b. User membuka Sesi 3 dari daftar/explore → dialog "Lanjutkan dari posisi terakhir?"
      → [Lanjutkan] = restore 1503 · [Mulai dari Awal] = posisi 0.
4. User lanjut ke akhir → dialog selesai / autoplay → Sesi 4.
```

> Semua langkah memakai **data yang sama** yang di-*upsert* saat auto-save — tidak ada penyimpanan terpisah untuk "continue listening".

---

## 8. Ringkasan Non-Negotiable

1. **Auto-save 4 momen** (10s, pause, keluar, selesai) + flush andal via `sendBeacon`.
2. **Efisien**: throttle 10s + delta ≥5s + tidak ada polling → beban DB kecil.
3. **Atomik**: `ListeningHistory` + `UserProgress` diperbarui dalam satu transaksi.
4. **Guest friendly**: progress anonim di localStorage, di-merge saat login.
5. **Selesai jelas**: 30 detik terakhir atau 98%; series = completedCount / totalSesi.
6. **Queue = sesi dalam series**, Next/Prev tidak pernah keluar dari program belajar.
7. **Restore selalu dari posisi terakhir** — inti pengalaman "lanjutkan".
8. **Dialog "Lanjutkan?"** hanya pada konteks browse; kartu Continue langsung lanjut.

---

*Dokumen ini menyertai `player.md`, `player-wireframe.md`, dan `player-state.md`. Belum ada kode, komponen, player, atau API yang diimplementasikan.*
