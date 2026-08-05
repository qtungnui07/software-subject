import type { ChapterOneProgressState } from "@/lib/chapter-one-progress";
import type { CourseProgressState } from "@/lib/courses/course-progress";
import type { CourseDefinition } from "@/types/course";

export const ENGLISH_SECTION_ONE_ID = "english-section-1";
export const ENGLISH_SECTION_ONE_CHECKPOINT_ID = "chapter-1-test";

const mergeUniqueIds = (...groups: string[][]) =>
  Array.from(new Set(groups.flat()));

const getSectionOne = (course: CourseDefinition) =>
  course.sections.find((section) => section.order === 1) ?? course.sections[0];

const getSectionOneNodes = (course: CourseDefinition) =>
  getSectionOne(course)?.chapter.nodes ?? [];

const normalizeLegacyProgress = (
  state: Partial<ChapterOneProgressState>,
  course: CourseDefinition,
): ChapterOneProgressState => {
  const nodes = getSectionOneNodes(course);
  const lessonIds = new Set(
    nodes.filter((node) => node.type === "lesson").map((node) => node.id),
  );
  const chestIds = new Set(
    nodes.filter((node) => node.type === "chest").map((node) => node.id),
  );
  const checkpoint = nodes.find((node) => node.type === "checkpoint");
  const completedLessons = Array.from(
    new Set(
      (state.completedLessons ?? []).filter((id) => lessonIds.has(id)),
    ),
  );
  const claimedChests = Array.from(
    new Set((state.claimedChests ?? []).filter((id) => chestIds.has(id))),
  );
  const currentNodeId =
    nodes.find(
      (node) =>
        node.type !== "chest" &&
        !completedLessons.includes(node.id) &&
        !(node.type === "checkpoint" && state.completedCheckpoint),
    )?.id ??
    checkpoint?.id ??
    nodes[0]?.id ??
    "";

  return {
    completedLessons,
    claimedChests,
    completedCheckpoint: Boolean(state.completedCheckpoint),
    currentNodeId,
    updatedAt:
      typeof state.updatedAt === "string"
        ? state.updatedAt
        : new Date().toISOString(),
  };
};

export const migrateChapterOneProgressToCourseProgress = (
  legacyState: Partial<ChapterOneProgressState>,
  course: CourseDefinition,
  existingState?: CourseProgressState,
): CourseProgressState => {
  const normalizedLegacy = normalizeLegacyProgress(legacyState, course);
  const firstSection = getSectionOne(course);
  if (!firstSection) {
    throw new Error(`Course ${course.id} has no sections.`);
  }
  const checkpoint = firstSection.chapter.nodes.find(
    (node) => node.type === "checkpoint",
  );
  const completedNodeIds = [
    ...normalizedLegacy.completedLessons,
    ...(normalizedLegacy.completedCheckpoint && checkpoint
      ? [checkpoint.id]
      : []),
  ];
  const legacyCheckpointScores =
    normalizedLegacy.completedCheckpoint && checkpoint
      ? { [checkpoint.id]: 100 }
      : {};

  return {
    courseId: course.id,
    currentSectionId: existingState?.currentSectionId ?? firstSection.id,
    unlockedSectionIds: mergeUniqueIds(
      [firstSection.id],
      existingState?.unlockedSectionIds ?? [],
    ),
    completedNodeIds: mergeUniqueIds(
      completedNodeIds,
      existingState?.completedNodeIds ?? [],
    ),
    claimedRewardNodeIds: mergeUniqueIds(
      normalizedLegacy.claimedChests,
      existingState?.claimedRewardNodeIds ?? [],
    ),
    checkpointScores: {
      ...legacyCheckpointScores,
      ...(existingState?.checkpointScores ?? {}),
    },
    onboardingStatus: existingState?.onboardingStatus ?? "completed",
    onboardingChoice: existingState?.onboardingChoice ?? null,
    onboardingCompletedAt:
      existingState?.onboardingCompletedAt ??
      normalizedLegacy.updatedAt ??
      new Date().toISOString(),
    updatedAt:
      existingState?.updatedAt ??
      normalizedLegacy.updatedAt ??
      new Date().toISOString(),
  };
};

export const projectCourseProgressToChapterOne = (
  state: CourseProgressState,
  course: CourseDefinition,
): ChapterOneProgressState => {
  const nodes = getSectionOneNodes(course);
  const lessonIds = new Set(
    nodes.filter((node) => node.type === "lesson").map((node) => node.id),
  );
  const chestIds = new Set(
    nodes.filter((node) => node.type === "chest").map((node) => node.id),
  );
  const checkpoint = nodes.find((node) => node.type === "checkpoint");

  return normalizeLegacyProgress(
    {
      completedLessons: state.completedNodeIds.filter((id) =>
        lessonIds.has(id),
      ),
      claimedChests: state.claimedRewardNodeIds.filter((id) =>
        chestIds.has(id),
      ),
      completedCheckpoint: checkpoint
        ? state.completedNodeIds.includes(checkpoint.id) ||
          (state.checkpointScores[checkpoint.id] ?? 0) >= 70
        : false,
      updatedAt: state.updatedAt,
    },
    course,
  );
};
