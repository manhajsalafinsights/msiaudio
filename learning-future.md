# MSI Audio — Future Ready Learning Features

**Product Requirement — Collections, Learning Journal, Reading Goal, Learning Statistics**

| | |
|---|---|
| Produk | MSI Audio |
| Scope | 4 fitur belajar masa depan (belum diimplementasikan — desain agar mendukung): **Collections**, **Learning Journal**, **Reading Goal**, **Learning Statistics** |
| Status | Rancangan v1.0 (future-ready) — belum ada kode/schema diimplementasikan |
| Referensi | `bookmark.md` · `notes.md` · `progress.md` · `history.md` · `sync.md` · `learning-experience.md` · `schema.prisma` |

> **Ketergantungan utama:** fitur Goal & Statistics bergantung pada **`listeningDurationSeconds`** — evolusi `ListeningHistory` yang sudah diusulkan di `history.md` §1. Tanpa data durasi mendengar per sesi, statistik "jam mendengar" dan "target harian" tidak dapat dihitung.

---

## 1. Ringkasan

| # | Fitur | Inti | Terkait |
|---|---|---|---|
| 1 | **Collections** | Kelompokkan Bookmark ke koleksi (Tauhid, Shalat, Akhlak, Ramadhan…) | `bookmark.md` |
| 2 | **Learning Journal** | Refleksi pribadi tiap audio selesai | `progress.md` §2 (aturan selesai) |
| 3 | **Reading Goal** | Target belajar harian (contoh: 30 menit/hari) | `history.md` (durasi mendengar) |
| 4 | **Learning Statistics** | Statistik belajar (total jam, audio selesai, series selesai, bookmark, notes, streak) | `progress.md` · `history.md` |

Semua fitur: **privat per-user**, tersinkronisasi lintas perangkat (mengikuti strategi `sync.md`), aksesibel, dan responsif.

---

## 2. Collections (Pengelompokan Bookmark)

### 2.1 Konsep
**Collection = folder pribadi untuk mengelompokkan Bookmark** (mis. *Tauhid*, *Shalat*, *Akhlak*, *Ramadhan*).

- Satu Bookmark **boleh masuk banyak koleksi** (many-to-many) — fleksibel untuk tema tumpang tindih.
- Tanpa koleksi = tetap tampil di tab **"Semua"**.
- Koleksi tidak boleh berisi Notes langsung — Notes tetap di halaman Notes (fitur terpisah, lihat §3).

### 2.2 Data (usulan schema — saat implementasi)

| Tabel | Field penting | Keterangan |
|---|---|---|
| `BookmarkCollection` | `id` · `userId` · `nama` · `createdAt` · `updatedAt` | unique `(userId, nama)` |
| `BookmarkCollectionItem` | `id` · `collectionId` · `bookmarkId` · `createdAt` | unique `(collectionId, bookmarkId)`; cascade hapus saat salah satu dihapus |

*(Menunggu Bookmark mendapat `positionSeconds` + `judul` + `catatan` dari `bookmark.md` §1 agar item koleksi bernilai.)*

### 2.3 UX
- **Saat membuat bookmark** (dari player): opsi pilih/add koleksi tanpa memaksa (dropdown + tombol "+ Koleksi baru").
- **Halaman Bookmark**: tab filter koleksi di atas daftar (`Semua · Tauhid · Shalat · …`).
- **Kelola koleksi** (dari halaman Bookmark): buat, ganti nama, hapus. Hapus koleksi = item tersisa di "Semua" (tidak menghapus bookmark).
- **Pindahkan**: tap ikon folder pada item → centang/ubah koleksi.

### 2.4 Wireframe — Halaman Bookmark + Collections

```
┌──────────────────────────────────────────────────────────────┐
│ Bookmark                                  [+ Koleksi]        │
│ [Semua] [Tauhid] [Shalat] [Akhlak] [Ramadhan] [+]           │
│ [🔍 cari...]  [Urut ▾]                                       │
│ ──────────────────────────────────────────────────────────── │
│ 🔖 25:03  Sesi 3 Kitab Tauhid — "Dalil ikhlas"   [📁][▶][✏][🗑]│
│            koleksi: Tauhid, Ramadhan                          │
│ 🔖 12:40  Sesi 1 Ushulus — "Mengapa taklid haram"[📁][▶][✏][🗑]│
│ ──────────────────────────────────────────────────────────── │
│ (tap 📁 → bottom sheet pilih/add koleksi)                    │
└──────────────────────────────────────────────────────────────┘
```

---

## 3. Learning Journal (Refleksi Belajar)

### 3.1 Konsep
**Journal = refleksi pribadi yang ditulis saat / setelah satu audio selesai** — bukan catatan posisi (itu `Note`), melainkan kesimpulan belajar.

