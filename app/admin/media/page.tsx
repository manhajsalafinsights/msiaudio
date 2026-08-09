import { PageHeader } from "@/components/admin/page-header";
import { YouTubeParser } from "@/features/admin/media/components/youtube-parser";

export const metadata = { title: "Media (Admin)" };

export default function AdminMediaPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Media"
        description="Alat bantu kelola sumber audio — parser URL YouTube"
      />

      <YouTubeParser />
    </div>
  );
}
