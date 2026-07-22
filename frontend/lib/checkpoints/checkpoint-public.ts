import type { PublicCheckpointExercise } from "@/types/checkpoint";
import type { Exercise, ExerciseContext } from "@/types/exercise";

const toPublicContext = (
  context: ExerciseContext | undefined,
): ExerciseContext | undefined => {
  if (!context) return undefined;
  if (context.kind !== "listening") return { ...context };

  return {
    ...context,
    transcriptAfterSubmit: undefined,
  };
};

const getPublicBase = (exercise: Exercise) => ({
  explanation: undefined,
  hint: undefined,
  context: toPublicContext(exercise.context),
});

export const toPublicCheckpointExercise = (
  exercise: Exercise,
): PublicCheckpointExercise => {
  const publicBase = getPublicBase(exercise);

  switch (exercise.type) {
    case "multiple_choice":
      return {
        ...exercise,
        ...publicBase,
        options: exercise.options.map((option) => ({ ...option })),
        correctOptionId: "__private__",
      };
    case "dialogue_choice":
      return {
        ...exercise,
        ...publicBase,
        options: exercise.options.map((option) => ({ ...option })),
        correctOptionId: "__private__",
      };
    case "listening_choice":
      return {
        ...exercise,
        ...publicBase,
        options: exercise.options.map((option) => ({ ...option })),
        correctOptionId: "__private__",
      };
    case "arrange_words":
      return {
        ...exercise,
        ...publicBase,
        tokens: exercise.tokens.map((token) => ({ ...token })),
        correctOrder: exercise.correctOrder.map(
          (_, index) => `__private-token-${index + 1}`,
        ),
      };
    case "fill_blank":
      return {
        ...exercise,
        ...publicBase,
        acceptedAnswers: [],
      };
    case "match_pairs":
      return {
        ...exercise,
        ...publicBase,
        leftItems: exercise.leftItems.map((item) => ({ ...item })),
        rightItems: exercise.rightItems.map((item) => ({ ...item })),
        correctPairs: exercise.leftItems.map((item, index) => ({
          leftId: item.id,
          rightId: `__private-pair-${index + 1}`,
        })),
      };
    case "arrange_dialogue":
      return {
        ...exercise,
        ...publicBase,
        lines: exercise.lines.map((line) => ({ ...line })),
        correctOrder: exercise.correctOrder.map(
          (_, index) => `__private-line-${index + 1}`,
        ),
      };
    case "sentence_rewrite":
      return {
        ...exercise,
        ...publicBase,
        acceptedAnswers: [],
      };
    case "short_writing":
      return {
        ...exercise,
        ...publicBase,
        sampleAnswer: "",
      };
  }
};

export const toPublicCheckpointExercises = (exercises: Exercise[]) =>
  exercises.map(toPublicCheckpointExercise);
