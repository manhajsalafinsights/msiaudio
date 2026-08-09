import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const url = searchParams.get("url") ?? "";
  const m = url.match(/(?:v=|youtu\.be\/)([\w-]{11})/);
  if (!m) return NextResponse.json({ error: "bad url" }, { status: 400 });
  const videoId = m[1];

  const results: Record<string, unknown>[] = [];

  const pipedInstances = ["https://pipedapi.kavin.rocks", "https://pipedapi.adminforge.de"];
  for (const base of pipedInstances) {
    try {
      const res = await fetch(`${base}/streams/${videoId}`, {
        headers: { "User-Agent": "Mozilla/5.0" },
        signal: AbortSignal.timeout(8000),
      });
      const data = (await res.json()) as {
        title?: string;
        duration?: number;
        error?: string;
        message?: string;
      };
      results.push({
        source: `piped:${base}`,
        status: res.status,
        title: data.title ?? null,
        duration: data.duration ?? null,
        error: data.error ?? data.message ?? null,
      });
    } catch (e) {
      results.push({ source: `piped:${base}`, error: e instanceof Error ? e.message : String(e) });
    }
  }

  const invidiousInstances = ["https://inv.nadeko.net", "https://invidious.jing.rocks"];
  for (const base of invidiousInstances) {
    try {
      const res = await fetch(`${base}/api/v1/videos/${videoId}`, {
        headers: { "User-Agent": "Mozilla/5.0" },
        signal: AbortSignal.timeout(8000),
      });
      const data = (await res.json()) as {
        title?: string;
        lengthSeconds?: number;
        error?: string;
      };
      results.push({
        source: `invidious:${base}`,
        status: res.status,
        title: data.title ?? null,
        lengthSeconds: data.lengthSeconds ?? null,
        error: data.error ?? null,
      });
    } catch (e) {
      results.push({
        source: `invidious:${base}`,
        error: e instanceof Error ? e.message : String(e),
      });
    }
  }

  return NextResponse.json({ videoId, results });
}
