export const DEFAULT_STREAK_TIME_ZONE = "Asia/Ho_Chi_Minh";

export type StreakStatus =
    | "first_study"
    | "already_completed_today"
    | "continued"
    | "missed_day"
    | "streak_reset"
    | "streak_protected";

export type DateInput = string | Date | null | undefined;

export type CalculateNextStreakInput = {
    currentStreak?: number | null;
    longestStreak?: number | null;
    streakFreezes?: number | null;
    lastStudyDate?: DateInput;
    today?: Exclude<DateInput, null | undefined>;
    timeZone?: string;
};

export type CalculateNextStreakResult = {
    status: StreakStatus;
    didIncrease: boolean;
    didReset: boolean;
    wasProtected: boolean;
    currentStreak: number;
    longestStreak: number;
    streakFreezes: number;
    nextCurrentStreak: number;
    nextLongestStreak: number;
    nextStreakFreezes: number;
    usedStreakFreezes: number;
    previousStudyDate: string | null;
    todayDate: string;
    nextLastStudyDate: string | null;
    dayDifference: number | null;
    missedDays: number;
    message: string;
};

type ResolveMissedStreakInput = {
    currentStreak: number;
    longestStreak: number;
    streakFreezes: number;
    previousStudyDate: string;
    todayDate: string;
    dayDifference: number;
};

const ONE_DAY_IN_MS = 24 * 60 * 60 * 1000;
const DATE_KEY_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

const toSafeNonNegativeInteger = (value: number | null | undefined) => {
    if (!Number.isFinite(value ?? 0)) {
        return 0;
    }

    return Math.max(0, Math.trunc(value ?? 0));
};

const parseDateKeyToUtcTimestamp = (dateKey: string) => {
    if (!DATE_KEY_PATTERN.test(dateKey)) {
        throw new Error(`Invalid date key: ${dateKey}. Expected YYYY-MM-DD.`);
    }

    const [year, month, day] = dateKey.split("-").map(Number);

    return Date.UTC(year, month - 1, day);
};

const formatDateInTimeZone = (date: Date, timeZone: string) => {
    if (Number.isNaN(date.getTime())) {
        throw new Error("Invalid date value.");
    }

    const parts = new Intl.DateTimeFormat("en-US", {
        timeZone,
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
    }).formatToParts(date);

    const year = parts.find((part) => part.type === "year")?.value;
    const month = parts.find((part) => part.type === "month")?.value;
    const day = parts.find((part) => part.type === "day")?.value;

    if (!year || !month || !day) {
        throw new Error("Failed to format date key.");
    }

    return `${year}-${month}-${day}`;
};

export const getDateKey = (
    value: Exclude<DateInput, null | undefined> = new Date(),
    timeZone = DEFAULT_STREAK_TIME_ZONE
) => {
    if (typeof value === "string" && DATE_KEY_PATTERN.test(value)) {
        return value;
    }

    const date = value instanceof Date ? value : new Date(value);

    return formatDateInTimeZone(date, timeZone);
};

export const normalizeDateKey = (
    value: DateInput,
    timeZone = DEFAULT_STREAK_TIME_ZONE
) => {
    if (!value) {
        return null;
    }

    return getDateKey(value, timeZone);
};

export const getDateDifferenceInDays = (fromDateKey: string, toDateKey: string) => {
    const fromTime = parseDateKeyToUtcTimestamp(fromDateKey);
    const toTime = parseDateKeyToUtcTimestamp(toDateKey);

    return Math.round((toTime - fromTime) / ONE_DAY_IN_MS);
};

export const resolveMissedStreak = ({
    currentStreak,
    longestStreak,
    streakFreezes,
    previousStudyDate,
    todayDate,
    dayDifference,
}: ResolveMissedStreakInput): CalculateNextStreakResult => {
    const missedDays = Math.max(1, dayDifference - 1);
    const hasEnoughFreezes = streakFreezes >= missedDays;

    if (hasEnoughFreezes) {
        const nextCurrentStreak = currentStreak + 1;
        const nextLongestStreak = Math.max(longestStreak, nextCurrentStreak);

        return {
            status: "streak_protected",
            didIncrease: true,
            didReset: false,
            wasProtected: true,
            currentStreak,
            longestStreak,
            streakFreezes,
            nextCurrentStreak,
            nextLongestStreak,
            nextStreakFreezes: streakFreezes - missedDays,
            usedStreakFreezes: missedDays,
            previousStudyDate,
            todayDate,
            nextLastStudyDate: todayDate,
            dayDifference,
            missedDays,
            message: `Streak được bảo vệ bằng ${missedDays} streak freeze và tăng thêm 1 ngày.`,
        };
    }

    return {
        status: "streak_reset",
        didIncrease: true,
        didReset: true,
        wasProtected: false,
        currentStreak,
        longestStreak,
        streakFreezes,
        nextCurrentStreak: 1,
        nextLongestStreak: Math.max(longestStreak, 1),
        nextStreakFreezes: streakFreezes,
        usedStreakFreezes: 0,
        previousStudyDate,
        todayDate,
        nextLastStudyDate: todayDate,
        dayDifference,
        missedDays,
        message: "Streak đã mất vì không đủ streak freeze. Bắt đầu lại từ ngày 1.",
    };
};

