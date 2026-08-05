import "server-only";

import {
  backendRequest,
  type BackendResult,
} from "@/services/backend-client";
import type { CourseDefinition } from "@/types/course";
import type { Exercise } from "@/types/exercise";
import type { LessonDetailContent } from "@/types/lesson-detail";
import type {
  PlacementTestGetResponse,
  PlacementTestScore,
  PlacementTestSubmission,
} from "@/types/placement-test";
import type { QuestDefinition } from "@/types/quest";
import type {
  CheckpointExerciseAssessment,
  CheckpointScoreResult,
  CheckpointSubmission,
  PublicCheckpointExercise,
} from "@/types/checkpoint";

export type ContentNode = {
  id: string;
  type: "lesson" | "chest" | "checkpoint";
  title: string;
  shortTitle: string;
  description: string;
  order: number;
  unlockAfterId: string | null;
  href: string | null;
  xp: number;
  countsTowardProgress: boolean;
  contentStatus: "ready" | "placeholder";
  courseId: string;
  section: { id: string; title: string; order: number };
  chapter: { id: string; title: string; order: number };
  detail: LessonDetailContent | null;
  exerciseSummary: {
    count: number;
    types: Exercise["type"][];
    skills: Exercise["skill"][];
  };
};

const unwrap = <T>(result: BackendResult<unknown>, key: string) => {
  if (!result.ok) throw new Error(result.data.error);
  const value = (result.data as Record<string, unknown>)[key];
  if (value === undefined || value === null) {
    throw new Error(`Backend content response is missing ${key}`);
  }
  return value as T;
};

export const getContentCourses = async () =>
  unwrap<Array<{
    databaseId: number;
    id: string;
    title: string;
    imageSrc: string;
  }>>(await backendRequest("/content/courses"), "courses");

export const getContentCourse = async (courseId: string) =>
  unwrap<CourseDefinition>(
    await backendRequest(`/content/courses/${encodeURIComponent(courseId)}`, {
      cache: "no-store",
    }),
    "course",
  );

export const getContentNode = async (nodeId: string) =>
  unwrap<ContentNode>(
    await backendRequest(`/content/nodes/${encodeURIComponent(nodeId)}`, {
      cache: "no-store",
    }),
    "node",
  );

export const getContentCheckpoint = async (checkpointId: string) =>
  unwrap<{
    checkpointId: string;
    title: string;
    description: string;
    passThreshold: number;
    estimatedMinutes: number;
    exercises: PublicCheckpointExercise[];
    assessments: CheckpointExerciseAssessment[];
  }>(
    await backendRequest(
      `/content/checkpoints/${encodeURIComponent(checkpointId)}`,
      { cache: "no-store" },
    ),
    "checkpoint",
  );

export const gradeContentCheckpoint = async (
  submission: CheckpointSubmission,
) =>
  unwrap<CheckpointScoreResult & { passThreshold: number }>(
    await backendRequest("/content/checkpoints/grade", {
      method: "POST",
      body: submission,
      cache: "no-store",
    }),
    "score",
  );

export const getContentPlacementTest = async () =>
  unwrap<{
    testVersion: PlacementTestGetResponse["testVersion"];
    totalQuestions: number;
    questions: PlacementTestGetResponse["questions"];
  }>(
    await backendRequest("/content/placement-test?courseId=english", {
      cache: "no-store",
    }),
    "test",
  );

export const gradeContentPlacementTest = async (
  submission: PlacementTestSubmission,
) =>
  unwrap<PlacementTestScore>(
    await backendRequest("/content/placement-test/grade", {
      method: "POST",
      body: submission,
      cache: "no-store",
    }),
    "score",
  );

export const getContentQuestDefinitions = async () =>
  unwrap<QuestDefinition[]>(
    await backendRequest("/content/quests", { cache: "no-store" }),
    "quests",
  );
