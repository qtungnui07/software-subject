import assert from "node:assert/strict";

import { checkExerciseAnswer, isExerciseAnswerComplete } from "@/lib/exercises/check-exercise-answer";
import { normalizeTextAnswer } from "@/lib/exercises/answer-normalizer";
import type { Exercise } from "@/types/exercise";

const multipleChoice: Exercise = {
  id: "test-choice",
  lessonId: "test-lesson",
  type: "multiple_choice",
  skill: "vocabulary",
  difficulty: 1,
  instruction: "Choose",
  prompt: "Hello means?",
  options: [
    { id: "hello", text: "Xin chào" },
    { id: "goodbye", text: "Tạm biệt" },
  ],
  correctOptionId: "hello",
};

assert.equal(
  checkExerciseAnswer(multipleChoice, { type: "choice", optionId: "hello" }).isCorrect,
  true
);
assert.equal(
  checkExerciseAnswer(multipleChoice, { type: "choice", optionId: "goodbye" }).isCorrect,
  false
);

const repeatedTokenArrange: Exercise = {
  id: "test-arrange",
  lessonId: "test-lesson",
  type: "arrange_words",
  skill: "grammar",
  difficulty: 2,
  instruction: "Arrange",
  prompt: "Arrange the sentence",
  tokens: [
    { id: "i", text: "I" },
    { id: "think", text: "think" },
    { id: "that-1", text: "that" },
    { id: "that-2", text: "that" },
    { id: "works", text: "works" },
  ],
  correctOrder: ["i", "think", "that-1", "that-2", "works"],
};

assert.equal(
  checkExerciseAnswer(repeatedTokenArrange, {
    type: "arrange_words",
    tokenIds: ["i", "think", "that-1", "that-2", "works"],
  }).isCorrect,
  true
);
assert.equal(
  checkExerciseAnswer(repeatedTokenArrange, {
    type: "arrange_words",
    tokenIds: ["i", "think", "that-2", "that-1", "works"],
  }).isCorrect,
  false,
  "Repeated token text must still be ordered by stable token IDs."
);

const fillBlank: Exercise = {
  id: "test-fill",
  lessonId: "test-lesson",
  type: "fill_blank",
  skill: "grammar",
  difficulty: 1,
  instruction: "Fill",
  prompt: "Complete",
  sentenceBefore: "",
  sentenceAfter: "happy.",
  acceptedAnswers: ["I am", "I'm"],
};

assert.equal(
  checkExerciseAnswer(fillBlank, { type: "fill_blank", value: "  I AM... " }).isCorrect,
  true
);
assert.equal(
  checkExerciseAnswer(fillBlank, { type: "fill_blank", value: "I’m" }).isCorrect,
  true
);
assert.equal(normalizeTextAnswer("  Good   Morning! "), "good morning");
assert.equal(isExerciseAnswerComplete(fillBlank, { type: "fill_blank", value: "  " }), false);
assert.equal(isExerciseAnswerComplete(fillBlank, { type: "fill_blank", value: "I am" }), true);
assert.equal(
  isExerciseAnswerComplete(repeatedTokenArrange, {
    type: "arrange_words",
    tokenIds: ["i", "think"],
  }),
  false
);

console.log(
  "Exercise engine check passed: choice, repeated-token ordering, fill-blank normalization and answer completeness are valid."
);
