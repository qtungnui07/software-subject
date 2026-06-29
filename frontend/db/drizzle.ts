import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import * as schema from "./schema";

const databaseUrl = process.env.DATABASE_URL;

let db: any;

if (databaseUrl) {
    const client = postgres(databaseUrl);
    db = drizzle(client, { schema });
} else {
    console.warn("DATABASE_URL is not set. Using offline/in-memory mock database wrapper.");

    const mockUserProgress = {
        userId: "mock-user-id",
        userName: "User",
        userImageSrc: "/logo.webp",
        activeCourseId: 1,
        hearts: 5,
        points: 100,
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

    db = {
        query: {
            userProgress: {
                findFirst: async () => mockUserProgress,
            },
            courses: {
                findMany: async () => mockCourses,
                findFirst: async () => mockCourses[0],
            },
            users: {
                findFirst: async () => null,
            }
        },
        insert: () => ({
            values: () => Promise.resolve()
        }),
        update: () => ({
            set: () => ({
                where: () => Promise.resolve()
            })
        })
    };
}
 
export default db;
