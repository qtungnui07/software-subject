"use client";

import { getCompactStreakDayLabel, getStreakDayLabel, getStreakStatusMessage } from "./streak-data";
import { useStreak } from "./use-streak";

export const StreakCard = () => {
    const { data, isLoading, isFallback } = useStreak();
    const dayLabel = getStreakDayLabel(data.currentStreak);
    const longestLabel = getCompactStreakDayLabel(data.longestStreak);
    const message = isLoading
        ? "Đang tải chuỗi học tập của bạn..."
        : getStreakStatusMessage(data.status);

    return (
        <section className="rounded-3xl border-2 border-orange-100 bg-gradient-to-br from-orange-50 via-white to-sky-50 p-5 shadow-sm">
            <div className="flex items-start justify-between gap-4">
                <div>
                    <p className="text-sm font-extrabold uppercase tracking-[0.18em] text-orange-500">
                        Chuỗi học tập
                    </p>
                    <h2 className="mt-2 text-3xl font-black text-neutral-800">
                        {isLoading ? "..." : dayLabel}
                    </h2>
                    <p className="mt-1 text-sm font-semibold text-neutral-500">
                        {message}
                    </p>
                </div>
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-100 text-3xl shadow-inner">
                    🔥
                </div>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-3">
                <div className="rounded-2xl border border-sky-100 bg-white/80 p-3">
                    <p className="text-xs font-bold uppercase tracking-wide text-sky-500">
                        Kỷ lục
                    </p>
                    <p className="mt-1 text-xl font-black text-neutral-800">
                        {isLoading ? "..." : longestLabel}
                    </p>
                </div>
                <div className="rounded-2xl border border-cyan-100 bg-white/80 p-3">
                    <p className="text-xs font-bold uppercase tracking-wide text-cyan-500">
                        Freeze
                    </p>
                    <p className="mt-1 text-xl font-black text-neutral-800">
                        🧊 {isLoading ? "..." : `${data.streakFreezes} lượt`}
                    </p>
                </div>
            </div>

            {isFallback ? (
                <p className="mt-4 rounded-2xl border border-dashed border-orange-200 bg-white/70 px-3 py-2 text-xs font-semibold text-orange-500">
                    Đang dùng dữ liệu tạm vì API/DB chưa sẵn sàng. Giao diện vẫn hoạt động an toàn.
                </p>
            ) : null}
        </section>
    );
};
