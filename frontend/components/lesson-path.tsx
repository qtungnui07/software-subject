"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { Check, Gift, Lock, Star, Trophy, X, type LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

import { LessonStatus, LessonNode, lessonNodes } from "@/constants/lessons";
import {
  getChapterOneNodeStatus,
  type ChapterOneProgressState,
} from "@/lib/chapter-one-progress";

type RoadmapLessonStatus = LessonStatus | "available";

type RoadmapLessonNode = Omit<LessonNode, "status"> & {
  status: RoadmapLessonStatus;
};

type Props = {
  todayMinutes: number;
  progressState: ChapterOneProgressState;
  onClaimChest?: (chestId: string) => void;
};

const HEX_PATH = "polygon(50% 0%, 93% 25%, 93% 75%, 50% 100%, 7% 75%, 7% 25%)";

const statusContent: Record<RoadmapLessonStatus, {
  icon: LucideIcon;
  label: string;
  action: string;
  nodeClass: string;
  baseClass: string;
  depthClass: string;
  innerClass: string;
  auraClass: string;
  popoverClass: string;
  buttonClass: string;
}> = {
  completed: {
    icon: Check,
    label: "Đã hoàn thành",
    action: "Ôn tập lại",
    nodeClass: "bg-emerald-500 text-white",
    baseClass: "bg-emerald-600 dark:bg-emerald-800",
    depthClass: "bg-emerald-800 dark:bg-emerald-950",
    innerClass: "bg-gradient-to-br from-emerald-200 via-emerald-400 to-emerald-500 dark:from-emerald-500 dark:via-emerald-600 dark:to-emerald-700",
    auraClass: "bg-emerald-200/70 dark:bg-emerald-950/20",
    popoverClass: "border-emerald-200 dark:border-emerald-900/30",
    buttonClass: "bg-emerald-500 text-white shadow-[0_5px_0_#059669] dark:bg-emerald-600 dark:shadow-[0_5px_0_#047857]",
  },
  current: {
    icon: Star,
    label: "Bài hiện tại",
    action: "Tiếp tục học",
    nodeClass: "bg-[#0B6FAE] text-white",
    baseClass: "bg-[#106BA3] dark:bg-[#084c78]",
    depthClass: "bg-[#084c78] dark:bg-[#062f4a]",
    innerClass: "bg-gradient-to-br from-sky-200 via-[#1D9BF0] to-[#1486CC] dark:from-sky-400 dark:via-[#1486CC] dark:to-[#0B6FAE]",
    auraClass: "bg-sky-200/90 dark:bg-sky-950/20 animate-pulse",
    popoverClass: "border-sky-200 dark:border-sky-900/30",
    buttonClass: "bg-[#1486CC] text-white shadow-[0_5px_0_#0B6FAE] dark:bg-[#106BA3] dark:shadow-[0_5px_0_#084c78]",
  },
  available: {
    icon: Gift,
    label: "Rương sẵn sàng",
    action: "Nhận thưởng",
    nodeClass: "bg-amber-500 text-white",
    baseClass: "bg-amber-600 dark:bg-amber-800",
    depthClass: "bg-amber-800 dark:bg-amber-950",
    innerClass: "bg-gradient-to-br from-yellow-100 via-amber-300 to-orange-400 dark:from-amber-400 dark:via-orange-500 dark:to-orange-700",
    auraClass: "bg-amber-200/80 dark:bg-amber-950/20 animate-pulse",
    popoverClass: "border-amber-200 dark:border-amber-900/30",
    buttonClass: "bg-amber-500 text-white shadow-[0_5px_0_#d97706] dark:bg-amber-600 dark:shadow-[0_5px_0_#92400e]",
  },
  locked: {
    icon: Lock,
    label: "Đã khóa",
    action: "Hoàn thành bài trước",
    nodeClass: "bg-slate-300 text-slate-400 dark:bg-[#141f23] dark:text-slate-500",
    baseClass: "bg-slate-400 dark:bg-[#1f2d33]",
    depthClass: "bg-slate-500 dark:bg-[#0d1517]",
    innerClass: "bg-gradient-to-br from-white to-slate-200 dark:from-[#202f36] dark:to-[#1f2d33]",
    auraClass: "bg-slate-100/90 dark:bg-slate-800/10",
    popoverClass: "border-slate-200 dark:border-[#202f36]",
    buttonClass: "bg-slate-200 text-slate-500 shadow-[0_4px_0_#cbd5e1] dark:bg-[#1f2d33] dark:text-slate-400 dark:shadow-[0_4px_0_#141f23]",
  },
  reward: {
    icon: Gift,
    label: "Rương đã khóa",
    action: "Hoàn thành Bài 3",
    nodeClass: "bg-slate-300 text-slate-400 dark:bg-[#141f23] dark:text-slate-500",
    baseClass: "bg-slate-400 dark:bg-[#1f2d33]",
    depthClass: "bg-slate-500 dark:bg-[#0d1517]",
    innerClass: "bg-gradient-to-br from-white to-slate-200 dark:from-[#202f36] dark:to-[#1f2d33]",
    auraClass: "bg-slate-100/90 dark:bg-slate-800/10",
    popoverClass: "border-slate-200 dark:border-[#202f36]",
    buttonClass: "bg-slate-200 text-slate-500 shadow-[0_4px_0_#cbd5e1] dark:bg-[#1f2d33] dark:text-slate-400 dark:shadow-[0_4px_0_#141f23]",
  },
  checkpoint: {
    icon: Trophy,
    label: "Kiểm tra đã khóa",
    action: "Hoàn thành Bài 6",
    nodeClass: "bg-slate-300 text-slate-400 dark:bg-[#141f23] dark:text-slate-500",
    baseClass: "bg-slate-400 dark:bg-[#1f2d33]",
    depthClass: "bg-slate-500 dark:bg-[#0d1517]",
    innerClass: "bg-gradient-to-br from-white to-slate-200 dark:from-[#202f36] dark:to-[#1f2d33]",
    auraClass: "bg-slate-100/90 dark:bg-slate-800/10",
    popoverClass: "border-slate-200 dark:border-[#202f36]",
    buttonClass: "bg-slate-200 text-slate-500 shadow-[0_4px_0_#cbd5e1] dark:bg-[#1f2d33] dark:text-slate-400 dark:shadow-[0_4px_0_#141f23]",
  },
};

