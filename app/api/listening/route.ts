import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma/client";

export async function GET(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ completed: {} });
  }

  const { searchParams } = new URL(request.url);
  const audioIds = searchParams
    .get("audioIds")
    ?.split(",")
    .map((id) => id.trim())
    .filter(Boolean);

  if (!audioIds?.length) {
    return NextResponse.json({ completed: {} });
  }

  const rows = await prisma.listeningHistory.findMany({
    where: { userId: user.id, audioId: { in: audioIds } },
    select: { audioId: true, completed: true },
  });

  const completed: Record<string, boolean> = {};
  for (const row of rows) {
    completed[row.audioId] = row.completed;
  }

  return NextResponse.json({ completed });
}
