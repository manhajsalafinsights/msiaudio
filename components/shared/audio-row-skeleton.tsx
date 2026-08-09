import { Skeleton } from "@/components/ui/skeleton";

export function AudioRowSkeleton() {
  return (
    <li className="flex items-center gap-4 rounded-lg border border-border bg-surface px-4 py-3">
      <Skeleton className="h-10 w-10 rounded-md" />
      <div className="flex flex-col gap-1 flex-1">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
      </div>
      <Skeleton className="h-4 w-16" />
    </li>
  );
}
