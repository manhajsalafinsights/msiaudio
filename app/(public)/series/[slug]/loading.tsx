import { Container } from "@/components/ui/container";
import { Skeleton } from "@/components/ui/skeleton";

export default function SeriesDetailLoading() {
  return (
    <Container className="flex flex-col gap-8 py-8">
      <Skeleton className="h-5 w-64" />
      <div className="grid gap-8 md:grid-cols-[280px_1fr]">
        <Skeleton className="aspect-square w-full max-w-[280px]" />
        <div className="flex flex-col gap-4">
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-9 w-2/3" />
          <Skeleton className="h-4 w-48" />
          <Skeleton className="h-4 w-64" />
          <Skeleton className="h-20 w-full max-w-2xl" />
          <Skeleton className="h-11 w-40" />
        </div>
      </div>
      <div className="flex flex-col gap-4">
        <Skeleton className="h-7 w-40" />
        {[0, 1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    </Container>
  );
}
