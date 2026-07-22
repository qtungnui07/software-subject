import type {
  ArrangeWordToken,
  ChoiceOption,
  CoreExercise,
  CoreExerciseAnswer,
  CoreExerciseType,
  ExerciseDifficulty,
  ExerciseSkill,
} from "@/types/exercise";

export const ENGLISH_PLACEMENT_TEST_VERSION = "english-placement-v1" as const;

export type PlacementTestVersion = typeof ENGLISH_PLACEMENT_TEST_VERSION;
export type PlacementBand = 1 | 2 | 3;
export type PlacementBandName = "basic" | "intermediate" | "advanced";
export type PlacementSectionId =
  | "english-section-1"
  | "english-section-2"
  | "english-section-3";

export type PlacementQuestionDefinition = {
  exercise: CoreExercise;
  band: PlacementBand;
  order: number;
};

type PublicPlacementQuestionBase = {
  id: string;
  type: CoreExerciseType;
  instruction: string;
  prompt: string;
  skill: ExerciseSkill;
  difficulty: ExerciseDifficulty;
  order: number;
};

export type PublicMultipleChoicePlacementQuestion =
  PublicPlacementQuestionBase & {
    type: "multiple_choice";
    options: ChoiceOption[];
  };

export type PublicArrangeWordsPlacementQuestion =
  PublicPlacementQuestionBase & {
    type: "arrange_words";
    tokens: ArrangeWordToken[];
  };

export type PublicFillBlankPlacementQuestion = PublicPlacementQuestionBase & {
  type: "fill_blank";
  sentenceBefore: string;
  sentenceAfter: string;
};

export type PublicDialogueChoicePlacementQuestion =
  PublicPlacementQuestionBase & {
    type: "dialogue_choice";
    speaker: string;
    dialogue: string;
    options: ChoiceOption[];
  };

export type PublicListeningChoicePlacementQuestion =
  PublicPlacementQuestionBase & {
    type: "listening_choice";
    audioSrc?: string;
    spokenText?: string;
    options: ChoiceOption[];
  };

export type PublicPlacementQuestion =
  | PublicMultipleChoicePlacementQuestion
  | PublicArrangeWordsPlacementQuestion
  | PublicFillBlankPlacementQuestion
  | PublicDialogueChoicePlacementQuestion
  | PublicListeningChoicePlacementQuestion;

export type PlacementSubmissionAnswer = {
  questionId: string;
  answer: CoreExerciseAnswer;
};

export type PlacementTestSubmission = {
  submissionId?: string;
  testVersion: PlacementTestVersion;
  answers: PlacementSubmissionAnswer[];
  startedAt?: string;
};

export type PlacementBandScores = {
  basic: number;
  intermediate: number;
  advanced: number;
};

export type PlacementScoredAnswer = {
  questionId: string;
  answer: CoreExerciseAnswer | null;
  band: PlacementBand;
  skill: ExerciseSkill;
  isCorrect: boolean;
};

export type PlacementTestScore = {
  testVersion: PlacementTestVersion;
  totalQuestions: 12;
  totalCorrect: number;
  bandScores: PlacementBandScores;
  assignedSectionId: PlacementSectionId;
  scoredAnswers: PlacementScoredAnswer[];
};

export type PlacementTestStoredResult = PlacementTestScore & {
  userId: string;
  courseId: "english";
  latestAssignedSectionId: PlacementSectionId;
  highestAssignedSectionId: PlacementSectionId;
  attemptCount: number;
  startedAt: string | null;
  completedAt: string;
  durationSeconds: number | null;
  lastSubmissionId: string | null;
};

export type PlacementResultSummary = {
  totalCorrect: number;
  totalQuestions: 12;
  bandScores: PlacementBandScores;
  latestAssignedSectionId: PlacementSectionId;
  highestAssignedSectionId: PlacementSectionId;
  attemptCount: number;
  completedAt: string;
  durationSeconds: number | null;
};

export type PlacementTestGetResponse = {
  testVersion: PlacementTestVersion;
  totalQuestions: 12;
  questions: PublicPlacementQuestion[];
  previousResult: PlacementResultSummary | null;
};

export type PlacementResultResponse = {
  success: true;
  result: PlacementResultSummary;
};
