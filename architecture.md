# MSI Audio — Arsitektur Project (Next.js)

**Product Requirement — Architecture Document**

| | |
|---|---|
| Produk | MSI Audio (ekosistem Manhaj Salaf Insights) |
| Stack | Next.js (App Router) · TypeScript · Tailwind CSS · Prisma · Supabase · NextAuth/Better Auth · React Hook Form · Zod · TanStack Query · Zustand |
| Scope | Struktur folder, arsitektur, penempatan file, naming convention, scalability, best practice |
| Status | Draft v1.0 — dokumen acuan sebelum implementasi |

---

## 1. Ringkasan & Prinsip Arsitektur

MSI Audio disusun dengan pola **Feature-Based + Layered Architecture**:

1. **`app/` hanya berisi definisi route** (halaman, layout, route handlers) — setipis mungkin.
2. **`features/` berisi modul fitur vertikal** — tiap fitur memiliki komponen, hook, action, service, type, dan validasinya sendiri.
3. **`repositories/` adalah satu-satunya tempat query database** (Prisma/Supabase).
4. **`services/` adalah tempat business logic** — baik logika per fitur maupun orkestrasi lintas fitur.
5. **`lib/` berisi infrastruktur murni** (prisma, supabase, auth, youtube, logger, config) — tanpa logika bisnis.
6. **Komponen dibedakan** menjadi: UI primitif, layout, shared business, dan feature component.
7. **Satu arah dependensi** — lapisan atas boleh memakai lapisan bawah, tidak sebaliknya (lihat §5).
8. **Aman untuk masa depan** — arsitektur ini dirancang agar menambah Video/Ebook/Artikel/Academy/Tanya Jawab/Mobile App **tanpa merombak struktur folder inti**.

---

## 2. Struktur Folder Lengkap

```
msi-audio/
├── app/                                  # ROUTE DEFINITIONS ONLY — tipis
├── components/                           # KOMPONEN SHARED (lintas fitur)
├── features/                             # MODUL FITUR VERTIKAL
├── lib/                                  # INFRASTRUKTUR (tanpa bisnis logic)
├── services/                             # BUSINESS LOGIC / orkestrasi
├── repositories/                         # DATA ACCESS (query DB)
├── hooks/                                # HOOK GENERIC (global)
├── providers/                            # PROVIDER GLOBAL
├── types/                                # TYPES SHARED (lintas fitur)
├── validation/                           # ZOD SCHEMA SHARED
├── utils/                                # FUNGSI PURE
├── prisma/                               # SCHEMA + MIGRASI + SEED
├── jobs/                                 # (future) background jobs / worker
├── public/                               # ASSET STATIS
├── middleware.ts                         # edge middleware (auth gate)
├── next.config.ts
├── tsconfig.json
├── tailwind.config.ts
├── components.json                       # shadcn/ui (jika dipakai)
├── .env.example
├── .env.local                            # gitignored
├── .gitignore
└── package.json
```

---

## 3. Struktur Folder Detail (per Subfolder)

### 3.1 `app/` — Route Only

```
app/
├── (public)/                             # route publik (tanpa layout khusus)
│   ├── page.tsx                          # Home
│   ├── series/
│   │   ├── page.tsx
│   │   └── [slug]/page.tsx
│   ├── audio/
│   │   └── [slug]/page.tsx
│   ├── speaker/
│   │   ├── page.tsx
│   │   └── [slug]/page.tsx
│   ├── category/
│   │   ├── page.tsx
│   │   └── [slug]/page.tsx
│   ├── tag/[slug]/page.tsx
│   ├── search/page.tsx
│   ├── about/page.tsx
│   └── terms/page.tsx
├── (auth)/                               # route auth (layout tanpa header utama)
│   ├── layout.tsx
│   ├── login/page.tsx
│   ├── register/page.tsx
│   └── forgot-password/page.tsx
├── (account)/                            # route user login (protected)
│   ├── layout.tsx
│   ├── bookmark/page.tsx
│   ├── history/page.tsx
│   ├── progress/page.tsx
│   ├── profile/page.tsx
│   └── settings/page.tsx
├── (admin)/                              # route admin (protected + role)
│   ├── layout.tsx
│   ├── dashboard/page.tsx
│   ├── series/page.tsx
│   ├── audio/page.tsx
│   ├── speaker/page.tsx
│   ├── category/page.tsx
│   ├── tag/page.tsx
│   ├── transcript/page.tsx
│   └── settings/page.tsx
├── api/                                  # ROUTE HANDLERS (REST / webhook)
│   └── v1/
│       ├── health/route.ts
│       ├── series/route.ts
│       ├── series/[slug]/route.ts
│       ├── audio/route.ts
│       └── search/route.ts
├── layout.tsx                            # root layout
├── global-error.tsx                      # error boundary global
├── not-found.tsx
├── loading.tsx
├── robots.ts
├── sitemap.ts
└── globals.css
```

