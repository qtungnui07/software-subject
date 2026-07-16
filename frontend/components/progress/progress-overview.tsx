"use client";

import { useEffect, useState } from "react";
import { BookOpen, Clock, Star, Trophy } from "lucide-react";

import { formatStudyDuration } from "@/lib/study-time/study-time-format";
import { cn } from "@/lib/utils";

type Props = {
  totalLessons: number;
  completedLessons: number;
  completionPercent: number;
  earnedXp: number;
  totalStudySeconds: number;
  className?: string;
};

const clampPercent = (value: number) => {
  if (Number.isNaN(value)) return 0;
  return Math.min(100, Math.max(0, value));
};

export const ProgressOverview = ({
  totalLessons,
  completedLessons,
  completionPercent,
  earnedXp,
  totalStudySeconds,
  className,
}: Props) => {
  const targetPercent = clampPercent(completionPercent);
  const isCompleted = targetPercent >= 100;
  const [animatedPercent, setAnimatedPercent] = useState(0);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setAnimatedPercent(targetPercent);
    }, 120);

    return () => window.clearTimeout(timeoutId);
  }, [targetPercent]);

  return (
    <section
      className={cn(
        "overflow-hidden rounded-[24px] border-2 border-sky-100 dark:border-[#202f36] bg-white dark:bg-[#182226] p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md",
        className
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-sky-500">
            Tổng quan
          </p>
          <h2 className="mt-1 text-xl font-extrabold text-slate-800 dark:text-slate-100">
            Tiến độ khóa học
          </h2>
        </div>

        <div
          className={cn(
            "rounded-full border-2 px-3 py-1 text-xs font-extrabold",
            isCompleted
              ? "border-emerald-200 bg-emerald-50 text-emerald-600 dark:border-emerald-900/30 dark:bg-emerald-950/20 dark:text-emerald-400"
              : "border-sky-200 bg-sky-50 text-sky-600 dark:border-sky-900/30 dark:bg-sky-950/20 dark:text-sky-400"
          )}
        >
          {isCompleted ? "Đã hoàn thành" : "Đang học"}
        </div>
      </div>

      <div className="mt-5 rounded-[22px] border-2 border-sky-100 dark:border-[#202f36] bg-sky-50/70 dark:bg-[#1f2d33] p-4">
        <div className="flex items-end justify-between gap-4">
          <div>
            <div className="text-5xl font-black leading-none text-sky-500">
              {targetPercent}%
            </div>
            <p className="mt-1 text-sm font-bold text-slate-500 dark:text-slate-400">
              hoàn thành khóa học
            </p>
          </div>

          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white dark:bg-[#141f23] shadow-sm">
            <Trophy
              className={cn(
                "h-6 w-6",
                isCompleted ? "text-emerald-500" : "text-sky-500"
              )}
            />
          </div>
        </div>

        <div className="mt-5 h-4 overflow-hidden rounded-full bg-white dark:bg-[#141f23] shadow-inner">
          <div
            className={cn(
              "h-full rounded-full transition-all duration-700 ease-out",
              isCompleted ? "bg-emerald-500" : "bg-sky-500"
            )}
            style={{ width: `${animatedPercent}%` }}
          />
        </div>

        <p className="mt-3 text-sm font-bold text-slate-600 dark:text-slate-300">
          {completedLessons} / {totalLessons} bài học đã hoàn thành
        </p>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <div className="rounded-2xl border-2 border-slate-100 dark:border-[#202f36] bg-white dark:bg-[#182226] p-3">
          <div className="flex items-center gap-2 text-sky-500">
            <BookOpen className="h-4 w-4" />
            <span className="text-xs font-extrabold uppercase">Bài học</span>
          </div>
          <p className="mt-2 text-lg font-black text-slate-800 dark:text-slate-100">
            {completedLessons}/{totalLessons}
          </p>
        </div>

        <div className="rounded-2xl border-2 border-slate-100 dark:border-[#202f36] bg-white dark:bg-[#182226] p-3">
          <div className="flex items-center gap-2 text-amber-500">
            <Star className="h-4 w-4" />
            <span className="text-xs font-extrabold uppercase">XP</span>
          </div>
          <p className="mt-2 text-lg font-black text-slate-800 dark:text-slate-100">
            {earnedXp} XP
          </p>
        </div>

        <div className="col-span-2 rounded-2xl border-2 border-slate-100 dark:border-[#202f36] bg-white dark:bg-[#182226] p-3">
          <div className="flex items-center gap-2 text-emerald-500">
            <Clock className="h-4 w-4" />
            <span className="text-xs font-extrabold uppercase">Thời gian học</span>
          </div>
          <p className="mt-2 text-lg font-black text-slate-800 dark:text-slate-100">
            {formatStudyDuration(totalStudySeconds)}
          </p>
        </div>
      </div>

      {isCompleted ? (
        <p className="mt-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/20 px-4 py-3 text-sm font-bold text-emerald-600 dark:text-emerald-400">
          Tuyệt vời! Bạn đã hoàn thành khóa học này.
        </p>
      ) : (
        <p className="mt-4 rounded-2xl bg-sky-50 dark:bg-sky-950/20 px-4 py-3 text-sm font-bold text-sky-600 dark:text-sky-400">
          Tiếp tục bài tiếp theo để giữ nhịp học mỗi ngày.
        </p>
      )}
    </section>
  );
};
