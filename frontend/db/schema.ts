import {
    boolean,
    date,
    index,
    integer,
    pgTable,
    serial,
    text,
    time,
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

export const localSessions = pgTable(
    "local_sessions",
    {
        sessionId: text("session_id").primaryKey(),
        userId: text("user_id").notNull(),
        tokenHash: text("token_hash").notNull().unique(),
        expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
        revokedAt: timestamp("revoked_at", { withTimezone: true }),
        createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
        updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
    },
    (table) => ({
        userIdx: index("local_sessions_user_idx").on(table.userId),
        expiresAtIdx: index("local_sessions_expires_at_idx").on(table.expiresAt),
    })
);

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
        studyMinutes: integer("study_minutes").notNull().default(0),
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

export const studyTimeSummary = pgTable(
    "study_time_summary",
    {
        userId: text("user_id").primaryKey(),
        totalSeconds: integer("total_seconds").notNull().default(0),
        todaySeconds: integer("today_seconds").notNull().default(0),
        currentDay: date("current_day").notNull(),
        dailyGoalSeconds: integer("daily_goal_seconds").notNull().default(3600),
        createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
        updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
    },
    (table) => ({
        currentDayIdx: index("study_time_summary_current_day_idx").on(table.currentDay),
    })
);

export const emailReminderSettings = pgTable("email_reminder_settings", {
    userId: text("user_id").primaryKey(),
    enabled: boolean("enabled").notNull().default(false),
    reminderTime: time("reminder_time").notNull().default("19:00"),
    lastSentDate: date("last_sent_date"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const chapterOneProgress = pgTable("chapter_one_progress", {
    userId: text("user_id").primaryKey(),
    completedLessons: text("completed_lessons").notNull().default("[]"),
    claimedChests: text("claimed_chests").notNull().default("[]"),
    completedCheckpoint: integer("completed_checkpoint").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const courseProgress = pgTable(
    "course_progress",
    {
        id: serial("id").primaryKey(),
        userId: text("user_id").notNull(),
        courseId: text("course_id").notNull(),
        currentSectionId: text("current_section_id")
            .notNull()
            .default("english-section-1"),
        unlockedSectionIds: text("unlocked_section_ids")
            .notNull()
            .default('["english-section-1"]'),
        completedNodeIds: text("completed_node_ids").notNull().default("[]"),
        claimedRewardNodeIds: text("claimed_reward_node_ids")
            .notNull()
            .default("[]"),
        checkpointScores: text("checkpoint_scores").notNull().default("{}"),
        onboardingStatus: text("onboarding_status"),
        onboardingChoice: text("onboarding_choice"),
        onboardingCompletedAt: timestamp("onboarding_completed_at", {
            withTimezone: true,
        }),
        createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
        updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
    },
    (table) => ({
        userCourseIdx: uniqueIndex("course_progress_user_course_idx").on(
            table.userId,
            table.courseId
        ),
        userIdx: index("course_progress_user_idx").on(table.userId),
    })
);

export const placementTestResults = pgTable(
    "placement_test_results",
    {
        id: serial("id").primaryKey(),
        userId: text("user_id").notNull(),
        courseId: text("course_id").notNull().default("english"),
        testVersion: text("test_version").notNull(),
        totalCorrect: integer("total_correct").notNull().default(0),
        basicScore: integer("basic_score").notNull().default(0),
        intermediateScore: integer("intermediate_score").notNull().default(0),
        advancedScore: integer("advanced_score").notNull().default(0),
        latestAssignedSectionId: text("latest_assigned_section_id")
            .notNull()
            .default("english-section-1"),
        highestAssignedSectionId: text("highest_assigned_section_id")
            .notNull()
            .default("english-section-1"),
        answersJson: text("answers_json").notNull().default("[]"),
        attemptCount: integer("attempt_count").notNull().default(1),
        durationSeconds: integer("duration_seconds"),
        startedAt: timestamp("started_at", { withTimezone: true }),
        completedAt: timestamp("completed_at", { withTimezone: true })
            .notNull()
            .defaultNow(),
        lastSubmissionId: text("last_submission_id"),
        createdAt: timestamp("created_at", { withTimezone: true })
            .notNull()
            .defaultNow(),
        updatedAt: timestamp("updated_at", { withTimezone: true })
            .notNull()
            .defaultNow(),
    },
    (table) => ({
        userCourseIdx: uniqueIndex("placement_test_results_user_course_idx").on(
            table.userId,
            table.courseId
        ),
        userIdx: index("placement_test_results_user_idx").on(table.userId),
    })
);

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


export const learningSyncJobs = pgTable(
    "learning_sync_jobs",
    {
        id: serial("id").primaryKey(),
        userId: text("user_id").notNull(),
        nodeId: text("node_id").notNull(),
        system: text("system").notNull(),
        status: text("status").notNull().default("pending"),
        attempts: integer("attempts").notNull().default(0),
        nextRetryAt: timestamp("next_retry_at", { withTimezone: true })
            .notNull()
            .defaultNow(),
        payloadJson: text("payload_json").notNull().default("{}"),
        lastErrorCode: text("last_error_code"),
        completedAt: timestamp("completed_at", { withTimezone: true }),
        createdAt: timestamp("created_at", { withTimezone: true })
            .notNull()
            .defaultNow(),
        updatedAt: timestamp("updated_at", { withTimezone: true })
            .notNull()
            .defaultNow(),
    },
    (table) => ({
        userNodeSystemIdx: uniqueIndex("learning_sync_jobs_user_node_system_idx").on(
            table.userId,
            table.nodeId,
            table.system
        ),
        pendingRetryIdx: index("learning_sync_jobs_status_retry_idx").on(
            table.status,
            table.nextRetryAt
        ),
        userIdx: index("learning_sync_jobs_user_idx").on(table.userId),
    })
);

export const adaptiveRateLimits = pgTable(
    "adaptive_rate_limits",
    {
        id: text("id").primaryKey(),
        scope: text("scope").notNull(),
        identifierHash: text("identifier_hash").notNull(),
        windowStart: timestamp("window_start", { withTimezone: true }).notNull(),
        requestCount: integer("request_count").notNull().default(0),
        expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
        createdAt: timestamp("created_at", { withTimezone: true })
            .notNull()
            .defaultNow(),
        updatedAt: timestamp("updated_at", { withTimezone: true })
            .notNull()
            .defaultNow(),
    },
    (table) => ({
        scopeIdentifierWindowIdx: uniqueIndex(
            "adaptive_rate_limits_scope_identifier_window_idx"
        ).on(table.scope, table.identifierHash, table.windowStart),
        expiresAtIdx: index("adaptive_rate_limits_expires_at_idx").on(
            table.expiresAt
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
    studyTimeSummary: one(studyTimeSummary, {
        fields: [userProgress.userId],
        references: [studyTimeSummary.userId],
    }),
    chapterOneProgress: one(chapterOneProgress, {
        fields: [userProgress.userId],
        references: [chapterOneProgress.userId],
    }),
    courseProgress: many(courseProgress),
    placementTestResults: many(placementTestResults),
    xpEvents: many(xpEvents),
    lessonXpClaims: many(lessonXpClaims),
    questDailyStats: many(questDailyStats),
    questRewardClaims: many(questRewardClaims),
    learningSyncJobs: many(learningSyncJobs),
}));

export const localSessionsRelations = relations(localSessions, ({ one }) => ({
    userProgress: one(userProgress, {
        fields: [localSessions.userId],
        references: [userProgress.userId],
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

export const userXpSummaryRelations = relations(userXpSummary, ({ one }) => ({
    userProgress: one(userProgress, {
        fields: [userXpSummary.userId],
        references: [userProgress.userId],
    }),
}));

export const studyTimeSummaryRelations = relations(studyTimeSummary, ({ one }) => ({
    userProgress: one(userProgress, {
        fields: [studyTimeSummary.userId],
        references: [userProgress.userId],
    }),
}));

export const chapterOneProgressRelations = relations(chapterOneProgress, ({ one }) => ({
    userProgress: one(userProgress, {
        fields: [chapterOneProgress.userId],
        references: [userProgress.userId],
    }),
}));

export const courseProgressRelations = relations(courseProgress, ({ one }) => ({
    userProgress: one(userProgress, {
        fields: [courseProgress.userId],
        references: [userProgress.userId],
    }),
}));

export const placementTestResultsRelations = relations(
    placementTestResults,
    ({ one }) => ({
        userProgress: one(userProgress, {
            fields: [placementTestResults.userId],
            references: [userProgress.userId],
        }),
    })
);

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


export const learningSyncJobsRelations = relations(learningSyncJobs, ({ one }) => ({
    userProgress: one(userProgress, {
        fields: [learningSyncJobs.userId],
        references: [userProgress.userId],
    }),
}));

export type UserStreak = typeof userStreaks.$inferSelect;
export type NewUserStreak = typeof userStreaks.$inferInsert;
export type DailyStreakLog = typeof dailyStreakLogs.$inferSelect;
export type NewDailyStreakLog = typeof dailyStreakLogs.$inferInsert;
export type UserXpSummary = typeof userXpSummary.$inferSelect;
export type NewUserXpSummary = typeof userXpSummary.$inferInsert;
export type StudyTimeSummary = typeof studyTimeSummary.$inferSelect;
export type NewStudyTimeSummary = typeof studyTimeSummary.$inferInsert;
export type ChapterOneProgress = typeof chapterOneProgress.$inferSelect;
export type NewChapterOneProgress = typeof chapterOneProgress.$inferInsert;
export type CourseProgress = typeof courseProgress.$inferSelect;
export type NewCourseProgress = typeof courseProgress.$inferInsert;
export type LocalSession = typeof localSessions.$inferSelect;
export type NewLocalSession = typeof localSessions.$inferInsert;
export type PlacementTestResult = typeof placementTestResults.$inferSelect;
export type NewPlacementTestResult = typeof placementTestResults.$inferInsert;
export type XpEvent = typeof xpEvents.$inferSelect;
export type NewXpEvent = typeof xpEvents.$inferInsert;
export type LessonXpClaim = typeof lessonXpClaims.$inferSelect;
export type NewLessonXpClaim = typeof lessonXpClaims.$inferInsert;
export type QuestDailyStat = typeof questDailyStats.$inferSelect;
export type NewQuestDailyStat = typeof questDailyStats.$inferInsert;
export type QuestRewardClaim = typeof questRewardClaims.$inferSelect;
export type NewQuestRewardClaim = typeof questRewardClaims.$inferInsert;
export type LearningSyncJob = typeof learningSyncJobs.$inferSelect;
export type NewLearningSyncJob = typeof learningSyncJobs.$inferInsert;
export type AdaptiveRateLimit = typeof adaptiveRateLimits.$inferSelect;
export type NewAdaptiveRateLimit = typeof adaptiveRateLimits.$inferInsert;
