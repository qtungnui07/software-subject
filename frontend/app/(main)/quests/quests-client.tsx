"use client";

import Link from "next/link";
import { useState, useSyncExternalStore, type ReactNode } from "react";
import {
  ArrowRight,
  BadgeCheck,
  BookOpen,
  CalendarDays,
  Check,
  CircleDot,
  Clock,
  Flame,
  Gift,
  Lightbulb,
  Lock,
  PackageOpen,
  PartyPopper,
  RotateCcw,
  Rocket,
  ShieldCheck,
  Sparkles,
  Target,
  Trophy,
  Zap,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { type QuestSnapshotPresetName } from "@/constants/quests";
import {
  getChestProgressText,
  getChestStatusLabel,
  getChestTierLabel,
  getGameLoopMessage,
  getLongTermMilestones,
  getLongTermQuestView,
  getPerfectDayView,
  getTodayChestView,
} from "@/lib/quests/quest-gamification";
import {
  claimQuestReward,
  clearQuestStorage,
  getQuestServerSnapshot,
  getQuestStorageSnapshot,
  getQuestsPageDataFromSnapshotSync,
  subscribeToQuestStorage,
} from "@/lib/quests";
import { cn } from "@/lib/utils";
import type {
  QuestDemoState,
  QuestMetric,
  QuestsPageData,
  QuestStatus,
  ResolvedQuest,
  RobotMood,
} from "@/types/quest";

type QuestsClientProps = {
  initialData: QuestsPageData;
  demoState?: QuestDemoState;
  presetName?: QuestSnapshotPresetName;
};

type ToastState = {
  title: string;
  description: string;
  tone: "success" | "info" | "error";
};

type StatusView = {
  label: string;
  className: string;
};

const statusViewMap: Record<QuestStatus, StatusView> = {
  active: {
    label: "Chưa xong",
    className: "border-sky-200 bg-sky-50 text-[#1486CC] dark:border-sky-900/60 dark:bg-sky-950/40 dark:text-sky-300",
  },
  completed: {
    label: "Sẵn sàng nhận",
    className: "border-emerald-200 bg-emerald-50 text-emerald-600 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-300",
  },
  claimed: {
    label: "Đã nhận",
    className: "border-slate-200 bg-slate-100 text-slate-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300",
  },
  locked: {
    label: "Chưa mở",
    className: "border-slate-200 bg-slate-50 text-slate-400 dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-500",
  },
};

const robotMoodView: Record<RobotMood, { emoji: string; title: string; description: string; tone: string }> = {
  sleepy: {
    emoji: "🤖💤",
    title: "Robo đang chờ bạn khởi động",
    description: "Hoàn thành nhiệm vụ đầu tiên để đánh thức nhịp học hôm nay.",
    tone: "border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-900/50",
  },
  awake: {
    emoji: "🤖✨",
    title: "Robo đã tỉnh dậy",
    description: "Bạn đã có nhịp học tốt. Tiếp tục để mở phần thưởng lớn hơn.",
    tone: "border-sky-200 bg-sky-50 dark:border-sky-900/60 dark:bg-sky-950/40",
  },
  excited: {
    emoji: "🚀🤖",
    title: "Robo đang rất hào hứng",
    description: "Chỉ còn 1 nhiệm vụ nữa để mở Ngày hoàn hảo.",
    tone: "border-[#bfe3fb] bg-[#f1f9ff] dark:border-[#234455] dark:bg-[#132a38]",
  },
  celebrating: {
    emoji: "🎉🤖",
    title: "Ngày hoàn hảo đã mở",
    description: "Bạn đã hoàn thành toàn bộ nhiệm vụ hôm nay. Rất đáng giữ chuỗi này.",
    tone: "border-emerald-200 bg-emerald-50 dark:border-emerald-900/60 dark:bg-emerald-950/40",
  },
};

const SHOW_QUEST_DEMO_CONTROLS =
  process.env.NEXT_PUBLIC_SHOW_QUEST_DEBUG === "true";

const metricLabelMap: Record<QuestMetric, string> = {
  lesson_completed: "bài học",
  accuracy_reached: "độ chính xác",
  minutes_learned: "phút học",
  xp_earned: "XP",
  daily_quests_completed: "nhiệm vụ",
  streak_kept: "ngày streak",
};

const getQuestProgressText = (quest: ResolvedQuest) => {
  if (quest.metric === "accuracy_reached") {
    return `${quest.progress}% / ${quest.target}%`;
  }

  if (quest.metric === "minutes_learned") {
    return `${quest.progress}/${quest.target} phút`;
  }

  if (quest.metric === "xp_earned") {
    return `${quest.progress}/${quest.target} XP`;
  }

  if (quest.metric === "streak_kept") {
    return `${quest.progress}/${quest.target} ngày`;
  }

  return `${quest.progress}/${quest.target} ${metricLabelMap[quest.metric]}`;
};

const getQuestActionLabel = (quest: ResolvedQuest) => {
  if (quest.status === "claimed") return "Đã nhận";
  if (quest.status === "locked") return "Chưa mở";
  if (quest.status === "completed") return "Nhận thưởng";

  return "Bắt đầu học";
};

const getQuestStateText = (quest: ResolvedQuest) => {
  if (quest.status === "claimed") return "Phần thưởng đã được ghi nhận cho hôm nay.";
  if (quest.status === "completed") return "Đã xong, bạn có thể nhận thưởng.";
  if (quest.status === "locked") return "Hoàn thành điều kiện trước để mở.";

  const remaining = Math.max(quest.target - quest.progress, 0);

  if (quest.metric === "accuracy_reached") {
    return `Cần đạt ${quest.target}% chính xác trong một bài học.`;
  }

  if (quest.metric === "minutes_learned") {
    return `Cần học thêm ${remaining} phút để hoàn thành.`;
  }

  if (quest.metric === "lesson_completed") {
    return `Cần hoàn thành ${remaining} bài học.`;
  }

  if (quest.metric === "xp_earned") {
    return `Cần kiếm thêm ${remaining} XP.`;
  }

  if (quest.metric === "streak_kept") {
    return `Cần giữ thêm ${remaining} ngày chuỗi học.`;
  }

  return `Còn ${remaining} ${metricLabelMap[quest.metric]} để hoàn thành.`;
};

const getHeroActionText = (completed: number, total: number) => {
  if (completed <= 0) return "Bắt đầu học";
  if (completed >= total) return "Xem rương thưởng";

  return "Học tiếp";
};

const CardShell = ({ children, className }: { children: ReactNode; className?: string }) => {
  return (
    <section
      className={cn(
        "rounded-[24px] border-2 border-[#d8ecfb] bg-white/95 p-3.5 shadow-[0_16px_36px_rgba(20,134,204,0.08)] transition-all duration-300 dark:border-[#28414d] dark:bg-[#182226]/95 dark:shadow-none sm:rounded-[28px] sm:p-5",
        className,
      )}
    >
      {children}
    </section>
  );
};

const SurfacePill = ({ children, className }: { children: ReactNode; className?: string }) => {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-black uppercase tracking-[0.16em]",
        className,
      )}
    >
      {children}
    </span>
  );
};

