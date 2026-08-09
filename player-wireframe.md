# MSI Audio — Player Wireframe

**Product Requirement — Wireframe Player**

| | |
|---|---|
| Produk | MSI Audio |
| Scope | Wireframe teks: mini player, full player (desktop/tablet/mobile), panel, overlay, dialog |
| Referensi | `player.md` · `continue-learning.md` · `player-state.md` |
| Status | Draft v1.0 — rancangan, bukan kode |

---

## 1. Mini Player (bar global — semua halaman)

### 1.1 Desktop (≥1024px)

```
┌────────────────────────────────────────────────────────────────────────┐
│ ▀▀  Sesi 3 — Kitab Tauhid                    ⏮   ▶   ⏭   1× 🔊  ⏤  ⤢ │
│ ██████████████░░░░░░░░░░░░░░░░░░  25:03 / 45:00   Ustadz A · Sesi 3/24 │
└────────────────────────────────────────────────────────────────────────┘
    Baris 1: cover  judul (klik → full player)   ·   kontrol + speed/vol + expand
    Baris 2: progress bar (tipis, klik/drag → seek)  ·  waktu  ·  konteks series
```

### 1.2 Mobile (<768px)

```
┌────────────────────────────────────────────────────┐
│ ▀▀  Sesi 3 Kitab Tauhid                ▶     ⤢     │
│ ████████████░░░░░░░░░░░░  25:03 / 45:00           │
└────────────────────────────────────────────────────┘
    Baris 1: cover kecil · judul (klik → full) · play/pause · expand
    Baris 2: progress tipis + waktu (rewind/forward = di full player)
```

**Perilaku bersama (mini player):**
- Muncul otomatis saat ada audio aktif (state `ready`/`playing`); hilang saat state `idle` (belum ada audio / ditutup).
- Tidak menimpa tombol bottom-nav publik; di mobile mini player menempel **di atas** bottom nav.
- Di `(learning)` Audio Detail: full player sudah tampil → mini player tetap ada tapi bisa di-collapse (tidak duplikat).

---

## 2. Full Player — Desktop (≥1024px) · Halaman Audio Detail & sheet

```
┌────────────────────────────────────────────────────────────────────────┐
│ ←  Sesi 3 — Pengertian Tauhid              [Kitab Tauhid · Sesi 3/24]  │
│ ┌─────────────────────────┬───────────────────────────────────────────┐ │
│ │      ▀▀▀▀▀▀▀▀▀▀▀        │  PANEL  [Chapter] [Highlight] [Reference]  │ │
│ │     ▀ COVER ▀▀▀▀▀       │         [Notes] [Attachment] [Related]    │ │
│ │     ▀▀▀▀▀▀▀▀▀▀▀        │  ──────────────────────────────────────── │ │
│ │                         │  ▸ 00:00  Pembukaan              ← aktif   │ │
│ │  [1.25×] [😴 30:00]     │  ▸ 05:22  Muqaddimah                       │ │
│ │                         │  ▸ 18:12  Dalil · QS Al-Ikhlas             │ │
│ │  ─────────────────────  │  ▸ 27:40  Syarat-syarat                    │ │
│ │  ██████████░░░░░░░░░░░  │  (auto-scroll ke item aktif)               │ │
│ │  25:03          45:00   │                                           │ │
│ │  ─────────────────────  │                                           │ │
│ │  ↺10  ⏮   ▶   ⏭  ↻30   │                                           │ │
│ │  ─────────────────────  │                                           │ │
│ │  🔊 [────●──]  [⏤]     │                                           │ │
│ └─────────────────────────┴───────────────────────────────────────────┘ │
└────────────────────────────────────────────────────────────────────────┘
```

- Kiri: media + timeline + kontrol (statis, selalu terlihat).
- Kanan: panel yang bisa di-scroll independen; konten **sinkron posisi**.

---

## 3. Full Player — Tablet (768–1023px) · kolom bertumpuk

