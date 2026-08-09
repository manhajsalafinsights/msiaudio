import { useShallow } from "zustand/react/shallow";
import { usePlayerStore } from "@/features/player/store/player-store";

export function usePlayer() {
  return usePlayerStore(
    useShallow((state) => ({
      audio: state.currentAudio,
      status: state.status,
      position: state.position,
      duration: state.duration,
      config: state.config,
      error: state.error,
      queueLength: state.queue.length,
      currentQueueIndex: state.currentQueueIndex,
    })),
  );
}

export function usePlayerActions() {
  return usePlayerStore((state) => state.actions);
}

export function useCurrentAudio() {
  return usePlayerStore((state) => state.currentAudio);
}

export function usePlayerStatus() {
  return usePlayerStore((state) => state.status);
}

export function usePlayerPosition() {
  return usePlayerStore(
    useShallow((state) => ({
      position: state.position,
      duration: state.duration,
    })),
  );
}

export function usePlayerConfig() {
  return usePlayerStore((state) => state.config);
}

export function useQueue() {
  return usePlayerStore(
    useShallow((state) => ({
      queue: state.queue,
      currentIndex: state.currentQueueIndex,
    })),
  );
}

export function usePrevNext() {
  return usePlayerStore(
    useShallow((state) => {
      const currentIndex = state.currentQueueIndex;
      const hasPrev = currentIndex > 0;
      const hasNext = currentIndex < state.queue.length - 1;
      const prevAudio = state.queue[currentIndex - 1]?.audio ?? null;
      const nextAudio = state.queue[currentIndex + 1]?.audio ?? null;

      return {
        hasPrev: hasPrev && state.position < 5 ? currentIndex > 0 : hasPrev,
        hasNext,
        prevAudio,
        nextAudio,
        currentAudio: state.currentAudio,
      };
    }),
  );
}
