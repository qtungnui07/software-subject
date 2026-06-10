import { cache } from "react";

import { courses, userProgress } from "@/db/schema";

import db from "@/db/drizzle";
import { eq } from "drizzle-orm";
import { auth } from "@/auth";

export const getUserProgress = cache(async ()=> {
    const session = await auth();
    const userId = session?.user?.id;

    if (!userId) {
        return null;
    }

    const data = await db.query.userProgress.findFirst({
        where: eq(userProgress.userId, userId),
        with: {
            activeCourse: true,
        },
    });
    return data;
})

export const getCourses = cache(async () => {
    const data = await db.query.courses.findMany();

    return data;
});

export const getCourseById = cache(async (courseId: number) => {
    const data = await db.query.courses.findFirst({
        where: eq(courses.id, courseId),
    });

    return data;
});