const getMilestoneLabel = (minutes: number) => {
  if (minutes >= 60) return "Chuỗi vàng";
  if (minutes >= 30) return "Chuỗi bạc";
  if (minutes >= 15) return "Chuỗi đồng";

  return "Chưa đạt chuỗi";
};

const curveBetween = (from: RoadmapLessonNode, to: RoadmapLessonNode) => {
  const middleY = from.y + (to.y - from.y) / 2;
  const pull = Math.abs(to.x - from.x) < 20 ? 78 : 26;
  const direction = to.x >= from.x ? 1 : -1;

  return `M ${from.x} ${from.y} C ${from.x + direction * pull} ${middleY}, ${to.x - direction * pull} ${middleY}, ${to.x} ${to.y}`;
};

const getRoadmapNodeStatus = (
  node: LessonNode,
  progressState: ChapterOneProgressState
): RoadmapLessonStatus => {
  const status = getChapterOneNodeStatus(node.nodeId, progressState);

  if (status === "locked") {
    if (node.type === "chest") return "reward";
    if (node.type === "checkpoint") return "checkpoint";
  }

  return status;
};

const buildRoadmapNodes = (progressState: ChapterOneProgressState): RoadmapLessonNode[] => {
  return lessonNodes.map((node) => {
    const status = getRoadmapNodeStatus(node, progressState);

    return {
      ...node,
      status,
      progress: status === "current" ? node.progress ?? 0 : undefined,
    };
  });
};

const isPathSegmentActive = (from: RoadmapLessonNode, to: RoadmapLessonNode) => {
  if (from.status !== "completed") return false;

  return to.status === "completed" || to.status === "current" || to.status === "available";
};

