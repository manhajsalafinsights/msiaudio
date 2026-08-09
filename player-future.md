# MSI Audio — Future Ready Player Features

**Product Requirement — Fitur Player Masa Depan (persiapan desain)**

| | |
|---|---|
| Produk | MSI Audio |
| Scope | 6 fitur player future-ready: Resume Across Device · Mini Player · Recently Played · Keyboard Shortcut · Session Summary · Smart Recommendation |
| Referensi | `player.md` · `player-state.md` · `continue-learning.md` · `player-wireframe.md` · `schema.prisma` |
| Status | Draft v1.0 — rancangan. Sebagian sudah dirancang (Mini Player, Keyboard Shortcut); sisanya persiapan agar tidak butuh perombakan saat diimplementasikan |

---

## 1. Ringkasan Status

| # | Fitur | Status desain saat ini | Dokumen |
|---|---|---|---|
| 1 | Resume Across Device | Perlu persiapan (data sudah siap) | `player-state.md`, `continue-learning.md` |
| 2 | Mini Player | Sudah dirancang penuh | `player.md` §4, `player-wireframe.md` §1, `player-state.md` §7 |
| 3 | Recently Played | Perlu persiapan (data sudah siap) | `continue-learning.md` |
| 4 | Keyboard Shortcut | Sudah dirancang (dasar) | `player.md` §10 |
| 5 | Session Summary | **Baru** — perlu desain | dokumen ini |
| 6 | Smart Recommendation | **Baru** — perlu desain | dokumen ini |

Prinsip bersama: **jangan rombak**, karena `player-state.md` sudah memisahkan state, transport, dan persistence — keenam fitur ini tinggal "menumpang" lapisan yang ada.

---

## 2. Resume Across Device

**Tujuan:** posisi audio tersinkron antar perangkat (HP → laptop → tablet) dan antar tab.

### Yang sudah siap
- Posisi tersimpan **server-side** (`UserProgress.positionSeconds` + `ListeningHistory`) → secara alami tersinkron antar perangkat.
- Satu pemutaran global per akun (store tunggal, `player-state.md` §7).

### Yang perlu dipersiapkan

| Aspek | Desain |
|---|---|
| **Sumber kebenaran** | Server (DB). Klien hanya mengejar: sinkronkan saat `load()` → ambil posisi terbaru dari server |
| **Sinkron real-time** | (future) WebSocket/SSE atau polling ringan 30–60s saat halaman belajar aktif; MVP cukup refetch saat halaman fokus (`visibilitychange`) + TanStack Query invalidation |
| **Konflik posisi** | Aturan: **`lastPlayedAt` terbaru menang** (baik di `ListeningHistory` maupun `UserProgress.updatedAt`). Posisi lain diabaikan, tidak perlu dialog konflik |
| **Satu perangkat bermain** | (future) Server mencatat "pemutaran aktif per user" → perangkat kedua mendapat prompt "Berhenti di perangkat lain?"; MVP: tanpa penegakan, cukup sinkron posisi |
| **Resume antar tab** | `BroadcastChannel("player-sync")` — tab yang baru aktif menarik posisi; hanya satu yang benar-benar memutar (lihat `player-state.md` §8) |
| **Offline → online** | Posisi lokal (queue guest) di-flush lalu posisi server dijadikan acuan berikutnya |

### Alur
```
Device A memutar ke 25:03 → auto-save (lastPlayedAt T1)
Device B membuka audio yang sama → load() → fetch posisi server → restore 25:03
Device B lanjut ke 30:00 (T2 > T1) → device A kembali → sinkron → pindah ke 30:00
```

---

## 3. Mini Player

**Sudah dirancang** di `player.md` §4.1 dan `player-wireframe.md` §1. Bagian "future-ready" yang perlu ditambahkan:

| Aspek | Tambahan desain |
|---|---|
| **Bertahan saat berpindah halaman** | Karena store global di root layout → otomatis bertahan di navigasi SPA/Next.js. **Tidak ada kerja tambahan** |
| **Bertahan saat refresh** | (future) Simpan "audio terakhir + posisi + queue" ke `localStorage`/IndexedDB pada interval; saat refresh → mini player muncul kembali dalam state `paused` (autoplay policy browser melarang auto-play). Restore queue = panggil ulang `player-service.resolve(audioId)` |
| **Collapsible** | Bisa ditutup (✕) untuk pemutaran sekali ini; tidak mengubah "audio aktif" di queue |
| **Zona non-interferensi** | Tidak menutupi bottom-nav mobile; di Audio Detail (Learning) otomatis ringkas |
| **Aksi kontekstual** | (future) Long-press/klik kanan → menu "Detail, Simpan, Bagikan, Sleep timer" |

