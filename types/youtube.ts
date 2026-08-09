/** Helper tipe YouTube (lihat utils/media.ts). */

/** Video ID YouTube — 11 karakter [A-Za-z0-9_-]. */
export type YouTubeVideoId = string;

export type YouTubeOEmbed = {
  title: string;
  author_name: string;
  author_url: string;
  thumbnail_url: string;
  width: number;
  height: number;
};

export type ParseYouTubeResult =
  { ok: true; videoId: YouTubeVideoId } | { ok: false; error: string };
