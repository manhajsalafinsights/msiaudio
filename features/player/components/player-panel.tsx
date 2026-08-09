"use client";

import { useState } from "react";
import { BookText, FileText, Highlighter, ListOrdered, Pen, Paperclip, Gauge } from "lucide-react";
import { cn } from "@/utils/cn";
import { formatDuration } from "@/utils/duration";
import { Heading, Text } from "@/components/ui/typography";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import type { PlayerAudio } from "@/features/player/types/player";

const TABS = [
  { id: "chapter", label: "Chapter", icon: ListOrdered },
  { id: "reference", label: "Reference", icon: BookText },
  { id: "highlight", label: "Highlight", icon: Highlighter },
  { id: "notes", label: "Notes", icon: Pen },
  { id: "attachment", label: "Attachment", icon: Paperclip },
  { id: "related", label: "Related", icon: Gauge },
] as const;

type TabId = (typeof TABS)[number]["id"];

interface PlayerPanelProps {
  audio: PlayerAudio;
  relatedBySeries: { id: string; slug: string; judul: string; durasi: number }[];
  relatedBySpeaker: { id: string; slug: string; judul: string; durasi: number; series: { judul: string } }[];
}

export function PlayerPanel({ audio, relatedBySeries, relatedBySpeaker }: PlayerPanelProps) {
  const [activeTab, setActiveTab] = useState<TabId>("chapter");

  return (
    <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as TabId)} className="w-full">
      <TabsList className="flex-wrap gap-1">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          return (
            <TabsTrigger key={tab.id} value={tab.id} className="flex items-center gap-1.5">
              <Icon className="h-4 w-4" aria-hidden />
              {tab.label}
            </TabsTrigger>
          );
        })}
      </TabsList>

      <TabsContent value="chapter" className="pt-4">
        <ChapterTab chapters={audio.chapters ?? []} />
      </TabsContent>

      <TabsContent value="reference" className="pt-4">
        <ReferenceTab references={audio.references ?? []} />
      </TabsContent>

      <TabsContent value="highlight" className="pt-4">
        <HighlightTab highlights={audio.highlights ?? []} />
      </TabsContent>

      <TabsContent value="notes" className="pt-4">
        <NotesTab />
      </TabsContent>

      <TabsContent value="attachment" className="pt-4">
        <AttachmentTab />
      </TabsContent>

      <TabsContent value="related" className="pt-4">
        <RelatedTab
          relatedBySeries={relatedBySeries}
          relatedBySpeaker={relatedBySpeaker}
        />
      </TabsContent>
    </Tabs>
  );
}

function ChapterTab({ chapters }: { chapters: { id: string; title: string; startSecond: number }[] }) {
  if (chapters.length === 0) {
    return <Text variant="small" className="text-muted">Tidak ada chapter tersedia.</Text>;
  }

  return (
    <ul className="flex flex-col gap-2">
      {chapters.map((chapter) => (
        <li
          key={chapter.id}
          className="flex items-center justify-between gap-4 rounded-lg border border-border bg-surface px-4 py-3"
        >
          <span className="min-w-0 truncate text-sm">{chapter.title}</span>
          <span className="shrink-0 text-xs tabular-nums text-muted">
            {formatDuration(chapter.startSecond)}
          </span>
        </li>
      ))}
    </ul>
  );
}

const REFERENCE_TYPE_LABEL: Record<string, string> = {
  QURAN: "Al-Qur'an",
  HADITH: "Hadits",
  KITAB: "Kitab",
  ARTICLE: "Artikel",
  QUOTE: "Kutipan",
  NOTE: "Catatan",
};

const REFERENCE_TYPE_COLOR: Record<string, string> = {
  QURAN: "text-emerald-500",
  HADITH: "text-amber-500",
  KITAB: "text-blue-500",
  ARTICLE: "text-purple-500",
  QUOTE: "text-rose-500",
  NOTE: "text-slate-500",
};

