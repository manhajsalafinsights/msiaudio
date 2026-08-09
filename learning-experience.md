# MSI Audio — Learning Experience

**Product Requirement — Pengalaman Belajar: Mengulang, Menemukan, Melanjutkan**

| | |
|---|---|
| Produk | MSI Audio |
| Scope | User flow lengkap belajar, UX mengulang/mencari/melanjutkan, responsive, accessibility, future-ready, best practice |
| Referensi | `player-flow.md` (F1–F5) · `progress.md` · `bookmark.md` · `notes.md` · `history.md` · `sync.md` |
| Status | Draft v1.0 — rancangan, bukan kode |

---

## 1. Prinsip UX Belajar

1. **Lanjut itu 1 ketukan** — "lanjutkan" harus lebih mudah dari "cari lagi".
2. **Mencatat itu 2 ketukan** — bookmark & notes tersedia *di dalam* player, tidak perlu pindah halaman.
3. **Konteks selalu terbawa** — timestamp; kembali ke posisi; melihat series.
4. **Kapan pun berhenti, tetap diingat** — offline, tutup tab, ganti perangkat.
5. **Privat** — catatan & bookmark milik user; tidak pernah diekspos.

---

## 2. User Flow Lengkap

### 2.1 Eksplorasi & Pilih Kajian
```
Home/Belajar ─▶ Browse list ─▶ Pilih Series ─▶ Series Detail (daftar sesi, progress)
                                              │
                                              ├─▶ [▶ Putar Sesi]
                                              └─▶ (jika pernah) Resume card
```

### 2.2 Putar & Lanjutkan
```
Putar ─▶ (browse, sudah pernah) Dialog "Lanjutkan belajar?" [Lanjutkan dari 25:03]
                                              │  [Mulai dari Awal]
       ─▶ Player memutar ─▶ auto-save tiap momen ─▶ kartu Continue update
```

### 2.3 Mencatat Saat Belajar (di player)
```
[🔖 Bookmark]  ─▶ posisi otomatis ─▶ (opsional) judul/catatan ─▶ Simpan ─▶ toast
[📝 Notes]     ─▶ tab Notes ─▶ + Tambah ─▶ judul ops. + isi ─▶ Simpan ─▶ toast
[⏸ Pause]     ─▶ posisi disimpan (flush) ─▶ dialog selesai sesi (opsional)
```

### 2.4 Mengulang / Menemukan Kembali
```
Setelah belajar:
  • Halaman Bookmark ─▶ tap ▶ ─▶ audio di posisi bookmark
  • Halaman Notes    ─▶ tap ▶ pada item ─▶ seek ke posisi catatan
  • Continue Learning ─▶ ▶▶ ─▶ lanjut posisi (autoplay)
  • Recently Played  ─▶ ▶  ─▶ lanjut / putar ulang (sesuai status)
```

### 2.5 Ganti Perangkat (sync)
```
HP (offline) ─▶ berhenti ─▶ online ─▶ outbox push ─▶ Laptop buka ─▶ pull delta
             ─▶ Continue Learning menampilkan posisi terbaru ─▶ lanjut
```

### 2.6 Selesai Series
```
Audio terakhir selesai (≥98% / durasi−30s) ─▶ completedCount++ ─▶ series 100%
            ─▶ Dialog "Series Selesai 🎉" ─▶ [Series Berikutnya] / [Baca Notes]
```

---

## 3. UX Mengulang, Menemukan, Melanjutkan

| Kebutuhan | Solusi |
|---|---|
| "Mau ulang dalil tadi" | Titik Bookmark di progress bar + daftar Bookmark → seek |
| "Mau baca catatan tentang ini" | Panel Notes di player + halaman Notes (search/filter) |
| "Di mana saya berhenti?" | Kartu Continue Learning (posisi + % + estimasi sisa) |
| "Apa yang saya dengar?" | Recently Played (Home) + halaman History (kelompok tanggal) |
| "Sudah sampai mana series ini?" | Series Detail: bar progress per sesi + badge selesai |

**Estimasi sisa** (di kartu Continue): `(durasi − posisi) / kecepatan pemutaran terakhir` → teks "±20 mnt". Dihitung saat render (bukan kolom baru).

---

## 4. Responsive

