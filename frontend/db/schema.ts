import {
    date,
    integer,
    pgTable,
    serial,
    text,
    timestamp,
    uniqueIndex,
} from "drizzle-orm/pg-core";

import { relations } from "drizzle-orm";

export const users = pgTable("users", {
    id: serial("id").primaryKey(),
    clerkUserId: text("clerk_user_id").unique(),
    name: text("name").notNull().default("User"),
    email: text("email").notNull().unique(),
    passwordHash: text("password_hash"),
    imageSrc: text("image_src").notNull().default("/mascot.svg"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const courses = pgTable("courses", {
    id: serial("id").primaryKey(),
    title: text("title").notNull(),
    imageSrc: text("imageSrc").notNull(),
});

export const coursesRelations = relations(courses, ({ many }) => ({
    userProgress: many(userProgress),
}));

export const userProgress = pgTable("user_progress", {
    userId: text("user_id").primaryKey(),
    userName: text("user_name").notNull().default("User"),
    userImageSrc: text("user_image_src").notNull().default("/mascot.svg"),
    activeCourseId: integer("active_course_id").references(() => courses.id, {
        onDelete: "cascade",
    }),
    hearts: integer("hearts").notNull().default(5),
    points: integer("points").notNull().default(0),
});

export const userStreaks = pgTable("user_streaks", {
    userId: text("user_id").primaryKey(),
    currentStreak: integer("current_streak").notNull().default(0),
    longestStreak: integer("longest_streak").notNull().default(0),
    streakFreezes: integer("streak_freezes").notNull().default(0),
    lastStudyDate: date("last_study_date"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const dailyStreakLogs = pgTable(
    "daily_streak_logs",
    {
        id: serial("id").primaryKey(),
        userId: text("user_id").notNull(),
        studyDate: date("study_date").notNull(),
        completedLessons: integer("completed_lessons").notNull().default(0),
        earnedXp: integer("earned_xp").notNull().default(0),
        createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
        updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
    },
    (table) => ({
        userDateIdx: uniqueIndex("daily_streak_logs_user_date_idx").on(
            table.userId,
            table.studyDate
        ),
    })
);

export const UserProgressRelations = relations(userProgress, ({ one }) => ({
    activeCourse: one(courses, {
        fields: [userProgress.activeCourseId],
        references: [courses.id],
    }),
    streak: one(userStreaks, {
        fields: [userProgress.userId],
        references: [userStreaks.userId],
    }),
}));

export const userStreaksRelations = relations(userStreaks, ({ many, one }) => ({
    userProgress: one(userProgress, {
        fields: [userStreaks.userId],
        references: [userProgress.userId],
    }),
    dailyLogs: many(dailyStreakLogs),
}));

export const dailyStreakLogsRelations = relations(dailyStreakLogs, ({ one }) => ({
    streak: one(userStreaks, {
        fields: [dailyStreakLogs.userId],
        references: [userStreaks.userId],
    }),
}));

export type UserStreak = typeof userStreaks.$inferSelect;
export type NewUserStreak = typeof userStreaks.$inferInsert;
export type DailyStreakLog = typeof dailyStreakLogs.$inferSelect;
export type NewDailyStreakLog = typeof dailyStreakLogs.$inferInsert;
