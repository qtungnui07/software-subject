import type {
  CourseOnboardingState,
  OnboardingChoice,
  OnboardingStatus,
} from "@/types/onboarding";

export const ONBOARDING_COURSE_ID = "english" as const;

export const isOnboardingStatus = (
  value: unknown,
): value is OnboardingStatus =>
  value === "pending" ||
  value === "placement_in_progress" ||
  value === "completed";

export const isOnboardingChoice = (
  value: unknown,
): value is Exclude<OnboardingChoice, null> =>
  value === "basic" || value === "placement";

export const createPendingOnboardingState = (): CourseOnboardingState => ({
  courseId: ONBOARDING_COURSE_ID,
  status: "pending",
  choice: null,
  completedAt: null,
});

export const normalizeOnboardingState = (
  value: Partial<CourseOnboardingState> | null | undefined,
): CourseOnboardingState => {
  const status = isOnboardingStatus(value?.status)
    ? value.status
    : "pending";
  const choice = isOnboardingChoice(value?.choice) ? value.choice : null;
  const completedAt =
    status === "completed" &&
    typeof value?.completedAt === "string" &&
    !Number.isNaN(Date.parse(value.completedAt))
      ? value.completedAt
      : null;

  return {
    courseId: ONBOARDING_COURSE_ID,
    status,
    choice,
    completedAt,
  };
};

export const startPlacementOnboarding = (
  current: CourseOnboardingState,
): CourseOnboardingState => ({
  ...normalizeOnboardingState(current),
  status: "placement_in_progress",
  choice: "placement",
  completedAt: null,
});

export const completeBasicOnboarding = (
  current: CourseOnboardingState,
  completedAt = new Date().toISOString(),
): CourseOnboardingState => ({
  ...normalizeOnboardingState(current),
  status: "completed",
  choice: "basic",
  completedAt,
});

export const completePlacementOnboarding = (
  current: CourseOnboardingState,
  completedAt = new Date().toISOString(),
): CourseOnboardingState => ({
  ...normalizeOnboardingState(current),
  status: "completed",
  choice: "placement",
  completedAt,
});

export const migrateLegacyOnboardingState = (
  current: CourseOnboardingState,
  hasLegacyLearningActivity: boolean,
  completedAt = new Date().toISOString(),
): CourseOnboardingState => {
  const normalized = normalizeOnboardingState(current);
  if (normalized.status !== "pending" || !hasLegacyLearningActivity) {
    return normalized;
  }

  return {
    ...normalized,
    status: "completed",
    choice: null,
    completedAt,
  };
};

export const repairSpuriousLegacyCompletion = (
  current: CourseOnboardingState,
  hasLearningActivity: boolean,
): CourseOnboardingState => {
  const normalized = normalizeOnboardingState(current);

  if (
    normalized.status !== "completed" ||
    normalized.choice !== null ||
    hasLearningActivity
  ) {
    return normalized;
  }

  return createPendingOnboardingState();
};
