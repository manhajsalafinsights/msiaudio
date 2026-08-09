# MSI Audio — Admin Routing & Sitemap (Next.js App Router)

**Product Requirement — Admin Routing**

| | |
|---|---|
| Produk | MSI Audio (ekosistem Manhaj Salaf Insights) |
| Scope | Sitemap admin, routing App Router, layout admin, proteksi akses (role), middleware, struktur folder |
| Referensi | `schema.prisma` (model & enum) · `routing.md` (routing publik) · `admin-pages.md` · `admin-wireframe.md` |
| Status | Draft v1.0 — rancangan, bukan kode |

---

## 1. Prinsip Routing Admin

1. **Prefix `/admin`** — seluruh area admin berada di bawah `/admin/*` (bukan route group; prefix URL ini nyata agar mudah dibedakan & diproteksi).
2. **Route group tetap dipakai** untuk memisahkan layout internal admin:
   - `(admin)/(content)` → Content (Series, Audio, Speaker, Category, Tag, Series Type, Attachment)
   - `(admin)/(learning)` → Learning (Chapter, Highlight, Reference, Transcript)
   - `(admin)/(users)` → User (User, Bookmark, Progress, History)
   - `(admin)/(system)` → Media, Analytics, Settings, System
   - Masing-masing group boleh punya `layout.tsx` lokal (mis. tab dalam group) — **tanpa mengubah URL**.
3. **Semua halaman admin Server Component** + `page.tsx` murni komposisi (lihat `architecture.md`).
4. **ID internal memakai `[id]`** (cuid dari Prisma) — admin boleh pakai ID karena tidak SEO-sensitive.
5. **Query string** untuk filter/sort/pagination/search (sama seperti area publik).
6. **Proteksi di dua lapis**: `middleware.ts` (cepat, redirect) + `admin/layout.tsx` (authoritative, render sidebar sesuai role).

---

## 2. Proteksi Akses & Role

Saat ini role yang ada di `schema.prisma`: `Role { ADMIN, USER }`. Untuk admin dibutuhkan pembedaan **Super Admin** vs **Admin**. Dua opsi (diputuskan saat implementasi):

- **Opsional tanpa ubah schema**: semua admin = `ADMIN`; perbedaan Super Admin ditandai kolom `superAdmin Boolean @default(false)` pada User.
- **Evolusi schema (direkomendasikan)**: ganti enum `Role` menjadi `{ SUPER_ADMIN, ADMIN, EDITOR, MODERATOR, CONTENT_MANAGER, TRANSLATOR, USER }` + migrasi.

| Role | Sekarang | Keterangan |
|---|---|---|
| **Super Admin** | ✔ | Akses penuh termasuk System, Settings, Analytics, hapus permanen, kelola admin |
| **Admin** | ✔ | Seluruh Content/Learning/User (lihat), Media, Analytics, Settings non-destruktif |
| Editor | future | Kelola Content & Learning (draft) tanpa Publish/Unpublish |
| Moderator | future | Pantau konten user (Bookmark/Progress/History/Note), laporan |
| Content Manager | future | Workflow publish, kurasi, analytics konten |
| Translator | future | Kelola Transcript (terjemahan) & status transkripsi |

Matriks lengkap per halaman ada di `admin-pages.md` §3. Middleware hanya mengecek `isAdmin`, pembagian detail per-modul dilakukan di halaman/layout.

---

## 3. Route Tree Lengkap

