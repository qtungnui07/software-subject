import { calculateNextStreak, normalizeLessonStreakReward } from "../lib/streak";

type ExpectedStreakCase = {
    name: string;
    input: Parameters<typeof calculateNextStreak>[0];
    expected: {
        status: ReturnType<typeof calculateNextStreak>["status"];
        didIncrease: boolean;
        didReset: boolean;
        wasProtected: boolean;
        nextCurrentStreak: number;
        nextLongestStreak: number;
        nextStreakFreezes: number;
        usedStreakFreezes: number;
        missedDays: number;
        nextLastStudyDate: string | null;
    };
};

type ExpectedRewardCase = {
    name: string;
    input: Parameters<typeof normalizeLessonStreakReward>[0];
    expected: ReturnType<typeof normalizeLessonStreakReward>;
};

const streakCases: ExpectedStreakCase[] = [
    {
        name: "Chưa từng học → bắt đầu streak ngày 1",
        input: {
            currentStreak: 0,
            longestStreak: 0,
            streakFreezes: 0,
            lastStudyDate: null,
            today: "2026-06-23",
        },
        expected: {
            status: "first_study",
            didIncrease: true,
            didReset: false,
            wasProtected: false,
            nextCurrentStreak: 1,
            nextLongestStreak: 1,
            nextStreakFreezes: 0,
            usedStreakFreezes: 0,
            missedDays: 0,
            nextLastStudyDate: "2026-06-23",
        },
    },
    {
        name: "Đã học hôm nay → không cộng streak lần hai",
        input: {
            currentStreak: 3,
            longestStreak: 5,
            streakFreezes: 1,
            lastStudyDate: "2026-06-23",
            today: "2026-06-23",
        },
        expected: {
            status: "already_completed_today",
            didIncrease: false,
            didReset: false,
            wasProtected: false,
            nextCurrentStreak: 3,
            nextLongestStreak: 5,
            nextStreakFreezes: 1,
            usedStreakFreezes: 0,
            missedDays: 0,
            nextLastStudyDate: "2026-06-23",
        },
    },
    {
        name: "Học liên tiếp từ hôm qua → streak +1",
        input: {
            currentStreak: 3,
            longestStreak: 5,
            streakFreezes: 1,
            lastStudyDate: "2026-06-22",
            today: "2026-06-23",
        },
        expected: {
            status: "continued",
            didIncrease: true,
            didReset: false,
            wasProtected: false,
            nextCurrentStreak: 4,
            nextLongestStreak: 5,
            nextStreakFreezes: 1,
            usedStreakFreezes: 0,
            missedDays: 0,
            nextLastStudyDate: "2026-06-23",
        },
    },
    {
        name: "Vượt kỷ lục → longestStreak được cập nhật",
        input: {
            currentStreak: 5,
            longestStreak: 5,
            streakFreezes: 0,
            lastStudyDate: "2026-06-22",
            today: "2026-06-23",
        },
        expected: {
            status: "continued",
            didIncrease: true,
            didReset: false,
            wasProtected: false,
            nextCurrentStreak: 6,
            nextLongestStreak: 6,
            nextStreakFreezes: 0,
            usedStreakFreezes: 0,
            missedDays: 0,
            nextLastStudyDate: "2026-06-23",
        },
    },
    {
        name: "Bỏ lỡ 1 ngày, không có freeze → reset về ngày 1",
        input: {
            currentStreak: 7,
            longestStreak: 10,
            streakFreezes: 0,
            lastStudyDate: "2026-06-21",
            today: "2026-06-23",
        },
        expected: {
            status: "streak_reset",
            didIncrease: true,
            didReset: true,
            wasProtected: false,
            nextCurrentStreak: 1,
            nextLongestStreak: 10,
            nextStreakFreezes: 0,
            usedStreakFreezes: 0,
            missedDays: 1,
            nextLastStudyDate: "2026-06-23",
        },
    },
    {
        name: "Bỏ lỡ 1 ngày, có đủ freeze → streak được bảo vệ",
        input: {
            currentStreak: 7,
            longestStreak: 10,
            streakFreezes: 1,
            lastStudyDate: "2026-06-21",
            today: "2026-06-23",
        },
        expected: {
            status: "streak_protected",
            didIncrease: true,
            didReset: false,
            wasProtected: true,
            nextCurrentStreak: 8,
            nextLongestStreak: 10,
            nextStreakFreezes: 0,
            usedStreakFreezes: 1,
            missedDays: 1,
            nextLastStudyDate: "2026-06-23",
        },
    },
    {
        name: "Bỏ lỡ 2 ngày, có đủ freeze → dùng 2 freeze và giữ streak",
        input: {
            currentStreak: 7,
            longestStreak: 10,
            streakFreezes: 2,
            lastStudyDate: "2026-06-20",
            today: "2026-06-23",
        },
        expected: {
            status: "streak_protected",
            didIncrease: true,
            didReset: false,
            wasProtected: true,
            nextCurrentStreak: 8,
            nextLongestStreak: 10,
            nextStreakFreezes: 0,
            usedStreakFreezes: 2,
            missedDays: 2,
            nextLastStudyDate: "2026-06-23",
        },
    },
    {
        name: "Bỏ lỡ 2 ngày, thiếu freeze → reset và không trừ freeze",
        input: {
            currentStreak: 7,
            longestStreak: 10,
            streakFreezes: 1,
            lastStudyDate: "2026-06-20",
            today: "2026-06-23",
        },
        expected: {
            status: "streak_reset",
            didIncrease: true,
            didReset: true,
            wasProtected: false,
            nextCurrentStreak: 1,
            nextLongestStreak: 10,
            nextStreakFreezes: 1,
            usedStreakFreezes: 0,
            missedDays: 2,
            nextLastStudyDate: "2026-06-23",
        },
    },
];