const LessonPopover = ({
  node,
  todayMinutes,
  onClose,
  onClaimChest,
}: {
  node: RoadmapLessonNode;
  todayMinutes: number;
  onClose: () => void;
  onClaimChest?: (chestId: string) => void;
}) => {
  const content = statusContent[node.status];
  const Icon = content.icon;
  const isLocked = node.status === "locked" || node.status === "reward" || node.status === "checkpoint";
  const isClaimableChest = node.type === "chest" && node.status === "available";
  const isClaimedChest = node.type === "chest" && node.status === "completed";
  const progress = node.progress ?? 0;
  const actionLabel = isClaimedChest ? "Đã nhận" : content.action;

  return (
    <div
      id={`lesson-node-popover-${node.id}`}
      className={cn(
        "absolute left-1/2 top-[calc(100%+18px)] z-[80] w-[280px] -translate-x-1/2 rounded-[24px] border-2 border-slate-200 dark:border-[#202f36] bg-white dark:bg-[#141f23] p-4 text-left shadow-[0_18px_40px_rgba(15,23,42,0.18)] md:top-1/2 md:-translate-y-1/2 md:translate-x-0",
        node.x > 400 ? "md:right-[calc(100%+28px)] md:left-auto" : "md:left-[calc(100%+28px)]",
        node.y > 1120 && "top-auto bottom-[calc(100%+18px)] md:top-1/2 md:bottom-auto",
        content.popoverClass
      )}
      role="dialog"
      aria-label={node.title}
      onClick={(event) => event.stopPropagation()}
    >
      <button
        type="button"
        className="absolute right-3 top-3 flex size-8 items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-400 transition hover:bg-slate-200 dark:hover:bg-slate-700 hover:text-slate-600 dark:hover:text-slate-200"
        onClick={onClose}
        aria-label="Đóng thông tin bài học"
      >
        <X className="size-4 stroke-[3]" />
      </button>

      <div className="flex items-start gap-3 pr-8">
        <div
          className={cn(
            "flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl",
            node.status === "completed" && "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-500 dark:text-emerald-400",
            node.status === "current" && "bg-sky-50 dark:bg-sky-950/30 text-[#1486CC]",
            node.status === "available" && "bg-amber-50 dark:bg-amber-950/30 text-amber-500 dark:text-amber-300",
            (node.status === "locked" || node.status === "reward" || node.status === "checkpoint") &&
              "bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500"
          )}
        >
          <Icon className="h-6 w-6 stroke-[3]" />
        </div>

        <div className="min-w-0">
          <p className="text-xs font-black uppercase tracking-[0.16em] text-slate-400 dark:text-slate-500">
            {content.label}
          </p>
          <h3 className="mt-1 text-base font-black leading-tight text-slate-800 dark:text-white">
            {node.title}
          </h3>
        </div>
      </div>

      <p className="mt-3 text-sm font-bold leading-6 text-slate-500 dark:text-slate-300">
        {node.description}
      </p>

      {node.status === "current" ? (
        <div className="mt-4 rounded-2xl bg-sky-50 dark:bg-sky-950/20 p-3">
          <div className="flex items-center justify-between text-xs font-black uppercase tracking-wide text-sky-500 dark:text-sky-400">
            <span>Tiến độ bài</span>
            <span>{progress}%</span>
          </div>
          <div className="mt-2 h-3 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
            <div className="h-full rounded-full bg-[#1486CC]" style={{ width: `${progress}%` }} />
          </div>
          <p className="mt-2 text-xs font-black text-slate-600 dark:text-slate-300">
            {todayMinutes}m hôm nay · {getMilestoneLabel(todayMinutes)}
          </p>
        </div>
      ) : null}

      {node.status === "reward" ? (
        <div className="mt-4 rounded-2xl bg-slate-50 dark:bg-slate-900/40 p-3 text-xs font-bold leading-5 text-slate-500 dark:text-slate-400">
          Rương sẽ mở sau khi bạn hoàn thành các bài học phía trước.
        </div>
      ) : null}

      {isClaimableChest ? (
        <div className="mt-4 rounded-2xl bg-amber-50 dark:bg-amber-950/20 p-3 text-xs font-bold leading-5 text-amber-700 dark:text-amber-300">
          Rương đã mở. Nhận thưởng để tiếp tục sang Bài 4.
        </div>
      ) : null}

      {isClaimedChest ? (
        <div className="mt-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/20 p-3 text-xs font-bold leading-5 text-emerald-700 dark:text-emerald-300">
          Bạn đã nhận rương này. Bài học tiếp theo đã được mở khóa.
        </div>
      ) : null}

      {isLocked && node.status !== "reward" ? (
        <div className="mt-4 rounded-2xl bg-slate-50 dark:bg-slate-900/40 p-3 text-xs font-bold leading-5 text-slate-500 dark:text-slate-400">
          Hoàn thành các node trước để mở khóa phần này.
        </div>
      ) : null}

      {isClaimableChest ? (
        <button
          type="button"
          className={cn(
            "flex items-center justify-center mt-4 h-10 w-full rounded-2xl text-sm font-black uppercase tracking-wide transition active:translate-y-1 active:shadow-none",
            content.buttonClass
          )}
          onClick={() => {
            onClaimChest?.(node.nodeId);
            onClose();
          }}
        >
          {actionLabel}
        </button>
      ) : isClaimedChest ? (
        <button
          type="button"
          disabled
          className={cn(
            "flex items-center justify-center mt-4 h-10 w-full rounded-2xl text-sm font-black uppercase tracking-wide opacity-70",
            content.buttonClass
          )}
        >
          {actionLabel}
        </button>
      ) : (
        <Link
          href={isLocked ? "#" : `/lesson/${node.nodeId}`}
          className={cn(
            "flex items-center justify-center mt-4 h-10 w-full rounded-2xl text-sm font-black uppercase tracking-wide transition active:translate-y-1 active:shadow-none",
            content.buttonClass,
            isLocked && "pointer-events-none opacity-50"
          )}
          aria-disabled={isLocked}
        >
          {actionLabel}
        </Link>
      )}
    </div>
  );
};

