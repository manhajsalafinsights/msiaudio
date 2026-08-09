/** Detik → "45:00" (di bawah 1 jam) atau "1:02:30". */
export function formatDuration(totalSeconds: number): string {
  const seconds = Math.max(0, Math.floor(totalSeconds));
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  }
  return `${String(minutes).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
}

/** Detik → "1 j 2 mnt" / "45 mnt" / "30 dtk" (untuk statistik, bukan player). */
export function formatDurationHuman(totalSeconds: number): string {
  const seconds = Math.max(0, Math.floor(totalSeconds));
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  if (hours > 0) return `${hours} j ${minutes} mnt`;
  if (minutes > 0) return `${minutes} mnt`;
  return `${seconds} dtk`;
}

/** Posisi → persen (0–100). */
export function toPercent(positionSeconds: number, durationSeconds: number): number {
  if (durationSeconds <= 0) return 0;
  return Math.min(100, Math.round((positionSeconds / durationSeconds) * 100));
}
