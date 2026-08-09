"use client";

import { useState } from "react";
import { X, Plus, Pencil, Trash2, StickyNote, Check, Loader2 } from "lucide-react";
import { useNotes } from "@/features/note/use-notes";
import { formatDuration } from "@/utils/duration";

interface NoteEditorProps {
  open: boolean;
  onClose: () => void;
  audioId: string;
  currentPosition: number;
}

export function NoteEditor({ open, onClose, audioId, currentPosition }: NoteEditorProps) {
  const { notes, loading, addNote, updateNote, deleteNote } = useNotes(audioId);
  const [draft, setDraft] = useState("");
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");

  if (!open) return null;

  const handleAdd = async () => {
    if (!draft.trim() || saving) return;
    setSaving(true);
    await addNote(draft.trim(), currentPosition);
    setDraft("");
    setSaving(false);
  };

  const handleSaveEdit = async (noteId: string) => {
    if (!editContent.trim()) return;
    await updateNote(noteId, editContent.trim());
    setEditingId(null);
    setEditContent("");
  };

  const handleDelete = async (noteId: string) => {
    await deleteNote(noteId);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-0 backdrop-blur-sm sm:items-center sm:p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Catatan"
    >
      <div
        className="flex max-h-[85vh] w-full max-w-lg flex-col gap-4 overflow-hidden rounded-t-2xl border border-border bg-surface p-5 shadow-2xl sm:rounded-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-lg font-semibold">
            <StickyNote className="h-5 w-5 text-brand" />
            Catatan
          </h2>
          <button
            type="button"
            aria-label="Tutup"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full text-muted hover:bg-border/40 hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex items-center gap-2 rounded-lg bg-brand/5 px-3 py-2 text-xs text-muted">
          <span className="font-medium text-brand">{formatDuration(currentPosition)}</span>
          <span>Catatan baru akan disimpan pada posisi ini</span>
        </div>

        <div className="flex flex-col gap-3 rounded-xl border border-border p-3">
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Tulis catatanmu di sini..."
            rows={3}
            className="w-full resize-none rounded-lg border border-border bg-surface p-3 text-sm outline-none placeholder:text-muted focus:border-brand/50"
          />
          <button
            type="button"
            onClick={handleAdd}
            disabled={!draft.trim() || saving}
            className="flex items-center justify-center gap-2 rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {saving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Plus className="h-4 w-4" />
            )}
            Simpan Catatan
          </button>
        </div>

        <div className="flex flex-col gap-3 overflow-y-auto pr-1">
          {loading && (
            <div className="flex items-center justify-center gap-2 py-6 text-sm text-muted">
              <Loader2 className="h-4 w-4 animate-spin" />
              Memuat catatan...
            </div>
          )}

          {!loading && notes.length === 0 && (
            <p className="py-6 text-center text-sm text-muted">
              Belum ada catatan untuk audio ini.
            </p>
          )}

          {notes.map((note) => (
            <div key={note.id} className="rounded-xl border border-border p-3">
              <div className="flex items-center justify-between gap-2">
                <span className="rounded-full bg-brand/10 px-2 py-0.5 text-xs font-medium text-brand">
                  {formatDuration(note.positionSeconds)}
                </span>
                <div className="flex items-center gap-1">
                  {editingId === note.id ? (
                    <button
                      type="button"
                      aria-label="Simpan perubahan"
                      onClick={() => handleSaveEdit(note.id)}
                      className="flex h-7 w-7 items-center justify-center rounded-full text-success hover:bg-border/40"
                    >
                      <Check className="h-4 w-4" />
                    </button>
                  ) : (
                    <button
                      type="button"
                      aria-label="Ubah catatan"
                      onClick={() => {
                        setEditingId(note.id);
                        setEditContent(note.content);
                      }}
                      className="flex h-7 w-7 items-center justify-center rounded-full text-muted hover:bg-border/40 hover:text-foreground"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                  )}
                  <button
                    type="button"
                    aria-label="Hapus catatan"
                    onClick={() => handleDelete(note.id)}
                    className="flex h-7 w-7 items-center justify-center rounded-full text-muted hover:bg-border/40 hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {editingId === note.id ? (
                <textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  rows={3}
                  className="mt-2 w-full resize-none rounded-lg border border-border bg-surface p-2 text-sm outline-none focus:border-brand/50"
                />
              ) : (
                <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed">{note.content}</p>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
