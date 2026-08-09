# MSI Audio — Player User Flow

**Product Requirement — Alur Pengguna Player**

| | |
|---|---|
| Produk | MSI Audio (ekosistem Manhaj Salaf Insights) |
| Scope | Alur pengguna end-to-end, learning experience, queue UX, auto next, best practice (UX/performance/state/scalability/future) |
| Referensi | `player.md` · `continue-learning.md` · `player-state.md` · `player-wireframe.md` · `player-future.md` |
| Status | Draft v1.0 — rancangan, bukan kode |

---

## 1. Tujuan

`player-flow.md` menghubungkan seluruh dokumen player menjadi **alur pengguna yang utuh** — apa yang dilihat, diklik, dan dirasakan user dari awal hingga tuntas satu program belajar (series). Dokumen ini **tidak mengulang** spesifikasi (ada di file lain), melainkan menggambarkan urutan & keputusan UX.

---

## 2. Peta Perjalanan Pengguna

### 2.1 Pengguna baru (belum login)
```
Home → pilih series → Series Detail → pilih sesi → putar (dari awal)
   → pause → keluar → progress tersimpan (guest, localStorage)
   → kembali → dialog "Lanjutkan dari posisi terakhir?"
   → login (opsional, saat ingin menyimpan permanen / bookmark)
```

### 2.2 Pengguna kembali (sudah punya progress)
```
Buka situs → Home/Dashboard → kartu Continue Learning
   → tap [▶▶] → langsung lanjut dari posisi terakhir (tanpa dialog)
   → atau buka Series Detail → dialog lanjutkan → [Lanjutkan] / [Mulai dari Awal]
```

### 2.3 Pengguna dalam program belajar (multi-sesi)
```
Sesi 1 → ... → Sesi N (auto-next / dialog selesai)
   → sesi terakhir → Series Selesai → rekomendasi series berikutnya
```

---

## 3. Flow Utama (end-to-end)

```
HOME
 │  pilih "Kitab Tauhid" (Series Card)
 ▼
SERIES DETAIL
 │  progress bar series · [▶ Lanjutkan Sesi 3] / pilih sesi
 ▼
AUDIO DETAIL (Full Player)
 │  restore posisi (dialog bila bukan dari tombol lanjut)
 ▼
PLAY
 │  auto-save tiap 10 detik · saat pause · saat keluar · saat selesai
 ├─────────────────────────────┐
 ▼                             ▼
PAUSE / KELUAR                SESI SELESAI (30s terakhir)
 │  (tab ditutup)              │
 ▼                             ▼
KEMBALI                    DIALOG SESSION SUMMARY
dialog "Lanjutkan dari        [▶ Putar Sesi Berikutnya] (autoplay 3s)
posisi terakhir?"            [🎓 Series berikutnya] [📋 Rekomendasi]
 │ [Lanjutkan]/[Awal]          │  (opsional)
 ▼                             ▼
LANJUT dari posisi           SESI BERIKUTNYA ... (ulang)
 │                             │
 └──▶ saat sesi TERAKHIR:  SERIES SELESAI
                            [Kembali ke Series] [Series Berikutnya →]
```

---

## 4. Flow Detail

### F1 — Memilih & memutar
```
Klik audio (dari list/home/explore)
   ├─ punya progress ≥ ambang  ──► [dialog restore §F3]
   │
   ├─ progress < ambang (< 10 detik / < 5%) ──► putar dari awal (tanpa dialog)
   │
   └─ audio sudah selesai ──► putar ulang dari awal (tanpa dialog)
```
- Setelah `load()` → full player tampil (mobile: sheet; desktop: halaman).
- Posisi terakhir di-fetch dari server (jika login) / localStorage (guest).

### F2 — Pause & keluar (auto-save)
```
[⏸ Pause]  → flush segera (simpan posisi)
Scroll/ke halaman lain → mini player tetap tampil, audio jalan
Tutup tab → pagehide → sendBeacon → posisi & lastPlayedAt tersimpan
```
- Detail teknis & efisiensi: `continue-learning.md` §2.

### F3 — Dialog "Lanjutkan dari posisi terakhir?"
Muncul saat user **membuka** audio yang punya progress (bukan lewat tombol Continue).