const SectionHeader = ({
  eyebrow,
  title,
  description,
  rightSlot,
}: {
  eyebrow: string;
  title: string;
  description?: string;
  rightSlot?: ReactNode;
}) => {
  return (
    <div className="mb-4 flex flex-col gap-3 sm:mb-5 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <p className="text-xs font-black uppercase tracking-[0.22em] text-[#1486CC] dark:text-sky-300">
          {eyebrow}
        </p>
        <h2 className="mt-1 text-xl font-black tracking-tight text-slate-900 dark:text-slate-50 sm:text-2xl">
          {title}
        </h2>
        {description ? (
          <p className="mt-2 max-w-2xl text-sm font-semibold leading-6 text-slate-500 dark:text-slate-400">
            {description}
          </p>
        ) : null}
      </div>
      {rightSlot}
    </div>
  );
};

const ProgressBar = ({ value, className }: { value: number; className?: string }) => {
  return (
    <div className={cn("h-3 overflow-hidden rounded-full bg-[#edf7ff] ring-1 ring-sky-100/70 dark:bg-[#0d171b] dark:ring-[#2a4654]", className)}>
      <div
        className="quest-progress-fill h-full origin-left rounded-full bg-gradient-to-r from-[#1486CC] via-[#31B6FF] to-emerald-300 shadow-[0_4px_14px_rgba(20,134,204,0.28)] transition-all duration-700"
        style={{ width: `${value}%` }}
      />
    </div>
  );
};

const QuestPolishStyles = () => {
  return (
    <style>
      {`
        @keyframes quest-progress-fill {
          from { transform: scaleX(0); filter: saturate(0.9); }
          to { transform: scaleX(1); filter: saturate(1); }
        }

        @keyframes quest-card-enter {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes quest-soft-glow {
          0%, 100% { box-shadow: 0 18px 42px rgba(16, 185, 129, 0.10); }
          50% { box-shadow: 0 20px 52px rgba(16, 185, 129, 0.22); }
        }

        @keyframes quest-chest-ready {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          35% { transform: translateY(-2px) rotate(-2deg); }
          70% { transform: translateY(0) rotate(2deg); }
        }

        @keyframes quest-robot-idle {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-6px); }
        }

        @keyframes quest-toast-pop {
          from { opacity: 0; transform: translateY(8px) scale(0.98); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }

        .quest-progress-fill {
          animation: quest-progress-fill 850ms cubic-bezier(0.22, 1, 0.36, 1) both;
        }

        .quest-card-enter {
          animation: quest-card-enter 420ms ease-out both;
        }

        .quest-completed-glow {
          animation: quest-soft-glow 2.8s ease-in-out infinite;
        }

        .quest-chest-ready {
          animation: quest-chest-ready 2.4s ease-in-out infinite;
        }

        .quest-robot-idle {
          animation: quest-robot-idle 3.2s ease-in-out infinite;
        }

        .quest-toast-pop {
          animation: quest-toast-pop 220ms ease-out both;
        }


        .quest-mobile-readable {
          text-wrap: balance;
        }

        @media (max-width: 640px) {
          .quest-card-enter {
            scroll-margin-top: 16px;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .quest-progress-fill,
          .quest-card-enter,
          .quest-completed-glow,
          .quest-chest-ready,
          .quest-robot-idle,
          .quest-toast-pop {
            animation: none;
          }
        }
      `}
    </style>
  );
};

const StatusIcon = ({ status, className }: { status: QuestStatus; className?: string }) => {
  if (status === "completed") return <BadgeCheck className={className} strokeWidth={3} />;
  if (status === "claimed") return <Check className={className} strokeWidth={3} />;
  if (status === "locked") return <Lock className={className} strokeWidth={3} />;

  return <CircleDot className={className} strokeWidth={3} />;
};

const StatusBadge = ({ status }: { status: QuestStatus }) => {
  const view = statusViewMap[status];

  return (
    <span
      className={cn(
        "inline-flex max-w-full shrink-0 items-center justify-center gap-1.5 whitespace-nowrap rounded-full border px-3 py-1 text-[11px] font-black uppercase tracking-wide",
        view.className,
      )}
    >
      <StatusIcon status={status} className="size-3.5" />
      {view.label}
    </span>
  );
};

const QuestIcon = ({
  icon,
  className,
  strokeWidth = 2.6,
}: {
  icon: string;
  className?: string;
  strokeWidth?: number;
}) => {
  const iconProps = { className, strokeWidth };

  switch (icon) {
    case "book-open":
      return <BookOpen {...iconProps} />;
    case "target":
      return <Target {...iconProps} />;
    case "clock":
      return <Clock {...iconProps} />;
    case "sparkles":
      return <Sparkles {...iconProps} />;
    case "rocket":
      return <Rocket {...iconProps} />;
    case "trophy":
      return <Trophy {...iconProps} />;
    default:
      return <CircleDot {...iconProps} />;
  }
};

const RewardTypeIcon = ({
  type,
  className,
  strokeWidth = 3,
}: {
  type: ResolvedQuest["reward"]["type"];
  className?: string;
  strokeWidth?: number;
}) => {
  const iconProps = { className, strokeWidth };

  switch (type) {
    case "chest":
      return <PackageOpen {...iconProps} />;
    case "badge":
      return <Trophy {...iconProps} />;
    default:
      return <Zap {...iconProps} />;
  }
};

const QuestAction = ({ quest, onClaim }: { quest: ResolvedQuest; onClaim?: (quest: ResolvedQuest) => void }) => {
  if (quest.status === "active") {
    return (
      <Button asChild type="button" variant="primary-outline" className="h-10 w-full justify-center rounded-2xl px-5 font-black sm:h-11 sm:w-auto">
        <Link href="/learn">
          {getQuestActionLabel(quest)}
          <ArrowRight className="ml-2 size-4" strokeWidth={3} />
        </Link>
      </Button>
    );
  }

  if (quest.status === "completed") {
    return (
      <Button
        type="button"
        variant="secondary"
        className="h-10 w-full justify-center rounded-2xl border-emerald-600 bg-emerald-500 px-5 font-black text-white shadow-[0_12px_24px_rgba(16,185,129,0.18)] hover:bg-emerald-500/90 sm:h-11 sm:w-auto"
        onClick={() => onClaim?.(quest)}
      >
        {getQuestActionLabel(quest)}
      </Button>
    );
  }

  return (
    <Button type="button" variant="primary-outline" className="h-10 w-full justify-center rounded-2xl px-5 font-black sm:h-11 sm:w-auto" disabled>
      {getQuestActionLabel(quest)}
    </Button>
  );
};

const QuestCard = ({
  quest,
  compact = false,
  delayIndex = 0,
  onClaim,
}: {
  quest: ResolvedQuest;
  compact?: boolean;
  delayIndex?: number;
  onClaim?: (quest: ResolvedQuest) => void;
}) => {
  const isCompleted = quest.status === "completed" || quest.status === "claimed";
  const isActive = quest.status === "active";
  const isClaimed = quest.status === "claimed";

  return (
    <article
      className={cn(
        "quest-card-enter group relative overflow-hidden rounded-[22px] border-2 bg-white p-3.5 ring-1 ring-white/80 transition-all duration-300 dark:bg-[#141f23] dark:ring-white/5 sm:rounded-[24px] sm:p-5",
        isCompleted
          ? "border-emerald-200 shadow-[0_12px_28px_rgba(16,185,129,0.1)] dark:border-emerald-900/60"
          : "border-slate-200 shadow-[0_10px_22px_rgba(15,23,42,0.04)] dark:border-[#243841]",
        quest.status === "completed" ? "quest-completed-glow" : null,
        isActive ? "hover:-translate-y-0.5 hover:border-[#9fd8fb] hover:shadow-[0_16px_30px_rgba(20,134,204,0.12)]" : null,
        isClaimed ? "bg-slate-50/80 opacity-90 dark:bg-[#111a1e]" : null,
        compact ? "space-y-3.5 sm:space-y-4" : "space-y-3.5 sm:space-y-4",
      )}
      style={{ animationDelay: `${delayIndex * 70}ms` }}
    >
      <div
        className={cn(
          "pointer-events-none absolute inset-x-0 top-0 h-1",
          isCompleted ? "bg-emerald-400" : "bg-[#1486CC]",
        )}
      />

      <div className="flex gap-3 sm:gap-4">
        <div
          className={cn(
            "flex size-12 shrink-0 items-center justify-center rounded-[18px] border-2 transition-colors sm:size-14 sm:rounded-[20px]",
            isCompleted
              ? "border-emerald-200 bg-emerald-50 text-emerald-500 dark:border-emerald-900/60 dark:bg-emerald-950/30 dark:text-emerald-300"
              : "border-[#d8ecfb] bg-[#e8f5ff] text-[#1486CC] dark:border-[#234455] dark:bg-[#1c3547] dark:text-sky-300",
          )}
        >
          <QuestIcon icon={quest.icon} className="size-5.5 sm:size-7" strokeWidth={2.6} />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-col gap-2.5 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h3 className="quest-mobile-readable text-[15px] font-black leading-tight text-slate-900 dark:text-slate-50 sm:text-lg">
                {quest.title}
              </h3>
              <p className="mt-1 text-sm font-semibold leading-5 text-slate-500 dark:text-slate-400">
                {quest.description}
              </p>
            </div>
            <StatusBadge status={quest.status} />
          </div>

          <p className="mt-3 rounded-2xl bg-slate-50 px-3 py-2 text-[11px] font-bold uppercase tracking-[0.11em] text-slate-400 dark:bg-[#0d171b]/80 dark:text-slate-400">
            {getQuestStateText(quest)}
          </p>

          {quest.isPreview ? (
            <span className="mt-3 inline-flex rounded-full bg-amber-50 px-3 py-1 text-[11px] font-black uppercase tracking-[0.16em] text-amber-600 dark:bg-amber-950/30 dark:text-amber-300">
              Bản xem trước
            </span>
          ) : null}
        </div>
      </div>

      <div className="space-y-2.5">
        <div className="flex items-center justify-between gap-3 text-sm font-black text-slate-600 dark:text-slate-300">
          <span>{getQuestProgressText(quest)}</span>
          <span>{quest.progressPercent}%</span>
        </div>
        <ProgressBar value={quest.progressPercent} className={compact ? "h-2.5" : "h-3.5"} />
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="inline-flex items-center justify-center gap-2 rounded-2xl border-2 border-[#d8ecfb] bg-[#f6fbff] px-3 py-2 text-sm font-black text-[#1486CC] shadow-[0_8px_18px_rgba(20,134,204,0.08)] dark:border-[#2a4654] dark:bg-[#0d171b] dark:text-sky-300">
          <RewardTypeIcon type={quest.reward.type} className="size-4" strokeWidth={3} />
          {quest.reward.label}
        </div>

        <QuestAction quest={quest} onClaim={onClaim} />
      </div>
    </article>
  );
};

const HeroStat = ({ label, value, icon }: { label: string; value: string; icon: ReactNode }) => {
  return (
    <div className="rounded-[18px] border-2 border-white/80 bg-white/80 px-3.5 py-3 shadow-[0_8px_20px_rgba(20,134,204,0.07)] backdrop-blur dark:border-[#2a4654] dark:bg-[#141f23]/80 dark:shadow-none sm:rounded-[20px] sm:px-4">
      <div className="flex items-center gap-2 text-[#1486CC] dark:text-sky-300">{icon}</div>
      <p className="mt-2 text-[11px] font-black uppercase tracking-[0.18em] text-slate-400">
        {label}
      </p>
      <p className="mt-1 text-lg font-black text-slate-900 dark:text-slate-50">
        {value}
      </p>
    </div>
  );
};

const DailyCompletionDots = ({ completed, total }: { completed: number; total: number }) => {
  return (
    <div className="flex items-center gap-2">
      {Array.from({ length: total }, (_, index) => {
        const isDone = index < completed;

        return (
          <span
            key={`daily-dot-${index}`}
            className={cn(
              "flex size-8 items-center justify-center rounded-full border-2 text-xs font-black",
              isDone
                ? "border-emerald-200 bg-emerald-50 text-emerald-500 dark:border-emerald-900/60 dark:bg-emerald-950/30 dark:text-emerald-300"
                : "border-slate-200 bg-white text-slate-300 dark:border-[#20313a] dark:bg-[#10191d] dark:text-slate-600",
            )}
          >
            {isDone ? <Check className="size-4" strokeWidth={3} /> : index + 1}
          </span>
        );
      })}
    </div>
  );
};

const QuestsHero = ({
  data,
  onResetDemo,
  presetName,
}: {
  data: QuestsPageData;
  onResetDemo: () => void;
  presetName: QuestSnapshotPresetName;
}) => {
  const remaining = Math.max(data.summary.dailyTotal - data.summary.dailyCompleted, 0);
  const mood = robotMoodView[data.summary.robotMood];
  const gameMessage = getGameLoopMessage(data);

  return (
    <section className="relative overflow-hidden rounded-[28px] border-2 border-[#cde8fb] bg-gradient-to-br from-[#e4f5ff] via-white to-[#f7fcff] p-3.5 shadow-[0_20px_48px_rgba(20,134,204,0.12)] dark:border-[#2a5365] dark:from-[#102838] dark:via-[#182226] dark:to-[#10191d] dark:shadow-none sm:rounded-[32px] sm:p-6">
      <div className="pointer-events-none absolute -right-20 -top-24 size-72 rounded-full bg-[#31B6FF]/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 left-12 size-64 rounded-full bg-emerald-300/20 blur-3xl" />

      <div className="relative grid gap-4 lg:grid-cols-[minmax(0,1fr)_270px] lg:items-center">
        <div className="max-w-3xl">
          <SurfacePill className="border-[#bfe3fb] bg-white/70 text-[#1486CC] dark:border-[#234455] dark:bg-[#10191d]/70 dark:text-sky-300">
            <ShieldCheck className="size-4" strokeWidth={3} />
            Trung tâm nhiệm vụ
          </SurfacePill>

          <h1 className="quest-mobile-readable mt-3 text-[28px] font-black tracking-tight text-slate-950 dark:text-white sm:text-4xl">
            Nhiệm vụ hôm nay
          </h1>
          <p className="quest-mobile-readable mt-3 max-w-2xl text-sm font-bold leading-6 text-slate-600 dark:text-slate-300 sm:text-base">
            {remaining > 0
              ? `Hoàn thành ${data.summary.dailyTotal} nhiệm vụ để mở Ngày hoàn hảo và rương thưởng hôm nay.`
              : "Bạn đã mở Ngày hoàn hảo. Quay lại ngày mai để tiếp tục giữ nhịp học."}
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            <p className="inline-flex rounded-full bg-white/70 px-3 py-1.5 text-sm font-black text-[#1486CC] shadow-[0_8px_20px_rgba(20,134,204,0.08)] dark:bg-[#10191d]/70 dark:text-sky-300">
              {gameMessage}
            </p>

          </div>

          <div className="mt-4 flex flex-col gap-3 rounded-[22px] border-2 border-white/80 bg-white/70 p-3.5 backdrop-blur dark:border-[#2a4654] dark:bg-[#10191d]/60 sm:mt-5 sm:flex-row sm:items-center sm:justify-between sm:rounded-[24px] sm:p-4">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">Tiến độ hôm nay</p>
              <div className="mt-2 flex items-center gap-3">
                <DailyCompletionDots completed={data.summary.dailyCompleted} total={data.summary.dailyTotal} />
                <span className="text-sm font-black text-slate-700 dark:text-slate-200">
                  {data.summary.dailyCompleted}/{data.summary.dailyTotal} hoàn thành
                </span>
              </div>
            </div>
            <Button asChild type="button" variant="primary-outline" className="h-11 rounded-2xl px-5 font-black sm:h-12">
              <Link href="/learn">
                {getHeroActionText(data.summary.dailyCompleted, data.summary.dailyTotal)}
                <ArrowRight className="ml-2 size-4" strokeWidth={3} />
              </Link>
            </Button>
          </div>

          <div className="mt-3 grid gap-2.5 sm:mt-4 sm:grid-cols-3 sm:gap-3">
            <HeroStat label="Tiến độ" value={`${data.summary.dailyCompleted}/${data.summary.dailyTotal}`} icon={<Target className="size-4" strokeWidth={3} />} />
            <HeroStat label="XP hôm nay" value={`${data.summary.todayXp} XP`} icon={<Zap className="size-4" strokeWidth={3} />} />
            <HeroStat label="Làm mới lúc" value={data.resetTimeLabel} icon={<Clock className="size-4" strokeWidth={3} />} />
          </div>
          {SHOW_QUEST_DEMO_CONTROLS ? (

          <details className="mt-4 rounded-2xl border border-white/80 bg-white/45 px-3 py-2 text-xs font-black uppercase tracking-[0.12em] text-slate-500 backdrop-blur dark:border-[#20313a] dark:bg-[#10191d]/40">
            <summary className="cursor-pointer select-none text-[#1486CC] dark:text-sky-300">Chế độ test</summary>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <button type="button" className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white/80 px-3 py-1.5 text-slate-500 transition-colors hover:text-[#1486CC] dark:border-[#20313a] dark:bg-[#10191d]/70" onClick={onResetDemo}>
                <RotateCcw className="size-3.5" strokeWidth={3} />
                Xóa trạng thái thử
              </button>
              <Link className="rounded-full border border-slate-200 bg-white/80 px-3 py-1.5 text-slate-500 transition-colors hover:text-[#1486CC] dark:border-[#20313a] dark:bg-[#10191d]/70" href="/quests?state=loading">
                Đang tải
              </Link>
              <Link className="rounded-full border border-slate-200 bg-white/80 px-3 py-1.5 text-slate-500 transition-colors hover:text-[#1486CC] dark:border-[#20313a] dark:bg-[#10191d]/70" href="/quests?state=empty">
                Trống
              </Link>
              <Link className="rounded-full border border-slate-200 bg-white/80 px-3 py-1.5 text-slate-500 transition-colors hover:text-[#1486CC] dark:border-[#20313a] dark:bg-[#10191d]/70" href="/quests?state=error">
                Lỗi
              </Link>
              <span className="hidden text-slate-300 sm:inline">|</span>
              {(["empty", "oneQuestDone", "almostPerfect", "perfectDay"] as const).map((preset) => (
                <Link
                  key={preset}
                  className={cn(
                    "rounded-full border border-slate-200 bg-white/80 px-3 py-1.5 text-slate-500 transition-colors hover:text-[#1486CC] dark:border-[#20313a] dark:bg-[#10191d]/70",
                    presetName === preset ? "border-[#1486CC] text-[#1486CC] dark:border-sky-400 dark:text-sky-300" : null,
                  )}
                  href={`/quests?preset=${preset}`}
                >
                  {preset === "empty" ? "0/3" : preset === "oneQuestDone" ? "1/3" : preset === "almostPerfect" ? "2/3" : "3/3"}
                </Link>
              ))}
            </div>
          </details>
          ) : null}
        </div>

        <div className={cn("rounded-[28px] border-2 p-4 text-center shadow-[0_16px_34px_rgba(20,134,204,0.11)] transition-transform duration-300 hover:-translate-y-1 dark:shadow-none", mood.tone)}>
          <div className="quest-robot-idle mx-auto flex size-20 items-center justify-center rounded-[24px] bg-white text-5xl shadow-[0_12px_26px_rgba(20,134,204,0.12)] dark:bg-[#10191d] sm:size-22">
            {mood.emoji}
          </div>
          <h2 className="mt-3 text-lg font-black text-slate-900 dark:text-white">
            {mood.title}
          </h2>
          <p className="mt-2 text-sm font-semibold leading-6 text-slate-500 dark:text-slate-400">
            {mood.description}
          </p>
        </div>
      </div>
    </section>
  );
};

const PerfectDayStep = ({ index, active }: { index: number; active: boolean }) => {
  return (
    <div
      className={cn(
        "flex flex-1 items-center gap-2 rounded-2xl border-2 px-3 py-2 text-xs font-black uppercase tracking-[0.12em]",
        active
          ? "border-indigo-200 bg-white text-indigo-600 shadow-[0_10px_24px_rgba(99,102,241,0.12)] dark:border-indigo-900/60 dark:bg-[#10191d] dark:text-indigo-300"
          : "border-white/70 bg-white/40 text-slate-300 dark:border-[#20313a] dark:bg-[#10191d]/50 dark:text-slate-600",
      )}
    >
      <span
        className={cn(
          "flex size-7 items-center justify-center rounded-full",
          active ? "bg-indigo-50 text-indigo-500 dark:bg-indigo-950/40 dark:text-indigo-300" : "bg-slate-100 dark:bg-[#182226]",
        )}
      >
        {active ? <Check className="size-4" strokeWidth={3} /> : index}
      </span>
      Bước {index}
    </div>
  );
};

const PerfectDayCard = ({ quest, data }: { quest?: ResolvedQuest; data: QuestsPageData }) => {
  if (!quest) return null;

  const view = getPerfectDayView(data);
  const chestView = getTodayChestView(data);
  const isUnlocked = view.stage === "unlocked";

  return (
    <section className={cn("relative overflow-hidden rounded-[32px] border-2 border-indigo-100 bg-gradient-to-br from-indigo-50 via-white to-[#f4fbff] p-5 shadow-[0_18px_42px_rgba(99,102,241,0.12)] transition-all duration-300 dark:border-indigo-900/50 dark:from-indigo-950/30 dark:via-[#182226] dark:to-[#10191d] dark:shadow-none sm:p-6", isUnlocked ? "ring-2 ring-emerald-200/80 dark:ring-emerald-900/50" : null)}>
      <div className="pointer-events-none absolute -right-16 -top-20 size-52 rounded-full bg-indigo-300/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 left-16 size-64 rounded-full bg-[#31B6FF]/15 blur-3xl" />

      <div className="relative space-y-5">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex gap-3 sm:gap-4">
            <div className="flex size-16 shrink-0 items-center justify-center rounded-[22px] border-2 border-indigo-100 bg-white text-indigo-500 shadow-[0_12px_24px_rgba(99,102,241,0.12)] dark:border-indigo-900/60 dark:bg-[#10191d] dark:text-indigo-300">
              <Sparkles className="size-8" strokeWidth={2.6} />
            </div>
            <div>
              <p className="text-xs font-black uppercase tracking-[0.22em] text-indigo-500 dark:text-indigo-300">
                Thưởng Ngày hoàn hảo
              </p>
              <h2 className="mt-1 text-2xl font-black text-slate-900 dark:text-white">
                {view.title}
              </h2>
              <p className="mt-2 max-w-2xl text-sm font-semibold leading-6 text-slate-500 dark:text-slate-400">
                {view.subtitle}
              </p>
              <p className="mt-3 inline-flex rounded-full bg-white/70 px-3 py-1.5 text-xs font-black uppercase tracking-[0.14em] text-indigo-500 shadow-[0_8px_18px_rgba(99,102,241,0.08)] dark:bg-[#10191d]/70 dark:text-indigo-300">
                {view.robotLine}
              </p>
            </div>
          </div>

          <div className="min-w-[230px] rounded-[24px] border-2 border-white bg-white/85 p-4 shadow-[0_12px_26px_rgba(99,102,241,0.1)] dark:border-[#20313a] dark:bg-[#10191d]/80 dark:shadow-none">
            <div className="flex items-center justify-between text-sm font-black text-slate-600 dark:text-slate-300">
              <span>{data.summary.dailyCompleted}/{data.summary.dailyTotal}</span>
              <span>{quest.progressPercent}%</span>
            </div>
            <div className="mt-3">
              <ProgressBar value={quest.progressPercent} className="h-3.5" />
            </div>
            <div className="mt-3 flex items-center justify-between gap-2 text-xs font-black uppercase tracking-[0.14em] text-indigo-500 dark:text-indigo-300">
              <span>{view.statusLabel}</span>
              <span>{view.chestLabel}</span>
            </div>
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-3">
          {Array.from({ length: data.summary.dailyTotal }, (_, index) => (
            <PerfectDayStep key={`perfect-step-${index}`} index={index + 1} active={index < data.summary.dailyCompleted} />
          ))}
        </div>

        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_260px]">
          <div className="rounded-[24px] border-2 border-white/80 bg-white/65 p-4 dark:border-[#20313a] dark:bg-[#10191d]/50">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-400">Phần thưởng</p>
            <div className="mt-3 flex flex-wrap items-center gap-3">
              <SurfacePill className="border-indigo-100 bg-indigo-50 text-indigo-500 dark:border-indigo-900/60 dark:bg-indigo-950/30 dark:text-indigo-300">
                <PartyPopper className="size-4" strokeWidth={3} />
                {quest.reward.label}
              </SurfacePill>
              <SurfacePill className="border-amber-100 bg-amber-50 text-amber-500 dark:border-amber-900/60 dark:bg-amber-950/30 dark:text-amber-300">
                <Gift className="size-4" strokeWidth={3} />
                {getChestTierLabel(chestView.tier)}
              </SurfacePill>
            </div>
          </div>

          <div className={cn("rounded-[24px] border-2 border-amber-100 bg-amber-50/70 p-4 text-amber-600 transition-all duration-300 dark:border-amber-900/60 dark:bg-amber-950/20 dark:text-amber-300", chestView.status === "available" ? "quest-chest-ready shadow-[0_12px_30px_rgba(245,158,11,0.18)]" : null)}>
            <p className="text-xs font-black uppercase tracking-[0.18em]">Trạng thái rương</p>
            <p className="mt-2 text-lg font-black text-slate-900 dark:text-white">{getChestStatusLabel(chestView.status)}</p>
            <p className="mt-1 text-sm font-semibold leading-5 text-amber-700/80 dark:text-amber-200/80">{getChestProgressText(data)}</p>
          </div>
        </div>
      </div>
    </section>
  );
};

const QuestSidebar = ({ data, className }: { data: QuestsPageData; className?: string }) => {
  return (
    <aside className={cn("space-y-3.5 sm:space-y-4", className)}>
      <SummaryCard data={data} />
      <RewardChestCard data={data} />
      <WeekActivityCard data={data} />
      <TipCard />
    </aside>
  );
};

const QuestMobileOverview = ({ data }: { data: QuestsPageData }) => {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:hidden">
      <SummaryCard data={data} />
      <RewardChestCard data={data} />
    </div>
  );
};