**Aturan:**
- Halaman di `app/` **tidak boleh** berisi logika bisnis — hanya compose komponen dari `features/`.
- `page.tsx` bertugas: fetch data via server action/repository *(langsung melalui service)*, lalu me-render komponen feature.
- Route group `(public)`, `(auth)`, `(account)`, `(admin)` memisahkan layout & proteksi per area.
- Nama segmen route: `kebab-case`, dinamis pakai `[slug]`.

### 3.2 `components/` — Shared

```
components/
├── ui/                                   # UI PRIMITIVES (design system)
│   ├── button.tsx
│   ├── input.tsx
│   ├── card.tsx
│   ├── badge.tsx
│   ├── modal.tsx
│   ├── skeleton.tsx
│   ├── toast.tsx
│   └── ...
├── layouts/                              # LAYOUT COMPONENT
│   ├── site-header.tsx
│   ├── site-footer.tsx
│   ├── app-shell.tsx                     # shell area user login
│   ├── admin-shell.tsx                   # shell admin
│   └── player-bar.tsx                    # bar player global (menempel)
└── shared/                               # SHARED BUSINESS COMPONENT (lintas fitur)
    ├── audio-card.tsx
    ├── series-card.tsx
    ├── speaker-avatar.tsx
    ├── empty-state.tsx
    ├── pagination.tsx
    ├── search-input.tsx
    └── ...
```

**Aturan:**
- `ui/` = primitif, tanpa logika bisnis, tanpa data dari server. (Disarankan berbasis shadcn/ui agar konsisten & scalable.)
- `layouts/` = kerangka layout yang dipakai lintas halaman.
- `shared/` = komponen bisnis yang dipakai oleh **lebih dari satu feature**. Jika hanya dipakai satu feature → letakkan di dalam feature tersebut (mencegah feature import menyilang).
- Tidak ada komponen "halaman lengkap" di sini — itu milik `features/`.

### 3.3 `features/` — Modul Fitur

```
features/
├── audio/
├── series/
├── speaker/
├── category/
├── tag/
├── bookmark/
├── history/
├── progress/
├── note/
├── reference/
├── highlight/
├── chapter/
├── transcript/
├── attachment/
├── related-content/
├── player/                               # PLAYER MODULE (disiapkan, belum diimplementasi)
├── auth/
├── search/
└── admin/
```

Setiap feature memiliki **struktur konsisten** (detail di §9):

```
features/<nama-feature>/
├── components/       # komponen khusus feature
├── hooks/            # custom hook khusus feature
├── actions/          # server actions feature (thin, memanggil service)
├── services/         # business logic khusus feature (opsional — lihat aturan)
├── types/            # tipe khusus feature
├── validation/       # zod schema khusus feature
├── store/            # zustand store khusus feature (jika ada)
└── context/          # react context khusus feature (jika ada)
```

**Aturan:**
- Feature adalah **vertical slice**: ia membawa sendiri UI + hook + action + tipe + validasi.
- **Dilarang** import antar *sibling feature* (mis. `features/bookmark` import `features/audio`). Solusinya:
  - Komponen bersama → pindah ke `components/shared/`.
  - Logika bersama → pindah ke `services/` atau `repositories/`.
  - Tipe bersama → `types/` atau `validation/`.
- Fitur besar boleh punya subfolder fitur (contoh admin: `features/admin/series/`, `features/admin/audio/`).

### 3.4 `lib/` — Infrastruktur

```
lib/
├── prisma/
│   ├── client.ts                          # PrismaClient singleton
│   └── extensions.ts                      # soft-delete/auto-timestamp extension (opsional)
├── supabase/
│   ├── client.ts                          # Supabase client (browser)
│   └── server.ts                          # Supabase admin/service client (server only)
├── auth/                                  # AUTH ADAPTER — swappable
│   ├── interface.ts                       # kontrak AuthAdapter (NextAuth | BetterAuth)
│   ├── next-auth.ts                       # implementasi NextAuth
│   ├── better-auth.ts                     # implementasi Better Auth (cadangan)
│   ├── session.ts                         # getSession, getCurrentUser, requireUser, requireAdmin
│   └── middleware.ts                      # helper cek session untuk edge middleware
├── youtube/
│   ├── parse.ts                           # ekstraksi videoId dari URL
│   └── oembed.ts                          # ambil judul/thumbnail via oEmbed
├── logger/
│   ├── index.ts                           # antarmuka logger
│   └── pino.ts                            # implementasi pino (dev pretty / prod JSON)
├── errors/
│   ├── app-error.ts                       # AppError, NotFoundError, ForbiddenError, dst.
│   ├── codes.ts                           # kode error terpusat
│   └── prisma.ts                          # map error Prisma → AppError (P2002, P2025, ...)
├── config/
│   ├── env.ts                             # validasi env dengan Zod (saat boot)
│   ├── site.ts                            # metadata situs, tautan ekosistem
│   └── permissions.ts                     # matriks role/permission
├── api/                                   # (future) helper route handler
│   ├── with-error-handler.ts
│   ├── pagination.ts
│   └── response.ts                        # envelope API { success, data, meta }
├── cache/                                 # (future) adapter cache (redis/upstash)
├── email/                                 # (future) template & sender email
└── ai/                                    # (future) provider AI: transkripsi, ringkasan
```

