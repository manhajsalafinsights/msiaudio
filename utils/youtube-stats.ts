/** Statistik video YouTube (dari Data API v3, part=statistics). */
export type YoutubeVideoStats = {
  viewCount: number;
  likeCount: number;
};

/**
 * Ambil statistik video YouTube (views, likes).
 * Biaya kuota: 1 unit per video, maks. 50 id per request.
 * Tanpa YOUTUBE_API_KEY → Map kosong (tidak fatal).
 */
export async function fetchYoutubeVideoStats(
  videoIds: string[],
): Promise<Map<string, YoutubeVideoStats>> {
  const stats = new Map<string, YoutubeVideoStats>();
  const apiKey = process.env.YOUTUBE_API_KEY;
  if (!apiKey || videoIds.length === 0) return stats;

  for (let i = 0; i < videoIds.length; i += 50) {
    const chunk = videoIds.slice(i, i + 50);
    try {
      const res = await fetch(
        `https://www.googleapis.com/youtube/v3/videos?part=statistics&id=${chunk.join(",")}&key=${apiKey}`,
        { signal: AbortSignal.timeout(15000) },
      );
      if (!res.ok) continue;
      const data = (await res.json()) as {
        items?: {
          id?: string;
          statistics?: { viewCount?: string; likeCount?: string };
        }[];
      };
      for (const item of data.items ?? []) {
        if (!item.id || !item.statistics) continue;
        const viewCount = Number(item.statistics.viewCount ?? 0);
        if (!Number.isFinite(viewCount) || viewCount <= 0) continue;
        stats.set(item.id, {
          viewCount,
          likeCount: Number(item.statistics.likeCount ?? 0) || 0,
        });
      }
    } catch {
      // lanjut batch berikutnya
    }
  }
  return stats;
}

/** Metadata dengan statistik terkini (untuk MediaSource.metadata). */
export function withYoutubeStats<T extends object>(
  metadata: T | null | undefined,
  stats?: YoutubeVideoStats,
): T & { viewCount?: number; likeCount?: number; statsFetchedAt?: string } {
  return {
    ...(metadata ?? {}),
    ...(stats
      ? {
          viewCount: stats.viewCount,
          likeCount: stats.likeCount,
          statsFetchedAt: new Date().toISOString(),
        }
      : {}),
  } as T & { viewCount?: number; likeCount?: number; statsFetchedAt?: string };
}

/** Jumlah total view YouTube dari kumpulan media source (sumber metadata). */
export function sumSourceViews(
  mediaSources: { provider: string; metadata: unknown }[] | null | undefined,
): number {
  let total = 0;
  for (const source of mediaSources ?? []) {
    if (source.provider !== "YOUTUBE") continue;
    const metadata = (source.metadata ?? {}) as { viewCount?: unknown };
    const views = typeof metadata.viewCount === "number" ? metadata.viewCount : 0;
    if (Number.isFinite(views) && views > 0) total += views;
  }
  return total;
}