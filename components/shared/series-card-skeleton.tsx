import { Skeleton } from "@/components/ui/skeleton";

export function SeriesCardSkeleton() {
  return (
    <div className="rounded-lg border border-border bg-surface p-3 shadow-xs">
      <Skeleton className="aspect-video w-full rounded-md" />
      <div className="flex flex-col gap-2 pt-3">
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-4 w-1/3" />
      </div>
    </div>
  );
}
