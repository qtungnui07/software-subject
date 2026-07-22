import type {
  Exercise,
  ExerciseAnswer,
  ExerciseCheckResult,
} from "@/types/exercise";
import type { LearningCompletionResult } from "@/types/learning-completion";
import type { AssessmentMode } from "@/types/learning-session-draft";

export type CheckpointSkillCategory =
  | "vocabulary"
  | "grammar"
  | "reading"
  | "listening"
  | "conversation"
  | "writing";

export type CheckpointSkillTag =
  | "introductions"
  | "daily-routine"
  | "cafe-order"
  | "directions"
  | "making-plans"
  | "weekend-mission";

export type CheckpointExerciseAssessment = {
  exerciseId: string;
  weight: number;
  category: CheckpointSkillCategory;
  skillTags: CheckpointSkillTag[];
  recommendedLessonIds: string[];
};

/**
 * Public checkpoint exercises keep the renderer-compatible shape, but every
 * private answer field is replaced with a harmless placeholder before the
 * value crosses the server/client boundary.
 */
export type PublicCheckpointExercise = Exercise;

export type CheckpointSubmissionAnswer = {
  exerciseId: string;
  answer: ExerciseAnswer;
};

export type CheckpointSubmission = {
  checkpointId: string;
  answers: CheckpointSubmissionAnswer[];
  durationSeconds: number;
  afkCount: number;
  idempotencyKey: string;
  assessmentMode: AssessmentMode;
};

export type CheckpointSkillScore = {
  category: CheckpointSkillCategory;
  earnedWeight: number;
  totalWeight: number;
  score: number;
};

export type CheckpointQuestionReview = {
  exerciseId: string;
  order: number;
  scoreRatio: number;
  status: "correct" | "partial" | "incorrect" | "unanswered";
  result: ExerciseCheckResult | null;
  transcript: string | null;
};

export type CheckpointScoreResult = {
  checkpointId: string;
  totalQuestions: number;
  answeredQuestions: number;
  earnedWeight: number;
  totalWeight: number;
  score: number;
  passed: boolean;
  skillScores: CheckpointSkillScore[];
  recommendedLessonIds: string[];
  reviews: CheckpointQuestionReview[];
};

export type CheckpointPageData = {
  checkpointId: string;
  title: string;
  description: string;
  passThreshold: number;
  estimatedMinutes: number;
  exercises: PublicCheckpointExercise[];
  bestScore: number | null;
  sectionTwoUnlocked: boolean;
  userId: string;
};

export type CheckpointSubmissionResult = CheckpointScoreResult & {
  success: true;
  assessmentMode: AssessmentMode;
  bestScore: number;
  sectionTwoUnlocked: boolean;
  newlyUnlockedSectionId: string | null;
  completion: LearningCompletionResult;
};
