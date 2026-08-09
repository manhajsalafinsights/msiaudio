import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma/client";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ notes: [] });
  }

  const { searchParams } = new URL(request.url);
  const audioId = searchParams.get("audioId");

  if (!audioId) {
    return NextResponse.json({ notes: [] });
  }

  const notes = await prisma.note.findMany({
    where: { userId: user.id, audioId },
    orderBy: { positionSeconds: "asc" },
  });

  return NextResponse.json({ notes });
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { audioId, positionSeconds, content } = body;

  if (!audioId || typeof content !== "string" || content.trim().length === 0) {
    return NextResponse.json({ error: "audioId dan content wajib diisi" }, { status: 400 });
  }

  const note = await prisma.note.create({
    data: {
      userId: user.id,
      audioId,
      positionSeconds: Math.max(0, Math.floor(Number(positionSeconds) || 0)),
      content: content.trim(),
    },
  });

  return NextResponse.json({ note });
}