| Layout | Perilaku |
|---|---|
| Desktop (≥1024) | Sidebar/list; filter inline; player fixed bottom; panel bookmark/notes sebagai tab di panel player |
| Tablet (768–1023) | Grid 2 kolom; filter ringkas; panel player bottom sheet |
| Mobile (<768) | Satu kolom; tombol besar (≥44px); modal & bottom sheet; tab Bookmark/Notes di player bawah |

**Player mobile:** posisi bookmark/notes sebagai titik di progress bar; ketuk titik → menu singkat (`[▶ play dari sini] [🗑]`).

---

## 5. Accessibility

| Aspek | Ketentuan |
|---|---|
| Keyboard | `Space` = play/pause · `←/→` = ±10s · `M` = mute · `B` = bookmark · `N` = catatan baru · `Esc` = tutup modal; navigasi lengkap dengan Tab (fokus terlihat) |
| Screen reader | Setiap ikon punya `aria-label` teks ("Bookmark pada 25:03"); toast memakai `role="status"`; progress `aria-valuenow/min/max`; dialog focus trap; daftar pakai `aria-current` untuk sesi aktif |
| Focus | `focus-visible` ring pada semua elemen interaktif; saat modal terbuka fokus pindah ke tombol utama; setelah simpan fokus kembali ke elemen asal |
| Motion | Animasi dikurangi untuk `prefers-reduced-motion`; transisi ≤300ms |
| Contrast | Semua teks memenuhi WCAG AA; status via warna **dan** ikon/teks (tidak hanya warna) |
| Touch | Target ≥44×44px; undo action mudah dijangkau |

---

## 6. Future Ready

| Fitur | Peta |
|---|---|
| **AI Summary Notes** | Rangkum notes per series → "Ringkasan Kajian" (`notes.md` §6) |
| **AI Tag Bookmark** | Tag otomatis dari judul/catatan/transcript → filter Bookmark lebih pintar |
| **AI Rekomendasi Kajian** | History + Progress + Notes sebagai sinyal personal |
| **Export PDF/Markdown** | Notes & Bookmark (lihat notes/bookmark §6) |
| **Share posisi** | Link `t=...` saja (tetap privat; bukan share data) |
| **Offline download** | `MediaSource` siap untuk cache audio (`sync.md` §6) |

---

## 7. Best Practice

### UX
- Zero-friction mencatat: posisi otomatis, simpan 1 ketuk, toast + undo.
- Default yang aman: **Lanjutkan** (dari posisi), bukan "mulai ulang".

### State Management
- Satu sumber kebenaran: state machine `player-state.md` (playing/paused/buffering/offline…); UI tidak menyimpan posisi — hanya membaca.
- Autosave terpusat di service (`progress-service`), bukan di komponen.

### Scalability
- Push delta + pull incremental (`last-updated`) → query kecil, index `(userId, lastPlayedAt)`.
- Agregasi progress dihitung (bukan kolom denormalized di luar transaksi) → `$transaction` menjaga konsistensi.

### Performance
- 4 momen auto-save + throttle ≥5s → minim request saat memutar.
- List bookmark/notes pakai pagination/infinite scroll; tidak memuat semua.

### Data Sync & Error
- Outbox offline → no lost update; LWW (progress/bookmark) + conflict copy (notes).
- Retry dengan backoff; failure tetap menyimpan lokal; badge offline tidak hilang sampai queue kosong.

### Error Handling
- Gagal simpan → toast "Tersimpan di perangkat" (tetap offline-capable), bukan error keras.
- Gagal load → empty state dengan aksi "Coba lagi" / fallback ke data lokal.

---

## 8. Ringkasan Non-Negotiable

1. **Lanjut & mencatat = sesedikit mungkin ketukan**, tersedia di dalam player.
2. **Konteks selalu terbawa** — posisi, timestamp, series.
3. **Mengulang mudah** — bookmark di progress bar, notes seek-able.
4. **Aksesibel & responsif** — keyboard, screen reader, fokus, semua ukuran layar.
5. **Offline tidak menghilangkan data** — outbox + LWW + conflict copy.
6. **Privat** — seluruh data personal user.

---

*Dokumen ini menyimpulkan `bookmark.md`, `notes.md`, `progress.md`, `history.md`, dan `sync.md`. Belum ada kode yang diimplementasikan.*
