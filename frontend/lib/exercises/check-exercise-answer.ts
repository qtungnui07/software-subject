import { normalizeTextAnswer } from "@/lib/exercises/answer-normalizer";
import type {
  Exercise,
  ExerciseAnswer,
  ExerciseCheckResult,
} from "@/types/exercise";

const getChoiceAnswerText = (
  exercise: Extract<Exercise, { type: "multiple_choice" | "dialogue_choice" | "listening_choice" }>,
  optionId: string
) => exercise.options.find((option) => option.id === optionId)?.text ?? "";

const checkChoiceExercise = (
  exercise: Extract<Exercise, { type: "multiple_choice" | "dialogue_choice" | "listening_choice" }>,
  answer: ExerciseAnswer
): ExerciseCheckResult => {
  const optionId = answer.type === "choice" ? answer.optionId : "";
  const correctAnswerText = getChoiceAnswerText(exercise, exercise.correctOptionId);

  return {
    isCorrect: optionId === exercise.correctOptionId,
    correctAnswerText,
    normalizedUserAnswer: getChoiceAnswerText(exercise, optionId),
    explanation: exercise.explanation,
  };
};

const checkArrangeWordsExercise = (
  exercise: Extract<Exercise, { type: "arrange_words" }>,
  answer: ExerciseAnswer
): ExerciseCheckResult => {
  const tokenIds = answer.type === "arrange_words" ? answer.tokenIds : [];
  const tokenTextById = new Map(exercise.tokens.map((token) => [token.id, token.text]));
  const correctAnswerText = exercise.correctOrder
    .map((tokenId) => tokenTextById.get(tokenId) ?? "")
    .join(" ")
    .trim();
  const normalizedUserAnswer = tokenIds
    .map((tokenId) => tokenTextById.get(tokenId) ?? "")
    .join(" ")
    .trim();

  return {
    isCorrect:
      tokenIds.length === exercise.correctOrder.length &&
      tokenIds.every((tokenId, index) => tokenId === exercise.correctOrder[index]),
    correctAnswerText,
    normalizedUserAnswer,
    explanation: exercise.explanation,
  };
};

const checkFillBlankExercise = (
  exercise: Extract<Exercise, { type: "fill_blank" }>,
  answer: ExerciseAnswer
): ExerciseCheckResult => {
  const rawAnswer = answer.type === "fill_blank" ? answer.value : "";
  const normalizeOptions = {
    caseSensitive: exercise.caseSensitive ?? false,
    ignoreTerminalPunctuation: true,
  };
  const normalizedUserAnswer = normalizeTextAnswer(rawAnswer, normalizeOptions);
  const normalizedAcceptedAnswers = exercise.acceptedAnswers.map((acceptedAnswer) =>
    normalizeTextAnswer(acceptedAnswer, normalizeOptions)
  );

  return {
    isCorrect: normalizedAcceptedAnswers.includes(normalizedUserAnswer),
    correctAnswerText: exercise.acceptedAnswers[0] ?? "",
    normalizedUserAnswer,
    explanation: exercise.explanation,
  };
};

export const checkExerciseAnswer = (
  exercise: Exercise,
  answer: ExerciseAnswer
): ExerciseCheckResult => {
  switch (exercise.type) {
    case "multiple_choice":
    case "dialogue_choice":
    case "listening_choice":
      return checkChoiceExercise(exercise, answer);
    case "arrange_words":
      return checkArrangeWordsExercise(exercise, answer);
    case "fill_blank":
      return checkFillBlankExercise(exercise, answer);
  }
};

export const isExerciseAnswerComplete = (
  exercise: Exercise,
  answer: ExerciseAnswer | null
) => {
  if (!answer) return false;

  switch (exercise.type) {
    case "multiple_choice":
    case "dialogue_choice":
    case "listening_choice":
      return answer.type === "choice" && answer.optionId.length > 0;
    case "arrange_words":
      return (
        answer.type === "arrange_words" &&
        answer.tokenIds.length === exercise.tokens.length
      );
    case "fill_blank":
      return answer.type === "fill_blank" && answer.value.trim().length > 0;
  }
};
