/** Deteksi video yang tidak tersedia (judul standar YouTube Data API). */
export function isUnavailableVideo(title: string): boolean {
  return /^(?:private|deleted) video$/i.test(title.trim());
}