| | Note | Journal |
|---|---|---|
| Waktu | Kapan saja saat memutar | **Saat audio selesai** (atau dari History) |
| Sifat | Per posisi, banyak per audio | **Satu entri per (user, audio)**, bisa diperbarui |
| Isi | Judul + catatan (poin) | Refleksi bebas ("Pelajaranku hari ini…") |

### 3.2 Pemicu (Trigger)
- **Otomatis (non-intrusif):** saat audio mencapai ambang selesai (`progress.md` §2.1) → muncul prompt kecil **"Selesai! Mau tulis refleksi?"** dengan pilihan `[✍️ Tulis]` / `[Lewati]` (tanpa modal paksa; bisa dimatikan).
- **Manual:** dari halaman History (item selesai) dan Series Detail — tombol `[📔 Refleksi]`.

### 3.3 Data (usulan schema)

| Tabel | Field penting | Keterangan |
|---|---|---|
| `LearningJournal` | `id` · `userId` · `audioId` · `konten` · `createdAt` · `updatedAt` | unique `(userId, audioId)`; `konten` wajib |

Sinkronisasi: LWW + conflict copy (mengikuti aturan Notes di `sync.md` §3.1).

### 3.4 UX
- Tulis/edit: modal editor (satu entri per audio, update menyimpan `updatedAt`).
- Lihat: halaman **Journal** (`/journal`) dikelompokkan per audio → list refleksi per series.
- Search & filter (by series), export future.

### 3.5 Wireframe — Halaman Journal

```
┌──────────────────────────────────────────────────────────────┐
│ Journal Belajar                              [+ Refleksi]    │
│ [🔍 cari refleksi...]  [Series ▾]                            │
│ ──────────────────────────────────────────────────────────── │
│ 📔 "Ikhlas itu niat & ittiba'…"                               │
│    Sesi 3 Kitab Tauhid · selesai 2 Jan · [✏️][🗑]            │
│ 📔 "Taklid buta membatalkan ibadah"                           │
│    Sesi 1 Ushulus · selesai 1 Jan · [✏️][🗑]                  │
│ ──────────────────────────────────────────────────────────── │
└──────────────────────────────────────────────────────────────┘
```

---

## 4. Reading Goal (Target Belajar Harian)

### 4.1 Konsep
**Goal = target belajar yang ditetapkan user** (contoh: **30 menit per hari**), dihitung dari **total durasi mendengar aktif hari itu**.

> Nama produk: "Reading Goal" dari kebutuhan, namun karena platform audio, target diukur dalam **menit mendengar** — bukan halaman yang dibaca.

### 4.2 Data (usulan schema)

| Tabel | Field penting | Keterangan |
|---|---|---|
| `LearningGoal` | `id` · `userId` · `targetMinutesPerDay` · `aktif` · `createdAt` · `updatedAt` | satu baris aktif per user (contoh: 30) |

Pencapaian **tidak disimpan** — dihitung: `SUM(listeningDurationSeconds)` untuk `userId` + tanggal hari ini.

### 4.3 UX
- **Pengaturan** (halaman Profil): input target menit/hari (preset `15 / 30 / 45 / 60` + custom), toggle aktif.
- **Progress hari ini** (ring di dashboard `/belajar` + mini di header player): `detik tercapai / target`, mis. `18 / 30 mnt` + bar.
- **Saat target tercapai** → toast ringan "Target belajar tercapai hari ini 🎯" (sekali per hari).
- Nol target / nonaktif → tidak ada ring, tidak ada notifikasi.

### 4.4 Wireframe — Ring Goal (di Learning Dashboard)

```
┌────────────────────────────────────────────┐
│ 🎯 Target Hari Ini                         │
│        ◔ 60%                               │
│      18 / 30 mnt                           │
│ ██████████░░░░░░░░░░░░  [Atur ▾]          │
│ (sisa: 12 mnt · streak: 🔥 4 hari)        │
└────────────────────────────────────────────┘
```

---

## 5. Learning Statistics

### 5.1 Konsep
**Statistik = ringkasan belajar user**, semua **dihitung saat diminta** (bukan kolom, kecuali cache) dari data yang sudah ada.

| Statistik | Sumber | Ketergantungan |
|---|---|---|
| **Total Jam Mendengar** | `SUM(ListeningHistory.listeningDurationSeconds)` | butuh evolusi history.md |
| **Total Audio Selesai** | `COUNT(ListeningHistory WHERE completed=true)` | ada |
| **Total Series Selesai** | `COUNT(UserProgress WHERE completedCount == totalSesi)` | ada |
| **Total Bookmark** | `COUNT(Bookmark)` | ada |
| **Total Notes** | `COUNT(Note)` | ada |
| **Streak Belajar (opsional)** | agregasi harian durasi (hari beruntun ≥ 5 menit) | butuh evolusi history.md |

