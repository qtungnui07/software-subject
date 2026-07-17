"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { DEFAULT_STREAK_DATA, type CurrentStreakData } from "./streak-data";

export const STREAK_UPDATED_EVENT = "robogo-streak-updated";

type UseStreakState = {
    data: CurrentStreakData;
    isLoading: boolean;
    isFallback: boolean;
    refetch: () => void;
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
    const [state, setState] = useState<Omit<UseStreakState, "refetch">>({
        data: DEFAULT_STREAK_DATA,
        isLoading: true,
        isFallback: false,
    });

    const [tick, setTick] = useState(0);
    const isMountedRef = useRef(true);

    useEffect(() => {
        isMountedRef.current = true;
        return () => {
            isMountedRef.current = false;
        };
    }, []);

    useEffect(() => {
        const loadStreak = async () => {
            try {
                const response = await fetch("/api/streak/current", {
                    cache: "no-store",
                });

                if (!response.ok) {
                    throw new Error(`Failed to load streak: ${response.status}`);
                }

                const data = (await response.json()) as Partial<CurrentStreakData>;

                if (!isMountedRef.current) {
                    return;
                }

                setState({
                    data: normalizeStreakData(data),
                    isLoading: false,
                    isFallback: false,
                });
            } catch (error) {
                console.warn("Using fallback streak data", error);

                if (!isMountedRef.current) {
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
    }, [tick]);

    useEffect(() => {
        const refetchStreak = () => {
            setTick((t) => t + 1);
        };

        window.addEventListener(STREAK_UPDATED_EVENT, refetchStreak);
        window.addEventListener("focus", refetchStreak);

        return () => {
            window.removeEventListener(STREAK_UPDATED_EVENT, refetchStreak);
            window.removeEventListener("focus", refetchStreak);
        };
    }, []);

    const refetch = useCallback(() => {
        setState((prev) => ({ ...prev, isLoading: true }));
        setTick((t) => t + 1);
    }, []);

    return { ...state, refetch };
};