export const calculateNextStreak = ({
    currentStreak,
    longestStreak,
    streakFreezes,
    lastStudyDate,
    today = new Date(),
    timeZone = DEFAULT_STREAK_TIME_ZONE,
}: CalculateNextStreakInput): CalculateNextStreakResult => {
    const safeCurrentStreak = toSafeNonNegativeInteger(currentStreak);
    const safeLongestStreak = Math.max(
        toSafeNonNegativeInteger(longestStreak),
        safeCurrentStreak
    );
    const safeStreakFreezes = toSafeNonNegativeInteger(streakFreezes);
    const todayDate = getDateKey(today, timeZone);
    const previousStudyDate = normalizeDateKey(lastStudyDate, timeZone);

    if (!previousStudyDate) {
        return {
            status: "first_study",
            didIncrease: true,
            didReset: false,
            wasProtected: false,
            currentStreak: safeCurrentStreak,
            longestStreak: safeLongestStreak,
            streakFreezes: safeStreakFreezes,
            nextCurrentStreak: 1,
            nextLongestStreak: Math.max(safeLongestStreak, 1),
            nextStreakFreezes: safeStreakFreezes,
            usedStreakFreezes: 0,
            previousStudyDate,
            todayDate,
            nextLastStudyDate: todayDate,
            dayDifference: null,
            missedDays: 0,
            message: "Bắt đầu streak đầu tiên trong ngày.",
        };
    }

    const dayDifference = getDateDifferenceInDays(previousStudyDate, todayDate);

    if (dayDifference <= 0) {
        return {
            status: "already_completed_today",
            didIncrease: false,
            didReset: false,
            wasProtected: false,
            currentStreak: safeCurrentStreak,
            longestStreak: safeLongestStreak,
            streakFreezes: safeStreakFreezes,
            nextCurrentStreak: safeCurrentStreak,
            nextLongestStreak: safeLongestStreak,
            nextStreakFreezes: safeStreakFreezes,
            usedStreakFreezes: 0,
            previousStudyDate,
            todayDate,
            nextLastStudyDate: previousStudyDate,
            dayDifference,
            missedDays: 0,
            message: "Hôm nay đã được tính streak, không cộng thêm lần nữa.",
        };
    }

    if (dayDifference === 1) {
        const nextCurrentStreak = safeCurrentStreak + 1;

        return {
            status: "continued",
            didIncrease: true,
            didReset: false,
            wasProtected: false,
            currentStreak: safeCurrentStreak,
            longestStreak: safeLongestStreak,
            streakFreezes: safeStreakFreezes,
            nextCurrentStreak,
            nextLongestStreak: Math.max(safeLongestStreak, nextCurrentStreak),
            nextStreakFreezes: safeStreakFreezes,
            usedStreakFreezes: 0,
            previousStudyDate,
            todayDate,
            nextLastStudyDate: todayDate,
            dayDifference,
            missedDays: 0,
            message: "Streak được duy trì và tăng thêm 1 ngày.",
        };
    }

    return resolveMissedStreak({
        currentStreak: safeCurrentStreak,
        longestStreak: safeLongestStreak,
        streakFreezes: safeStreakFreezes,
        previousStudyDate,
        todayDate,
        dayDifference,
    });
};

export type LessonStreakRewardInput = {
    completedLessons?: number;
    earnedXp?: number;
};

export const normalizeLessonStreakReward = ({
    completedLessons = 1,
    earnedXp = 10,
}: LessonStreakRewardInput = {}) => ({
    completedLessons: Math.max(1, Math.trunc(completedLessons)),
    earnedXp: Math.max(0, Math.trunc(earnedXp)),
});
