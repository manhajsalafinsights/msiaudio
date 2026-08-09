# MSI Audio — Database Design & ERD

**Product Requirement — Database Layer**

| | |
|---|---|
| Produk | MSI Audio (ekosistem Manhaj Salaf Insights) |
| Stack | Next.js · Prisma · PostgreSQL (Supabase) · Vercel |
| Scope | Database design, ERD, Prisma schema, relasi, indeks, cascade, unique, skalabilitas |
| Output | `database.md` (dokumen ini) · `schema.prisma` |

---

## 1. Prinsip Desain

1. **Supabase hanya menyimpan metadata.** Tidak ada file audio, tidak ada bucket audio di server.
2. **Audio berasal dari provider eksternal** dan direpresentasikan lewat tabel `MediaSource`, bukan kolom URL di tabel `Audio`. Tidak ada `youtube_url` yang di-hardcode di `Audio`.
3. **Future-proof untuk provider baru** — menambah provider cukup menambah nilai enum + migrasi, tanpa mengubah tabel `Audio` maupun data lama.
4. **Future-proof untuk jenis konten baru** (video, ebook, artikel, QA, academy) — struktur `Series → Content` yang dibatasi ke `Audio` dapat diperluas ke jenis konten lain tanpa merombak tabel user-progress (lihat §12).
5. **Denormalisasi terkendali** — field ringkasan (`total_sesi`, `total_durasi`, `completed_count`) disimpan agar query daftar berskala besar tidak memerlukan `COUNT()`/`SUM()` per baris.
6. **Tabel ringkas, bukan tabel "jurnal"** — riwayat & progres memakai satu baris per pasangan (user, konten) yang diperbarui, sehingga jumlah baris tetap terukur (jutaan user = jutaan baris, bukan tak terbatas).

---

## 2. ERD (Entity Relationship Diagram)

```
┌──────────┐    ┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│  USERS   │    │  SPEAKERS    │    │ CATEGORIES   │    │    TAGS      │
└────┬─────┘    └──────┬───────┘    └──────┬───────┘    └──────┬───────┘
     │                │                   │                   │
     │ 1:N            │ 1:N               │ 1:N               │ 1:N
     ▼                ▼                   ▼                   ▼
┌──────────────┐    ┌──────────────────────────────────────────────────┐
│UserProgress  │    │                   SERIES ──────1:N──> RELATED_CONTENT
│ListeningHistory│   │  ── N:1 ─────────> SERIES_TYPE                  │
│Bookmark      │    │                                                  │
│Note          │    │  ── 1:N ──> Audio                                │
│FavoriteSeries│    │  ── 1:N ──> SeriesSpeaker (pivot)                │
└──────────────┘    │  ── 1:N ──> SeriesCategory (pivot)               │
                    │  ── 1:N ──> SeriesTag (pivot)                    │
                    └──────────────────────────────────────────────────┘
                                   │
                                   │ 1:N
                                   ▼
                    ┌────────────────────────────────────────────────┐
                    │                    AUDIO                      │
                    └─┬──────────┬──────────┬──────────┬────────────┘
                      │ 1:N      │ 1:N      │ 1:N      │ 1:N
                      ▼          ▼          ▼          ▼
                 ┌────────┐ ┌─────────┐ ┌──────────┐ ┌──────────┐
                 │MEDIA_SOURCE│ │TRANSCRIPT│ │ATTACHMENT│ │REFERENCE │
                 └────────┘ └─────────┘ └──────────┘ └──────────┘
                 ┌─────────┐ ┌─────────┐
                 │HIGHLIGHT│ │ CHAPTER │
                 └─────────┘ └─────────┘
                    (juga 1:N dari AUDIO)

Legenda arah relasi:
  ┌──┐ ──> berarti tabel kiri punya FK ke tabel kanan.
  UserProgress/ListeningHistory/Bookmark/Note/FavoriteSeries ──> User & Series/Audio
  SeriesSpeaker ──> Speaker & Series · SeriesCategory ──> Category & Series
  SeriesTag ──> Tag & Series · Audio ──> Series · Series ──> SeriesType
  MediaSource/Transcript/Attachment/Reference/Highlight/Chapter ──> Audio
  RelatedContent ──> Series (target_type/target_id polimorfik, TANPA FK)
```

### Kardinalitas Ringkas

| Relasi | Kiri | Kanan | Kardinalitas |
|---|---|---|---|
| User → UserProgress | 1 | N | satu user punya banyak progres per series |
| User → ListeningHistory | 1 | N | satu user punya banyak riwayat |
| User → Bookmark | 1 | N | satu user punya banyak bookmark |
| User → Note | 1 | N | satu user punya banyak catatan |
| User → FavoriteSeries | 1 | N | satu user menyukai banyak series |
| Series → SeriesType | N | 1 | satu series punya satu jenis; satu jenis dipakai banyak series |
| Series → Audio | 1 | N | satu series punya banyak sesi audio |
| Series → SeriesSpeaker | 1 | N | series punya banyak pivot speaker |
| Series → SeriesCategory | 1 | N | series punya banyak pivot kategori |
| Series → SeriesTag | 1 | N | series punya banyak pivot tag |
| Series → UserProgress | 1 | N | satu series punya banyak progres user |
| Series → FavoriteSeries | 1 | N | satu series disukai banyak user |
| Series → RelatedContent | 1 | N | satu series terhubung ke banyak konten lain (polimorfik) |
| Audio → MediaSource | 1 | N | satu audio punya banyak sumber media |
| Audio → Transcript | 1 | N | satu audio punya banyak transkrip (per bahasa) |
| Audio → Attachment | 1 | N | satu audio punya banyak lampiran |
| Audio → Reference | 1 | N | satu audio punya banyak referensi ilmiah (per posisi waktu) |
| Audio → Highlight | 1 | N | satu audio punya banyak highlight admin |
| Audio → Chapter | 1 | N | satu audio punya banyak chapter |
| Audio → ListeningHistory | 1 | N | satu audio diputar banyak user |
| Audio → Bookmark | 1 | N | satu audio dibookmark banyak user |
| Audio → Note | 1 | N | satu audio punya banyak catatan |
| Audio → UserProgress (lastAudio) | 1 | N | satu audio bisa jadi "audio terakhir" banyak progres |
| Speaker → SeriesSpeaker | 1 | N | pivot |
| Category → SeriesCategory | 1 | N | pivot |
| Tag → SeriesTag | 1 | N | pivot |

