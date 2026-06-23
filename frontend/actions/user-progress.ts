"use server";

import { getCourseById, getUserProgress } from '@/db/queries';
import { courses, userProgress, users } from '../db/schema';
import { eq, and, ne } from 'drizzle-orm';
import db from '@/db/drizzle';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';




import { auth } from "@/auth";

export const upsertUserProgress = async (courseId: number) => {
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
            userImageSrc: user.image || "/logo.webp",
        });
            
        revalidatePath("/courses");
        revalidatePath("/learn");
        redirect("/learn");
    }

    await db.insert(userProgress).values({
        userId,
        activeCourseId: courseId,
        userName: user.name || "User",
        userImageSrc: user.image || "/logo.webp",  
    });

    revalidatePath("/courses");
    revalidatePath("/learn");
    redirect("/learn");
};

export const updateUserProfile = async (userName: string, userImageSrc: string) => {
    const session = await auth();
    const userId = session?.user?.id;

    if (!userId) {
        throw new Error("Unauthorized");
    }

    if (!userName.trim()) {
        throw new Error("Tên hiển thị không được để trống");
    }

    const existingUserProgress = await getUserProgress();

    if (existingUserProgress) {
        await db.update(userProgress)
            .set({
                userName,
                userImageSrc,
            })
            .where(eq(userProgress.userId, userId));
    } else {
        await db.insert(userProgress).values({
            userId,
            userName,
            userImageSrc,
        });
    }

    revalidatePath("/profile");
    revalidatePath("/courses");
    revalidatePath("/learn");
};

export const updateUserLeague = async (league: number) => {
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

export const updateUserAccountSettings = async (userName: string, email: string) => {
    const session = await auth();
    const userId = session?.user?.id;

    if (!userId) {
        throw new Error("Unauthorized");
    }

    if (!userName.trim()) {
        throw new Error("Tên hiển thị không được để trống");
    }

    if (!email.trim()) {
        throw new Error("Email không được để trống");
    }

    const isClerk = userId.startsWith("user_");

    // Check if email already exists for another user
    if (!isClerk) {
        const emailExists = await db.query.users.findFirst({
            where: and(
                eq(users.email, email.trim().toLowerCase()),
                ne(users.id, Number(userId))
            ),
        });

        if (emailExists) {
            throw new Error("Email đã được sử dụng bởi người dùng khác");
        }
    } else {
        const emailExists = await db.query.users.findFirst({
            where: and(
                eq(users.email, email.trim().toLowerCase()),
                ne(users.clerkUserId, userId)
            ),
        });

        if (emailExists) {
            throw new Error("Email đã được sử dụng bởi người dùng khác");
        }
    }

    // Update users table
    if (isClerk) {
        await db.update(users)
            .set({ name: userName, email: email.trim().toLowerCase() })
            .where(eq(users.clerkUserId, userId));
    } else {
        await db.update(users)
            .set({ name: userName, email: email.trim().toLowerCase() })
            .where(eq(users.id, Number(userId)));
    }

    // Update userProgress table
    const existingUserProgress = await getUserProgress();
    if (existingUserProgress) {
        await db.update(userProgress)
            .set({
                userName,
            })
            .where(eq(userProgress.userId, userId));
    } else {
        await db.insert(userProgress).values({
            userId,
            userName,
        });
    }

    revalidatePath("/profile");
    revalidatePath("/courses");
    revalidatePath("/learn");
};

export const getUserAccountDetails = async () => {
    const session = await auth();
    const user = session?.user;

    if (!user) {
        throw new Error("Unauthorized");
    }

    const progress = await getUserProgress();

    return {
        name: progress?.userName || user.name || "User",
        email: user.email || "",
        isClerk: user.id.startsWith("user_"),
    };
};
