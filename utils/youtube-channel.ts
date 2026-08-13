/**
 * Utilitas YouTube channel — mengambil daftar SEMUA playlist dari 1 link channel.
 * Butuh YOUTUBE_API_KEY (Data API v3):
 * - channels.list → resolve @handle / /user/ / /channel/ menjadi channelId (1 unit).
 * - playlists.list  → paginasi seluruh playlist channel (1 unit per halaman).
 *
 * Bila kuota harian habis (HTTP 403 QUOTA_EXCEEDED), semua error diseragamkan
 * menjadi QUOTA_EXHAUSTED agar admin tahu penyebabnya.
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
  quotaExhausted?: boolean;
};

const CHANNEL_ID_PATTERN = /^UC[A-Za-z0-9_-]{22}$/;

type ApiResponse<T> = { status: number; data: T | null };

async function fetchApi<T>(url: string): Promise<ApiResponse<T>> {
  try {
    const res = await fetch(url, {
      headers: { Accept: "application/json" },
      signal: AbortSignal.timeout(15000),
    });
    if (!res.ok) return { status: res.status, data: null };
    return { status: res.status, data: (await res.json()) as T };
  } catch {
    return { status: 0, data: null };
  }
}

function quotaError(): ResolveChannelResult {
  return {
    ok: false,
    error: {
      code: "QUOTA_EXHAUSTED",
      message:
        "Kuota YouTube Data API habis hari ini — coba lagi besok, atau tambah kuota di Google Cloud Console.",
    },
  };
}

function isQuota(status: number): boolean {
  return status === 403;
}

type ChannelInfo = {
  items?: {
    id?: string;
    snippet?: { title?: string };
    contentDetails?: { relatedPlaylists?: { uploads?: string } };
  }[];
};

type SearchInfo = {
  items?: { id?: { channelId?: string }; snippet?: { title?: string } }[];
};

async function resolveViaChannelsApi(
  params: Record<string, string>,
  apiKey: string,
): Promise<{ resolved: { channelId: string; channelTitle: string; uploadsPlaylistId: string | null } | null; quota: boolean }> {
  const qs = new URLSearchParams({
    part: "snippet,contentDetails",
    maxResults: "1",
    key: apiKey,
    ...params,
  });
  const { status, data } = await fetchApi<ChannelInfo>(
    `https://www.googleapis.com/youtube/v3/channels?${qs}`,
  );
  if (isQuota(status)) return { resolved: null, quota: true };

  const item = data?.items?.[0];
  if (!item?.id) {
    // Fallback: cari via search.list (handle mungkin tak cocok persis).
    const q = Object.values(params).join(" ").replace(/^@/, "");
    const searchQs = new URLSearchParams({
      part: "snippet",
      type: "channel",
      q,
      maxResults: "1",
      key: apiKey,
    });
    const search = await fetchApi<SearchInfo>(
      `https://www.googleapis.com/youtube/v3/search?${searchQs}`,
    );
    if (isQuota(search.status)) return { resolved: null, quota: true };
    const found = search.data?.items?.[0]?.id?.channelId;
    if (found) {
      return { resolved: { channelId: found, channelTitle: "", uploadsPlaylistId: null }, quota: false };
    }
    return { resolved: null, quota: false };
  }

  return {
    resolved: {
      channelId: item.id,
      channelTitle: item.snippet?.title?.trim() ?? "",
      uploadsPlaylistId: item.contentDetails?.relatedPlaylists?.uploads ?? null,
    },
    quota: false,
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
  let quota = false;

  try {
    const url = new URL(value);
    const host = url.hostname.replace(/^www\./, "");
    const segments = url.pathname.split("/").filter(Boolean);
    if ((host === "youtube.com" || host.endsWith("youtube.com")) && segments.length > 0) {
      if (segments[0] === "channel" && segments[1]) {
        resolved = { channelId: segments[1], channelTitle: "", uploadsPlaylistId: null };
      } else if (segments[0] === "user" && segments[1]) {
        const r = await resolveViaChannelsApi({ forUsername: segments[1] }, apiKey);
        resolved = r.resolved;
        quota = r.quota;
      } else if (segments[0].startsWith("@")) {
        const r = await resolveViaChannelsApi({ forHandle: segments[0] }, apiKey);
        resolved = r.resolved;
        quota = r.quota;
      }
    }
  } catch {
    // bukan URL valid — lanjut ke pengecekan ID polos / @handle
  }

  if (!resolved && !quota) {
    if (value.startsWith("@")) {
      const r = await resolveViaChannelsApi({ forHandle: value }, apiKey);
      resolved = r.resolved;
      quota = r.quota;
    } else if (CHANNEL_ID_PATTERN.test(value)) {
      resolved = { channelId: value, channelTitle: "", uploadsPlaylistId: null };
    }
  }

  if (quota) return quotaError();

  if (!resolved) {
    return {
      ok: false,
      error: {
        code: "INVALID_CHANNEL",
        message:
          "Link channel tidak dikenali atau channel tidak ditemukan. Gunakan format @handle (contoh: @yufid), /channel/UC..., /user/..., atau ID polos UC...",
      },
    };
  }
  return { ok: true, channelId: resolved.channelId };
}

/** Ambil seluruh playlist channel. Playlist auto "uploads" di-skip (redundan). */
export async function fetchChannelPlaylists(channelId: string): Promise<ChannelPlaylistsResult> {
  const apiKey = process.env.YOUTUBE_API_KEY ?? "";

  const info = await fetchApi<ChannelInfo>(
    `https://www.googleapis.com/youtube/v3/channels?part=snippet,contentDetails&id=${channelId}&key=${apiKey}`,
  );
  if (isQuota(info.status)) {
    return {
      channelTitle: "Channel",
      uploadsPlaylistId: null,
      playlists: [],
      truncated: false,
      quotaExhausted: true,
    };
  }

  const playlists: ChannelPlaylist[] = [];
  let pageToken = "";
  let truncated = false;

  do {
    const qs = new URLSearchParams({
      part: "snippet,contentDetails",
      channelId,
      maxResults: "50",
      key: apiKey,
      ...(pageToken ? { pageToken } : {}),
    });
    const { status, data } = await fetchApi<{
      items?: {
        id?: string;
        snippet?: { title?: string };
        contentDetails?: { itemCount?: number };
      }[];
      nextPageToken?: string;
    }>(`https://www.googleapis.com/youtube/v3/playlists?${qs}`);
    if (isQuota(status)) {
      return {
        channelTitle: "Channel",
        uploadsPlaylistId: null,
        playlists: [],
        truncated: false,
        quotaExhausted: true,
      };
    }
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

  const uploadsPlaylistId = info.data?.items?.[0]?.contentDetails?.relatedPlaylists?.uploads ?? null;
  const filtered = uploadsPlaylistId
    ? playlists.filter((p) => p.id !== uploadsPlaylistId)
    : playlists;

  return {
    channelTitle: info.data?.items?.[0]?.snippet?.title?.trim() ?? "Channel",
    uploadsPlaylistId,
    playlists: filtered,
    truncated,
  };
}