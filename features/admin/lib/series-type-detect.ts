// Kata kunci deteksi tipe series dari judul (urutan = prioritas, spesifik dulu).
// Dipakai oleh import (server) dan halaman Rapikan Series.
export const TYPE_KEYWORDS: { slug: string; keywords: string[] }[] = [
  { slug: "kitab-bahasa-arab", keywords: ["bahasa arab", "kitab arab"] },
  { slug: "kitab-muslimah", keywords: ["kitab muslimah"] },
  { slug: "kajian-muslimah", keywords: ["muslimah", "akhwat"] },
  { slug: "kajian-syaikh", keywords: ["kajian syaikh"] },
  { slug: "tafsir-al-quran", keywords: ["tafsir", "tafsir quran"] },
  { slug: "belajar-quran", keywords: ["belajar quran", "tahsin", "tahfidz", "tahfizh", "makhraj"] },
  { slug: "murotal", keywords: ["murotal", "murottal", "murattal", "tilawah"] },
  { slug: "kisah-para-ulama", keywords: ["kisah ulama", "biografi ulama", "sirah ulama", "perjalanan ulama"] },
  { slug: "dauroh", keywords: ["dauroh", "daurah", "diklat"] },
  { slug: "parenting", keywords: ["parenting", "tarbiyatul aulad", "mendidik anak"] },
  { slug: "keluarga", keywords: ["keluarga", "rumah tangga", "berumah tangga"] },
  { slug: "ramadhan", keywords: ["ramadhan", "ramadan", "puasa", "zakat fitrah"] },
  { slug: "podcast", keywords: ["podcast"] },
  { slug: "talk-show", keywords: ["talk show", "talkshow"] },
  { slug: "tematik", keywords: ["tematik"] },
  { slug: "kajian-kitab", keywords: ["kajian kitab", "syarah kitab", "kitab"] },
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