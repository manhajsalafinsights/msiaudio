import { Container } from "@/components/ui/container";
import { Skeleton } from "@/components/ui/skeleton";

export default function AudioDetailLoading() {
  return (
    <Container size="wide" className="flex flex-col gap-8 py-6">
      <Skeleton className="h-9 w-64" />
      <section className="flex flex-col items-center gap-6 rounded-lg border border-border bg-surface p-6 md:p-10">
        <Skeleton className="aspect-square w-48 rounded-lg md:w-56" />
        <Skeleton className="h-8 w-3/4" />
        <Skeleton className="h-4 w-40" />
        <Skeleton className="h-14 w-14 rounded-full" />
      </section>
      <div className="flex flex-col gap-4">
        <Skeleton className="h-7 w-40" />
        {[0, 1, 2].map((i) => (
          <Skeleton key={i} className="h-14 w-full" />
        ))}
      </div>
    </Container>
  );
}
