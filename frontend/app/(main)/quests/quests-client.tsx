"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import {
  ArrowRight,
  BadgeCheck,
  Check,
  CircleDot,
  Clock,
  Gift,
  LoaderCircle,
  Lock,
  PackageOpen,
  PartyPopper,
  RotateCcw,
  ShieldCheck,
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
  applyQuestClaimResultToPageData,
  claimQuestReward,
  clearQuestStorage,
  getQuestServerSnapshot,
  getQuestStorageSnapshot,
  getQuestsPageDataFromSnapshotSync,
  subscribeToQuestStorage,
} from "@/lib/quests";
import {
  getQuestResetCountdown,
  QUEST_COUNTDOWN_PLACEHOLDER,
  QUEST_COUNTDOWN_REFRESHING_LABEL,
} from "@/lib/quests/quest-time";
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

const SleepyMascot = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className={cn("animate-robot-sad", className)}>
    <rect x="23" y="10" width="2" height="4" fill="#94a3b8" rx="1"/>
    <circle cx="24" cy="9" r="2" fill="#ff4d4f"/>
    <rect x="8" y="20" width="3" height="8" fill="#1486cc" rx="1.5"/>
    <rect x="37" y="20" width="3" height="8" fill="#1486cc" rx="1.5"/>
    <rect x="11" y="14" width="26" height="20" rx="6" fill="#1486CC"/>
    <rect x="12" y="15" width="24" height="18" rx="5" fill="#38bdf8"/>
    <rect x="15" y="18" width="18" height="12" rx="3" fill="#0f172a"/>
    <path d="M18 24h3M27 24h3" stroke="#50e2ff" strokeWidth="2" strokeLinecap="round"/>
    <path d="M35 12h3l-3 4h3" stroke="#38bdf8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M38 6h4l-4 5h4" stroke="#38bdf8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const AwakeMascot = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className={cn("animate-robot-float", className)}>
    <rect x="23" y="10" width="2" height="4" fill="#94a3b8" rx="1"/>
    <circle cx="24" cy="9" r="2" fill="#ff4d4f"/>
    <rect x="8" y="20" width="3" height="8" fill="#1486cc" rx="1.5"/>
    <rect x="37" y="20" width="3" height="8" fill="#1486cc" rx="1.5"/>
    <rect x="11" y="14" width="26" height="20" rx="6" fill="#1486CC"/>
    <rect x="12" y="15" width="24" height="18" rx="5" fill="#38bdf8"/>
    <rect x="15" y="18" width="18" height="12" rx="3" fill="#0f172a"/>
    <circle cx="20" cy="23" r="2.5" fill="#50e2ff"/>
    <circle cx="20" cy="23" r="1" fill="#ffffff"/>
    <circle cx="28" cy="23" r="2.5" fill="#50e2ff"/>
    <circle cx="28" cy="23" r="1" fill="#ffffff"/>
    <path d="M22 27c1 1 3 1 4 0" stroke="#50e2ff" strokeWidth="1.5" strokeLinecap="round"/>
    <path d="M38 12l1 2 2 1-2 1-1 2-1-2-2-1 2-1 1-2z" fill="#ffc53d"/>
    <path d="M7 13l0.8 1.6 1.6 0.8-1.6 0.8-0.8 1.6-0.8-1.6-1.6-0.8 1.6-0.8 0.8-1.6z" fill="#ffc53d"/>
  </svg>
);

