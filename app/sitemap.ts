import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/seo";
import { listPublishedSeriesSlugs } from "@/repositories/series-repository";
import { listPublishedSeriesTypeSlugs } from "@/repositories/series-type-repository";
import { listPublishedSpeakerSlugs } from "@/repositories/speaker-repository";
import { listPublishedCategorySlugs } from "@/repositories/category-repository";
import { listPublishedTagSlugs } from "@/repositories/tag-repository";
import { listPublishedAudioSlugs } from "@/repositories/audio-repository";

const STATIC_ROUTES = ["/", "/explore", "/series", "/kitab", "/pemateri", "/kategori"] as const;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const lastModified = new Date();

  const [series, kitab, pemateri, kategori, tag, audio] = await Promise.all([
    listPublishedSeriesSlugs(),
    listPublishedSeriesTypeSlugs(),
    listPublishedSpeakerSlugs(),
    listPublishedCategorySlugs(),
    listPublishedTagSlugs(),
    listPublishedAudioSlugs(),
  ]);

  const staticEntries: MetadataRoute.Sitemap = STATIC_ROUTES.map((route) => ({
    url: absoluteUrl(route),
    lastModified,
    changeFrequency: "weekly",
    priority: route === "/" ? 1 : 0.7,
  }));

  const collectionEntries = (
    entries: string[],
    prefix: string,
    priority: number,
  ): MetadataRoute.Sitemap =>
    entries.map((slug) => ({
      url: absoluteUrl(`/${prefix}/${slug}`),
      lastModified,
      changeFrequency: "weekly",
      priority,
    }));

  return [
    ...staticEntries,
    ...collectionEntries(series, "series", 0.8),
    ...collectionEntries(audio, "audio", 0.8),
    ...collectionEntries(kitab, "kitab", 0.6),
    ...collectionEntries(pemateri, "pemateri", 0.6),
    ...collectionEntries(kategori, "kategori", 0.5),
    ...collectionEntries(tag, "tag", 0.5),
  ];
}
