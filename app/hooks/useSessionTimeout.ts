import { useCallback, useEffect, useRef } from "react";

interface UseSessionTimeoutOptions {
  enabled: boolean;
  timeoutMs: number;
  onTimeout: () => void | Promise<void>;
}

export function useSessionTimeout({
  enabled,
  timeoutMs,
  onTimeout,
}: UseSessionTimeoutOptions) {
  const timerRef = useRef<number | null>(null);
  const onTimeoutRef = useRef(onTimeout);

  useEffect(() => {
    onTimeoutRef.current = onTimeout;
  }, [onTimeout]);

  const clearTimer = useCallback(() => {
    if (timerRef.current !== null) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const startTimer = useCallback(() => {
    if (!enabled) return;
    clearTimer();
    timerRef.current = window.setTimeout(() => {
      void onTimeoutRef.current();
    }, timeoutMs);
  }, [enabled, clearTimer, timeoutMs]);

  useEffect(() => {
    if (!enabled) {
      clearTimer();
      return;
    }

    const events: (keyof WindowEventMap)[] = [
      "mousemove",
      "mousedown",
      "keydown",
      "scroll",
      "touchstart",
      "click",
    ];

    const handleUserActivity = () => {
      startTimer();
    };

    const handleVisibility = () => {
      if (!document.hidden) {
        startTimer();
      }
    };

    startTimer();
    events.forEach((event) => window.addEventListener(event, handleUserActivity));
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      events.forEach((event) => window.removeEventListener(event, handleUserActivity));
      document.removeEventListener("visibilitychange", handleVisibility);
      clearTimer();
    };
  }, [enabled, startTimer, clearTimer]);
}
