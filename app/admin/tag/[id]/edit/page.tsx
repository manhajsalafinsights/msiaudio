import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getTagById } from "@/repositories/tag-repository";
import { PageHeader } from "@/components/admin/page-header";
import { TagForm } from "@/features/admin/tag/components/tag-form";

export const metadata = { title: "Edit Tag (Admin)" };
export const revalidate = 0;

export default async function AdminTagEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const tag = await getTagById(id);
  if (!tag) notFound();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/tag" className="rounded-md p-1 text-muted hover:text-foreground" aria-label="Kembali">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <PageHeader title={`Edit: ${tag.nama}`} description="Perbarui data tag" />
      </div>

      <TagForm
        tagId={tag.id}
        defaultValues={{
          nama: tag.nama,
          slug: tag.slug,
        }}
      />
    </div>
  );
}