**Aturan:**
- `lib/` **tidak boleh** mengimpor `features/`, `components/`, atau `hooks/`.
- Semua akses Prisma/Supabase/Auth harus melalui modul di `lib/` — tidak pernah instansiasi langsung di halaman.

### 3.5 `repositories/` — Data Access Layer

```
repositories/
├── user-repository.ts
├── speaker-repository.ts
├── category-repository.ts
├── tag-repository.ts
├── series-repository.ts
├── audio-repository.ts
├── media-source-repository.ts
├── transcript-repository.ts
├── bookmark-repository.ts
├── history-repository.ts
├── progress-repository.ts
├── note-repository.ts
├── related-content-repository.ts
└── index.ts                                # re-export semua repository
```

**Aturan:**
- **Satu-satunya tempat** yang menyentuh `PrismaClient` / Supabase.
- Repository hanya berisi **query murni**: `findMany`, `findUnique`, `upsert`, `create`, `update`, `delete`, `count`, `aggregate` — **tanpa logika bisnis**.
- Tiap repository mengembalikan tipe hasil yang terdefinisi (bisa tipe Prisma, atau DTO dari `types/`).
- Prisma `include`/`select` dipilih di lapisan ini (menghindari N+1).

### 3.6 `services/` — Business Logic Layer

```
services/
├── audio-service.ts
├── series-service.ts
├── speaker-service.ts
├── bookmark-service.ts
├── progress-service.ts                    # perbarui progress + history secara atomik
├── search-service.ts                      # orkestrasi lintas entity
├── player-service.ts                      # resolve MediaSource → item yang bisa diputar
├── media-source-service.ts                # abstraksi provider (youtube/r2/bunny)
├── transcript-service.ts                  # (future) trigger transkripsi
└── index.ts
```

**Aturan:**
- `services/` = **business logic**: validasi izin, aturan domain, orkestrasi beberapa repository, transaksi `$transaction`.
- Service boleh memanggil repository & service lain, **tidak boleh** memanggil komponen/halaman.
- Pembagian dengan `features/<f>/services`: gunakan **satu sumber kebenaran** di `services/` untuk logika domain. Folder `features/<f>/services` hanya untuk logika yang murni khusus satu feature & tidak dipakai fitur lain.

### 3.7 `hooks/`, `providers/`, `types/`, `validation/`, `utils/`

```
hooks/
├── use-debounce.ts
├── use-infinite-scroll.ts
├── use-media-query.ts
├── use-local-storage.ts
└── use-toggle.ts

providers/
├── query-provider.tsx        # TanStack Query
├── session-provider.tsx      # AuthSession (client)
├── player-provider.tsx       # Zustand player state (client)
└── theme-provider.tsx

types/
├── action.ts                 # ActionState<T> untuk server action
├── api.ts                    # envelope API & error API
├── pagination.ts             # PageParams, PageResult
├── youtube.ts
└── next.d.ts

validation/
├── pagination.ts
└── common.ts                 # schema bersama (slug, id, date range)

utils/
├── cn.ts                     # class name merge (tailwind)
├── format.ts                 # format tanggal, angka
├── duration.ts               # detik → "45:00"
├── slugify.ts
└── media.ts                  # helper URL YouTube/thumbnail
```

### 3.8 `prisma/`, `public/`, `jobs/`

```
prisma/
├── schema.prisma
├── migrations/
├── seed/
│   ├── index.ts
│   └── data/                 # data awal: series-type, kategori, ustadz
└── generated/                # hasil prisma generate (gitignored)

public/
├── images/
├── fonts/
├── icons/
└── manifest.webmanifest      # (future) PWA

jobs/                         # (future) background job — Vercel Cron / worker
├── transcript/
│   ├── queue.ts
│   └── process.ts
└── sync-metadata/            # sinkronisasi metadata YouTube berkala
```

---

## 4. Alasan Menggunakan Struktur Ini

| Masalah bila semua di `app/` | Solusi struktur ini |
|---|---|
| `app/` membludak (ribuan file) | `app/` hanya route; isi tersebar rapi di `features/` |
| Komponen saling import kacau | Aturan arah dependensi satu arah (§5) + larangan sibling import |
| Query DB tersebar di mana-mana | Semua query wajib lewat `repositories/` |
| Logika bisnis campur dengan UI | `services/` = logika, `features/` = presentasi |
| Ganti auth = ubah seluruh project | Auth diisolasi via `lib/auth/interface.ts` |
| Fitur baru = menambah file berantakan | Setiap fitur punya pola folder identik |
| Sulit uji | Repository/service murni → mudah di-mock & diuji |

