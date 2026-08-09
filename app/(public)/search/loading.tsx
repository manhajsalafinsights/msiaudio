import { Skeleton } from "@/components/ui/skeleton";
import { Container } from "@/components/ui/container";

export default function SearchLoading() {
  return (
    <Container size="wide" className="flex flex-col gap-8 py-8">
      <div className="flex flex-col gap-4">
        <Skeleton className="h-9 w-48" />
        <Skeleton className="h-10 w-full max-w-lg" />
      </div>
      <div className="flex flex-col gap-8">
        {[1, 2, 3].map((section) => (
          <div key={section} className="flex flex-col gap-4">
            <Skeleton className="h-6 w-40" />
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="card p-3">
                  <Skeleton className="aspect-video w-full rounded-xl" />
                  <Skeleton className="mt-3 h-4 w-3/4" />
                  <Skeleton className="mt-2 h-3 w-1/2" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </Container>
  );
}