---

## 3. Penjelasan Setiap Tabel

### 3.1 `users`

| Kolom | Tipe | Keterangan |
|---|---|---|
| `id` | String (cuid) | PK |
| `nama` | String | Nama lengkap |
| `email` | String | Unik, untuk login |
| `passwordHash` | String | Hash password (tambahan dari spesifikasi — wajib untuk auth; alternatif: delegasikan ke Supabase Auth, kolom ini bisa dihapus) |
| `avatar` | String? | URL foto profil |
| `role` | Enum | `ADMIN` / `USER` |
| `createdAt` / `updatedAt` | Timestamp | |

**Mengapa dibuat:** entitas dasar seluruh data personal (progres, bookmark, catatan, riwayat, favorit).

**Mengapa scalable:** semua data personal dihubungkan via FK berindeks; tidak ada data pribadi yang dibaca dalam satu query besar bersama konten — selalu per-user. `role` enum memisahkan hak akses tanpa tabel terpisah.

---

### 3.2 `speakers`

| Kolom | Tipe | Keterangan |
|---|---|---|
| `id` | String (cuid) | PK |
| `nama` | String | Nama pemateri |
| `slug` | String | Unik, untuk URL `/ustadz/{slug}` |
| `foto` | String? | Foto |
| `bio` | String? | Biografi |
| `status` | Enum | `ACTIVE` / `INACTIVE` |

**Mengapa dibuat:** disebut **Speaker**, bukan Ustadz, karena satu kajian/series bisa punya lebih dari satu pemateri, dan di masa depan bisa ada pembahas/narasumber lain. Status terpisah dari seri "dihapus" — speaker dinonaktifkan, tidak dihapus, agar relasi lama tetap utuh.

**Mengapa scalable:** hub ke series lewat tabel pivot ber-PK komposit dan ber-index — join jutaan series-speaker tetap murah.

---

### 3.3 `categories`

| Kolom | Tipe | Keterangan |
|---|---|---|
| `id` | String (cuid) | PK |
| `nama` | String | Nama kategori (Aqidah, Fiqih, Tafsir, ...) |
| `slug` | String | Unik |
| `icon` | String? | Icon/emoji |

**Mengapa dibuat:** struktur taksonomi tingkat atas untuk navigasi & filter.

**Mengapa scalable:** hubungan many-to-many via `SeriesCategory`; satu kategori tidak menyimpan daftar series langsung, sehingga menambah kategori tidak menambah duplikasi.

---

### 3.4 `tags`

| Kolom | Tipe | Keterangan |
|---|---|---|
| `id` | String (cuid) | PK |
| `nama` | String | Tauhid, Shalat, Ramadhan, Nikah, Akhlaq, ... |
| `slug` | String | Unik |

**Mengapa dibuat:** pencarian/filter granular yang kategori tidak bisa tangani (kategori bersifat struktural, tag bersifat tematik/topik). Satu series bisa punya banyak tag; satu tag bisa dipakai banyak series.

**Mengapa scalable:** pivot ber-PK komposit + index `tagId` untuk lookup "semua series dengan tag ini".

---

### 3.5 `series`

| Kolom | Tipe | Keterangan |
|---|---|---|
| `id` | String (cuid) | PK |
| `judul` | String | Judul program belajar |
| `slug` | String | Unik |
| `cover` | String? | URL cover |
| `deskripsi` | String? | Deskripsi kurikulum |
| `totalSesi` | Int | Denormalisasi jumlah sesi |
| `totalDurasi` | Int | Denormalisasi total durasi (detik) |
| `published` | Boolean | Tampil/tidak di publik |
| `createdAt` / `updatedAt` | Timestamp | |

**Mengapa dibuat:** **pengganti Playlist** — sebagai unit "program belajar" (Kitab Tauhid, Ushulus Sunnah, Bulughul Maram). Inilah jantung konsep belajar bertahap.

**Mengapa scalable:** daftar series (halaman `/series`, halaman home) memakai kolom denormalisasi sehingga **tanpa `COUNT()`/`SUM()` per baris**. Nilai dijaga saat audio dibuat/dihapus (transaksi) atau di-recompute berkala (lihat §10.4).

---

### 3.6 `audio`

| Kolom | Tipe | Keterangan |
|---|---|---|
| `id` | String (cuid) | PK |
| `seriesId` | FK → series | Wajib |
| `nomorSesi` | Int | Urutan dalam series |
| `judul` | String | Judul kajian/sesi |
| `slug` | String | Unik |
| `deskripsi` | String? | Deskripsi sesi |
| `durasi` | Int | Detik |
| `cover` | String? | Cover sesi |
| `published` | Boolean | Tampil/tidak |
| `createdAt` / `updatedAt` | Timestamp | |

**Mengapa dibuat:** representasi satu sesi kajian. **Tidak ada kolom URL audio di sini** — penyimpanan media sepenuhnya dipindahkan ke `MediaSource` agar berganti provider tanpa migrasi data.

