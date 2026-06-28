"use client";

import Link from "next/link";

import { Button } from "@/components/ui/button";
import { getCompactStreakDayLabel, getStreakDayLabel } from "./streak-data";
import { useStreak } from "./use-streak";

type Props = {
    className?: string;
};

export const StreakWidget = ({ className }: Props) => {
    const { data, isLoading, isFallback } = useStreak();
    const compactDayLabel = getCompactStreakDayLabel(data.currentStreak);
    const fullDayLabel = getStreakDayLabel(data.currentStreak);
    const ariaLabel = isLoading ? "Đang tải streak học tập" : `Streak học tập: ${fullDayLabel}`;

    return (
        <Link href="/learn" aria-label={ariaLabel} title={ariaLabel}>
            <Button
                variant="ghost"
                className={
                    `gap-x-2 border-2 border-orange-100 bg-orange-50/80 px-3 text-orange-600 hover:bg-orange-100 hover:text-orange-700 dark:border-orange-950/40 dark:bg-orange-950/20 dark:text-orange-400 dark:hover:bg-orange-950/30 ${className ?? ""}`
                }
            >
                <span className="text-xl leading-none" aria-hidden="true">🔥</span>
                <span className="font-extrabold">
                    {isLoading ? "..." : data.currentStreak}
                </span>
                <span className="hidden text-xs font-bold text-orange-500/80 xl:inline">
                    {isLoading ? "ngày" : compactDayLabel.replace(`${data.currentStreak} `, "")}
                </span>
                {isFallback ? (
                    <span className="hidden rounded-full bg-white/70 dark:bg-orange-950/40 px-1.5 py-0.5 text-[10px] font-black uppercase text-orange-400 dark:text-orange-300 2xl:inline">
                        Demo
                    </span>
                ) : null}
            </Button>
        </Link>
    );
};
