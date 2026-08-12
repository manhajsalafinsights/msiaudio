import { CommentTarget } from "@prisma/client";
import { listCommentsAdmin } from "@/repositories/comment-repository";
import { PageHeader } from "@/components/admin/page-header";
import { CommentTable } from "@/features/admin/comment/components/comment-table";

export const metadata = { title: "Komentar (Admin)" };
export const revalidate = 0;

export default async function AdminCommentPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string; targetType?: string }>;
}) {
  const params = await searchParams;
  const page = Math.max(1, Number(params.page) || 1);
  const targetType =
    params.targetType === CommentTarget.SERIES ? CommentTarget.SERIES : undefined;

  const { items, total, totalPages } = await listCommentsAdmin({
    q: params.q,
    page,
    perPage: 10,
    targetType,
  });

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Komentar"
        description="Kelola komentar pengunjung — hapus komentar yang tidak pantas"
      />

      <CommentTable
        rows={items}
        total={total}
        totalPages={totalPages}
        page={page}
        targetFilter={targetType ?? ""}
      />
    </div>
  );
}