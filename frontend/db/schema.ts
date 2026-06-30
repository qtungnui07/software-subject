import {
    date,
    index,
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
    league: integer("league").notNull().default(1),
    statusEmoji: text("status_emoji"),
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

export const userXpSummary = pgTable("user_xp_summary", {
    userId: text("user_id").primaryKey(),
    totalXp: integer("total_xp").notNull().default(0),
    dailyXp: integer("daily_xp").notNull().default(0),
    weeklyXp: integer("weekly_xp").notNull().default(0),
    currentDay: date("current_day"),
    currentWeekStart: date("current_week_start"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const xpEvents = pgTable(
    "xp_events",
    {
        id: serial("id").primaryKey(),
        userId: text("user_id").notNull(),
        lessonId: text("lesson_id").notNull(),
        earnedXp: integer("earned_xp").notNull().default(0),
        baseXp: integer("base_xp").notNull().default(0),
        accuracyBonus: integer("accuracy_bonus").notNull().default(0),
        accuracy: integer("accuracy").notNull().default(0),
        rewardType: text("reward_type").notNull(),
        eventDate: date("event_date").notNull(),
        weekStart: date("week_start").notNull(),
        createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    },
    (table) => ({
        userCreatedAtIdx: index("xp_events_user_created_at_idx").on(
            table.userId,
            table.createdAt
        ),
        userLessonIdx: index("xp_events_user_lesson_idx").on(
            table.userId,
            table.lessonId
        ),
        weekStartIdx: index("xp_events_week_start_idx").on(table.weekStart),
    })
);

export const lessonXpClaims = pgTable(
    "lesson_xp_claims",
    {
        id: serial("id").primaryKey(),
        userId: text("user_id").notNull(),
        lessonId: text("lesson_id").notNull(),
        earnedXp: integer("earned_xp").notNull().default(0),
        accuracy: integer("accuracy").notNull().default(0),
        firstCompletedAt: timestamp("first_completed_at", { withTimezone: true })
            .notNull()
            .defaultNow(),
        updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
    },
    (table) => ({
        userLessonIdx: uniqueIndex("lesson_xp_claims_user_lesson_idx").on(
            table.userId,
            table.lessonId
        ),
        userIdx: index("lesson_xp_claims_user_idx").on(table.userId),
    })
);

export const questDailyStats = pgTable(
    "quest_daily_stats",
    {
        id: serial("id").primaryKey(),
        userId: text("user_id").notNull(),
        statDate: date("stat_date").notNull(),
        lessonsCompleted: integer("lessons_completed").notNull().default(0),
        xpEarned: integer("xp_earned").notNull().default(0),
        minutesLearned: integer("minutes_learned").notNull().default(0),
        bestAccuracy: integer("best_accuracy").notNull().default(0),
        createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
        updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
    },
    (table) => ({
        userDateIdx: uniqueIndex("quest_daily_stats_user_date_idx").on(
            table.userId,
            table.statDate
        ),
        userIdx: index("quest_daily_stats_user_idx").on(table.userId),
        statDateIdx: index("quest_daily_stats_stat_date_idx").on(table.statDate),
    })
);

export const questRewardClaims = pgTable(
    "quest_reward_claims",
    {
        id: serial("id").primaryKey(),
        userId: text("user_id").notNull(),
        questId: text("quest_id").notNull(),
        claimDate: date("claim_date").notNull(),
        rewardType: text("reward_type").notNull().default("quest"),
        rewardXp: integer("reward_xp").notNull().default(0),
        createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    },
    (table) => ({
        userQuestDateIdx: uniqueIndex("quest_reward_claims_user_quest_date_idx").on(
            table.userId,
            table.questId,
            table.claimDate
        ),
        userDateIdx: index("quest_reward_claims_user_date_idx").on(
            table.userId,
            table.claimDate
        ),
    })
);

export const UserProgressRelations = relations(userProgress, ({ one, many }) => ({
    activeCourse: one(courses, {
        fields: [userProgress.activeCourseId],
        references: [courses.id],
    }),
    streak: one(userStreaks, {
        fields: [userProgress.userId],
        references: [userStreaks.userId],
    }),
    xpSummary: one(userXpSummary, {
        fields: [userProgress.userId],
        references: [userXpSummary.userId],
    }),
    xpEvents: many(xpEvents),
    lessonXpClaims: many(lessonXpClaims),
    questDailyStats: many(questDailyStats),
    questRewardClaims: many(questRewardClaims),
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

export const userXpSummaryRelations = relations(userXpSummary, ({ one }) => ({
    userProgress: one(userProgress, {
        fields: [userXpSummary.userId],
        references: [userProgress.userId],
    }),
}));

export const xpEventsRelations = relations(xpEvents, ({ one }) => ({
    userProgress: one(userProgress, {
        fields: [xpEvents.userId],
        references: [userProgress.userId],
    }),
}));

export const lessonXpClaimsRelations = relations(lessonXpClaims, ({ one }) => ({
    userProgress: one(userProgress, {
        fields: [lessonXpClaims.userId],
        references: [userProgress.userId],
    }),
}));

export const questDailyStatsRelations = relations(questDailyStats, ({ one }) => ({
    userProgress: one(userProgress, {
        fields: [questDailyStats.userId],
        references: [userProgress.userId],
    }),
}));

export const questRewardClaimsRelations = relations(questRewardClaims, ({ one }) => ({
    userProgress: one(userProgress, {
        fields: [questRewardClaims.userId],
        references: [userProgress.userId],
    }),
}));

export type UserStreak = typeof userStreaks.$inferSelect;
export type NewUserStreak = typeof userStreaks.$inferInsert;
export type DailyStreakLog = typeof dailyStreakLogs.$inferSelect;
export type NewDailyStreakLog = typeof dailyStreakLogs.$inferInsert;
export type UserXpSummary = typeof userXpSummary.$inferSelect;
export type NewUserXpSummary = typeof userXpSummary.$inferInsert;
export type XpEvent = typeof xpEvents.$inferSelect;
export type NewXpEvent = typeof xpEvents.$inferInsert;
export type LessonXpClaim = typeof lessonXpClaims.$inferSelect;
export type NewLessonXpClaim = typeof lessonXpClaims.$inferInsert;
export type QuestDailyStat = typeof questDailyStats.$inferSelect;
export type NewQuestDailyStat = typeof questDailyStats.$inferInsert;
export type QuestRewardClaim = typeof questRewardClaims.$inferSelect;
export type NewQuestRewardClaim = typeof questRewardClaims.$inferInsert;