```
audio.manhajsalafinsights.com
│
├── /admin                              → redirect → /admin/dashboard
│
├── /admin/dashboard                    → Dashboard (statistik)
│
├── /admin/series                       → List series            (grup CONTENT)
│   ├── /admin/series/new               → Form buat series
│   └── /admin/series/[id]              → Detail & edit series
│       └── /admin/series/[id]/audio    → Kelola audio dalam series
├── /admin/audio                        → List audio            (grup CONTENT)
│   ├── /admin/audio/new                → Form cepat (paste link YouTube)
│   └── /admin/audio/[id]               → Detail & edit audio
│       ├── /admin/audio/[id]/chapters      → Chapter audio ini
│       ├── /admin/audio/[id]/highlights    → Highlight audio ini
│       ├── /admin/audio/[id]/references    → Reference audio ini
│       ├── /admin/audio/[id]/attachments   → Attachment audio ini
│       └── /admin/audio/[id]/transcripts   → Transcript audio ini
├── /admin/speakers                     → List speaker          (grup CONTENT)
│   ├── /admin/speakers/new
│   └── /admin/speakers/[id]
├── /admin/categories                   → CRUD kategori         (grup CONTENT)
│   ├── /admin/categories/new
│   └── /admin/categories/[id]
├── /admin/tags                         → CRUD tag              (grup CONTENT)
│   ├── /admin/tags/new
│   └── /admin/tags/[id]
├── /admin/series-types                 → CRUD tipe series      (grup CONTENT)
│   ├── /admin/series-types/new
│   └── /admin/series-types/[id]
├── /admin/attachments                  → Library semua attachment
│
├── /admin/learning/transcripts         → List & status transkrip  (grup LEARNING)
│   ├── /admin/learning/transcripts/new      → (future) buat transkrip manual
│   └── /admin/learning/transcripts/[id]     → Detail transkrip
├── /admin/learning/chapters            → (semua chapter, filter audio)
├── /admin/learning/highlights          → (semua highlight, filter audio)
├── /admin/learning/references          → (semua reference, filter audio)
│
├── /admin/users                        → List user             (grup USER)
│   └── /admin/users/[id]               → Detail user (progress, bookmark, history, continue)
│       ├── /admin/users/[id]/progress
│       ├── /admin/users/[id]/bookmarks
│       └── /admin/users/[id]/history
│
├── /admin/media                        → Media Library (cover/gambar)
│
├── /admin/analytics                    → Halaman statistik
│   ├── /admin/analytics/series
│   ├── /admin/analytics/audio
│   ├── /admin/analytics/speakers
│   ├── /admin/analytics/categories
│   ├── /admin/analytics/listening-time
│   └── /admin/analytics/progress
│
├── /admin/settings                     → redirect → /admin/settings/general
│   ├── /admin/settings/general
│   ├── /admin/settings/seo
│   ├── /admin/settings/logo
│   ├── /admin/settings/social
│   ├── /admin/settings/analytics
│   └── /admin/settings/youtube
│
├── /admin/system                       → redirect → /admin/system/health
│   ├── /admin/system/health
│   ├── /admin/system/version
│   ├── /admin/system/migrations
│   └── /admin/system/environment
│
└── /admin/404                          → Halaman tidak ditemukan (admin)
```

---

## 4. Struktur App Router

