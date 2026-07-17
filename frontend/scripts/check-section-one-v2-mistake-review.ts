import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";

import { sectionOneV2PreviewExercises } from "@/data/exercises/english/section-1/section-one-v2-preview";
import { createMistakeReviewQueue } from "@/lib/exercises/mistake-review";
import type { ExerciseAttemptResult } from "@/types/lesson-session";

const attempts: Record<string, ExerciseAttemptResult> = {};
sectionOneV2PreviewExercises.forEach((exercise, index) => {
  const score = index === 0 ? 1 : index === 1 ? 0.5 : 0;
  attempts[exercise.id] = {
    exerciseId: exercise.id,
    attempts: 2,
    firstScoreRatio: score,
    bestScoreRatio: score,
    finalScoreRatio: score,
    status: score === 1 ? "correct" : score > 0 ? "partial" : "incorrect",
    lostHeart: score === 0,
  };
});

const queue = createMistakeReviewQueue(
  sectionOneV2PreviewExercises,
  attempts,
  3,
);
assert.equal(queue.length, 3);
assert(!queue.includes(sectionOneV2PreviewExercises[0].id));
assert.equal(queue[0], sectionOneV2PreviewExercises[2].id);

const player = readFileSync(join(process.cwd(), "app/lesson/page.tsx"), "utf8");
assert.match(player, /createMistakeReviewQueue/);
assert.match(player, /reviewQueue\.length > 0/);
assert.match(player, /Không mất tim và không cộng thêm XP/);
assert.match(player, /recoveredAnswersCount/);
assert.doesNotMatch(
  readFileSync(join(process.cwd(), "lib/exercises/mistake-review.ts"), "utf8"),
  /fetch\(|database|drizzle|localStorage/,
  "Phase 3 mistake review must remain in-session only.",
);

console.log(
  "Section 1 V2 mistake review check passed: only imperfect exercises enter a three-item in-session review with recovered tracking and no persistence.",
);