---

## 5. Layer Architecture & Dependency Flow

### 5.1 Lapisan

```
┌───────────────────────────────────────────────┐
│  Layer 1 — PRESENTATION                      │
│  app/ (halaman) → features/ (komponen)       │
│  → components/ (shared) → hooks/             │
├───────────────────────────────────────────────┤
│  Layer 2 — ENTRY (server actions)            │
│  features/<f>/actions → app/api routes       │
│  (validasi Zod dulu, lalu panggil service)   │
├───────────────────────────────────────────────┤
│  Layer 3 — BUSINESS LOGIC                    │
│  services/ (+ services khusus feature)       │
│  (transaksi, aturan domain, orkestrasi)      │
├───────────────────────────────────────────────┤
│  Layer 4 — DATA ACCESS                       │
│  repositories/  (query Prisma/Supabase)      │
├───────────────────────────────────────────────┤
│  Layer 5 — INFRASTRUCTURE                    │
│  lib/ (prisma · supabase · auth · logger)    │
└───────────────────────────────────────────────┘
```

### 5.2 Alur Dependensi (hanya satu arah)

```
app/ (page) ──► features/<f>/components ──► components/ + hooks/
     │
     └───────► features/<f>/actions ──► validation/ (Zod)
                    │
                    ▼
               features/<f>/services ──► services/ (orkestrasi lintas fitur)
                    │                          │
                    ▼                          ▼
               repositories/ ◄──────────────────┘
                    │
                    ▼
               lib/ (prisma · supabase · auth · logger · config)
```

**Aturan tak tertulis (harus dijaga):**
1. `lib/` tidak boleh dipanggil oleh `components/` atau `features/` secara langsung (kecuali via `lib/config` untuk nilai yang aman dibaca client — diperbolehkan untuk yang `NEXT_PUBLIC_`).
2. `repositories/` tidak boleh memanggil `services/`, `features/`, atau `app/`.
3. `services/` tidak boleh memanggil `app/`, `features/`, atau `components/`.
4. Komponen UI **tidak boleh** memanggil repository/Prisma langsung. Query dilakukan di server (halaman/service), hasil dikirim sebagai props atau via TanStack Query ke client.
5. Server actions adalah **entry point tipis**: validasi → service → kembalikan `ActionState`.
6. Enforce dengan tooling: `eslint-plugin-boundaries` atau `import/no-restricted-paths` di ESLint agar aturan ini otomatis diverifikasi di CI.

---

## 6. Komponen — Pembagian Peran

| Jenis | Lokasi | Isi | Aturan |
|---|---|---|---|
| **UI Component** | `components/ui/` | Button, Input, Card, Modal, Skeleton, Toast | Primitif, tanpa logika bisnis, tanpa fetch |
| **Layout Component** | `components/layouts/` | SiteHeader, AppShell, AdminShell, PlayerBar | Kerangka halaman, terima props/slots |
| **Reusable/Shared Component** | `components/shared/` | AudioCard, SeriesCard, EmptyState, Pagination | Dipakai ≥2 fitur |
| **Feature Component** | `features/<f>/components/` | Detail khusus fitur | Dipakai 1 fitur saja |

**Pedoman:**
- Server Component default; `"use client"` hanya bila butuh interaktivitas.
- Komponen dumb (tanpa data) → terima data via props.
- Komponen smart (fetch di server) → buat "container component" yang memanggil service dan me-render komponen dumb.

---

## 7. Naming Convention

### 7.1 File
| Jenis | Pola | Contoh |
|---|---|---|
| Halaman Next.js | Nama tetap (`page.tsx`, `layout.tsx`, `route.ts`) | `page.tsx` |
| Komponen | `kebab-case.tsx`, export `PascalCase` | `audio-card.tsx` → `AudioCard` |
| Hook | `use-kebab.ts`, export `usePascal` | `use-audio.ts` → `useAudio` |
| Server action | `kata-kerja.ts` | `create-series.ts`, `delete-bookmark.ts` |
| Service | `domain-service.ts` → `DomainService` | `audio-service.ts` → `AudioService` |
| Repository | `domain-repository.ts` → `DomainRepository` | `audio-repository.ts` → `AudioRepository` |
| Zod schema | `domain.schema.ts` → `DomainCreateSchema` | `audio.schema.ts` → `AudioCreateSchema` |
| Types | `domain.ts` / `domain.types.ts` | `audio.ts` → `AudioWithRelations` |
| Zustand store | `domain-store.ts` | `player-store.ts` |
| Test | `*.test.ts` / `*.spec.ts` di dekat file | `audio-service.test.ts` |

