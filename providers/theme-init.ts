export const THEME_STORAGE_KEY = "msi-theme";

/**
 * Script inline untuk mencegah flash warna salah (FOUC) sebelum hydration.
 * Modul ini sengaja tanpa "use client" agar bisa dipanggil dari Server Component
 * (root layout) maupun dibaca dari ThemeProvider (client).
 */
export function themeInitScript() {
  return `(function(){try{var t=localStorage.getItem("${THEME_STORAGE_KEY}");var s=window.matchMedia("(prefers-color-scheme: dark)").matches;var d=t==="dark"||((t==="system"||!t)&&s);document.documentElement.classList.toggle("dark",d);}catch(e){}})();`;
}