const rewardCases: ExpectedRewardCase[] = [
    {
        name: "Reward mặc định",
        input: {},
        expected: {
            completedLessons: 1,
            earnedXp: 10,
        },
    },
    {
        name: "Reward âm/0 được chuẩn hóa an toàn",
        input: {
            completedLessons: 0,
            earnedXp: -5,
        },
        expected: {
            completedLessons: 1,
            earnedXp: 0,
        },
    },
    {
        name: "Reward số thập phân được làm tròn xuống",
        input: {
            completedLessons: 2.9,
            earnedXp: 35.7,
        },
        expected: {
            completedLessons: 2,
            earnedXp: 35,
        },
    },
];

const assertEqual = (caseName: string, fieldName: string, actual: unknown, expected: unknown) => {
    if (actual !== expected) {
        throw new Error(
            `${caseName} failed at ${fieldName}: expected ${String(expected)}, got ${String(actual)}`
        );
    }
};

const runStreakCases = () => {
    for (const testCase of streakCases) {
        const result = calculateNextStreak(testCase.input);

        for (const [fieldName, expectedValue] of Object.entries(testCase.expected)) {
            assertEqual(
                testCase.name,
                fieldName,
                result[fieldName as keyof typeof testCase.expected],
                expectedValue
            );
        }

        console.log(`PASS - ${testCase.name}`);
    }
};

const runRewardCases = () => {
    for (const testCase of rewardCases) {
        const result = normalizeLessonStreakReward(testCase.input);

        assertEqual(testCase.name, "completedLessons", result.completedLessons, testCase.expected.completedLessons);
        assertEqual(testCase.name, "earnedXp", result.earnedXp, testCase.expected.earnedXp);

        console.log(`PASS - ${testCase.name}`);
    }
};

try {
    console.log("\nStreak Feature Check");
    console.log("====================\n");

    runStreakCases();
    runRewardCases();

    console.log("\nStreak Feature Check: PASS");
} catch (error) {
    console.error("\nStreak Feature Check: FAIL");
    console.error(error);
    process.exit(1);
}