**Mengapa scalable:** unique `(seriesId, nomorSesi)` mencegah duplikasi sesi; index `(seriesId, published, nomorSesi)` membuat "daftar sesi published sebuah series" satu index lookup; index `(published, createdAt)` melayani feed "kajian terbaru" lintas series.

---

### 3.7 `media_sources`

| Kolom | Tipe | Keterangan |
|---|---|---|
| `id` | String (cuid) | PK |
| `audioId` | FK → audio | Wajib |
| `provider` | Enum | `YOUTUBE` · `CLOUDFLARE_R2` · `BUNNY_CDN` · `BACKBLAZE` · `LOCAL_STORAGE` |
| `providerId` | String | Identitas asli di provider (mis. video ID YouTube) |
| `url` | String | URL sumber |
| `metadata` | Json? | Payload fleksibel: thumbnail, judul asli, bitrate, dst. |
| `createdAt` | Timestamp | |

**Mengapa dibuat:** inilah kunci **future-proof** yang diminta. `audio` tidak pernah tahu "asal media" — ia hanya punya referensi ke sumber. Ganti dari YouTube ke R2/Bunny/Backblaze cukup:
1. tambah baris `MediaSource` baru,
2. (opsional) nonaktifkan baris lama,
3. tanpa menyentuh `audio`, `progress`, `history`, `bookmark`.

**Mengapa scalable:** unique `(provider, providerId)` mencegah duplikasi sumber dari provider yang sama; `metadata` Json memuat info tambahan tanpa migrasi kolom saat format provider berubah.

---

### 3.8 `user_progress`

| Kolom | Tipe | Keterangan |
|---|---|---|
| `id` | String (cuid) | PK |
| `userId` | FK → users | |
| `seriesId` | FK → series | |
| `lastAudioId` | FK → audio (nullable) | Audio terakhir yang diputar |
| `positionSeconds` | Int | Posisi detik pada audio terakhir |
| `completedCount` | Int | Total audio selesai dalam series |
| `progressPercent` | Float | 0–100, per series |
| `createdAt` / `updatedAt` | Timestamp | |

**Mengapa dibuat:** inilah **inti belajar bertahap** — "di mana saya di program belajar ini?". `Continue Listening` (fitur teknis) hanyalah turunan dari tabel ini. Satu baris per (user, series).

**Mengapa scalable:**
- Unique `(userId, seriesId)` → satu baris per pasangan; jutaan user = jutaan baris, tidak meledak.
- `completedCount` & `progressPercent` di-denormalisasi → halaman "progress belajar saya" adalah single-row read.
- `lastAudioId` nullable + `onDelete: SetNull` → audio bisa dihapus tanpa merusak progress.
- Index `(userId, updatedAt)` → daftar "lanjutkan belajar" diurutkan paling baru.

---

### 3.9 `listening_history`

| Kolom | Tipe | Keterangan |
|---|---|---|
| `id` | String (cuid) | PK |
| `userId` | FK → users | |
| `audioId` | FK → audio | |
| `positionSeconds` | Int | Posisi terakhir |
| `progressPercent` | Float | 0–100 |
| `completed` | Boolean | Sudah selesai |
| `playCount` | Int | Berapa kali diputar |
| `lastPlayedAt` | Timestamp | |
| `createdAt` | Timestamp | |

**Desain penting:** satu baris per `(user, audio)`, **bukan log append**. Setiap kali user memutar, baris ini di-*upsert* (update). Keuntungan:
- Riwayat "kajian yang pernah saya putar" = `SELECT ... ORDER BY lastPlayedAt DESC` — selalu terkontrol jumlahnya.
- Menghindari tabel log yang tumbuh tak terkendali (satu user memutar 100x = tetap 1 baris).

**Mengapa scalable:** unique `(userId, audioId)` = satu baris per pasangan; index `(userId, lastPlayedAt)` untuk riwayat; index `(userId, audioId, completed)` untuk filter "belum selesai".

---

### 3.10 `bookmarks`

| Kolom | Tipe | Keterangan |
|---|---|---|
| `id` | String (cuid) | PK |
| `userId` | FK | |
| `audioId` | FK | |
| `createdAt` | Timestamp | |

**Mengapa dibuat:** simpan kajian favorit.

**Mengapa scalable:** unique `(userId, audioId)` mencegah bookmark ganda; index `(userId, createdAt)` melayani halaman bookmark terurut waktu.

---

### 3.11 `notes`

| Kolom | Tipe | Keterangan |
|---|---|---|
| `id` | String (cuid) | PK |
| `userId` | FK | |
| `audioId` | FK | |
| `positionSeconds` | Int | Posisi detik saat menulis catatan |
| `content` | String | Isi catatan |
| `createdAt` / `updatedAt` | Timestamp | |

**Mengapa dibuat:** catatan pribadi yang terikat pada momen di audio — pengalaman seperti menandai halaman buku.

**Mengapa scalable:** banyak catatan per (user, audio) diperbolehkan; index `(userId, audioId)` untuk memuat semua catatan sebuah audio user, index `(userId, updatedAt)` untuk "catatan terbaru".

---

### 3.12 `favorite_series`

| Kolom | Tipe | Keterangan |
|---|---|---|
| `id` | String (cuid) | PK |
| `userId` | FK | |
| `seriesId` | FK | |
| `createdAt` | Timestamp | |

**Mengapa dibuat:** "ikuti/ikuti program belajar" — fondasi fitur lanjutan seperti notifikasi rilis sesi baru.

**Mengapa scalable:** unique `(userId, seriesId)`; index `(userId, createdAt)`.

---

### 3.13–3.15 Pivot: `series_speakers`, `series_categories`, `series_tags`

