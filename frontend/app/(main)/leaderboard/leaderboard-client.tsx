"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Trophy,
  ChevronUp,
  ChevronDown,
  Clock,
  Sparkles,
  Info,
  Star,
  TrendingUp,
  X,
} from "lucide-react";
import { resolveUserAvatar } from "@/constants/user-avatar";
import { cn } from "@/lib/utils";
import { FeedWrapper } from "@/components/feed-wrapper";
import { StickyWrapper } from "@/components/sticky-wrapper";
import { LeagueShield, LEAGUES, LeagueId } from "@/components/league-shield";
import { updateUserLeague, updateUserStatusEmoji } from "@/actions/user-progress";
import { UserProgress } from "@/components/user-progress";

// ─── Constants ───────────────────────────────────────────────────────────────

const STATUS_EMOJIS = [
  "🕶️", "🎉", "💪", "👀", "🍿", "🇺🇸",
  "🦉", "💯", "💩", "🏆", "🧺", "🐱",
];

const AVATAR_COLORS = [
  "bg-purple-500", "bg-emerald-500", "bg-blue-500", "bg-cyan-500",
  "bg-amber-500", "bg-rose-500", "bg-indigo-500", "bg-orange-500",
  "bg-pink-500", "bg-teal-500", "bg-violet-500", "bg-lime-500",
];

// ─── Types ────────────────────────────────────────────────────────────────────

interface Competitor {
  id: string;
  name: string;
  avatarColor: string;
  avatarLetter: string;
  points: number;
  isCurrentUser: boolean;
  statusEmoji: string | null;
  avatarUrl?: string;
  level?: number;
  weeklyXp?: number;
  totalXp?: number;
  rank?: number;
}

type XpLeaderboardApiUser = {
  rank: number;
  userId: string;
  name: string;
  avatarUrl: string;
  level: number;
  weeklyXp: number;
  totalXp: number;
  isCurrentUser: boolean;
};

type XpLeaderboardApiResponse = {
  success: boolean;
  users: XpLeaderboardApiUser[];
  currentDay: string;
  currentWeekStart: string;
  isDemoUser?: boolean;
};

type SortTab = "weekly" | "total";

interface PromotionBanner {
  type: "promotion" | "demotion" | "safe";
  message: string;
}

interface LeaderboardClientProps {
  userId: string;
  initialUserName: string;
  initialUserImageSrc: string;
  initialPoints: number;
  initialLeague: number;
  initialStatusEmoji: string | null;
  initialCurrentDayIndex: number;
  hearts: number;
  activeCourse: { title: string; imageSrc: string };
  todayMinutes: number;
  isLoggedIn?: boolean;
}

// ─── Skeleton Row ─────────────────────────────────────────────────────────────

const SkeletonRow = () => (
  <div className="flex items-center gap-4 px-4 py-3.5 animate-pulse">
    <div className="h-7 w-7 rounded-full bg-slate-200 dark:bg-slate-800 shrink-0" />
    <div className="h-12 w-12 rounded-full bg-slate-200 dark:bg-slate-800 shrink-0" />
    <div className="flex-1 space-y-2">
      <div className="h-4 w-2/5 rounded-full bg-slate-200 dark:bg-slate-800" />
      <div className="h-3 w-1/3 rounded-full bg-slate-200 dark:bg-slate-800" />
    </div>
    <div className="h-5 w-14 rounded-full bg-slate-200 dark:bg-slate-800 shrink-0" />
  </div>
);

// ─── Main Component ───────────────────────────────────────────────────────────

