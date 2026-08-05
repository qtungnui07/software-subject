import {
  getCourseNodes,
  getSectionById,
} from "@/lib/courses/course-catalog";
import type {
  CourseDefinition,
  CourseId,
  LearningNodeDefinition,
} from "@/types/course";
import type { OnboardingChoice, OnboardingStatus } from "@/types/onboarding";

export type CourseProgressState = {
  courseId: CourseId;
  currentSectionId: string;
  unlockedSectionIds: string[];
  completedNodeIds: string[];
  claimedRewardNodeIds: string[];
  checkpointScores: Record<string, number>;
  onboardingStatus: OnboardingStatus;
  onboardingChoice: OnboardingChoice;
  onboardingCompletedAt: string | null;
  updatedAt: string;
};

export type CourseProgressSummary = {
  completedNodes: number;
  totalNodes: number;
  percent: number;
  currentSectionId: string;
};

const uniqueStrings = (value: unknown) => {
  if (!Array.isArray(value)) return [];

  return Array.from(
    new Set(value.filter((item): item is string => typeof item === "string"))
  );
};

const sortIdsByOrder = (
  ids: string[],
  nodes: LearningNodeDefinition[]
) => {
  const orderById = new Map(nodes.map((node, index) => [node.id, index]));

  return [...ids].sort(
    (left, right) =>
      (orderById.get(left) ?? Number.MAX_SAFE_INTEGER) -
      (orderById.get(right) ?? Number.MAX_SAFE_INTEGER)
  );
};

const normalizeCheckpointScores = (
  value: unknown,
  checkpointIds: Set<string>
) => {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};

  const scores: Record<string, number> = {};

  Object.entries(value).forEach(([checkpointId, rawScore]) => {
    if (!checkpointIds.has(checkpointId)) return;

    const numericScore = Number(rawScore);
    if (!Number.isFinite(numericScore)) return;

    scores[checkpointId] = Math.round(Math.min(100, Math.max(0, numericScore)) * 100) / 100;
  });

  return scores;
};

export const createDefaultCourseProgress = (
  course: CourseDefinition,
): CourseProgressState => {
  const firstSection = [...course.sections].sort((a, b) => a.order - b.order)[0];
  if (!firstSection) throw new Error(`Course ${course.id} has no section.`);

  return {
    courseId: course.id,
    currentSectionId: firstSection.id,
    unlockedSectionIds: [firstSection.id],
    completedNodeIds: [],
    claimedRewardNodeIds: [],
    checkpointScores: {},
    onboardingStatus: "pending",
    onboardingChoice: null,
    onboardingCompletedAt: null,
    updatedAt: new Date().toISOString(),
  };
};

export const normalizeCourseProgressState = (
  state: Partial<CourseProgressState>,
  course: CourseDefinition,
): CourseProgressState => {
  const requestedCourseId = state.courseId ?? course.id;
  if (
    requestedCourseId !== course.id &&
    !course.legacyIds.includes(requestedCourseId)
  ) {
    throw new Error(`Unknown course: ${requestedCourseId}`);
  }

  const defaultState = createDefaultCourseProgress(course);
  const sectionIds = new Set(course.sections.map((section) => section.id));
  const orderedSections = [...course.sections].sort((a, b) => a.order - b.order);
  const nodes = getCourseNodes(course, course.id);
  const completedIds = new Set(
    nodes.filter((node) => node.type !== "chest").map((node) => node.id)
  );
  const rewardIds = new Set(
    nodes.filter((node) => node.type === "chest").map((node) => node.id)
  );
  const checkpointIds = new Set(
    nodes.filter((node) => node.type === "checkpoint").map((node) => node.id)
  );

  const requestedUnlockedIds = uniqueStrings(state.unlockedSectionIds);
  const highestRequestedOrder = orderedSections.reduce(
    (highestOrder, section) =>
      requestedUnlockedIds.includes(section.id)
        ? Math.max(highestOrder, section.order)
        : highestOrder,
    orderedSections[0]?.order ?? 1
  );
  const unlockedSectionIds = orderedSections
    .filter((section) => section.order <= highestRequestedOrder)
    .map((section) => section.id);

  if (!unlockedSectionIds.includes(defaultState.currentSectionId)) {
    unlockedSectionIds.unshift(defaultState.currentSectionId);
  }

  const requestedCurrentSectionId = state.currentSectionId;
  const currentSectionId =
    typeof requestedCurrentSectionId === "string" &&
    sectionIds.has(requestedCurrentSectionId) &&
    unlockedSectionIds.includes(requestedCurrentSectionId)
      ? requestedCurrentSectionId
      : unlockedSectionIds.at(-1) ?? defaultState.currentSectionId;

  const completedNodeIds = sortIdsByOrder(
    uniqueStrings(state.completedNodeIds).filter((id) => completedIds.has(id)),
    nodes
  );
  const claimedRewardNodeIds = sortIdsByOrder(
    uniqueStrings(state.claimedRewardNodeIds).filter((id) => rewardIds.has(id)),
    nodes
  );

  return {
    courseId: course.id,
    currentSectionId,
    unlockedSectionIds,
    completedNodeIds,
    claimedRewardNodeIds,
    checkpointScores: normalizeCheckpointScores(
      state.checkpointScores,
      checkpointIds
    ),
    onboardingStatus:
      state.onboardingStatus === "placement_in_progress" ||
      state.onboardingStatus === "completed"
        ? state.onboardingStatus
        : "pending",
    onboardingChoice:
      state.onboardingChoice === "basic" || state.onboardingChoice === "placement"
        ? state.onboardingChoice
        : null,
    onboardingCompletedAt:
      state.onboardingStatus === "completed" &&
      typeof state.onboardingCompletedAt === "string" &&
      !Number.isNaN(Date.parse(state.onboardingCompletedAt))
        ? state.onboardingCompletedAt
        : null,
    updatedAt:
      typeof state.updatedAt === "string"
        ? state.updatedAt
        : new Date().toISOString(),
  };
};

export const unlockCourseSection = (
  state: CourseProgressState,
  sectionId: string,
  course: CourseDefinition,
) => {
  const section = getSectionById(course, sectionId);
  if (!section || section.courseId !== state.courseId) {
    return normalizeCourseProgressState(state, course);
  }

  return normalizeCourseProgressState(
    {
      ...state,
      currentSectionId: sectionId,
      unlockedSectionIds: [...state.unlockedSectionIds, sectionId],
      updatedAt: new Date().toISOString(),
    },
    course,
  );
};

export const getCurrentNodeIdForSection = (
  state: CourseProgressState,
  sectionId: string,
  course: CourseDefinition,
) => {
  const section = getSectionById(course, sectionId);
  if (!section || section.courseId !== state.courseId) return null;

  for (const node of [...section.chapter.nodes].sort((a, b) => a.order - b.order)) {
    if (node.type === "chest") continue;

    if (!state.completedNodeIds.includes(node.id)) return node.id;
  }

  return section.chapter.nodes.at(-1)?.id ?? null;
};

export const getCourseProgressSummary = (
  state: CourseProgressState,
  course: CourseDefinition,
): CourseProgressSummary => {
  const nodes = getCourseNodes(course, state.courseId).filter(
    (node) => node.countsTowardProgress
  );
  const completedNodeIds = new Set(state.completedNodeIds);
  const completedNodes = nodes.filter((node) => completedNodeIds.has(node.id)).length;

  return {
    completedNodes,
    totalNodes: nodes.length,
    percent:
      nodes.length === 0 ? 0 : Math.round((completedNodes / nodes.length) * 100),
    currentSectionId: state.currentSectionId,
  };
};