```
┌────────────────────────────────────────────────────────┐
│ ←  Sesi 3 — Pengertian Tauhid        [Sesi 3/24]        │
│ ──────────────────────────────────────────────────────  │
│                 ▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀            │
│                ▀▀▀▀ COVER ▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀             │
│                 ▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀            │
│   [1.25×]  [😴 30:00]                                  │
│  ────────────────────────────────────────────────────  │
│  ████████████░░░░░░░░░░░░░░░░  25:03         45:00     │
│  ────────────────────────────────────────────────────  │
│        ↺10    ⏮    ▶    ⏭    ↻30                       │
│  ────────────────────────────────────────────────────  │
│  🔊 [────●──]      TAB: [Chapter ▾]                    │
│  ────────────────────────────────────────────────────  │
│  ▸ 00:00 Pembukaan (aktif) · ▸ 05:22 Muqaddimah · ...  │
└────────────────────────────────────────────────────────┘
```

---

## 4. Full Player — Mobile (<768px) · fullscreen sheet

```
┌────────────────────────────────────────────┐
│  ▾  Sesi 3 — Kitab Tauhid        [Sesi 3/24] │
│ ─────────────────────────────────────────── │
│           ▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀            │
│          ▀▀▀▀▀ COVER ▀▀▀▀▀▀▀▀▀▀▀▀          │
│           ▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀            │
│ ─────────────────────────────────────────── │
│  ██████████████░░░░░░░░░░░░ 25:03 / 45:00   │
│ ─────────────────────────────────────────── │
│   ↺10        ▶        ↻30                   │
│   (⏮ dan ⏭ di baris kontrol mini)          │
│ ─────────────────────────────────────────── │
│  [1.25×] [😴 30:00] [🔊] [⏤]               │
│ ─────────────────────────────────────────── │
│  TAB: [Chapter] [Highlight] [Reference]     │
│       [Notes] [Attachment] [Related]        │
│  ────────────────────────────────────────── │
│  ▸ 00:00 Pembukaan (aktif)                  │
│  ▸ 05:22 Muqaddimah                        │
└────────────────────────────────────────────┘
   (geser panel ke atas/bawah = scroll; kontrol tetap terlihat)
```

---

## 5. Player Panel — setiap tab (desktop kanan / mobile bawah)

### 5.1 Chapter
```
Chapter — 4 chapter
┌───────────────────────────────────────────┐
│ ▸ 00:00  Pembukaan                [2:40]  │
│ ▸ 05:22  Muqaddimah              [12:50]  │
│ ▶ 18:12  Dalil — QS Al-Ikhlas    [9:28]  │ ← aktif (posisi 25:03)
│ ▸ 27:40  Syarat-syarat           [17:20]  │
│ (klik → seek; item aktif disorot)         │
└───────────────────────────────────────────┘
```

### 5.2 Highlight
```
Highlight — 2
┌───────────────────────────────────────────┐
│ ⭐ Faedah Penting        18:12 – 20:00     │
│   "Ikhlash adalah hakikat ibadah..."      │
│ ⭐ Kesimpulan            27:40 – 29:00     │
│   "Tiga syarat diterimanya amal..."       │
│ (klik → seek; aktif dalam rentang disorot)│
└───────────────────────────────────────────┘
```

### 5.3 Reference
```
Reference — 3
┌───────────────────────────────────────────┐
│ 📖 QURAN      QS. Al-Ikhlas [1-4]  18:30  │
│   قل هو الله أحد... (teks Arab, RTL)      │
│   "Katakanlah Dialah Allah Yang Maha Esa" │
│ ────────────────────────────────────────  │
│ 📖 HADITH   HR. Bukhari no. 52    22:10   │
│   "Barang siapa yang Allah kehendaki..."  │
│ ────────────────────────────────────────  │
│ 📖 KITAB    Shahih Fiqih Sunah  25:40     │
└───────────────────────────────────────────┘
   (tampil mengikuti posisi; teks Arab memakai font Arab + RTL blok)
```

### 5.4 Notes
```
Notes — 2 (private, login)
┌───────────────────────────────────────────┐
│ [+ Tambah Catatan]                        │
│ 📝 "Tafsir ikhlas..."      · 18:30 [✏][🗑] │
│ 📝 "Dalil: QS Al-Ikhlas"   · 25:03 [✏][🗑] │
│ (timestamp otomatis = posisi saat menulis)│
└───────────────────────────────────────────┘
```

