"use client";

import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { TimerReset } from "lucide-react";

import { Button } from "@/components/ui/button";
import { dispatchStudyTimeUpdate } from "@/components/use-study-time-summary";
import {
  getAfkInactivityLimitMs,
  MAX_STREAK_AFK_COUNT,
} from "@/lib/study-session-policy";
import {
  canAcquireStudySessionLease,
  createStudySessionLease,
  parseStudySessionLease,
  STUDY_SESSION_HEARTBEAT_MS,
  STUDY_SESSION_LOCK_KEY,
} from "@/lib/study-time/study-session-lock";

const SYNC_EVERY_SECONDS = 15;

type Props = {
  isActive: boolean;
  onActiveSecondsChange?: (seconds: number) => void;
  onAfkCountChange?: (count: number) => void;
};

export type LessonStudyTimerHandle = {
  flush: (options?: { keepalive?: boolean }) => Promise<number>;
  getActiveSeconds: () => number;
  getAfkCount: () => number;
  reset: () => void;
  restore: (activeSeconds: number, afkCount: number) => void;
};

export const LessonStudyTimer = forwardRef<LessonStudyTimerHandle, Props>(
  ({ isActive, onActiveSecondsChange, onAfkCountChange }, ref) => {
    const [isAfk, setIsAfk] = useState(false);
    const [afkCount, setAfkCount] = useState(0);

    const activeSecondsRef = useRef(0);
    const pendingSecondsRef = useRef(0);
    const lastActivityAtRef = useRef(0);
    const flushInFlightRef = useRef(false);
    const canSyncRef = useRef(true);
    const afkCountRef = useRef(0);
    const tabIdRef = useRef("");
    const ownsStudySessionRef = useRef(false);
    const isPageVisibleRef = useRef(true);
    const isWindowFocusedRef = useRef(true);

    const notifyActiveSeconds = useCallback(() => {
      onActiveSecondsChange?.(activeSecondsRef.current);
    }, [onActiveSecondsChange]);

    const getTabId = useCallback(() => {
      if (!tabIdRef.current) {
        tabIdRef.current =
          typeof crypto !== "undefined" && "randomUUID" in crypto
            ? crypto.randomUUID()
            : `study-tab-${Date.now()}-${Math.random().toString(36).slice(2)}`;
      }

      return tabIdRef.current;
    }, []);

    const acquireOrRefreshStudySession = useCallback(() => {
      if (typeof window === "undefined") {
        ownsStudySessionRef.current = true;
        return true;
      }

      const tabId = getTabId();
      const now = Date.now();

      try {
        const currentLease = parseStudySessionLease(
          window.localStorage.getItem(STUDY_SESSION_LOCK_KEY),
        );

        if (!canAcquireStudySessionLease(currentLease, tabId, now)) {
          ownsStudySessionRef.current = false;
          return false;
        }

        window.localStorage.setItem(
          STUDY_SESSION_LOCK_KEY,
          JSON.stringify(createStudySessionLease(tabId, now)),
        );

        const confirmedLease = parseStudySessionLease(
          window.localStorage.getItem(STUDY_SESSION_LOCK_KEY),
        );
        ownsStudySessionRef.current = confirmedLease?.tabId === tabId;
        return ownsStudySessionRef.current;
      } catch {
        // Browsers may block localStorage in strict privacy modes. In that case,
        // keep the lesson usable and fall back to a single-page timer.
        ownsStudySessionRef.current = true;
        return true;
      }
    }, [getTabId]);

    const releaseStudySession = useCallback(() => {
      ownsStudySessionRef.current = false;

      if (typeof window === "undefined" || !tabIdRef.current) {
        return;
      }

      try {
        const currentLease = parseStudySessionLease(
          window.localStorage.getItem(STUDY_SESSION_LOCK_KEY),
        );

        if (currentLease?.tabId === tabIdRef.current) {
          window.localStorage.removeItem(STUDY_SESSION_LOCK_KEY);
        }
      } catch {
        // Nothing to release when localStorage is unavailable.
      }
    }, []);

    const flushStudyTime = useCallback(
      async (options: { keepalive?: boolean } = {}) => {
        if (
          !canSyncRef.current ||
          flushInFlightRef.current ||
          pendingSecondsRef.current <= 0
        ) {
          return activeSecondsRef.current;
        }

        const durationSeconds = pendingSecondsRef.current;
        pendingSecondsRef.current = 0;
        flushInFlightRef.current = true;

        try {
          const response = await fetch("/api/study-time", {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ durationSeconds }),
            cache: "no-store",
            keepalive: options.keepalive,
          });
          const data = await response.json().catch(() => null);

          if (response.status === 401) {
            canSyncRef.current = false;
            return activeSecondsRef.current;
          }

          if (!response.ok || !data?.summary) {
            throw new Error(data?.error || "Failed to sync study time");
          }

          dispatchStudyTimeUpdate({
            todaySeconds: Number(data.summary.todaySeconds || 0),
            totalSeconds: Number(data.summary.totalSeconds || 0),
          });
        } catch (error) {
          pendingSecondsRef.current += durationSeconds;
          console.warn("Failed to sync lesson study time", error);
        } finally {
          flushInFlightRef.current = false;
        }

        return activeSecondsRef.current;
      },
      [],
    );

    useImperativeHandle(
      ref,
      () => ({
        flush: flushStudyTime,
        getActiveSeconds: () => activeSecondsRef.current,
        getAfkCount: () => afkCountRef.current,
        reset: () => {
          activeSecondsRef.current = 0;
          pendingSecondsRef.current = 0;
          afkCountRef.current = 0;
          lastActivityAtRef.current = Date.now();
          setAfkCount(0);
          onAfkCountChange?.(0);
          setIsAfk(false);
          notifyActiveSeconds();
        },
        restore: (activeSeconds: number, restoredAfkCount: number) => {
          activeSecondsRef.current = Math.max(0, Math.floor(activeSeconds));
          pendingSecondsRef.current = 0;
          afkCountRef.current = Math.max(0, Math.floor(restoredAfkCount));
          lastActivityAtRef.current = Date.now();
          setAfkCount(afkCountRef.current);
          onAfkCountChange?.(afkCountRef.current);
          setIsAfk(false);
          notifyActiveSeconds();
        },
      }),
      [flushStudyTime, notifyActiveSeconds, onAfkCountChange],
    );

    useEffect(() => {
      isPageVisibleRef.current = document.visibilityState === "visible";
      isWindowFocusedRef.current = document.hasFocus();

      if (!isActive) {
        void flushStudyTime({ keepalive: true });
        releaseStudySession();
        return;
      }

      lastActivityAtRef.current = Date.now();
      acquireOrRefreshStudySession();
    }, [
      acquireOrRefreshStudySession,
      flushStudyTime,
      isActive,
      releaseStudySession,
    ]);

    useEffect(() => {
      if (!isActive) {
        return;
      }

      const refreshLease = () => {
        const ownedBeforeRefresh = ownsStudySessionRef.current;
        const ownsAfterRefresh = acquireOrRefreshStudySession();

        if (ownedBeforeRefresh && !ownsAfterRefresh) {
          void flushStudyTime();
        }
      };

      refreshLease();
      const heartbeatId = window.setInterval(
        refreshLease,
        STUDY_SESSION_HEARTBEAT_MS,
      );

      const handleStorage = (event: StorageEvent) => {
        if (event.key === STUDY_SESSION_LOCK_KEY) {
          refreshLease();
        }
      };

      window.addEventListener("storage", handleStorage);

      return () => {
        window.clearInterval(heartbeatId);
        window.removeEventListener("storage", handleStorage);
        releaseStudySession();
      };
    }, [
      acquireOrRefreshStudySession,
      flushStudyTime,
      isActive,
      releaseStudySession,
    ]);

    useEffect(() => {
      if (!isActive || isAfk) {
        return;
      }

      const markActivity = () => {
        if (document.visibilityState === "visible" && document.hasFocus()) {
          lastActivityAtRef.current = Date.now();
        }
      };

      const events: Array<keyof WindowEventMap> = [
        "keydown",
        "mousedown",
        "mousemove",
        "pointerdown",
        "scroll",
        "touchstart",
      ];

      events.forEach((eventName) =>
        window.addEventListener(eventName, markActivity, { passive: true }),
      );

      return () => {
        events.forEach((eventName) =>
          window.removeEventListener(eventName, markActivity),
        );
      };
    }, [isActive, isAfk]);

    useEffect(() => {
      if (!isActive || isAfk) {
        return;
      }

      const intervalId = window.setInterval(() => {
        if (
          !isPageVisibleRef.current ||
          !isWindowFocusedRef.current ||
          !ownsStudySessionRef.current
        ) {
          return;
        }

        const now = Date.now();

        if (
          now - lastActivityAtRef.current >=
          getAfkInactivityLimitMs(afkCountRef.current)
        ) {
          afkCountRef.current += 1;
          setAfkCount(afkCountRef.current);
          onAfkCountChange?.(afkCountRef.current);
          setIsAfk(true);
          void flushStudyTime();
          releaseStudySession();
          return;
        }

        activeSecondsRef.current += 1;
        pendingSecondsRef.current += 1;
        notifyActiveSeconds();

        if (pendingSecondsRef.current >= SYNC_EVERY_SECONDS) {
          void flushStudyTime();
        }
      }, 1000);

      return () => window.clearInterval(intervalId);
    }, [
      flushStudyTime,
      isActive,
      isAfk,
      notifyActiveSeconds,
      onAfkCountChange,
      releaseStudySession,
    ]);

    useEffect(() => {
      const handleVisibilityChange = () => {
        const isHidden = document.visibilityState === "hidden";
        const isVisible = !isHidden;
        isPageVisibleRef.current = isVisible;

        if (isVisible) {
          lastActivityAtRef.current = Date.now();
          acquireOrRefreshStudySession();
        } else {
          void flushStudyTime({ keepalive: true });
          releaseStudySession();
        }
      };

      const handleFocus = () => {
        isWindowFocusedRef.current = true;
        lastActivityAtRef.current = Date.now();
        acquireOrRefreshStudySession();
      };

      const handleBlur = () => {
        isWindowFocusedRef.current = false;
        void flushStudyTime({ keepalive: true });
        releaseStudySession();
      };

      const handleBeforeUnload = () => {
        void flushStudyTime({ keepalive: true });
        releaseStudySession();
      };

      document.addEventListener("visibilitychange", handleVisibilityChange);
      window.addEventListener("focus", handleFocus);
      window.addEventListener("blur", handleBlur);
      window.addEventListener("beforeunload", handleBeforeUnload);

      return () => {
        document.removeEventListener(
          "visibilitychange",
          handleVisibilityChange,
        );
        window.removeEventListener("focus", handleFocus);
        window.removeEventListener("blur", handleBlur);
        window.removeEventListener("beforeunload", handleBeforeUnload);
        void flushStudyTime({ keepalive: true });
        releaseStudySession();
      };
    }, [acquireOrRefreshStudySession, flushStudyTime, releaseStudySession]);

    const resumeStudying = () => {
      lastActivityAtRef.current = Date.now();
      acquireOrRefreshStudySession();
      setIsAfk(false);
    };

    if (!isAfk || !isActive) {
      return null;
    }

    return (
      <div className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-950/55 px-4 backdrop-blur-sm">
        <div
          className="w-full max-w-sm rounded-[24px] border-2 border-slate-200 bg-white p-5 text-center shadow-[0_24px_70px_rgba(15,23,42,0.32)] dark:border-[#202f36] dark:bg-[#182226]"
          role="dialog"
          aria-modal="true"
          aria-label="Cảnh báo vắng mặt"
        >
          <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-amber-50 text-amber-500 dark:bg-amber-950/30 dark:text-amber-300">
            <TimerReset className="size-7 stroke-[3]" />
          </div>
          <h2 className="mt-4 text-xl font-black text-slate-800 dark:text-white">
            Bạn đang AFK?
          </h2>
          <p className="mt-2 text-sm font-bold leading-6 text-slate-500 dark:text-slate-300">
            {afkCount > MAX_STREAK_AFK_COUNT
              ? "Bạn đã AFK quá 3 lần. Buổi học này không được tính vào streak."
              : `Lần AFK ${afkCount}/${MAX_STREAK_AFK_COUNT}. Hệ thống đã tạm dừng đếm thời gian học.`}
          </p>
          <Button
            type="button"
            variant="primary"
            className="mt-5 h-12 w-full rounded-2xl"
            onClick={resumeStudying}
          >
            Tiếp tục học
          </Button>
        </div>
      </div>
    );
  },
);

LessonStudyTimer.displayName = "LessonStudyTimer";
