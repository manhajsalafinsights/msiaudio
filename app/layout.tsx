import type { Metadata } from "next";
import "./globals.css";
import { site } from "@/lib/config/site";
import { absoluteUrl, buildOpenGraph, buildTwitter } from "@/lib/seo";
import { ThemeProvider } from "@/providers/theme-provider";
import { themeInitScript } from "@/providers/theme-init";

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: site.name,
    template: `%s — ${site.name}`,
  },
  description: site.description,
  openGraph: buildOpenGraph({
    title: site.name,
    description: site.description,
    url: absoluteUrl("/"),
  }),
  twitter: buildTwitter({
    title: site.name,
    description: site.description,
  }),
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" suppressHydrationWarning className="h-full antialiased">
      <body className="flex min-h-full flex-col bg-background text-foreground">
        <script dangerouslySetInnerHTML={{ __html: themeInitScript() }} />
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