| Kolom (contoh `series_speakers`) | Tipe |
|---|---|
| `seriesId` | FK → series (bagian PK komposit) |
| `speakerId` | FK → speaker (bagian PK komposit) |
| `role` | String? (mis. "pemateri_utama", "pembahas") |
| `order` | Int (urutan tampil pemateri) |
| `createdAt` | Timestamp |

**Mengapa dibuat:** many-to-many dengan metadata tambahan (urutan, peran). PK **komposit** `(seriesId, XId)` — tanpa kolom id tambahan, tanpa index redundan.

**Mengapa scalable:** lookup "speaker dari series" = index dari PK; lookup "series dari speaker/kategori/tag" = index balik `@@index([XId])`.

---

### 3.16 `series_types`

| Kolom | Tipe | Keterangan |
|---|---|---|
| `id` | String (cuid) | PK |
| `nama` | String | Kajian Kitab, Dauroh, Podcast, Seminar, Tematik, Ramadhan, Kajian Singkat |
| `slug` | String | Unik |
| `icon` | String? | Icon/emoji |
| `description` | String? | Deskripsi jenis |
| `createdAt` | Timestamp | |

**Mengapa dibuat:** mencegah asumsi bahwa semua Series adalah kajian kitab. `SeriesType` adalah taksonomi program belajar; `Series` wajib memiliki satu jenis.

**Mengapa scalable:** relasi N:1 sederhana; unique `slug`; index `(seriesTypeId, published)` di `series` untuk filter "semua series published jenis X" tanpa scan penuh.

---

### 3.17 `transcripts`

| Kolom | Tipe | Keterangan |
|---|---|---|
| `id` | String (cuid) | PK |
| `audioId` | FK → audio | |
| `language` | String | Kode bahasa (default `id`) |
| `provider` | Enum | `OPENAI` / `WHISPER` / `MANUAL` |
| `content` | String? | Isi transkrip (null saat pending/processing) |
| `status` | Enum | `PENDING` / `PROCESSING` / `COMPLETED` / `FAILED` |
| `createdAt` / `updatedAt` | Timestamp | |

**Mengapa dibuat:** **tabel ini sudah disiapkan sejak awal** walau belum dipakai di tahap pertama. Fondasi untuk: subtitle, AI search, ringkasan AI, pencarian isi kajian, highlight kata tertentu, dan terjemahan. `provider` dibuat enum sehingga transkripsi bisa berganti engine (OpenAI → Whisper → manual) tanpa mengubah skema.

**Mengapa scalable:** unique `(audioId, language)` — satu transkrip per bahasa per audio, mencegah duplikat saat retry transkripsi. `content` hanya diisi saat `COMPLETED`; transkrip besar dibaca **per-permintaan** (bukan join default dengan audio). Index `(audioId, status)` untuk job queue "ambil transkrip pending/processing".

---

### 3.18 `attachments`

| Kolom | Tipe | Keterangan |
|---|---|---|
| `id` | String (cuid) | PK |
| `audioId` | FK → audio | |
| `type` | Enum | `PDF` / `EBOOK` / `KITAB` / `SLIDE` / `GAMBAR` / `REFERENSI` / `LINK_EKSTERNAL` |
| `title` | String | Judul lampiran |
| `url` | String | URL/lokasi berkas |
| `fileSize` | Int? | Byte; `null` untuk link eksternal |
| `createdAt` | Timestamp | |

**Mengapa dibuat:** menghubungkan satu audio dengan banyak materi pendukung (kitab, slide, gambar, referensi). Lampiran boleh banyak per audio dan beragam tipe.

**Mengapa scalable:** `type` enum terdefinisi rapi; index `(audioId, type)` untuk "semua lampiran audio X dikelompokkan per tipe". File tidak disimpan di Supabase (konsisten dengan prinsip metadata-only) — hanya URL + ukuran.

---

### 3.19 `audio_references`

| Kolom | Tipe | Keterangan |
|---|---|---|
| `id` | String (cuid) | PK |
| `audioId` | FK → audio | |
| `startSecond` | Int | Posisi mulai (detik) |
| `endSecond` | Int? | Posisi akhir; `null` = penanda titik (end = start) |
| `type` | Enum | `QURAN` / `HADITH` / `KITAB` / `ARTICLE` / `QUOTE` / `NOTE` |
| `title` | String? | Judul singkat referensi |
| `reference` | String? | Kutipan rujukan (mis. "HR. Bukhari no. 52", "Majmu' Fatawa jilid 8 hal. 211") |
| `content` | String? | Isi/teks pendukung (ayat, matan, terjemahan) |
| `createdAt` | Timestamp | |

**Mengapa dibuat:** referensi ilmiah **terikat posisi waktu** — saat audio diputar pada menit tertentu, website menampilkan dalil/hadits/rujukan yang sedang dibahas. Ini adalah fitur khas "belajar syar'i" yang tidak dimiliki platform podcast umum.

**Mengapa scalable:**
- Tidak ada join ke tabel ayat/hadits karena referensi bersifat teks (belum perlu database ayat terpisah; cukup struktur fleksibel). Bila database rujukan besar dibangun nanti, `reference` cukup diganti dengan `referenceId` + tabel rujukan — tanpa mengubah audio.
- Index `(audioId, startSecond)` → ambil semua referensi aktif satu audio, diurutkan posisi, satu index scan.
- Tabel bernama `audio_references` (bukan `references`) karena `REFERENCES` adalah kata cadangan SQL — menghindari kutipan/escaping di seluruh query.

---

### 3.20 `highlights`

| Kolom | Tipe | Keterangan |
|---|---|---|
| `id` | String (cuid) | PK |
| `audioId` | FK → audio | |
| `startSecond` | Int | Posisi mulai |
| `endSecond` | Int? | Posisi akhir; `null` = titik |
| `title` | String | "Faedah Penting", "Kesimpulan", "Peringatan" |
| `description` | String? | Penjelasan highlight |
| `createdAt` | Timestamp | |

