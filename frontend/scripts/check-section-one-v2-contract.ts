import assert from "node:assert/strict";

import { englishPlacementQuestions } from "@/data/placement-tests/english-placement-test";
import {
  createArrangeDialogueExercise,
  createMatchPairsExercise,
  createSentenceRewriteExercise,
  createShortWritingExercise,
} from "@/data/exercises/english/exercise-builders";
import { checkExerciseAnswer } from "@/lib/exercises/check-exercise-answer";
import { validateExercise } from "@/lib/exercises/exercise-validator";
import type {
  CoreExerciseType,
  Exercise,
  ExerciseContext,
  ExerciseType,
  ExtendedExerciseType,
} from "@/types/exercise";

const CORE_TYPES = [
  "multiple_choice",
  "arrange_words",
  "fill_blank",
  "dialogue_choice",
  "listening_choice",
] as const satisfies readonly CoreExerciseType[];

const EXTENDED_TYPES = [
  "match_pairs",
  "arrange_dialogue",
  "sentence_rewrite",
  "short_writing",
] as const satisfies readonly ExtendedExerciseType[];

const ALL_TYPES = [...CORE_TYPES, ...EXTENDED_TYPES] satisfies ExerciseType[];
assert.equal(new Set(ALL_TYPES).size, 9, "ExerciseType must expose nine unique types.");

const coreTypeSet = new Set<ExerciseType>(CORE_TYPES);
assert.equal(
  englishPlacementQuestions.every((question) =>
    coreTypeSet.has(question.exercise.type)
  ),
  true,
  "Placement Test must remain limited to the five core exercise types."
);

const readingContext: ExerciseContext = {
  id: "phase1-reading-context",
  kind: "reading",
  title: "A short message",
  text: "Mia is meeting her friend at the library after school.",
};

const listeningContext: ExerciseContext = {
  id: "phase1-listening-context",
  kind: "listening",
  title: "A voice message",
  spokenText: "Hi Mia. I will meet you at the library at four o'clock.",
  silentAlternative: "A friend will meet Mia at the library at four o'clock.",
};

const matchPairs = createMatchPairsExercise({
  id: "phase1-match",
  lessonId: "lesson-1",
  skill: "reading",
  difficulty: 1,
  instruction: "Match the information.",
  prompt: "Match each person with a plan.",
  explanation: "Use the reading clues.",
  context: readingContext,
  contentVersion: 2,
  pairs: [
    ["Mia", "Go to the library"],
    ["Ben", "Play football"],
    ["Lucy", "Study at home"],
  ],
  shuffledRightOrder: [2, 0, 1],
});

const arrangeDialogue = createArrangeDialogueExercise({
  id: "phase1-dialogue",
  lessonId: "lesson-1",
  skill: "conversation",
  difficulty: 1,
  instruction: "Arrange the dialogue.",
  prompt: "Put the lines in a natural order.",
  explanation: "Start with the greeting and finish with the reply.",
  linesInCorrectOrder: [
    { speaker: "Mia", text: "Hi, I'm Mia." },
    { speaker: "Ben", text: "Nice to meet you, Mia." },
    { speaker: "Mia", text: "Nice to meet you too." },
  ],
  shuffledOrder: [2, 0, 1],
});

const sentenceRewrite = createSentenceRewriteExercise({
  id: "phase1-rewrite",
  lessonId: "lesson-1",
  skill: "grammar",
  difficulty: 2,
  instruction: "Rewrite the sentence.",
  prompt: "Use because.",
  explanation: "Use because to give a reason.",
  sourceSentence: "It is raining. We are staying home.",
  requiredWords: ["because"],
  acceptedAnswers: ["We are staying home because it is raining."],
});

const shortWriting = createShortWritingExercise({
  id: "phase1-writing",
  lessonId: "lesson-1",
  skill: "conversation",
  difficulty: 2,
  instruction: "Write a short message.",
  prompt: "Invite a friend to meet you.",
  explanation: "Include the place and time.",
  context: listeningContext,
  topic: "Invite a friend to a café this Saturday.",
  minWords: 8,
  maxWords: 25,
  suggestedWords: ["Saturday", "meet", "café"],
  minimumSuggestedWordMatches: 2,
  minimumSentences: 1,
  sampleAnswer: "Are you free on Saturday? We can meet at the café after lunch.",
});

const extendedExercises: Exercise[] = [
  matchPairs,
  arrangeDialogue,
  sentenceRewrite,
  shortWriting,
];

assert.deepEqual(
  extendedExercises.flatMap(validateExercise),
  [],
  "All four extended exercise contracts must validate."
);

const partialMatchResult = checkExerciseAnswer(matchPairs, {
  type: "match_pairs",
  pairs: [
    matchPairs.correctPairs[0],
    matchPairs.correctPairs[1],
    {
      leftId: matchPairs.correctPairs[2].leftId,
      rightId: matchPairs.correctPairs[0].rightId,
    },
  ],
});
assert.equal(partialMatchResult.isCorrect, false);
assert.equal(partialMatchResult.scoreRatio, 2 / 3);

const correctDialogueResult = checkExerciseAnswer(arrangeDialogue, {
  type: "arrange_dialogue",
  lineIds: [...arrangeDialogue.correctOrder],
});
assert.equal(correctDialogueResult.isCorrect, true);
assert.equal(correctDialogueResult.scoreRatio, 1);

const normalizedRewriteResult = checkExerciseAnswer(sentenceRewrite, {
  type: "sentence_rewrite",
  value: "  WE ARE STAYING HOME BECAUSE IT IS RAINING... ",
});
assert.equal(normalizedRewriteResult.isCorrect, true);
assert.equal(normalizedRewriteResult.scoreRatio, 1);

const partialWritingResult = checkExerciseAnswer(shortWriting, {
  type: "short_writing",
  value: "Saturday meet",
});
assert.equal(partialWritingResult.isCorrect, false);
assert.ok(
  partialWritingResult.scoreRatio > 0 && partialWritingResult.scoreRatio < 1,
  "Short writing must expose rule-based partial scoring."
);

console.log(
  "Section 1 V2 contract check passed: 5 core types remain isolated for placement, 4 extended types validate, contexts work, and scoreRatio supports partial results."
);
