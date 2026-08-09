# MSI Audio — Notes (Catatan Kajian)

**Product Requirement — Catatan Pribadi & Pengelolaannya**

| | |
|---|---|
| Produk | MSI Audio (ekosistem Manhaj Salaf Insights) |
| Scope | Konsep catatan, data, UX, manajemen (tambah/edit/hapus/search/filter/export-future), wireframe, responsive, aksesibilitas, future |
| Referensi | `schema.prisma` (model `Note`) · `player.md` (§5 panel Notes) · `bookmark.md` |
| Status | Draft v1.0 — rancangan, bukan kode |

---

## 1. Konsep Notes

**Notes = catatan belajar pribadi yang terikat pada kajian & posisi waktu.**

Beda dengan Bookmark:

| | Bookmark | Notes |
|---|---|---|
| Sifat | Penanda (point) | Isi/catatan (konten) |
| Posisi | Satu posisi per bookmark | Satu posisi, **boleh banyak catatan** per audio |
| Isi | Judul opsional + catatan singkat | **Judul + isi** (lebih panjang) |
| Tujuan | "kembali ke sini" | "menulis yang kupelajari di sini" |

**Setiap catatan memiliki:**

| Atribut | Contoh | Sumber |
|---|---|---|
| Judul | "Poin ikhlas" | `Note.judul` *(evolusi, lihat bawah)* |
| Isi | "Ibadah harus ikhlas dan ittiba'..." | `Note.content` |
| Audio | "Sesi 3 — Pengertian Tauhid" | `Note.audioId` |
| Posisi detik | `1503` (25:03) | `Note.positionSeconds` |
| Tanggal | 2 Jan 2026 (dibuat/diubah) | `Note.createdAt` / `Note.updatedAt` |

> **Catatan schema (evolusi yang direkomendasikan):** model `Note` sudah punya `(userId, audioId, positionSeconds, content, createdAt, updatedAt)` — cukup tambah `judul String?` (opsional). Tidak ada perubahan unique (boleh banyak catatan per (user, audio)).

---

## 2. UX Notes

### 2.1 Membuat Catatan (dalam player)
- Tab **Notes** di player panel (lihat `player-wireframe.md` §5.4).
- Tombol `[+ Tambah Catatan]` → **posisi otomatis** = posisi saat ini.
- Form: judul (opsional, jadi header daftar) + isi (wajib).

```
┌────────────────────────────────────────────┐
│ 📝 Catatan Baru                           │
│ ▀▀ Sesi 3 — Pengertian Tauhid             │
│ Posisi: 25:03          (otomatis)         │
│ Judul (ops.) [Poin ikhlas............]    │
│ Isi *        [Ibadah harus ikhlas dan     │
│              ittiba'... (textarea)        │
│            [💾 Simpan] [Batal]            │
└────────────────────────────────────────────┘
```

- Saat mengetik, tombol simpan aktif; autosave draft lokal agar tidak hilang (guest/localStorage).
- Toast "Catatan disimpan"; ikon 📝 muncul di timeline posisi tersebut.

### 2.2 Membaca & Mengedit
- Daftar catatan pada tab Notes → buka modal/full editor → edit → simpan (update `updatedAt`).
- Tap item → juga bisa **seek ke posisi** catatan (ikon ▶ di samping timestamp).

### 2.3 Menghapus
- 🗑 + konfirmasi ringan + undo (5 detik).

---

## 3. Notes Management (halaman `/notes`)

| Aksi | UX |
|---|---|
| Tambah | Dari player; dari halaman = pilih audio dulu |
| Edit | Judul + isi, satu modal editor |
| Hapus | Per item / massal (checkbox) + konfirmasi + undo |
| Search | Cari di judul & isi |
| Filter | By series · by ustadz · (future) by tanggal/bulan |
| Urutkan | Diperbarui terakhir (default) · Dibuat · A-Z judul · Posisi |
| Export (future) | PDF · Markdown · (AI summary) — lihat §6 |

Wireframe halaman Notes:

```
┌──────────────────────────────────────────────────────────────┐
│ Notes                                          [+ Catatan]   │
│ [🔍 cari catatan...]  [Series ▾] [Urut ▾]                    │
│ ──────────────────────────────────────────────────────────── │
│ 📝 Poin ikhlas                        Sesi 3 Kitab Tauhid     │
│    Ibadah harus ikhlas dan ittiba'...  · 25:03 · 2 Jan  [▶][✏][🗑]│
│ 📝 Mengapa taklid haram               Sesi 1 Ushulus         │
│    Dalil: larangan taklid buta...      · 12:40 · 1 Jan  [▶][✏][🗑]│
│ ──────────────────────────────────────────────────────────── │
│ « 1 2 … »   (mobile: kartu satu kolom)                       │
└──────────────────────────────────────────────────────────────┘
```

---

## 4. Responsive & Accessibility

| Aspek | Ketentuan |
|---|---|
| Desktop | List + filter inline; editor sebagai panel/overlay |
| Tablet | Grid 2 kolom |
| Mobile | Kartu satu kolom; editor = bottom sheet / layar penuh |
| Keyboard | `N` = catatan baru · `⌘/Ctrl+F` cari · Tab navigasi · Delete (konfirmasi) |
| Screen reader | Editor `label` terhubung `htmlFor`; toast simpan `role="status"`; timestamp catatan dengan teks (bukan hanya ikon) |
| Focus | Fokus ke kolom isi saat modal dibuka; ring `focus-visible` jelas |

---

## 5. Privasi & Batas

- **Catatan 100% pribadi** — hanya pemilik yang bisa baca. Tidak ada fitur publik/moderasi.
- Posisi detik menunjuk ke audio (bukan salinan isi audio) — privasi konten audio tetap terjaga.
- Catatan ke audio yang dihapus admin → ikut terhapus (FK cascade); bila perlu, admin mendapat peringatan sebelum menghapus audio yang punya data user.

---

## 6. Future Ready

| Fitur | Persiapan |
|---|---|
| **AI Summary dari Notes** | Kumpulan `Note.content` + transcript → ringkasan per series (future `lib/ai`); struktur data sudah siap |
| **Export PDF / Markdown** | Ekspor semua/terfilter: header judul + timestamp + audio; gabung dengan Bookmark export |
| **AI Rekomendasi Kajian** | Notes jadi sinyal personal untuk rekomendasi (lihat `player-future.md` §7) |
| **Share Notes (opsional)** | Selalu privat; *tidak* direncanakan untuk dibagikan secara publik — dicatat sebagai keputusan |

---

## 7. Ringkasan Non-Negotiable

1. **Pribadi** — tidak pernah tampil ke user lain.
2. **Posisi otomatis** — catatan terikat posisi saat ini, bukan diketik manual.
3. **Judul opsional, isi wajib** — ringan dibuat, tetap terstruktur.
4. **Banyak catatan per audio** — sesi panjang layak >1 catatan.
5. **Dari daftar → seek ke posisi** → mudah diulang konteksnya.

---

*Dokumen ini menyertai `bookmark.md`, `progress.md`, `history.md`, `sync.md`, dan `learning-experience.md`. Belum ada kode yang diimplementasikan.*
