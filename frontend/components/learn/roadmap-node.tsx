"use client";

import {
  Check,
  Gift,
  Lock,
  Snowflake,
  Star,
  Trophy,
  type LucideIcon,
} from "lucide-react";

import { cn } from "@/lib/utils";
import type { LearningNodeDefinition } from "@/types/course";

export type RoadmapNodeState =
  | "completed"
  | "current"
  | "available"
  | "locked"
  | "rewardAvailable"
  | "rewardClaimed"
  | "rewardLocked"
  | "checkpointAvailable"
  | "checkpointCompleted"
  | "checkpointLocked";

export type RoadmapNodeView = {
  node: LearningNodeDefinition;
  state: RoadmapNodeState;
  x: number;
  y: number;
  label: string;
  actionLabel: string;
  href: string | null;
  disabled: boolean;
  rewardLabel: string | null;
  checkpointScore: number | null;
  estimatedMinutes: number;
  lockedReason: string | null;
};

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

const badgeByState: Partial<Record<RoadmapNodeState, string>> = {
  current: "TIẾP TỤC",
  rewardAvailable: "NHẬN FREEZE",
  checkpointAvailable: "CHECKPOINT",
};

type Props = {
  view: RoadmapNodeView;
  selected: boolean;
  claiming: boolean;
  celebrated?: boolean;
  onSelect: () => void;
};

export const RoadmapNode = ({
  view,
  selected,
  claiming,
  celebrated = false,
  onSelect,
}: Props) => {
  const Icon = iconByState[view.state];
  const badge = badgeByState[view.state];
  const interactive = !view.disabled || view.node.type === "chest";

  return (
    <div
      id={`course-roadmap-node-${view.node.id}`}
      data-roadmap-node="coddy-3d"
      data-roadmap-node-type={view.node.type}
      data-roadmap-node-state={view.state}
      data-roadmap-current={view.state === "current" ? "true" : undefined}
      data-roadmap-reward-celebrated={celebrated ? "true" : undefined}
      className={cn(
        "course-roadmap-node-anchor absolute z-20 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center",
        selected && "z-[80]",
      )}
      style={{ left: `${view.x}%`, top: view.y }}
    >
      {badge ? (
        <div
          className={cn(
            "course-roadmap-badge",
            view.state === "rewardAvailable" && "course-roadmap-badge--reward",
            view.state === "checkpointAvailable" &&
              "course-roadmap-badge--checkpoint",
          )}
        >
          {badge}
          <span aria-hidden="true" />
        </div>
      ) : null}

      <button
        type="button"
        aria-label={`${view.label}: ${view.node.title}`}
        aria-expanded={selected}
        aria-current={view.state === "current" ? "step" : undefined}
        aria-busy={claiming}
        aria-disabled={view.disabled}
        aria-controls={
          selected ? `course-roadmap-popover-${view.node.id}` : undefined
        }
        className={cn(
          "course-roadmap-node",
          `course-roadmap-node--${view.state}`,
          selected && "course-roadmap-node--selected",
          claiming && "course-roadmap-node--claiming",
          celebrated && "course-roadmap-node--rewardCelebrated",
          !interactive && "course-roadmap-node--muted",
        )}
        onClick={(event) => {
          event.stopPropagation();
          onSelect();
        }}
      >
        <span className="course-roadmap-node__aura" aria-hidden="true" />
        <span className="course-roadmap-node__base-depth" aria-hidden="true" />
        <span className="course-roadmap-node__base" aria-hidden="true" />
        <span className="course-roadmap-node__face-depth" aria-hidden="true" />
        <span className="course-roadmap-node__face" aria-hidden="true">
          <span className="course-roadmap-node__inner" aria-hidden="true" />
          <span className="course-roadmap-node__shine" aria-hidden="true" />
        </span>
        <Icon className="course-roadmap-node__icon" aria-hidden="true" />
      </button>

      <div className="course-roadmap-node-title">{view.node.shortTitle}</div>
    </div>
  );
};
