import type { Exercise, ExerciseSkill } from "@/types/exercise";

const VALID_SKILLS = new Set<ExerciseSkill>([
  "vocabulary",
  "grammar",
  "listening",
  "reading",
  "conversation",
]);

export type ExerciseValidationIssue = {
  exerciseId: string;
  message: string;
};

const validateChoiceExercise = (
  exercise: Extract<Exercise, { type: "multiple_choice" | "dialogue_choice" | "listening_choice" }>
) => {
  const issues: ExerciseValidationIssue[] = [];
  const optionIds = exercise.options.map((option) => option.id);
  const normalizedOptionTexts = exercise.options.map((option) =>
    option.text.trim().toLocaleLowerCase("en-US")
  );

  if (exercise.options.length < 2) {
    issues.push({ exerciseId: exercise.id, message: "Choice exercise needs at least two options." });
  }

  if (new Set(optionIds).size !== optionIds.length) {
    issues.push({ exerciseId: exercise.id, message: "Choice option IDs must be unique." });
  }

  if (normalizedOptionTexts.some((text) => !text)) {
    issues.push({ exerciseId: exercise.id, message: "Choice option text cannot be empty." });
  }

  if (new Set(normalizedOptionTexts).size !== normalizedOptionTexts.length) {
    issues.push({ exerciseId: exercise.id, message: "Choice option text must be unique." });
  }

  if (!optionIds.includes(exercise.correctOptionId)) {
    issues.push({ exerciseId: exercise.id, message: "correctOptionId does not exist in options." });
  }

  if (
    exercise.type === "listening_choice" &&
    !exercise.audioSrc?.trim() &&
    !exercise.spokenText?.trim()
  ) {
    issues.push({ exerciseId: exercise.id, message: "Listening exercise needs audioSrc or spokenText." });
  }

  return issues;
};

export const validateExercise = (exercise: Exercise): ExerciseValidationIssue[] => {
  const issues: ExerciseValidationIssue[] = [];

  if (!exercise.id.trim()) {
    issues.push({ exerciseId: exercise.id, message: "Exercise ID is required." });
  }

  if (!exercise.lessonId.trim()) {
    issues.push({ exerciseId: exercise.id, message: "lessonId is required." });
  }

  if (!exercise.instruction.trim() || !exercise.prompt.trim()) {
    issues.push({ exerciseId: exercise.id, message: "Instruction and prompt are required." });
  }

  if (!VALID_SKILLS.has(exercise.skill)) {
    issues.push({ exerciseId: exercise.id, message: "Exercise skill is invalid." });
  }

  if (![1, 2, 3].includes(exercise.difficulty)) {
    issues.push({ exerciseId: exercise.id, message: "Exercise difficulty must be 1, 2 or 3." });
  }

  switch (exercise.type) {
    case "multiple_choice":
    case "dialogue_choice":
    case "listening_choice":
      return [...issues, ...validateChoiceExercise(exercise)];
    case "arrange_words": {
      const tokenIds = exercise.tokens.map((token) => token.id);
      const correctOrderIds = exercise.correctOrder;

      if (exercise.tokens.length < 2) {
        issues.push({ exerciseId: exercise.id, message: "Arrange exercise needs at least two tokens." });
      }

      if (new Set(tokenIds).size !== tokenIds.length) {
        issues.push({ exerciseId: exercise.id, message: "Arrange token IDs must be unique." });
      }

      if (exercise.tokens.some((token) => !token.text.trim())) {
        issues.push({ exerciseId: exercise.id, message: "Arrange token text cannot be empty." });
      }

      if (
        correctOrderIds.length !== tokenIds.length ||
        new Set(correctOrderIds).size !== correctOrderIds.length ||
        correctOrderIds.some((tokenId) => !tokenIds.includes(tokenId))
      ) {
        issues.push({ exerciseId: exercise.id, message: "correctOrder must contain every token ID exactly once." });
      }

      return issues;
    }
    case "fill_blank":
      if (exercise.acceptedAnswers.length === 0 || exercise.acceptedAnswers.some((answer) => !answer.trim())) {
        issues.push({ exerciseId: exercise.id, message: "Fill blank exercise needs non-empty accepted answers." });
      }
      return issues;
  }
};

export const validateExerciseCatalog = (catalog: Record<string, Exercise[]>) => {
  const issues: ExerciseValidationIssue[] = [];
  const exerciseIds = new Set<string>();

  for (const [lessonId, exercises] of Object.entries(catalog)) {
    if (exercises.length === 0) {
      issues.push({ exerciseId: lessonId, message: "Lesson exercise set cannot be empty." });
    }

    for (const exercise of exercises) {
      if (exercise.lessonId !== lessonId) {
        issues.push({ exerciseId: exercise.id, message: `Exercise lessonId must match catalog key ${lessonId}.` });
      }

      if (exerciseIds.has(exercise.id)) {
        issues.push({ exerciseId: exercise.id, message: "Exercise IDs must be globally unique." });
      }
      exerciseIds.add(exercise.id);
      issues.push(...validateExercise(exercise));
    }
  }

  return issues;
};