**Mengapa dibuat:** highlight adalah **penanda kurasi admin**, sengaja dipisah dari Bookmark yang dibuat user. Konsepnya seperti "tanda poin penting" yang disuntik editor ke dalam audio.

**Mengapa scalable:** `description` bersifat opsional (banyak highlight cukup judul pendek); index `(audioId, startSecond)` untuk daftar highlight satu audio; tanpa relasi ke user sehingga jumlah baris = jumlah kurasi admin, bukan jumlah user.

---

### 3.21 `chapters`

| Kolom | Tipe | Keterangan |
|---|---|---|
| `id` | String (cuid) | PK |
| `audioId` | FK → audio | |
| `urutan` | Int | Urutan chapter |
| `title` | String | "Pembukaan", "Muqaddimah", "Dalil", "Tanya Jawab" |
| `startSecond` | Int | Mulai |
| `endSecond` | Int? | Akhir; `null` = sampai akhir audio / start chapter berikutnya |
| `createdAt` | Timestamp | |

**Mengapa dibuat:** audio panjang butuh navigasi. Chapter memungkinkan lompat langsung ke bagian — seperti "episode marker" di Apple Podcasts/YouTube.

**Mengapa scalable:** unique `(audioId, urutan)` mencegah urutan ganda dan jadi index alami; `endSecond` nullable sehingga chapter terakhir tidak wajib di-update saat durasi audio berubah; index `(audioId, startSecond)` untuk daftar chapter terurut.

---

### 3.22 `related_contents`

| Kolom | Tipe | Keterangan |
|---|---|---|
| `id` | String (cuid) | PK |
| `seriesId` | FK → series | |
| `targetType` | Enum | `ARTICLE` / `EBOOK` / `VIDEO` / `ACADEMY` / `QA` / `EXTERNAL` |
| `targetId` | String | Id konten target (atau URL untuk `EXTERNAL`) |
| `sortOrder` | Int | Urutan tampil |
| `createdAt` | Timestamp | |

**Mengapa dibuat:** menghubungkan sebuah Series dengan konten lain di seluruh ekosistem MSI. **Polimorfik** — `target_type` + `target_id` menunjuk ke tabel mana pun, atau ke URL eksternal, **tanpa FK dan tanpa kolom spesifik per produk**. Karena tidak ada referensi langsung ke tabel tertentu, saat produk baru muncul (mis. Academy) **tabel ini tidak berubah** — cukup menambah nilai enum `targetType`.

**Mengapa scalable:**
- Tidak ada FK ke target → tidak ada ketergantungan antar skema produk; konten lintas domain cukup menjadi string id/slug.
- Index `(seriesId, sortOrder)` untuk "semua konten terkait sebuah series, urut tampil".
- Index `(targetType, targetId)` untuk reverse lookup "series mana yang menautkan ke konten X".
- Konsistensi `targetId` dijaga di lapisan aplikasi (validasi saat insert), bukan constraint DB — kompromi standar untuk relasi polimorfik.

---

## 4. Keputusan Referential Action (Cascade)

Kebijakan umum: **data konten dilindungi (Restrict), data personal pengikut di-Cascade (ikut hilang), dan "referensi opsional" di-SetNull.**

| Relasi | Aksi | Alasan |
|---|---|---|
| `Series.seriesType → SeriesType` | **RESTRICT** | Mencegah penghapusan jenis yang masih dipakai series secara tidak sengaja. |
| `Series.audio → Series` | **RESTRICT** | Mencegah penghapusan series yang masih punya audio secara tidak sengaja (bisa menghapus ribuan sesi). Hapus audio satu per satu dulu. |
| `UserProgress.series` | CASCADE | Progress tanpa series = sampah. |
| `UserProgress.user` | CASCADE | Hapus user → hapus progresnya (privasi / GDPR-style). |
| `UserProgress.lastAudio` | **SET NULL** | Audio bisa dihapus tanpa merusak progress; posisi terakhir boleh kosong. |
| `ListeningHistory.user` | CASCADE | Riwayat user ikut terhapus. |
| `ListeningHistory.audio` | CASCADE | Riwayat audio yang dihapus tidak berguna. |
| `Bookmark.user` | CASCADE | Data personal ikut user. |
| `Bookmark.audio` | CASCADE | Bookmark ke audio yang sudah dihapus = nyasar. |
| `Note.user` | CASCADE | Data personal ikut user. |
| `Note.audio` | CASCADE | Catatan ke audio yang dihapus = nyasar. |
| `FavoriteSeries.user` | CASCADE | Data personal ikut user. |
| `FavoriteSeries.series` | CASCADE | Favorit tanpa series = sampah. |
| `MediaSource.audio` | CASCADE | Sumber media tanpa audio tidak bermakna. |
| `Transcript.audio` | CASCADE | Transkrip tanpa audio tidak bermakna. |
| `Attachment.audio` | CASCADE | Lampiran tanpa audio tidak bermakna. |
| `Reference.audio` | CASCADE | Referensi posisi-waktu tanpa audio tidak bermakna. |
| `Highlight.audio` | CASCADE | Highlight tanpa audio tidak bermakna. |
| `Chapter.audio` | CASCADE | Chapter tanpa audio tidak bermakna. |
| `RelatedContent.series` | CASCADE | Tautan konten tanpa series = sampah. |
| `SeriesSpeaker.series` | CASCADE | Pivot ikut series terhapus. |
| `SeriesSpeaker.speaker` | CASCADE | Pivot ikut speaker terhapus. |
| `SeriesCategory.series` | CASCADE | Pivot ikut series terhapus. |
| `SeriesCategory.category` | CASCADE | Pivot ikut kategori terhapus. |
| `SeriesTag.series` | CASCADE | Pivot ikut series terhapus. |
| `SeriesTag.tag` | CASCADE | Pivot ikut tag terhapus. |