---

## 4. Recently Played

**Tujuan:** riwayat audio yang baru diputar — cepat dilanjutkan.

### Data (sudah ada, tanpa tabel baru)
`ListeningHistory` (`userId, audioId, positionSeconds, completed, playCount, lastPlayedAt`) urut `lastPlayedAt DESC`, ditambah join audio/series/speaker. Index `@@index([userId, lastPlayedAt])` sudah ada di schema.

### Desain tampilan
| Penempatan | Bentuk |
|---|---|
| Home / Learning Dashboard | Section "Baru Saja Diputar" — 3–5 item (kartu kecil + resume) |
| Continue Learning | Item yang belum selesai muncul di sini; yang sudah selesai pindah ke Recently Played |
| Profil | List lengkap, dikelompokkan tanggal (Hari Ini / Kemarin / minggu ini) — reuse pola History |

### Aturan
- **Dedupe per audio** (satu baris per (user, audio) — sudah dijamin unique constraint schema).
- **Resume vs lihat ulang**: item selesai → tombol "Putar Ulang" (posisi 0); belum selesai → "Lanjutkan".
- **Retensi**: tampilkan 50–100 terakhir; item yang lebih tua tetap ada di History.
- **Guest**: Recently Played berbasis localStorage sampai login (merge ke server setelahnya).

---

## 5. Keyboard Shortcut

**Dasar sudah dirancang** di `player.md` §10 (Space/K, ←/→, J/L, ↑/↓, M, [ ], 0–9, Shift+<, Shift+>). Bagian "future-ready":

| Aspek | Tambahan desain |
|---|---|
| **Scope** | Global saat player aktif, tapi **dinonaktifkan** saat fokus di `input`, `textarea`, `contenteditable`, atau dialog form (tidak mengganggu ketikan) |
| **Shortcut help** | Tekan `?` → overlay daftar shortcut (dokumentasi dalam aplikasi, aksesibel) |
| **Konfigurasi ulang (future)** | Peta shortcut default + opsi ubah (disimpan per-user) — desain memakai satu modul `player/shortcuts.ts` sehingga mudah diganti |
| **Visual feedback** | Saat shortcut dijalankan → aksi yang sama seperti tombol (tidak ada efek samping ganda) |
| **Screen reader** | Shortcut tidak menghilangkan akses normal; semua aksi tetap ada via tombol berlabel |

> Peta default yang diminta: `Space` = play/pause, `←` = rewind (10s), `→` = forward (30s di MSI, selaras `player.md`).

---

## 6. Session Summary

**Tujuan:** setelah audio selesai, tampilkan ringkasan sesi belajar + jalan ke sesi berikutnya.

### Kapan muncul
Menggantikan dialog "Selesai Sesi" di `player-wireframe.md` §7.4 (diperkaya), saat audio mencapai definisi selesai (`continue-learning.md` §4).

### Isi panel
```
┌────────────────────────────────────────────┐
│ ✅ Sesi 3 selesai — Kitab Tauhid           │
│ ────────────────────────────────────────── │
│ 🕒 Durasi mendengar  22 menit              │
│ 📈 Progress sesi      100%                 │
│ 🎯 Progress series    13% (3/24)           │
│ ────────────────────────────────────────── │
│ [▶ Putar Sesi 4 — Keutamaan Tauhid]  (3s) │
│ [🎓 Series berikutnya] [📋 Lihat ringkasan]│
│ [Tutup]                                    │
└────────────────────────────────────────────┘
```

### "Durasi mendengar" — data yang dibutuhkan (baru)
- **Definisi**: total waktu aktif pemutaran (paused tidak dihitung) selama satu sesi mendengar.
- **Cara ukur (client)**: hook `use-session-tracker` mencatat akumulasi `playing` time (interval state `playing`), dihitung dari timestamp play → pause/end; pada `ended`/`pagehide` dikirim bersama auto-save.
- **Simpan**: (future) kolom baru pada `ListeningHistory` (mis. `lastSessionDurationSeconds`) atau tabel `listening_sessions` — **tidak dibuat sekarang**, cukup pola penambahan dijelaskan agar tidak merombak.
- **Fallback**: jika durasi tidak tersedia, tampilkan progress sesi saja (tanpa blok kosong).

