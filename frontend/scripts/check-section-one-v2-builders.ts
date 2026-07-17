import assert from "node:assert/strict";

import {
  createArrangeDialogueExercise,
  createMatchPairsExercise,
  createSentenceRewriteExercise,
  createShortWritingExercise,
} from "@/data/exercises/english/exercise-builders";
import { validateExercise } from "@/lib/exercises/exercise-validator";
import type { Exercise } from "@/types/exercise";

const base = {
  lessonId: "lesson-1",
  skill: "conversation" as const,
  difficulty: 1 as const,
  instruction: "Complete the activity.",
  prompt: "Phase 1 builder check",
  explanation: "Builder output must be stable and valid.",
  contentVersion: 2,
};

const matchPairs = createMatchPairsExercise({
  ...base,
  id: "builder-match",
  pairs: [
    ["Anna", "Read a book"],
    ["Ben", "Play football"],
  ],
  shuffledRightOrder: [1, 0],
});
assert.deepEqual(
  matchPairs.leftItems.map((item) => item.id),
  ["builder-match-left-1", "builder-match-left-2"]
);
assert.deepEqual(
  matchPairs.rightItems.map((item) => item.id),
  ["builder-match-right-2", "builder-match-right-1"]
);
assert.deepEqual(matchPairs.correctPairs, [
  { leftId: "builder-match-left-1", rightId: "builder-match-right-1" },
  { leftId: "builder-match-left-2", rightId: "builder-match-right-2" },
]);

const arrangeDialogue = createArrangeDialogueExercise({
  ...base,
  id: "builder-dialogue",
  linesInCorrectOrder: [
    { speaker: "A", text: "Hello." },
    { speaker: "B", text: "Hi." },
    { speaker: "A", text: "How are you?" },
  ],
  distractorLines: [{ speaker: "B", text: "The bus is blue." }],
  shuffledOrder: [3, 1, 0, 2],
});
assert.deepEqual(arrangeDialogue.correctOrder, [
  "builder-dialogue-line-1",
  "builder-dialogue-line-2",
  "builder-dialogue-line-3",
]);
assert.equal(arrangeDialogue.lines[0].id, "builder-dialogue-distractor-1");

const rewrite = createSentenceRewriteExercise({
  ...base,
  id: "builder-rewrite",
  sourceSentence: "Tom is busy. He cannot come.",
  requiredWords: ["because"],
  acceptedAnswers: ["Tom cannot come because he is busy."],
});

const writing = createShortWritingExercise({
  ...base,
  id: "builder-writing",
  topic: "Write about your morning.",
  minWords: 5,
  maxWords: 20,
  suggestedWords: ["morning", "breakfast"],
  minimumSuggestedWordMatches: 1,
  sampleAnswer: "I eat breakfast every morning before I go to school.",
});

for (const exercise of [matchPairs, arrangeDialogue, rewrite, writing]) {
  assert.deepEqual(validateExercise(exercise), []);
}

assert.throws(
  () =>
    createMatchPairsExercise({
      ...base,
      id: "invalid-builder-order",
      pairs: [
        ["A", "One"],
        ["B", "Two"],
      ],
      shuffledRightOrder: [0, 0],
    }),
  /invalid shuffled right item order/
);

const invalidPairs = {
  ...matchPairs,
  correctPairs: [
    { leftId: "builder-match-left-1", rightId: "missing-right-id" },
    matchPairs.correctPairs[1],
  ],
} as Exercise;
assert.ok(
  validateExercise(invalidPairs).some((issue) =>
    issue.message.includes("connect every left and right item")
  )
);

const invalidDialogue = {
  ...arrangeDialogue,
  correctOrder: [
    arrangeDialogue.correctOrder[0],
    arrangeDialogue.correctOrder[0],
    arrangeDialogue.correctOrder[2],
  ],
} as Exercise;
assert.ok(
  validateExercise(invalidDialogue).some((issue) =>
    issue.message.includes("unique existing line IDs")
  )
);

const invalidRewrite = {
  ...rewrite,
  acceptedAnswers: [],
} as Exercise;
assert.ok(
  validateExercise(invalidRewrite).some((issue) =>
    issue.message.includes("non-empty accepted answers")
  )
);

const invalidWriting = {
  ...writing,
  minWords: 30,
  maxWords: 20,
} as Exercise;
assert.ok(
  validateExercise(invalidWriting).some((issue) =>
    issue.message.includes("word limits")
  )
);

console.log(
  "Section 1 V2 builder check passed: stable IDs, shuffled output, valid builders, and invalid pair/dialogue/rewrite/writing contracts are rejected."
);