> **Catatan operasional:** untuk menghapus series yang punya banyak audio, gunakan soft-delete (`published = false`) atau hapus audio via proses batch, bukan RESTRICT yang membuatnya mustahil. RESTRICT hanya mencegah **penghapusan tidak sengaja dalam satu perintah**; admin flow bisa melakukan hapus eksplisit berurutan.

---

## 5. Unique Constraint

| Tabel | Unique | Alasan |
|---|---|---|
| `users` | `email` | Satu akun per email. |
| `speakers` | `slug` | URL bersih & bebas duplikat. |
| `categories` | `slug` | URL bersih & bebas duplikat. |
| `tags` | `slug` | URL bersih & bebas duplikat. |
| `series` | `slug` | URL bersih & bebas duplikat. |
| `series_types` | `slug` | URL bersih & bebas duplikat. |
| `audio` | `slug` | URL bersih & bebas duplikat. |
| `audio` | `(seriesId, nomorSesi)` | Tidak ada nomor sesi ganda dalam satu series; juga jadi index untuk urut sesi. |
| `media_sources` | `(provider, providerId)` | Satu sumber fisik hanya boleh satu baris; mencegah duplikat saat admin paste ulang URL YouTube yang sama. |
| `transcripts` | `(audioId, language)` | Satu transkrip per bahasa per audio; mencegah duplikat saat retry transkripsi. |
| `chapters` | `(audioId, urutan)` | Satu chapter per urutan dalam satu audio; sekaligus index urutan. |
| `user_progress` | `(userId, seriesId)` | Satu progres per user per series. |
| `listening_history` | `(userId, audioId)` | Satu baris state per pasangan (basis desain ringkas, lihat §3.9). |
| `bookmarks` | `(userId, audioId)` | Bookmark ganda tidak masuk akal. |
| `favorite_series` | `(userId, seriesId)` | Favorit ganda tidak masuk akal. |
| `series_speakers` | PK `(seriesId, speakerId)` | Satu pemateri tidak boleh duplikat di series sama. |
| `series_categories` | PK `(seriesId, categoryId)` | Satu kategori tidak boleh duplikat di series sama. |
| `series_tags` | PK `(seriesId, tagId)` | Satu tag tidak boleh duplikat di series sama. |

> `notes` **tidak** diberi unique — banyak catatan per (user, audio) di posisi berbeda adalah perilaku yang diinginkan.

---

## 6. Index — Daftar & Alasan

| Tabel | Index | Alasan |
|---|---|---|
| `users` | PK (`id`) + unique (`email`) | Login & lookup. |
| `speakers` | `(status)` | Filter daftar speaker aktif. |
| `series` | `(published, createdAt)` | Halaman home & daftar series: "published terbaru". |
| `series` | `(seriesTypeId, published)` | Filter "semua series published dari satu jenis" tanpa scan penuh. |
| `audio` | `(seriesId, published, nomorSesi)` | Query paling sering: daftar sesi published sebuah series, terurut nomor sesi. |
| `audio` | `(published, createdAt)` | Feed "kajian terbaru" lintas series. |
| `media_sources` | `(audioId)` | Ambil semua sumber sebuah audio. |
| `media_sources` | unique `(provider, providerId)` | Dedupe + lookup sumber berdasarkan identitas provider. |
| `transcripts` | `(audioId, status)` | Job queue transkripsi: ambil transkrip pending/processing per audio. |
| `attachments` | `(audioId, type)` | "Semua lampiran audio X" dikelompokkan per tipe. |
| `audio_references` | `(audioId, startSecond)` | Semua referensi aktif satu audio, terurut posisi waktu. |
| `highlights` | `(audioId, startSecond)` | Semua highlight satu audio, terurut posisi. |
| `chapters` | `(audioId, startSecond)` | Daftar chapter satu audio, terurut posisi. |
| `related_contents` | `(seriesId, sortOrder)` | Semua konten terkait satu series, urut tampil. |
| `related_contents` | `(targetType, targetId)` | Reverse lookup: "series mana yang menautkan ke konten X". |
| `user_progress` | `(userId, updatedAt)` | "Lanjutkan belajar" — urut paling baru diputar. |
| `user_progress` | unique `(userId, seriesId)` | Lookup progres spesifik + mencegah duplikat. |
| `listening_history` | `(userId, lastPlayedAt)` | Halaman riwayat: terakhir diputar dulu. |
| `listening_history` | `(userId, audioId, completed)` | Filter "belum selesai" per user (mencakup continue listening). |
| `bookmarks` | `(userId, createdAt)` | Halaman bookmark terurut waktu. |
| `notes` | `(userId, audioId)` | Semua catatan sebuah audio untuk user. |
| `notes` | `(userId, updatedAt)` | Catatan terbaru user. |
| `favorite_series` | `(userId, createdAt)` | Daftar series favorit terurut. |
| `series_speakers` | `(speakerId)` | Reverse lookup: "semua series pemateri X". |
| `series_categories` | `(categoryId)` | Reverse lookup: "semua series kategori X". |
| `series_tags` | `(tagId)` | Reverse lookup: "semua series tag X". |

**Prinsip:** setiap kolom yang sering dipakai di `WHERE`, `ORDER BY`, atau `JOIN` di-index. Index komposit disusun **kardinalitas-descending** (filter sempit dulu) dan mencakup kolom `ORDER BY` agar bisa index-scan murni tanpa sort.

