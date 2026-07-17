"use client";

import { getCompactStreakDayLabel, getStreakDayLabel, getStreakStatusMessage, type RecentStreakActivity } from "./streak-data";
import { useStreak } from "./use-streak";

// Build last 7 days array starting from today (Asia/Ho_Chi_Minh)
const getCurrentWeekDays = (): string[] => {
    const days: string[] = [];
    const now = new Date();
    const dayOfWeek = now.getDay(); // 0 (CN) to 6 (T7)
    // Distance to Monday (T2):
    // If Sunday (0), distance is -6. Otherwise, distance is -(dayOfWeek - 1).
    const distanceToMonday = dayOfWeek === 0 ? -6 : -(dayOfWeek - 1);
    
    const monday = new Date(now);
    monday.setDate(now.getDate() + distanceToMonday);
    monday.setHours(0, 0, 0, 0);

    for (let i = 0; i < 7; i++) {
        const d = new Date(monday);
        d.setDate(monday.getDate() + i);
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, "0");
        const day = String(d.getDate()).padStart(2, "0");
        days.push(`${year}-${month}-${day}`);
    }

    return days;
};

const DAY_LABELS = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];

const getDayLabel = (dateKey: string): string => {
    const [year, month, day] = dateKey.split("-").map(Number);
    const d = new Date(year, month - 1, day);
    return DAY_LABELS[d.getDay()];
};

const isToday = (dateKey: string): boolean => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    return dateKey === `${year}-${month}-${day}`;
};

type HeatmapProps = {
    recentActivity: RecentStreakActivity[];
};

const WeekHeatmap = ({ recentActivity }: HeatmapProps) => {
    const currentWeekDays = getCurrentWeekDays();
    const activityMap = new Map(recentActivity.map((a) => [a.studyDate, a]));

    return (
        <div className="mt-5">
            <p className="text-xs font-bold uppercase tracking-wide text-neutral-400 mb-2">
                7 ngày gần nhất
            </p>
            <div 
                className="grid grid-cols-7 gap-1" 
                style={{ display: "grid", gridTemplateColumns: "repeat(7, minmax(0, 1fr))" }}
            >
                {currentWeekDays.map((dateKey) => {
                    const activity = activityMap.get(dateKey);
                    const studied = (activity?.studyMinutes ?? 0) >= 15;
                    const today = isToday(dateKey);

                    return (
                        <div key={dateKey} className="flex flex-col items-center gap-1">
                            <div
                                title={
                                    activity
                                        ? `${dateKey}: ${activity!.completedLessons} bài, +${activity!.earnedXp} XP`
                                        : dateKey
                                }
                                className={[
                                    "flex h-9 w-full items-center justify-center rounded-xl text-base transition",
                                    today && !studied
                                        ? "ring-2 ring-orange-300 bg-orange-50"
                                        : "",
                                    studied
                                        ? "bg-orange-100 shadow-sm"
                                        : "bg-neutral-100",
                                ].join(" ")}
                            >
                                {studied ? "🔥" : (
                                    <span className={`text-[11px] font-black ${today ? "text-orange-400" : "text-neutral-300"}`}>
                                        •
                                    </span>
                                )}
                            </div>
                            <span className={`text-[10px] font-bold ${today ? "text-orange-500" : "text-neutral-400"}`}>
                                {getDayLabel(dateKey)}
                            </span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export const StreakCard = () => {
    const { data, isLoading, isFallback } = useStreak();
    const dayLabel = getStreakDayLabel(data.currentStreak);
    const longestLabel = getCompactStreakDayLabel(data.longestStreak);
    const message = isLoading
        ? "Đang tải chuỗi học tập của bạn..."
        : getStreakStatusMessage(data.status);

    return (
        <section className="rounded-3xl border-2 border-orange-100 dark:border-[#202f36] bg-gradient-to-br from-orange-50 via-white to-sky-50 dark:from-[#251b16] dark:via-[#182226] dark:to-[#172630] p-5 shadow-sm">
            <div className="flex items-start justify-between gap-4">
                <div>
                    <p className="text-sm font-extrabold uppercase tracking-[0.18em] text-orange-500">
                        Chuỗi học tập
                    </p>
                    <h2 className="mt-2 text-3xl font-black text-neutral-800 dark:text-slate-100">
                        {isLoading ? "..." : dayLabel}
                    </h2>
                    <p className="mt-1 text-sm font-semibold text-neutral-500 dark:text-slate-400">
                        {message}
                    </p>
                </div>
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-100 dark:bg-orange-950/30 text-3xl shadow-inner">
                    🔥
                </div>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-3">
                <div className="rounded-2xl border border-sky-100 dark:border-[#202f36] bg-white/80 dark:bg-[#131f24]/80 p-3">
                    <p className="text-xs font-bold uppercase tracking-wide text-sky-500">
                        Kỷ lục
                    </p>
                    <p className="mt-1 text-xl font-black text-neutral-800 dark:text-slate-100">
                        {isLoading ? "..." : longestLabel}
                    </p>
                </div>
                <div className="rounded-2xl border border-cyan-100 dark:border-[#202f36] bg-white/80 dark:bg-[#131f24]/80 p-3">
                    <p className="text-xs font-bold uppercase tracking-wide text-cyan-500">
                        Freeze
                    </p>
                    <p className="mt-1 text-xl font-black text-neutral-800 dark:text-slate-100">
                        🧊 {isLoading ? "..." : `${data.streakFreezes} lượt`}
                    </p>
                </div>
            </div>

            {!isLoading && (
                <WeekHeatmap recentActivity={data.recentActivity} />
            )}

            {isFallback ? (
                <p className="mt-4 rounded-2xl border border-dashed border-orange-200 dark:border-orange-950/40 bg-white/70 dark:bg-orange-950/10 px-3 py-2 text-xs font-semibold text-orange-500 dark:text-orange-400">
                    Đang dùng dữ liệu tạm vì API/DB chưa sẵn sàng. Giao diện vẫn hoạt động an toàn.
                </p>
            ) : null}
        </section>
    );
};