export const LeaderboardClient: React.FC<LeaderboardClientProps> = ({
  userId,
  initialUserName,
  initialUserImageSrc,
  initialPoints,
  initialLeague,
  initialStatusEmoji,
  initialCurrentDayIndex,
  hearts,
  activeCourse,
  todayMinutes,
  isLoggedIn = false,
}) => {
  // ── State ──────────────────────────────────────────────────────────────────
  const [userLeague, setUserLeague] = useState<number>(initialLeague);
  const [activeLeagueView, setActiveLeagueView] = useState<LeagueId>(initialLeague as LeagueId);
  const [userStatusEmoji, setUserStatusEmoji] = useState<string | null>(initialStatusEmoji);
  const [userPoints, setUserPoints] = useState<number>(initialPoints);
  const [leaderboard, setLeaderboard] = useState<Competitor[]>([]);
  const [isLoadingLeaderboard, setIsLoadingLeaderboard] = useState<boolean>(true);
  const [leaderboardError, setLeaderboardError] = useState<string | null>(null);
  const [countdownText, setCountdownText] = useState<string>("");
  const [isEmojiAnimating, setIsEmojiAnimating] = useState<boolean>(false);
  const [showLeagueInfo, setShowLeagueInfo] = useState<boolean>(false);
  const [sortTab, setSortTab] = useState<SortTab>("weekly");
  const [promotionBanner, setPromotionBanner] = useState<PromotionBanner | null>(null);

  const emojiBubbleRef = useRef<HTMLDivElement>(null);

  // ── Week Key ────────────────────────────────────────────────────────────────
  const getCurrentWeekKey = useCallback(() => {
    const d = new Date();
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    const startOfWeek = new Date(d.setDate(diff));
    startOfWeek.setHours(0, 0, 0, 0);
    return `week_${startOfWeek.getFullYear()}_${startOfWeek.getMonth() + 1}_${startOfWeek.getDate()}`;
  }, []);

  const weekKey = getCurrentWeekKey();

  // ── Convert API user → Competitor ──────────────────────────────────────────
  const toCompetitor = useCallback((user: XpLeaderboardApiUser): Competitor => {
    const displayName = user.isCurrentUser
      ? initialUserName || user.name || "Bạn"
      : user.name;
    const avatarLetter = displayName.trim().charAt(0).toUpperCase() || "U";

    return {
      id: user.userId,
      name: displayName,
      avatarColor: user.isCurrentUser
        ? "bg-sky-500"
        : AVATAR_COLORS[user.rank % AVATAR_COLORS.length],
      avatarLetter,
      points: user.weeklyXp,
      weeklyXp: user.weeklyXp,
      totalXp: user.totalXp,
      level: user.level,
      rank: user.rank,
      avatarUrl: user.isCurrentUser
        ? initialUserImageSrc || user.avatarUrl
        : user.avatarUrl,
      isCurrentUser: user.isCurrentUser,
      statusEmoji: user.isCurrentUser ? userStatusEmoji : null,
    };
  }, [initialUserName, initialUserImageSrc, userStatusEmoji]);

  // ── Sort leaderboard by tab ────────────────────────────────────────────────
  const getSortedLeaderboard = useCallback(
    (list: Competitor[], tab: SortTab): Competitor[] => {
      return [...list].sort((a, b) => {
        if (tab === "total") {
          const ta = a.totalXp ?? a.points;
          const tb = b.totalXp ?? b.points;
          return tb !== ta ? tb - ta : (b.weeklyXp ?? 0) - (a.weeklyXp ?? 0);
        }
        // weekly (default)
        const wa = a.weeklyXp ?? a.points;
        const wb = b.weeklyXp ?? b.points;
        return wb !== wa ? wb - wa : (b.totalXp ?? 0) - (a.totalXp ?? 0);
      });
    },
    []
  );

  // ── Load Leaderboard ────────────────────────────────────────────────────────
  useEffect(() => {
    let isMounted = true;

    const loadXpLeaderboard = async () => {
      setIsLoadingLeaderboard(true);
      setLeaderboardError(null);

      try {
        const response = await fetch("/api/xp/leaderboard", {
          method: "GET",
          cache: "no-store",
        });

        if (!response.ok) throw new Error("Failed to load XP leaderboard");

        const data = (await response.json()) as XpLeaderboardApiResponse;
        const realUsers = data.users.map(toCompetitor);

        if (!isMounted) return;

        // Ensure current user is included
        const currentUserRow = realUsers.find((u) => u.isCurrentUser);
        if (!currentUserRow && isLoggedIn) {
          realUsers.push({
            id: userId || "current_user",
            name: initialUserName || "Bạn",
            avatarColor: "bg-sky-500",
            avatarLetter: (initialUserName || "U").trim().charAt(0).toUpperCase(),
            points: userPoints,
            weeklyXp: userPoints,
            totalXp: userPoints,
            level: 1,
            isCurrentUser: true,
            statusEmoji: userStatusEmoji,
          });
        }

        setLeaderboard(realUsers);

        if (currentUserRow) {
          setUserPoints(currentUserRow.weeklyXp ?? currentUserRow.points);
        }
      } catch (error) {
        console.error("Failed to load XP leaderboard:", error);
        if (!isMounted) return;

        setLeaderboardError("Không thể tải bảng xếp hạng mới nhất.");

        const fallback: Competitor[] = isLoggedIn
          ? [{
              id: userId || "current_user",
              name: initialUserName || "Bạn",
              avatarColor: "bg-sky-500",
              avatarLetter: (initialUserName || "U").trim().charAt(0).toUpperCase(),
              points: userPoints,
              weeklyXp: userPoints,
              totalXp: userPoints,
              level: 1,
              isCurrentUser: true,
              statusEmoji: userStatusEmoji,
            }]
          : [];

        setLeaderboard(fallback);
      } finally {
        if (isMounted) setIsLoadingLeaderboard(false);
      }
    };

    loadXpLeaderboard();
    return () => { isMounted = false; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeLeagueView, initialUserImageSrc, initialUserName, userStatusEmoji]);

  // ── Weekly Reset ───────────────────────────────────────────────────────────
  const handleWeeklyReset = useCallback(async () => {
    if (typeof window === "undefined") return;

    const resetTriggeredKey = `reset_triggered_${userId}_${weekKey}`;
    if (localStorage.getItem(resetTriggeredKey)) return;

    const sorted = getSortedLeaderboard(leaderboard, "weekly");
    const userRankIndex = sorted.findIndex((c) => c.isCurrentUser);
    const userRank = userRankIndex + 1;

    let newLeague = userLeague;
    let banner: PromotionBanner;

    if (userRank >= 1 && userRank <= 15) {
      if (userLeague < 10) {
        newLeague = userLeague + 1;
        banner = {
          type: "promotion",
          message: `🎉 Chúc mừng! Bạn đứng thứ ${userRank} và được THĂNG HẠNG lên ${LEAGUES[newLeague - 1].name}!`,
        };
      } else {
        banner = {
          type: "safe",
          message: "✨ Tuyệt vời! Bạn bảo vệ thành công danh hiệu Giải đấu Diamond!",
        };
      }
    } else if (userRank >= 26 && userRank <= 30) {
      if (userLeague > 1) {
        newLeague = userLeague - 1;
        banner = {
          type: "demotion",
          message: `😔 Rất tiếc, bạn đứng thứ ${userRank} và bị XUỐNG HẠNG về ${LEAGUES[newLeague - 1].name}. Hãy cố gắng hơn tuần sau!`,
        };
      } else {
        banner = {
          type: "safe",
          message: "Giải đấu tuần này đã kết thúc! Bạn vẫn ở Giải đấu Đồng.",
        };
      }
    } else {
      banner = {
        type: "safe",
        message: `Tuần học kết thúc! Bạn đứng thứ ${userRank} tại Giải đấu ${LEAGUES[userLeague - 1].name}. Tiếp tục phấn đấu!`,
      };
    }

    setPromotionBanner(banner);
    localStorage.setItem(resetTriggeredKey, "true");

    if (newLeague !== userLeague) {
      setUserLeague(newLeague);
      setActiveLeagueView(newLeague as LeagueId);
      try {
        await updateUserLeague(newLeague);
      } catch (err) {
        console.error("Failed to update league in db:", err);
      }
    }
  }, [getSortedLeaderboard, leaderboard, userId, userLeague, weekKey]);

  // ── Countdown ──────────────────────────────────────────────────────────────
  useEffect(() => {
    const getNextSunday10PM = () => {
      const now = new Date();
      const nextSunday = new Date();
      nextSunday.setDate(now.getDate() + (7 - now.getDay()) % 7);
      nextSunday.setHours(22, 0, 0, 0);
      if (now.getTime() > nextSunday.getTime()) {
        nextSunday.setDate(nextSunday.getDate() + 7);
      }
      return nextSunday;
    };

    const targetDate = getNextSunday10PM();
    const interval = setInterval(() => {
      const now = new Date().getTime();
      const difference = targetDate.getTime() - now;

      if (difference <= 0) {
        clearInterval(interval);
        setCountdownText("Giải đấu đã kết thúc!");
        handleWeeklyReset();
      } else {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);

        if (days > 0) {
          setCountdownText(`${days} ngày ${hours} giờ`);
        } else {
          setCountdownText(`${hours}g ${minutes}p ${seconds}s`);
        }
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [handleWeeklyReset]);

  // ── Emoji Picker ──────────────────────────────────────────────────────────
  const handleEmojiSelect = async (emoji: string) => {
    const nextEmoji = userStatusEmoji === emoji ? null : emoji;
    setUserStatusEmoji(nextEmoji);
    setIsEmojiAnimating(true);
    try {
      await updateUserStatusEmoji(nextEmoji);
    } catch (e) {
      console.error("Failed to update status emoji:", e);
    }
    setTimeout(() => setIsEmojiAnimating(false), 600);
  };

  // ── Derived values ─────────────────────────────────────────────────────────
  const activeLeagueDetails = LEAGUES.find((l) => l.id === activeLeagueView) || LEAGUES[0];
  const sortedLeaderboard = getSortedLeaderboard(leaderboard, sortTab);
  const userRankInList = sortedLeaderboard.findIndex((c) => c.isCurrentUser) + 1;

  // Progress toward top-15 threshold
  const rank15User = sortedLeaderboard[14];
  const rank15Xp = rank15User
    ? (sortTab === "total" ? (rank15User.totalXp ?? rank15User.points) : (rank15User.weeklyXp ?? rank15User.points))
    : 0;
  const myXpForSort = sortTab === "total" ? (userPoints) : (userPoints);
  const progressToPromo = rank15Xp > 0
    ? Math.min(100, Math.round((myXpForSort / rank15Xp) * 100))
    : (userRankInList > 0 && userRankInList <= 15 ? 100 : 0);

  const dayNames = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];

  return (
    <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_400px] 2xl:grid-cols-[minmax(0,1fr)_420px] xl:items-start xl:gap-10">

      {/* ── LEFT COLUMN ── */}
      <FeedWrapper>
        <div className="flex flex-col gap-6">

          {/* Promotion / Demotion Banner */}
          {promotionBanner && (
            <div className={cn(
              "relative flex items-start gap-3 rounded-[20px] border-2 p-4 pr-10 text-sm font-bold leading-relaxed shadow-md animate-slide-down",
              promotionBanner.type === "promotion"
                ? "bg-emerald-50 border-emerald-200 text-emerald-800 dark:bg-emerald-950/30 dark:border-emerald-900/50 dark:text-emerald-300"
                : promotionBanner.type === "demotion"
                ? "bg-rose-50 border-rose-200 text-rose-800 dark:bg-rose-950/30 dark:border-rose-900/50 dark:text-rose-300"
                : "bg-sky-50 border-sky-200 text-sky-800 dark:bg-sky-950/30 dark:border-sky-900/50 dark:text-sky-300"
            )}>
              <span className="text-xl shrink-0 mt-0.5">
                {promotionBanner.type === "promotion" ? "🏆" : promotionBanner.type === "demotion" ? "😔" : "✅"}
              </span>
              <span>{promotionBanner.message}</span>
              <button
                onClick={() => setPromotionBanner(null)}
                className="absolute top-3 right-3 text-current opacity-50 hover:opacity-100 transition"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )}

          {/* League Track */}
          <div className="rounded-[28px] border-2 border-slate-200 bg-white px-4 py-5 shadow-sm dark:border-slate-800 dark:bg-slate-900/40 sm:px-5">
            <h2 className="mb-4 text-center text-xs font-black uppercase tracking-[0.18em] text-slate-400 dark:text-slate-500">
              Cấp bậc Giải đấu
            </h2>
            <div className="flex snap-x items-stretch gap-2 overflow-x-auto pb-1 scrollbar-none sm:justify-between sm:gap-3">
              {LEAGUES.map((league) => {
                const isActive = activeLeagueView === league.id;
                const isUserActual = userLeague === league.id;
                const isLocked = league.id > userLeague;

                return (
                  <button
                    key={league.id}
                    type="button"
                    onClick={() => {
                      if (!isLocked) setActiveLeagueView(league.id);
                    }}
                    disabled={isLocked}
                    title={isLocked ? `${league.name} đang khóa` : `Xem giải đấu ${league.name}`}
                    className={cn(
                      "group relative flex min-w-[82px] snap-start flex-col items-center rounded-2xl border border-transparent px-3 py-2.5 transition-all",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-950",
                      isActive
                        ? "border-sky-300 bg-sky-50 text-sky-600 shadow-[0_0_0_1px_rgba(56,189,248,0.22),0_10px_24px_rgba(56,189,248,0.08)] dark:border-sky-400/80 dark:bg-[#1f2d33] dark:text-sky-300 dark:shadow-[0_0_0_1px_rgba(56,189,248,0.32),0_10px_24px_rgba(0,0,0,0.18)]"
                        : "text-slate-400 hover:bg-slate-50 hover:text-slate-600 dark:text-slate-500 dark:hover:bg-slate-900/50 dark:hover:text-slate-300",
                      isLocked && "cursor-not-allowed opacity-70 hover:bg-transparent hover:text-slate-400 dark:hover:text-slate-500"
                    )}
                  >
                    <div className="relative">
                      <LeagueShield
                        leagueId={league.id}
                        size={52}
                        locked={isLocked}
                        className={cn(
                          "drop-shadow-sm transition-transform",
                          isActive && "scale-110 drop-shadow-md",
                          !isActive && !isLocked && "group-hover:scale-105"
                        )}
                      />
                      {isUserActual && (
                        <span
                          className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full border-2 border-white bg-rose-500 text-[8px] font-extrabold text-white ring-1 ring-rose-300 dark:border-slate-950"
                          title="Giải đấu của bạn"
                        >
                          ★
                        </span>
                      )}
                    </div>
                    <span className={cn(
                      "mt-2 block w-full truncate px-1 pb-0.5 text-center text-[11px] font-black leading-tight",
                      isActive ? "text-sky-600 dark:text-sky-300" : "text-current"
                    )}>
                      {league.name}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Active League Board Card */}
          <section className="rounded-[28px] border-2 border-slate-200 bg-white shadow-sm overflow-hidden dark:border-slate-800 dark:bg-slate-900/40">

            {/* Header */}
            <div className="flex flex-col items-center bg-gradient-to-b from-slate-50 to-white px-6 py-8 border-b-2 border-slate-100 text-center relative dark:from-slate-950/20 dark:to-slate-900/20 dark:border-slate-800/80">
              <button
                onClick={() => setShowLeagueInfo(!showLeagueInfo)}
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1.5 hover:bg-slate-100 dark:text-slate-500 dark:hover:text-slate-300 dark:hover:bg-slate-800 rounded-full transition"
                title="Thông tin giải đấu"
              >
                <Info className="h-5 w-5" />
              </button>

              <LeagueShield leagueId={activeLeagueView} size={86} className="drop-shadow-lg" />

              <h1 className="mt-4 text-3xl font-black text-slate-800 dark:text-slate-100 tracking-tight">
                Giải đấu {activeLeagueDetails.name}
              </h1>

              <p className="mt-2 text-sm font-bold text-slate-500 dark:text-slate-400 max-w-md leading-relaxed">
                {activeLeagueView === 10
                  ? "Cạnh tranh để bảo vệ danh hiệu và vinh danh trên Bảng vàng cao nhất!"
                  : "Top 15 sẽ được thăng hạng lên giải đấu kế tiếp!"}
              </p>

              {/* Timer + Rank chip */}
              <div className="mt-4 flex flex-wrap justify-center items-center gap-x-3 gap-y-2 text-xs font-black uppercase tracking-wide">
                <span className="flex items-center gap-1 text-amber-500 bg-amber-50 border border-amber-100 dark:bg-amber-950/20 dark:border-amber-950/40 dark:text-amber-400 px-3 py-1.5 rounded-2xl">
                  <Clock className="h-4 w-4 stroke-[3]" />
                  Còn {countdownText}
                </span>

                {isLoggedIn && userLeague === activeLeagueView && userRankInList > 0 && (
                  <span className={cn(
                    "flex items-center gap-1 px-3 py-1.5 rounded-2xl border",
                    userRankInList <= 15
                      ? "text-emerald-600 bg-emerald-50 border-emerald-100 dark:text-emerald-400 dark:bg-emerald-950/20 dark:border-emerald-950/40"
                      : userRankInList <= 25
                      ? "text-slate-500 bg-slate-50 border-slate-100 dark:text-slate-400 dark:bg-slate-900/30 dark:border-slate-800"
                      : "text-rose-500 bg-rose-50 border-rose-100 dark:text-rose-400 dark:bg-rose-950/20 dark:border-rose-950/40"
                  )}>
                    <Trophy className="h-3.5 w-3.5 stroke-[3]" />
                    Thứ {userRankInList}/{sortedLeaderboard.length}
                  </span>
                )}
              </div>

              {/* Week Progress Dots */}
              <div className="mt-4 flex items-center gap-1.5">
                {dayNames.map((day, idx) => (
                  <div key={day} className="flex flex-col items-center gap-1">
                    <div className={cn(
                      "h-2 w-2 rounded-full transition-all",
                      idx < initialCurrentDayIndex
                        ? "bg-emerald-400 dark:bg-emerald-500"
                        : idx === initialCurrentDayIndex
                        ? "bg-sky-400 dark:bg-sky-500 ring-2 ring-sky-200 dark:ring-sky-800 scale-125"
                        : "bg-slate-200 dark:bg-slate-700"
                    )} />
                    <span className={cn(
                      "text-[9px] font-black",
                      idx === initialCurrentDayIndex ? "text-sky-500" : "text-slate-400 dark:text-slate-600"
                    )}>
                      {day}
                    </span>
                  </div>
                ))}
              </div>

              {/* Collapsible Info */}
              {showLeagueInfo && (
                <div className="mt-6 w-full text-left bg-sky-50 border-2 border-sky-100 rounded-2xl p-4 text-xs font-bold leading-relaxed text-sky-800 dark:bg-sky-950/20 dark:border-sky-950/40 dark:text-sky-400">
                  <h3 className="text-sm font-black mb-1 flex items-center gap-1.5 text-sky-950 dark:text-sky-300">
                    <Sparkles className="h-4 w-4" /> Quy tắc Bảng xếp hạng:
                  </h3>
                  <ul className="list-disc pl-5 space-y-1 mt-1 text-sky-900 dark:text-sky-400/80">
                    <li>Mỗi bảng đấu gồm tối đa 30 học viên có trình độ tương đương.</li>
                    <li>Giải đấu diễn ra hàng tuần, kết thúc lúc 22:00 tối Chủ Nhật.</li>
                    <li><strong className="text-sky-950 dark:text-sky-300">Top 15</strong> dẫn đầu sẽ được thăng hạng lên giải đấu kế tiếp.</li>
                    {activeLeagueView > 1 && (
                      <li><strong className="text-rose-700 dark:text-rose-400">5 người cuối (Thứ 26–30)</strong> sẽ bị xuống hạng.</li>
                    )}
                    <li>Kiếm XP từ các bài học để leo hạng!</li>
                  </ul>
                </div>
              )}
            </div>

            {/* Sort Tabs */}
            <div className="flex border-b-2 border-slate-100 dark:border-slate-800">
              {(["weekly", "total"] as SortTab[]).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setSortTab(tab)}
                  className={cn(
                    "flex-1 py-3 text-xs font-black uppercase tracking-wider transition-all border-b-2 -mb-0.5",
                    sortTab === tab
                      ? "border-sky-500 text-sky-600 dark:text-sky-400 bg-sky-50/60 dark:bg-sky-950/20"
                      : "border-transparent text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900/20"
                  )}
                >
                  {tab === "weekly" ? "🗓️ Tuần này" : "⭐ Tổng XP"}
                </button>
              ))}
            </div>

            {/* Personal Progress Bar (only when in user's league) */}
            {isLoggedIn && activeLeagueView === userLeague && !isLoadingLeaderboard && sortedLeaderboard.length > 0 && (
              <div className="px-5 pt-4 pb-2">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[11px] font-black uppercase tracking-wide text-slate-400 dark:text-slate-500 flex items-center gap-1">
                    <TrendingUp className="h-3.5 w-3.5" />
                    Tiến độ vào Top 15
                  </span>
                  <span className="text-[11px] font-black text-slate-500 dark:text-slate-400">
                    {progressToPromo}%
                  </span>
                </div>
                <div className="h-2 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                  <div
                    className={cn(
                      "h-full rounded-full transition-all duration-700",
                      progressToPromo >= 100
                        ? "bg-gradient-to-r from-emerald-400 to-emerald-500"
                        : progressToPromo >= 60
                        ? "bg-gradient-to-r from-sky-400 to-sky-500"
                        : "bg-gradient-to-r from-amber-400 to-amber-500"
                    )}
                    style={{ width: `${progressToPromo}%` }}
                  />
                </div>
                {rank15Xp > 0 && myXpForSort < rank15Xp && (
                  <p className="mt-1 text-[10px] font-bold text-slate-400 dark:text-slate-500">
                    Cần thêm <span className="text-sky-500 font-black">{rank15Xp - myXpForSort} XP</span> để vào khu vực thăng hạng
                  </p>
                )}
              </div>
            )}

            {/* Leaderboard List */}
            <div className="divide-y divide-slate-100 px-2 py-2 dark:divide-slate-800">

              {/* Loading Skeleton */}
              {isLoadingLeaderboard && (
                <div className="space-y-0">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <SkeletonRow key={i} />
                  ))}
                </div>
              )}

              {/* Error Notice */}
              {leaderboardError && !isLoadingLeaderboard && (
                <div className="m-3 rounded-2xl border-2 border-amber-100 bg-amber-50 p-3 text-center text-xs font-bold text-amber-700 dark:border-amber-950/40 dark:bg-amber-950/20 dark:text-amber-400">
                  ⚠️ {leaderboardError}
                </div>
              )}

              {/* Locked league preview notice */}
              {activeLeagueView > userLeague && !isLoadingLeaderboard && (
                <div className="m-4 bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl p-5 text-center dark:bg-slate-900/30 dark:border-slate-800">
                  <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-slate-200 dark:bg-slate-800 text-slate-500 mb-2">
                    <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <h3 className="text-sm font-extrabold text-slate-700 dark:text-slate-300">Giải đấu đang bị khóa</h3>
                  <p className="mt-1 text-xs font-bold text-slate-400 dark:text-slate-500">
                    Bạn cần thăng hạng lên {activeLeagueDetails.name} để tranh tài ở đây.
                  </p>
                  <p className="mt-3 text-xs font-black text-sky-500 uppercase tracking-wider">Chưa mở danh sách giải đấu này</p>
                </div>
              )}

              {/* Empty State */}
              {!isLoadingLeaderboard && sortedLeaderboard.length === 0 && (
                <div className="py-12 text-center">
                  <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 mb-4">
                    <Trophy className="h-8 w-8 text-slate-400" />
                  </div>
                  <h3 className="text-base font-extrabold text-slate-600 dark:text-slate-300">Chưa có ai ở đây</h3>
                  <p className="mt-1 text-sm font-bold text-slate-400 dark:text-slate-500">
                    Hãy là người đầu tiên kiếm XP tuần này!
                  </p>
                </div>
              )}

              {/* Promo zone header */}
              {!isLoadingLeaderboard && sortedLeaderboard.length > 0 && (
                <div className="py-2 px-4 flex items-center gap-2 bg-emerald-50/60 text-[10px] font-black uppercase tracking-wider text-emerald-600 select-none dark:bg-emerald-950/10 dark:text-emerald-500">
                  <ChevronUp className="h-4 w-4 text-emerald-500 stroke-[3]" />
                  Khu vực thăng hạng — Top 15
                </div>
              )}

              {/* Competitor Rows */}
              {!isLoadingLeaderboard && sortedLeaderboard.map((competitor, index) => {
                const rank = index + 1;
                const isUser = competitor.isCurrentUser && activeLeagueView === userLeague;
                const isPromoZone = rank <= 15;
                const isSafeZone = rank > 15 && rank <= 25;
                const isDemoZone = rank > 25;

                const xpToDisplay = sortTab === "total"
                  ? (competitor.totalXp ?? competitor.points)
                  : (competitor.weeklyXp ?? competitor.points);

                // Podium styling for top 3
                const isPodiumGold = rank === 1;
                const isPodiumSilver = rank === 2;
                const isPodiumBronze = rank === 3;

                return (
                  <React.Fragment key={competitor.id}>
                    {/* Safe Zone Separator */}
                    {rank === 16 && (
                      <div className="py-2 px-4 flex items-center gap-2 bg-slate-50 text-[10px] font-black uppercase tracking-wider text-slate-400 select-none dark:bg-slate-900/20 dark:text-slate-500">
                        Khu vực an toàn
                      </div>
                    )}

                    {/* Demo Zone Separator */}
                    {rank === 26 && activeLeagueView > 1 && (
                      <div className="py-2 px-4 flex items-center gap-2 bg-rose-50 text-[10px] font-black uppercase tracking-wider text-rose-500 select-none border-y border-dashed border-rose-100 dark:bg-rose-950/10 dark:border-rose-950/30 dark:text-rose-400">
                        <ChevronDown className="h-4 w-4 text-rose-500 stroke-[3]" />
                        Khu vực xuống hạng — Dưới top 25
                      </div>
                    )}

                    {/* Row */}
                    <div className={cn(
                      "flex items-center justify-between px-3 py-3 rounded-2xl transition-all duration-200 border-2 my-0.5",
                      isUser
                        ? "bg-sky-50/70 border-sky-300 dark:bg-sky-950/20 dark:border-sky-800 shadow-[0_4px_12px_rgba(14,165,233,0.1)] scale-[1.01] z-10"
                        : isPodiumGold
                        ? "bg-yellow-50/60 border-yellow-200 dark:bg-yellow-950/10 dark:border-yellow-900/40"
                        : isPodiumSilver
                        ? "bg-slate-50/80 border-slate-200 dark:bg-slate-900/20 dark:border-slate-700"
                        : isPodiumBronze
                        ? "bg-orange-50/60 border-orange-100 dark:bg-orange-950/10 dark:border-orange-900/30"
                        : "border-transparent hover:bg-slate-50/80 dark:hover:bg-slate-900/20"
                    )}>
                      {/* Rank Badge */}
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center font-black">
                        {rank === 1 ? (
                          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-yellow-400 text-xs font-black text-white border-2 border-yellow-200 ring-2 ring-yellow-500/50 shadow-sm">
                            1
                          </span>
                        ) : rank === 2 ? (
                          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-300 text-xs font-black text-white border-2 border-slate-100 ring-2 ring-slate-400/40 shadow-sm">
                            2
                          </span>
                        ) : rank === 3 ? (
                          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-amber-600 text-xs font-black text-white border-2 border-amber-500 ring-2 ring-amber-700/40 shadow-sm">
                            3
                          </span>
                        ) : (
                          <span className={cn(
                            "text-base",
                            isPromoZone && "text-emerald-600 dark:text-emerald-400 font-extrabold",
                            isSafeZone && "text-slate-400",
                            isDemoZone && activeLeagueView > 1 && "text-rose-400 dark:text-rose-400"
                          )}>
                            {rank}
                          </span>
                        )}
                      </div>

                      {/* Avatar */}
                      <div className="relative h-12 w-12 shrink-0 mx-0.5">
                        {competitor.avatarUrl ? (
                          <div className={cn(
                            "h-12 w-12 rounded-full overflow-hidden border-2 bg-slate-100 dark:bg-slate-900 relative shadow-inner",
                            isUser ? "border-sky-300 dark:border-sky-800" :
                            isPodiumGold ? "border-yellow-400" :
                            isPodiumSilver ? "border-slate-300" :
                            isPodiumBronze ? "border-amber-500" :
                            "border-slate-200 dark:border-slate-700"
                          )}>
                            <Image
                              src={competitor.avatarUrl}
                              alt={competitor.name}
                              fill
                              sizes="48px"
                              className="object-contain p-1"
                            />
                          </div>
                        ) : (
                          <div className={cn(
                            "h-12 w-12 rounded-full flex items-center justify-center text-lg font-black text-white shadow-inner uppercase border-2",
                            competitor.avatarColor,
                            isPodiumGold ? "border-yellow-300" :
                            isPodiumSilver ? "border-slate-200" :
                            isPodiumBronze ? "border-amber-400" :
                            "border-transparent"
                          )}>
                            {competitor.avatarLetter}
                          </div>
                        )}

                        {/* Online dot */}
                        {competitor.avatarUrl && (
                          <span className="absolute bottom-0 right-0 block h-3 w-3 rounded-full bg-green-500 border-2 border-white dark:border-slate-900 ring-1 ring-green-300" />
                        )}

                        {/* Status Emoji */}
                        {competitor.statusEmoji && (
                          <div className={cn(
                            "absolute -top-1.5 -right-1.5 h-6 w-6 rounded-full bg-white border border-slate-200 dark:bg-slate-950 dark:border-slate-800 flex items-center justify-center text-xs shadow-sm cursor-default select-none transition-transform",
                            isUser && isEmojiAnimating && "scale-125 duration-100"
                          )}>
                            {competitor.statusEmoji}
                          </div>
                        )}

                        {/* Podium crown for #1 */}
                        {isPodiumGold && (
                          <div className="absolute -top-3 left-1/2 -translate-x-1/2 text-base select-none">👑</div>
                        )}
                      </div>

                      {/* Name + Info */}
                      <div className="min-w-0 flex-1 ml-2">
                        <span className={cn(
                          "block truncate text-sm font-bold",
                          isUser
                            ? "text-sky-800 dark:text-sky-400 font-black"
                            : isPodiumGold
                            ? "text-yellow-700 dark:text-yellow-400 font-extrabold"
                            : "text-slate-700 dark:text-slate-200"
                        )}>
                          {competitor.name}
                          {isUser && <span className="text-[10px] font-black text-sky-500 uppercase ml-1">(Bạn)</span>}
                        </span>
                        <span className="mt-0.5 block truncate text-[11px] font-black uppercase tracking-wide text-slate-400 dark:text-slate-500">
                          Lv {competitor.level ?? 1}
                          {sortTab === "weekly" && competitor.totalXp != null && ` · Tổng ${competitor.totalXp} XP`}
                          {sortTab === "total" && competitor.weeklyXp != null && ` · Tuần ${competitor.weeklyXp} XP`}
                        </span>
                      </div>

                      {/* XP Score */}
                      <div className="text-right shrink-0 ml-2">
                        <span className={cn(
                          "block text-base font-black tracking-tight",
                          isUser
                            ? "text-sky-600 dark:text-sky-400"
                            : isPodiumGold
                            ? "text-yellow-600 dark:text-yellow-400"
                            : "text-slate-500 dark:text-slate-300"
                        )}>
                          {xpToDisplay} <span className="text-[11px] font-bold uppercase">XP</span>
                        </span>
                        <span className="text-[10px] font-black uppercase tracking-wide text-slate-400 dark:text-slate-500">
                          {sortTab === "weekly" ? "Tuần này" : "Tổng XP"}
                        </span>
                      </div>
                    </div>
                  </React.Fragment>
                );
              })}

              {/* Padding bottom */}
              {!isLoadingLeaderboard && <div className="h-2" />}
            </div>
          </section>
        </div>
      </FeedWrapper>

      {/* ── RIGHT COLUMN ── */}
      <StickyWrapper>

        {/* User Stats Card */}
        <div className="rounded-[24px] border-2 border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900/40">
          <UserProgress
            activeCourse={activeCourse}
            hearts={hearts}
            points={userPoints}
          />
        </div>

        {/* My Leaderboard Stats */}
        {isLoggedIn && (
          <div className="rounded-[24px] border-2 border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900/40">
            <h3 className="text-base font-black text-slate-700 dark:text-slate-100 mb-3 flex items-center gap-2">
              <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
              Thống kê của bạn
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-2xl bg-sky-50 dark:bg-sky-950/20 border border-sky-100 dark:border-sky-950/40 p-3 text-center">
                <div className="text-2xl font-black text-sky-600 dark:text-sky-400">{userRankInList > 0 ? `#${userRankInList}` : "—"}</div>
                <div className="text-[10px] font-black uppercase tracking-wide text-sky-500/80 dark:text-sky-500 mt-0.5">Thứ hạng</div>
              </div>
              <div className="rounded-2xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-950/40 p-3 text-center">
                <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400">{userPoints}</div>
                <div className="text-[10px] font-black uppercase tracking-wide text-emerald-500/80 dark:text-emerald-500 mt-0.5">XP tuần</div>
              </div>
              <div className="rounded-2xl bg-amber-50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-950/40 p-3 text-center">
                <div className="text-2xl font-black text-amber-600 dark:text-amber-400">{LEAGUES[userLeague - 1]?.name ?? "Đồng"}</div>
                <div className="text-[10px] font-black uppercase tracking-wide text-amber-500/80 dark:text-amber-500 mt-0.5">Giải đấu</div>
              </div>
              <div className="rounded-2xl bg-purple-50 dark:bg-purple-950/20 border border-purple-100 dark:border-purple-950/40 p-3 text-center">
                <div className="text-2xl font-black text-purple-600 dark:text-purple-400">{todayMinutes}p</div>
                <div className="text-[10px] font-black uppercase tracking-wide text-purple-500/80 dark:text-purple-500 mt-0.5">Hôm nay</div>
              </div>
            </div>
          </div>
        )}

        {/* Emoji Status Picker */}
        <div className="rounded-[24px] border-2 border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900/40">
          <h3 className="text-lg font-black text-slate-700 dark:text-slate-100">Đặt biểu tượng trạng thái</h3>
          <p className="mt-1 text-xs font-bold text-slate-400 dark:text-slate-500 leading-normal">
            Chọn emoji để hiển thị trên bảng xếp hạng tuần này.
          </p>

          {/* Preview */}
          <div className="my-5 flex justify-center">
            <div className="relative p-2.5">
              <div className="h-20 w-20 rounded-full border-2 border-dashed border-sky-300 flex items-center justify-center bg-slate-50 dark:border-sky-950 dark:bg-slate-950 relative p-1 shadow-inner select-none">
                <Image
                  src={resolveUserAvatar(initialUserImageSrc)}
                  alt="Avatar"
                  width={60}
                  height={60}
                  className="object-contain p-1"
                />
              </div>
              <div
                ref={emojiBubbleRef}
                className={cn(
                  "absolute -top-1 -right-1 h-8 w-8 rounded-full bg-white border-2 border-sky-400 dark:bg-slate-950 dark:border-sky-600 flex items-center justify-center text-lg shadow-md font-bold transition-transform cursor-default select-none",
                  isEmojiAnimating ? "animate-bounce scale-110" : ""
                )}
                title="Trạng thái hiện tại"
              >
                {userStatusEmoji || "💬"}
              </div>
            </div>
          </div>

          {/* Grid */}
          <div className="grid grid-cols-6 gap-2">
            {STATUS_EMOJIS.map((emoji) => {
              const isSelected = userStatusEmoji === emoji;
              return (
                <button
                  key={emoji}
                  onClick={() => handleEmojiSelect(emoji)}
                  className={cn(
                    "h-10 w-10 text-lg rounded-xl flex items-center justify-center transition-all border-2 border-slate-100 hover:border-sky-300 hover:scale-105 active:scale-95 dark:border-slate-800 dark:hover:border-sky-600",
                    isSelected
                      ? "bg-sky-100 dark:bg-sky-950 border-sky-400 shadow-[0_2px_8px_rgba(14,165,233,0.15)] text-xl"
                      : "bg-slate-50 dark:bg-slate-900/50 hover:bg-white dark:hover:bg-slate-950"
                  )}
                >
                  {emoji}
                </button>
              );
            })}
          </div>

          {userStatusEmoji && (
            <button
              onClick={() => handleEmojiSelect(userStatusEmoji)}
              className="mt-4 w-full h-10 rounded-2xl border-2 border-slate-200 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-900/30 text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider transition-all"
            >
              Gỡ bỏ trạng thái
            </button>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 text-center">
          <div className="flex flex-wrap justify-center gap-x-2 gap-y-1 text-[10px] font-black uppercase tracking-wide text-slate-400 dark:text-slate-600 select-none">
            <Link href="/about" className="hover:text-slate-500">Giới thiệu</Link>
            <span>·</span>
            <Link href="/shop" className="hover:text-slate-500">Cửa hàng</Link>
            <span>·</span>
            <Link href="/terms" className="hover:text-slate-500">Điều khoản</Link>
            <span>·</span>
            <Link href="/privacy" className="hover:text-slate-500">Bảo mật</Link>
          </div>
          <p className="mt-3 text-[10px] font-bold text-slate-400 dark:text-slate-600 select-none">
            © 2026 Robogo Language Learning
          </p>
        </div>

      </StickyWrapper>
    </div>
  );
};
