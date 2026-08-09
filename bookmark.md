# MSI Audio — Bookmark

**Product Requirement — Bookmark & Pengelolaannya**

| | |
|---|---|
| Produk | MSI Audio (ekosistem Manhaj Salaf Insights) |
| Scope | Konsep bookmark, data, UX, manajemen (CRUD/filter/search/sort), wireframe, responsive, aksesibilitas, future |
| Referensi | `schema.prisma` (model `Bookmark`) · `player.md` · `learning-experience.md` |
| Status | Draft v1.0 — rancangan, bukan kode |

---

## 1. Konsep Bookmark

**Bookmark = penanda posisi yang ingin diingat & dikunjungi ulang.**

| Ciri | Nilai |
|---|---|
| Pemilik | **Per-user** (pribadi, tidak pernah tampil ke user lain) |
| Sasaran | Audio **dan** posisi detik tertentu |
| Tujuan | Mengingat dalil, faedah, atau bagian yang ingin diulang |

**Setiap bookmark memiliki:**

| Atribut | Contoh | Sumber |
|---|---|---|
| Audio | "Sesi 3 — Pengertian Tauhid" | `Bookmark.audioId` |
| Series | "Kitab Tauhid" | via `audio.series` |
| Posisi detik | `1503` (25:03) | `Bookmark.positionSeconds` |
| Judul (opsional) | "Dalil ikhlas" | `Bookmark.judul` |
| Catatan singkat (opsional) | "QS. Al-Ikhlas 1-4" | `Bookmark.catatan` |
| Tanggal dibuat | 2 Jan 2026 | `Bookmark.createdAt` |

> **Catatan schema (evolusi yang direkomendasikan):** model `Bookmark` saat ini hanya `(userId, audioId, createdAt)` dengan unique `(userId, audioId)`. Agar mendukung posisi + judul + catatan:
> 1. Tambah `positionSeconds Int @default(0)` (0 = awal audio).
> 2. Tambah `judul String?` dan `catatan String?`.
> 3. Ubah unique `(userId, audioId)` → `(userId, audioId, positionSeconds)` agar satu audio bisa punya banyak bookmark di posisi berbeda.
> (Perubahan schema dilakukan saat implementasi — di luar dokumen ini.)

---

## 2. UX Bookmark

### 2.1 Menambah Bookmark (dalam player)
- Tombol **🔖 Bookmark** di player panel (dan di baris audio pada daftar).
- Saat dipencet dari player → posisi otomatis = posisi saat ini (`positionSeconds`).
- Prompt **cepat** (tidak memaksa): modal ringkas berisi judul & catatan opsional + posisi yang sudah terisi. Bisa langsung "Simpan" tanpa isi apa pun.

```
┌────────────────────────────────────────────┐
│ 🔖 Bookmark                               │
│ ▀▀ Sesi 3 — Pengertian Tauhid             │
│ Posisi: 25:03          (otomatis)         │
│ Judul (ops.)  [Dalil ikhlas........]      │
│ Catatan (ops.) [QS Al-Ikhlas 1-4...]      │
│            [💾 Simpan] [Batal]            │
└────────────────────────────────────────────┘
```

- Feedback: toast "Bookmark disimpan pada 25:03"; ikon berubah solid 🔖; bisa langsung buka daftar.
- **Penanda visual**: saat diputar, bookmark pada posisi tersebut muncul sebagai titik pada progress bar (klik → seek).

### 2.2 Membuka / Melanjutkan dari Bookmark
- Dari daftar Bookmark → tap → buka audio **di posisi bookmark** (bukan awal). Restore posisi + auto-play (jika user memilih).

### 2.3 Menghapus
- Tombol 🗑 pada item → konfirmasi ringan ("Hapus bookmark ini?"). Undo 5 detik (toast) untuk mengurangi kesalahan.

---

## 3. Bookmark Management (halaman `/bookmark`)

### 3.1 Kapabilitas

| Aksi | UX |
|---|---|
| Tambah | Dari player (posisi otomatis) atau dari halaman (pilih audio + posisi) |
| Hapus | Per item (konfirmasi + undo) · hapus massal via checkbox |
| Edit Judul | Tap ikon ✏ → modal edit judul |
| Edit Catatan | Satu modal yang sama (judul + catatan) |
| Lihat semua | List paginated, group by tanggal/hari |
| Filter | By series · by ustadz · (future) by kategori/tag |
| Search | Cari di judul/catatan/nama audio |
| Urutkan | Terbaru (default) · Posisi · A-Z judul · Series |

