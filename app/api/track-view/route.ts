import { prisma } from "@/lib/prisma/client";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const kind = body?.kind;
  const slug = typeof body?.slug === "string" && body.slug.length > 0 ? body.slug : null;

  if (kind === "series" && slug) {
    await prisma.series.updateMany({
      where: { slug, published: true },
      data: { viewCount: { increment: 1 } },
    });
    return NextResponse.json({ ok: true });
  }

  if (kind === "kitab" && slug) {
    await prisma.seriesType.updateMany({
      where: { slug },
      data: { viewCount: { increment: 1 } },
    });
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: "Invalid target" }, { status: 400 });
}
