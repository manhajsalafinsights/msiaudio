"use client";

import { Heart } from "lucide-react";
import { useFavorite } from "@/features/favorite/use-favorite";
import { cn } from "@/utils/cn";

interface FavoriteButtonProps {
  seriesId: string;
  className?: string;
}

export function FavoriteButton({ seriesId, className }: FavoriteButtonProps) {
  const { favorited, toggleFavorite } = useFavorite(seriesId);

  return (
    <button
      type="button"
      aria-label={favorited ? "Hapus dari favorit" : "Tambah ke favorit"}
      aria-pressed={favorited}
      onClick={toggleFavorite}
      className={cn(
        "inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-colors",
        favorited
          ? "border-brand/40 bg-brand/10 text-brand"
          : "border-border bg-surface text-foreground hover:border-brand/30 hover:text-brand",
        className
      )}
    >
      <Heart className={cn("h-4 w-4", favorited && "fill-current")} />
      {favorited ? "Difavoritkan" : "Favorit"}
    </button>
  );
}