const SummaryCard = ({ data }: { data: QuestsPageData }) => {
  const chestView = getTodayChestView(data);
  const loopMessage = getGameLoopMessage(data);

  return (
    <CardShell className="p-4">
      <div className="flex items-center gap-3">
        <div className="flex size-12 items-center justify-center rounded-2xl bg-[#e8f5ff] text-[#1486CC] dark:bg-[#1c3547] dark:text-sky-300">
          <Flame className="size-6" strokeWidth={2.8} />
        </div>
        <div>
          <h2 className="text-lg font-black text-slate-900 dark:text-white">Tiến độ hôm nay</h2>
          <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Hoàn thành từng nhiệm vụ để mở rương hôm nay</p>
        </div>
      </div>

      <div className="mt-4 rounded-[24px] border-2 border-[#d8ecfb] bg-[#f6fbff] p-4 shadow-inner shadow-sky-100/60 dark:border-[#20313a] dark:bg-[#10191d] dark:shadow-none">
        <div className="flex items-center justify-between text-sm font-black text-slate-700 dark:text-slate-200">
          <span>Nhiệm vụ hôm nay</span>
          <span>{data.summary.dailyCompleted}/{data.summary.dailyTotal}</span>
        </div>
        <ProgressBar value={Math.round((data.summary.dailyCompleted / data.summary.dailyTotal) * 100)} className="mt-3 h-3" />
        <p className="mt-3 text-sm font-semibold leading-5 text-slate-500 dark:text-slate-400">{loopMessage}</p>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2.5">
        <MiniStat label="XP hôm nay" value={`${data.summary.todayXp}`} />
        <MiniStat label="Chuỗi" value={`${data.summary.currentStreak} ngày`} />
        <MiniStat label="Nhiệm vụ" value={`${data.summary.dailyCompleted}/${data.summary.dailyTotal}`} />
        <MiniStat label="Rương" value={getChestStatusLabel(chestView.status)} />
      </div>
    </CardShell>
  );
};