const ExcitedMascot = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className={cn("animate-robot-bounce", className)}>
    <rect x="23" y="12" width="2" height="4" fill="#94a3b8" rx="1"/>
    <circle cx="24" cy="11" r="2" fill="#ff4d4f"/>
    <rect x="8" y="22" width="3" height="8" fill="#1486cc" rx="1.5"/>
    <rect x="37" y="22" width="3" height="8" fill="#1486cc" rx="1.5"/>
    <rect x="11" y="16" width="26" height="20" rx="6" fill="#1486CC"/>
    <rect x="12" y="17" width="24" height="18" rx="5" fill="#38bdf8"/>
    <rect x="15" y="20" width="18" height="12" rx="3" fill="#0f172a"/>
    <circle cx="20" cy="25" r="2.5" fill="#50e2ff"/>
    <circle cx="20" cy="25" r="1" fill="#ffffff"/>
    <circle cx="28" cy="25" r="2.5" fill="#50e2ff"/>
    <circle cx="28" cy="25" r="1" fill="#ffffff"/>
    <path d="M22 28.5c1 1.5 3 1.5 4 0" fill="#50e2ff" stroke="#50e2ff" strokeWidth="1" strokeLinecap="round"/>
    <g transform="translate(28, -2) rotate(15)">
      <path d="M8 20c-1 1-1 3-1 3s1.5 0 2.5-1 0.5-2.5 0.5-2.5-1 0-2 1z" fill="#ff9c6e"/>
      <path d="M8 3C4 7 4 16 4 19h8c0-3 0-12-4-16z" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="0.5"/>
      <path d="M8 3c-2 2-2.5 5-2.5 7h5c0-2-.5-5-2.5-7z" fill="#ff4d4f"/>
      <path d="M4 16c-2 0-3 2-3 4v1h3v-5z" fill="#1486cc"/>
      <path d="M12 16c2 0 3 2 3 4v1h-3v-5z" fill="#1486cc"/>
      <circle cx="8" cy="12" r="1.5" fill="#38bdf8" />
    </g>
  </svg>
);

const CelebratingMascot = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className={cn("animate-robot-bounce", className)}>
    <rect x="23" y="10" width="2" height="4" fill="#94a3b8" rx="1"/>
    <circle cx="24" cy="9" r="2" fill="#ff4d4f"/>
    <rect x="8" y="20" width="3" height="8" fill="#1486cc" rx="1.5"/>
    <rect x="37" y="20" width="3" height="8" fill="#1486cc" rx="1.5"/>
    <rect x="11" y="14" width="26" height="20" rx="6" fill="#1486CC"/>
    <rect x="12" y="15" width="24" height="18" rx="5" fill="#38bdf8"/>
    <rect x="15" y="18" width="18" height="12" rx="3" fill="#0f172a"/>
    <path d="M18 24.5c.5-.7 1.5-.7 2 0M26 24.5c.5-.7 1.5-.7 2 0" stroke="#50e2ff" strokeWidth="2" strokeLinecap="round"/>
    <path d="M21 27c1 1.2 3 1.2 4 0" fill="#50e2ff" stroke="#50e2ff" strokeWidth="0.8" strokeLinecap="round"/>
    <g transform="translate(10, 4) rotate(-15)">
      <polygon points="12,0 6,12 18,12" fill="#ff4d4f" />
      <polygon points="12,0 9,12 15,12" fill="#ffc53d" />
      <circle cx="12" cy="0" r="1.5" fill="#ffc53d" />
    </g>
    <rect x="36" y="8" width="2" height="4" rx="0.5" fill="#52c41a" transform="rotate(30 36 8)"/>
    <rect x="6" y="9" width="2" height="4" rx="0.5" fill="#ff4d4f" transform="rotate(-45 6 9)"/>
    <circle cx="39" cy="20" r="1.5" fill="#ffc53d" />
    <circle cx="7" cy="22" r="1.2" fill="#1890ff" />
  </svg>
);

const robotMoodView: Record<RobotMood, { mascot: React.ReactNode; title: string; description: string; tone: string }> = {
  sleepy: {
    mascot: <SleepyMascot className="size-16 sm:size-18" />,
    title: "Robo đang chờ bạn khởi động",
    description: "Hoàn thành nhiệm vụ đầu tiên để đánh thức nhịp học hôm nay.",
    tone: "border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-900/50",
  },
  awake: {
    mascot: <AwakeMascot className="size-16 sm:size-18" />,
    title: "Robo đã tỉnh dậy",
    description: "Bạn đã có nhịp học tốt. Tiếp tục để mở phần thưởng lớn hơn.",
    tone: "border-sky-200 bg-sky-50 dark:border-sky-900/60 dark:bg-sky-950/40",
  },
  excited: {
    mascot: <ExcitedMascot className="size-16 sm:size-18" />,
    title: "Robo đang rất hào hứng",
    description: "Chỉ còn 1 nhiệm vụ nữa để mở Ngày hoàn hảo.",
    tone: "border-[#bfe3fb] bg-[#f1f9ff] dark:border-[#234455] dark:bg-[#132a38]",
  },
  celebrating: {
    mascot: <CelebratingMascot className="size-16 sm:size-18" />,
    title: "Ngày hoàn hảo đã mở",
    description: "Bạn đã hoàn thành toàn bộ nhiệm vụ hôm nay. Rất đáng giữ chuỗi này.",
    tone: "border-emerald-200 bg-emerald-50 dark:border-emerald-900/60 dark:bg-emerald-950/40",
  },
};

