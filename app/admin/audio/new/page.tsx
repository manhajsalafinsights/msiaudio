import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { listAllSeries } from "@/repositories/series-repository";
import { PageHeader } from "@/components/admin/page-header";
import { AudioForm } from "@/features/admin/audio/components/audio-form";

export const metadata = { title: "Tambah Audio (Admin)" };

function safeBackHref(back?: string): string | undefined {
  return back?.startsWith("/admin/audio") ? back : undefined;
}

export default async function AdminAudioNewPage({
  searchParams,
}: {
  searchParams: Promise<{ back?: string }>;
}) {
  const { back } = await searchParams;
  const seriesOptions = await listAllSeries();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-4">
        <Link
          href="/admin/audio"
          className="rounded-md p-1 text-muted hover:text-foreground"
          aria-label="Kembali"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <PageHeader title="Tambah Audio" description="Tambahkan sesi audio baru" />
      </div>

      <AudioForm seriesOptions={seriesOptions} backHref={safeBackHref(back)} />
    </div>
  );
}
