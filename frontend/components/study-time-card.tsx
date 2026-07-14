"use client";

import { useEffect, useMemo, useState } from "react";
import { Clock3, TimerReset } from "lucide-react";

import { dispatchStudyTimeUpdate } from "@/components/use-study-time-summary";
import { cn } from "@/lib/utils";
import type { StudyTimeSummary } from "@/services/study-time-service";

const DAILY_MILESTONES = [
  { label: "15M ĐỒNG", seconds: 15 * 60, dotClass: "bg-gradient-to-br from-[#d97706] to-[#b45309] shadow-[0_0_6px_rgba(217,119,6,0.4)]" },
  { label: "30M BẠC", seconds: 30 * 60, dotClass: "bg-gradient-to-br from-[#94a3b8] to-[#64748b] shadow-[0_0_6px_rgba(148,163,184,0.4)]" },
  { label: "1H VÀNG", seconds: 60 * 60, dotClass: "bg-gradient-to-br from-[#f59e0b] to-[#d97706] shadow-[0_0_8px_rgba(245,158,11,0.5)]" },
];

type Props = {
  initialSummary: StudyTimeSummary | null;
  isLoggedIn: boolean;
  onTodaySecondsChange?: (todaySeconds: number) => void;
};

const emptySummary: StudyTimeSummary = {
  userId: "",
  totalSeconds: 0,
  todaySeconds: 0,
  dailyGoalSeconds: 60 * 60,
  currentDay: "",
  updatedAt: "",
};

const clampPercent = (value: number) => Math.max(0, Math.min(100, value));

const formatMinutes = (seconds: number) => {
  if (seconds > 0 && seconds < 60) {
    return "<1 phút";
  }

  return `${Math.floor(seconds / 60)} phút`;
};

const formatLongDuration = (seconds: number) => {
  const totalMinutes = Math.floor(seconds / 60);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (hours <= 0) {
    if (seconds > 0 && seconds < 60) {
      return "<1 phút";
    }

    return `${minutes} phút`;
  }

  if (minutes <= 0) {
    return `${hours} giờ`;
  }

  return `${hours} giờ ${minutes} phút`;
};

const getDailyTier = (seconds: number) => {
  if (seconds >= 60 * 60) return "Chuỗi vàng";
  if (seconds >= 30 * 60) return "Chuỗi bạc";
  if (seconds >= 15 * 60) return "Chuỗi đồng";

  return "Chưa đạt chuỗi";
};

export const StudyTimeCard = ({
  initialSummary,
  isLoggedIn,
  onTodaySecondsChange,
}: Props) => {
  const [summary, setSummary] = useState<StudyTimeSummary>(
    initialSummary ?? emptySummary
  );

  const todaySeconds = summary.todaySeconds;
  const dailyGoalSeconds = summary.dailyGoalSeconds || 60 * 60;
  const progressPercent = clampPercent((todaySeconds / dailyGoalSeconds) * 100);
  const tierLabel = getDailyTier(todaySeconds);

  const milestonePositions = useMemo(
    () =>
      DAILY_MILESTONES.map((milestone) => ({
        ...milestone,
        left: `${clampPercent((milestone.seconds / dailyGoalSeconds) * 100)}%`,
        reached: todaySeconds >= milestone.seconds,
      })),
    [dailyGoalSeconds, todaySeconds]
  );

  useEffect(() => {
    onTodaySecondsChange?.(summary.todaySeconds);
    dispatchStudyTimeUpdate(summary.todaySeconds);
  }, [onTodaySecondsChange, summary.todaySeconds]);

  useEffect(() => {
    if (!isLoggedIn || initialSummary) {
      return;
    }

    let isMounted = true;

    const loadSummary = async () => {
      try {
        const response = await fetch("/api/study-time", { cache: "no-store" });
        const data = await response.json().catch(() => null);

        if (isMounted && response.ok && data?.summary) {
          setSummary(data.summary);
        }
      } catch (error) {
        console.warn("Failed to load study time summary", error);
      }
    };

    void loadSummary();

    return () => {
      isMounted = false;
    };
  }, [initialSummary, isLoggedIn]);

  return (
    <section className="rounded-[24px] border-2 border-slate-200 bg-white p-5 shadow-sm dark:border-[#202f36] dark:bg-[#182226]">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-xs font-black uppercase text-emerald-500 dark:text-emerald-400">
            <Clock3 className="size-4 stroke-[3]" />
            <span>Thời gian học</span>
          </div>
          <p className="mt-3 text-2xl font-black text-slate-800 dark:text-white">
            {formatMinutes(todaySeconds)}
          </p>
          <p className="mt-1 text-xs font-bold text-slate-500 dark:text-slate-400">
            Tổng: {formatLongDuration(summary.totalSeconds)}
          </p>
        </div>
      </div>

      <div className="mt-5 rounded-[20px] border-2 border-slate-100 bg-slate-50 p-4 dark:border-[#202f36] dark:bg-[#141f23]">
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 text-sm font-black text-sky-500">
              <TimerReset className="size-4 stroke-[3]" />
              <span>Mục tiêu ngày</span>
            </div>
            <p className="mt-1 text-xs font-bold text-slate-500 dark:text-slate-400">
              {formatMinutes(todaySeconds)} hôm nay · {tierLabel}
            </p>
          </div>
        </div>

        <div className="relative mt-6 h-4 rounded-full bg-slate-200 dark:bg-slate-800">
          <div
            className="h-full rounded-full bg-sky-500 transition-[width] duration-500"
            style={{ width: `${progressPercent}%` }}
          />
          {milestonePositions.map((milestone) => (
            <div
              key={milestone.label}
              className="absolute top-1/2 size-5 -translate-x-1/2 -translate-y-1/2 rounded-full border-3 border-white shadow-sm dark:border-[#141f23]"
              style={{ left: milestone.left }}
            >
              <span
                className={cn(
                  "block size-full rounded-full",
                  milestone.reached ? milestone.dotClass : "bg-slate-300 dark:bg-slate-600"
                )}
              />
            </div>
          ))}
        </div>

        <div className="relative mt-3 h-5">
          {milestonePositions.map((milestone) => (
            <span
              key={milestone.label}
              className="absolute top-0 -translate-x-1/2 whitespace-nowrap text-[10px] font-black text-slate-500 dark:text-slate-400"
              style={{ left: milestone.left }}
            >
              {milestone.label}
            </span>
          ))}
        </div>
      </div>

      {!isLoggedIn ? (
        <p className="mt-3 text-xs font-bold leading-5 text-slate-500 dark:text-slate-400">
          Đăng nhập để lưu thời gian học trên server.
        </p>
      ) : null}
    </section>
  );
};