---

## 7. Ringkasan Relasi

```
User 1─N UserProgress N─1 Series
User 1─N ListeningHistory N─1 Audio
User 1─N Bookmark N─1 Audio
User 1─N Note N─1 Audio
User 1─N FavoriteSeries N─1 Series
Series N─1 SeriesType
Series 1─N RelatedContent (polimorfik)
Series 1─N Audio 1─N MediaSource
Series 1─N Audio 1─N Transcript
Series 1─N Audio 1─N Attachment
Series 1─N Audio 1─N Reference
Series 1─N Audio 1─N Highlight
Series 1─N Audio 1─N Chapter
Series 1─N SeriesSpeaker N─1 Speaker
Series 1─N SeriesCategory N─1 Category
Series 1─N SeriesTag N─1 Tag
UserProgress N─1 Audio (lastAudio, nullable, SET NULL)
```

---

## 8. Strategi Skalabilitas

### 8.1 Target Volume (didesain untuk)
| Beban | Volume | Kesiapan desain |
|---|---|---|
| Series | puluhan ribu | Denormalisasi `totalSesi`/`totalDurasi`, index `(published, createdAt)`. |
| Audio | ratusan ribu | Unique `(seriesId, nomorSesi)`, index komposit. |
| Progress/Bookmark/History | jutaan | Satu baris per pasangan (tabel ringkas), index per-user. |

### 8.2 Teknik Skalabilitas yang Diterapkan
1. **Tabel ringkas, bukan log tak terbatas** — `listening_history` di-upsert per (user, audio), bukan append. Ini mencegah pertumbuhan kuadratik dan menjaga semua query "per user" tetap kecil.
2. **Denormalisasi counter** — `totalSesi`, `totalDurasi`, `completedCount`, `progressPercent` disimpan agar daftar dan dashboard tidak butuh agregasi mahal. Dirawat via transaksi saat data berubah (lihat §8.4).
3. **Index komposit tepat** — semua pola akses yang disebut di §6 bisa index-only scan.
4. **No-N+1** — di aplikasi, gunakan `include`/`select` Prisma yang dimuat bersamaan; hindari query berulang dalam loop.
5. **Slug & cuid** — cuid (id string terdistribusi) menghindari prediksi/konflik saat ditulis dari banyak instance Vercel; slug unik untuk cache URL yang stabil.
6. **Pagination cursor** — untuk daftar besar (riwayat, hasil search) gunakan cursor-based pagination, bukan `OFFSET`, agar tidak melambat di halaman dalam.

### 8.3 Saat Volume Sangat Besar (Milestone Lanjutan)
- **Partisi PostgreSQL** untuk `listening_history` & `notes` berdasarkan hash `userId` atau range `lastPlayedAt` (perlu dilakukan sejak awal desain agar `userId` selalu jadi filter pertama — desain sudah memenuhi).
- **Materialized view** untuk halaman home/feed (paling lambat dan paling sering diakses) — refresh berkala dari Supabase cron.
- **Search engine terpisah** (Meilisearch/Typesense) bila pencarian FTS Postgres tidak lagi cukup; sementara itu, gunakan `pg_trgm` di Supabase untuk pencarian fuzzy judul/nama.
- **Read replica** bila rasio baca:tulis sangat tinggi.

### 8.4 Memelihara Denormalisasi (Pola yang Disarankan)
| Peristiwa | Perbaikan counter |
|---|---|
| Audio dibuat/dipublish | `series.totalSesi` & `totalDurasi` +1 / +durasi |
| Audio dihapus/unpublish | counter -1 / -durasi |
| `ListeningHistory.completed` berubah `true` | `user_progress.completedCount` +1, `progressPercent` dihitung ulang |
| User memutar posisi baru | `user_progress.positionSeconds` + `lastAudioId` di-update |

Gunakan **transaksi database** (Prisma `$transaction`) agar counter dan baris anak selalu konsisten. Alternatif: job async (Vercel Cron + Supabase) yang merecompute berkala sebagai jaring pengaman.

---

## 9. Naming Convention

- Prisma field: `camelCase` (mengikuti rekomendasi Prisma).
- Kolom DB: `snake_case` via `@map()`.
- Nama tabel: `snake_case` plural via `@@map()`.
- Enum: `UPPER_SNAKE_CASE`.
- `id` = `cuid()` (string, aman untuk cache/CDN, tidak bisa ditebak).
- Timestamp: `createdAt`/`updatedAt` dengan `@default(now())` & `@updatedAt`.

---

## 10. Langkah Inisialisasi (Ringkas, bukan implementasi UI)

1. Buat project Supabase, salin `DATABASE_URL` ke `.env`.
2. `npx prisma migrate dev --name init` → membuat skema di Supabase.
3. `npx prisma migrate deploy` di production.
4. Buat user admin via seed script (Prisma `seed`).
5. `npx prisma generate` untuk client.

> Skema ini **tidak** menyentuh frontend, API, maupun player — murni lapisan data.

---

## 11. Future-Proof: Menambah Provider Audio Baru

Tidak ada kode yang diubah di `Audio` maupun data lama.

```prisma
enum MediaProvider {
  YOUTUBE
  CLOUDFLARE_R2
  BUNNY_CDN
  BACKBLAZE
  LOCAL_STORAGE
  // NEXT_PROVIDER  ← tambah nilai di sini
}
```

- Tambah nilai enum → migrasi Prisma.
- Admin membuat `MediaSource` baru berisi `providerId`/`url` baru untuk audio yang sama.
- Aplikasi memilih provider sesuai prioritas (mis. yang aktif/tidak kadaluarsa) lewat `metadata`.

---

## 12. Future-Proof: Jenis Konten Baru (Video, Ebook, Artikel, QA, Academy)