### 7.2 TypeScript
- Interface/type: `PascalCase`, **tanpa prefix `I`** (`AudioWithRelations`, bukan `IAudio`).
- Type hasil query repository: `AudioWithRelations`, `SeriesWithCount`, `AudioListItem`.
- React props: `AudioCardProps`.
- Enums domain: pakai enum Prisma (`MediaProvider`, `ReferenceType`) dari `@prisma/client`.

### 7.3 Variabel & Konstanta
- `camelCase` untuk variabel/fungsi.
- `UPPER_SNAKE_CASE` untuk konstanta global (`MAX_AUDIO_DURATION`).
- Konstanta domain dikumpulkan di `lib/config/` atau file `constants` per feature.

---

## 8. Import Convention

1. **Gunakan alias `@/` yang menunjuk ke root project** (bukan path relatif dalam).

```ts
// ✅
import { AudioService } from '@/services/audio-service'
import { AudioCard } from '@/components/shared/audio-card'
import { audioCreateSchema } from '@/features/audio/validation/audio.schema'

// ❌
import { AudioService } from '../../../services/audio-service'
```

2. `tsconfig.json`:
```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./*"]
    }
  }
}
```

3. **Urutan import** (agar konsisten & mudah di-scan):
```
1. React / Next.js
2. Library pihak ketiga (zustand, @tanstack, zod)
3. @/lib, @/types, @/validation
4. @/services, @/repositories
5. @/components, @/hooks
6. @/features/<fitur>
7. CSS
```
*Terapkan otomatis via ESLint (`import/order`) + Prettier.*

4. **Larangan** import antar fitur sibling, dan `lib/` tidak boleh diimport oleh `components/` level atas kecuali via modul config.

---

## 9. Contoh Struktur Feature

### 9.1 `features/audio/` — fitur utama

```
features/audio/
├── components/
│   ├── audio-card.tsx
│   ├── audio-list.tsx
│   ├── audio-detail.tsx
│   ├── audio-header.tsx
│   ├── audio-description.tsx
│   └── audio-session-list.tsx
├── hooks/
│   ├── use-audio.ts
│   └── use-audio-sessions.ts
├── actions/
│   ├── create-audio.ts
│   ├── update-audio.ts
│   ├── publish-audio.ts
│   └── delete-audio.ts
├── services/
│   └── audio-admin-service.ts          # logika khusus admin audio (bila ada)
├── types/
│   ├── audio.ts                        # AudioWithRelations, AudioListItem
│   └── audio-dto.ts
└── validation/
    └── audio.schema.ts                 # AudioCreateSchema, AudioUpdateSchema
```

### 9.2 `features/player/` — modul player (disiapkan sejak awal)

```
features/player/
├── components/
│   ├── player-bar.tsx                  # mini player (menempel bawah)
│   ├── player-full.tsx                 # player layar penuh/detail
│   ├── player-controls.tsx             # play/pause/next/seek
│   ├── player-progress-bar.tsx
│   ├── player-speed-menu.tsx
│   └── player-timeline.tsx             # menampilkan Chapter/Highlight/Reference aktif
├── hooks/
│   ├── use-player.ts                   # selector store zustand
│   ├── use-audio-progress.ts           # sinkronisasi posisi → server (debounce)
│   └── use-youtube-player.ts           # wrapper YouTube IFrame API (diisolasi!)
├── store/
│   ├── player-store.ts                 # zustand: currentAudio, queue, position, status
│   └── player-store.types.ts
├── context/
│   └── player-provider.tsx             # inisialisasi store (client)
├── services/
│   └── player-service.ts               # resolve MediaSource → audio siap putar + build queue
├── types/
│   └── player.ts                       # PlayerQueueItem, PlayerStatus, PlayableSource
└── validation/
    └── player.schema.ts                # schema kontrol (seek, speed)
```

> **Penting:** `use-youtube-player.ts` mengisolasi integrasi YouTube IFrame API. Saat nanti ada provider lain (R2/Bunny) tinggal tambah `use-r2-player.ts` — antarmuka `use-player` tidak berubah.

### 9.3 `features/auth/`

```
features/auth/
├── components/
│   ├── login-form.tsx
│   ├── register-form.tsx
│   ├── oauth-buttons.tsx
│   └── auth-guard.tsx                  # wrapper client-side guard (optional)
├── hooks/
│   └── use-auth.ts
├── actions/
│   ├── login.ts
│   ├── register.ts
│   └── logout.ts
├── types/
│   └── auth.ts                         # SessionUser, LoginResult
└── validation/
    └── auth.schema.ts                  # LoginSchema, RegisterSchema
```

### 9.4 `features/admin/` — dashboard admin (feature terpisah)

