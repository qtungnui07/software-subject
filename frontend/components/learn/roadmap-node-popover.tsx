"use client";

import Link from "next/link";
import {
  Check,
  Clock3,
  Lock,
  Star,
  Trophy,
  X,
  type LucideIcon,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { CHECKPOINT_UNLOCK_THRESHOLD } from "@/lib/courses/course-unlock-policy";
import type {
  RoadmapNodeState,
  RoadmapNodeView,
} from "@/components/learn/roadmap-node";

const iconByState: Partial<Record<RoadmapNodeState, LucideIcon>> = {
  completed: Check,
  current: Star,
  available: Star,
  locked: Lock,
  checkpointAvailable: Trophy,
  checkpointCompleted: Trophy,
  checkpointLocked: Lock,
};

const toneByState: Partial<Record<RoadmapNodeState, string>> = {
  completed: "text-emerald-500 bg-emerald-50 dark:bg-emerald-950/25",
  current: "text-[#1486CC] bg-sky-50 dark:bg-sky-950/25",
  available: "text-[#1486CC] bg-sky-50 dark:bg-sky-950/25",
  locked: "text-slate-400 bg-slate-100 dark:bg-slate-800",
  checkpointAvailable: "text-violet-500 bg-violet-50 dark:bg-violet-950/25",
  checkpointCompleted: "text-violet-500 bg-violet-50 dark:bg-violet-950/25",
  checkpointLocked: "text-slate-400 bg-slate-100 dark:bg-slate-800",
};

const getMilestoneLabel = (minutes: number) => {
  if (minutes >= 60) return "Chuỗi vàng";
  if (minutes >= 30) return "Chuỗi bạc";
  if (minutes >= 15) return "Chuỗi đồng";

  return "Chưa đạt chuỗi";
};

type Props = {
  view: RoadmapNodeView;
  todayMinutes: number;
  onClose: () => void;
};

export const RoadmapNodePopover = ({
  view,
  todayMinutes,
  onClose,
}: Props) => {
  const Icon = iconByState[view.state] ?? Star;
  const tone = toneByState[view.state] ?? toneByState.available;
  const isLocked = view.disabled;
  const isCheckpoint = view.node.type === "checkpoint";

  return (
    <div
      id={`course-roadmap-popover-${view.node.id}`}
      role="dialog"
      aria-modal="false"
      aria-label={`Thông tin ${view.node.title}`}
      tabIndex={-1}
      data-course-roadmap-popover="coddy-small"
      data-course-roadmap-popover-kind="learning"
      className={cn(
        "course-roadmap-popover",
        view.x >= 52
          ? "course-roadmap-popover--left"
          : "course-roadmap-popover--right",
        view.y > 860 && "course-roadmap-popover--up",
      )}
      onClick={(event) => event.stopPropagation()}
    >
      <button
        type="button"
        className="absolute right-3 top-3 flex size-8 items-center justify-center rounded-xl bg-slate-100 text-slate-400 transition hover:bg-slate-200 hover:text-slate-600 dark:bg-slate-800 dark:hover:bg-slate-700 dark:hover:text-slate-200"
        onClick={onClose}
        aria-label="Đóng thông tin bài học"
      >
        <X className="size-4 stroke-[3]" />
      </button>

      <div className="flex items-start gap-3 pr-8">
        <div
          className={cn(
            "flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl",
            tone,
          )}
        >
          <Icon className="size-6 stroke-[3]" />
        </div>
        <div className="min-w-0">
          <p className="text-xs font-black uppercase tracking-[0.16em] text-slate-400 dark:text-slate-500">
            {view.label}
          </p>
          <h3 className="mt-1 text-base font-black leading-tight text-slate-800 dark:text-white">
            {view.node.title}
          </h3>
        </div>
      </div>

      <p className="mt-3 line-clamp-2 text-sm font-bold leading-6 text-slate-500 dark:text-slate-300">
        {view.node.description}
      </p>

      <div className="mt-4 grid grid-cols-2 gap-2">
        <div className="rounded-2xl bg-sky-50 p-3 dark:bg-sky-950/20">
          <p className="text-[11px] font-black uppercase tracking-wide text-slate-400 dark:text-slate-500">
            {isCheckpoint ? "Điểm cao nhất" : "XP thưởng"}
          </p>
          <p className="mt-1 text-sm font-black text-[#1486CC] dark:text-sky-300">
            {isCheckpoint
              ? `${view.checkpointScore ?? 0}%`
              : `${view.node.xp} XP`}
          </p>
        </div>
        <div className="rounded-2xl bg-slate-50 p-3 dark:bg-slate-900/40">
          <p className="flex items-center gap-1 text-[11px] font-black uppercase tracking-wide text-slate-400 dark:text-slate-500">
            <Clock3 className="size-3.5 stroke-[3]" />
            Ước tính
          </p>
          <p className="mt-1 text-sm font-black text-slate-700 dark:text-slate-200">
            {view.estimatedMinutes} phút
          </p>
        </div>
      </div>

      {!isLocked ? (
        <p className="mt-3 text-xs font-black text-slate-500 dark:text-slate-400">
          {todayMinutes}m hôm nay · {getMilestoneLabel(todayMinutes)}
        </p>
      ) : null}

      {isCheckpoint && (view.checkpointScore ?? 0) > 0 ? (
        <p
          className={cn(
            "mt-3 text-xs font-black",
            (view.checkpointScore ?? 0) >= CHECKPOINT_UNLOCK_THRESHOLD
              ? "text-emerald-500"
              : "text-amber-500",
          )}
        >
          {(view.checkpointScore ?? 0) >= CHECKPOINT_UNLOCK_THRESHOLD
            ? "Đã vượt checkpoint"
            : `Cần đạt ${CHECKPOINT_UNLOCK_THRESHOLD}% để vượt qua`}
        </p>
      ) : null}

      {isLocked ? (
        <div className="mt-4 rounded-2xl bg-slate-50 p-3 text-xs font-bold leading-5 text-slate-500 dark:bg-slate-900/40 dark:text-slate-400">
          {view.lockedReason ?? "Hoàn thành bài học trước để mở khóa phần này."}
        </div>
      ) : null}

      {view.href && !isLocked ? (
        <Link
          href={view.href}
          className="course-roadmap-action course-roadmap-action--learn"
        >
          {view.actionLabel}
        </Link>
      ) : (
        <button
          type="button"
          disabled
          className="course-roadmap-action course-roadmap-action--locked"
        >
          {view.actionLabel}
        </button>
      )}
    </div>
  );
};