const SHOW_QUEST_DEMO_CONTROLS =
  process.env.NEXT_PUBLIC_SHOW_QUEST_DEBUG === "true";

const useQuestResetCountdown = (nextResetAt: string) => {
  const router = useRouter();
  const hasTriggeredRefreshRef = useRef(false);
  const [countdownLabel, setCountdownLabel] = useState(
    QUEST_COUNTDOWN_PLACEHOLDER,
  );

  useEffect(() => {
    hasTriggeredRefreshRef.current = false;

    const updateCountdown = () => {
      const countdown = getQuestResetCountdown(nextResetAt);

      if (!countdown.isValid) {
        setCountdownLabel(QUEST_COUNTDOWN_PLACEHOLDER);
        return;
      }

      if (countdown.isExpired) {
        if (!hasTriggeredRefreshRef.current) {
          hasTriggeredRefreshRef.current = true;
          setCountdownLabel(QUEST_COUNTDOWN_REFRESHING_LABEL);
          router.refresh();
        }

        return;
      }

      setCountdownLabel(countdown.label);
    };

    const initialTimeoutId = window.setTimeout(updateCountdown, 0);
    const intervalId = window.setInterval(updateCountdown, 1000);

    return () => {
      window.clearTimeout(initialTimeoutId);
      window.clearInterval(intervalId);
    };
  }, [nextResetAt, router]);

  return countdownLabel;
};

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
          box-shadow: 0 18px 42px rgba(16, 185, 129, 0.14);
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

const BookOpenIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <path d="M4 6c0-1.1.9-2 2-2h8v22H6c-1.1 0-2-.9-2-2V6z" fill="#ff7875" />
    <path d="M28 6c0-1.1-.9-2-2-2h-8v22h8c1.1 0 2-.9 2-2V6z" fill="#ff4d4f" />
    <path d="M6 5c0-.6.4-1 1-1h7v21H7c-.6 0-1-.4-1-1V5z" fill="#f8fafc" />
    <path d="M26 5c0-.6-.4-1-1-1h-7v21h7c.6 0 1-.4 1-1V5z" fill="#f1f5f9" />
    <line x1="8" y1="8" x2="12" y2="8" stroke="#cbd5e1" strokeWidth="1.5" strokeLinecap="round"/>
    <line x1="8" y1="12" x2="12" y2="12" stroke="#cbd5e1" strokeWidth="1.5" strokeLinecap="round"/>
    <line x1="8" y1="16" x2="12" y2="16" stroke="#cbd5e1" strokeWidth="1.5" strokeLinecap="round"/>
    <line x1="20" y1="8" x2="24" y2="8" stroke="#94a3b8" strokeWidth="1.5" strokeLinecap="round"/>
    <line x1="20" y1="12" x2="24" y2="12" stroke="#94a3b8" strokeWidth="1.5" strokeLinecap="round"/>
    <line x1="20" y1="16" x2="24" y2="16" stroke="#94a3b8" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
);

const TargetIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <circle cx="16" cy="16" r="13" fill="#ff4d4f"/>
    <circle cx="16" cy="16" r="10" fill="#ffffff"/>
    <circle cx="16" cy="16" r="7" fill="#ff4d4f"/>
    <circle cx="16" cy="16" r="4" fill="#ffffff"/>
    <circle cx="16" cy="16" r="1.5" fill="#ffc53d"/>
  </svg>
);

const ClockIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <circle cx="16" cy="17" r="12" fill="#1486cc" />
    <circle cx="16" cy="17" r="10" fill="#38bdf8" />
    <circle cx="16" cy="17" r="8" fill="#f8fafc" />
    <rect x="14" y="2" width="4" height="3" fill="#94a3b8" rx="1" />
    <circle cx="25" cy="8" r="1.5" fill="#ff4d4f" />
    <path d="M16 17v-5" stroke="#0f172a" strokeWidth="1.5" strokeLinecap="round"/>
    <path d="M16 17l4 3" stroke="#0f172a" strokeWidth="1.5" strokeLinecap="round"/>
    <circle cx="16" cy="17" r="1.5" fill="#0f172a" />
  </svg>
);

const SparklesIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <path d="M16 3l3.5 8.5L28 15l-8.5 3.5L16 27l-3.5-8.5L4 15l8.5-3.5L16 3z" fill="#ffc53d"/>
    <path d="M26 6l1.2 2.8L30 10l-2.8 1.2L26 14l-1.2-2.8L22 10l2.8-1.2L26 6z" fill="#ff9c6e"/>
    <path d="M6 22l1.2 2.8L10 26l-2.8 1.2L6 30l-1.2-2.8L2 26l2.8-1.2L6 22z" fill="#ff9c6e"/>
  </svg>
);

const RocketIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <path d="M16 24c-2 2-2 5-2 5s3 0 5-2 1-5 1-5-2 0-4 2z" fill="#ff9c6e"/>
    <path d="M16 24c-1 1.5-1 3.5-1 3.5s2 0 3.5-1.5.7-3.5.7-3.5-1.2 0-3.2 1.5z" fill="#ff4d4f"/>
    <path d="M16 3C11 9 11 20 11 23h10c0-3 0-14-5-20z" fill="#f1f5f9"/>
    <path d="M16 3c-2.5 3-3 7-3 9h6c0-2-.5-6-3-9z" fill="#ff4d4f"/>
    <path d="M11 20c-3 0-5 3-5 5v1h5v-6z" fill="#1486cc"/>
    <path d="M21 20c3 0 5 3 5 5v1h-5v-6z" fill="#1486cc"/>
    <circle cx="16" cy="14" r="3" fill="#38bdf8" stroke="#cbd5e1" strokeWidth="1.5"/>
    <circle cx="15.5" cy="13.5" r="1.5" fill="#ffffff" opacity="0.6"/>
  </svg>
);

const TrophyIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <rect x="11" y="25" width="10" height="3" fill="#1e293b" rx="1" />
    <path d="M13 22h6v3h-6z" fill="#475569" />
    <path d="M7 6h18v10c0 4.4-3.6 8-8 8h-2c-4.4 0-8-3.6-8-8V6z" fill="#ffc53d" />
    <path d="M8 7v9c0 3.9 3.1 7 7 7h1c3.9 0 7-3.1 7-7V7H8z" fill="#ffb81c" />
    <path d="M7 9H4v5c0 2 1.5 3.5 3.5 3.5h.5V16c-1 0-2-1-2-3V9zM25 9h3v5c0 2-1.5 3.5-3.5 3.5h-.5V16c1 0 2-1 2-3V9z" fill="#d97706" />
    <path d="M16 11l1 2h2l-1.5 1 .5 2-1.5-1-1.5 1 .5-2-1.5-1h2z" fill="#ffffff" />
  </svg>
);

const ZapIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <path d="M19 3L7 17h8l-3 12 13-14h-8l3-12z" fill="#ffc53d" stroke="#d97706" strokeWidth="1.5" strokeLinejoin="round"/>
  </svg>
);

const ChestIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <path d="M4 16v10c0 1.1.9 2 2 2h20c1.1 0 2-.9 2-2V16H4z" fill="#8d5b4c" />
    <path d="M5 16v9c0 .6.4 1 1 1h20c.6 0 1-.4 1-1v-9H5z" fill="#a16a5e" />
    <path d="M4 16h24v-4c0-2.8-2.2-5-5-5H9c-2.8 0-5 2.2-5 5v4z" fill="#8d5b4c" />
    <path d="M5 15h22v-3c0-2.2-1.8-4-4-4H9c-2.2 0-4 1.8-4 4v3z" fill="#a16a5e" />
    <rect x="7" y="7" width="3" height="21" fill="#ffc53d" />
    <rect x="22" y="7" width="3" height="21" fill="#ffc53d" />
    <rect x="13" y="13" width="6" height="6" rx="1" fill="#ffc53d" stroke="#d97706" strokeWidth="1" />
    <circle cx="16" cy="16" r="1" fill="#0f172a" />
  </svg>
);

const MedalIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <path d="M11 6l3 9h-6z" fill="#ff4d4f" />
    <path d="M21 6l-3 9h6z" fill="#ff4d4f" />
    <path d="M16 6l2 9h-4z" fill="#e8f5ff" />
    <circle cx="16" cy="18" r="9" fill="#ffc53d" />
    <circle cx="16" cy="18" r="7" fill="#d97706" />
    <circle cx="16" cy="18" r="5" fill="#ffc53d" />
    <path d="M16 15l.6 1.2 1.4.1-1 .9.3 1.3-1.3-.7-1.3.7.3-1.3-1-.9 1.4-.1z" fill="#ffffff" />
  </svg>
);

const QuestIcon = ({
  icon,
  className,
}: {
  icon: string;
  className?: string;
  strokeWidth?: number;
}) => {
  switch (icon) {
    case "book-open":
      return <BookOpenIcon className={className} />;
    case "target":
      return <TargetIcon className={className} />;
    case "clock":
      return <ClockIcon className={className} />;
    case "sparkles":
      return <SparklesIcon className={className} />;
    case "rocket":
      return <RocketIcon className={className} />;
    case "trophy":
      return <TrophyIcon className={className} />;
    default:
      return <TargetIcon className={className} />;
  }
};

const RewardTypeIcon = ({
  type,
  className,
}: {
  type: ResolvedQuest["reward"]["type"];
  className?: string;
  strokeWidth?: number;
}) => {
  switch (type) {
    case "chest":
      return <ChestIcon className={className} />;
    case "badge":
      return <MedalIcon className={className} />;
    default:
      return <ZapIcon className={className} />;
  }
};

