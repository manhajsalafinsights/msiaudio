import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma/client";

/* ================================================================
   DASHBOARD REPOSITORY
   Semua query ter-scope userId (session) — tidak ada data lintas user.
   ================================================================ */

export interface DashboardStatistics {
  totalAudioDidengar: number;
  totalAudioSelesai: number;
  totalMenit: number;
  totalSeriesDiikuti: number;
  totalBookmark: number;
  totalCatatan: number;
}

export async function getUserStatistics(userId: string): Promise<DashboardStatistics> {
  const [totalAudioDidengar, totalAudioSelesai, totalSeriesDiikuti, totalBookmark, totalCatatan, durations] =
    await Promise.all([
      prisma.listeningHistory.count({ where: { userId } }),
      prisma.listeningHistory.count({ where: { userId, completed: true } }),
      prisma.userProgress.count({ where: { userId } }),
      prisma.bookmark.count({ where: { userId } }),
      prisma.note.count({ where: { userId } }),
      prisma.listeningHistory.findMany({
        where: { userId },
        select: { audio: { select: { durasi: true } } },
      }),
    ]);

  const totalSeconds = durations.reduce((sum, h) => sum + h.audio.durasi, 0);

  return {
    totalAudioDidengar,
    totalAudioSelesai,
    totalMenit: Math.round(totalSeconds / 60),
    totalSeriesDiikuti,
    totalBookmark,
    totalCatatan,
  };
}

/* ------------------------------------------------------------
   Series progress (Series Saya & Series Selesai)
   ------------------------------------------------------------ */

export const seriesProgressInclude = {
  series: { select: { id: true, judul: true, slug: true, cover: true, totalSesi: true } },
  lastAudio: {
    select: { id: true, judul: true, slug: true, nomorSesi: true, durasi: true },
  },
} satisfies Prisma.UserProgressInclude;

export type SeriesProgressItem = Prisma.UserProgressGetPayload<{
  include: typeof seriesProgressInclude;
}> & { completed: boolean };

export async function getSeriesProgress(userId: string) {
  const rows = await prisma.userProgress.findMany({
    where: { userId },
    orderBy: { updatedAt: "desc" },
    include: seriesProgressInclude,
  });

  const items: SeriesProgressItem[] = rows.map((row) => ({
    ...row,
    completed:
      row.progressPercent >= 100 ||
      (row.series.totalSesi > 0 && row.completedCount >= row.series.totalSesi),
  }));

  return {
    inProgress: items.filter((i) => !i.completed),
    completed: items.filter((i) => i.completed),
  };
}

/* ------------------------------------------------------------
   Recently played (terakhir diputar)
   ------------------------------------------------------------ */

export const recentlyPlayedInclude = {
  audio: {
    select: {
      id: true,
      judul: true,
      slug: true,
      durasi: true,
      cover: true,
      nomorSesi: true,
      series: { select: { id: true, judul: true, slug: true } },
    },
  },
} satisfies Prisma.ListeningHistoryInclude;

export async function getRecentlyPlayed(userId: string, limit = 5) {
  return prisma.listeningHistory.findMany({
    where: { userId },
    orderBy: { lastPlayedAt: "desc" },
    take: limit,
    include: recentlyPlayedInclude,
  });
}

/* ------------------------------------------------------------
   Aktivitas mingguan (7 hari terakhir)
   ------------------------------------------------------------ */

export interface WeeklyActivityEntry {
  date: string; // YYYY-MM-DD
  label: string; // contoh: "Sen" / "15"
  count: number;
}

function isoDateKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export async function getWeeklyListeningActivity(userId: string): Promise<WeeklyActivityEntry[]> {
  const today = new Date();
  const start = new Date(today);
  start.setHours(0, 0, 0, 0);
  start.setDate(start.getDate() - 6);

  const rows = await prisma.listeningHistory.findMany({
    where: { userId, lastPlayedAt: { gte: start } },
    select: { lastPlayedAt: true },
  });

  const perDay = new Map<string, number>();
  for (const row of rows) {
    const key = isoDateKey(row.lastPlayedAt);
    perDay.set(key, (perDay.get(key) ?? 0) + 1);
  }

  const days: WeeklyActivityEntry[] = [];
  for (let i = 6; i >= 0; i--) {
    const day = new Date(start);
    day.setDate(start.getDate() + i);
    const key = isoDateKey(day);
    days.push({
      date: key,
      label: `${day.getDate()}`,
      count: perDay.get(key) ?? 0,
    });
  }

  return days;
}

/* ------------------------------------------------------------
   Riwayat lengkap (search + pagination)
   ------------------------------------------------------------ */

