"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Check, Gift, Lock, Play, Star, Trophy, X } from "lucide-react";

import { cn } from "@/lib/utils";

import { LessonStatus, LessonNode, lessonNodes } from "@/constants/lessons";

type Props = {
  todayMinutes: number;
};

const statusContent = {
  completed: {
    icon: Check,
    label: "Đã hoàn thành",
    action: "Ôn tập lại",
    nodeClass:
      "border-emerald-500 bg-emerald-400 text-white shadow-[0_10px_0_#059669,0_24px_38px_rgba(16,185,129,0.22)]",
    innerClass: "bg-gradient-to-br from-emerald-200 via-emerald-400 to-emerald-500",
    auraClass: "bg-emerald-200/70",
    popoverClass: "border-emerald-200",
    buttonClass: "bg-emerald-500 text-white shadow-[0_5px_0_#059669]",
  },
  current: {
    icon: Star,
    label: "Bài hiện tại",
    action: "Tiếp tục học",
    nodeClass:
      "border-[#0B6FAE] bg-[#1486CC] text-white shadow-[0_12px_0_#0B6FAE,0_26px_44px_rgba(20,134,204,0.34)]",
    innerClass: "bg-gradient-to-br from-sky-200 via-[#1D9BF0] to-[#1486CC]",
    auraClass: "bg-sky-200/90 animate-pulse",
    popoverClass: "border-sky-200",
    buttonClass: "bg-[#1486CC] text-white shadow-[0_5px_0_#0B6FAE]",
  },
  locked: {
    icon: Lock,
    label: "Đã khóa",
    action: "Hoàn thành bài trước",
    nodeClass:
      "border-slate-300 bg-slate-200 text-slate-400 shadow-[0_9px_0_#cbd5e1]",
    innerClass: "bg-gradient-to-br from-white to-slate-200",
    auraClass: "bg-slate-100/90",
    popoverClass: "border-slate-200",
    buttonClass: "bg-slate-200 text-slate-500 shadow-[0_4px_0_#cbd5e1]",
  },
  reward: {
    icon: Gift,
    label: "Rương thưởng",
    action: "Mở sau khi hoàn thành bài",
    nodeClass:
      "border-slate-300 bg-slate-200 text-slate-400 shadow-[0_9px_0_#cbd5e1]",
    innerClass: "bg-gradient-to-br from-white to-slate-200",
    auraClass: "bg-slate-100/90",
    popoverClass: "border-slate-200",
    buttonClass: "bg-slate-200 text-slate-500 shadow-[0_4px_0_#cbd5e1]",
  },
  checkpoint: {
    icon: Trophy,
    label: "Kiểm tra chương",
    action: "Mở sau khi đủ bài",
    nodeClass:
      "border-slate-300 bg-slate-200 text-slate-400 shadow-[0_9px_0_#cbd5e1]",
    innerClass: "bg-gradient-to-br from-white to-slate-200",
    auraClass: "bg-slate-100/90",
    popoverClass: "border-slate-200",
    buttonClass: "bg-slate-200 text-slate-500 shadow-[0_4px_0_#cbd5e1]",
  },
};

const getMilestoneLabel = (minutes: number) => {
  if (minutes >= 60) return "Chuỗi vàng";
  if (minutes >= 30) return "Chuỗi bạc";
  if (minutes >= 15) return "Chuỗi đồng";

  return "Chưa đạt chuỗi";
};

const curveBetween = (from: LessonNode, to: LessonNode) => {
  const middleY = from.y + (to.y - from.y) / 2;
  const pull = Math.abs(to.x - from.x) < 20 ? 78 : 26;
  const direction = to.x >= from.x ? 1 : -1;

  return `M ${from.x} ${from.y} C ${from.x + direction * pull} ${middleY}, ${to.x - direction * pull} ${middleY}, ${to.x} ${to.y}`;
};

const pathSegments = lessonNodes.slice(0, -1).map((node, index) => ({
  id: `${node.id}-${lessonNodes[index + 1].id}`,
  d: curveBetween(node, lessonNodes[index + 1]),
  active: node.status === "completed" && lessonNodes[index + 1].status === "current",
}));

