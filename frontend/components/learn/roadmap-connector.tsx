"use client";

import { cn } from "@/lib/utils";
import type { RoadmapNodeView } from "@/components/learn/roadmap-node";

const curveBetween = (from: RoadmapNodeView, to: RoadmapNodeView) => {
  const middleY = from.y + (to.y - from.y) / 2;
  const pull = Math.abs(to.x - from.x) < 4 ? 9 : 3.5;
  const direction = to.x >= from.x ? 1 : -1;

  return `M ${from.x} ${from.y} C ${from.x + direction * pull} ${middleY}, ${to.x - direction * pull} ${middleY}, ${to.x} ${to.y}`;
};

const isUnlockedState = (state: RoadmapNodeView["state"]) => {
  return !state.endsWith("Locked") && state !== "locked";
};

const isCompletedState = (state: RoadmapNodeView["state"]) => {
  return (
    state === "completed" ||
    state === "rewardClaimed" ||
    state === "checkpointCompleted"
  );
};

type Props = {
  nodes: RoadmapNodeView[];
  height: number;
};

export const RoadmapConnector = ({ nodes, height }: Props) => {
  const segments = nodes.slice(0, -1).map((node, index) => {
    const next = nodes[index + 1];
    const active = isUnlockedState(next.state);
    const completed = isCompletedState(node.state) && active;

    return {
      id: `${node.node.id}-${next.node.id}`,
      d: curveBetween(node, next),
      status: completed ? "completed" : active ? "active" : "locked",
    };
  });

  return (
    <svg
      className="pointer-events-none absolute inset-0 h-full w-full overflow-visible"
      viewBox={`0 0 100 ${height}`}
      preserveAspectRatio="none"
      data-course-roadmap-connector="state-aware"
      aria-hidden="true"
    >
      <defs>
        <linearGradient
          id="courseRoadmapActivePath"
          x1="0"
          x2="1"
          y1="0"
          y2="1"
        >
          <stop offset="0%" stopColor="#22c55e" />
          <stop offset="100%" stopColor="#38bdf8" />
        </linearGradient>
        <linearGradient
          id="courseRoadmapCompletedPath"
          x1="0"
          x2="1"
          y1="0"
          y2="1"
        >
          <stop offset="0%" stopColor="#10b981" />
          <stop offset="100%" stopColor="#22c55e" />
        </linearGradient>
        <filter
          id="courseRoadmapPathShadow"
          x="-30%"
          y="-30%"
          width="160%"
          height="160%"
        >
          <feDropShadow
            dx="0"
            dy="7"
            stdDeviation="7"
            floodColor="#0ea5e9"
            floodOpacity="0.12"
          />
        </filter>
      </defs>

      {segments.map((segment) => (
        <g key={segment.id} data-course-roadmap-segment={segment.status}>
          <path
            d={segment.d}
            fill="none"
            className="stroke-slate-200 dark:stroke-[#202f36]"
            strokeLinecap="round"
            strokeWidth="3.8"
            filter="url(#courseRoadmapPathShadow)"
          />
          <path
            d={segment.d}
            fill="none"
            stroke={
              segment.status === "completed"
                ? "url(#courseRoadmapCompletedPath)"
                : segment.status === "active"
                  ? "url(#courseRoadmapActivePath)"
                  : undefined
            }
            className={cn(
              segment.status === "locked" &&
                "stroke-slate-300 dark:stroke-[#263840]",
            )}
            strokeDasharray={segment.status === "locked" ? "0.7 5.5" : undefined}
            strokeLinecap="round"
            strokeWidth={segment.status === "completed" ? "2.6" : "2.1"}
            opacity={segment.status === "locked" ? 0.78 : 1}
          />
        </g>
      ))}
    </svg>
  );
};