```
features/admin/
├── components/
│   ├── admin-shell.tsx                 # sidebar + topbar + konten (atau di layouts/)
│   ├── data-table.tsx
│   ├── data-table-toolbar.tsx
│   ├── form-shell.tsx
│   ├── publish-toggle.tsx
│   ├── bulk-actions.tsx
│   └── stat-card.tsx
├── hooks/
│   ├── use-admin-table.ts
│   └── use-bulk-action.ts
├── actions/
│   ├── series/
│   │   ├── create-series.ts
│   │   ├── update-series.ts
│   │   └── delete-series.ts
│   ├── audio/
│   ├── speaker/
│   ├── category/
│   └── tag/
├── types/
│   ├── admin.ts
│   └── data-table.ts
└── validation/
    ├── series.schema.ts
    ├── audio.schema.ts
    └── ...
```

---

## 10. Contoh Struktur `app/` (halaman + koneksi ke fitur)

```
app/(public)/series/[slug]/page.tsx
│
│  Server Component:
│  ├─ panggil SeriesService.getBySlug(slug)
│  ├─ panggil AudioService.listBySeries(seriesId)
│  ├─ render <SeriesDetail series={...} audios={...} />
│  └─ (komponen berasal dari features/series/components)
│
app/(account)/bookmark/page.tsx
│
│  requireUser() dari lib/auth/session.ts
│  ├─ panggil BookmarkService.listForUser(user.id)
│  └─ render <BookmarkList ... />
│
app/(admin)/audio/page.tsx
│
│  requireAdmin()
│  ├─ panggil AudioService.listAdmin(filter)
│  └─ render <AdminAudioTable ... /> (features/admin)
│
app/api/v1/audio/route.ts
│
│  GET  → AudioService.listPublic(pagination)  → response envelope
│  POST → requireApiKey(); validasi AudioCreateSchema → AudioService.create()
```

---

## 11. Middleware

### 11.1 Peran
Middleware (`middleware.ts` di root, berjalan di **Edge runtime**) hanya bertugas untuk **proteksi routing cepat**:

| Route | Tindakan |
|---|---|
| `/(auth)/login`, `register` | Jika sudah login → redirect ke home/dashboard |
| `/(account)/*` | Jika tidak login → redirect `/login?next=...` |
| `/(admin)/*` | Jika tidak login / role bukan admin → redirect |
| `api/v1/*` (yang butuh auth) | Cek header token → 401 bila invalid |
| Sisanya | Allow |

### 11.2 Batasan penting (best practice)
- **Edge tidak bisa mengakses Prisma/Supabase DB** → middleware hanya memverifikasi **cookie session/JWT**, bukan data DB.
- Cek role di middleware memakai klaim yang dibawa session (mis. `role` di JWT). Verifikasi ulang **di dalam** server component/layout via `requireAdmin()` (defense in depth) — cookie bisa dipalsukan/scoped.
- Matcher harus mengecualikan aset statis:
```ts
export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
}
```
- Semua logika session di `lib/auth/middleware.ts` sehingga saat ganti auth (NextAuth ↔ Better Auth) middleware tidak berubah.

---

## 12. Auth Structure (swappable)

### 12.1 Prinsip
Seluruh kode **tidak pernah** bergantung langsung pada NextAuth/Better Auth. Semua bergantung pada kontrak `AuthAdapter`.

```
lib/auth/
├── interface.ts        # kontrak (dipakai di mana-mana)
├── next-auth.ts        # implementasi A (aktif)
├── better-auth.ts      # implementasi B (cadangan, siap pakai)
├── session.ts          # helper server: getSession/getCurrentUser/requireUser/requireAdmin
└── middleware.ts       # helper edge: baca cookie tanpa DB
```

Kontrak `AuthAdapter` (gambaran):
```
AuthAdapter {
  signIn(email, password)
  signUp(name, email, password)
  signOut()
  getSessionToken(req)      // untuk middleware/edge
  verifySession(token)      // untuk edge
  getCurrentUser()          // untuk server
}
```

### 12.2 Alur
1. **Middleware (edge):** `lib/auth/middleware.ts` membaca cookie → cek valid (tanpa DB) → izinkan/redirect.
2. **Server component/layout:** `getCurrentUser()` → data user + role dari DB → render sesuai role.
3. **Server action:** `requireUser()` / `requireAdmin()` sebelum eksekusi.
4. **Client:** `SessionProvider` membaca session (cached) untuk UI kondisional.

### 12.3 Catatan
- Role `ADMIN`/`USER` bersumber dari tabel `users.role` (lihat `database.md`).
- Saat ganti implementasi, cukup: ganti file yang dipakai di `interface.ts` + env. Komponen/halaman/action **tidak berubah**.

---

## 13. Environment (.env)

### 13.1 File env
| File | Status | Isi |
|---|---|---|
| `.env.local` | Gitignored | Secret lokal (tidak pernah di-commit) |
| `.env.example` | Di-commit | Template semua variabel + keterangan |
| Vercel Dashboard | Production | Set di dashboard, bukan file |