### 5.2 Streak (definisi yang direkomendasikan)
- **Hari aktif** = hari dengan `SUM(listeningDurationSeconds) ≥ 5 menit` (bukan harus mencapai target — tidak menghukum hari sibuk).
- **Streak** = jumlah hari beruntun termasuk hari ini/terakhir.
- Dihitung dari agregasi per tanggal; **opsional** (bisa dihilangkan jika dirasa "gamifikasi").

### 5.3 UX
- Halaman **Profil** (`/profile`) → seksi "Statistik Belajar".
- Kartu statistik ringkas (6 kartu) + header dashboard memakai 3 angka utama.

### 5.4 Wireframe — Kartu Statistik (Profil)

```
┌──────────────────────────────────────────────────────────────┐
│ Statistik Belajar                                            │
│ ┌─────────┐ ┌─────────┐ ┌─────────┐                         │
│ │ 12,5 jm │ │  24     │ │  3      │   Total Jam Mendengar    │
│ │  Jam    │ │ Audio   │ │ Series  │   Total Audio Selesai    │
│ │  Mendengar│ │ Selesai │ │ Selesai│   Total Series Selesai  │
│ └─────────┘ └─────────┘ └─────────┘                         │
│ ┌─────────┐ ┌─────────┐ ┌─────────┐                         │
│ │  18     │ │  27     │ │ 🔥 4    │   Total Bookmark         │
│ │ Bookmark│ │ Notes   │ │ hari    │   Total Notes            │
│ │         │ │         │ │ Streak  │   Streak Belajar (ops)   │
│ └─────────┘ └─────────┘ └─────────┘                         │
└──────────────────────────────────────────────────────────────┘
```

---

## 6. Responsive & Accessibility

| Fitur | Mobile (<768) | Desktop (≥1024) | Accessibility |
|---|---|---|---|
| Collections | Tab koleksi horizontal scroll; bottom sheet pilih folder | Tab + dropdown | Tab koleksi `role="tablist"`; item punya `aria-label`; aksi folder keyboard-accessible |
| Journal | Editor bottom sheet/layar penuh; kartu satu kolom | Panel editor samping; list 2 kolom | `label` terhubung ke textarea; tombol aksi `aria-label`; fokus masuk editor saat dibuka |
| Reading Goal | Ring besar 1 kolom; preset target tombol besar | Ring + pengaturan inline | Ring punya `aria-valuenow/min/max`; perubahan target diumumkan `role="status"` |
| Statistics | Grid 1–2 kolom (kartu besar) | Grid 3 kolom | Kartu pakai heading hierarkis; angka bukan satu-satunya penanda (tambahkan teks label) |

Semua: keyboard penuh (Tab, Enter, Esc), `focus-visible` ring, toast `role="status"`, kontras WCAG AA, `prefers-reduced-motion`.

---

## 7. Privasi

- **Seluruh data privat per-user** — koleksi, refleksi, target, dan statistik tidak pernah dilihat user lain.
- Statistik hanya menampilkan milik user; tidak ada leaderboard/publik.
- Hapus akun → semua tabel kaskade terhapus.

---

## 8. Future Ready (lebih lanjut)

| Fitur | Persiapan |
|---|---|
| **AI Auto-Organize Collections** | Analisis `Bookmark.judul`/`catatan` + transcript → usulan koleksi otomatis (future `lib/ai`) |
| **AI Journal Summary** | Rangkum Journal per series → "Ringkasan Kajian" (gabung AI Summary Notes, `notes.md` §6) |
| **Adaptive Goal** | Goal menyesuaikan kebiasaan user (mis. usul naik/turun target) |
| **Statistik Export / Insight** | Export PDF/CSV; insight "hari terbaikmu" dari `listeningDurationSeconds` |
| **Offline** | Koleksi/Journal/Goal ikut sinkron outbox (`sync.md` §4); target tetap dihitung dari data lokal |

---

## 9. Ringkasan Non-Negotiable

1. **Collections = many-to-many** (bookmark bisa masuk beberapa koleksi; hapus koleksi tidak menghapus bookmark).
2. **Journal = satu entri per (user, audio)**, pemicu saat audio selesai & non-intrusif (bisa dilewati/dimatikan).
3. **Goal = menit mendengar aktif per hari**, dihitung (bukan disimpan); tanpa notifikasi berulang.
4. **Statistik dihitung saat diminta** dari data existing + `listeningDurationSeconds` (evolusi `history.md`).
5. **Streak opsional** dengan definisi jelas (hari aktif ≥ 5 menit) — boleh dihilangkan.
6. **Privat & tersinkronisasi** — mengikuti `sync.md` (LWW, conflict copy, outbox offline).

---

*Dokumen ini memperluas `bookmark.md`, `notes.md`, `progress.md`, `history.md`, `sync.md`, dan `learning-experience.md`. Seluruh fitur masih rancangan — belum ada kode atau schema yang diimplementasikan.*
