"use client";

import { Heart, X } from "lucide-react";

type Props = {
  title: string;
  progress: number;
  hearts: number;
  onExitClick: () => void;
};

export const LessonHeader = ({ title, progress, hearts, onExitClick }: Props) => {
  return (
    <header className="sticky top-0 z-50 border-b-2 border-slate-200 dark:border-[#202f36] bg-white dark:bg-[#182226] px-4 py-4 md:px-6">
      <div className="mx-auto flex max-w-[840px] items-center justify-between gap-4 md:gap-6">
        {/* Nút thoát */}
        <button
          type="button"
          onClick={onExitClick}
          className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-slate-50 dark:bg-slate-800/40 text-slate-400 dark:text-slate-400 transition hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-600 dark:hover:text-slate-300 active:scale-95 border border-slate-200 dark:border-slate-700"
          aria-label="Thoát bài học"
        >
          <X className="size-5 stroke-[3]" />
        </button>

        {/* Thanh tiến độ + Tên bài học */}
        <div className="flex flex-1 flex-col items-center">
          <span className="text-xs font-black uppercase tracking-[0.14em] text-slate-400 md:text-sm mb-1.5 truncate max-w-[200px] sm:max-w-none">
            {title}
          </span>
          <div className="relative h-4 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-[#141f23] border border-slate-200 dark:border-slate-800/80 shadow-inner">
            <div
              className="h-full rounded-full bg-gradient-to-r from-green-400 to-green-500 transition-all duration-350 ease-out"
              style={{ width: `${progress}%` }}
            >
              {/* Vệt sáng bóng bẩy kiểu Duolingo */}
              <div className="h-1 w-[98%] mx-auto mt-0.5 rounded-full bg-white/30" />
            </div>
          </div>
        </div>

        {/* Số tim */}
        <div className="flex shrink-0 items-center gap-1.5 rounded-2xl border border-rose-100 dark:border-rose-950/40 bg-rose-50/50 dark:bg-rose-950/20 px-3 py-1.5 text-rose-500 dark:text-rose-400 shadow-sm">
          <Heart className="size-5 fill-current stroke-[2.5] animate-pulse" />
          <span className="text-sm font-black md:text-base leading-none">{hearts}</span>
        </div>
      </div>
    </header>
  );
};