### 5.5 Attachment
```
Attachment
┌───────────────────────────────────────────┐
│ 📄 PDF   Kitab-Tauhid-01.pdf    2,4 MB  ⬇ │
│ 🖼 GAMBAR Diagram Ibadah.png     1,1 MB  ⬇ │
│ 🔗 LINK  manhajsalafinsights.com/...    ↗ │
└───────────────────────────────────────────┘
```

### 5.6 Related Content
```
Related Content
┌───────────────────────────────────────────┐
│ 📕 EBOOK  Syarah Aqidah        [Baca ↗]   │
│ 🎬 VIDEO  Kajian tematik        [Tonton ↗]│
│ ❓ QA     "Apa itu ihsan?"       [Baca ↗] │
└───────────────────────────────────────────┘
```

---

## 6. Menu Sekunder

### 6.1 Playback Speed
```
┌──────────────────────────────┐
│ Kecepatan Putar              │
│ 0.75×   1× ●   1.25×  1.5×   │
│ 1.75×   2×                   │
│ [Reset ke 1×]                │
└──────────────────────────────┘
   (persist; badge di tombol mini/full player)
```

### 6.2 Sleep Timer
```
┌──────────────────────────────┐
│ Sleep Timer                  │
│  5   10   15   30 ●   45      │
│  60   90                      │
│  [Sampai akhir sesi ini]      │
│  [Matikan]                    │
│  😴 akan pause pada 14:59     │
└──────────────────────────────┘
```

### 6.3 Volume
```
┌──────────────────────────────┐
│ 🔊 [──────●──] 80%  [🔇]     │
└──────────────────────────────┘
```

---

## 7. Overlay & Dialog

### 7.1 Buffering / Loading
```
┌────────────────────────────────────────────┐
│  (spinner) "Memuat audio..."               │
│  ▀▀ Cover (placeholder blur)               │
└────────────────────────────────────────────┘
```

### 7.2 Error — audio gagal
```
┌────────────────────────────────────────────┐
│  ⚠ "Audio gagal diputar"                   │
│  Deskripsi singkat + [Coba Lagi] [Lapor]   │
│  (opsional) [Buka di YouTube ↗]            │
└────────────────────────────────────────────┘
```

### 7.3 Offline
```
┌────────────────────────────────────────────┐
│  📶 "Koneksi bermasalah"                   │
│  "Lanjut memutar saat koneksi kembali."    │
│  (banner tipis — posisi tetap berjalan)    │
└────────────────────────────────────────────┘
```

### 7.4 Dialog Selesai Sesi (autoplay)
```
┌────────────────────────────────────────────┐
│ ✅ Sesi 3 selesai!                         │
│  Progress: 13% series · [Buka Series]      │
│                                            │
│   ▶ Putar Sesi 4 — Keutamaan Tauhid  (3s)  │
│  [Buka Series]   [Tutup]                  │
└────────────────────────────────────────────┘
   hitung mundur 3 detik → otomatis putar Sesi 4
```

### 7.5 Dialog Selesai Series
```
┌────────────────────────────────────────────┐
│ 🎉 Selamat! Kitab Tauhid selesai!          │
│  24/24 sesi · progress 100%                │
│  [Kembali ke Series] [Series Berikutnya →] │
└────────────────────────────────────────────┘
```

---

## 8. Restore Continue — contoh wireframe di halaman

```
Continue Learning (kartu)
┌────────────────────────────────────────────────────────────┐
│ ▀▀ Kitab Tauhid · Sesi 3 — Pengertian Tauhid        [▶▶]   │
│ ██████████░░░░░░░░ 25:03 / 45:00 · 55% · terakhir 2 jam   │
└────────────────────────────────────────────────────────────┘
   tap [▶▶] → full player, posisi 25:03 → play
```

---

*Dokumen ini menyertai `player.md`, `continue-learning.md`, dan `player-state.md`. Belum ada kode, komponen, player, atau API yang diimplementasikan.*