const historyWhere = (userId: string, search?: string): Prisma.ListeningHistoryWhereInput => {
  if (!search) return { userId };
  return {
    userId,
    OR: [
      { audio: { judul: { contains: search, mode: "insensitive" } } },
      { audio: { series: { judul: { contains: search, mode: "insensitive" } } } },
    ],
  };
};

export async function getUserHistory(
  userId: string,
  { search, page, perPage = 20 }: { search?: string; page?: number; perPage?: number },
) {
  const where = historyWhere(userId, search);
  const currentPage = Math.max(1, page ?? 1);

  const [items, total] = await Promise.all([
    prisma.listeningHistory.findMany({
      where,
      orderBy: { lastPlayedAt: "desc" },
      skip: (currentPage - 1) * perPage,
      take: perPage,
      include: recentlyPlayedInclude,
    }),
    prisma.listeningHistory.count({ where }),
  ]);

  return { items, total, totalPages: Math.max(1, Math.ceil(total / perPage)), page: currentPage };
}

/* ------------------------------------------------------------
   Bookmark lengkap (search + pagination)
   ------------------------------------------------------------ */

const bookmarkWhere = (userId: string, search?: string): Prisma.BookmarkWhereInput => {
  if (!search) return { userId };
  return {
    userId,
    OR: [
      { audio: { judul: { contains: search, mode: "insensitive" } } },
      { audio: { series: { judul: { contains: search, mode: "insensitive" } } } },
    ],
  };
};

export async function getUserBookmarksPage(
  userId: string,
  { search, page, perPage = 20 }: { search?: string; page?: number; perPage?: number },
) {
  const where = bookmarkWhere(userId, search);
  const currentPage = Math.max(1, page ?? 1);

  const [items, total] = await Promise.all([
    prisma.bookmark.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (currentPage - 1) * perPage,
      take: perPage,
      select: {
        id: true,
        createdAt: true,
        audio: {
          select: {
            id: true,
            judul: true,
            slug: true,
            durasi: true,
            cover: true,
            nomorSesi: true,
            series: { select: { id: true, judul: true, slug: true } },
          },
        },
      },
    }),
    prisma.bookmark.count({ where }),
  ]);

  return { items, total, totalPages: Math.max(1, Math.ceil(total / perPage)), page: currentPage };
}

/* ------------------------------------------------------------
   Catatan lengkap (search + pagination)
   ------------------------------------------------------------ */

export const dashboardNoteInclude = {
  audio: {
    select: {
      id: true,
      judul: true,
      slug: true,
      durasi: true,
      cover: true,
      series: { select: { id: true, judul: true, slug: true } },
    },
  },
} satisfies Prisma.NoteInclude;

const noteWhere = (userId: string, search?: string): Prisma.NoteWhereInput => {
  if (!search) return { userId };
  return {
    userId,
    OR: [
      { content: { contains: search, mode: "insensitive" } },
      { audio: { judul: { contains: search, mode: "insensitive" } } },
      { audio: { series: { judul: { contains: search, mode: "insensitive" } } } },
    ],
  };
};

export async function getUserNotesPage(
  userId: string,
  { search, page, perPage = 20 }: { search?: string; page?: number; perPage?: number },
) {
  const where = noteWhere(userId, search);
  const currentPage = Math.max(1, page ?? 1);

  const [items, total] = await Promise.all([
    prisma.note.findMany({
      where,
      orderBy: { updatedAt: "desc" },
      skip: (currentPage - 1) * perPage,
      take: perPage,
      include: dashboardNoteInclude,
    }),
    prisma.note.count({ where }),
  ]);

  return { items, total, totalPages: Math.max(1, Math.ceil(total / perPage)), page: currentPage };
}

/* ------------------------------------------------------------
   Ringkasan dashboard (untuk overview page)
   ------------------------------------------------------------ */

export async function getUserDashboard(userId: string) {
  const [statistics, seriesProgress, recentlyPlayed, weeklyActivity, latestBookmarks, latestNotes] =
    await Promise.all([
      getUserStatistics(userId),
      getSeriesProgress(userId),
      getRecentlyPlayed(userId, 5),
      getWeeklyListeningActivity(userId),
      prisma.bookmark.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        take: 5,
        select: {
          id: true,
          createdAt: true,
          audio: {
            select: {
              id: true,
              judul: true,
              slug: true,
              durasi: true,
              cover: true,
              series: { select: { id: true, judul: true, slug: true } },
            },
          },
        },
      }),
      prisma.note.findMany({
        where: { userId },
        orderBy: { updatedAt: "desc" },
        take: 5,
        include: dashboardNoteInclude,
      }),
    ]);

  return { statistics, seriesProgress, recentlyPlayed, weeklyActivity, latestBookmarks, latestNotes };
}
