import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma/client";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ bookmarked: false });
  }

  const { searchParams } = new URL(request.url);
  const audioId = searchParams.get("audioId");

  if (!audioId) {
    return NextResponse.json({ bookmarked: false });
  }

  const bookmark = await prisma.bookmark.findUnique({
    where: { userId_audioId: { userId: user.id, audioId } },
    select: { id: true },
  });

  return NextResponse.json({ bookmarked: !!bookmark });
}