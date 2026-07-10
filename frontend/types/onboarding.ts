import type { CourseId } from "@/types/course";

export type OnboardingStatus =
  | "pending"
  | "placement_in_progress"
  | "completed";

export type OnboardingChoice = "basic" | "placement" | null;

export type CourseOnboardingState = {
  courseId: CourseId;
  status: OnboardingStatus;
  choice: OnboardingChoice;
  completedAt: string | null;
};

export type OnboardingApiResponse = {
  success: true;
  onboarding: CourseOnboardingState;
};
