import type { Metadata } from "next";
import { site } from "@/lib/config/site";

type OpenGraph = NonNullable<Metadata["openGraph"]>;
type Twitter = NonNullable<Metadata["twitter"]>;

export const DEFAULT_OG_IMAGE = "/opengraph-image";
export const OG_IMAGE_WIDTH = 1200;
export const OG_IMAGE_HEIGHT = 630;

export function absoluteUrl(path = ""): string {
  if (/^https?:\/\//i.test(path)) return path;
  const base = site.url.replace(/\/+$/, "");
  const p = path && !path.startsWith("/") ? `/${path}` : path;
  return `${base}${p}`;
}

export function canonicalUrl(path = "/"): string {
  return absoluteUrl(path);
}

export function buildOpenGraphImages(
  image?: string | null,
): { url: string; width: number; height: number; alt: string }[] {
  return [
    {
      url: image ? absoluteUrl(image) : absoluteUrl(DEFAULT_OG_IMAGE),
      width: OG_IMAGE_WIDTH,
      height: OG_IMAGE_HEIGHT,
      alt: site.name,
    },
  ];
}

export function buildOpenGraph(overrides: Partial<OpenGraph> = {}, image?: string | null): OpenGraph {
  return {
    type: "website",
    siteName: site.name,
    locale: site.locale,
    title: site.name,
    description: site.description,
    url: absoluteUrl("/"),
    ...overrides,
    images: overrides.images ?? buildOpenGraphImages(image),
  };
}

export function buildTwitter(overrides: Partial<Twitter> = {}, image?: string | null): Twitter {
  return {
    card: "summary_large_image",
    title: site.name,
    description: site.description,
    images: image ? absoluteUrl(image) : absoluteUrl(DEFAULT_OG_IMAGE),
    ...overrides,
  };
}

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export function buildBreadcrumbJsonLd(items: BreadcrumbItem[]): string {
  const itemList = items.map((item, index) => ({
    "@type": "ListItem",
    position: index + 1,
    name: item.label,
    ...(item.href ? { item: canonicalUrl(item.href) } : {}),
  }));
  return JSON.stringify({
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: itemList,
  });
}
