"use client";

import { useState } from "react";
import Link from "next/link";
import { Trash2, StickyNote } from "lucide-react";
import { formatDuration } from "@/utils/duration";
import { formatDistanceToNow } from "@/utils/date";

interface NoteItem {
  id: string;
  positionSeconds: number;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  audio: {
    id: string;
    judul: string;
    slug: string;
    durasi: number;
    cover: string | null;
    series: { judul: string; slug: string };
  };
}

export function NotesList({ notes: initialNotes }: { notes: NoteItem[] }) {
  const [notes, setNotes] = useState(initialNotes);

  if (notes.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border bg-surface p-12 text-center">
        <p className="text-muted">Belum ada catatan</p>
        <p className="mt-1 text-sm text-muted">
          Buka halaman audio dan gunakan tombol Catatan untuk mencatat
        </p>
      </div>
    );
  }

  const handleDelete = async (noteId: string) => {
    const res = await fetch(`/api/notes/${noteId}`, { method: "DELETE" });
    if (res.ok) {
      setNotes((prev) => prev.filter((n) => n.id !== noteId));
    }
  };

  return (
    <div className="flex flex-col gap-3">
      {notes.map((note) => (
        <div
          key={note.id}
          className="group rounded-xl border border-border bg-surface p-4 transition-all hover:shadow-sm"
        >
          <div className="flex items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand/10 text-brand">
                <StickyNote className="h-4 w-4" />
              </span>
              <div className="min-w-0">
                <Link
                  href={`/audio/${note.audio.slug}`}
                  className="block truncate text-sm font-medium hover:text-brand"
                >
                  {note.audio.judul}
                </Link>
                <p className="truncate text-xs text-muted">
                  {note.audio.series.judul} · {formatDistanceToNow(new Date(note.updatedAt))}
                </p>
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <span className="rounded-full bg-brand/10 px-2 py-0.5 text-xs font-medium text-brand">
                {formatDuration(note.positionSeconds)}
              </span>
              <button
                type="button"
                aria-label="Hapus catatan"
                onClick={() => handleDelete(note.id)}
                className="flex h-7 w-7 items-center justify-center rounded-full text-muted opacity-0 transition-opacity hover:bg-border/40 hover:text-destructive group-hover:opacity-100"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
          <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed">{note.content}</p>
        </div>
      ))}
    </div>
  );
}
