"use client";

/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useState } from "react";
import { WifiOff } from "lucide-react";

export function useOnlineStatus(): boolean {
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    // Sync with browser API after mount to avoid hydration mismatch
    setIsOnline(navigator.onLine);

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  return isOnline;
}

export function OfflineBanner() {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div
      className="flex items-center justify-center gap-2 rounded-md bg-amber-500/10 px-4 py-2 text-sm text-amber-600"
      role="status"
      aria-live="polite"
    >
      <WifiOff className="h-4 w-4" aria-hidden />
      <span>Anda sedang offline. Beberapa fitur mungkin tidak tersedia.</span>
    </div>
  );
}
