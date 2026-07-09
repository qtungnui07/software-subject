import { englishPlacementQuestions } from "@/data/placement-tests/english-placement-test";
import { checkExerciseAnswer } from "@/lib/exercises/check-exercise-answer";
import {
  assignPlacementSection,
  calculatePlacementBandScores,
} from "@/lib/placement-test/placement-scoring";
import { validatePlacementSubmission } from "@/lib/placement-test/placement-validator";
import {
  ENGLISH_PLACEMENT_TEST_VERSION,
  type PlacementScoredAnswer,
  type PlacementTestScore,
  type PlacementTestSubmission,
} from "@/types/placement-test";

export class PlacementSubmissionError extends Error {
  readonly issues: ReturnType<typeof validatePlacementSubmission>;

  constructor(issues: ReturnType<typeof validatePlacementSubmission>) {
    super(issues.map((issue) => `${issue.field}: ${issue.message}`).join("\n"));
    this.name = "PlacementSubmissionError";
    this.issues = issues;
  }
}

export const gradePlacementSubmission = (
  submission: PlacementTestSubmission
): PlacementTestScore => {
  const issues = validatePlacementSubmission(
    submission,
    englishPlacementQuestions
  );

  if (issues.length > 0) {
    throw new PlacementSubmissionError(issues);
  }

  const answersByQuestionId = new Map(
    submission.answers.map((entry) => [entry.questionId, entry.answer])
  );

  const scoredAnswers: PlacementScoredAnswer[] = englishPlacementQuestions.map(
    (question) => {
      const answer = answersByQuestionId.get(question.exercise.id) ?? null;
      const isCorrect = answer
        ? checkExerciseAnswer(question.exercise, answer).isCorrect
        : false;

      return {
        questionId: question.exercise.id,
        answer,
        band: question.band,
        skill: question.exercise.skill,
        isCorrect,
      };
    }
  );

  const totalCorrect = scoredAnswers.filter((answer) => answer.isCorrect).length;
  const bandScores = calculatePlacementBandScores(scoredAnswers);

  return {
    testVersion: ENGLISH_PLACEMENT_TEST_VERSION,
    totalQuestions: 12,
    totalCorrect,
    bandScores,
    assignedSectionId: assignPlacementSection(totalCorrect, bandScores),
    scoredAnswers,
  };
};