### 13.2 Daftar variabel
| Variabel | Wajib | Keterangan |
|---|---|---|
| `DATABASE_URL` | ✔ | URL Supabase Postgres (Prisma) |
| `DIRECT_URL` | ✔ | URL langsung untuk migrasi Prisma (direkomendasikan Supabase) |
| `SUPABASE_URL` | ✔ | URL project Supabase |
| `SUPABASE_ANON_KEY` | ✔ | Key anon (boleh di client) |
| `SUPABASE_SERVICE_ROLE_KEY` | **Server only** | Key service role (jangan pernah di client) |
| `AUTH_SECRET` | ✔ | Secret session (NextAuth/Better Auth) |
| `AUTH_URL` | ✔ | URL canonical auth (`https://audio.manhajsalafinsights.com`) |
| `YOUTUBE_API_KEY` | Opsional | Untuk durasi/metadata penuh (bisa pakai oEmbed tanpa key) |
| `NEXT_PUBLIC_APP_URL` | ✔ | URL publik situs |
| `LOG_LEVEL` | ✔ | `debug`/`info`/`warn`/`error` |
| `REDIS_URL` | Opsional (future) | Cache / rate limit |
| `CRON_SECRET` | Opsional (future) | Proteksi endpoint cron |

### 13.3 Aturan
- Variabel yang dibutuhkan client harus diawali **`NEXT_PUBLIC_`** dan hanya berisi nilai non-secret.
- Semua env divalidasi di `lib/config/env.ts` (Zod) saat boot — salah isi langsung gagal jelas, bukan error aneh di tengah jalan.
- `SUPABASE_SERVICE_ROLE_KEY` & `AUTH_SECRET` **tidak boleh** muncul di bundle client.

---

## 14. Konfigurasi Project

| File | Fungsi |
|---|---|
| `lib/config/env.ts` | Validasi env + ekspos objek `env` bertipe ketat |
| `lib/config/site.ts` | `site.name`, `site.url`, `site.links` (tautan ekosistem MSI) |
| `lib/config/permissions.ts` | Matriks role → permission (mis. `manage:audio` hanya admin) |
| `next.config.ts` | `images.remotePatterns` (`i.ytimg.com`, `img.youtube.com`, storage Supabase), `redirects` |
| `tsconfig.json` | Alias `@/*`, strict mode |
| `tailwind.config.ts` | Tema warna/spacing (design tokens) |
| `components.json` | Konfigurasi shadcn/ui |
| `eslint.config.mjs` | Rules + `boundaries`/`import/order` |
| `.prettierrc` | Format konsisten |

---

## 15. Error Handling

### 15.1 Domain Error (server)
```
lib/errors/
├── app-error.ts     # class AppError(status, code, message)
│   ├── NotFoundError     (404)
│   ├── ValidationError   (400)  — dari Zod
│   ├── AuthError         (401)
│   ├── ForbiddenError    (403)
│   ├── ConflictError     (409)  — mis. slug duplikat
│   └── ProviderError     (502)  — mis. oEmbed YouTube gagal
├── codes.ts         # enum kode error terpusat
└── prisma.ts        # map error Prisma → AppError (P2002→Conflict, P2025→NotFound)
```

### 15.2 Server Action — `ActionState<T>`
Semua server action mengembalikan bentuk seragam:
```ts
type ActionState<T> =
  | { ok: true; data: T }
  | { ok: false; error: { code: string; message: string } }
```
- Komponen form membaca `state.error.message` dan menampilkan.
- Zod di-parse di action (client + server), kegagalan → `{ ok: false }` tanpa melempar ke boundary.

### 15.3 API Route
```
lib/api/
├── with-error-handler.ts   # wrapper route handler: try/catch, map AppError → status
├── response.ts             # { success, data, meta } | { success:false, error }
└── pagination.ts           # parse & validasi query pagination
```
`GET/POST` di `app/api/*/route.ts` selalu dibungkus `withErrorHandler`.

### 15.4 UI Boundary
| File | Tujuan |
|---|---|
| `app/error.tsx` | Error per segment (error boundary) |
| `app/global-error.tsx` | Error root (reset seluruh app) |
| `app/not-found.tsx` | 404 |
| `loading.tsx` | Suspense fallback per segment |

### 15.5 Prinsip
- Error **jangan** dibungkus berlapis tanpa nilai — lemparkan `AppError` di service, tangkap di action/api wrapper.
- Jangan bocorkan detail internal ke client (stack, SQL). Message yang dikirim user-friendly + kode error untuk logging.

---

## 16. Logging

### 16.1 Struktur
```
lib/logger/
├── index.ts   # antarmuka: logger.info/warn/error/debug dengan metadata
└── pino.ts    # implementasi pino: dev = pino-pretty, prod = JSON terstruktur
```

