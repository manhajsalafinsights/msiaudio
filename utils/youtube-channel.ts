/**
 * Utilitas YouTube channel — mengambil daftar SEMUA playlist dari 1 link channel.
 * Butuh YOUTUBE_API_KEY (Data API v3):
 * - channels.list → resolve @handle / /user/ / /channel/ menjadi channelId (1 unit).
 * - playlists.list  → paginasi seluruh playlist channel (1 unit per halaman).
 */

export type ChannelPlaylist = {
  id: string;
  title: string;
  itemCount: number;
};

export type ResolveChannelResult =
  | { ok: true; channelId: string }
  | { ok: false; error: { code: string; message: string } };

export type ChannelPlaylistsResult = {
  channelTitle: string;
  uploadsPlaylistId: string | null;
  playlists: ChannelPlaylist[];
  truncated: boolean;
};

const CHANNEL_ID_PATTERN = /^UC[A-Za-z0-9_-]{22}$/;

async function fetchJson<T>(url: string): Promise<T | null> {
  try {
    const res = await fetch(url, {
      headers: { Accept: "application/json" },
      signal: AbortSignal.timeout(15000),
    });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

type ChannelInfo = {
  items?: {
    id?: string;
    snippet?: { title?: string };
    contentDetails?: { relatedPlaylists?: { uploads?: string } };
  }[];
};

async function resolveViaChannelsApi(params: Record<string, string>, apiKey: string) {
  const qs = new URLSearchParams({
    part: "snippet,contentDetails",
    maxResults: "1",
    key: apiKey,
    ...params,
  });
  const data = await fetchJson<ChannelInfo>(`https://www.googleapis.com/youtube/v3/channels?${qs}`);
  const item = data?.items?.[0];
  if (!item?.id) return null;
  return {
    channelId: item.id,
    channelTitle: item.snippet?.title?.trim() ?? "",
    uploadsPlaylistId: item.contentDetails?.relatedPlaylists?.uploads ?? null,
  };
}

/** Resolve link channel (@handle / /channel/ / /user/ / ID polos) menjadi channelId. */
export async function resolveChannelId(input: string): Promise<ResolveChannelResult> {
  const value = input.trim();
  if (!value) {
    return { ok: false, error: { code: "VALIDATION_ERROR", message: "Link channel wajib diisi" } };
  }
  const apiKey = process.env.YOUTUBE_API_KEY;
  if (!apiKey) {
    return {
      ok: false,
      error: {
        code: "NO_API_KEY",
        message: "YOUTUBE_API_KEY belum diatur — fitur import channel butuh YouTube Data API.",
      },
    };
  }

  interface Resolved {
    channelId: string;
    channelTitle: string;
    uploadsPlaylistId: string | null;
  }
  let resolved: Resolved | null = null;

  try {
    const url = new URL(value);
    const host = url.hostname.replace(/^www\./, "");
    const segments = url.pathname.split("/").filter(Boolean);
    if ((host === "youtube.com" || host.endsWith("youtube.com")) && segments.length > 0) {
      if (segments[0] === "channel" && segments[1]) {
        resolved = { channelId: segments[1], channelTitle: "", uploadsPlaylistId: null };
      } else if (segments[0] === "user" && segments[1]) {
        resolved = await resolveViaChannelsApi({ forUsername: segments[1] }, apiKey);
      } else if (segments[0].startsWith("@")) {
        resolved = await resolveViaChannelsApi({ forHandle: segments[0] }, apiKey);
      }
    }
  } catch {
    // bukan URL valid — lanjut ke pengecekan ID polos / @handle
  }

  if (!resolved) {
    if (value.startsWith("@")) {
      resolved = await resolveViaChannelsApi({ forHandle: value }, apiKey);
    } else if (CHANNEL_ID_PATTERN.test(value)) {
      resolved = { channelId: value, channelTitle: "", uploadsPlaylistId: null };
    }
  }

  if (!resolved) {
    return {
      ok: false,
      error: {
        code: "INVALID_CHANNEL",
        message:
          "Link channel tidak dikenali. Gunakan format @handle (contoh: @yufid), /channel/UC..., /user/..., atau ID polos UC...",
      },
    };
  }
  return { ok: true, channelId: resolved.channelId };
}

/** Ambil seluruh playlist channel. Playlist auto "uploads" di-skip (redundan). */
export async function fetchChannelPlaylists(channelId: string): Promise<ChannelPlaylistsResult> {
  const apiKey = process.env.YOUTUBE_API_KEY ?? "";

  const info = await fetchJson<ChannelInfo>(
    `https://www.googleapis.com/youtube/v3/channels?part=snippet,contentDetails&id=${channelId}&key=${apiKey}`,
  );

  const playlists: ChannelPlaylist[] = [];
  let pageToken = "";
  let truncated = false;

  do {
    const qs = new URLSearchParams({
      part: "snippet",
      channelId,
      maxResults: "50",
      key: apiKey,
      ...(pageToken ? { pageToken } : {}),
    });
    const data = await fetchJson<{
      items?: {
        id?: string;
        snippet?: { title?: string };
        contentDetails?: { itemCount?: number };
      }[];
      nextPageToken?: string;
    }>(`https://www.googleapis.com/youtube/v3/playlists?${qs}`);
    if (!data) break;
    for (const item of data.items ?? []) {
      if (!item.id) continue;
      playlists.push({
        id: item.id,
        title: item.snippet?.title?.trim() || "(tanpa judul)",
        itemCount: item.contentDetails?.itemCount ?? 0,
      });
    }
    pageToken = data.nextPageToken ?? "";
    if (pageToken && playlists.length >= 5000) {
      truncated = true;
      break;
    }
  } while (pageToken);

  const uploadsPlaylistId = info?.items?.[0]?.contentDetails?.relatedPlaylists?.uploads ?? null;
  const filtered = uploadsPlaylistId
    ? playlists.filter((p) => p.id !== uploadsPlaylistId)
    : playlists;

  return {
    channelTitle: info?.items?.[0]?.snippet?.title?.trim() ?? "Channel",
    uploadsPlaylistId,
    playlists: filtered,
    truncated,
  };
}