"use client";

import { X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import {
    getStreakNotificationContent,
    type StreakNotificationInput,
    type StreakNotificationTone,
} from "./streak-data";

type Props = {
    result?: StreakNotificationInput | null;
    autoHideMs?: number;
    className?: string;
    onDismiss?: () => void;
};

const toneClasses: Record<StreakNotificationTone, string> = {
    success: "border-orange-200 bg-orange-50 text-orange-700 shadow-orange-100/60 dark:border-orange-950/40 dark:bg-orange-950/20 dark:text-orange-400 dark:shadow-none",
    info: "border-sky-200 bg-sky-50 text-sky-700 shadow-sky-100/60 dark:border-sky-950/40 dark:bg-sky-950/20 dark:text-sky-400 dark:shadow-none",
    warning: "border-amber-200 bg-amber-50 text-amber-700 shadow-amber-100/60 dark:border-amber-950/40 dark:bg-amber-950/20 dark:text-amber-400 dark:shadow-none",
    protected: "border-cyan-200 bg-cyan-50 text-cyan-700 shadow-cyan-100/60 dark:border-cyan-950/40 dark:bg-cyan-950/20 dark:text-cyan-400 dark:shadow-none",
};

const accentClasses: Record<StreakNotificationTone, string> = {
    success: "bg-orange-100 text-orange-600 dark:bg-orange-500/15 dark:text-orange-300",
    info: "bg-sky-100 text-sky-600 dark:bg-sky-500/15 dark:text-sky-300",
    warning: "bg-amber-100 text-amber-600 dark:bg-amber-500/15 dark:text-amber-300",
    protected: "bg-cyan-100 text-cyan-600 dark:bg-cyan-500/15 dark:text-cyan-300",
};

export const StreakNotification = ({
    result,
    autoHideMs = 5000,
    className,
    onDismiss,
}: Props) => {
    const [isVisible, setIsVisible] = useState(Boolean(result));
    const content = useMemo(
        () => (result ? getStreakNotificationContent(result) : null),
        [result],
    );

    useEffect(() => {
        if (!result) {
            setIsVisible(false);
            return;
        }

        setIsVisible(true);
    }, [result]);

    useEffect(() => {
        if (!result || !isVisible || autoHideMs <= 0) {
            return;
        }

        const timeoutId = window.setTimeout(() => {
            setIsVisible(false);
            onDismiss?.();
        }, autoHideMs);

        return () => window.clearTimeout(timeoutId);
    }, [autoHideMs, isVisible, onDismiss, result]);

    if (!result || !content || !isVisible) {
        return null;
    }

    const handleDismiss = () => {
        setIsVisible(false);
        onDismiss?.();
    };

    return (
        <div
            role="status"
            aria-live="polite"
            className={
                `fixed inset-x-4 bottom-4 z-50 mx-auto max-w-md rounded-3xl border-2 p-4 shadow-xl transition-all duration-300 md:inset-x-auto md:right-6 md:bottom-6 ${toneClasses[content.tone]} ${className ?? ""}`
            }
        >
            <div className="flex items-start gap-3">
                <div
                    className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-2xl ${accentClasses[content.tone]}`}
                    aria-hidden="true"
                >
                    {content.icon}
                </div>

                <div className="min-w-0 flex-1">
                    <p className="text-sm font-black uppercase tracking-[0.14em] opacity-75">
                        Streak
                    </p>
                    <h3 className="mt-0.5 text-lg font-black leading-tight">
                        {content.title}
                    </h3>
                    <p className="mt-1 text-sm font-semibold leading-relaxed opacity-85">
                        {content.description}
                    </p>
                </div>

                <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 shrink-0 rounded-full bg-white/60 dark:bg-slate-800/60 hover:bg-white/90 dark:hover:bg-slate-700/80"
                    onClick={handleDismiss}
                    aria-label="Đóng thông báo streak"
                >
                    <X className="h-4 w-4" />
                </Button>
            </div>
        </div>
    );
};
