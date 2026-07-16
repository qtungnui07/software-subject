"use client";

import { Check, Gift, Snowflake, Sparkles, X, type LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import type {
  RoadmapNodeState,
  RoadmapNodeView,
} from "@/components/learn/roadmap-node";

const iconByState: Partial<Record<RoadmapNodeState, LucideIcon>> = {
  rewardAvailable: Snowflake,
  rewardClaimed: Check,
  rewardLocked: Gift,
};

const toneByState: Partial<Record<RoadmapNodeState, string>> = {
  rewardAvailable: "text-cyan-500 bg-cyan-50 dark:bg-cyan-950/25",
  rewardClaimed: "text-emerald-500 bg-emerald-50 dark:bg-emerald-950/25",
  rewardLocked: "text-slate-400 bg-slate-100 dark:bg-slate-800",
};

type Props = {
  view: RoadmapNodeView;
  claiming: boolean;
  error: string | null;
  onClose: () => void;
  onClaimReward?: (nodeId: string) => Promise<void> | void;
};

export const RoadmapRewardPopover = ({
  view,
  claiming,
  error,
  onClose,
  onClaimReward,
}: Props) => {
  const Icon = iconByState[view.state] ?? Gift;
  const tone = toneByState[view.state] ?? toneByState.rewardLocked;
  const isRewardAvailable = view.state === "rewardAvailable";
  const isRewardClaimed = view.state === "rewardClaimed";
  const isRewardLocked = view.state === "rewardLocked";

  return (
    <div
      id={`course-roadmap-popover-${view.node.id}`}
      role="dialog"
      aria-modal="false"
      aria-label={`Phần thưởng ${view.node.title}`}
      tabIndex={-1}
      data-course-roadmap-reward-popover="freeze"
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
        aria-label="Đóng thông tin phần thưởng"
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

      {isRewardLocked ? (
        <div className="mt-4 rounded-2xl bg-slate-50 p-3 text-xs font-bold leading-5 text-slate-500 dark:bg-slate-900/40 dark:text-slate-400">
          {view.lockedReason ?? "Hoàn thành bài học trước để mở rương Freeze."}
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