```
┌────────────────────────────────────────────┐
│ ▀▀ Sesi 3 — Pengertian Tauhid             │
│ "Kamu berhenti di 25:03"                  │
│                                            │
│  [▶ Lanjutkan dari 25:03]        (utama)   │
│  [↺ Mulai dari Awal]                       │
│                                            │
│ (tanpa auto-play — user yang memutuskan)   │
└────────────────────────────────────────────┘
```

| Aturan dialog |
|---|
| Tombol utama = **Lanjutkan** (default Enter). Aksi kedua = Mulai dari Awal. |
| Tidak autoplay — menghormati kebijakan autoplay browser & pilihan user. |
| **Kartu Continue Learning tidak memunculkan dialog** — tap `[▶▶]` berarti "lanjut", langsung restore. Dialog hanya untuk konteks *browse* (buka dari daftar/explore/search). |
| Tidak muncul bila progress < 10 detik atau < 5% (dianggap belum mulai). |
| Aksesibel: `role="dialog"`, `aria-label`, fokus ke tombol Lanjutkan, tombol keyboard bisa. |

### F4 — Menyelesaikan sesi (auto-next)
Setelah audio mencapai ambang selesai (`continue-learning.md` §4): session summary + auto-next (`player-future.md` §6).

| Opsi UX (yang dipertimbangkan) | Keputusan |
|---|---|
| Putar sesi berikutnya otomatis langsung | ✖ — melewatkan momen refleksi & bisa mengejutkan |
| **Dialog summary + auto-next setelah 3 detik** | **✔ direkomendasikan** — balans fokus & kontrol |
| Kembali ke Series | Tersedia sebagai pilihan dalam dialog, bukan default |
| Tetap berhenti | Tersedia (pilihan "Tutup"); juga hasil jika autoplay dimatikan user |

> Rekomendasi: **dialog** selalu tampil; **autoplay sesi berikutnya** default ON (hitungan 3 detik), bisa dimatikan di setelan. Alasan: menjaga "momentum belajar" tanpa menghilangkan kontrol.

### F5 — Series selesai
```
Sesi terakhir selesai → dialog Series Selesai
   [Kembali ke Series] · [Series Berikutnya →] (rekomendasi)
→ tap rekomendasi → Series Detail series baru (progress 0)
```

---

## 5. Alur Khusus

### 5.1 Tanpa login (guest)
```
Putar → progress di localStorage → dialog restore tetap jalan (lokal)
Coba bookmark/note → prompt "Masuk untuk menyimpan" → /login?next=...
Saat login → progress guest di-merge ke server (continue-learning.md §2.6)
```

### 5.2 Offline / koneksi putus
```
Saat memutar → internet putus → banner "Koneksi bermasalah" (posisi jalan lokal)
Posisi tetap tersimpan (queue), di-flush saat online kembali
Belum ada sumber offline → pemutaran terhenti dengan pesan; resume saat online
```

### 5.3 Audio tidak tersedia / provider gagal
```
load() gagal resolve → state error → pesan + [Coba Lagi] + [Buka di YouTube]
Bila audio dihapus admin → kembali ke daftar sesi series tersebut
```

### 5.4 Pindah perangkat
```
Buka audio di perangkat lain → posisi server terbaru di-restore
(lastPlayedAt terbaru menang — player-future.md §2)
```

---

## 6. Learning Experience (identitas platform belajar)

Empat kebutuhan user belajar + desain UX-nya:

| Kebutuhan | Desain UX |
|---|---|
| **Fokus mendengar** | Player tanpa elemen pengganggu (tanpa iklan/komentar/feed). Learning layout minimal; cover + judul + kontrol besar. Dark-mode lembut untuk fokus (future) |
| **Mudah mengulang materi** | `↺10`/`↻30` + Chapter list (klik → seek) + kecepatan putar. Bagian penting (Highlight) tampil sebagai pintasan seek. Opsi "Putar Ulang" pada sesi selesai |
| **Mudah menemukan dalil** | Tab Reference sinkron posisi — ayat/hadits muncul saat dibahas; klik → seek ke konteksnya. Teks Arab tampil benar (RTL + font Arab) |
| **Mudah melanjutkan belajar** | Continue Learning di setiap titik (Home, Dashboard, mini player) → 1 ketukan lanjut dari posisi. Progress series selalu terlihat |

**Prinsip**: player adalah "meja belajar", bukan "radio" — setiap elemen mengarahkan kembali ke materi, dalil, dan kelanjutan.

---

