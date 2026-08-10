import { create } from "zustand/react";
import type { PlayerAudio, PlayerQueueItem, PlayerConfig, PlayerStatus } from "@/features/player/types/player";

interface PlayerState {
  currentAudio: PlayerAudio | null;
  queue: PlayerQueueItem[];
  currentQueueIndex: number;
  status: PlayerStatus;
  position: number;
  duration: number;
  config: PlayerConfig;
  error: string | null;
}

interface PlayerActions {
  loadAudio: (audio: PlayerAudio, queue?: PlayerQueueItem[]) => void;
  play: () => void;
  pause: () => void;
  seek: (position: number) => void;
  setPosition: (position: number) => void;
  setDuration: (duration: number) => void;
  setStatus: (status: PlayerStatus) => void;
  setError: (error: string | null) => void;
  setSpeed: (speed: number) => void;
  setVolume: (volume: number) => void;
  toggleMute: () => void;
  setSleepTimer: (minutes: number | null) => void;
  next: () => void;
  previous: () => void;
  reset: () => void;
}

export type { PlayerState, PlayerActions };

interface PlayerStore extends PlayerState {
  actions: PlayerActions;
}

export const usePlayerStore = create<PlayerStore>()((set, get) => ({
  currentAudio: null,
  queue: [],
  currentQueueIndex: 0,
  status: "idle",
  position: 0,
  duration: 0,
  config: {
    speed: 1,
    volume: 0.8,
    muted: false,
    sleepTimer: null,
  },
  error: null,
  actions: {
    loadAudio: (audio: PlayerAudio, queue?: PlayerQueueItem[]) => {
      const newQueue = queue ?? [{ audio, position: 0 }];
      const newIndex = newQueue.findIndex((item) => item.audio.id === audio.id);
      set((state) => ({
        currentAudio: audio,
        queue: state.queue.length > 0 ? state.queue : newQueue,
        currentQueueIndex: newIndex >= 0 ? newIndex : 0,
        status: "loading",
        position: 0,
        duration: 0,
        error: null,
      }));
    },

    play: () => set({ status: "playing" }),
    pause: () => set({ status: "paused" }),

    seek: (position: number) => {
      set({ position, status: get().status === "loading" ? "loading" : get().status });
    },

    setPosition: (position: number) => set({ position }),
    setDuration: (duration: number) => set({ duration }),
    setStatus: (status: PlayerStatus) => set({ status }),
    setError: (error: string | null) => set({ error }),

    setSpeed: (speed: number) =>
      set((state) => ({
        config: { ...state.config, speed },
      })),

    setVolume: (volume: number) =>
      set((state) => ({
        config: { ...state.config, volume },
      })),

    toggleMute: () =>
      set((state) => ({
        config: { ...state.config, muted: !state.config.muted },
      })),

    setSleepTimer: (minutes: number | null) =>
      set((state) => ({
        config: { ...state.config, sleepTimer: minutes },
      })),

    next: () => {
      const state = get();
      if (state.currentQueueIndex < state.queue.length - 1) {
        const nextIndex = state.currentQueueIndex + 1;
        const nextAudio = state.queue[nextIndex]?.audio;
        if (nextAudio) {
          set(() => ({
            currentAudio: nextAudio,
            currentQueueIndex: nextIndex,
            status: "loading",
            position: 0,
            duration: 0,
            error: null,
          }));
        }
      }
    },

    previous: () => {
      const state = get();
      if (state.currentQueueIndex > 0) {
        const prevIndex = state.currentQueueIndex - 1;
        const prevAudio = state.queue[prevIndex]?.audio;
        if (prevAudio) {
          set(() => ({
            currentAudio: prevAudio,
            currentQueueIndex: prevIndex,
            status: "loading",
            position: 0,
            duration: 0,
            error: null,
          }));
        }
      }
    },

    reset: () =>
      set({
        currentAudio: null,
        queue: [],
        currentQueueIndex: 0,
        status: "idle",
        position: 0,
        duration: 0,
        error: null,
      }),
  },
}));
