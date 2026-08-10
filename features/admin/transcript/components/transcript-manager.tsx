"use client";

import { useTransition, useState } from "react";
import { AlertCircle, Check, Loader2, Trash2, Captions } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  fetchTranscriptFromYouTube,
  clearTranscript,
} from "@/features/admin/transcript/actions";

export type TranscriptStatusInfo = {
  status: string;
  language: string;
  provider: string;
  segmentCount: number;
};

export function TranscriptManager({
  audioId,
  transcript,
}: {
  audioId: string;
  transcript: TranscriptStatusInfo | null;
}) {
  const [pending, startFetch] = useTransition();
  const [deleting, startDelete] = useTransition();
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);

  const handleFetch = () => {
    setMessage(null);
    startFetch(async () => {
      const res = await fetchTranscriptFromYouTube(audioId);
      if (!res.ok) {
        setMessage({ ok: false, text: res.error.message });
        return;
      }
      setMessage({
        ok: true,
        text: `Transkrip berhasil diambil (${res.data.languageCode}: ${res.data.segmentCount} segmen).`,
      });
    });
  };

  const handleClear = () => {
    setMessage(null);
    startDelete(async () => {
      const res = await clearTranscript(audioId);
      if (!res.ok) {
        setMessage({ ok: false, text: res.error.message });
        return;
      }
      setMessage({ ok: true, text: "Transkrip dihapus." });
    });
  };

  return (
    <div className="card card-msi flex flex-col gap-4 p-5">
      <div className="flex flex-col gap-1">
        <h3 className="text-sm font-bold">Ambil dari YouTube</h3>
        <p className="text-xs text-muted">
          Mengambil caption/subtitle YouTube (utamakan Bahasa Indonesia) dan
          menyimpannya sebagai segmen ber-timestamp untuk tampilan karaoke di player.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Button onClick={handleFetch} disabled={pending || deleting}>
          {pending ? (
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
          ) : (
            <Captions className="h-4 w-4" aria-hidden />
          )}
          {pending ? "Mengambil..." : "Ambil Caption YouTube"}
        </Button>
        {transcript && (
          <Button variant="danger" onClick={handleClear} disabled={pending || deleting}>
            {deleting ? (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
            ) : (
              <Trash2 className="h-4 w-4" aria-hidden />
            )}
            Hapus Transkrip
          </Button>
        )}
      </div>

      {transcript && (
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="rounded bg-brand/10 px-2 py-1 font-medium text-brand">
            Status: {transcript.status}
          </span>
          <span className="rounded bg-border/50 px-2 py-1 text-muted">
            Bahasa: {transcript.language || "-"}
          </span>
          <span className="rounded bg-border/50 px-2 py-1 text-muted">
            Provider: {transcript.provider}
          </span>
          <span className="rounded bg-border/50 px-2 py-1 text-muted">
            {transcript.segmentCount} segmen
          </span>
        </div>
      )}

      {message && (
        <div
          className={message.ok ? "flex items-center gap-2 text-sm text-success" : "flex items-center gap-2 text-sm text-danger"}
        >
          {message.ok ? (
            <Check className="h-4 w-4 shrink-0" aria-hidden />
          ) : (
            <AlertCircle className="h-4 w-4 shrink-0" aria-hidden />
          )}
          {message.text}
        </div>
      )}
    </div>
  );
}