Visi jangka panjang MSI Audio: audio → video → ebook → artikel → QA → academy, **saling terhubung**.

Jalur migrasi tanpa merombak schema inti:

1. **Tambahkan `contentType`** pada `Audio` (atau ganti nama menjadi `Content`) — `AUDIO`, `VIDEO`, `EBOOK`, `ARTICLE`, `QA`.
2. **`MediaSource` sudah generic** — cukup ubah FK dari `audioId` menjadi `contentId` (nullable + relasi polymorpic), lalu audio/video/ebook berbagi tabel sumber media yang sama. Struktur `provider`/`providerId`/`url`/`metadata` sudah mendukung semua tipe.
3. **`Transcript` & `Attachment` juga generic** — ubah FK ke `contentId` dengan cara yang sama. Video tetap bisa punya transkrip; ebook/artikel tetap bisa punya lampiran. Fitur AI search, ringkasan, highlight kata, dan terjemahan bekerja lintas jenis konten.
4. **`UserProgress`/`ListeningHistory`** di-rename ke `Progress`/`History` dengan FK ke `Content` — semua fitur belajar (progress, continue, bookmark, catatan) langsung berlaku untuk video/ebook tanpa desain ulang.
5. Pivot `Series*` tetap berlaku — ebook/article juga bisa masuk ke dalam satu Series (kurikulum).
6. **QA/Academy** menambah entitas relasi baru (`ContentQa`, `Enrollment`) yang menempel pada `User` & `Content` yang sudah ada.

Dengan pola ini, kebutuhan "semuanya saling terhubung" tercapai tanpa data migration yang berisiko di tahap awal.

> **Catatan SeriesType:** jenis `SeriesType` yang disediakan (`Kajian Kitab`, `Dauroh`, `Podcast`, `Seminar`, `Tematik`, `Ramadhan`, `Kajian Singkat`) dapat langsung menandai bentuk program — termasuk jenis program non-kitab yang dihadirkan di masa depan.

---

## 13. RelatedContent — Jembatan Ekosistem 5–10 Tahun ke Depan

### 13.1 Mengapa struktur tabel ini dipilih
`RelatedContent` memakai pola **polimorfik ringan**: kolom `targetType` (enum) + `targetId` (string), tanpa FK ke tabel mana pun. Inilah alasan utamanya:

1. **Tanpa FK → tanpa ketergantungan skema.** Saat produk `Academy` lahir 3 tahun lagi, kita tidak perlu membuat FK dari `related_contents` ke `academy_courses`. Cukup tambah nilai enum `ACADEMY`.
2. **Satu tabel untuk semua tautan.** Seluruh graf antar-produk MSI (Series→Artikel, Series→Ebook, Series→Video, Series→QA, Series→Academy, Series→URL eksternal) tersimpan di satu tempat, mudah dibaca, mudah di-*render*.
3. **`targetId` sebagai id/slug/URL.** Untuk konten internal pakai id/slug produk target; untuk `EXTERNAL` cukup URL. Format bebas karena aplikasi yang menerjemahkannya.
4. **`sortOrder` mengontrol urutan kurasi** — bukan urutan alfabetis; editor yang menentukan tampilan tautan.

### 13.2 Mengapa scalable
- Jumlah baris = jumlah tautan kurasi (ratusan ribu), bukan per-user → tetap kecil.
- Query paling umum `WHERE seriesId = ? ORDER BY sortOrder` memakai index `(seriesId, sortOrder)` — index-only scan.
- Reverse lookup (`targetType, targetId`) ber-index, sehingga produk lain bisa meminta "semua series yang menautkan ke artikel ini".
- Beban validasi `targetId` diletakkan di aplikasi, sehingga DB tetap sederhana dan penulisan tetap murah.

### 13.3 Kemungkinan pengembangan tanpa mengubah struktur utama

| Tahun (perkiraan) | Perkembangan | Kebutuhan skema |
|---|---|---|
| 1–2 | Fitur timeline (Reference/Highlight/Chapter) aktif, transkripsi mulai jalan, konten tetap audio | **Tidak ada perubahan inti**; hanya data baru |
| 2–3 | Produk `Artikel`, `Ebook` lahir di ekosistem | `RelatedContent` tambah nilai enum `ARTICLE`/`EBOOK`; `Audio` → `Content` (rename, §12) |
| 3–5 | Produk `Video`, `QA`, `Academy` | `RelatedContent` tambah `VIDEO`/`QA`/`ACADEMY`; entitas baru `ContentQa`, `Enrollment` menempel di `User` & `Content` |
| 5–7 | Pencarian lintas produk (search seluruh ekosistem) | Indeks pencarian (pg_trgm / Meilisearch) membaca `series`, `audio`, `transcripts`, `related_contents` — **tanpa ubah struktur relasional** |
| 7–10 | Academy penuh, sertifikasi, progres lintas kurikulum | `UserProgress` diperluas ke `Content` (satu migrasi FK); `Series` menjadi unit kurikulum induk — struktur inti `Series–Audio–MediaSource` tetap |

**Prinsip kunci 5–10 tahun:** semua perluasan adalah (a) **menambah nilai enum**, (b) **menambah tabel baru** yang menempel pada `User`/`Series`/`Content` yang sudah ada, atau (c) **rename FK** — bukan merombak tabel inti. `Series` sebagai "kurikulum", `RelatedContent` sebagai "jembatan ekosistem", dan `UserProgress` sebagai "kartu rapor" tidak akan pernah berubah bentuk dasarnya.

---

*Dokumen ini menyertai `schema.prisma` (implementasi Prisma yang siap dipakai). Belum ada frontend, API, atau kode aplikasi lain yang dibuat.*
