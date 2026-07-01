"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { TimerReset } from "lucide-react";

import { Button } from "@/components/ui/button";
import { dispatchStudyTimeUpdate } from "@/components/use-study-time-summary";

const AFK_LIMIT_MS = 2 * 60 * 1000;
const SYNC_EVERY_SECONDS = 15;

type Props = {
  isActive: boolean;
  onActiveSecondsChange?: (seconds: number) => void;
};

export const LessonStudyTimer = ({
  isActive,
  onActiveSecondsChange,
}: Props) => {
  const [isAfk, setIsAfk] = useState(false);

  const activeSecondsRef = useRef(0);
  const pendingSecondsRef = useRef(0);
  const lastActivityAtRef = useRef(0);
  const flushInFlightRef = useRef(false);
  const canSyncRef = useRef(true);

  const notifyActiveSeconds = useCallback(() => {
    onActiveSecondsChange?.(activeSecondsRef.current);
  }, [onActiveSecondsChange]);

  const flushStudyTime = useCallback(
    async (options: { keepalive?: boolean } = {}) => {
      if (
        !canSyncRef.current ||
        flushInFlightRef.current ||
        pendingSecondsRef.current <= 0
      ) {
        return;
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
          return;
        }

        if (!response.ok || !data?.summary) {
          throw new Error(data?.error || "Failed to sync study time");
        }

        dispatchStudyTimeUpdate(Number(data.summary.todaySeconds || 0));
      } catch (error) {
        pendingSecondsRef.current += durationSeconds;
        console.warn("Failed to sync lesson study time", error);
      } finally {
        flushInFlightRef.current = false;
      }
    },
    []
  );

  useEffect(() => {
    if (!isActive) {
      void flushStudyTime({ keepalive: true });
      return;
    }

    lastActivityAtRef.current = Date.now();
  }, [flushStudyTime, isActive]);

  useEffect(() => {
    if (!isActive || isAfk) {
      return;
    }

    const markActivity = () => {
      lastActivityAtRef.current = Date.now();
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
      window.addEventListener(eventName, markActivity, { passive: true })
    );

    return () => {
      events.forEach((eventName) =>
        window.removeEventListener(eventName, markActivity)
      );
    };
  }, [isActive, isAfk]);

  useEffect(() => {
    if (!isActive || isAfk) {
      return;
    }

    const intervalId = window.setInterval(() => {
      const now = Date.now();

      if (now - lastActivityAtRef.current > AFK_LIMIT_MS) {
        setIsAfk(true);
        void flushStudyTime();
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
  }, [flushStudyTime, isActive, isAfk, notifyActiveSeconds]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        void flushStudyTime({ keepalive: true });
      }
    };

    const handleBeforeUnload = () => {
      void flushStudyTime({ keepalive: true });
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("beforeunload", handleBeforeUnload);
      void flushStudyTime({ keepalive: true });
    };
  }, [flushStudyTime]);

  const resumeStudying = () => {
    lastActivityAtRef.current = Date.now();
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
          Hệ thống đã tạm dừng đếm thời gian học sau 2 phút không có tương tác.
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
};
