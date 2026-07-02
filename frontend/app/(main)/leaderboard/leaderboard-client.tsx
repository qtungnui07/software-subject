"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { 
  Trophy, 
  ChevronUp, 
  ChevronDown, 
  Clock, 
  Sparkles, 
  Info, 
  Flame,
  Heart,
  CircleCheck,
  UserCheck
} from "lucide-react";
import { cn } from "@/lib/utils";
import { FeedWrapper } from "@/components/feed-wrapper";
import { StickyWrapper } from "@/components/sticky-wrapper";
import { Button } from "@/components/ui/button";
import { LeagueShield, LEAGUES, LeagueId } from "@/components/league-shield";
import { updateUserLeague, updateUserStatusEmoji } from "@/actions/user-progress";

// Constants for emoji grid
const STATUS_EMOJIS = [
  "🕶️", "🎉", "💪", "👀", "🍿", "🇺🇸",
  "🦉", "💯", "💩", "🏆", "🧺", "🐱"
];

// Mock names list for generating competitors
const MOCK_NAMES = [
  "lập", "Sita Shrivastava", "Badawi Gomaa", "Jabir Hammoud", 
  "Đinh Yên Đan", "heman rajrana", "Di Thiên", "davis", "Alex Mercer",
  "Yuki Tanaka", "Minh Khang", "Sophia Martinez", "Sarah Connor",
  "Ahmad Khan", "Gia Bảo", "Emily Smith", "Nguyễn Hải Yến", 
  "Carlos Lopez", "Tường Vy", "John Doe", "Amélie Laurent",
  "Hans Schmidt", "Trần Kiều Anh", "Hoàng Nam", "Phan Tuấn",
  "Kiều Trang", "David Beckham", "Dmitry Petrov", "Helena"
];

const AVATAR_COLORS = [
  "bg-purple-500", "bg-emerald-500", "bg-blue-500", "bg-cyan-500",
  "bg-amber-500", "bg-rose-500", "bg-indigo-500", "bg-orange-500",
  "bg-pink-500", "bg-teal-500"
];

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

interface LeaderboardClientProps {
  userId: string;
  initialUserName: string;
  initialUserImageSrc: string;
  initialPoints: number;
  initialLeague: number; // 1 to 10
  initialStatusEmoji: string | null;
  hearts: number;
  activeCourse: { title: string; imageSrc: string };
  todayMinutes: number;
  isLoggedIn?: boolean;
}

