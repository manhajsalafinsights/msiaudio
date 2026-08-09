import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma/client";

export async function GET(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ status: {} });
  }

  const { searchParams } = new URL(request.url);
  const audioIds = searchParams
    .get("audioIds")
    ?.split(",")
    .map((id) => id.trim())
    .filter(Boolean);

  if (!audioIds?.length) {
    return NextResponse.json({ status: {} });
  }

  const rows = await prisma.listeningHistory.findMany({
    where: { userId: user.id, audioId: { in: audioIds } },
    select: { audioId: true, completed: true, progressPercent: true },
  });

  const status: Record<string, { completed: boolean; progressPercent: number }> = {};
  for (const row of rows) {
    status[row.audioId] = { completed: row.completed, progressPercent: row.progressPercent };
  }

  return NextResponse.json({ status });
}
