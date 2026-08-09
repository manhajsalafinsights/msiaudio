import { Container } from "@/components/ui/container";
import { Skeleton } from "@/components/ui/skeleton";

export default function UserDashboardLoading() {
  return (
    <Container size="wide" className="flex flex-col gap-8 py-8">
      <div>
        <Skeleton className="h-8 w-48" />
        <Skeleton className="mt-2 h-4 w-64" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-24 w-full rounded-xl" />
        ))}
      </div>
      <Skeleton className="h-5 w-44" />
      <Skeleton className="h-24 w-full rounded-xl" />
      <div className="grid gap-8 lg:grid-cols-2">
        <div className="flex flex-col gap-3">
          <Skeleton className="h-5 w-40" />
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-16 w-full rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    </Container>
  );
}
