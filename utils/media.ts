import type { ParseYouTubeResult, YouTubeVideoId, YouTubeOEmbed } from "@/types/youtube";

const YOUTUBE_ID_PATTERN = /^[A-Za-z0-9_-]{11}$/;

/**
 * Ekstraksi video ID dari berbagai format URL YouTube.
 * (Pola: youtube.com/watch?v=, youtu.be/, youtube.com/shorts/, embed/)
 */
export function extractYouTubeVideoId(url: string): string | null {
  if (!url) return null;

  try {
    const parsed = new URL(url);
    const host = parsed.hostname.replace(/^www\./, "");

    if (host === "youtu.be") {
      return validateVideoId(parsed.pathname.slice(1));
    }

    if (host.endsWith("youtube.com")) {
      if (parsed.searchParams.has("v")) {
        return validateVideoId(parsed.searchParams.get("v") ?? "");
      }
      const segments = parsed.pathname.split("/").filter(Boolean);
      const last = segments[segments.length - 1];
      if (segments[0] === "embed" || segments[0] === "shorts" || segments[0] === "live") {
        return validateVideoId(last);
      }
    }
  } catch {
    return null;
  }

  return null;
}

export function parseYouTubeUrl(url: string): ParseYouTubeResult {
  const videoId = extractYouTubeVideoId(url);
  if (!videoId) {
    return { ok: false, error: "URL YouTube tidak valid." };
  }
  return { ok: true, videoId };
}

function validateVideoId(value: string): YouTubeVideoId | null {
  return YOUTUBE_ID_PATTERN.test(value) ? value : null;
}

export type YouTubeThumbnailQuality =
  "default" | "mqdefault" | "hqdefault" | "sddefault" | "maxresdefault";

export function getYouTubeThumbnail(
  videoId: YouTubeVideoId,
  quality: YouTubeThumbnailQuality = "mqdefault",
): string {
  return `https://i.ytimg.com/vi/${videoId}/${quality}.jpg`;
}

/** Fetch judul/thumbnail via oEmbed (tanpa API key). */
export async function getYouTubeOEmbed(url: string): Promise<YouTubeOEmbed | null> {
  const endpoint = `https://www.youtube.com/oembed?format=json&url=${encodeURIComponent(url)}`;
  const res = await fetch(endpoint);
  if (!res.ok) return null;
  return (await res.json()) as YouTubeOEmbed;
}
