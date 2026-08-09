# MSI Audio — Progress & Continue Learning

**Product Requirement — Progress, Continue Learning, Auto Save**

| | |
|---|---|
| Produk | MSI Audio |
| Scope | Perhitungan progress (audio/series/keseluruhan), aturan selesai, konsep Continue Learning + dialog, auto-save, wireframe |
| Referensi | `schema.prisma` (`UserProgress`, `ListeningHistory`) · `continue-learning.md` (detail auto-save & data) · `player-flow.md` |
| Status | Draft v1.0 — rancangan, bukan kode |

---

## 1. Konsep Progress

**Progress = ukuran "berapa jauh saya telah belajar", bukan sekadar statistik.**

| Level | Arti | Simpan di |
|---|---|---|
| Progress Audio | Posisi/kelengkapan satu sesi | `ListeningHistory.progressPercent` |
| Progress Series | Seberapa tuntas satu program belajar | `UserProgress.progressPercent` |
| Progress Keseluruhan | Rata-rata seluruh series yang diikuti user | agregasi `UserProgress` |

Dua tabel, satu transaksi (via `services/progress-service.ts`):
```
ListeningHistory  — per (user, audio): posisi, %, completed, playCount, lastPlayedAt
UserProgress      — per (user, series): lastAudio, posisi, completedCount, %, updatedAt
```

---

## 2. Aturan Selesai (komplit)

### 2.1 Audio dianggap selesai
```
completed = (positionSeconds >= duration − 30)  ATAU  (positionSeconds / duration >= 0.98)
```
- Ambang **30 detik terakhir** atau **98%** — praktis: yang sampai segitu layak dianggap selesai.
- Ditulis sekali (`completed=true`); pemutaran ulang menurunkan status menjadi berjalan.
- `progressPercent` audio di-*cap* **99%** sebelum benar-benar selesai → konsisten dengan status `completed`.

### 2.2 Series dianggap selesai
```
series selesai = completedCount == totalSesi   (== progressPercent 100%)
```
- `completedCount` = jumlah audio dalam series yang memenuhi aturan 2.1.
- Saat audio terakhir selesai → `progressPercent = 100%` + dialog "Series Selesai".

### 2.3 Progress Keseluruhan (overall)
```
overall = round( Σ progressPercent(series) / jumlah series yang diikuti )
```
- Atau varian berbobot: `Σ completedCount / Σ totalSesi` (lebih akurat untuk series besar/kecil).
- Ditampilkan di Learning Dashboard (`/belajar`) sebagai "Progress Keseluruhan" — **dihitung** (bukan kolom baru) saat implementasi.

---

## 3. Continue Learning

### 3.1 Konsep
**Continue Learning = titik lanjut yang disimpan otomatis, ditampilkan di mana pun user berada.**

Yang disimpan (otomatis):

| Item | Sumber |
|---|---|
| Audio terakhir | `UserProgress.lastAudioId` |
| Series terakhir | `UserProgress.seriesId` |
| Posisi terakhir | `UserProgress.positionSeconds` (+ `ListeningHistory.positionSeconds`) |
| Tanggal terakhir | `UserProgress.updatedAt` / `ListeningHistory.lastPlayedAt` |

### 3.2 Dialog "Lanjutkan belajar?"
Tampil saat user membuka audio berprogress dari konteks *browse* (bukan dari kartu Continue).

```
┌────────────────────────────────────────────┐
│ ▀▀ Sesi 3 — Pengertian Tauhid             │
│ "Kamu berhenti di 25:03 · 2 jam lalu"     │
│                                            │
│  [▶ Lanjutkan dari 25:03]     (utama)      │
│  [↺ Mulai dari Awal]                       │
└────────────────────────────────────────────┘
```
Aturan penuh: `continue-learning.md` §6. Inti: kartu Continue = langsung lanjut (tanpa dialog); konteks browse = dialog; progress <10s/<5% atau audio completed = tanpa dialog.

---

## 4. Auto Save (rekomendasi)

**Rekomendasi terbaik = simpan pada 4 momen, dengan throttle efisien:**

| Momen | Kapan | Efisiensi |
|---|---|---|
| **Setiap 10 detik** | Interval tick pemutaran | Throttle: hanya kirim bila posisi berubah ≥ 5 detik dari simpan terakhir |
| **Saat Pause** | Event pause | Flush segera (posisi pasti, murah) |
| **Saat Audio Selesai** | Mencapai ambang 2.1 | Tandai `completed` + update `completedCount` series |
| **Saat Keluar Halaman** | `pagehide` | `navigator.sendBeacon` — andal saat tab ditutup |

**Mengapa 4 momen ini paling efisien:** tanpa polling, tanpa simpan tiap `timeupdate` (puluhan kali/detik), tanpa kehilangan posisi saat tab ditutup. Estimasi beban: sesi 45 menit ≈ 270 kiriman maks, riil jauh lebih sedikit (delta-based + pause flush). Detail: `continue-learning.md` §2.

---

## 5. Wireframe — Halaman Continue Learning (`/continue-listening`)

### Desktop (≥1024px)

```
┌──────────────────────────────────────────────────────────────┐
│ Continue Learning                                           │
│ "Teruskan dari tempat terakhirmu"                            │
│ FILTER: [Semua ▾] [🔍 cari...]            [Urut: Terakhir ▾] │
│ ──────────────────────────────────────────────────────────── │
│ ▀▀ Kitab Tauhid · Sesi 3 — Pengertian Tauhid        [▶▶]    │
│ ████████████░░░░░░░░░ 25:03 / 45:00 · 55% · 2 jam lalu     │
│ Estimasi sisa: ±20 mnt · [Buka Series] · [🗑]               │
│ ──────────────────────────────────────────────────────────── │
│ ▀▀ Ushulus Sunnah · Sesi 7                        [▶▶]     │
│ █████░░░░░░░░░░ 12:00 / 40:00 · 30% · 3 hari lalu          │
│ ──────────────────────────────────────────────────────────── │
│ (kosong → Empty State: "Belum ada kajian yang diputar"      │
│   + [Jelajahi Kajian])                                      │
└──────────────────────────────────────────────────────────────┘
```

### Mobile (<768px)

```
┌────────────────────────────────────────────┐
│ [←] Continue Learning                      │
│ [▀▀] Kitab Tauhid · Sesi 3       [▶▶]      │
│      ████████░░░░ 25:03/45:00 · 55%        │
│      ±20 mnt · 2 jam lalu  [Series][🗑]    │
│ ────────────────────────────────────────── │
│ (kartu bertumpuk)                          │
└────────────────────────────────────────────┘
```

---

## 6. Ringkasan Non-Negotiable

1. **Selesai audio**: 30 detik terakhir atau 98%; **selesai series**: seluruh audio selesai.
2. **Progress keseluruhan**: berbobot jumlah sesi (akurat untuk series besar/kecil).
3. **4 momen auto-save** + throttle/delta → efisien & tidak kehilangan posisi.
4. **Dialog "Lanjutkan belajar?"** hanya pada konteks browse; kartu Continue langsung lanjut.
5. **Progress selalu terlihat** di Continue Learning, dashboard, dan Series Detail.

---

*Dokumen ini menyertai `bookmark.md`, `notes.md`, `history.md`, `sync.md`, dan `learning-experience.md`. Belum ada kode yang diimplementasikan.*
