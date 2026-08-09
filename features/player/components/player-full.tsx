"use client";

import { useEffect, useRef, useState } from "react";
import { usePlayer } from "@/features/player/hooks/use-player";
import { usePlayerActions } from "@/features/player/hooks/use-player";
import { usePlayerProvider } from "@/features/player/context/player-provider";
import { resolveBestSource } from "@/features/player/services/player-service";
import type { PlayerAudio } from "@/features/player/types/player";
import { usePlayerKeyboard } from "@/features/player/hooks/use-player-keyboard";
import { PlayerCover } from "@/features/player/components/player-cover";
import { ProgressBar } from "@/features/player/components/player-progress";
import { PlayerControls } from "@/features/player/components/player-controls";
import { QuickActions } from "@/features/player/components/player-quick-actions";
import { SpeedControl, VolumeControl } from "@/features/player/components/player-volume";
import { Tabs } from "@/features/player/components/player-tabs";
import { ProgressSeries } from "@/features/player/components/player-progress-series";
import { SessionList } from "@/features/player/components/player-session-list";
import { NoteEditor } from "@/features/note/note-editor";
import { useProgressReporter } from "@/features/progress/use-progress";

const isDevelopment = process.env.NODE_ENV === "development";
// Panel debug disembunyikan secara default. Aktifkan dengan mengganti menjadi `true`.
const SHOW_DEBUG_PANEL = false;

interface PlayerFullProps {
  audio: PlayerAudio;
  /** Daftar sesi series (dari server, berisi slug & status listening nyata). */
  sessions?: {
    id: string;
    slug: string;
    number: number;
    title: string;
    duration: number;
    isCompleted: boolean;
    isCurrent: boolean;
  }[];
  /** Jumlah sesi yang benar-benar selesai didengarkan. */
  completedSessions?: number;
}

