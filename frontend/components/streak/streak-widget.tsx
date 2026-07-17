"use client";

import Link from "next/link";

import { Button } from "@/components/ui/button";
import { getStreakDayLabel } from "./streak-data";
import { useStreak } from "./use-streak";

type Props = {
    className?: string;
};

export const StreakWidget = ({ className }: Props) => {
    const { data, isLoading } = useStreak();
    const fullDayLabel = getStreakDayLabel(data.currentStreak);
    const ariaLabel = isLoading ? "Đang tải streak học tập" : `Streak học tập: ${fullDayLabel}`;

    return (
        <Link href="/learn" aria-label={ariaLabel} title={ariaLabel}>
            <Button
                variant="ghost"
                className={
                    `gap-x-1.5 border-2 border-orange-100 bg-orange-50/80 px-2.5 text-orange-600 hover:bg-orange-100 hover:text-orange-700 dark:border-orange-950/40 dark:bg-orange-950/20 dark:text-orange-400 dark:hover:bg-orange-950/30 ${className ?? ""}`
                }
            >
                <span className="text-xl leading-none" aria-hidden="true">🔥</span>
                <span className="font-extrabold">
                    {isLoading ? "..." : data.currentStreak}
                </span>
            </Button>
        </Link>
    );
};