### Interaksi
- Hitung mundur 3 detik → otomatis putar sesi berikutnya (bila aktif), sama seperti autoplay di `continue-learning.md` §3.
- "Series berikutnya" → dari rekomendasi (§7).
- "Lihat ringkasan" → (future) halaman/panel statistik sesi per hari.

---

## 7. Smart Recommendation

**Tujuan:** setelah sesi selesai, rekomendasikan: series berikutnya · audio terkait · artikel terkait · ebook terkait.

### Sumber rekomendasi (bertingkat)

| # | Sumber | Data | Status |
|---|---|---|---|
| 1 | **Series berikutnya** (dalam program belajar) | Sesi berikutnya dari queue | siap |
| 2 | **Konten terkait kurasi admin** | `RelatedContent` (`seriesId` → ARTICLE/EBOOK/VIDEO/QA/EXTERNAL) | siap — `schema.prisma` sudah ada |
| 3 | **Audio terkait** | Series lain oleh **ustadz sama** · **kategori/tag sama** · seri type sama | query Prisma (siap) |
| 4 | **"Pengguna lain juga belajar"** (future) | Agregasi anonim `ListeningHistory`/`UserProgress` (top-K series yang dipelajari bersama) | perlu job agregasi |
| 5 | **Rekomendasi personal** (future) | `FavoriteSeries` + bookmark + riwayat user → skor kesukaan | perlu layanan scoring |

### Desain layanan
```
services/recommendation-service.ts
  recommendAfterSession(userId, finishedAudioId)
    → { nextInQueue?, relatedContent[], audioRelated[], nextSeries?, reason }
```
- **Hirarki prioritas**: konten kurasi (RelatedContent) > sesi berikutnya > audio oleh ustadz/kategori sama > agregasi komunitas.
- Setiap item membawa label alasan ("Karena kamu menyelesaikan Kitab Tauhid", "Artikel terkait kajian ini").
- Penyimpanan agregat: (future) tabel/snapshot `recommendation` atau kueri langsung saat MVP (jumlah data kecil).

### Penempatan tampilan
1. **Dialog Session Summary** — 2–3 item teratas (series berikutnya + 1 konten terkait).
2. **Series Detail** — blok "Pelajaran lanjutan / Terkait".
3. **Home / Learning Dashboard** — blok "Mungkin kamu ingin belajar ini".

### Aturan non-negosiasi
- Rekomendasi **tidak pernah menampilkan series yang sudah tuntas** user.
- Tidak ada clickbait; judul, alasan, dan sumber (ustadz/kategori) tampil jujur.
- (Future) A/B & pengukuran — desain memisahkan logic (service) dari tampilan agar mudah diuji.

---

## 8. Kesimpulan Persiapan (apa yang harus dipastikan saat implementasi MVP)

| Fitur | Persiapan MVP | Pekerjaan future |
|---|---|---|
| Resume Across Device | Pastikan posisi di-fetch saat `load()` + `lastPlayedAt` menang | realtime sync, satu-perangkat |
| Mini Player | Store global di root layout | restore saat refresh, menu kontekstual |
| Recently Played | Gunakan `ListeningHistory` + section di Home/Dashboard | retensi, grouping lanjut |
| Keyboard Shortcut | Satu modul `player/shortcuts.ts` + help `?` | konfigurasi per-user |
| Session Summary | Hitung durasi mendengar via hook client; kirim saat ended | tabel `listening_sessions` |
| Smart Recommendation | `recommendation-service` (RelatedContent + sesi berikutnya + query ustadz/kategori) | scoring personal, agregasi komunitas |

> **Kunci arsitektur**: karena `player-state.md` memisahkan state ↔ transport ↔ persistence, keenam fitur ini ditambahkan **tanpa menulis ulang player** — konsisten dengan arahan `architecture.md` (feature vertical slice + `services/`).

---

*Dokumen ini menyertai `player.md`, `continue-learning.md`, `player-wireframe.md`, dan `player-state.md`. Belum ada kode, komponen, player, atau API yang diimplementasikan.*