const LessonNodeButton = ({
  node,
  todayMinutes,
  selected,
  onSelect,
  onClose,
  onClaimChest,
}: {
  node: RoadmapLessonNode;
  todayMinutes: number;
  selected: boolean;
  onSelect: () => void;
  onClose: () => void;
  onClaimChest?: (chestId: string) => void;
}) => {
  const content = statusContent[node.status];
  const Icon = content.icon;
  const progress = node.progress ?? 0;
  const isCurrent = node.status === "current";
  const isAvailableChest = node.type === "chest" && node.status === "available";

  return (
    <div
      className={cn("absolute z-20", selected && "z-[70]")}
      style={{
        left: `${(node.x / 720) * 100}%`,
        top: node.y,
        transform: "translate(-50%, -50%)",
      }}
    >
      {/* Badge "Tiếp tục" / "Nhận thưởng" */}
      {isCurrent || isAvailableChest ? (
        <div className={cn("absolute -top-12 left-1/2 z-30 -translate-x-1/2 whitespace-nowrap rounded-2xl border-2 bg-white dark:bg-[#141f23] px-4 py-1.5 text-sm font-black uppercase tracking-wide shadow-sm", isAvailableChest ? "border-amber-200 text-amber-500 dark:border-amber-900/30 dark:text-amber-300" : "border-sky-200 text-[#1486CC] dark:border-[#202f36] dark:text-[#38bdf8]")}>
          {isAvailableChest ? "Nhận thưởng" : "Tiếp tục"}
          <span className="absolute left-1/2 top-full h-3 w-3 -translate-x-1/2 -translate-y-1/2 rotate-45 border-b-2 border-r-2 border-sky-200 dark:border-[#202f36] bg-white dark:bg-[#141f23]" />
        </div>
      ) : null}

      {/* Aura glow */}
      <div
        className={cn(
          "absolute left-1/2 top-1/2 h-[130px] w-[130px] -translate-x-1/2 -translate-y-1/2 blur-2xl transition duration-300",
          selected ? "scale-125" : "scale-100",
          content.auraClass
        )}
        style={{ clipPath: HEX_PATH }}
      />

      {/* ── Container 3D ── */}
      <div
        className="relative group mx-auto"
        style={{ width: 128, height: 136 }}
      >
        {/* P2 – Thân dưới đậm */}
        <div
          className={cn(
            "absolute left-0 top-[30px] shadow-[0_14px_18px_rgba(15,23,42,0.3)]",
            content.depthClass
          )}
          style={{
            width: 128,
            height: 104,
            clipPath: HEX_PATH,
          }}
        />

        {/* P2 – Mặt trên rộng hơn P1, lộ ra ở hai bên và cạnh trước */}
        <div
          className={cn(
            "absolute left-0 top-4 shadow-[inset_0_-14px_0_rgba(0,0,0,0.18)]",
            content.baseClass
          )}
          style={{
            width: 128,
            height: 104,
            clipPath: HEX_PATH,
          }}
        />

        {/* P1 – Mặt trên */}
        <div
          className={cn(
            "absolute left-2 top-0 transition-transform duration-100",
            "group-hover:translate-y-1"
          )}
          style={{ width: 112, height: 112 }}
        >
          {/* Progress ring (chỉ khi isCurrent) */}
          {isCurrent && (
            <div
              className="absolute inset-[-4px]"
              style={{
                clipPath: HEX_PATH,
                background: `conic-gradient(#1486CC ${progress * 3.6}deg, transparent 0deg)`,
              }}
            />
          )}

          {/* Nút chính P1 */}
          <button
            type="button"
            aria-label={`${content.label}: ${node.title}`}
            aria-expanded={selected}
            aria-controls={selected ? `lesson-node-popover-${node.id}` : undefined}
            onClick={(event) => {
              event.stopPropagation();
              onSelect();
            }}
            className="absolute inset-0"
          >
            {/* Gradient bên trong lấp đầy toàn bộ P1 (không còn viền đậm 6 cạnh) */}
            <span
              className={cn(
                "absolute inset-x-0 top-[38px] h-[62px] shadow-[inset_0_-6px_0_rgba(0,0,0,0.16)] transition-opacity duration-100 group-active:opacity-0",
                selected && "opacity-0",
                content.depthClass
              )}
              style={{ clipPath: HEX_PATH }}
            />
            <span
              className={cn(
                "absolute inset-x-0 top-0 h-[82px] shadow-[inset_0_-8px_0_rgba(0,0,0,0.12)] transition-transform duration-100 group-active:translate-y-2",
                selected && "translate-y-2",
                content.nodeClass
              )}
              style={{ clipPath: HEX_PATH }}
            />
            <span
              className={cn(
                "absolute inset-x-[9px] top-[8px] h-[62px] opacity-80 transition duration-100 group-active:translate-y-2",
                selected && "translate-y-2",
                content.innerClass
              )}
              style={{ clipPath: HEX_PATH }}
            />
            {/* Lấp lánh */}
            <span
              className={cn(
                "absolute left-[26%] top-[16%] h-4 w-7 rotate-[-20deg] rounded-full bg-white/40 blur-sm transition-transform duration-100 group-active:translate-y-2",
                selected && "translate-y-2"
              )}
            />
            <Icon
              className={cn(
                "absolute left-1/2 top-[28px] z-10 h-9 w-9 -translate-x-1/2 -translate-y-1/2 stroke-[3.8] transition-transform duration-100 group-active:translate-y-2 sm:h-11 sm:w-11",
                selected && "translate-y-2"
              )}
            />
          </button>
        </div>
      </div>

      {/* Label ngắn bên dưới nút */}
      <div className="absolute left-1/2 top-[calc(100%+10px)] hidden -translate-x-1/2 whitespace-nowrap rounded-full border-2 border-white dark:border-[#202f36] bg-white/90 dark:bg-slate-800/90 px-3 py-1 text-xs font-black text-slate-500 dark:text-slate-300 shadow-sm sm:block">
        {node.shortTitle}
      </div>

      {selected ? (
        <LessonPopover node={node} todayMinutes={todayMinutes} onClose={onClose} onClaimChest={onClaimChest} />
      ) : null}
    </div>
  );
};