### 3.2 Aturan
- **Hanya milik user** — tidak ada bookmark publik.
- Bookmark ke audio yang sudah dihapus admin → dihapus otomatis (FK cascade) atau disembunyikan; ditangani saat implementasi.
- Guest: bookmark tersimpan di localStorage sampai login, lalu di-merge (lihat `sync.md`).

---

## 4. Wireframe — Halaman Bookmark

### 4.1 Desktop (≥1024px)

```
┌──────────────────────────────────────────────────────────────┐
│ [◈ MSI Audio]  Beranda · Jelajahi · Trending · Ustadz  [👤]  │
│ Home › Profil › Bookmark                                     │
├──────────────────────────────────────────────────────────────┤
│ Bookmark                                  [+ Bookmark Baru]  │
│ [🔍 cari bookmark...]  [Series ▾] [Urut ▾]                   │
│ ──────────────────────────────────────────────────────────── │
│ HARI INI                                                     │
│ 🔖 25:03  Sesi 3 Kitab Tauhid — "Dalil ikhlas"      [▶][✏][🗑]│
│ 🔖 12:40  Sesi 1 Ushulus — "Mengapa taklid haram"   [▶][✏][🗑]│
│ KEMARIN                                                      │
│ 🔖 08:15  Sesi 7 Ushulus — "Atsar Ibnu Mas'ud"      [▶][✏][🗑]│
│ ──────────────────────────────────────────────────────────── │
│ « 1 2 3 … »  (Total 12)                                     │
└──────────────────────────────────────────────────────────────┘
```

### 4.2 Mobile (<768px)

```
┌────────────────────────────────────────────┐
│ [←] Bookmark                      [+ 🔖]   │
│ [🔍 cari...]                              │
│ ────────────────────────────────────────── │
│ 🔖 25:03                                   │
│   Sesi 3 Kitab Tauhid                      │
│   "Dalil ikhlas" · QS Al-Ikhlas 1-4        │
│   [▶]  [✏]  [🗑]                          │
│ ────────────────────────────────────────── │
│ (kartu per bookmark; tombol aksi full-row) │
└────────────────────────────────────────────┘
```

**Tablet:** grid 2 kolom kartu.

---

## 5. Responsive & Accessibility

| Aspek | Ketentuan |
|---|---|
| Desktop | List tabel/kartu + filter bar inline |
| Tablet | Grid 2 kolom, filter ringkas |
| Mobile | Kartu satu kolom, tombol besar, bottom sheet untuk modal |
| Keyboard | `N` = bookmark baru · `⌘/Ctrl+F` fokus search · navigasi item dengan Tab · Delete = hapus (dengan konfirmasi) |
| Screen reader | Ikon 🔖 punya `aria-label` ("Bookmark pada 25:03"); status aksi diumumkan via toast `role="status"` |
| Focus | `focus-visible` ring pada semua aksi; modal fokus ke tombol simpan |

---

## 6. Future Ready

| Fitur | Persiapan |
|---|---|
| **AI Tag Bookmark** | `Bookmark.judul` + `catatan` + transcript audio → tag otomatis (future, butuh `lib/ai`) |
| **Share Bookmark (opsional)** | Bookmark tetap pribadi; hanya *link* ke posisi (mis. `/audio/[slug]?t=1503`) yang bisa dibagikan — bukan data bookmarknya |
| **Export** | Gabung dengan export Notes (lihat `notes.md` §6) |

---

## 7. Ringkasan Non-Negotiable

1. **Pribadi** — bookmark tidak pernah dilihat user lain.
2. **Posisi adalah identitas** — bookmark = posisi detik, bukan sekadar "audio".
3. **Satu ketukan untuk simpan**, zero-friction (judul & catatan opsional).
4. **Titik bookmark tampil di progress bar** → mudah diulang.
5. **Dari daftar → langsung buka di posisi bookmark.**

---

*Dokumen ini menyertai `notes.md`, `progress.md`, `history.md`, `sync.md`, dan `learning-experience.md`. Belum ada kode yang diimplementasikan.*
