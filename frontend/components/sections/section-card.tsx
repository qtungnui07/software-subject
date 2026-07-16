import {
  CheckCircle2,
  ChevronRight,
  CirclePlay,
  LoaderCircle,
  LockKeyhole,
  Sparkles,
} from "lucide-react";

import { SectionProgress } from "@/components/sections/section-progress";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { SectionPageItem } from "@/types/sections-page";

type Props = {
  section: SectionPageItem;
  pending: boolean;
  disabled: boolean;
  highlighted: boolean;
  onSelect: (section: SectionPageItem) => void;
};

export const SectionCard = ({
  section,
  pending,
  disabled,
  highlighted,
  onSelect,
}: Props) => {
  const StatusIcon = section.completed
    ? CheckCircle2
    : section.unlocked
      ? CirclePlay
      : LockKeyhole;

  return (
    <article
      id={`section-card-${section.id}`}
      className={cn(
        "relative overflow-hidden rounded-[28px] border-2 bg-white p-5 shadow-sm transition sm:p-6 dark:bg-[#182226]",
        section.current
          ? "border-[#1486CC] shadow-[0_14px_36px_rgba(20,134,204,0.14)] dark:border-sky-500"
          : "border-slate-200 dark:border-[#263840]",
        !section.unlocked && "bg-slate-50/80 dark:bg-[#141f23]",
        highlighted &&
          "ring-4 ring-sky-300/70 ring-offset-4 ring-offset-white dark:ring-sky-500/50 dark:ring-offset-[#101a1e]",
      )}
    >
      <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
        <div
          className={cn(
            "grid size-14 shrink-0 place-items-center rounded-2xl border-2",
            section.completed
              ? "border-emerald-100 bg-emerald-50 text-emerald-500 dark:border-emerald-950/40 dark:bg-emerald-950/20"
              : section.unlocked
                ? "border-sky-100 bg-sky-50 text-[#1486CC] dark:border-sky-950/40 dark:bg-sky-950/20 dark:text-sky-400"
                : "border-slate-200 bg-slate-100 text-slate-400 dark:border-[#263840] dark:bg-[#111c20]",
          )}
        >
          <StatusIcon className="size-7" aria-hidden="true" />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full border-2 border-slate-200 bg-slate-50 px-3 py-1 text-[11px] font-black uppercase tracking-[0.14em] text-slate-500 dark:border-[#263840] dark:bg-[#111c20] dark:text-slate-400">
              {section.levelLabel}
            </span>
            {section.current ? (
              <span className="rounded-full border-2 border-sky-100 bg-sky-50 px-3 py-1 text-[11px] font-black uppercase tracking-[0.14em] text-[#1486CC] dark:border-sky-950/40 dark:bg-sky-950/20 dark:text-sky-400">
                Đang học
              </span>
            ) : null}
            {section.recommended ? (
              <span className="inline-flex items-center gap-1 rounded-full border-2 border-violet-100 bg-violet-50 px-3 py-1 text-[11px] font-black uppercase tracking-[0.14em] text-violet-600 dark:border-violet-950/40 dark:bg-violet-950/20 dark:text-violet-400">
                <Sparkles className="size-3.5" aria-hidden="true" />
                Đề xuất cho bạn
              </span>
            ) : null}
          </div>

          <h2 className="mt-4 text-2xl font-black tracking-tight text-slate-800 dark:text-white sm:text-3xl">
            {section.title}
          </h2>
          <p className="mt-3 text-sm font-bold leading-6 text-slate-500 dark:text-slate-400 sm:text-base">
            {section.description}
          </p>

          <div className="mt-5 rounded-2xl border-2 border-sky-100 bg-sky-50/60 p-4 dark:border-sky-950/30 dark:bg-sky-950/10">
            <p className="text-xs font-black uppercase tracking-[0.16em] text-[#1486CC] dark:text-sky-400">
              Chương {section.chapterOrder}
            </p>
            <p className="mt-1 font-black text-slate-800 dark:text-white">
              {section.chapterTitle}
            </p>
            <p className="mt-2 text-sm font-bold leading-6 text-slate-500 dark:text-slate-400">
              {section.chapterDescription}
            </p>
          </div>

          <div className="mt-5">
            <SectionProgress
              completedLessons={section.completedLessons}
              totalLessons={section.totalLessons}
              completionPercent={section.completionPercent}
            />
          </div>

          {section.lockReason ? (
            <div className="mt-4 flex gap-3 rounded-2xl border-2 border-amber-100 bg-amber-50 p-4 text-sm font-bold leading-6 text-amber-800 dark:border-amber-950/30 dark:bg-amber-950/20 dark:text-amber-300">
              <LockKeyhole className="mt-0.5 size-5 shrink-0" aria-hidden="true" />
              <p>{section.lockReason}</p>
            </div>
          ) : null}

          {section.checkpointScore !== null ? (
            <p className="mt-4 text-sm font-black text-slate-500 dark:text-slate-400">
              Điểm checkpoint cao nhất: {section.checkpointScore}%
            </p>
          ) : null}

          <Button
            type="button"
            variant="primary"
            className="mt-5 h-14 w-full rounded-2xl px-5 sm:w-auto sm:min-w-56"
            disabled={!section.unlocked || disabled}
            onClick={() => onSelect(section)}
          >
            {pending ? (
              <LoaderCircle className="size-5 animate-spin" aria-hidden="true" />
            ) : section.unlocked ? (
              <ChevronRight className="size-5" aria-hidden="true" />
            ) : (
              <LockKeyhole className="size-5" aria-hidden="true" />
            )}
            {pending ? "ĐANG CHUYỂN..." : section.actionLabel}
          </Button>
        </div>
      </div>
    </article>
  );
};
