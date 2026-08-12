"use client";

import { useCallback, useEffect, useState } from "react";
import { Loader2, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Heading } from "@/components/ui/typography";
import { EmptyState } from "@/components/ui/empty-state";
import { formatDistanceToNow } from "@/utils/date";
import { getComments, submitComment } from "@/features/comment/actions";
import type { CommentPublic } from "@/repositories/comment-repository";

type CommentTarget = "KITAB" | "SERIES";

interface CommentSectionProps {
  targetType: CommentTarget;
  targetId: string;
}

export function CommentSection({ targetType, targetId }: CommentSectionProps) {
  const [comments, setComments] = useState<CommentPublic[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUserName, setCurrentUserName] = useState<string | null>(null);
  const [nama, setNama] = useState("");
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    getComments(targetType, targetId)
      .then((data) => {
        if (!active) return;
        setComments(data.comments);
        setCurrentUserName(data.currentUserName);
      })
      .catch(() => {})
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [targetType, targetId]);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (submitting) return;
      setError(null);
      setSubmitting(true);
      const result = await submitComment({
        targetType,
        targetId,
        nama: currentUserName ? undefined : nama,
        content,
      });
      setSubmitting(false);
      if (result.ok) {
        setComments((prev) => [result.data, ...prev]);
        setContent("");
        setNama("");
      } else {
        setError(result.error.message);
      }
    },
    [submitting, targetType, targetId, currentUserName, nama, content]
  );

  return (
    <section className="flex flex-col gap-4">
      <Heading as="h2">
        <span className="inline-flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-brand" aria-hidden />
          Komentar Pengunjung
        </span>
      </Heading>

      <form onSubmit={handleSubmit} className="card flex flex-col gap-3 p-4">
        {!currentUserName && (
          <Input
            value={nama}
            onChange={(e) => setNama(e.target.value)}
            placeholder="Nama Anda (wajib)"
            maxLength={60}
            required
            aria-label="Nama"
          />
        )}
        <Textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={
            currentUserName
              ? `Tulis komentar sebagai ${currentUserName}...`
              : "Tulis komentar Anda..."
          }
          rows={3}
          maxLength={1000}
          required
          aria-label="Komentar"
        />
        {error && <p className="text-sm text-danger">{error}</p>}
        <div className="flex items-center justify-between gap-3">
          <p className="text-xs text-muted">{content.length}/1000</p>
          <Button type="submit" size="sm" disabled={submitting || content.trim().length < 3}>
            {submitting && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />}
            {submitting ? "Mengirim..." : "Kirim Komentar"}
          </Button>
        </div>
      </form>

      <div className="flex flex-col gap-3">
        {loading ? (
          <p className="py-4 text-sm text-muted">Memuat komentar...</p>
        ) : comments.length === 0 ? (
          <EmptyState title="Belum ada komentar" description="Jadilah pengunjung pertama yang berkomentar." />
        ) : (
          comments.map((comment) => (
            <article key={comment.id} className="card flex gap-3 p-4">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand/10 text-sm font-semibold text-brand">
                {comment.nama.charAt(0).toUpperCase()}
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-baseline gap-x-2">
                  <span className="text-sm font-semibold">{comment.nama}</span>
                  <span className="text-xs text-muted">
                    {formatDistanceToNow(new Date(comment.createdAt))}
                  </span>
                </div>
                <p className="mt-1 whitespace-pre-wrap break-words text-sm leading-relaxed text-foreground/80">
                  {comment.content}
                </p>
              </div>
            </article>
          ))
        )}
      </div>
    </section>
  );
}