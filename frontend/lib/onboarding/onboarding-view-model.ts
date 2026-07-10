import type { CourseOnboardingState } from "@/types/onboarding";

export type OnboardingViewModel = CourseOnboardingState & {
  isPlacementInProgress: boolean;
  isCompleted: boolean;
};

export const buildOnboardingViewModel = (
  state: CourseOnboardingState,
): OnboardingViewModel => ({
  ...state,
  isPlacementInProgress: state.status === "placement_in_progress",
  isCompleted: state.status === "completed",
});