const MiniStat = ({ label, value }: { label: string; value: string }) => {
  return (
    <div className="rounded-2xl border-2 border-slate-100 bg-slate-50/90 p-3 transition-colors hover:border-[#d8ecfb] hover:bg-white dark:border-[#2a4654] dark:bg-[#0d171b] dark:hover:bg-[#141f23]">
      <p className="text-[11px] font-black uppercase tracking-[0.18em] text-slate-400">{label}</p>
      <p className="mt-1 text-base font-black text-slate-900 dark:text-slate-50">{value}</p>
    </div>
  );
};

const RewardChestCard = ({ data }: { data: QuestsPageData }) => {
  const chestView = getTodayChestView(data);
  const statusLabel = getChestStatusLabel(chestView.status);
  const toneClass =
    chestView.tone === "gold"
      ? "border-amber-200 bg-amber-50 text-amber-500 dark:border-amber-900/60 dark:bg-amber-950/30 dark:text-amber-300"
      : chestView.tone === "silver"
        ? "border-slate-200 bg-slate-50 text-slate-500 dark:border-slate-700 dark:bg-slate-800/60 dark:text-slate-300"
        : "border-[#d8ecfb] bg-[#e8f5ff] text-[#1486CC] dark:border-[#234455] dark:bg-[#1c3547] dark:text-sky-300";

  return (
    <CardShell className={cn("p-4", chestView.status === "available" ? "border-amber-200 shadow-[0_18px_44px_rgba(245,158,11,0.14)] dark:border-amber-900/60" : null)}>
      <div className="flex items-start gap-4">
        <div className={cn("flex size-14 shrink-0 items-center justify-center rounded-2xl border-2 transition-transform duration-300", toneClass, chestView.status === "available" ? "quest-chest-ready" : null)}>
          <Gift className="size-7" strokeWidth={2.8} />
        </div>
        <div>
          <p className="text-xs font-black uppercase tracking-[0.18em] text-amber-500 dark:text-amber-300">
            {chestView.label}
          </p>
          <h2 className="mt-1 text-lg font-black text-slate-900 dark:text-white">{chestView.title}</h2>
          <p className="mt-1 text-sm font-semibold leading-6 text-slate-500 dark:text-slate-400">
            {chestView.description}
          </p>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2.5">
        <MiniStat label="Bậc rương" value={getChestTierLabel(chestView.tier)} />
        <MiniStat label="Trạng thái" value={statusLabel} />
      </div>
    </CardShell>
  );
};