function ReferenceTab({
  references,
}: {
  references: NonNullable<PlayerAudio["references"]>;
}) {
  if (references.length === 0) {
    return <Text variant="small" className="text-muted">Tidak ada referensi tersedia.</Text>;
  }

  return (
    <ul className="flex flex-col gap-3">
      {references.map((ref) => (
        <li
          key={ref.id}
          className="rounded-lg border border-border bg-surface px-4 py-3"
        >
          <div className="flex items-start justify-between gap-4">
            <span
              className={cn(
                "rounded-md bg-opacity-10 px-2 py-0.5 text-xs font-medium",
                REFERENCE_TYPE_COLOR[ref.type] ?? "text-muted",
              )}
            >
              {REFERENCE_TYPE_LABEL[ref.type] ?? ref.type}
            </span>
            <span className="shrink-0 text-xs tabular-nums text-muted">
              {formatDuration(ref.startSecond)}
              {ref.endSecond ? ` – ${formatDuration(ref.endSecond)}` : ""}
            </span>
          </div>
          {ref.title && <p className="mt-1.5 text-sm font-medium">{ref.title}</p>}
          {ref.reference && <p className="mt-1 text-sm text-muted">{ref.reference}</p>}
          {ref.content && (
            <p className="mt-1.5 text-sm leading-relaxed text-foreground/80 line-clamp-3">
              {ref.content}
            </p>
          )}
        </li>
      ))}
    </ul>
  );
}

function HighlightTab({ highlights }: { highlights: { id: string; title: string; startSecond: number }[] }) {
  if (highlights.length === 0) {
    return <Text variant="small" className="text-muted">Tidak ada highlight tersedia.</Text>;
  }

  return (
    <ul className="flex flex-col gap-2">
      {highlights.map((highlight) => (
        <li
          key={highlight.id}
          className="rounded-lg border border-border bg-surface px-4 py-3"
        >
          <p className="text-sm font-medium">{highlight.title}</p>
          <p className="mt-0.5 text-xs tabular-nums text-muted">
            {formatDuration(highlight.startSecond)}
          </p>
        </li>
      ))}
    </ul>
  );
}

function NotesTab() {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-8 text-center">
      <FileText className="h-8 w-8 text-muted" aria-hidden />
      <Text className="text-base font-medium">Catatan belum tersedia</Text>
      <Text variant="small" className="text-muted">
        Fitur pencatatan akan datang. Catat poin penting saat mendengarkan.
      </Text>
    </div>
  );
}

function AttachmentTab() {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-8 text-center">
      <Paperclip className="h-8 w-8 text-muted" aria-hidden />
      <Text className="text-base font-medium">Lampiran belum tersedia</Text>
      <Text variant="small" className="text-muted">
        File lampiran dan materi pendukung akan ditampilkan di sini.
      </Text>
    </div>
  );
}

function RelatedTab({
  relatedBySeries,
  relatedBySpeaker,
}: {
  relatedBySeries: { id: string; slug: string; judul: string; durasi: number }[];
  relatedBySpeaker: { id: string; slug: string; judul: string; durasi: number; series: { judul: string } }[];
}) {
  if (relatedBySeries.length === 0 && relatedBySpeaker.length === 0) {
    return <Text variant="small" className="text-muted">Tidak ada audio terkait.</Text>;
  }

  return (
    <div className="flex flex-col gap-6">
      {relatedBySeries.length > 0 && (
        <div>
          <Heading as="h3" className="mb-3 text-sm font-medium text-muted">
            Series ini
          </Heading>
          <ul className="flex flex-col gap-2">
            {relatedBySeries.map((item) => (
              <li key={item.id}>
                <a
                  href={`/audio/${item.slug}`}
                  className="flex items-center justify-between gap-4 rounded-lg border border-border bg-surface px-4 py-3 text-sm transition-colors hover:bg-border/40"
                >
                  <span className="truncate font-medium">{item.judul}</span>
                  <span className="shrink-0 text-xs tabular-nums text-muted">
                    {formatDuration(item.durasi)}
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}

      {relatedBySpeaker.length > 0 && (
        <div>
          <Heading as="h3" className="mb-3 text-sm font-medium text-muted">
            Dari pemateri yang sama
          </Heading>
          <ul className="flex flex-col gap-2">
            {relatedBySpeaker.map((item) => (
              <li key={item.id}>
                <a
                  href={`/audio/${item.slug}`}
                  className="flex items-center justify-between gap-4 rounded-lg border border-border bg-surface px-4 py-3 text-sm transition-colors hover:bg-border/40"
                >
                  <div className="min-w-0 flex-1">
                    <span className="block truncate font-medium">{item.judul}</span>
                    <span className="text-xs text-muted">{item.series.judul}</span>
                  </div>
                  <span className="shrink-0 text-xs tabular-nums text-muted">
                    {formatDuration(item.durasi)}
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