const LessonPopover = ({
  node,
  todayMinutes,
  onClose,
}: {
  node: LessonNode;
  todayMinutes: number;
  onClose: () => void;
}) => {
  const content = statusContent[node.status];
  const Icon = content.icon;
  const isLocked = node.status === "locked" || node.status === "reward" || node.status === "checkpoint";
  const progress = node.progress ?? 0;

  return (
    <div
      id={`lesson-node-popover-${node.id}`}
      className={cn(
        "absolute left-1/2 top-[calc(100%+18px)] z-[80] w-[280px] -translate-x-1/2 rounded-[24px] border-2 bg-white p-4 text-left shadow-[0_18px_40px_rgba(15,23,42,0.18)] md:top-1/2 md:-translate-y-1/2 md:translate-x-0",
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
        className="absolute right-3 top-3 flex size-8 items-center justify-center rounded-xl bg-slate-100 text-slate-400 transition hover:bg-slate-200 hover:text-slate-600"
        onClick={onClose}
        aria-label="Đóng thông tin bài học"
      >
        <X className="size-4 stroke-[3]" />
      </button>

      <div className="flex items-start gap-3 pr-8">
        <div
          className={cn(
            "flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl",
            node.status === "completed" && "bg-emerald-50 text-emerald-500",
            node.status === "current" && "bg-sky-50 text-[#1486CC]",
            (node.status === "locked" || node.status === "reward" || node.status === "checkpoint") &&
              "bg-slate-100 text-slate-400"
          )}
        >
          <Icon className="h-6 w-6 stroke-[3]" />
        </div>

        <div className="min-w-0">
          <p className="text-xs font-black uppercase tracking-[0.16em] text-slate-400">
            {content.label}
          </p>
          <h3 className="mt-1 text-base font-black leading-tight text-slate-800">
            {node.title}
          </h3>
        </div>
      </div>

      <p className="mt-3 text-sm font-bold leading-6 text-slate-500">
        {node.description}
      </p>

      {node.status === "current" ? (
        <div className="mt-4 rounded-2xl bg-sky-50 p-3">
          <div className="flex items-center justify-between text-xs font-black uppercase tracking-wide text-sky-500">
            <span>Tiến độ bài</span>
            <span>{progress}%</span>
          </div>
          <div className="mt-2 h-3 overflow-hidden rounded-full bg-slate-200">
            <div className="h-full rounded-full bg-[#1486CC]" style={{ width: `${progress}%` }} />
          </div>
          <p className="mt-2 text-xs font-black text-slate-600">
            {todayMinutes}m hôm nay · {getMilestoneLabel(todayMinutes)}
          </p>
        </div>
      ) : null}

      {node.status === "reward" ? (
        <div className="mt-4 rounded-2xl bg-slate-50 p-3 text-xs font-bold leading-5 text-slate-500">
          Rương sẽ mở sau khi bạn hoàn thành các bài học phía trước.
        </div>
      ) : null}

      {isLocked && node.status !== "reward" ? (
        <div className="mt-4 rounded-2xl bg-slate-50 p-3 text-xs font-bold leading-5 text-slate-500">
          Hoàn thành các node trước để mở khóa phần này.
        </div>
      ) : null}

      <Link
        href={isLocked ? "#" : `/lesson/${node.id}`}
        className={cn(
          "flex items-center justify-center mt-4 h-10 w-full rounded-2xl text-sm font-black uppercase tracking-wide transition active:translate-y-1 active:shadow-none",
          content.buttonClass,
          isLocked && "pointer-events-none opacity-50"
        )}
        aria-disabled={isLocked}
      >
        {content.action}
      </Link>
    </div>
  );
};

const LessonNodeButton = ({
  node,
  todayMinutes,
  selected,
  onSelect,
  onClose,
}: {
  node: LessonNode;
  todayMinutes: number;
  selected: boolean;
  onSelect: () => void;
  onClose: () => void;
}) => {
  const content = statusContent[node.status];
  const Icon = content.icon;
  const progress = node.progress ?? 0;
  const isCurrent = node.status === "current";

  return (
    <div
      className={cn("absolute z-20", selected && "z-[70]")}
      style={{
        left: `${(node.x / 720) * 100}%`,
        top: node.y,
        transform: "translate(-50%, -50%)",
      }}
    >
      {isCurrent ? (
        <div className="absolute -top-12 left-1/2 z-30 -translate-x-1/2 whitespace-nowrap rounded-2xl border-2 border-sky-200 bg-white px-4 py-1.5 text-sm font-black uppercase tracking-wide text-[#1486CC] shadow-sm">
          Tiếp tục
          <span className="absolute left-1/2 top-full h-3 w-3 -translate-x-1/2 -translate-y-1/2 rotate-45 border-b-2 border-r-2 border-sky-200 bg-white" />
        </div>
      ) : null}

      <div
        className={cn(
          "absolute left-1/2 top-1/2 h-[118px] w-[118px] -translate-x-1/2 -translate-y-1/2 rounded-full blur-xl transition duration-300",
          selected ? "scale-125" : "scale-100",
          content.auraClass
        )}
      />

      <div
        className={cn(
          "relative rounded-full p-1.5 transition duration-200",
          selected && "-translate-y-1",
          isCurrent && "p-2"
        )}
        style={
          isCurrent
            ? {
                background: `conic-gradient(#1486CC ${progress * 3.6}deg, #dbeafe 0deg)`,
              }
            : undefined
        }
      >
        <button
          type="button"
          aria-label={`${content.label}: ${node.title}`}
          aria-expanded={selected}
          aria-controls={selected ? `lesson-node-popover-${node.id}` : undefined}
          onClick={(event) => {
            event.stopPropagation();
            onSelect();
          }}
          className={cn(
            "relative flex h-[84px] w-[84px] items-center justify-center rounded-full border-4 transition duration-200 active:translate-y-1 active:shadow-none sm:h-[98px] sm:w-[98px]",
            content.nodeClass,
            selected ? "-translate-y-1" : "hover:-translate-y-1"
          )}
        >
          <span className={cn("absolute inset-2 rounded-full opacity-85", content.innerClass)} />
          <span className="absolute left-4 top-4 h-5 w-8 rotate-[-24deg] rounded-full bg-white/35 blur-sm" />
          <Icon className="relative h-9 w-9 stroke-[3.6] sm:h-11 sm:w-11" />
        </button>
      </div>

      <div className="absolute left-1/2 top-[calc(100%+14px)] hidden -translate-x-1/2 whitespace-nowrap rounded-full border-2 border-white bg-white/90 px-3 py-1 text-xs font-black text-slate-500 shadow-sm sm:block">
        {node.shortTitle}
      </div>

      {selected ? (
        <LessonPopover node={node} todayMinutes={todayMinutes} onClose={onClose} />
      ) : null}
    </div>
  );
};

export const LessonPath = ({ todayMinutes }: Props) => {
  const [selectedId, setSelectedId] = useState<number | null>(null);

  return (
    <div
      className="relative overflow-hidden rounded-[34px] border-2 border-sky-100 bg-gradient-to-b from-white via-sky-50/30 to-white px-4 py-6 shadow-sm sm:px-6 sm:py-8"
      onClick={() => setSelectedId(null)}
    >
      <div className="pointer-events-none absolute -left-24 top-24 h-72 w-72 rounded-full bg-sky-200/20 blur-3xl" />
      <div className="pointer-events-none absolute -right-24 top-[370px] h-80 w-80 rounded-full bg-emerald-200/16 blur-3xl" />
      <div className="pointer-events-none absolute left-1/2 top-[760px] h-80 w-80 -translate-x-1/2 rounded-full bg-sky-200/16 blur-3xl" />

      <div className="relative z-10 mx-auto min-h-[1440px] max-w-[720px]">
        <svg
          className="pointer-events-none absolute left-1/2 top-0 h-[1400px] w-full -translate-x-1/2 overflow-visible"
          viewBox="0 0 720 1400"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <defs>
            <linearGradient id="robogoPathActive" x1="0" x2="1" y1="0" y2="1">
              <stop offset="0%" stopColor="#7dd3fc" />
              <stop offset="100%" stopColor="#38bdf8" />
            </linearGradient>
            <filter id="pathSoftShadow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="8" stdDeviation="8" floodColor="#0ea5e9" floodOpacity="0.12" />
            </filter>
          </defs>

          {pathSegments.map((segment) => (
            <g key={segment.id}>
              <path
                d={segment.d}
                fill="none"
                stroke="#e2e8f0"
                strokeLinecap="round"
                strokeWidth="18"
                filter="url(#pathSoftShadow)"
              />
              <path
                d={segment.d}
                fill="none"
                stroke={segment.active ? "url(#robogoPathActive)" : "#c7e9fb"}
                strokeLinecap="round"
                strokeWidth="11"
                opacity={segment.active ? 1 : 0.68}
              />
            </g>
          ))}
        </svg>

        <div className="absolute left-[8%] top-[238px] z-10 hidden md:block">
          <div className="relative h-24 w-24 rounded-[28px] bg-white/90 p-2 shadow-[0_16px_34px_rgba(15,23,42,0.13)] ring-2 ring-sky-100">
            <Image src="/logo.webp" alt="Robogo" fill className="p-2" sizes="96px" />
          </div>
          <div className="mx-auto mt-2 w-fit rounded-full border-2 border-sky-100 bg-white px-3 py-1 text-xs font-black text-[#1486CC] shadow-sm">
            Bạn đang ở đây
          </div>
        </div>

        {lessonNodes.map((node) => (
          <LessonNodeButton
            key={node.id}
            node={node}
            todayMinutes={todayMinutes}
            selected={selectedId === node.id}
            onSelect={() => setSelectedId((current) => (current === node.id ? null : node.id))}
            onClose={() => setSelectedId(null)}
          />
        ))}
      </div>
    </div>
  );
};
