"use client";

import Link from "next/link";
import {
  Check,
  Gift,
  Lock,
  Snowflake,
  Sparkles,
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

const iconByState: Record<RoadmapNodeState, LucideIcon> = {
  completed: Check,
  current: Star,
  available: Star,
  locked: Lock,
  rewardAvailable: Snowflake,
  rewardClaimed: Check,
  rewardLocked: Gift,
  checkpointAvailable: Trophy,
  checkpointCompleted: Trophy,
  checkpointLocked: Lock,
};

const toneByState: Record<RoadmapNodeState, string> = {
  completed: "text-emerald-500 bg-emerald-50 dark:bg-emerald-950/25",
  current: "text-[#1486CC] bg-sky-50 dark:bg-sky-950/25",
  available: "text-[#1486CC] bg-sky-50 dark:bg-sky-950/25",
  locked: "text-slate-400 bg-slate-100 dark:bg-slate-800",
  rewardAvailable: "text-cyan-500 bg-cyan-50 dark:bg-cyan-950/25",
  rewardClaimed: "text-emerald-500 bg-emerald-50 dark:bg-emerald-950/25",
  rewardLocked: "text-slate-400 bg-slate-100 dark:bg-slate-800",
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

const getLockedMessage = (view: RoadmapNodeView) => {
  if (view.state === "rewardLocked") {
    return "Hoàn thành 3 bài học đầu tiên để mở rương Freeze.";
  }

  if (view.state === "checkpointLocked") {
    return "Hoàn thành các bài học trước đó để mở checkpoint.";
  }

  return "Hoàn thành node phía trước để mở khóa phần này.";
};

type Props = {
  view: RoadmapNodeView;
  todayMinutes: number;
  claiming: boolean;
  error: string | null;
  onClose: () => void;
  onClaimReward?: (nodeId: string) => Promise<void> | void;
};

export const RoadmapNodePopover = ({
  view,
  todayMinutes,
  claiming,
  error,
  onClose,
  onClaimReward,
}: Props) => {
  const Icon = iconByState[view.state];
  const isLocked = view.disabled;
  const isReward = view.node.type === "chest";
  const isRewardAvailable = view.state === "rewardAvailable";
  const isRewardClaimed = view.state === "rewardClaimed";
  const isCheckpoint = view.node.type === "checkpoint";

  return (
    <div
      id={`course-roadmap-popover-${view.node.id}`}
      role="dialog"
      aria-modal="false"
      data-course-roadmap-popover="coddy-small"
      aria-label={view.node.title}
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
        aria-label="Đóng thông tin node"
      >
        <X className="size-4 stroke-[3]" />
      </button>

      <div className="flex items-start gap-3 pr-8">
        <div
          className={cn(
            "flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl",
            toneByState[view.state],
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

      <p className="mt-3 text-sm font-bold leading-6 text-slate-500 dark:text-slate-300">
        {view.node.description}
      </p>

      {view.rewardLabel ? (
        <div className="mt-4 flex items-start gap-3 rounded-2xl bg-cyan-50 p-3 text-sm font-black text-cyan-700 dark:bg-cyan-950/20 dark:text-cyan-200">
          <Sparkles className="mt-0.5 size-5 shrink-0 stroke-[3]" />
          <div>
            <p>{view.rewardLabel}</p>
            <p className="mt-1 text-xs font-bold leading-5 text-cyan-600/80 dark:text-cyan-200/80">
              Freeze tự động bảo vệ streak khi bạn bỏ lỡ một ngày.
            </p>
          </div>
        </div>
      ) : null}

      {!isReward && !isLocked ? (
        <div className="mt-4 rounded-2xl bg-sky-50 p-3 dark:bg-sky-950/20">
          <div className="flex items-center justify-between text-xs font-black uppercase tracking-wide text-[#1486CC] dark:text-sky-300">
            <span>{isCheckpoint ? "Điểm checkpoint" : "XP thưởng"}</span>
            <span>
              {isCheckpoint && view.checkpointScore !== null
                ? `${view.checkpointScore}%`
                : `${view.node.xp} XP`}
            </span>
          </div>
          <p className="mt-2 text-xs font-black text-slate-600 dark:text-slate-300">
            {todayMinutes}m hôm nay · {getMilestoneLabel(todayMinutes)}
          </p>
          {isCheckpoint && (view.checkpointScore ?? 0) > 0 ? (
            <p
              className={cn(
                "mt-2 text-xs font-black",
                (view.checkpointScore ?? 0) >= CHECKPOINT_UNLOCK_THRESHOLD
                  ? "text-emerald-500"
                  : "text-amber-500",
              )}
            >
              Điểm cao nhất: {view.checkpointScore}%
            </p>
          ) : null}
        </div>
      ) : null}

      {isLocked ? (
        <div className="mt-4 rounded-2xl bg-slate-50 p-3 text-xs font-bold leading-5 text-slate-500 dark:bg-slate-900/40 dark:text-slate-400">
          {getLockedMessage(view)}
        </div>
      ) : null}

      {isRewardClaimed ? (
        <div className="mt-4 rounded-2xl bg-emerald-50 p-3 text-xs font-bold leading-5 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-300">
          Bạn đã nhận rương này. Freeze đã được lưu vào streak của bạn.
        </div>
      ) : null}

      {error ? (
        <div className="mt-4 rounded-2xl bg-rose-50 p-3 text-xs font-bold leading-5 text-rose-600 dark:bg-rose-950/20 dark:text-rose-300">
          {error}
        </div>
      ) : null}

      {isRewardAvailable ? (
        <button
          type="button"
          disabled={claiming}
          aria-busy={claiming}
          className="course-roadmap-action course-roadmap-action--reward"
          onClick={() => void onClaimReward?.(view.node.id)}
        >
          {claiming ? "ĐANG NHẬN..." : "NHẬN FREEZE"}
        </button>
      ) : view.href && !isLocked ? (
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
