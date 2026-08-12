// Kata kunci deteksi tipe series dari judul (urutan = prioritas, spesifik dulu).
// Dipakai oleh import (server) dan halaman Rapikan Series.
export const TYPE_KEYWORDS: { slug: string; keywords: string[] }[] = [
  { slug: "kitab-bahasa-arab", keywords: ["bahasa arab", "kitab arab"] },
  { slug: "kitab-muslimah", keywords: ["kitab muslimah"] },
  { slug: "tematik", keywords: ["tematik"] },
  { slug: "kajian-kitab", keywords: ["kajian kitab", "kitab"] },
];

/** Saran slug tipe series dari judul, null bila tidak cocok. */
export function suggestSeriesTypeSlug(title: string): string | null {
  const lower = title.toLowerCase();
  for (const rule of TYPE_KEYWORDS) {
    if (rule.keywords.some((k) => lower.includes(k))) {
      return rule.slug;
    }
  }
  return null;
}