## 7. Queue UX (sesi dalam series)

```
[⏮] Sesi sebelumnya · [▶] Sesi ini · [⏭] Sesi berikutnya
         (queue = seluruh audio published series, urut nomorSesi)
```
- `⏭` saat sesi terakhir → tidak berpindah; hanya tombol **Next** di dalam player yang tahu konteks queue (bukan tombol pindah series).
- Indikator "Sesi 3/24" + progress bar per-sesi selalu terlihat agar user tahu posisinya di program belajar.
- Akses ke seluruh sesi: daftar sesi di Audio Detail / Series Detail (bukan dari dalam player).

---

## 8. Best Practice

### 8.1 UX Principle
1. **Satu pemutaran, satu konteks** — berpindah halaman tidak menghentikan audio; mini player selalu hadir.
2. **Kurang lebih = lebih baik** — kontrol inti (play/pause, prev/next, rewind/forward) selalu terlihat; menu sekunder (speed/volume/timer) satu klik di belakang.
3. **Lanjutkan adalah jalan pintas utama** — dari mana pun, maksimal 2 ketukan menuju posisi terakhir.
4. **Umpan balik segera** — tiap aksi (seek, speed, save) ada respons visual/audible; tidak ada aksi diam.
5. **Konsisten antar ukuran layar** — kontrol sama di mini/full, desktop/mobile.

### 8.2 Performance
- **Store client murni** (Zustand) — posisi/status tidak memicu render server; hanya komponen yang subscribe berubah yang render.
- **Auto-save ter-throttle** (10s, delta ≥5s) — beban DB kecil (`continue-learning.md` §2).
- **Preload ringan** — metadata & artwork sesi berikutnya di-fetch lebih dulu; audio tidak di-prefetch penuh (hemat data).
- **Skeleton loading** pada full player; `loading.tsx` per halaman.
- **Metrik**: pilih transisi dengan `prefers-reduced-motion`; hindari jank dengan ukuran kontrol konsisten.

### 8.3 State Management
- **Satu store global** (`player-store`) — mini & full player membaca sumber yang sama; tidak ada duplikasi status.
- **Transport terisolasi** (hook `use-youtube-player` / `use-html-audio`) — UI hanya kenal status dari store (`player-state.md` §4).
- **Persistence dipisah** (hook `use-audio-progress`) — state cepat (posisi) tidak menunggu server; save di-schedule.
- **Derivasi via selector** (`hasPrev`, `isComplete`, `progressPercent`) — tidak menyimpan nilai turunan di store.

### 8.4 Scalability
- **Multi provider** — `player-service` + hook wrapper; tambah provider (R2/Bunny) tanpa ubah UI (`MediaProvider` enum di schema).
- **Multi konten (video/ebook)** — pola `features/<f>` sama; player dipakai ulang.
- **Multi platform (PWA/mobile)** — state machine transport-agnostik; REST API (`app/api/v1`) untuk mobile.
- **Rekomendasi & analitik** — logic di `services/`, siap diuji/diperluas tanpa sentuh UI.

### 8.5 Future Development
- Offline: abstraksi `getLocalSource()` di `player-service` (`player.md` §8).
- AI Transcript/Summary/Search: data transcript sudah ada (schema) — player tinggal menampilkan panel; sumber data dari `lib/ai`.
- Background audio: Media Session + `<audio>` langsung; PWA manifest (`player-state.md` §6).
- Public API & mobile: `app/api/v1` (arsitektur sudah menyediakan).
- Ringkasan lengkap persiapan: `player-future.md` §8.

---

## 9. Ringkasan Non-Negotiable

1. **Alur inti**: pilih → putar → save → lanjut → selesai → rekomendasi, tanpa hambatan.
2. **Dialog "Lanjutkan dari posisi terakhir?"** hanya saat konteks browse; kartu Continue langsung lanjut.
3. **Auto-next via dialog** (3s) — momentum belajar + kontrol user.
4. **Fokus belajar**: tidak ada elemen pengganggu; dalil (Reference) & materi (Chapter/Highlight) mudah dijangkau.
5. **Best practice terukur**: store tunggal, transport terisolasi, save efisien, siap multi-platform.

---

*Dokumen ini menyertai `player.md`, `continue-learning.md`, `player-state.md`, `player-wireframe.md`, dan `player-future.md`. Belum ada kode, komponen, player, atau API yang diimplementasikan.*