const WeekActivityCard = ({ data }: { data: QuestsPageData }) => {
  return (
    <CardShell className="p-4">
      <div className="mb-4 flex items-center gap-3">
        <div className="flex size-11 items-center justify-center rounded-2xl bg-[#e8f5ff] text-[#1486CC] dark:bg-[#1c3547] dark:text-sky-300">
          <CalendarDays className="size-5" strokeWidth={2.8} />
        </div>
        <div>
          <h2 className="text-lg font-black text-slate-900 dark:text-white">Lịch 7 ngày</h2>
          <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Theo giờ Việt Nam</p>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
        {data.summary.weekActivity.map((day) => (
          <div key={day.day} className="text-center">
            <p className="text-[11px] font-black uppercase text-slate-400">{day.day}</p>
            <div
              className={cn(
                "mt-2 flex aspect-square items-center justify-center rounded-xl border-2 text-sm font-black transition-transform hover:scale-105 sm:rounded-2xl",
                day.completed
                  ? "border-emerald-200 bg-emerald-50 text-emerald-500 dark:border-emerald-900/60 dark:bg-emerald-950/30 dark:text-emerald-300"
                  : "border-slate-200 bg-slate-50 text-slate-300 dark:border-[#2a4654] dark:bg-[#0d171b] dark:text-slate-500",
              )}
            >
              {day.completed ? <Check className="size-4" strokeWidth={3} /> : "-"}
            </div>
          </div>
        ))}
      </div>
    </CardShell>
  );
};

