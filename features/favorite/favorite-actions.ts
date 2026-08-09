import { prisma } from "@/lib/prisma/client";
import { getCurrentUser } from "@/lib/auth/session";
import { seriesPublicInclude } from "@/repositories/series-repository";

/* ================================================================
   FAVORITE ACTIONS (series favorit / diikuti)
   ================================================================ */

export async function getUserFavorites() {
  const user = await getCurrentUser();
  if (!user) return [];

  const favorites = await prisma.favoriteSeries.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    include: { series: { include: seriesPublicInclude } },
  });

  return favorites.map((f) => f.series);
}
