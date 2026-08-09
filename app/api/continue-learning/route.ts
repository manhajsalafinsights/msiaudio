import { NextResponse } from "next/server";
import { getContinueLearning } from "@/features/progress/progress-actions";

export async function GET() {
  const items = await getContinueLearning(5);

  const result = items.map((item) => ({
    id: item.id,
    progressPercent: item.progressPercent,
    series: {
      cover: item.series.cover,
      judul: item.series.judul,
      slug: item.series.slug,
    },
    lastAudio: item.lastAudio
      ? {
          judul: item.lastAudio.judul,
          slug: item.lastAudio.slug,
          durasi: item.lastAudio.durasi,
        }
      : null,
  }));

  return NextResponse.json({ items: result });
}
