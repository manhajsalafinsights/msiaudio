"use client";

import Image from "next/image";
import { ImagePlus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ImagePreviewProps {
  value: string;
  onChange: (url: string) => void;
}

function getUrlHint(value: string): string | null {
  try {
    const url = new URL(value);
    if (url.pathname.includes("/imgres") || url.searchParams.has("imgurl")) {
      return "Ini URL halaman pencarian, bukan gambar langsung. Klik kanan pada gambar di Google Images, lalu pilih \"Salin alamat gambar\" untuk URL langsung (berakhiran .jpg/.png/.webp).";
    }
    return null;
  } catch {
    return null;
  }
}

export function ImagePreview({ value, onChange }: ImagePreviewProps) {
  const hint = value ? getUrlHint(value) : null;

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-4">
        {value ? (
          <Image
            src={value}
            alt="Preview gambar"
            width={80}
            height={80}
            className="h-20 w-20 rounded-lg border border-border object-cover"
          />
        ) : (
          <div className="flex h-20 w-20 items-center justify-center rounded-lg border border-dashed border-border bg-muted/30 text-muted">
            <ImagePlus className="h-6 w-6" />
          </div>
        )}

        {value && (
          <Button type="button" variant="ghost" size="sm" onClick={() => onChange("")}>
            <Trash2 className="h-4 w-4 text-danger" />
            Hapus
          </Button>
        )}
      </div>

      {hint && <p className="text-xs text-danger">{hint}</p>}
    </div>
  );
}
