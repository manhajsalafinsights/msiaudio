import { NextResponse } from "next/server";

const UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";
const KEY = "AIzaSyAO_FJ2SlqU8Q4STEHLGCilw_Y9_11qcW8";

const CLIENTS = [
  { clientName: "WEB", clientVersion: "2.20240101.00.00" },
  { clientName: "ANDROID", clientVersion: "19.09.37" },
  { clientName: "TVHTML5_SIMPLY_EMBEDDED_PLAYER", clientVersion: "2.0" },
  { clientName: "WEB_EMBEDDED_PLAYER", clientVersion: "1.20240101.00.00" },
  { clientName: "IOS", clientVersion: "19.09.3" },
];

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const url = searchParams.get("url") ?? "";
  const m = url.match(/(?:v=|youtu\.be\/)([\w-]{11})/);
  if (!m) return NextResponse.json({ error: "bad url" }, { status: 400 });
  const videoId = m[1];

  const results: Record<string, unknown>[] = [];
  for (const client of CLIENTS) {
    try {
      const res = await fetch(`https://www.youtube.com/youtubei/v1/player?key=${KEY}`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "User-Agent": UA },
        body: JSON.stringify({
          context: { client: { ...client, hl: "id", gl: "ID" } },
          videoId,
        }),
        signal: AbortSignal.timeout(8000),
      });
      const data = (await res.json()) as {
        playabilityStatus?: { status?: string; reason?: string };
        videoDetails?: { title?: string; lengthSeconds?: string };
        error?: { message?: string };
      };
      results.push({
        client: client.clientName,
        status: res.status,
        playability: data.playabilityStatus?.status ?? null,
        reason: data.playabilityStatus?.reason ?? data.error?.message ?? null,
        title: data.videoDetails?.title ?? null,
        lengthSeconds: data.videoDetails?.lengthSeconds ?? null,
      });
    } catch (e) {
      results.push({
        client: client.clientName,
        error: e instanceof Error ? e.message : String(e),
      });
    }
  }

  return NextResponse.json({ videoId, results });
}