```
app/
├── middleware.ts               # Cek session + role untuk /admin/*
│
├── admin/
│   ├── layout.tsx              # ADMIN LAYOUT — sidebar + topbar + auth guard
│   ├── page.tsx                # redirect → /admin/dashboard
│   ├── not-found.tsx           # 404 area admin
│   │
│   ├── dashboard/
│   │   └── page.tsx
│   │
│   ├── (content)/
│   │   ├── layout.tsx          # optional: tab group content
│   │   ├── series/
│   │   │   ├── page.tsx        # list
│   │   │   ├── new/page.tsx    # create
│   │   │   └── [id]/
│   │   │       ├── page.tsx    # detail/edit
│   │   │       └── audio/
│   │   │           └── page.tsx
│   │   ├── audio/
│   │   │   ├── page.tsx
│   │   │   ├── new/page.tsx    # form cepat (paste YT link)
│   │   │   └── [id]/
│   │   │       ├── page.tsx    # edit utama
│   │   │       ├── chapters/page.tsx
│   │   │       ├── highlights/page.tsx
│   │   │       ├── references/page.tsx
│   │   │       ├── attachments/page.tsx
│   │   │       └── transcripts/page.tsx
│   │   ├── speakers/
│   │   │   ├── page.tsx
│   │   │   ├── new/page.tsx
│   │   │   └── [id]/page.tsx
│   │   ├── categories/
│   │   │   ├── page.tsx
│   │   │   ├── new/page.tsx
│   │   │   └── [id]/page.tsx
│   │   ├── tags/
│   │   │   ├── page.tsx
│   │   │   ├── new/page.tsx
│   │   │   └── [id]/page.tsx
│   │   ├── series-types/
│   │   │   ├── page.tsx
│   │   │   ├── new/page.tsx
│   │   │   └── [id]/page.tsx
│   │   └── attachments/
│   │       └── page.tsx        # library semua attachment
│   │
│   ├── (learning)/
│   │   ├── transcripts/
│   │   │   ├── page.tsx        # list + filter status
│   │   │   ├── new/page.tsx    # (future)
│   │   │   └── [id]/page.tsx   # detail / proses ulang
│   │   ├── chapters/page.tsx   # semua chapter (filter by audio)
│   │   ├── highlights/page.tsx
│   │   └── references/page.tsx
│   │
│   ├── (users)/
│   │   ├── users/
│   │   │   ├── page.tsx
│   │   │   └── [id]/
│   │   │       ├── page.tsx    # ringkasan + tab
│   │   │       ├── progress/page.tsx
│   │   │       ├── bookmarks/page.tsx
│   │   │       └── history/page.tsx
│   │   └── (tidak ada bookmark/progress/history global —
│   │        selalu dalam konteks user)
│   │
│   ├── (system)/
│   │   ├── media/
│   │   │   ├── page.tsx        # media library
│   │   │   └── [id]/page.tsx   # detail media (future)
│   │   ├── analytics/
│   │   │   ├── page.tsx        # ringkasan (redirect ke section / render ringkasan)
│   │   │   ├── series/page.tsx
│   │   │   ├── audio/page.tsx
│   │   │   ├── speakers/page.tsx
│   │   │   ├── categories/page.tsx
│   │   │   ├── listening-time/page.tsx
│   │   │   └── progress/page.tsx
│   │   ├── settings/
│   │   │   ├── page.tsx        # redirect → general
│   │   │   ├── general/page.tsx
│   │   │   ├── seo/page.tsx
│   │   │   ├── logo/page.tsx
│   │   │   ├── social/page.tsx
│   │   │   ├── analytics/page.tsx
│   │   │   └── youtube/page.tsx
│   │   └── system/
│   │       ├── page.tsx        # redirect → health
│   │       ├── health/page.tsx
│   │       ├── version/page.tsx
│   │       ├── migrations/page.tsx
│   │       └── environment/page.tsx
```

### Kenapa bukan route group `(admin)`?
Route group Next.js **tidak mengubah URL**. Agar URL menjadi `/admin/...` dibutuhkan folder nyata `app/admin/`. Group dipakai hanya di dalamnya untuk memisahkan layout sub-area (content/learning/users/system) bila diperlukan.

---

## 5. Layout Mapping

| Halaman | Admin Layout (sidebar) | Sub-layout | Proteksi |
|---|---|---|---|
| Dashboard | ✔ | — | Admin |
| Series, Audio, Speaker, Category, Tag, Series Type, Attachment | ✔ | (content) | Admin |
| Chapter, Highlight, Reference, Transcript | ✔ | (learning) | Admin |
| User + detail | ✔ | (users) | Admin (data pribadi) |
| Media, Analytics, Settings | ✔ | (system) | Admin |
| System | ✔ | (system) | **Super Admin only** |

---

## 6. Query Parameter

