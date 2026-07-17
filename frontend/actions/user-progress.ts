"use server";

import { getCourseById, getUserProgress } from '@/db/queries';
import { userProgress } from '../db/schema';
import { eq } from 'drizzle-orm';
import db from '@/db/drizzle';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';




import { auth } from "@/auth";
import { resolveUserAvatar } from "@/constants/user-avatar";
import { isRemoteApiMode, remoteApiRequest } from "@/lib/remote-api";

export const upsertUserProgress = async (courseId: number) => {
    if (isRemoteApiMode()) {
        await remoteApiRequest("/api/remote/user-progress", {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ operation: "select-course", courseId }),
        });
        revalidatePath("/courses");
        revalidatePath("/learn");
        redirect("/learn");
    }

    const session = await auth();
    const user = session?.user;
    const userId = user?.id;

    if (!userId || !user) {
        throw new Error("Unauthorized")
    }

    const course = await getCourseById(courseId);

    if (!course) {
        throw new Error("Course not found");
    }
    

//    TODO: Enable once units and lesson are added
//    if (!course.units.length || !course.units[0].lessons.length) {
//        throw new Error("Course is empty");
//    }

    const existingUserProgress = await getUserProgress();

    if (existingUserProgress){
        await db.update(userProgress).set({
            activeCourseId: courseId,
            userName: user.name || "User",
            userImageSrc: resolveUserAvatar(user.image),
        }).where(eq(userProgress.userId, userId));
            
        revalidatePath("/courses");
        revalidatePath("/learn");
        redirect("/learn");
    }

    await db.insert(userProgress).values({
        userId,
        activeCourseId: courseId,
        userName: user.name || "User",
        userImageSrc: resolveUserAvatar(user.image),
    });

    revalidatePath("/courses");
    revalidatePath("/learn");
    redirect("/learn");
};

export const updateUserLeague = async (league: number) => {
    if (isRemoteApiMode()) {
        await remoteApiRequest("/api/remote/user-progress", {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ operation: "league", league }),
        });
        revalidatePath("/leaderboard");
        return;
    }

    const session = await auth();
    const userId = session?.user?.id;

    if (!userId) {
        throw new Error("Unauthorized");
    }

    try {
        const existingUserProgress = await getUserProgress();

        if (existingUserProgress) {
            await db.update(userProgress)
                .set({
                    league,
                })
                .where(eq(userProgress.userId, userId));
        }
    } catch (error) {
        console.warn("Could not update league in database (migration may be missing):", error);
    }

    revalidatePath("/leaderboard");
};

export const updateUserStatusEmoji = async (statusEmoji: string | null) => {
    if (isRemoteApiMode()) {
        await remoteApiRequest("/api/remote/user-progress", {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ operation: "status-emoji", statusEmoji }),
        });
        revalidatePath("/leaderboard");
        return;
    }

    const session = await auth();
    const userId = session?.user?.id;

    if (!userId) {
        throw new Error("Unauthorized");
    }

    try {
        const existingUserProgress = await getUserProgress();

        if (existingUserProgress) {
            await db.update(userProgress)
                .set({
                    statusEmoji,
                })
                .where(eq(userProgress.userId, userId));
        }
    } catch (error) {
        console.warn("Could not update statusEmoji in database (migration may be missing):", error);
    }

    revalidatePath("/leaderboard");
};
