import "server-only";

import { eq } from "drizzle-orm";

import db from "@/db/drizzle";
import { chapterOneProgress } from "@/db/schema";
import {
  normalizeChapterOneProgressState,
  type ChapterOneProgressState,
} from "@/lib/chapter-one-progress";

type StoredChapterOneProgress = {
  completedLessons: string;
  claimedChests: string;
  completedCheckpoint: number;
  updatedAt: Date;
};

const parseJsonArray = (value: string) => {
  try {
    const parsed = JSON.parse(value);

    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const toProgressState = (row: StoredChapterOneProgress | null): ChapterOneProgressState => {
  return normalizeChapterOneProgressState({
    completedLessons: row ? parseJsonArray(row.completedLessons) : [],
    claimedChests: row ? parseJsonArray(row.claimedChests) : [],
    completedCheckpoint: Boolean(row?.completedCheckpoint),
    updatedAt: row?.updatedAt?.toISOString(),
  });
};

export const getChapterOneProgressForUser = async (userId: string) => {
  const row = await db.query.chapterOneProgress.findFirst({
    where: eq(chapterOneProgress.userId, userId),
  });

  return toProgressState(row ?? null);
};

export const saveChapterOneProgressForUser = async (
  userId: string,
  state: ChapterOneProgressState
) => {
  const nextState = normalizeChapterOneProgressState(state);
  const [row] = await db
    .insert(chapterOneProgress)
    .values({
      userId,
      completedLessons: JSON.stringify(nextState.completedLessons),
      claimedChests: JSON.stringify(nextState.claimedChests),
      completedCheckpoint: nextState.completedCheckpoint ? 1 : 0,
      updatedAt: new Date(),
    })
    .onConflictDoUpdate({
      target: chapterOneProgress.userId,
      set: {
        completedLessons: JSON.stringify(nextState.completedLessons),
        claimedChests: JSON.stringify(nextState.claimedChests),
        completedCheckpoint: nextState.completedCheckpoint ? 1 : 0,
        updatedAt: new Date(),
      },
    })
    .returning();

  return toProgressState(row);
};