export const LeaderboardClient: React.FC<LeaderboardClientProps> = ({
  userId,
  initialUserName,
  initialUserImageSrc,
  initialPoints,
  initialLeague,
  initialStatusEmoji,
  hearts,
  activeCourse,
  todayMinutes,
  isLoggedIn = false,
}) => {
  // Client state
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

  // Reference to track emoji selection animation
  const emojiBubbleRef = useRef<HTMLDivElement>(null);

  // 1. Get current week string to seed / key localStorage
  const getCurrentWeekKey = () => {
    const d = new Date();
    // Sunday is 0. Calculate diff to previous Monday or Sunday.
    // Duolingo weeks run from Sunday to Sunday
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
    const startOfWeek = new Date(d.setDate(diff));
    startOfWeek.setHours(0, 0, 0, 0);
    return `week_${startOfWeek.getFullYear()}_${startOfWeek.getMonth() + 1}_${startOfWeek.getDate()}`;
  };

  const weekKey = getCurrentWeekKey();

  // 2. Generate or Load Competitors
  const loadLeaderboardData = (leagueId: number, currentPoints: number) => {
    if (typeof window === "undefined") return [];

    if (currentPoints === 0) {
      return [];
    }

    return [{
      id: "current_user",
      name: initialUserName || "Bạn",
      avatarColor: "bg-sky-500",
      avatarLetter: (initialUserName || "U").trim().charAt(0).toUpperCase(),
      points: currentPoints,
      isCurrentUser: true,
      statusEmoji: userStatusEmoji,
    }];
  };

  // Sync leaderboard from XP API. If the API fails, keep the old local fallback.
  useEffect(() => {
    let isMounted = true;

    const toCompetitor = (user: XpLeaderboardApiUser): Competitor => {
      const displayName = user.isCurrentUser
        ? initialUserName || user.name || "Bạn"
        : user.name;
      const avatarLetter = displayName.trim().charAt(0).toUpperCase() || "U";

      return {
        id: user.userId,
        name: displayName,
        avatarColor: user.isCurrentUser ? "bg-sky-500" : AVATAR_COLORS[user.rank % AVATAR_COLORS.length],
        avatarLetter,
        points: user.weeklyXp,
        weeklyXp: user.weeklyXp,
        totalXp: user.totalXp,
        level: user.level,
        rank: user.rank,
        avatarUrl: user.isCurrentUser ? initialUserImageSrc || user.avatarUrl : user.avatarUrl,
        isCurrentUser: user.isCurrentUser,
        statusEmoji: user.isCurrentUser ? userStatusEmoji : null,
      };
    };

    const loadXpLeaderboard = async () => {
      setIsLoadingLeaderboard(true);
      setLeaderboardError(null);

      try {
        const response = await fetch("/api/xp/leaderboard", {
          method: "GET",
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error("Failed to load XP leaderboard");
        }

        const data = (await response.json()) as XpLeaderboardApiResponse;
        const nextLeaderboard = data.users.map(toCompetitor);

        if (!isMounted) return;

        setLeaderboard(nextLeaderboard);
        const currentUserRow = nextLeaderboard.find((user) => user.isCurrentUser);

        if (currentUserRow) {
          setUserPoints(currentUserRow.weeklyXp ?? currentUserRow.points);
        }
      } catch (error) {
        console.error("Failed to load XP leaderboard:", error);

        if (!isMounted) return;

        setLeaderboardError("Chưa thể tải bảng xếp hạng XP mới nhất. Đang dùng dữ liệu dự phòng.");
        setLeaderboard(loadLeaderboardData(activeLeagueView, userPoints));
      } finally {
        if (isMounted) {
          setIsLoadingLeaderboard(false);
        }
      }
    };

    loadXpLeaderboard();

    return () => {
      isMounted = false;
    };
  }, [activeLeagueView, initialUserImageSrc, initialUserName, userStatusEmoji]);

  // Sync point updates from DB (e.g. if the user gains points during their session)
  useEffect(() => {
    setUserPoints(initialPoints);
  }, [initialPoints]);

  // 3. Countdown Timer
  useEffect(() => {
    const getNextSunday10PM = () => {
      const now = new Date();
      const nextSunday = new Date();
      nextSunday.setDate(now.getDate() + (7 - now.getDay()) % 7);
      nextSunday.setHours(22, 0, 0, 0); // 10:00 PM

      // If Sunday is today but already past 10 PM, go to next Sunday
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
        // Weekly Reset Trigger
        handleWeeklyReset();
      } else {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);

        if (days > 0) {
          setCountdownText(`${days} ngày ${hours} giờ`);
        } else {
          setCountdownText(`${hours} giờ ${minutes} phút ${seconds} giây`);
        }
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [userLeague]);

  // 4. Handle Weekly Reset & Promotion/Demotion Logic
  const handleWeeklyReset = async () => {
    if (typeof window === "undefined") return;

    const resetTriggeredKey = `reset_triggered_${userId}_${weekKey}`;
    if (localStorage.getItem(resetTriggeredKey)) return; // already processed for this week

    // Fetch the leaderboard for the user's actual league to evaluate rank
    const activeList = loadLeaderboardData(userLeague, userPoints);
    const userRankIndex = activeList.findIndex((c) => c.isCurrentUser);
    const userRank = userRankIndex + 1;

    let newLeague = userLeague;
    let message = "";

    if (userRank >= 1 && userRank <= 15) {
      if (userLeague < 10) {
        newLeague = userLeague + 1;
        message = `Chúc mừng! Bạn đã đứng thứ ${userRank} và được THĂNG HẠNG lên Giải đấu ${LEAGUES[newLeague - 1].name}!`;
      } else {
        message = "Tuyệt vời! Bạn đã bảo vệ thành công vị trí tại Giải đấu Kim cương cao nhất!";
      }
    } else if (userRank >= 26 && userRank <= 30) {
      if (userLeague > 1) {
        newLeague = userLeague - 1;
        message = `Rất tiếc, do đứng thứ ${userRank}, bạn đã bị XUỐNG HẠNG về Giải đấu ${LEAGUES[newLeague - 1].name}. Hãy nỗ lực hơn tuần sau nhé!`;
      } else {
        message = "Giải đấu tuần này đã kết thúc! Bạn vẫn ở Giải đấu Đồng.";
      }
    } else {
      message = `Tuần học kết thúc! Bạn đứng thứ ${userRank} và tiếp tục thi đấu tại Giải đấu ${LEAGUES[userLeague - 1].name} tuần tới.`;
    }

    alert(message);
    localStorage.setItem(resetTriggeredKey, "true");

    if (newLeague !== userLeague) {
      setUserLeague(newLeague);
      setActiveLeagueView(newLeague as LeagueId);
      // Persist to database
      try {
        await updateUserLeague(newLeague);
      } catch (err) {
        console.error("Failed to update league in db:", err);
      }
    }
  };

  // 5. Status Emoji Changer
  const handleEmojiSelect = async (emoji: string) => {
    // If the emoji is already selected, unselect it (toggle behaviour)
    const nextEmoji = userStatusEmoji === emoji ? null : emoji;
    setUserStatusEmoji(nextEmoji);
    setIsEmojiAnimating(true);

    // Call server action to save status emoji in DB
    try {
      await updateUserStatusEmoji(nextEmoji);
    } catch (e) {
      console.error("Failed to update status emoji in database:", e);
    }

    // Trigger bounce animation
    setTimeout(() => {
      setIsEmojiAnimating(false);
    }, 600);
  };

  // 6. Find current user rank details
  const activeLeagueDetails = LEAGUES.find((l) => l.id === activeLeagueView) || LEAGUES[0];
  const userRankInList = leaderboard.findIndex((c) => c.isCurrentUser) + 1;
  const userScore = userPoints;

  return (
    <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_400px] 2xl:grid-cols-[minmax(0,1fr)_420px] xl:items-start xl:gap-10">
      
      {/* LEFT COLUMN: Leaderboard list & selectors */}
      <FeedWrapper>
        <div className="flex flex-col gap-6">
          
          {/* League Track (Horizontal view of all 10 leagues) */}
          <div className="rounded-[28px] border-2 border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="mb-4 text-center text-xs font-black uppercase tracking-wider text-slate-400">
              Cấp bậc Giải đấu (Liên minh)
            </h2>
            <div className="flex items-center justify-between gap-1 overflow-x-auto pb-2 scrollbar-none">
              {LEAGUES.map((league) => {
                const isActive = activeLeagueView === league.id;
                const isUserActual = userLeague === league.id;
                const isLocked = league.id > userLeague;

                return (
                  <div key={league.id} className="flex flex-col items-center shrink-0 min-w-[56px] relative">
                    <LeagueShield
                      leagueId={league.id}
                      size={48}
                      locked={isLocked}
                      onClick={() => setActiveLeagueView(league.id)}
                      className={cn(
                        "rounded-full p-1 transition-all",
                        isActive && "ring-4 ring-sky-300 ring-offset-2 scale-110",
                        !isActive && !isLocked && "opacity-80 hover:opacity-100"
                      )}
                    />
                    <span 
                      className={cn(
                        "mt-1.5 text-[10px] font-black tracking-tighter truncate w-14 text-center leading-none",
                        isActive ? "text-sky-600 font-extrabold" : "text-slate-400"
                      )}
                    >
                      {league.name}
                    </span>
                    {/* Small dot indicating the user's current league */}
                    {isUserActual && (
                      <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[8px] font-extrabold text-white border-2 border-white ring-1 ring-rose-300" title="Giải đấu của bạn">
                        ★
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Active League Board Card */}
          <section className="rounded-[28px] border-2 border-slate-200 bg-white shadow-sm overflow-hidden">
            
            {/* Header Area */}
            <div className="flex flex-col items-center bg-gradient-to-b from-slate-50 to-white px-6 py-8 border-b-2 border-slate-100 text-center relative">
              <button 
                onClick={() => setShowLeagueInfo(!showLeagueInfo)}
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1.5 hover:bg-slate-100 rounded-full transition"
                title="Thông tin giải đấu"
              >
                <Info className="h-5 w-5" />
              </button>

              <LeagueShield 
                leagueId={activeLeagueView} 
                size={86} 
                className="drop-shadow-lg animate-fade-in"
              />

              <h1 className="mt-4 text-3xl font-black text-slate-800 tracking-tight">
                Giải đấu {activeLeagueDetails.name}
              </h1>

              {/* Status Message / Info */}
              <p className="mt-2 text-sm font-bold text-slate-500 max-w-md leading-relaxed">
                {activeLeagueView === 10
                  ? "Cạnh tranh để bảo vệ danh hiệu và vinh danh trên Bảng vàng giải đấu cao nhất!"
                  : `Bạn sẽ được thăng hạng giải đấu khi lọt top 15`
                }
              </p>

              {/* Timer & User Position overview */}
              <div className="mt-4 flex flex-wrap justify-center items-center gap-x-4 gap-y-2 text-xs font-black uppercase tracking-wide">
                <span className="flex items-center gap-1 text-amber-500 bg-amber-50 border border-amber-100 px-3 py-1.5 rounded-2xl">
                  <Clock className="h-4 w-4 stroke-[3]" />
                  Còn {countdownText}
                </span>

                {isLoggedIn && userLeague === activeLeagueView && (
                  <span className={cn(
                    "flex items-center gap-1 px-3 py-1.5 rounded-2xl border",
                    userRankInList <= 15 
                      ? "text-emerald-600 bg-emerald-50 border-emerald-100" 
                      : "text-slate-500 bg-slate-50 border-slate-100"
                  )}>
                    Thứ hạng: {userRankInList}/{leaderboard.length}
                  </span>
                )}
              </div>

              {/* Collapsible Info Drawer */}
              {showLeagueInfo && (
                <div className="mt-6 w-full text-left bg-sky-50 border-2 border-sky-100 rounded-2xl p-4 text-xs font-bold leading-relaxed text-sky-800 animate-slide-down">
                  <h3 className="text-sm font-black mb-1 flex items-center gap-1.5 text-sky-950">
                    <Sparkles className="h-4 w-4" /> Quy tắc của Bảng xếp hạng:
                  </h3>
                  <ul className="list-disc pl-5 space-y-1 mt-1 text-sky-900">
                    <li>Mỗi bảng đấu bao gồm 30 học viên ngẫu nhiên có trình độ tương đương.</li>
                    <li>Giải đấu diễn ra hàng tuần từ Thứ Hai và kết thúc lúc 22:00 tối Chủ Nhật.</li>
                    <li><strong className="text-sky-950">Top 15</strong> dẫn đầu sẽ được thăng hạng lên giải đấu kế tiếp.</li>
                    {activeLeagueView > 1 && (
                      <li><strong className="text-rose-700">Top 5 dưới cùng (Thứ 26-30)</strong> sẽ bị rớt xuống giải đấu thấp hơn.</li>
                    )}
                    <li>Kiếm XP tuần này từ các bài học để leo hạng!</li>
                  </ul>
                </div>
              )}
            </div>

            {/* LEADERBOARD LIST */}
            <div className="divide-y divide-slate-100 px-2 py-2">
              
              {isLoadingLeaderboard && (
                <div className="m-4 rounded-2xl border-2 border-sky-100 bg-sky-50 p-4 text-center text-xs font-black uppercase tracking-wider text-sky-600">
                  Đang tải bảng xếp hạng XP...
                </div>
              )}

              {leaderboardError && (
                <div className="m-4 rounded-2xl border-2 border-amber-100 bg-amber-50 p-4 text-center text-xs font-bold text-amber-700">
                  {leaderboardError}
                </div>
              )}

              {/* If user is previewing a league higher than their current one, show lock overlay warning at the top */}
              {activeLeagueView > userLeague && (
                <div className="m-4 bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl p-5 text-center">
                  <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-slate-200 text-slate-500 mb-2">
                    <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <h3 className="text-sm font-extrabold text-slate-700">Giải đấu đang bị khóa</h3>
                  <p className="mt-1 text-xs font-bold text-slate-400">
                    Bạn cần thăng hạng lên giải đấu {activeLeagueDetails.name} để có thể chính thức tranh tài ở đây.
                  </p>
                  <p className="mt-3 text-xs font-black text-sky-500 uppercase tracking-wider">
                    Đang hiển thị danh sách giả lập
                  </p>
                </div>
              )}

              {leaderboard.map((competitor, index) => {
                const rank = index + 1;
                const isUser = competitor.isCurrentUser && activeLeagueView === userLeague;
                
                // Promotion/Demotion zone lines
                const isPromoZone = rank <= 15;
                const isSafeZone = rank > 15 && rank <= 25;
                const isDemoZone = rank > 25;

                return (
                  <React.Fragment key={competitor.id}>
                    {/* Visual indicators for zones */}
                    {rank === 16 && (
                      <div className="py-2.5 px-4 flex items-center gap-2 bg-[#f8fafc] text-[10px] font-black uppercase tracking-wider text-slate-400 select-none border-y border-dashed border-slate-200">
                        <ChevronUp className="h-4 w-4 text-emerald-500 stroke-[3]" />
                        Khu vực thăng hạng (Top 15 trở lên)
                      </div>
                    )}
                    {rank === 26 && activeLeagueView > 1 && (
                      <div className="py-2.5 px-4 flex items-center gap-2 bg-rose-50 text-[10px] font-black uppercase tracking-wider text-rose-500 select-none border-y border-dashed border-rose-200">
                        <ChevronDown className="h-4 w-4 text-rose-500 stroke-[3]" />
                        Khu vực xuống hạng (Dưới top 25)
                      </div>
                    )}

                    {/* Member Row */}
                    <div 
                      className={cn(
                        "flex items-center justify-between px-4 py-3.5 rounded-2xl transition-all duration-200 border-2",
                        isUser 
                          ? "bg-sky-50/70 border-sky-300 shadow-[0_4px_12px_rgba(14,165,233,0.08)] scale-[1.01] z-10" 
                          : "border-transparent hover:bg-slate-50/80"
                      )}
                    >
                      <div className="flex items-center gap-4 min-w-0">
                        {/* Rank Badge / Number */}
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center font-black">
                          {rank === 1 ? (
                            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-yellow-400 text-xs font-black text-white border-2 border-yellow-200 ring-2 ring-yellow-500/50 shadow-sm" title="Quán quân">
                              1
                            </span>
                          ) : rank === 2 ? (
                            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-300 text-xs font-black text-white border-2 border-slate-100 ring-2 ring-slate-400/40 shadow-sm" title="Á quân 1">
                              2
                            </span>
                          ) : rank === 3 ? (
                            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-amber-600 text-xs font-black text-white border-2 border-amber-500 ring-2 ring-amber-700/40 shadow-sm" title="Á quân 2">
                              3
                            </span>
                          ) : (
                            <span className={cn(
                              "text-base",
                              isPromoZone && "text-emerald-600 font-extrabold",
                              isSafeZone && "text-slate-400",
                              isDemoZone && activeLeagueView > 1 && "text-rose-400"
                            )}>
                              {rank}
                            </span>
                          )}
                        </div>

                        {/* Avatar container */}
                        <div className="relative h-12 w-12 shrink-0">
                          {isUser ? (
                            <div className="h-12 w-12 rounded-full overflow-hidden border-2 border-sky-300 bg-sky-100 relative shadow-inner">
                              <Image
                                src={competitor.avatarUrl || initialUserImageSrc || "/mascot.svg"}
                                alt={competitor.name}
                                fill
                                sizes="48px"
                                className="object-contain p-1"
                              />
                            </div>
                          ) : (
                            <div className={cn(
                              "h-12 w-12 rounded-full flex items-center justify-center text-lg font-black text-white shadow-inner uppercase",
                              competitor.avatarColor
                            )}>
                              {competitor.avatarLetter}
                            </div>
                          )}

                          {/* Online green indicator dot */}
                          <span className="absolute bottom-0 right-0 block h-3 w-3 rounded-full bg-green-500 border-2 border-white ring-1 ring-green-300" />
                          
                          {/* Floating status emoji bubble */}
                          {competitor.statusEmoji && (
                            <div 
                              className={cn(
                                "absolute -top-1.5 -right-1.5 h-6 w-6 rounded-full bg-white border border-slate-200 flex items-center justify-center text-xs shadow-sm cursor-default select-none transition-transform",
                                isUser && isEmojiAnimating && "scale-125 duration-100"
                              )}
                              title="Trạng thái"
                            >
                              {competitor.statusEmoji}
                            </div>
                          )}
                        </div>

                        {/* Name Info */}
                        <div className="min-w-0">
                          <span className={cn(
                            "block truncate text-base font-bold",
                            isUser ? "text-sky-800 font-black" : "text-slate-700"
                          )}>
                            {competitor.name} {isUser && <span className="text-xs font-black text-sky-500 uppercase ml-1">(Bạn)</span>}
                          </span>
                          <span className="mt-0.5 block truncate text-[11px] font-black uppercase tracking-wide text-slate-400">
                            Level {competitor.level ?? 1} · Tổng XP {competitor.totalXp ?? competitor.points}
                          </span>
                        </div>
                      </div>

                      {/* Weekly XP */}
                      <div className="text-right shrink-0">
                        <span className={cn(
                          "block text-base font-black tracking-tight",
                          isUser ? "text-sky-600" : "text-slate-500"
                        )}>
                          {competitor.weeklyXp ?? competitor.points} <span className="text-xs font-bold uppercase">XP</span>
                        </span>
                        <span className="text-[10px] font-black uppercase tracking-wide text-slate-400">
                          Tuần này
                        </span>
                      </div>
                    </div>
                  </React.Fragment>
                );
              })}
            </div>
          </section>
        </div>
      </FeedWrapper>

      {/* RIGHT COLUMN: Sidebar panels */}
      <StickyWrapper>
        
        {/* User Statistics card */}
        <div className="rounded-[24px] border-2 border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex w-full items-center justify-between gap-2">
            <Link
              href="/courses"
              className="group flex h-14 min-w-0 flex-1 items-center gap-x-2 rounded-[18px] border-2 border-transparent bg-white px-2 transition hover:border-[#d6ecfb] hover:bg-[#f4fbff]"
            >
              <span className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-slate-50 shadow-sm ring-2 ring-slate-100 transition group-hover:ring-sky-100">
                <Image
                  src={activeCourse.imageSrc || "/globe.svg"}
                  alt={activeCourse.title}
                  className="rounded-md"
                  width={26}
                  height={26}
                />
              </span>
              <span className="truncate text-sm font-black text-slate-700">
                {activeCourse.title}
              </span>
            </Link>

            <div className="flex h-14 items-center gap-x-2 rounded-[18px] border-2 border-transparent bg-orange-50 px-3 text-sm font-black text-orange-600 shadow-sm cursor-default">
              <Flame className="h-5 w-5 fill-current text-orange-500" />
              <span>Streak</span>
            </div>

            <Link
              href="/shop"
              className="flex h-14 items-center gap-x-2 rounded-[18px] border-2 border-orange-100 bg-orange-50 px-3 text-sm font-black text-orange-600 shadow-sm transition hover:bg-orange-100"
            >
              <Image src="/points.svg" height={26} width={26} alt="XP" />
              <span>{userScore}</span>
            </Link>

            <Link
              href="/shop"
              className="flex h-14 items-center gap-x-2 rounded-[18px] border-2 border-rose-100 bg-rose-50 px-3 text-sm font-black text-rose-500 shadow-sm transition hover:bg-rose-100"
            >
              <Heart className="h-5 w-5 fill-current text-rose-500" />
              <span>{hearts}</span>
            </Link>
          </div>
        </div>

        {/* EMOJI STATUS PICKER CARD */}
        <div className="rounded-[24px] border-2 border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="text-lg font-black text-slate-700">Đặt biểu tượng trạng thái</h3>
          <p className="mt-1 text-xs font-bold text-slate-400 leading-normal">
            Chọn biểu tượng cảm xúc để hiển thị trên bảng xếp hạng giải đấu tuần này.
          </p>

          {/* Preview Container */}
          <div className="my-5 flex justify-center">
            <div className="relative p-2.5">
              
              {/* Dotted border circle wrapper */}
              <div className="h-20 w-20 rounded-full border-2 border-dashed border-sky-300 flex items-center justify-center bg-slate-50 relative p-1 shadow-inner select-none">
                <Image
                  src={initialUserName === "Bạn" ? "/mascot.svg" : initialUserImageSrc || "/mascot.svg"}
                  alt="Avatar"
                  width={60}
                  height={60}
                  className="object-contain p-1"
                />
              </div>

              {/* Status Speech Bubble with selected emoji */}
              <div 
                ref={emojiBubbleRef}
                className={cn(
                  "absolute -top-1 -right-1 h-8 w-8 rounded-full bg-white border-2 border-sky-400 flex items-center justify-center text-lg shadow-md font-bold transition-transform cursor-default select-none",
                  isEmojiAnimating ? "animate-bounce scale-110" : ""
                )}
                title="Trạng thái hiện tại"
              >
                {userStatusEmoji || "💬"}
              </div>
            </div>
          </div>

          {/* Grid selection */}
          <div className="grid grid-cols-6 gap-2">
            {STATUS_EMOJIS.map((emoji) => {
              const isSelected = userStatusEmoji === emoji;

              return (
                <button
                  key={emoji}
                  onClick={() => handleEmojiSelect(emoji)}
                  className={cn(
                    "h-10 w-10 text-lg rounded-xl flex items-center justify-center transition-all border-2 border-slate-100 hover:border-sky-300 hover:scale-105 active:scale-95",
                    isSelected 
                      ? "bg-sky-100 border-sky-400 shadow-[0_2px_8px_rgba(14,165,233,0.15)] text-xl" 
                      : "bg-slate-50 hover:bg-white"
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
              className="mt-4 w-full h-10 rounded-2xl border-2 border-slate-200 hover:bg-slate-50 text-xs font-black text-slate-500 uppercase tracking-wider transition-all"
            >
              Gỡ bỏ trạng thái
            </button>
          )}
        </div>

        {/* Footer Links */}
        <div className="px-5 text-center">
          <div className="flex flex-wrap justify-center gap-x-2 gap-y-1 text-[10px] font-black uppercase tracking-wide text-slate-400 select-none">
            <Link href="/about" className="hover:text-slate-500">Giới thiệu</Link>
            <span>·</span>
            <Link href="/shop" className="hover:text-slate-500">Cửa hàng</Link>
            <span>·</span>
            <Link href="/terms" className="hover:text-slate-500">Điều khoản</Link>
            <span>·</span>
            <Link href="/privacy" className="hover:text-slate-500">Bảo mật</Link>
          </div>
          <p className="mt-3 text-[10px] font-bold text-slate-400 select-none">
            © 2026 Robogo Language Learning
          </p>
        </div>

      </StickyWrapper>

    </div>
  );
};