const TipCard = () => {
  return (
    <CardShell className="p-4">
      <div className="flex items-start gap-4">
        <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-500 dark:bg-emerald-950/30 dark:text-emerald-300">
          <Lightbulb className="size-6" strokeWidth={2.8} />
        </div>
        <div>
          <h2 className="text-lg font-black text-slate-900 dark:text-white">Mẹo hôm nay</h2>
          <p className="mt-1 text-sm font-semibold leading-6 text-slate-500 dark:text-slate-400">
            Làm một bài ngắn trước, sau đó quay lại nhiệm vụ cần độ chính xác. Cách này giữ nhịp tốt hơn khi mới vào học.
          </p>
        </div>
      </div>
    </CardShell>
  );
};
const LongTermQuestCard = ({ quest }: { quest: ResolvedQuest }) => {
  const view = getLongTermQuestView(quest);
  const milestones = getLongTermMilestones(quest);
  const toneClass =
    view.tone === "monthly"
      ? "border-violet-100 bg-gradient-to-br from-violet-50 via-white to-[#f8fbff] dark:border-violet-900/50 dark:from-violet-950/25 dark:via-[#182226] dark:to-[#10191d]"
      : "border-sky-100 bg-gradient-to-br from-sky-50 via-white to-[#f8fbff] dark:border-sky-900/50 dark:from-sky-950/25 dark:via-[#182226] dark:to-[#10191d]";
  const iconTone = view.tone === "monthly" ? "text-violet-500 bg-violet-50 border-violet-100 dark:bg-violet-950/30 dark:border-violet-900/60 dark:text-violet-300" : "text-[#1486CC] bg-[#e8f5ff] border-[#d8ecfb] dark:bg-[#1c3547] dark:border-[#234455] dark:text-sky-300";

  return (
    <article className={cn("quest-card-enter relative overflow-hidden rounded-[28px] border-2 p-5 shadow-[0_14px_30px_rgba(20,134,204,0.08)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_18px_38px_rgba(20,134,204,0.13)]", toneClass)}>
      <div className="pointer-events-none absolute -right-16 -top-20 size-44 rounded-full bg-white/60 blur-2xl dark:bg-white/5" />
      <div className="relative space-y-5">
        <div className="flex items-start gap-4">
          <div className={cn("flex size-14 shrink-0 items-center justify-center rounded-2xl border-2", iconTone)}>
            <QuestIcon icon={quest.icon} className="size-5.5 sm:size-7" strokeWidth={2.6} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-400">{view.eyebrow}</p>
            <h3 className="mt-1 text-xl font-black leading-tight text-slate-900 dark:text-white">{quest.title}</h3>
            <p className="mt-2 text-sm font-semibold leading-6 text-slate-500 dark:text-slate-400">{quest.description}</p>
          </div>
        </div>

        <div className="rounded-[22px] border-2 border-white/80 bg-white/70 p-4 dark:border-[#20313a] dark:bg-[#10191d]/60">
          <div className="flex items-center justify-between text-sm font-black text-slate-700 dark:text-slate-200">
            <span>{getQuestProgressText(quest)}</span>
            <span>{quest.progressPercent}%</span>
          </div>
          <ProgressBar value={quest.progressPercent} className="mt-3 h-3" />
          <div className="mt-3 flex flex-wrap gap-2">
            {milestones.map((milestone) => {
              const reached = quest.progress >= milestone;

              return (
                <span
                  key={`${quest.id}-milestone-${milestone}`}
                  className={cn(
                    "rounded-full border px-3 py-1 text-xs font-black uppercase tracking-[0.12em]",
                    reached
                      ? "border-emerald-200 bg-emerald-50 text-emerald-600 dark:border-emerald-900/60 dark:bg-emerald-950/30 dark:text-emerald-300"
                      : "border-slate-200 bg-white text-slate-400 dark:border-[#20313a] dark:bg-[#141f23] dark:text-slate-500",
                  )}
                >
                  {milestone}
                </span>
              );
            })}
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-2xl border-2 border-white/80 bg-white/70 p-3 dark:border-[#20313a] dark:bg-[#10191d]/60">
            <p className="text-[11px] font-black uppercase tracking-[0.18em] text-slate-400">Hạn chót</p>
            <p className="mt-1 text-sm font-black text-slate-900 dark:text-white">{view.deadline}</p>
          </div>
          <div className="rounded-2xl border-2 border-white/80 bg-white/70 p-3 dark:border-[#20313a] dark:bg-[#10191d]/60">
            <p className="text-[11px] font-black uppercase tracking-[0.18em] text-slate-400">Huy hiệu</p>
            <p className="mt-1 text-sm font-black text-slate-900 dark:text-white">{view.badgeLabel}</p>
          </div>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <SurfacePill className="border-amber-100 bg-amber-50 text-amber-500 dark:border-amber-900/60 dark:bg-amber-950/30 dark:text-amber-300">
            <Trophy className="size-4" strokeWidth={3} />
            {quest.reward.label}
          </SurfacePill>
          <span className="text-xs font-black uppercase tracking-[0.14em] text-slate-400">{view.milestoneLabel}</span>
        </div>
      </div>
    </article>
  );
};


const Toast = ({ toast }: { toast: ToastState }) => {
  return (
    <div
      className={cn(
        "quest-toast-pop fixed bottom-4 left-4 right-4 z-50 rounded-3xl border-2 bg-white p-4 shadow-[0_18px_40px_rgba(15,23,42,0.18)] dark:bg-[#141f23] sm:bottom-5 sm:left-auto sm:max-w-sm",
        toast.tone === "success"
          ? "border-emerald-200 dark:border-emerald-900/60"
          : toast.tone === "error"
            ? "border-rose-200 dark:border-rose-900/60"
            : "border-[#d8ecfb] dark:border-[#20313a]",
      )}
    >
      <p className="text-sm font-black text-slate-900 dark:text-white">{toast.title}</p>
      <p className="mt-1 text-sm font-semibold leading-5 text-slate-500 dark:text-slate-400">{toast.description}</p>
    </div>
  );
};

const DemoStateShell = ({ children }: { children: ReactNode }) => {
  return <div className="mx-auto w-full max-w-[1320px] px-3 pb-10 sm:px-4 xl:px-0 xl:pb-14">{children}</div>;
};

const LoadingBlock = ({ className }: { className?: string }) => {
  return <div className={cn("animate-pulse rounded-[30px] bg-slate-200/70 dark:bg-[#243841]", className)} />;
};

const QuestsLoadingState = () => {
  return (
    <DemoStateShell>
      <div className="grid gap-4 sm:gap-5 xl:grid-cols-[minmax(0,840px)_330px] xl:items-start xl:justify-center">
        <div className="space-y-3.5 sm:space-y-4">
          <LoadingBlock className="h-[380px]" />
          <CardShell>
            <div className="space-y-3.5 sm:space-y-4">
              <LoadingBlock className="h-10 w-64" />
              <LoadingBlock className="h-32" />
              <LoadingBlock className="h-32" />
              <LoadingBlock className="h-32" />
            </div>
          </CardShell>
        </div>
        <div className="hidden space-y-5 xl:block">
          <LoadingBlock className="h-44" />
          <LoadingBlock className="h-32" />
          <LoadingBlock className="h-36" />
        </div>
      </div>
    </DemoStateShell>
  );
};

const QuestsEmptyState = () => {
  return (
    <DemoStateShell>
      <CardShell className="mx-auto max-w-3xl p-8 text-center sm:p-10">
        <div className="mx-auto flex size-20 items-center justify-center rounded-[28px] bg-[#e8f5ff] text-[#1486CC] dark:bg-[#1c3547] dark:text-sky-300">
          <PackageOpen className="size-10" strokeWidth={2.8} />
        </div>
        <h1 className="mt-5 text-3xl font-black text-slate-900 dark:text-white">Chưa có dữ liệu nhiệm vụ hôm nay</h1>
        <p className="mx-auto mt-3 max-w-xl text-base font-semibold leading-7 text-slate-500 dark:text-slate-400">
          Bắt đầu một bài học để Robogo cập nhật tiến độ và mở nhiệm vụ trong ngày.
        </p>
        <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
          <Button asChild variant="primary" className="h-12 rounded-2xl px-6 font-black">
            <Link href="/learn">Quay lại học</Link>
          </Button>
          <Button asChild variant="primary-outline" className="h-12 rounded-2xl px-6 font-black">
            <Link href="/quests">Về trang nhiệm vụ</Link>
          </Button>
        </div>
      </CardShell>
    </DemoStateShell>
  );
};

const QuestsErrorState = () => {
  return (
    <DemoStateShell>
      <CardShell className="mx-auto max-w-3xl p-8 text-center sm:p-10">
        <div className="mx-auto flex size-20 items-center justify-center rounded-[28px] bg-rose-50 text-rose-500 dark:bg-rose-950/30 dark:text-rose-300">
          <RotateCcw className="size-10" strokeWidth={2.8} />
        </div>
        <h1 className="mt-5 text-3xl font-black text-slate-900 dark:text-white">Chưa tải được nhiệm vụ hôm nay</h1>
        <p className="mx-auto mt-3 max-w-xl text-base font-semibold leading-7 text-slate-500 dark:text-slate-400">
          Robogo chưa lấy được tiến độ hiện tại. Thử lại sau vài giây hoặc quay lại học trước.
        </p>
        <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
          <Button asChild variant="primary" className="h-12 rounded-2xl px-6 font-black">
            <Link href="/quests">Thử lại</Link>
          </Button>
          <Button asChild variant="primary-outline" className="h-12 rounded-2xl px-6 font-black">
            <Link href="/learn">Quay lại học</Link>
          </Button>
        </div>
      </CardShell>
    </DemoStateShell>
  );
};

export const QuestsClient = ({ initialData, demoState = "normal", presetName = "empty" }: QuestsClientProps) => {
  const storageSnapshot = useSyncExternalStore(
    subscribeToQuestStorage,
    getQuestStorageSnapshot,
    getQuestServerSnapshot,
  );
  const [toast, setToast] = useState<ToastState | null>(null);
  const data = storageSnapshot === getQuestServerSnapshot()
    ? initialData
    : getQuestsPageDataFromSnapshotSync(initialData.snapshot, {
        dataSource: initialData.dataSource,
        syncStatus: initialData.syncStatus,
        weekActivity: initialData.summary.weekActivity,
      });
  const perfectDayQuest = data.bonusQuests.find((quest) => quest.type === "perfect-day");
  const longTermQuests = data.bonusQuests.filter((quest) => quest.type !== "perfect-day");

  const showToast = (nextToast: ToastState) => {
    setToast(nextToast);
    window.setTimeout(() => setToast(null), 2400);
  };

  const handleClaimQuest = async (quest: ResolvedQuest) => {
    if (!quest.canClaim) return;

    try {
      const result = await claimQuestReward(quest.id);

      showToast({
        title: "Đã nhận thưởng",
        description: result?.alreadyClaimed
          ? "Bạn đã nhận phần thưởng này hôm nay."
          : `Bạn nhận được ${result?.rewardXp ?? result?.reward?.xp ?? quest.reward.label}.`,
        tone: "success",
      });
    } catch {
      showToast({
        title: "Chưa thể nhận thưởng",
        description: "Phần thưởng sẽ mở khi dữ liệu học tập thật được ghi nhận.",
        tone: "error",
      });
    }
  };

  const handleResetDemo = () => {
    clearQuestStorage();
    showToast({
      title: "Đã xóa trạng thái thử",
      description: "Trạng thái nhận thưởng tạm thời đã được làm mới.",
      tone: "info",
    });
  };

  if (demoState === "loading") return <QuestsLoadingState />;
  if (demoState === "empty") return <QuestsEmptyState />;
  if (demoState === "error") return <QuestsErrorState />;

  return (
    <div className="mx-auto w-full max-w-[1320px] px-3 pb-10 sm:px-4 xl:px-0 xl:pb-14">
      <QuestPolishStyles />
      <div className="grid gap-4 sm:gap-5 xl:grid-cols-[minmax(0,840px)_330px] xl:items-start xl:justify-center">
        <div className="space-y-3.5 sm:space-y-4">
          <QuestsHero data={data} onResetDemo={handleResetDemo} presetName={presetName} />
          <QuestMobileOverview data={data} />

          <CardShell>
            <SectionHeader
              eyebrow="Mục tiêu mỗi ngày"
              title="Ba nhiệm vụ nhỏ"
              description="Vào học, học chính xác và giữ đủ thời gian để mở rương thưởng hôm nay."
              rightSlot={
                <SurfacePill className="border-[#d8ecfb] bg-[#f6fbff] text-[#1486CC] dark:border-[#20313a] dark:bg-[#10191d] dark:text-sky-300">
                  <BadgeCheck className="size-4" strokeWidth={3} />
                  {data.summary.dailyCompleted}/{data.summary.dailyTotal} hoàn thành
                </SurfacePill>
              }
            />
            <div className="space-y-3.5 sm:space-y-4">
              {data.dailyQuests.map((quest, index) => (
                <QuestCard key={quest.id} quest={quest} delayIndex={index} onClaim={handleClaimQuest} />
              ))}
            </div>
          </CardShell>

          <PerfectDayCard quest={perfectDayQuest} data={data} />

          <CardShell>
            <SectionHeader
              eyebrow="Mục tiêu dài hạn"
              title="Mục tiêu tuần và tháng"
              description="Mục tiêu tuần và tháng giúp bạn giữ động lực quay lại học đều hơn."
            />
            <div className="grid gap-4 lg:grid-cols-2">
              {longTermQuests.map((quest) => (
                <LongTermQuestCard key={quest.id} quest={quest} />
              ))}
            </div>
          </CardShell>

          <div className="grid gap-4 md:grid-cols-2 xl:hidden">
            <WeekActivityCard data={data} />
            <TipCard />
          </div>
        </div>

        <QuestSidebar data={data} className="hidden xl:sticky xl:top-6 xl:block" />
      </div>
      {toast ? <Toast toast={toast} /> : null}
    </div>
  );
};
