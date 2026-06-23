import { calculateNextStreak } from "../lib/streak";

const cases = [
    {
        name: "Chưa từng học",
        input: {
            currentStreak: 0,
            longestStreak: 0,
            streakFreezes: 0,
            lastStudyDate: null,
            today: "2026-06-23",
        },
    },
    {
        name: "Đã học hôm nay",
        input: {
            currentStreak: 3,
            longestStreak: 5,
            streakFreezes: 1,
            lastStudyDate: "2026-06-23",
            today: "2026-06-23",
        },
    },
    {
        name: "Học liên tiếp từ hôm qua",
        input: {
            currentStreak: 3,
            longestStreak: 5,
            streakFreezes: 1,
            lastStudyDate: "2026-06-22",
            today: "2026-06-23",
        },
    },
    {
        name: "Vượt kỷ lục longestStreak",
        input: {
            currentStreak: 5,
            longestStreak: 5,
            streakFreezes: 0,
            lastStudyDate: "2026-06-22",
            today: "2026-06-23",
        },
    },
    {
        name: "Bỏ lỡ 1 ngày, không có freeze",
        input: {
            currentStreak: 7,
            longestStreak: 10,
            streakFreezes: 0,
            lastStudyDate: "2026-06-21",
            today: "2026-06-23",
        },
    },
    {
        name: "Bỏ lỡ 1 ngày, có đủ freeze",
        input: {
            currentStreak: 7,
            longestStreak: 10,
            streakFreezes: 1,
            lastStudyDate: "2026-06-21",
            today: "2026-06-23",
        },
    },
    {
        name: "Bỏ lỡ 2 ngày, có đủ freeze",
        input: {
            currentStreak: 7,
            longestStreak: 10,
            streakFreezes: 2,
            lastStudyDate: "2026-06-20",
            today: "2026-06-23",
        },
    },
    {
        name: "Bỏ lỡ 2 ngày, thiếu freeze",
        input: {
            currentStreak: 7,
            longestStreak: 10,
            streakFreezes: 1,
            lastStudyDate: "2026-06-20",
            today: "2026-06-23",
        },
    },
];

for (const streakCase of cases) {
    const result = calculateNextStreak(streakCase.input);

    console.log(`\n${streakCase.name}`);
    console.log({
        status: result.status,
        didIncrease: result.didIncrease,
        didReset: result.didReset,
        wasProtected: result.wasProtected,
        nextCurrentStreak: result.nextCurrentStreak,
        nextLongestStreak: result.nextLongestStreak,
        nextStreakFreezes: result.nextStreakFreezes,
        usedStreakFreezes: result.usedStreakFreezes,
        missedDays: result.missedDays,
        todayDate: result.todayDate,
        nextLastStudyDate: result.nextLastStudyDate,
        dayDifference: result.dayDifference,
    });
}