| Halaman | Parameter | Nilai | Keterangan |
|---|---|---|---|
| List (series, audio, speaker, dst.) | `q` | teks | pencarian |
| | `status` | `published` \| `draft` \| `all` | filter publish (series/audio) |
| | `seriesId` | id | filter audio per series |
| | `type` / `kategori` / `tag` / `speaker` | id/slug | filter taksonomi |
| | `sort` | `terbaru` \| `terlama` \| `az` \| `updated` | sorting |
| | `page` | angka | pagination |
| | `perPage` | `10` \| `25` \| `50` | jumlah per halaman |
| Transcript | `status` | `pending` \| `processing` \| `completed` \| `failed` | filter status |
| | `language` | `id` \| `ar` \| `en` | filter bahasa |
| Audio Detail | `tab` | `edit` \| `chapters` \| `highlights` \| `references` \| `attachments` \| `transcripts` | tab dalam detail audio |
| User Detail | `tab` | `ringkasan` \| `progress` \| `bookmarks` \| `history` | tab user |
| Analytics | `range` | `7` \| `30` \| `90` \| `365` | hari |
| Media | `type` | `cover` \| `foto` \| `dokumen` | jenis file |
| Auth redirect | `next` | URL asal | kembali setelah login |

---

## 7. Naming Convention

| Aturan | Contoh |
|---|---|
| Prefix selalu `/admin` | `/admin/audio/[id]` |
| Resource jamak untuk list | `/admin/speakers` |
| Sub-resource dalam resource induk | `/admin/audio/[id]/chapters` |
| Aksi membuat memakai segment `new` | `/admin/series/new` |
| ID memakai `[id]` (cuid) | `/admin/series/[id]` |
| Settings & System memakai sub-segment berlabel | `/admin/settings/youtube` |

---

## 8. Middleware & Alur Auth

```
Request /admin/*
    │
    ▼
middleware.ts (edge, cepat)
    ├── belum login        → redirect /login?next=/admin/...
    ├── login tapi USER    → redirect / (bukan admin)
    └── login & ADMIN      → lanjut
        │
        ▼
admin/layout.tsx (server, authoritative)
    ├── cek ulang session + role (anti-bypass)
    ├── role Super Admin → render item System di sidebar
    ├── role Admin       → System disembunyikan
    └── render sidebar + topbar + <Outlet> (children)
```

- Middleware hanya gerbang cepat; **keputusan akhir selalu di Server Component** (layout/halaman) yang membaca session.
- `admin/system/*` punya guard tambahan: halaman `page.tsx` memanggil `requireRole("SUPER_ADMIN")` → `403`/redirect bila bukan Super Admin.
- Aksi mutasi (server action) juga mewajibkan ulang cek role — tidak cukup hanya menyembunyikan tombol UI.

---

## 9. 404 & Error Admin

| File | Fungsi |
|---|---|
| `admin/not-found.tsx` | 404 dalam area admin (tetap menampilkan sidebar) |
| `admin/error.tsx` | Error boundary admin — pesan + "Coba Lagi", layout tetap utuh |
| `admin/loading.tsx` | Skeleton halaman admin saat navigasi |
| `admin/global-error.tsx` | Error fatal (opsional, bisa fallback ke root) |

- Slug/id tidak ditemukan → `notFound()` dari `page.tsx` (menampilkan 404 admin dengan tombol kembali ke list).
- Aksi gagal (server action) → toast/inline error di form, data tidak hilang.

---

## 10. Future Route (diperluas saat role baru)

| Fitur | Route |
|---|---|
| Editor draft | `/admin/content/drafts` (semua item draft lintas modul) |
| Moderator | `/admin/moderation` (laporan/label konten user) |
| Translator | `/admin/learning/translations` (list terjemahan per bahasa) |
| Media detail | `/admin/media/[id]` |
| Backup/Export | `/admin/system/backup` |
| Audit log | `/admin/system/audit-log` (siapa mengubah apa) |

---

*Dokumen ini menyertai `admin-pages.md` dan `admin-wireframe.md`. Belum ada kode, halaman, atau API yang diimplementasikan.*
