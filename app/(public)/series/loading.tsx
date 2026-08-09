import { Container } from "@/components/ui/container";
import { Skeleton } from "@/components/ui/skeleton";

export default function SeriesListLoading() {
  return (
    <Container size="wide" className="flex flex-col gap-8 py-8">
      <Skeleton className="h-5 w-48" />
      <div className="flex flex-col gap-4">
        <Skeleton className="h-10 w-full max-w-md" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="flex flex-col gap-3 rounded-xl border border-border bg-surface p-4">
              <Skeleton className="aspect-video w-full" />
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          ))}
        </div>
      </div>
    </Container>
  );
}
