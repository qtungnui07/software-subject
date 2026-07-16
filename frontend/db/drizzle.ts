import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import { DEFAULT_USER_AVATAR } from "@/constants/user-avatar";
import * as schema from "./schema";
import { canUseOfflineDatabaseFallback } from "@/lib/env/env-policy";

const databaseUrl = process.env.DATABASE_URL;

let db: any;

if (databaseUrl) {
    const client = postgres(databaseUrl);
    db = drizzle(client, { schema });
} else if (canUseOfflineDatabaseFallback()) {
    console.warn("DATABASE_URL is not set. Using offline/in-memory mock database wrapper.");

    const mockUserProgress = {
        userId: "mock-user-id",
        userName: "User",
        userImageSrc: DEFAULT_USER_AVATAR,
        activeCourseId: 1,
        hearts: 5,
        points: 100,
        league: 1,
        statusEmoji: null,
        activeCourse: {
            id: 1,
            title: "Tiếng Anh",
            imageSrc: "/gb.svg"
        }
    };

    const mockCourses = [
        { id: 1, title: "Tiếng Anh", imageSrc: "/gb.svg" },
        { id: 2, title: "Tiếng Nhật", imageSrc: "/jp.svg" },
        { id: 3, title: "Tiếng Pháp", imageSrc: "/fr.svg" },
        { id: 4, title: "Tiếng Tây Ban Nha", imageSrc: "/es.svg" },
        { id: 5, title: "Tiếng Ý", imageSrc: "/it.svg" }
    ];

    const mockUserStreaks = {
        userId: "mock-user-id",
        currentStreak: 3,
        longestStreak: 5,
        streakFreezes: 1,
        lastStudyDate: new Date().toISOString().split("T")[0]
    };

    const mockUserXpSummary = {
        userId: "mock-user-id",
        totalXp: 100,
        dailyXp: 10,
        weeklyXp: 50,
        currentDay: new Date().toISOString().split("T")[0],
        currentWeekStart: new Date().toISOString().split("T")[0]
    };

    const chainable = () => {
        const builder = {
            values: () => builder,
            set: () => builder,
            where: () => builder,
            onConflictDoUpdate: () => builder,
            returning: async () => [{}],
            then: (resolve: any) => resolve([{}])
        };
        return builder;
    };

    const mockQuery = new Proxy({}, {
        get(target, tableName) {
            return {
                findFirst: async (options?: any) => {
                    console.log(`[Mock DB Query] findFirst on table: ${String(tableName)}`);
                    if (tableName === "userProgress") return mockUserProgress;
                    if (tableName === "courses") return mockCourses[0];
                    if (tableName === "userStreaks") return mockUserStreaks;
                    if (tableName === "userXpSummary") return mockUserXpSummary;
                    if (tableName === "chapterOneProgress") {
                        return {
                            userId: "mock-user-id",
                            completedLessons: "[]",
                            claimedChests: "[]",
                            completedCheckpoint: 0,
                            updatedAt: new Date()
                        };
                    }
                    if (tableName === "questDailyStats") {
                        return {
                            userId: "mock-user-id",
                            studyDate: new Date().toISOString().split("T")[0],
                            completedLessons: 0,
                            earnedXp: 0,
                            updatedAt: new Date()
                        };
                    }
                    return null;
                },
                findMany: async (options?: any) => {
                    console.log(`[Mock DB Query] findMany on table: ${String(tableName)}`);
                    if (tableName === "courses") return mockCourses;
                    return [];
                }
            };
        }
    });

    db = {
        query: mockQuery,
        insert: chainable,
        update: chainable,
        delete: chainable,
        execute: async () => [],
        transaction: async (callback: any) => {
            console.log("[Mock DB] starting mock transaction");
            return callback(db);
        }
    };
} else {
    const unavailable = () => {
        throw new Error("DATABASE_URL is required at production runtime.");
    };
    const unavailableQuery = new Proxy({}, {
        get() {
            return {
                findFirst: unavailable,
                findMany: unavailable,
            };
        },
    });

    db = {
        query: unavailableQuery,
        insert: unavailable,
        update: unavailable,
        delete: unavailable,
        execute: unavailable,
        transaction: unavailable,
    };
}
 
export default db;
