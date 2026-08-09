import { SiteHeader } from "@/components/layouts/site-header";
import { SiteFooter } from "@/components/layouts/site-footer";
import { listActiveSpeakers } from "@/repositories/speaker-repository";

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const speakers = await listActiveSpeakers();

  return (
    <div className="flex flex-1 flex-col">
      <SiteHeader
        speakers={speakers.map((s) => ({ id: s.id, nama: s.nama, slug: s.slug }))}
      />
      <main className="flex-1">{children}</main>
      <SiteFooter />
    </div>
  );
}
