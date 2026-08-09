import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma/client";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ bookmarked: false });
  }

  const { audioId } = await request.json();

  if (!audioId) {
    return NextResponse.json({ error: "Audio ID required" }, { status: 400 });
  }

  const existing = await prisma.bookmark.findUnique({
    where: { userId_audioId: { userId: user.id, audioId } },
  });

  if (existing) {
    await prisma.bookmark.delete({ where: { id: existing.id } });
    return NextResponse.json({ bookmarked: false });
  }

  await prisma.bookmark.create({
    data: { userId: user.id, audioId },
  });

  return NextResponse.json({ bookmarked: true });
}