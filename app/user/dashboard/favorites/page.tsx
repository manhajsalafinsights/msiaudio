import { Heart } from "lucide-react";
import { getUserFavorites } from "@/features/favorite/favorite-actions";
import { SeriesCard } from "@/components/shared/series-card";
import { Container } from "@/components/ui/container";

export const metadata = { title: "Favorit" };

export default async function FavoritesPage() {
  const favorites = await getUserFavorites();

  return (
    <Container className="flex flex-col gap-6 py-6">
      <h1 className="flex items-center gap-2 text-2xl font-bold">
        <Heart className="h-6 w-6 text-brand" />
        Series Favorit
      </h1>

      {favorites.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-surface p-12 text-center">
          <p className="text-muted">Belum ada series favorit</p>
          <p className="mt-1 text-sm text-muted">
            Klik tombol Favorit di halaman series untuk menyimpannya di sini
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {favorites.map((series) => (
            <SeriesCard key={series.id} series={series} />
          ))}
        </div>
      )}
    </Container>
  );
}
