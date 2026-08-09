import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma/client";
import { NextResponse } from "next/server";

const COMPLETED_THRESHOLD = 0.95;

function computeProgress(positionSeconds: number, duration: number) {
  if (duration <= 0) return { progressPercent: 0, completed: false };
  const progressPercent = Math.min(100, Math.round((positionSeconds / duration) * 100));
  const completed = positionSeconds >= duration * COMPLETED_THRESHOLD;
  return { progressPercent, completed };
}

export async function GET(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ progress: null, history: null });
  }

  const { searchParams } = new URL(request.url);
  const seriesId = searchParams.get("seriesId");
  const audioId = searchParams.get("audioId");

  if (seriesId) {
    const progress = await prisma.userProgress.findUnique({
      where: { userId_seriesId: { userId: user.id, seriesId } },
      include: {
        lastAudio: { select: { id: true, judul: true, slug: true } },
        series: { select: { judul: true, slug: true } },
      },
    });
    return NextResponse.json({ progress, history: null });
  }

  if (audioId) {
    const history = await prisma.listeningHistory.findUnique({
      where: { userId_audioId: { userId: user.id, audioId } },
    });
    return NextResponse.json({ progress: null, history });
  }

  return NextResponse.json({ progress: null, history: null });
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { audioId, seriesId, positionSeconds, duration } = body;

  if (!audioId || !seriesId) {
    return NextResponse.json({ error: "audioId dan seriesId wajib diisi" }, { status: 400 });
  }

  const position = Math.max(0, Math.floor(Number(positionSeconds) || 0));
  const totalDuration = Math.max(0, Math.floor(Number(duration) || 0));
  const { progressPercent, completed } = computeProgress(position, totalDuration);

  const [history] = await Promise.all([
    prisma.listeningHistory.upsert({
      where: { userId_audioId: { userId: user.id, audioId } },
      create: {
        userId: user.id,
        audioId,
        positionSeconds: position,
        progressPercent,
        completed,
        playCount: 1,
        lastPlayedAt: new Date(),
      },
      update: {
        positionSeconds: position,
        progressPercent,
        completed,
        lastPlayedAt: new Date(),
      },
    }),
  ]);

  // Perbarui progress series: completedCount dihitung dari riwayat audio series.
  const [audioCount, completedCount] = await Promise.all([
    prisma.audio.count({ where: { seriesId, published: true } }),
    prisma.listeningHistory.count({
      where: { userId: user.id, completed: true, audio: { seriesId } },
    }),
  ]);

  const seriesProgressPercent =
    audioCount > 0
      ? Math.min(
          100,
          Math.round((completedCount / audioCount) * 100 + (1 / audioCount) * progressPercent)
        )
      : progressPercent;

  const progress = await prisma.userProgress.upsert({
    where: { userId_seriesId: { userId: user.id, seriesId } },
    create: {
      userId: user.id,
      seriesId,
      lastAudioId: audioId,
      positionSeconds: position,
      completedCount,
      progressPercent: seriesProgressPercent,
    },
    update: {
      lastAudioId: audioId,
      positionSeconds: position,
      completedCount,
      progressPercent: seriesProgressPercent,
    },
  });

  return NextResponse.json({ history, progress });
}
