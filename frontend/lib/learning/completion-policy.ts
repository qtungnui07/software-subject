import { getLearningNodeById } from "@/lib/courses/course-catalog";
import type { CourseDefinition } from "@/types/course";

export const LESSON_COMPLETION_THRESHOLD = 60;
export const CHECKPOINT_COMPLETION_THRESHOLD = 70;

export type LearningCompletionPolicyResult = {
  nodeId: string;
  nodeType: "lesson" | "checkpoint";
  accuracy: number;
  passThreshold: number;
  passed: boolean;
};

export const normalizeCompletionAccuracy = (value: unknown) => {
  const numeric = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(numeric)) return null;
  return Math.min(100, Math.max(0, Math.round(numeric)));
};

export const normalizeCompletionDurationSeconds = (value: unknown) => {
  const numeric = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(numeric)) return 0;
  return Math.max(0, Math.trunc(numeric));
};

export const isUuid = (value: unknown): value is string =>
  typeof value === "string" &&
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value,
  );

export const getLearningCompletionPolicy = (
  nodeId: string,
  accuracy: number,
  course: CourseDefinition,
): LearningCompletionPolicyResult | null => {
  const node = getLearningNodeById(course, nodeId);
  if (!node || node.type === "chest") return null;

  const passThreshold =
    node.type === "checkpoint"
      ? CHECKPOINT_COMPLETION_THRESHOLD
      : LESSON_COMPLETION_THRESHOLD;

  return {
    nodeId: node.id,
    nodeType: node.type,
    accuracy,
    passThreshold,
    passed: accuracy >= passThreshold,
  };
};
