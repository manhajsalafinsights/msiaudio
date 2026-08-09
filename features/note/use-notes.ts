"use client";

import { useState, useCallback, useEffect } from "react";

interface Note {
  id: string;
  positionSeconds: number;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export function useNotes(audioId: string) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!audioId) return;
    let active = true;
    fetch(`/api/notes?audioId=${audioId}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (active && data) setNotes(data.notes ?? []);
      })
      .catch(() => {})
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [audioId]);

  const addNote = useCallback(
    async (content: string, positionSeconds: number) => {
      const res = await fetch("/api/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ audioId, content, positionSeconds }),
      });
      if (res.ok) {
        const data = await res.json();
        setNotes((prev) => [...prev, data.note].sort((a, b) => a.positionSeconds - b.positionSeconds));
        return data.note as Note;
      }
      return null;
    },
    [audioId]
  );

  const updateNote = useCallback(async (noteId: string, content: string) => {
    const res = await fetch(`/api/notes/${noteId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content }),
    });
    if (res.ok) {
      const data = await res.json();
      setNotes((prev) => prev.map((n) => (n.id === noteId ? data.note : n)));
      return data.note as Note;
    }
    return null;
  }, []);

  const deleteNote = useCallback(async (noteId: string) => {
    const res = await fetch(`/api/notes/${noteId}`, { method: "DELETE" });
    if (res.ok) {
      setNotes((prev) => prev.filter((n) => n.id !== noteId));
      return true;
    }
    return false;
  }, []);

  return { notes, loading, addNote, updateNote, deleteNote };
}
