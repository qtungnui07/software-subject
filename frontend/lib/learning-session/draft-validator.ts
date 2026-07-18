import { isLearningSessionDraftExpired } from "@/lib/learning-session/draft-expiry";
import type {
  CheckpointSessionDraft,
  LearningSessionDraft,
  LessonSessionDraft,
} from "@/types/learning-session-draft";
import type { Exercise, ExerciseAnswer } from "@/types/exercise";

const isRecord = (value: unknown): value is Record<string, unknown> =>
  Boolean(value) && typeof value === "object" && !Array.isArray(value);

const isAssessmentMode = (value: unknown) =>
  value === "standard" || value === "silent";

const isBaseDraft = (value: Record<string, unknown>) =>
  value.schemaVersion === 1 &&
  typeof value.userId === "string" &&
  typeof value.contentId === "string" &&
  typeof value.contentVersion === "number" &&
  typeof value.catalogFingerprint === "string" &&
  typeof value.savedAt === "string" &&
  isAssessmentMode(value.assessmentMode) &&
  typeof value.durationSeconds === "number" &&
  typeof value.afkCount === "number";

const sanitizeAnswerForExercise = (
  exercise: Exercise,
  answer: ExerciseAnswer,
): ExerciseAnswer | null => {
  switch (exercise.type) {
    case "multiple_choice":
    case "dialogue_choice":
    case "listening_choice":
      return answer.type === "choice" &&
        exercise.options.some((option) => option.id === answer.optionId)
        ? { type: "choice", optionId: answer.optionId }
        : null;
    case "arrange_words": {
      if (answer.type !== "arrange_words") return null;
      const validIds = new Set(exercise.tokens.map((token) => token.id));
      return answer.tokenIds.every((id) => validIds.has(id))
        ? { type: "arrange_words", tokenIds: [...answer.tokenIds] }
        : null;
    }
    case "fill_blank":
      return answer.type === "fill_blank"
        ? { type: "fill_blank", value: answer.value }
        : null;
    case "match_pairs": {
      if (answer.type !== "match_pairs") return null;
      const leftIds = new Set(exercise.leftItems.map((item) => item.id));
      const rightIds = new Set(exercise.rightItems.map((item) => item.id));
      if (
        answer.pairs.some(
          (pair) => !leftIds.has(pair.leftId) || !rightIds.has(pair.rightId),
        )
      ) {
        return null;
      }
      return {
        type: "match_pairs",
        pairs: answer.pairs.map((pair) => ({ ...pair })),
      };
    }
    case "arrange_dialogue": {
      if (answer.type !== "arrange_dialogue") return null;
      const validIds = new Set(exercise.lines.map((line) => line.id));
      return answer.lineIds.every((id) => validIds.has(id))
        ? { type: "arrange_dialogue", lineIds: [...answer.lineIds] }
        : null;
    }
    case "sentence_rewrite":
      return answer.type === "sentence_rewrite"
        ? { type: "sentence_rewrite", value: answer.value }
        : null;
    case "short_writing":
      return answer.type === "short_writing"
        ? { type: "short_writing", value: answer.value }
        : null;
  }
};

export const sanitizeAnswersForExercises = (
  answers: Record<string, ExerciseAnswer>,
  exercises: Exercise[],
) => {
  const byId = new Map(exercises.map((exercise) => [exercise.id, exercise]));
  const sanitized: Record<string, ExerciseAnswer> = {};
  for (const [exerciseId, answer] of Object.entries(answers)) {
    const exercise = byId.get(exerciseId);
    if (!exercise) continue;
    const safeAnswer = sanitizeAnswerForExercise(exercise, answer);
    if (safeAnswer) sanitized[exerciseId] = safeAnswer;
  }
  return sanitized;
};

export const validateLearningSessionDraft = ({
  value,
  kind,
  userId,
  contentId,
  contentVersion,
  catalogFingerprint,
  exercises,
  now,
}: {
  value: unknown;
  kind: "lesson" | "checkpoint";
  userId: string;
  contentId: string;
  contentVersion: number;
  catalogFingerprint: string;
  exercises: Exercise[];
  now?: number;
}): LearningSessionDraft | null => {
  if (!isRecord(value) || !isBaseDraft(value) || value.kind !== kind)
    return null;
  if (
    value.userId !== userId ||
    value.contentId !== contentId ||
    value.contentVersion !== contentVersion ||
    value.catalogFingerprint !== catalogFingerprint ||
    isLearningSessionDraftExpired({
      savedAt: value.savedAt as string,
      kind,
      now,
    })
  ) {
    return null;
  }

  const maxIndex = Math.max(0, exercises.length - 1);
  const currentExerciseIndex = Number(value.currentExerciseIndex);
  if (
    !Number.isInteger(currentExerciseIndex) ||
    currentExerciseIndex < 0 ||
    currentExerciseIndex > maxIndex
  ) {
    return null;
  }

  if (kind === "checkpoint") {
    if (!isRecord(value.answers) || typeof value.submissionId !== "string")
      return null;
    return {
      ...(value as unknown as CheckpointSessionDraft),
      answers: sanitizeAnswersForExercises(
        value.answers as Record<string, ExerciseAnswer>,
        exercises,
      ),
    };
  }

  if (
    typeof value.hearts !== "number" ||
    !isRecord(value.attemptResults) ||
    !Array.isArray(value.lockedMatchPairLeftIds) ||
    !Array.isArray(value.reviewExerciseIds) ||
    !isRecord(value.reviewResults)
  ) {
    return null;
  }

  const validIds = new Set(exercises.map((exercise) => exercise.id));
  const reviewExerciseIds = (value.reviewExerciseIds as unknown[]).filter(
    (id): id is string => typeof id === "string" && validIds.has(id),
  );

  const currentExercise = exercises[currentExerciseIndex];
  const currentAnswer =
    currentExercise && value.currentAnswer && isRecord(value.currentAnswer)
      ? sanitizeAnswerForExercise(
          currentExercise,
          value.currentAnswer as ExerciseAnswer,
        )
      : null;
  const reviewResults = Object.fromEntries(
    Object.entries(value.reviewResults as Record<string, unknown>)
      .filter(
        ([exerciseId, result]) =>
          validIds.has(exerciseId) &&
          isRecord(result) &&
          typeof result.recovered === "boolean",
      )
      .map(([exerciseId, result]) => [
        exerciseId,
        {
          exerciseId,
          recovered: Boolean((result as Record<string, unknown>).recovered),
        },
      ]),
  );

  return {
    ...(value as unknown as LessonSessionDraft),
    hearts: Math.max(0, Math.min(5, Math.floor(value.hearts as number))),
    currentAnswer,
    reviewExerciseIds,
    reviewResults,
  };
};