export const LessonPath = ({ todayMinutes, progressState, onClaimChest }: Props) => {
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const roadmapNodes = useMemo(() => buildRoadmapNodes(progressState), [progressState]);
  const pathSegments = useMemo(
    () =>
      roadmapNodes.slice(0, -1).map((node, index) => ({
        id: `${node.id}-${roadmapNodes[index + 1].id}`,
        d: curveBetween(node, roadmapNodes[index + 1]),
        active: isPathSegmentActive(node, roadmapNodes[index + 1]),
      })),
    [roadmapNodes]
  );

  return (
    <div
      className="relative overflow-hidden rounded-[34px] border-2 border-sky-100 dark:border-[#202f36] bg-gradient-to-b from-white dark:from-[#182226] via-sky-50/30 dark:via-[#182226] to-white dark:to-[#182226] px-4 py-6 shadow-sm sm:px-6 sm:py-8"
      onClick={() => setSelectedId(null)}
    >
      <div className="pointer-events-none absolute -left-24 top-24 h-72 w-72 rounded-full bg-sky-200/20 dark:bg-sky-900/10 blur-3xl" />
      <div className="pointer-events-none absolute -right-24 top-[370px] h-80 w-80 rounded-full bg-emerald-200/16 dark:bg-emerald-950/10 blur-3xl" />
      <div className="pointer-events-none absolute left-1/2 top-[760px] h-80 w-80 -translate-x-1/2 rounded-full bg-sky-200/16 dark:bg-sky-900/10 blur-3xl" />

      <div className="relative z-10 mx-auto min-h-[1440px] max-w-[720px]">
        <svg
          className="pointer-events-none absolute left-1/2 top-0 h-[1400px] w-full -translate-x-1/2 overflow-visible"
          viewBox="0 0 720 1400"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <defs>
            <linearGradient id="robogoPathActive" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="#4ade80" />
              <stop offset="100%" stopColor="#16a34a" />
            </linearGradient>
            <filter id="pathSoftShadow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="4" stdDeviation="6" floodColor="#16a34a" floodOpacity="0.25" />
            </filter>
          </defs>

          {pathSegments.map((segment) => (
            <g key={segment.id}>
              <path
                d={segment.d}
                fill="none"
                stroke={segment.active ? "#166534" : "#111827"}
                strokeLinecap="round"
                strokeWidth="16"
                opacity={0.6}
              />
              <path
                d={segment.d}
                fill="none"
                stroke={segment.active ? "url(#robogoPathActive)" : undefined}
                className={cn(!segment.active && "stroke-[#374151] dark:stroke-[#1f2937]")}
                strokeLinecap="round"
                strokeWidth={segment.active ? 11 : 8}
                strokeDasharray={segment.active ? undefined : "14 10"}
                opacity={segment.active ? 1 : 0.55}
                filter={segment.active ? "url(#pathSoftShadow)" : undefined}
              />
            </g>
          ))}
        </svg>

        <div className="absolute left-[8%] top-[238px] z-10 hidden md:block">
          <div className="relative h-24 w-24 rounded-[28px] bg-white/90 dark:bg-slate-800/90 p-2 shadow-[0_16px_34px_rgba(15,23,42,0.13)] ring-2 ring-sky-100 dark:ring-[#202f36]">
            <Image src="/logo.webp" alt="Robogo" fill className="p-2 rounded-[20px]" sizes="96px" />
          </div>
        </div>

        {roadmapNodes.map((node) => (
          <LessonNodeButton
            key={node.id}
            node={node}
            todayMinutes={todayMinutes}
            selected={selectedId === node.id}
            onSelect={() => setSelectedId((current) => (current === node.id ? null : node.id))}
            onClose={() => setSelectedId(null)}
            onClaimChest={onClaimChest}
          />
        ))}
      </div>
    </div>
  );
};
