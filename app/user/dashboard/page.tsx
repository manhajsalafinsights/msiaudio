import type { Metadata } from "next";
import { getCurrentUser } from "@/lib/auth/session";
import { Heading, Text } from "@/components/ui/typography";
import { ContinueLearning } from "@/features/progress/continue-learning";
import { StatCards } from "@/features/user/dashboard/stat-cards";
import { RecentlyPlayed } from "@/features/user/dashboard/recently-played";
import { SeriesProgress } from "@/features/user/dashboard/series-progress";
import { WeeklyActivity } from "@/features/user/dashboard/weekly-activity";
import { LatestBookmarks } from "@/features/user/dashboard/latest-bookmarks";
import { LatestNotes } from "@/features/user/dashboard/latest-notes";
import { getUserDashboard } from "@/repositories/dashboard-repository";

export const metadata: Metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  const user = await getCurrentUser();
  const userId = user?.id ?? "";
  const {
    statistics,
    seriesProgress,
    recentlyPlayed,
    weeklyActivity,
    latestBookmarks,
    latestNotes,
  } = await getUserDashboard(userId);

  return (
    <div className="flex flex-col gap-6 sm:gap-8">
      <header>
        <Heading as="h1" className="text-2xl sm:text-3xl">
          Dashboard
        </Heading>
        <Text variant="muted" className="mt-1">
          Selamat datang kembali, {user?.name ?? "pendengar"}.
        </Text>
      </header>

      <StatCards statistics={statistics} />

      <ContinueLearning />

      <SeriesProgress inProgress={seriesProgress.inProgress} completed={seriesProgress.completed} />

      <div className="grid grid-cols-1 gap-6 sm:gap-8 lg:grid-cols-2">
        <RecentlyPlayed items={recentlyPlayed} />
        <WeeklyActivity days={weeklyActivity} />
      </div>

      <div className="grid grid-cols-1 gap-6 sm:gap-8 lg:grid-cols-2">
        <LatestBookmarks items={latestBookmarks} />
        <LatestNotes items={latestNotes} />
      </div>
    </div>
  );
}
