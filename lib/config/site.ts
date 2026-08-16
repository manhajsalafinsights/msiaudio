export const site = {
  name: "MSI Audio",
  tagline: "Belajar audio kajian Islam",
  description:
    "Platform belajar audio kajian Islam — ekosistem Manhaj Salaf Insights. Dengarkan kajian kitab, daulah, dan rekaman ilmiah, lalu lanjutkan di perangkat mana pun.",
  // NEXT_PUBLIC_APP_URL menentukan canonical/OG/sitemap.
  // Wajib di-set ke domain produksi di Vercel: https://msiaudio.manhajsalafinsights.com
  url: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
  locale: "id_ID",
} as const;

export const publicNav = [
  { label: "Beranda", href: "/" },
  { label: "Jelajahi", href: "/explore" },
  { label: "Series", href: "/series" },
  { label: "Kitab", href: "/kitab" },
  { label: "Pemateri", href: "/pemateri" },
] as const;

export const footerLinks = [
  { label: "Tentang", href: "/tentang" },
  { label: "Kebijakan Privasi", href: "/kebijakan-privasi" },
  { label: "Syarat & Ketentuan", href: "/syarat-ketentuan" },
] as const;
