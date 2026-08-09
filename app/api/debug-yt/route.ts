import { NextResponse } from "next/server";

const UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";
const KEY = "AIzaSyAO_FJ2SlqU8Q4STEHLGCilw_Y9_11qcW8";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const url = searchParams.get("url") ?? "";
  const m = url.match(/(?:v=|youtu\.be\/)([\w-]{11})/);
  if (!m) return NextResponse.json({ error: "bad url" }, { status: 400 });
  const videoId = m[1];
  const out: Record<string, unknown> = { videoId };

  try {
    const res = await fetch(`https://www.youtube.com/youtubei/v1/player?key=${KEY}`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "User-Agent": UA },
      body: JSON.stringify({
        context: {
          client: { clientName: "WEB", clientVersion: "2.20240101.00.00", hl: "id", gl: "ID" },
        },
        videoId,
      }),
      signal: AbortSignal.timeout(10000),
    });
    out.youtubeiStatus = res.status;
    const text = await res.text();
    try {
      const data = JSON.parse(text);
      out.youtubei = {
        playability: data.playabilityStatus?.status,
        reason: data.playabilityStatus?.reason ?? null,
        title: data.videoDetails?.title ?? null,
        lengthSeconds: data.videoDetails?.lengthSeconds ?? null,
      };
    } catch {
      out.youtubei = { parseError: text.slice(0, 500) };
    }
  } catch (e) {
    out.youtubeiError = e instanceof Error ? e.message : String(e);
  }

  try {
    const res = await fetch(`https://www.youtube.com/watch?v=${videoId}&hl=en`, {
      headers: { "Accept-Language": "en", "User-Agent": UA },
      signal: AbortSignal.timeout(10000),
    });
    const html = await res.text();
    out.watchStatus = res.status;
    out.watchLen = html.length;
    out.watchHasConsent = /consent\.youtube/.test(html);
    out.watchLengthSeconds = html.match(/"lengthSeconds":"?(\d+)"?/)?.[1] ?? null;
  } catch (e) {
    out.watchError = e instanceof Error ? e.message : String(e);
  }

  return NextResponse.json(out);
}
