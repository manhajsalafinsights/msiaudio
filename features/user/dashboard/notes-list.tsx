"use client";

import { useState } from "react";
import Link from "next/link";
import { StickyNote, Trash2, Pencil, Check, X } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { formatDuration } from "@/utils/duration";
import { formatDistanceToNow } from "@/utils/date";

interface NoteItem {
  id: string;
  positionSeconds: number;
  content: string;
  updatedAt: Date;
  audio: {
    judul: string;
    slug: string;
    durasi: number;
    series: { judul: string; slug: string };
  };
}

export function DashboardNotesList({ items: initialItems }: { items: NoteItem[] }) {
  const [items, setItems] = useState(initialItems);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [saving, setSaving] = useState(false);

  const startEdit = (note: NoteItem) => {
    setEditingId(note.id);
    setEditValue(note.content);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditValue("");
  };

  const saveEdit = async (note: NoteItem) => {
    const content = editValue.trim();
    if (!content || content === note.content) {
      cancelEdit();
      return;
    }

    setSaving(true);
    const res = await fetch(`/api/notes/${note.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content }),
    });
    setSaving(false);

    if (res.ok) {
      setItems((prev) =>
        prev.map((n) => (n.id === note.id ? { ...n, content, updatedAt: new Date() } : n)),
      );
      cancelEdit();
    }
  };

  const handleDelete = async (noteId: string) => {
    const res = await fetch(`/api/notes/${noteId}`, { method: "DELETE" });
    if (res.ok) {
      setItems((prev) => prev.filter((n) => n.id !== noteId));
      if (editingId === noteId) cancelEdit();
    }
  };

  if (items.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-border bg-surface p-8 text-center text-sm text-muted">
        Semua catatan telah dihapus.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {items.map((note) => (
        <div key={note.id} className="group rounded-xl border border-border bg-surface p-4 transition-all hover:shadow-sm">
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

            {editingId !== note.id && (
              <div className="flex shrink-0 items-center gap-2">
                <span className="rounded-full bg-brand/10 px-2 py-0.5 text-xs font-medium text-brand">
                  {formatDuration(note.positionSeconds)}
                </span>
                <button
                  type="button"
                  aria-label="Edit catatan"
                  onClick={() => startEdit(note)}
                  className="flex h-7 w-7 items-center justify-center rounded-full text-muted opacity-0 transition-opacity hover:bg-border/40 hover:text-foreground group-hover:opacity-100"
                >
                  <Pencil className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  aria-label="Hapus catatan"
                  onClick={() => handleDelete(note.id)}
                  className="flex h-7 w-7 items-center justify-center rounded-full text-muted opacity-0 transition-opacity hover:bg-border/40 hover:text-destructive group-hover:opacity-100"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>

          {editingId === note.id ? (
            <div className="mt-3 flex flex-col gap-2">
              <Textarea
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                rows={3}
                aria-label="Isi catatan"
                className="w-full"
              />
              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={cancelEdit}
                  disabled={saving}
                >
                  <X className="h-4 w-4" aria-hidden />
                  Batal
                </Button>
                <Button
                  type="button"
                  size="sm"
                  onClick={() => saveEdit(note)}
                  disabled={saving || editValue.trim().length === 0}
                >
                  <Check className="h-4 w-4" aria-hidden />
                  Simpan
                </Button>
              </div>
            </div>
          ) : (
            <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed">{note.content}</p>
          )}
        </div>
      ))}
    </div>
  );
}
