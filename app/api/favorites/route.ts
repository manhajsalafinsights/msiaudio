import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma/client";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ favorited: false });
  }

  const { searchParams } = new URL(request.url);
  const seriesId = searchParams.get("seriesId");

  if (!seriesId) {
    return NextResponse.json({ favorited: false });
  }

  const favorite = await prisma.favoriteSeries.findUnique({
    where: { userId_seriesId: { userId: user.id, seriesId } },
    select: { id: true },
  });

  return NextResponse.json({ favorited: !!favorite });
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { seriesId } = await request.json();

  if (!seriesId) {
    return NextResponse.json({ error: "seriesId wajib diisi" }, { status: 400 });
  }

  const existing = await prisma.favoriteSeries.findUnique({
    where: { userId_seriesId: { userId: user.id, seriesId } },
  });

  if (existing) {
    await prisma.favoriteSeries.delete({ where: { id: existing.id } });
    return NextResponse.json({ favorited: false });
  }

  await prisma.favoriteSeries.create({
    data: { userId: user.id, seriesId },
  });

  return NextResponse.json({ favorited: true });
}