export function PlayerFull({ audio, sessions, completedSessions }: PlayerFullProps) {
  const { isPlayerReady, initialize, playerError } = usePlayerProvider();
  const { audio: currentAudio, status, position, duration, config, error } = usePlayer();
  const actions = usePlayerActions();
  usePlayerKeyboard();

  const isCurrent = currentAudio?.id === audio.id;
  const hasLoaded = isCurrent && status !== "idle";
  const isPlaying = status === "playing" || status === "buffering";

  useProgressReporter({
    audioId: audio.id,
    seriesId: audio.series.id,
    duration,
    position,
    status,
  });

  const resolvedSource = resolveBestSource(audio.mediaSources);
  const videoId = resolvedSource?.providerId ?? null;

  const [activeTab, setActiveTab] = useState("info");
  const [isNoteEditorOpen, setIsNoteEditorOpen] = useState(false);
  const [listeningStatus, setListeningStatus] = useState<Record<string, boolean>>({});

  // Only log once on mount
  const hasLoggedMount = useRef(false);
  useEffect(() => {
    if (isDevelopment && !hasLoggedMount.current) {
      hasLoggedMount.current = true;
      console.log("[Player] mounted, videoId:", videoId);
    }
  }, [videoId]);

  useEffect(() => {
    if (!sessions?.length) return;
    let cancelled = false;
    const ids = sessions.map((s) => s.id).join(",");
    fetch(`/api/listening?audioIds=${ids}`)
      .then((res) => (res.ok ? res.json() : { status: {} }))
      .then((data: { status?: Record<string, { completed: boolean }> }) => {
        if (!cancelled) {
          const map: Record<string, boolean> = {};
          for (const [id, s] of Object.entries(data.status ?? {})) {
            map[id] = s.completed;
          }
          setListeningStatus(map);
        }
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [sessions]);

  useEffect(() => {
    if (!isCurrent && resolvedSource) {
      actions.loadAudio(audio);
    }
  }, [isCurrent, audio, actions, resolvedSource]);

  const handleInit = async () => {
    if (!resolvedSource) {
      actions.setError("Tidak ada sumber audio yang tersedia");
      return;
    }
    await initialize("yt-player-full", resolvedSource);

    const res = await fetch(`/api/progress?audioId=${audio.id}`);
    if (res.ok) {
      const data = await res.json();
      const history = data.history;
      if (history && !history.completed && history.positionSeconds > 30) {
        actions.seek(history.positionSeconds);
      }
    }
  };

  const handlePlayPause = async () => {
    if (!isPlayerReady) {
      try {
        await handleInit();
      } catch {
        return;
      }
      if (!isPlayerReady) return;
    }
    if (isPlaying) {
      actions.pause();
    } else {
      actions.play();
    }
  };

  const showError = playerError || error || (!resolvedSource ? "Tidak ada sumber audio yang tersedia" : null);

  const canRewind = position > 5;

  const speakerNames = audio.series.speakers.map((s) => s.speaker.nama).join(", ");

  // Session list (slug nyata dari server; status listening di-merge client-side).
  const baseSessionItems = sessions?.length
    ? sessions
    : audio.series.seriesType
      ? Array.from({ length: audio.series.totalSesi }, (_, i) => ({
          id: `${audio.series.id}-sesi-${i + 1}`,
          slug: audio.slug,
          number: i + 1,
          title: `Sesi ${i + 1}`,
          duration: audio.durasi,
          isCompleted: false,
          isCurrent: i + 1 === audio.nomorSesi,
        }))
      : [];

  const sessionItems = baseSessionItems.map((s) => ({
    ...s,
    isCompleted: listeningStatus[s.id] ?? s.isCompleted,
  }));

  const completedCount =
    completedSessions ?? sessionItems.filter((s) => s.isCompleted).length;

  // Tab content
  const tabItems = [
    {
      id: "info",
      label: "Informasi",
      content: (
        <div className="grid grid-cols-2 gap-4 text-sm md:grid-cols-4">
          <InfoCard label="Durasi" value={formatDuration(audio.durasi)} />
          <InfoCard label="Jenis Kajian" value={audio.series.seriesType.nama} />
          <InfoCard label="Pemateri" value={speakerNames} />
          <InfoCard label="Sesi" value={`${audio.nomorSesi} dari ${audio.series.totalSesi}`} />
        </div>
      ),
    },
    {
      id: "description",
      label: "Deskripsi",
      content: audio.deskripsi ? (
        <p className="leading-relaxed text-foreground/80">{audio.deskripsi}</p>
      ) : (
        <p className="text-muted">Tidak ada deskripsi.</p>
      ),
    },
    {
      id: "dalil",
      label: "Dalil",
      content: (
        <p className="text-muted">Dalil akan ditampilkan di sini.</p>
      ),
    },
    {
      id: "references",
      label: "Referensi",
      content: (
        <p className="text-muted">Referensi akan ditampilkan di sini.</p>
      ),
    },
    {
      id: "transcript",
      label: "Transcript",
      content: (
        <p className="text-muted">Transcript akan tersedia segera.</p>
      ),
    },
  ];

  return (
    <section
      className="flex flex-col gap-8"
      aria-label={`Pemutar audio: ${audio.judul}`}
      role="region"
    >
      {/* YouTube iframe container - always hidden, only for audio */}
      <div
        id="yt-player-full"
        className="pointer-events-none absolute h-1 w-1 opacity-0"
        aria-hidden
        style={{ left: "-9999px", top: "-9999px" }}
      />

      {/* Debug Panel - only in development, hidden by default */}
      {isDevelopment && SHOW_DEBUG_PANEL && (
        <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-3">
          <h3 className="mb-2 text-xs font-semibold text-amber-600">Debug</h3>
          <div className="flex flex-wrap gap-3 text-xs">
            <span>Video: <span className="font-mono">{videoId ?? "-"}</span></span>
            <span>Ready: {isPlayerReady ? "✅" : "❌"}</span>
            <span>Status: {status}</span>
            <span>Error: {showError ?? "None"}</span>
          </div>
        </div>
      )}

      {/* Player Card - cover, info, progress & controls dalam satu kartu */}
      <div className="card card-outlined mx-auto w-full max-w-3xl p-5 sm:p-8">
        <div className="flex flex-col gap-6">
          {/* Cover & Info */}
          <div className="flex flex-col items-center gap-6">
            <PlayerCover
              src={audio.cover}
              alt={audio.judul}
              isPlaying={isPlaying && hasLoaded}
            />

            <div className="flex flex-col items-center gap-2 text-center">
              <h1 className="text-2xl font-bold tracking-tight md:text-3xl">{audio.judul}</h1>
              <p className="text-muted">
                {audio.series.judul}
                <span className="hidden">
                  {" "}· Sesi {audio.nomorSesi} dari {audio.series.totalSesi}
                </span>
              </p>
              {speakerNames && (
                <p className="font-medium text-brand">{speakerNames}</p>
              )}
            </div>

            {showError && (
              <div className="rounded-lg bg-destructive/10 px-4 py-3 text-sm text-destructive" role="alert">
                {showError}
              </div>
            )}
          </div>

          {/* Progress Series */}
          <ProgressSeries
            totalSessions={audio.series.totalSesi}
            completedSessions={completedCount}
            currentSession={audio.nomorSesi}
          />

          <div className="h-px bg-border" aria-hidden />

          {/* Progress Bar */}
          <ProgressBar
            position={position}
            duration={duration}
            onSeek={actions.seek}
          />

          {/* Main Controls */}
          <PlayerControls
            isPlaying={isPlaying}
            canRewind={canRewind}
            onPlay={handlePlayPause}
            onPause={actions.pause}
            onPrevious={actions.previous}
            onNext={actions.next}
            onRewind={() => actions.seek(Math.max(0, position - 10))}
            onForward={() => actions.seek(Math.min(duration, position + 30))}
          />

          {/* Quick Actions */}
          <QuickActions
            audioId={audio.id}
            onNote={() => setIsNoteEditorOpen(true)}
            shareUrl={`/audio/${audio.slug}`}
            shareTitle={audio.judul}
          />

          {/* Secondary Controls */}
          <div className="flex flex-wrap items-center justify-center gap-4 border-t border-border pt-5 sm:justify-between">
            <SpeedControl speed={config.speed} onSpeedChange={actions.setSpeed} />
            <VolumeControl
              volume={config.volume}
              muted={config.muted}
              onVolumeChange={actions.setVolume}
              onToggleMute={actions.toggleMute}
            />
          </div>
        </div>
      </div>

      {/* Session List */}
      {sessionItems.length > 0 && (
        <SessionList
          seriesTitle={audio.series.judul}
          sessions={sessionItems}
        />
      )}

      {/* Tabs */}
      <Tabs items={tabItems} activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Notes */}
      <NoteEditor
        open={isNoteEditorOpen}
        onClose={() => setIsNoteEditorOpen(false)}
        audioId={audio.id}
        currentPosition={position}
      />
    </section>
  );
}

function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (h > 0) {
    return `${h} j ${m} mnt`;
  }
  return `${m} mnt`;
}

interface InfoCardProps {
  label: string;
  value: string;
}

function InfoCard({ label, value }: InfoCardProps) {
  return (
    <div className="rounded-xl border border-border bg-surface p-4">
      <p className="text-xs text-muted">{label}</p>
      <p className="mt-1 text-sm font-semibold">{value}</p>
    </div>
  );
}
