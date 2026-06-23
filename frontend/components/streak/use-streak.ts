"use client";

import { useEffect, useState } from "react";

import { DEFAULT_STREAK_DATA, type CurrentStreakData } from "./streak-data";

type UseStreakState = {
    data: CurrentStreakData;
    isLoading: boolean;
    isFallback: boolean;
};

const normalizeStreakData = (data: Partial<CurrentStreakData>): CurrentStreakData => ({
    ...DEFAULT_STREAK_DATA,
    ...data,
    currentStreak: Number.isFinite(data.currentStreak) ? Number(data.currentStreak) : 0,
    longestStreak: Number.isFinite(data.longestStreak) ? Number(data.longestStreak) : 0,
    streakFreezes: Number.isFinite(data.streakFreezes) ? Number(data.streakFreezes) : 0,
    missedDays: Number.isFinite(data.missedDays) ? Number(data.missedDays) : 0,
    recentActivity: Array.isArray(data.recentActivity) ? data.recentActivity : [],
});

export const useStreak = (): UseStreakState => {
    const [state, setState] = useState<UseStreakState>({
        data: DEFAULT_STREAK_DATA,
        isLoading: true,
        isFallback: false,
    });

    useEffect(() => {
        let isMounted = true;

        const loadStreak = async () => {
            try {
                const response = await fetch("/api/streak/current", {
                    cache: "no-store",
                });

                if (!response.ok) {
                    throw new Error(`Failed to load streak: ${response.status}`);
                }

                const data = (await response.json()) as Partial<CurrentStreakData>;

                if (!isMounted) {
                    return;
                }

                setState({
                    data: normalizeStreakData(data),
                    isLoading: false,
                    isFallback: false,
                });
            } catch (error) {
                console.warn("Using fallback streak data", error);

                if (!isMounted) {
                    return;
                }

                setState({
                    data: DEFAULT_STREAK_DATA,
                    isLoading: false,
                    isFallback: true,
                });
            }
        };

        loadStreak();

        return () => {
            isMounted = false;
        };
    }, []);

    return state;
};
