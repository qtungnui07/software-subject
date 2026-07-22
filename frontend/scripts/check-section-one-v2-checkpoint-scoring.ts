import assert from "node:assert/strict";

import {
  SECTION_ONE_CHECKPOINT_ID,
  SECTION_ONE_CHECKPOINT_PASS_THRESHOLD,
  sectionOneCheckpointAssessments,
  sectionOneCheckpointExercises,
} from "@/data/exercises/english/section-1/checkpoint";
import { scoreCheckpointSubmission } from "@/lib/checkpoints/checkpoint-scoring";
import type { CheckpointSubmissionAnswer } from "@/types/checkpoint";
import type { Exercise, ExerciseAnswer } from "@/types/exercise";

const getCorrectAnswer = (exercise: Exercise): ExerciseAnswer => {
  switch (exercise.type) {
    case "multiple_choice":
    case "dialogue_choice":
    case "listening_choice":
      return { type: "choice", optionId: exercise.correctOptionId };
    case "arrange_words":
      return { type: "arrange_words", tokenIds: exercise.correctOrder };
    case "fill_blank":
      return { type: "fill_blank", value: exercise.acceptedAnswers[0] ?? "" };
    case "match_pairs":
      return { type: "match_pairs", pairs: exercise.correctPairs };
    case "arrange_dialogue":
      return { type: "arrange_dialogue", lineIds: exercise.correctOrder };
    case "sentence_rewrite":
      return {
        type: "sentence_rewrite",
        value: exercise.acceptedAnswers[0] ?? "",
      };
    case "short_writing":
      return { type: "short_writing", value: exercise.sampleAnswer };
  }
};

const correctAnswers: CheckpointSubmissionAnswer[] =
  sectionOneCheckpointExercises.map((exercise) => ({
    exerciseId: exercise.id,
    answer: getCorrectAnswer(exercise),
  }));

const perfect = scoreCheckpointSubmission({
  checkpointId: SECTION_ONE_CHECKPOINT_ID,
  exercises: sectionOneCheckpointExercises,
  assessments: sectionOneCheckpointAssessments,
  answers: correctAnswers,
  passThreshold: SECTION_ONE_CHECKPOINT_PASS_THRESHOLD,
});
assert.equal(perfect.score, 100);
assert.equal(perfect.passed, true);
assert.equal(perfect.answeredQuestions, 12);
assert.equal(perfect.recommendedLessonIds.length, 0);
assert.ok(perfect.skillScores.some((item) => item.category === "writing"));
assert.ok(perfect.skillScores.every((item) => item.score === 100));

const empty = scoreCheckpointSubmission({
  checkpointId: SECTION_ONE_CHECKPOINT_ID,
  exercises: sectionOneCheckpointExercises,
  assessments: sectionOneCheckpointAssessments,
  answers: [],
  passThreshold: SECTION_ONE_CHECKPOINT_PASS_THRESHOLD,
});
assert.equal(empty.score, 0);
assert.equal(empty.passed, false);
assert.equal(empty.answeredQuestions, 0);
assert.equal(empty.reviews.every((review) => review.status === "unanswered"), true);
assert.ok(empty.recommendedLessonIds.length > 0 && empty.recommendedLessonIds.length <= 3);

const matchExercise = sectionOneCheckpointExercises.find(
  (exercise) => exercise.type === "match_pairs",
);
assert(matchExercise?.type === "match_pairs");
const partialPairs = [
  matchExercise.correctPairs[0],
  matchExercise.correctPairs[1],
  {
    leftId: matchExercise.correctPairs[2].leftId,
    rightId: matchExercise.correctPairs[3].rightId,
  },
  {
    leftId: matchExercise.correctPairs[3].leftId,
    rightId: matchExercise.correctPairs[2].rightId,
  },
];
const partial = scoreCheckpointSubmission({
  checkpointId: SECTION_ONE_CHECKPOINT_ID,
  exercises: sectionOneCheckpointExercises,
  assessments: sectionOneCheckpointAssessments,
  answers: [
    {
      exerciseId: matchExercise.id,
      answer: {
        type: "match_pairs",
        pairs: partialPairs,
      },
    },
  ],
  passThreshold: SECTION_ONE_CHECKPOINT_PASS_THRESHOLD,
});
const matchReview = partial.reviews.find(
  (review) => review.exerciseId === matchExercise.id,
);
assert.equal(matchReview?.status, "partial");
assert.equal(matchReview?.scoreRatio, 0.5);
assert.ok(partial.score > 0 && partial.score < 100);

const listeningReview = perfect.reviews.find(
  (review) => review.exerciseId === "chapter-1-test-exercise-7",
);
assert.ok(listeningReview?.transcript?.includes("2:45"));

console.log(
  "Section 1 V2 checkpoint scoring check passed: weighted scoring, partial credit, unanswered-zero handling, skill summaries, recommendations and post-submit transcripts are valid.",
);
