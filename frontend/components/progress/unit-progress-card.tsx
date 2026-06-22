"use client";

import { useEffect, useState } from "react";
import { BookOpen, CheckCircle2, Lock, PlayCircle } from "lucide-react";

import type { ProgressUnit } from "@/data/progress-data";
import type { UnitProgressSummary } from "@/lib/progress-utils";
import { cn } from "@/lib/utils";

type Props = {
  unit: ProgressUnit;
  summary: UnitProgressSummary;
};

const statusConfig = {
  completed: {
    label: "Hoàn thành",
    icon: CheckCircle2,
    cardClass: "border-emerald-200 bg-emerald-50/70 dark:border-emerald-950/40 dark:bg-emerald-950/20",
    badgeClass: "border-emerald-200 bg-emerald-50 text-emerald-600 dark:border-emerald-900/30 dark:bg-emerald-950/40 dark:text-emerald-400",
    iconClass: "text-emerald-500",
    barClass: "bg-emerald-500",
  },
  active: {
    label: "Đang học",
    icon: PlayCircle,
    cardClass: "border-sky-200 bg-sky-50/80 shadow-sm dark:border-[#202f36] dark:bg-[#182226]",
    badgeClass: "border-sky-200 bg-sky-50 text-sky-600 dark:border-[#202f36] dark:bg-[#1f2d33] dark:text-sky-400",
    iconClass: "text-sky-500",
    barClass: "bg-sky-500",
  },
  locked: {
    label: "Chưa mở khóa",
    icon: Lock,
    cardClass: "border-slate-200 bg-slate-50/70 dark:border-[#202f36]/40 dark:bg-[#141f23]/60",
    badgeClass: "border-slate-200 bg-white text-slate-500 dark:border-[#202f36] dark:bg-[#1f2d33] dark:text-slate-400",
    iconClass: "text-slate-400",
    barClass: "bg-slate-300 dark:bg-[#202f36]",
  },
} as const;

const clampPercent = (value: number) => {
  if (Number.isNaN(value)) return 0;
  return Math.min(100, Math.max(0, value));
};

export const UnitProgressCard = ({ unit, summary }: Props) => {
  const targetPercent = clampPercent(summary.completionPercent);
  const [animatedPercent, setAnimatedPercent] = useState(0);
  const config = statusConfig[summary.status];
  const StatusIcon = config.icon;

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setAnimatedPercent(targetPercent);
    }, 120);

    return () => window.clearTimeout(timeoutId);
  }, [targetPercent]);

  return (
    <article
      className={cn(
        "rounded-[20px] border-2 p-3.5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md",
        config.cardClass
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.12em] text-sky-500">
            <BookOpen className="h-4 w-4" />
            Unit {unit.id}
          </div>

          <h3 className="mt-1 line-clamp-2 text-base font-black leading-5 text-slate-800 dark:text-slate-100">
            {unit.title.replace(`Unit ${unit.id}: `, "")}
          </h3>
        </div>

        <div
          className={cn(
            "flex shrink-0 items-center gap-1.5 rounded-full border-2 px-2.5 py-1 text-[11px] font-black",
            config.badgeClass
          )}
        >
          <StatusIcon className={cn("h-3.5 w-3.5", config.iconClass)} />
          {config.label}
        </div>
      </div>

      <p className="mt-2.5 line-clamp-2 text-sm font-bold leading-5 text-slate-500 dark:text-slate-400">
        {unit.description}
      </p>

      <div className="mt-3.5 flex items-end justify-between gap-3">
        <p className="text-sm font-extrabold text-slate-600 dark:text-slate-300">
          {summary.completedLessons} / {summary.totalLessons} bài học
        </p>
        <p className="text-2xl font-black leading-none text-slate-800 dark:text-slate-100">
          {targetPercent}%
        </p>
      </div>

      <div className="mt-2.5 h-3 overflow-hidden rounded-full bg-white dark:bg-[#141f23] shadow-inner">
        <div
          className={cn(
            "h-full rounded-full transition-all duration-700 ease-out",
            config.barClass
          )}
          style={{ width: `${animatedPercent}%` }}
        />
      </div>
    </article>
  );
};
