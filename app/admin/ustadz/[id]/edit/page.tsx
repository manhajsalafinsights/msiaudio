import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getSpeakerById } from "@/repositories/speaker-repository";
import { PageHeader } from "@/components/admin/page-header";
import { UstadzForm } from "@/features/admin/ustadz/components/ustadz-form";

export const metadata = { title: "Edit Ustadz (Admin)" };
export const revalidate = 0;

export default async function AdminUstadzEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const speaker = await getSpeakerById(id);
  if (!speaker) notFound();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/ustadz" className="rounded-md p-1 text-muted hover:text-foreground" aria-label="Kembali">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <PageHeader title={`Edit: ${speaker.nama}`} description="Perbarui data pemateri" />
      </div>

      <UstadzForm
        speakerId={speaker.id}
        defaultValues={{
          nama: speaker.nama,
          slug: speaker.slug,
          foto: speaker.foto ?? "",
          bio: speaker.bio ?? "",
          status: speaker.status,
        }}
      />
    </div>
  );
}