### 16.2 Aturan pakai
- **Server actions/services/repositories** mencatat dengan konteks:
```
logger.info({ feature: 'audio', action: 'create', userId, durationMs }, 'audio created')
```
- **RequestId/correlation ID** di-set di middleware (header) agar satu request bisa dilacak di seluruh log.
- Level: `info` untuk perubahan penting, `warn` untuk hal mencurigakan, `error` untuk kegagalan.
- **Jangan pernah** mencatat: password, token, cookie, body form sensitif.
- **Client:** jangan log rahasia; kirim error ke layanan monitoring (future: Sentry) di `app/global-error.tsx`.

---

## 17. Future Ready — Pengembangan 5–10 Tahun

Struktur ini siap menerima perluasan **tanpa merombak folder inti**:

| Produk/fitur | Ditambah | Folder yang berubah |
|---|---|---|
| **AI Transcript** | Provider transkripsi, job queue | `lib/ai/`, `jobs/transcript/`, `features/transcript/` (sudah ada) |
| **AI Search** | Provider search pluggable | `services/search-service.ts` diperluas; `lib/search/` adapter (Postgres FTS → Meilisearch) |
| **Video** | `features/video/` mengikuti pola `audio` | Menambah feature baru, `types/` + schema Prisma baru |
| **Ebook / Artikel** | `features/ebook/`, `features/article/` | Sama — pola feature identik |
| **Tanya Jawab** | `features/qa/` | Feature baru |
| **Academy** | `features/academy/`, `features/enrollment/` | Feature baru |
| **Mobile App** | REST API publik | `app/api/v1/` jadi kanal resmi; `lib/api/` (auth via token, rate limit) |
| **PWA** | manifest, service worker | `public/manifest.webmanifest`, `next.config.ts` |
| **REST API** | Versioning + OpenAPI | `app/api/v1/` + generate docs dari Zod (`zod-openapi`) |
| **GraphQL (opsional)** | Layer GraphQL | Tambah folder `graphql/` di atas `services/` — repository/service sudah siap dipakai ulang |
| **Monorepo (web+mobile)** | pnpm workspaces | `apps/web` + `apps/mobile` + `packages/shared`; `services/` & `repositories/` dipindah ke `packages/core` |

**Mengapa tidak perlu merombak:** karena bisnis logic berada di `services/` + `repositories/` yang agnostik terhadap transport (halaman/API/GraphQL/mobile), dan setiap konten baru hanyalah **satu feature baru** dengan pola folder yang sama.

---

## 18. Roadmap Implementasi Folder

| Fase | Fokus | Langkah |
|---|---|---|
| **0. Scaffold** | Fondasi project | `create-next-app` (TS, Tailwind, ESLint), alias `@/`, prettier, `.env.example`, git init |
| **1. Infrastruktur** | `lib/` | `lib/prisma`, `lib/supabase`, `lib/config/env.ts`, `lib/logger`, `lib/errors`, `middleware.ts` (kosong dulu) |
| **2. Auth & User** | Kontrak auth | `lib/auth/interface.ts` + implementasi pilihan, `lib/auth/session.ts`, `features/auth/` (form + action) |
| **3. Data layer** | Repository & service | `prisma/schema.prisma` (dari `database.md`), migrasi, `repositories/*`, `services/*` inti (series, audio, speaker, category, tag, media-source) |
| **4. Fitur publik** | Vertical slices inti | `features/series`, `features/audio`, `features/search`, `components/ui` + `components/layouts` + `components/shared` |
| **5. Fitur user** | Personalisasi | `features/bookmark`, `features/history`, `features/progress`, `features/note`, area `(account)` |
| **6. Player** | Modul player | `features/player/` (store zustand, hook YouTube, provider), `services/player-service` |
| **7. Admin** | Manajemen | `features/admin/`, area `(admin)`, `features/reference|highlight|chapter|attachment|transcript` |
| **8. Future** | API & otomasi | `app/api/v1`, `jobs/`, `lib/ai`, `lib/search`, PWA |

---

## 19. Best Practice Ringkas

1. **Server-first:** default server component; gunakan client hanya saat interaktif.
2. **Strict TypeScript** menyala; hindari `any`.
3. **Data di-fetch di server** (halaman/action), client hanya via TanStack Query untuk data yang berubah cepat (progress, player).
4. **Tanpa sibling import antar feature** — jaga dengan ESLint boundary.
5. **Zod sebagai satu-satunya sumber validasi** (server + client share schema dari `validation/`).
6. **Error selalu terstruktur** (`AppError` + `ActionState`) — jangan throw raw.
7. **Jangan log secret; jangan kirim secret ke client.**
8. **Gunakan `NEXT_PUBLIC_` hanya untuk nilai non-secret.**
9. **Tulis test pada `services/` & `repositories/`** (logika inti), bukan pada komponen presentasi.
10. **Review sebelum merge:** dependency flow tetap satu arah, feature pola identik, `app/` tetap tipis.

---

*Dokumen arsitektur ini adalah acuan struktur project. Belum ada UI, halaman, API, CRUD, maupun player yang diimplementasikan.*
