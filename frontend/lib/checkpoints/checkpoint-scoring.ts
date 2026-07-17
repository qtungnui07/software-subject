import {
  checkExerciseAnswer,
  isExerciseAnswerComplete,
} from "@/lib/exercises/check-exercise-answer";
import { getExerciseResultStatus } from "@/lib/exercises/exercise-result-status";
import type {
  CheckpointExerciseAssessment,
  CheckpointScoreResult,
  CheckpointSkillCategory,
  CheckpointSubmissionAnswer,
} from "@/types/checkpoint";
import type { Exercise } from "@/types/exercise";

const roundScore = (value: number) => Math.round(value * 100) / 100;

export const scoreCheckpointSubmission = ({
  checkpointId,
  exercises,
  assessments,
  answers,
  passThreshold,
}: {
  checkpointId: string;
  exercises: Exercise[];
  assessments: CheckpointExerciseAssessment[];
  answers: CheckpointSubmissionAnswer[];
  passThreshold: number;
}): CheckpointScoreResult => {
  const exerciseById = new Map(
    exercises.map((exercise) => [exercise.id, exercise]),
  );
  const assessmentById = new Map(
    assessments.map((assessment) => [assessment.exerciseId, assessment]),
  );
  const answerById = new Map(
    answers
      .filter((entry) => exerciseById.has(entry.exerciseId))
      .map((entry) => [entry.exerciseId, entry.answer]),
  );

  const categories = new Map<
    CheckpointSkillCategory,
    { earnedWeight: number; totalWeight: number }
  >();
  const lessonLoss = new Map<string, number>();
  let earnedWeight = 0;
  let totalWeight = 0;

  const reviews = exercises.map((exercise, index) => {
    const assessment = assessmentById.get(exercise.id);
    if (!assessment) {
      throw new Error(`Missing checkpoint assessment for ${exercise.id}.`);
    }

    const submittedAnswer = answerById.get(exercise.id);
    const answer = isExerciseAnswerComplete(exercise, submittedAnswer ?? null)
      ? submittedAnswer
      : null;
    const result = answer ? checkExerciseAnswer(exercise, answer) : null;
    const scoreRatio = result?.scoreRatio ?? 0;
    const weightedScore = scoreRatio * assessment.weight;

    totalWeight += assessment.weight;
    earnedWeight += weightedScore;

    const category = categories.get(assessment.category) ?? {
      earnedWeight: 0,
      totalWeight: 0,
    };
    category.earnedWeight += weightedScore;
    category.totalWeight += assessment.weight;
    categories.set(assessment.category, category);

    const loss = (1 - scoreRatio) * assessment.weight;
    if (loss > 0) {
      assessment.recommendedLessonIds.forEach((lessonId) => {
        lessonLoss.set(lessonId, (lessonLoss.get(lessonId) ?? 0) + loss);
      });
    }

    const transcript =
      exercise.context?.kind === "listening"
        ? exercise.context.transcriptAfterSubmit ??
          exercise.context.spokenText ??
          null
        : null;

    return {
      exerciseId: exercise.id,
      order: index + 1,
      scoreRatio,
      status: answer
        ? getExerciseResultStatus(scoreRatio)
        : ("unanswered" as const),
      result,
      transcript,
    };
  });

  const score = totalWeight === 0 ? 0 : roundScore((earnedWeight / totalWeight) * 100);
  const skillScores = Array.from(categories.entries())
    .map(([category, value]) => ({
      category,
      earnedWeight: roundScore(value.earnedWeight),
      totalWeight: roundScore(value.totalWeight),
      score:
        value.totalWeight === 0
          ? 0
          : roundScore((value.earnedWeight / value.totalWeight) * 100),
    }))
    .sort((left, right) => left.category.localeCompare(right.category));

  const recommendedLessonIds = Array.from(lessonLoss.entries())
    .sort((left, right) => right[1] - left[1])
    .slice(0, 3)
    .map(([lessonId]) => lessonId);

  return {
    checkpointId,
    totalQuestions: exercises.length,
    answeredQuestions: reviews.filter((review) => review.status !== "unanswered").length,
    earnedWeight: roundScore(earnedWeight),
    totalWeight: roundScore(totalWeight),
    score,
    passed: score >= passThreshold,
    skillScores,
    recommendedLessonIds,
    reviews,
  };
};
