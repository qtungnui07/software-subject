export type CurrentStreakStatus = "not_started" | "active_today" | "active" | "missed";

export type StreakUpdateStatus =
    | "needs_more_time"
    | "first_study"
    | "already_completed_today"
    | "continued"
    | "streak_reset"
    | "streak_protected";

export type RecentStreakActivity = {
    studyDate: string;
    completedLessons: number;
    earnedXp: number;
    studyMinutes: number;
};

export type CurrentStreakData = {
    currentStreak: number;
    longestStreak: number;
    streakFreezes: number;
    lastStudyDate: string | null;
    hasStudiedToday: boolean;
    canIncreaseToday: boolean;
    missedDays: number;
    status: CurrentStreakStatus;
    todayDate: string;
    recentActivity: RecentStreakActivity[];
};

export type StreakNotificationInput = {
    status: StreakUpdateStatus;
    currentStreak: number;
    longestStreak?: number;
    streakFreezes?: number;
    missedDays?: number;
    usedStreakFreezes?: number;
};

export type StreakNotificationTone = "success" | "info" | "warning" | "protected";

export type StreakNotificationContent = {
    icon: string;
    title: string;
    description: string;
    tone: StreakNotificationTone;
};

export const DEFAULT_STREAK_DATA: CurrentStreakData = {
    currentStreak: 0,
    longestStreak: 0,
    streakFreezes: 0,
    lastStudyDate: null,
    hasStudiedToday: false,
    canIncreaseToday: true,
    missedDays: 0,
    status: "not_started",
    todayDate: "",
    recentActivity: [],
};

const toSafeCount = (value: number) => Math.max(0, Math.floor(Number.isFinite(value) ? value : 0));

export const getStreakDayLabel = (currentStreak: number) => {
    const safeStreak = toSafeCount(currentStreak);

    if (safeStreak <= 0) {
        return "Chưa có streak";
    }

    if (safeStreak === 1) {
        return "1 ngày liên tiếp";
    }

    return `${safeStreak} ngày liên tiếp`;
};

export const getCompactStreakDayLabel = (currentStreak: number) => {
    const safeStreak = toSafeCount(currentStreak);

    if (safeStreak <= 0) {
        return "0 ngày";
    }

    return `${safeStreak} ngày`;
};

export const getStreakStatusMessage = (status: CurrentStreakStatus) => {
    switch (status) {
        case "active_today":
            return "Bạn đã giữ streak hôm nay.";
        case "active":
            return "Học 1 bài hôm nay để giữ chuỗi.";
        case "missed":
            return "Học lại hôm nay để bắt đầu chuỗi mới.";
        case "not_started":
        default:
            return "Hoàn thành bài học đầu tiên để bắt đầu streak.";
    }
};

export const getCompactStreakLabel = (status: CurrentStreakStatus) => {
    switch (status) {
        case "active_today":
            return "Đã giữ";
        case "active":
            return "Cần học";
        case "missed":
            return "Đứt chuỗi";
        case "not_started":
        default:
            return "Streak";
    }
};

export const getStreakNotificationContent = ({
    status,
    currentStreak,
    missedDays = 0,
    usedStreakFreezes = 0,
}: StreakNotificationInput): StreakNotificationContent => {
    const dayLabel = getStreakDayLabel(currentStreak).toLowerCase();
    const safeMissedDays = toSafeCount(missedDays);
    const safeUsedFreezes = toSafeCount(usedStreakFreezes);

    switch (status) {
        case "needs_more_time":
            return {
                icon: "⏱️",
                title: "Chưa đủ 15 phút",
                description: "Tiến độ bài học đã được lưu, nhưng streak chỉ được tính khi bạn học đủ 15 phút trong ngày.",
                tone: "info",
            };
        case "first_study":
            return {
                icon: "🔥",
                title: "Bắt đầu streak!",
                description: "Bạn đã hoàn thành bài học đầu tiên. Quay lại ngày mai để giữ chuỗi.",
                tone: "success",
            };
        case "continued":
            return {
                icon: "🔥",
                title: "Streak +1!",
                description: `Bạn đang có ${dayLabel}. Tiếp tục học mỗi ngày để phá kỷ lục.`,
                tone: "success",
            };
        case "already_completed_today":
            return {
                icon: "✅",
                title: "Hôm nay đã giữ streak",
                description: "Bạn vẫn có thể học thêm để nhận XP, nhưng streak chỉ tăng một lần mỗi ngày.",
                tone: "info",
            };
        case "streak_protected":
            return {
                icon: "🧊",
                title: "Streak được bảo vệ!",
                description: `Đã dùng ${safeUsedFreezes} Freeze để bù ${safeMissedDays} ngày bỏ lỡ. Chuỗi học vẫn tiếp tục.`,
                tone: "protected",
            };
        case "streak_reset":
        default:
            return {
                icon: "⚠️",
                title: "Bắt đầu lại từ ngày 1",
                description: safeMissedDays > 0
                    ? `Bạn đã bỏ lỡ ${safeMissedDays} ngày. Hôm nay được tính là ngày đầu tiên của streak mới.`
                    : "Chuỗi cũ đã mất. Hôm nay được tính là ngày đầu tiên của streak mới.",
                tone: "warning",
            };
    }
};
