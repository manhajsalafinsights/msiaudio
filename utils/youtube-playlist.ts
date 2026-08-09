import { getYouTubeThumbnail } from "@/utils/media";

export type YouTubePlaylistItem = {
  /** Posisi di playlist (1-based). */
  position: number;
  videoId: string;
  title: string;
  durationSeconds: number | null;
  thumbnail: string;
};

export type YouTubePlaylistResult =
  | {
      ok: true;
      playlistTitle: string;
      items: YouTubePlaylistItem[];
      source: "data-api" | "rss";
      truncated: boolean;
    }
  | { ok: false; error: { code: string; message: string } };

const PLAYLIST_ID_PATTERN = /^[A-Za-z0-9_-]{10,}$/;
const MAX_ITEMS_API = 500;
const MAX_ITEMS_RSS = 50;

/** Ekstrak playlist ID dari URL (list=...) atau ID polos. */
export function extractPlaylistId(input: string): string | null {
  const value = input.trim();
  if (!value) return null;
  try {
    const url = new URL(value);
    const list = url.searchParams.get("list");
    if (list && PLAYLIST_ID_PATTERN.test(list)) return list;
  } catch {
    // bukan URL valid — fallthrough ke pengecekan ID polos
  }
  return PLAYLIST_ID_PATTERN.test(value) ? value : null;
}

function parseISO8601Duration(input?: string): number | null {
  if (!input) return null;
  const m = input.match(/^PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?$/);
  if (!m) return null;
  const total = Number(m[1] ?? 0) * 3600 + Number(m[2] ?? 0) * 60 + Number(m[3] ?? 0);
  return total > 0 ? total : null;
}

function unescapeXml(value: string): string {
  return value
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, "&")
    .replace(/&#(\d+);/g, (_, n: string) => String.fromCodePoint(Number(n)));
}

async function fetchJson<T>(url: string): Promise<T | null> {
  const res = await fetch(url, {
    headers: { Accept: "application/json" },
    signal: AbortSignal.timeout(15000),
  });
  if (!res.ok) return null;
  return (await res.json()) as T;
}

async function fetchDurationsByBatch(
  videoIds: string[],
  apiKey: string,
): Promise<Map<string, number>> {
  const durations = new Map<string, number>();
  for (let i = 0; i < videoIds.length; i += 50) {
    const chunk = videoIds.slice(i, i + 50);
    const data = await fetchJson<{
      items?: { id?: string; contentDetails?: { duration?: string } }[];
    }>(
      `https://www.googleapis.com/youtube/v3/videos?part=contentDetails&id=${chunk.join(",")}&key=${apiKey}`,
    );
    if (!data?.items) continue;
    for (const item of data.items) {
      if (!item.id) continue;
      const len = parseISO8601Duration(item.contentDetails?.duration);
      if (len) durations.set(item.id, len);
    }
  }
  return durations;
}

type PlaylistItemsPage = {
  items?: {
    snippet?: {
      position?: number;
      title?: string;
      resourceId?: { kind?: string; videoId?: string };
    };
  }[];
  nextPageToken?: string;
};