const QuestAction = ({
  quest,
  isClaiming = false,
  onClaim,
}: {
  quest: ResolvedQuest;
  isClaiming?: boolean;
  onClaim?: (quest: ResolvedQuest) => void;
}) => {
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
        disabled={isClaiming}
        aria-busy={isClaiming}
        onClick={() => onClaim?.(quest)}
      >
        {isClaiming ? (
          <>
            <LoaderCircle className="mr-2 size-4 animate-spin" strokeWidth={3} />
            Đang nhận...
          </>
        ) : (
          getQuestActionLabel(quest)
        )}
      </Button>
    );
  }

  if (quest.status === "claimed") {
    return (
      <Button
        type="button"
        variant="primary-outline"
        className="h-10 w-full justify-center rounded-2xl border-2 border-emerald-200 bg-emerald-50 px-5 font-black text-emerald-600 disabled:opacity-100 dark:border-emerald-700 dark:bg-[#0d171b] dark:text-emerald-300 sm:h-11 sm:w-auto"
        disabled
      >
        <Check className="mr-2 size-4" strokeWidth={3} />
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
  isClaiming = false,
  onClaim,
}: {
  quest: ResolvedQuest;
  compact?: boolean;
  delayIndex?: number;
  isClaiming?: boolean;
  onClaim?: (quest: ResolvedQuest) => void;
}) => {
  const isCompleted = quest.status === "completed" || quest.status === "claimed";
  const isActive = quest.status === "active";
  const isClaimed = quest.status === "claimed";

  return (
    <article
      className={cn(
        "render-lazy quest-card-enter group relative overflow-hidden rounded-[22px] border-2 bg-white p-3.5 ring-1 ring-white/80 transition-all duration-300 dark:bg-[#141f23] dark:ring-white/5 sm:rounded-[24px] sm:p-5",
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

        <QuestAction quest={quest} isClaiming={isClaiming} onClaim={onClaim} />
      </div>
    </article>
  );
};

const HeroStat = ({ label, value, icon }: { label: string; value: string; icon: ReactNode }) => {
  return (
    <div className="rounded-[18px] border-2 border-white/80 bg-white/95 px-3.5 py-3 shadow-[0_8px_20px_rgba(20,134,204,0.07)] dark:border-[#2a4654] dark:bg-[#141f23] dark:shadow-none sm:rounded-[20px] sm:px-4">
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
  resetCountdown,
}: {
  data: QuestsPageData;
  onResetDemo: () => void;
  presetName: QuestSnapshotPresetName;
  resetCountdown: string;
}) => {
  const remaining = Math.max(data.summary.dailyTotal - data.summary.dailyCompleted, 0);
  const mood = robotMoodView[data.summary.robotMood];
  const gameMessage = getGameLoopMessage(data);

  return (
    <section className="relative overflow-hidden rounded-[28px] border-2 border-[#cde8fb] bg-gradient-to-br from-[#e4f5ff] via-white to-[#f7fcff] p-3.5 shadow-[0_20px_48px_rgba(20,134,204,0.12)] dark:border-[#2a5365] dark:from-[#102838] dark:via-[#182226] dark:to-[#10191d] dark:shadow-none sm:rounded-[32px] sm:p-6">
      <div className="quest-ambient-orb pointer-events-none absolute -right-20 -top-24 size-72 [--quest-orb:rgba(49,182,255,0.22)]" />
      <div className="quest-ambient-orb pointer-events-none absolute -bottom-24 left-12 size-64 [--quest-orb:rgba(110,231,183,0.2)]" />

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

          <div className="mt-4 flex flex-col gap-3 rounded-[22px] border-2 border-white/80 bg-white/90 p-3.5 dark:border-[#2a4654] dark:bg-[#10191d]/90 sm:mt-5 sm:flex-row sm:items-center sm:justify-between sm:rounded-[24px] sm:p-4">
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
            <HeroStat label="Làm mới sau" value={resetCountdown} icon={<Clock className="size-4" strokeWidth={3} />} />
          </div>
          {SHOW_QUEST_DEMO_CONTROLS ? (

          <details className="mt-4 rounded-2xl border border-white/80 bg-white/90 px-3 py-2 text-xs font-black uppercase tracking-[0.12em] text-slate-500 dark:border-[#20313a] dark:bg-[#10191d]/90">
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
          <div className="quest-robot-idle mx-auto flex size-20 items-center justify-center rounded-[24px] bg-white shadow-[0_12px_26px_rgba(20,134,204,0.12)] dark:bg-[#10191d] sm:size-22">
            {mood.mascot}
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

const PerfectDayRewardIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <path d="M4 22l2-14 6 5 4-8 4 8 6-5 2 14H4z" fill="#ffc53d" />
    <path d="M6 21l1.5-10.5 4.5 3.75 4-6 4 6 4.5-3.75L26 21H6z" fill="#ffb81c" />
    <circle cx="4" cy="8" r="1.5" fill="#ff4d4f" />
    <circle cx="12" cy="13" r="1.5" fill="#1890ff" />
    <circle cx="16" cy="5" r="1.5" fill="#52c41a" />
    <circle cx="20" cy="13" r="1.5" fill="#1890ff" />
    <circle cx="28" cy="8" r="1.5" fill="#ff4d4f" />
    <rect x="3" y="22" width="26" height="3" rx="1.5" fill="#d97706" />
    <rect x="5" y="23" width="22" height="1" rx="0.5" fill="#ffc53d" />
  </svg>
);

const CustomChestIcon = ({ tone, className }: { tone: "gold" | "silver" | "blue"; className?: string }) => {
  const metalColor = tone === "gold" ? "#ffc53d" : tone === "silver" ? "#cbd5e1" : "#d97706";
  const metalShadow = tone === "gold" ? "#d97706" : tone === "silver" ? "#94a3b8" : "#78350f";

  return (
    <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <path d="M4 16v10c0 1.1.9 2 2 2h20c1.1 0 2-.9 2-2V16H4z" fill="#8d5b4c" />
      <path d="M5 16v9c0 .6.4 1 1 1h20c.6 0 1-.4 1-1v-9H5z" fill="#a16a5e" />
      <path d="M4 16h24v-4c0-2.8-2.2-5-5-5H9c-2.8 0-5 2.2-5 5v4z" fill="#8d5b4c" />
      <path d="M5 15h22v-3c0-2.2-1.8-4-4-4H9c-2.2 0-4 1.8-4 4v3z" fill="#a16a5e" />
      <rect x="7" y="7" width="3" height="21" fill={metalColor} />
      <rect x="22" y="7" width="3" height="21" fill={metalColor} />
      <rect x="13" y="13" width="6" height="6" rx="1" fill={metalColor} stroke={metalShadow} strokeWidth="1" />
      <circle cx="16" cy="16" r="1" fill="#0f172a" />
    </svg>
  );
};

const CustomCalendarIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <rect x="4" y="6" width="24" height="22" rx="4" fill="#cbd5e1" />
    <rect x="5" y="7" width="22" height="20" rx="3" fill="#ffffff" />
    <path d="M5 12h22V9c0-1.1-.9-2-2-2H7c-1.1 0-2 .9-2 2v3z" fill="#ff4d4f" />
    <rect x="8" y="3" width="3" height="6" rx="1.5" fill="#64748b" />
    <rect x="21" y="3" width="3" height="6" rx="1.5" fill="#64748b" />
    <path d="M16 23.3s-4.5-2.7-4.5-4.5c0-1.4 1-2.3 2.3-2.3.8 0 1.6.5 2.2 1 .6-.5 1.4-1 2.2-1 1.3 0 2.3.9 2.3 2.3 0 1.8-4.5 4.5-4.5 4.5z" fill="#ff4d4f" />
  </svg>
);

const CustomTipsIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <circle cx="16" cy="14" r="10" fill="#fef08a" opacity="0.5" />
    <path d="M16 4C10.5 4 8 8 8 13.5c0 3.3 2 6 3.5 7.5v2c0 .6.4 1 1 1h7c.6 0 1-.4 1-1v-2c1.5-1.5 3.5-4.2 3.5-7.5C24 8 21.5 4 16 4z" fill="#fde047" />
    <path d="M16 5c-4.4 0-6.5 3.2-6.5 7.5c0 2.5 1.5 4.6 2.8 5.8v2.2c0 .3.2.5.5.5h6.4c.3 0 .5-.2.5-.5v-2.2c1.3-1.2 2.8-3.3 2.8-5.8C22.5 8.2 20.4 5 16 5z" fill="#fef08a" />
    <rect x="12" y="24" width="8" height="3" rx="1" fill="#94a3b8" />
    <rect x="13.5" y="27" width="5" height="2" rx="1" fill="#64748b" />
    <path d="M13 14l2-3 2 3" stroke="#eab308" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <line x1="16" y1="1" x2="16" y2="3" stroke="#eab308" strokeWidth="2" strokeLinecap="round" />
    <line x1="6.5" y1="4.5" x2="8.5" y2="6.5" stroke="#eab308" strokeWidth="2" strokeLinecap="round" />
    <line x1="25.5" y1="4.5" x2="23.5" y2="6.5" stroke="#eab308" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

const CustomFlameIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <path d="M16 2C16 2 25 9 25 18c0 5-4 9-9 9s-9-4-9-9c0-9 9-18 9-18z" fill="#ff763b" />
    <path d="M16 8C16 8 21 13 21 18c0 3-2.5 5.5-5 5.5s-5-2.5-5-5.5c0-5 5-10 5-10z" fill="#ffba00" />
    <path d="M16 13c0 0 2.5 2.5 2.5 5 0 1.5-1.2 2.5-2.5 2.5S13.5 19.5 13.5 18c0-2.5 2.5-5 2.5-5z" fill="#ffffff" />
  </svg>
);

const PerfectDayCard = ({ quest, data }: { quest?: ResolvedQuest; data: QuestsPageData }) => {
  if (!quest) return null;

  const view = getPerfectDayView(data);
  const chestView = getTodayChestView(data);
  const isUnlocked = view.stage === "unlocked";

  return (
    <section className={cn("relative overflow-hidden rounded-[32px] border-2 border-indigo-100 bg-gradient-to-br from-indigo-50 via-white to-[#f4fbff] p-5 shadow-[0_18px_42px_rgba(99,102,241,0.12)] transition-all duration-300 dark:border-indigo-900/50 dark:from-indigo-950/30 dark:via-[#182226] dark:to-[#10191d] dark:shadow-none sm:p-6", isUnlocked ? "ring-2 ring-emerald-200/80 dark:ring-emerald-900/50" : null)}>
      <div className="quest-ambient-orb pointer-events-none absolute -right-16 -top-20 size-52 [--quest-orb:rgba(165,180,252,0.2)]" />
      <div className="quest-ambient-orb pointer-events-none absolute -bottom-24 left-16 size-64 [--quest-orb:rgba(49,182,255,0.16)]" />

      <div className="relative space-y-5">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex gap-3 sm:gap-4">
            <div className="flex size-16 shrink-0 items-center justify-center rounded-[22px] border-2 border-indigo-100 bg-white shadow-[0_12px_24px_rgba(99,102,241,0.12)] dark:border-indigo-900/60 dark:bg-[#10191d]">
              <PerfectDayRewardIcon className="size-8" />
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
        <div className="flex size-12 items-center justify-center rounded-2xl bg-[#e8f5ff] dark:bg-[#1c3547]">
          <CustomFlameIcon className="size-7" />
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
          <CustomChestIcon tone={chestView.tone} className="size-8" />
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
        <div className="flex size-11 items-center justify-center rounded-2xl bg-[#e8f5ff] dark:bg-[#1c3547]">
          <CustomCalendarIcon className="size-6" />
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
        <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 dark:bg-emerald-950/30">
          <CustomTipsIcon className="size-7" />
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
    <article className={cn("render-lazy quest-card-enter relative overflow-hidden rounded-[28px] border-2 p-5 shadow-[0_14px_30px_rgba(20,134,204,0.08)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_18px_38px_rgba(20,134,204,0.13)]", toneClass)}>
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
  const [localQuestData, setLocalQuestData] = useState<{
    source: QuestsPageData;
    value: QuestsPageData;
  } | null>(null);
  const [claimingQuestId, setClaimingQuestId] = useState<string | null>(null);
  const claimInFlightRef = useRef<string | null>(null);
  const questData = localQuestData?.source === initialData
    ? localQuestData.value
    : initialData;
  const resetCountdown = useQuestResetCountdown(questData.nextResetAt);
  const storageSnapshot = useSyncExternalStore(
    subscribeToQuestStorage,
    getQuestStorageSnapshot,
    getQuestServerSnapshot,
  );
  const [toast, setToast] = useState<ToastState | null>(null);

  const data = storageSnapshot === getQuestServerSnapshot()
    ? questData
    : getQuestsPageDataFromSnapshotSync(questData.snapshot, {
        dataSource: questData.dataSource,
        syncStatus: questData.syncStatus,
        weekActivity: questData.summary.weekActivity,
        nextResetAt: questData.nextResetAt,
      });
  const perfectDayQuest = data.bonusQuests.find((quest) => quest.type === "perfect-day");
  const longTermQuests = data.bonusQuests.filter((quest) => quest.type !== "perfect-day");

  const showToast = (nextToast: ToastState) => {
    setToast(nextToast);
    window.setTimeout(() => setToast(null), 2400);
  };

  const handleClaimQuest = async (quest: ResolvedQuest) => {
    if (!quest.canClaim || claimInFlightRef.current) return;

    claimInFlightRef.current = quest.id;
    setClaimingQuestId(quest.id);

    try {
      const result = await claimQuestReward(quest.id);

      setLocalQuestData((currentState) => {
        const currentData = currentState?.source === initialData
          ? currentState.value
          : initialData;

        return {
          source: initialData,
          value: applyQuestClaimResultToPageData(currentData, result),
        };
      });
      showToast({
        title: "Đã nhận thưởng",
        description: result.alreadyClaimed
          ? "Bạn đã nhận phần thưởng này hôm nay."
          : `Bạn nhận được +${result.rewardXp} XP.`,
        tone: "success",
      });
    } catch {
      showToast({
        title: "Chưa thể nhận thưởng",
        description: "Phần thưởng sẽ mở khi dữ liệu học tập thật được ghi nhận.",
        tone: "error",
      });
    } finally {
      claimInFlightRef.current = null;
      setClaimingQuestId(null);
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
          <QuestsHero
            data={data}
            onResetDemo={handleResetDemo}
            presetName={presetName}
            resetCountdown={resetCountdown}
          />
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
                <QuestCard
                  key={quest.id}
                  quest={quest}
                  delayIndex={index}
                  isClaiming={claimingQuestId === quest.id}
                  onClaim={handleClaimQuest}
                />
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
