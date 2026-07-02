"use client";

import { useEffect, useState } from "react";

type XpSummaryResponse = {
  success: boolean;
  totalXp: number;
  dailyXp: number;
  weeklyXp: number;
  level: number;
  currentLevelStartXp: number;
  nextLevelXp: number;
  xpIntoCurrentLevel: number;
  xpNeededForNextLevel: number;
  progressPercent: number;
  currentDay: string;
  currentWeekStart: string;
  isDemoUser?: boolean;
};

const DEFAULT_XP_SUMMARY: XpSummaryResponse = {
  success: true,
  totalXp: 0,
  dailyXp: 0,
  weeklyXp: 0,
  level: 1,
  currentLevelStartXp: 0,
  nextLevelXp: 100,
  xpIntoCurrentLevel: 0,
  xpNeededForNextLevel: 100,
  progressPercent: 0,
  currentDay: "",
  currentWeekStart: "",
};

const xpCards = [
  {
    key: "totalXp",
    label: "Tổng XP",
    description: "Tích lũy",
    icon: "⚡",
    tone: "border-sky-100 bg-sky-50 text-sky-600 dark:border-sky-950/40 dark:bg-sky-950/20 dark:text-sky-400",
  },
  {
    key: "dailyXp",
    label: "XP hôm nay",
    description: "Daily XP",
    icon: "☀️",
    tone: "border-amber-100 bg-amber-50 text-amber-600 dark:border-amber-950/40 dark:bg-amber-950/20 dark:text-amber-400",
  },
  {
    key: "weeklyXp",
    label: "XP tuần này",
    description: "Xếp hạng tuần",
    icon: "🏆",
    tone: "border-emerald-100 bg-emerald-50 text-emerald-600 dark:border-emerald-950/40 dark:bg-emerald-950/20 dark:text-emerald-400",
  },
] as const;

export const ProfileXpPanel = () => {
  const [summary, setSummary] = useState<XpSummaryResponse>(DEFAULT_XP_SUMMARY);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    const loadXpSummary = async () => {
      try {
        setIsLoading(true);
        setError("");

        const response = await fetch("/api/xp/summary", {
          method: "GET",
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error("Failed to load XP summary.");
        }

        const data = (await response.json()) as XpSummaryResponse;

        if (isMounted) {
          setSummary({ ...DEFAULT_XP_SUMMARY, ...data });
        }
      } catch (requestError) {
        console.error("Failed to load XP profile summary:", requestError);

        if (isMounted) {
          setSummary(DEFAULT_XP_SUMMARY);
          setError("Chưa thể tải XP lúc này.");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    void loadXpSummary();

    return () => {
      isMounted = false;
    };
  }, []);

  const progressPercent = Math.min(100, Math.max(0, summary.progressPercent));

  return (
    <article className="rounded-[28px] border-2 border-sky-100 bg-gradient-to-br from-white via-sky-50/70 to-cyan-50 p-5 shadow-sm sm:p-6 dark:border-slate-800 dark:from-slate-900/60 dark:via-slate-900/60 dark:to-slate-950/60">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.18em] text-sky-500">
            XP Profile
          </p>
          <h2 className="mt-2 text-2xl font-black text-slate-800 dark:text-slate-100">Level {summary.level}</h2>
          <p className="mt-2 text-sm font-bold leading-6 text-slate-500 dark:text-slate-400">
            {isLoading
              ? "Đang tải XP..."
              : `${summary.xpIntoCurrentLevel} / ${summary.nextLevelXp - summary.currentLevelStartXp} XP để lên level tiếp theo`}
          </p>
        </div>

        <div className="flex size-14 shrink-0 items-center justify-center rounded-3xl border-2 border-white bg-white text-3xl shadow-sm dark:border-slate-800 dark:bg-slate-950">
          ⚡
        </div>
      </div>

      <div className="mt-5 h-4 overflow-hidden rounded-full bg-white shadow-inner dark:bg-slate-950">
        <div
          className="h-full rounded-full bg-sky-500 transition-all duration-700 ease-out"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      <div className="mt-2 flex items-center justify-between text-xs font-black uppercase tracking-wide text-slate-400 dark:text-slate-500">
        <span>{summary.currentLevelStartXp} XP</span>
        <span>{summary.nextLevelXp} XP</span>
      </div>

      {error && (
        <div className="mt-4 rounded-2xl border-2 border-amber-100 bg-amber-50 px-4 py-3 text-sm font-bold text-amber-700 dark:border-amber-950/40 dark:bg-amber-950/20 dark:text-amber-400">
          {error}
        </div>
      )}

      <div className="mt-5 grid gap-3 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
        {xpCards.map((card) => (
          <div key={card.key} className={`rounded-2xl border-2 p-4 ${card.tone}`}>
            <div className="flex items-center gap-3">
              <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-white text-2xl shadow-sm dark:bg-slate-950">
                {card.icon}
              </div>
              <div>
                <p className="text-xs font-black uppercase tracking-wide opacity-80">
                  {card.label}
                </p>
                <p className="mt-1 text-xl font-black text-slate-800 dark:text-slate-200">
                  {summary[card.key].toLocaleString("vi-VN")} XP
                </p>
                <p className="mt-1 text-xs font-bold opacity-80">{card.description}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {summary.isDemoUser && (
        <p className="mt-4 rounded-2xl border-2 border-slate-100 bg-white/80 px-4 py-3 text-xs font-bold text-slate-500 dark:border-slate-800 dark:bg-slate-950/60 dark:text-slate-400">
          Đang dùng XP demo trong môi trường phát triển. Khi auth/database thật hoạt động, API sẽ lấy XP theo user thật.
        </p>
      )}
    </article>
  );
};