async function fetchPlaylistViaDataApi(playlistId: string, apiKey: string) {
  const [playlistData, firstPage] = await Promise.all([
    fetchJson<{ items?: { snippet?: { title?: string } }[] }>(
      `https://www.googleapis.com/youtube/v3/playlists?part=snippet&id=${playlistId}&key=${apiKey}`,
    ),
    fetchJson<PlaylistItemsPage>(
      `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId=${playlistId}&maxResults=50&key=${apiKey}`,
    ),
  ]);

  const playlistTitle = playlistData?.items?.[0]?.snippet?.title?.trim() || "";
  const raw: { position: number; videoId: string; title: string }[] = [];
  const seen = new Set<string>();

  const collect = (page?: PlaylistItemsPage | null) => {
    for (const item of page?.items ?? []) {
      const snippet = item.snippet;
      if (snippet?.resourceId?.kind !== "youtube#video") continue;
      const videoId = snippet.resourceId.videoId;
      if (!videoId || seen.has(videoId)) continue;
      seen.add(videoId);
      raw.push({
        position: (snippet.position ?? 0) + 1,
        videoId,
        title: snippet.title?.trim() || "",
      });
    }
  };

  collect(firstPage);

  let nextPageToken = firstPage?.nextPageToken;
  while (nextPageToken && raw.length < MAX_ITEMS_API) {
    const page = await fetchJson<PlaylistItemsPage>(
      `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId=${playlistId}&maxResults=50&pageToken=${nextPageToken}&key=${apiKey}`,
    );
    if (!page) break;
    collect(page);
    nextPageToken = page.nextPageToken;
  }

  if (raw.length === 0) {
    return {
      ok: false as const,
      error: {
        code: "NOT_FOUND",
        message: "Playlist kosong atau tidak dapat diambil (mungkin private)",
      },
    };
  }

  const durations = await fetchDurationsByBatch(
    raw.map((r) => r.videoId),
    apiKey,
  );

  return {
    ok: true as const,
    playlistTitle,
    items: raw.map<YouTubePlaylistItem>((r) => ({
      ...r,
      durationSeconds: durations.get(r.videoId) ?? null,
      thumbnail: getYouTubeThumbnail(r.videoId),
    })),
    source: "data-api" as const,
    truncated: raw.length >= MAX_ITEMS_API,
  };
}

async function fetchPlaylistViaRss(playlistId: string): Promise<YouTubePlaylistResult> {
  try {
    const res = await fetch(
      `https://www.youtube.com/feeds/videos.xml?playlist_id=${encodeURIComponent(playlistId)}`,
      { signal: AbortSignal.timeout(15000) },
    );
    if (!res.ok) {
      return {
        ok: false,
        error: {
          code: "FETCH_FAILED",
          message: `Gagal mengambil playlist (HTTP ${res.status})`,
        },
      };
    }
    const xml = await res.text();
    const entries = [...xml.matchAll(/<entry>([\s\S]*?)<\/entry>/g)].map((m) => m[1]);
    if (entries.length === 0) {
      return {
        ok: false,
        error: { code: "NOT_FOUND", message: "Playlist kosong atau tidak ditemukan" },
      };
    }

    const parsed: YouTubePlaylistItem[] = [];
    for (const entry of entries.slice(0, MAX_ITEMS_RSS)) {
      const videoId = entry.match(/<yt:videoId>([^<]+)<\/yt:videoId>/)?.[1]?.trim();
      const title = entry.match(/<title>([\s\S]*?)<\/title>/)?.[1];
      const positionMatch = entry.match(/<yt:position>(\d+)<\/yt:position>/)?.[1];
      if (!videoId || !title) continue;
      parsed.push({
        position: positionMatch ? Number(positionMatch) : parsed.length + 1,
        videoId,
        title: unescapeXml(title.trim()),
        durationSeconds: null,
        thumbnail: getYouTubeThumbnail(videoId),
      });
    }
    parsed.sort((a, b) => a.position - b.position);

    const playlistTitle =
      unescapeXml(xml.match(/<title>([\s\S]*?)<\/title>/)?.[1]?.trim() ?? "") || "Playlist";

    return {
      ok: true,
      playlistTitle,
      items: parsed,
      source: "rss",
      truncated: entries.length > MAX_ITEMS_RSS,
    };
  } catch (error) {
    return {
      ok: false,
      error: {
        code: "UNKNOWN_ERROR",
        message: error instanceof Error ? error.message : "Gagal mengambil playlist",
      },
    };
  }
}

/**
 * Ambil daftar video playlist YouTube.
 * Prioritas: YouTube Data API v3 (bila YOUTUBE_API_KEY tersedia) — semua video + durasi.
 * Cadangan: RSS feeds/videos.xml — max ~50 video terbaru, tanpa durasi.
 */
export async function fetchYouTubePlaylist(playlistId: string): Promise<YouTubePlaylistResult> {
  const apiKey = process.env.YOUTUBE_API_KEY;
  if (apiKey) {
    const result = await fetchPlaylistViaDataApi(playlistId, apiKey);
    if (result.ok) return result;
  }
  return fetchPlaylistViaRss(playlistId);
}
