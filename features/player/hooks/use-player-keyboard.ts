"use client";

import { useEffect } from "react";
import { usePlayer, usePlayerActions } from "@/features/player/hooks/use-player";

/**
 * Keyboard shortcuts for the player:
 * - Space / k: Play/Pause
 * - Arrow Left / j: Seek backward 10s
 * - Arrow Right / l: Seek forward 30s
 * - Arrow Up: Volume up
 * - Arrow Down: Volume down
 * - m: Mute/Unmute
 */
export function usePlayerKeyboard() {
  const { status, position, duration, config } = usePlayer();
  const actions = usePlayerActions();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable) {
        return;
      }

      switch (e.key) {
        case " ":
        case "k":
          e.preventDefault();
          if (status === "playing") {
            actions.pause();
          } else {
            actions.play();
          }
          break;

        case "ArrowLeft":
        case "j":
          e.preventDefault();
          actions.seek(Math.max(0, position - 10));
          break;

        case "ArrowRight":
        case "l":
          e.preventDefault();
          actions.seek(Math.min(duration, position + 30));
          break;

        case "ArrowUp":
          e.preventDefault();
          actions.setVolume(Math.min(1, config.volume + 0.1));
          break;

        case "ArrowDown":
          e.preventDefault();
          actions.setVolume(Math.max(0, config.volume - 0.1));
          break;

        case "m":
          e.preventDefault();
          actions.toggleMute();
          break;

        default:
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [status, position, duration, config.volume, actions]);
}
