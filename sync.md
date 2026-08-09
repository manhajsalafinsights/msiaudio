# MSI Audio — Sync (Sinkronisasi Lintas Perangkat)

**Product Requirement — Sync, Conflict Handling, Offline**

| | |
|---|---|
| Produk | MSI Audio |
| Scope | Strategi sinkronisasi (progress/bookmark/notes), auto-save, konflik (rekomendasi), offline, privasi |
| Referensi | `player-state.md` (state `offline`) · `continue-learning.md` §2 (auto-save) · `progress.md` · `bookmark.md` · `notes.md` |
| Status | Draft v1.0 — rancangan, bukan kode |

---

## 1. Tujuan

**"Mulai di HP di bus, lanjut di laptop di rumah — tanpa kehilangan posisi, catatan, atau bookmark."**

Cakupan yang disinkronkan:
1. **Progress** (`UserProgress` + `ListeningHistory`) — posisi, % , completed, completedCount.
2. **Bookmark** (`Bookmark`).
3. **Notes** (`Note`).
4. (Future) Favorite series, riwayat hapus lokal.

---

## 2. Alur Sinkronisasi

```
[User playback] ─▶ [State machine (player-state)] ─▶ [Auto-save: 10s tick / pause /
                                                        selesai / pagehide·sendBeacon]
                                                              │
                                                              ▼
                                              [services/progress-service.ts]
                                              POST /api/sync/progress (bulk)
                                                              │
                                                     [server-side]
                                            one $transaction (upsert listening +
                                                            progress + bookmark/note)
                                                              │
                                              [DB Postgres (Supabase)]
                                                              │
                                              [GET /api/sync/last-updated
                                               → pull incremental saat app buka]
```

Prinsip:
- **Push**: hanya delta (data yang berubah) pada momen auto-save — bukan seluruh data.
- **Pull**: saat app dibuka → fetch `last-updated` per data type → tarik item yang lebih baru dari `lastSyncAt` lokal.
- **Murni per-user**: semua request memakai `userId` dari sesi (atau token guest sementara) — data user lain tidak pernah terlihat.

---

## 3. Rekomendasi Conflict Handling

### 3.1 Keputusan: **Last-Write-Wins (LWW) + bookmark/notes "manual merge"**

| Tipe Data | Strategi | Alasan |
|---|---|---|
| **Progress (posisi/%)** | **LWW** — posisi terakhir (by `updatedAt`) yang menang | Lanjut = posisi terbaru; tidak masuk akal "menggabungkan" 25:03 dan 40:00 |
| **Notes** | **Edit-aware merge** — setiap edit simpan `content` utuh; tabrakan (dua perangkat edit note sama) → **LWW** (yang terakhir menang) + simpan versi lama sebagai *conflict copy* jika beda materi | Catatan adalah konten; LWW murni bisa menghapus tulisan user |
| **Bookmark** | **LWW per baris** (unique `(userId, audioId, positionSeconds)`) | Bookmark jarang diedit; add/delete tidak konflik karena kunci baris |

> **Kenapa bukan "manual choice dialog"?** Dialog konflik (memilih versi) membuat frustrasi di 99% kasus yang bisa diselesaikan otomatis. **Kenapa bukan full merge?** Merge baris per baris (kunci unik) sudah otomatis; yang berisiko hanya Notes (maka conflict copy).

### 3.2 Detail LWW
- Setiap baris punya `updatedAt` (server time) — yang lebih baru menang.
- Untuk progress: jika `updatedAt` server ≥ lokal → pakai server (hindari "mundur" posisi).

### 3.3 Conflict Copy (Notes)
```
Saat pull menemukan: note server.editedAt == note lokal.editedAt (tabrakan):
  - simpan server versi sebagai note utama
  - buat salinan lokal lama sebagai "Note — Salinan (versi lama)"
```
Tampil di daftar Notes dengan badge `[Salinan]` agar tidak "hilang diam-diam".

---

## 4. Offline

### 4.1 State
- Tambahkan state `offline` pada state machine (sudah terdokumentasi di `player-state.md` §3 — union `status`).
- Deteksi: `navigator.onLine` + event `online`/`offline`; saat request gagal jaringan → masuk state `offline`.

### 4.2 Perilaku

| Data | Offline | Saat kembali online |
|---|---|---|
| **Progress** | Disimpan lokal (IndexedDB/localStorage) + `lastSyncAt` lokal | Replay delta → push bulk → clear lokal |
| **Bookmark** | Bisa tambah/hapus lokal | Push perubahan (LWW) |
| **Notes** | Bisa tambah/edit/hapus lokal | Push; conflict copy jika tabrakan |
| **Autoplay/Continue** | Tetap jalan dari data lokal | Proses ulang dengan data terbaru |

- **Queue (outbox)**: perubahan offline antri dalam list lokal (`pendingSync`), di-flush satu `$transaction` saat online kembali.
- **Badge**: UI menampilkan "🔴 Mode offline — perubahan akan disinkronkan nanti" (belum hilang sampai queue kosong).
- Batas: tidak ada playlist full; audio tetap perlu internet (kecuali future offline download — lihat §6).

---

## 5. Privasi

- Seluruh data sync (progress/bookmark/notes/history) **privat per-user**.
- Auth: session (server) atau guest token sementara yang **di-merge ke akun saat login** (localStorage guest → akun, sekali jalan, lalu hapus lokal).
- Tidak ada API publik; akses selalu mengecek `userId` di session.

---

## 6. Future Ready

| Fitur | Persiapan |
|---|---|
| **Offline download audio** | Media source URL didapat on-demand (`MediaSource`); arsitektur `MediaSource` siap untuk cache audio (future) |
| **Real-time** | Infrastruktur delta (`last-updated`) sudah siap di-upgrade ke WebSocket/SSE jika perlu |
| **Merge AI** | Conflict copy notes = data latih (future) untuk "merge otomatis yang lebih pintar" |
| **Multi-device history** | `history.md` §5 memakai `listeningDurationSeconds`; sync berjalan via delta yang sama |

---

## 7. Ringkasan Non-Negotiable

1. **LWW untuk progress; conflict copy untuk notes; LWW per baris untuk bookmark** — diputuskan, bukan dibiarkan ambigu.
2. **Push delta + pull incremental** (`last-updated`) — efisien dan skala.
3. **Outbox offline** — tidak ada perubahan hilang saat koneksi putus.
4. **Guest → merge ke akun saat login** — tidak ada data terpisah.
5. **Privat** — tidak ada data user lain di alur sync mana pun.

---

*Dokumen ini menyertai `bookmark.md`, `notes.md`, `progress.md`, `history.md`, dan `learning-experience.md`. Belum ada kode yang diimplementasikan.*
