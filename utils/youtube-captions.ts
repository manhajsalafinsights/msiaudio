export type TranscriptSegment = {
  start: number;
  end: number;
  text: string;
};

export type YouTubeCaptionsResult =
  | {
      ok: true;
      languageCode: string;
      languageName: string;
      segments: TranscriptSegment[];
    }
  | { ok: false; error: { code: string; message: string } };

type CaptionTrack = {
  baseUrl?: string;
  languageCode?: string;
  name?: { simpleText?: string };
  kind?: string;
};

type PlayerResponse = {
  captions?: {
    playerCaptionsTracklistRenderer?: { captionTracks?: CaptionTrack[] };
  };
};

const INNER_TUBE_PLAYER =
  "https://www.youtube.com/youtubei/v1/player?prettyPrint=false";

/**
 * Ambil daftar track caption via innertube player API.
 * Memakai client ANDROID_VR yang tidak divalidasi seketat WEB/ANDROID,
 * sehingga bisa diakses dari server (tanpa TLS impersonation).
 */
async function fetchCaptionTracks(videoId: string): Promise<CaptionTrack[]> {
  const res = await fetch(INNER_TUBE_PLAYER, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "User-Agent":
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36",
    },
    body: JSON.stringify({
      context: {
        client: {
          clientName: "ANDROID_VR",
          clientVersion: "1.60.19",
          androidSdkVersion: 30,
          deviceModel: "Quest 3",
          hl: "id",
          gl: "US",
        },
      },
      videoId,
    }),
    signal: AbortSignal.timeout(20000),
  });
  if (!res.ok) {
    throw new Error(`YouTube player HTTP ${res.status}`);
  }
  const data = (await res.json()) as PlayerResponse;
  return data.captions?.playerCaptionsTracklistRenderer?.captionTracks ?? [];
}

function unescapeXml(value: string): string {
  return value
    .replace(/<br\s*\/?>/gi, " ")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, "&")
    .replace(/&#(\d+);/g, (_, n: string) => String.fromCodePoint(Number(n)));
}

function cleanText(raw: string): string {
  return unescapeXml(raw.replace(/<[^>]+>/g, " ")).replace(/\s+/g, " ").trim();
}

/**
 * Parse timedtext XML. Mendukung dua format:
 * - srv1: <text start="1.2" dur="3.4">teks</text>
 * - srv3: <p t="1200" d="3400">…<s>teks</s>…</p> (waktu dalam milidetik)
 */
function parseTimedTextXml(xml: string): TranscriptSegment[] {
  const segments: TranscriptSegment[] = [];

  const textPattern = /<text start="([\d.]+)"(?: dur="([\d.]+)")?[^>]*>([\s\S]*?)<\/text>/g;
  let match: RegExpExecArray | null;
  while ((match = textPattern.exec(xml)) !== null) {
    const start = Number(match[1]);
    const dur = match[2] ? Number(match[2]) : 3;
    const text = cleanText(match[3]);
    if (!text) continue;
    segments.push({ start, end: start + dur, text });
  }
  if (segments.length > 0) return segments;

  const pPattern = /<p t="([\d.]+)"(?: d="([\d.]+)")?[^>]*>([\s\S]*?)<\/p>/g;
  while ((match = pPattern.exec(xml)) !== null) {
    const start = Number(match[1]) / 1000;
    const dur = match[2] ? Number(match[2]) / 1000 : 0;
    const text = cleanText(match[3]);
    if (!text) continue;
    segments.push({ start, end: start + dur, text });
  }
  return segments;
}

/** Pilih track caption: utamakan Bahasa Indonesia, lalu bahasa lain/manual. */
function pickTrack(tracks: CaptionTrack[]): CaptionTrack | null {
  if (tracks.length === 0) return null;
  const indo =
    tracks.find((t) => t.languageCode?.toLowerCase().startsWith("id")) ??
    tracks.find((t) => t.languageCode === "in");
  return indo ?? tracks[0];
}

/**
 * Ambil transkrip/caption YouTube sebagai segmen ber-timestamp (detik).
 * Menggunakan API innertube (client ANDROID_VR), lalu parse timedtext XML.
 * Mengutamakan caption Bahasa Indonesia.
 */
export async function fetchYouTubeCaptions(
  videoId: string,
): Promise<YouTubeCaptionsResult> {
  try {
    const tracks = await fetchCaptionTracks(videoId);
    const track = pickTrack(tracks);
    if (!track?.baseUrl) {
      return {
        ok: false,
        error: {
          code: "NO_CAPTION",
          message: "Video ini tidak memiliki subtitle/caption.",
        },
      };
    }

    const res = await fetch(track.baseUrl, {
      headers: { "User-Agent": "Mozilla/5.0" },
      signal: AbortSignal.timeout(20000),
    });
    if (!res.ok) {
      return {
        ok: false,
        error: {
          code: "CAPTION_FETCH_FAILED",
          message: `Gagal mengambil caption (HTTP ${res.status}).`,
        },
      };
    }

    const xml = await res.text();
    const segments = parseTimedTextXml(xml);
    if (segments.length === 0) {
      return {
        ok: false,
        error: { code: "EMPTY_CAPTION", message: "Caption kosong." },
      };
    }

    return {
      ok: true,
      languageCode: track.languageCode ?? "",
      languageName: track.name?.simpleText ?? track.languageCode ?? "",
      segments,
    };
  } catch (error) {
    return {
      ok: false,
      error: {
        code: "UNKNOWN_ERROR",
        message:
          error instanceof Error && error.message
            ? error.message
            : "Gagal mengambil caption",
      },
    };
  }
}

/** Gabungkan segmen menjadi teks polos untuk konten transkrip. */
export function segmentsToPlainText(segments: TranscriptSegment[]): string {
  return segments.map((s) => s.text).join("\n");
}
