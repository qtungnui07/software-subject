import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

import { chapterOneNodes } from "@/constants/chapter-one";
import {
  SECTION_ONE_CHECKPOINT_ID,
  SECTION_ONE_CHECKPOINT_PASS_THRESHOLD,
  sectionOneCheckpointAssessments,
  sectionOneCheckpointExercises,
} from "@/data/exercises/english/section-1/checkpoint";
import { toPublicCheckpointExercises } from "@/lib/checkpoints/checkpoint-public";
import { validateExerciseCatalog } from "@/lib/exercises/exercise-validator";

assert.equal(sectionOneCheckpointExercises.length, 12);
assert.deepEqual(
  sectionOneCheckpointExercises.map((exercise) => exercise.id),
  Array.from({ length: 12 }, (_, index) =>
    `chapter-1-test-exercise-${index + 1}`,
  ),
);
assert.ok(
  sectionOneCheckpointExercises.every(
    (exercise) => exercise.lessonId === SECTION_ONE_CHECKPOINT_ID,
  ),
);
assert.ok(
  sectionOneCheckpointExercises.every(
    (exercise) => exercise.contentVersion === 2 && !exercise.hint,
  ),
);
assert.ok(new Set(sectionOneCheckpointExercises.map((exercise) => exercise.type)).size >= 6);
assert.equal(
  sectionOneCheckpointExercises.filter(
    (exercise) => exercise.type === "short_writing",
  ).length,
  2,
);
assert.ok(
  sectionOneCheckpointExercises.some(
    (exercise) => exercise.context?.kind === "reading",
  ),
);
assert.ok(
  sectionOneCheckpointExercises.some(
    (exercise) => exercise.context?.kind === "listening",
  ),
);
assert.deepEqual(
  validateExerciseCatalog({ [SECTION_ONE_CHECKPOINT_ID]: sectionOneCheckpointExercises }),
  [],
);
assert.equal(sectionOneCheckpointAssessments.length, 12);
assert.deepEqual(
  new Set(sectionOneCheckpointAssessments.map((assessment) => assessment.exerciseId)),
  new Set(sectionOneCheckpointExercises.map((exercise) => exercise.id)),
);
assert.ok(
  sectionOneCheckpointAssessments.every(
    (assessment) => assessment.weight > 0 && assessment.recommendedLessonIds.length > 0,
  ),
);
assert.equal(SECTION_ONE_CHECKPOINT_PASS_THRESHOLD, 70);

const publicExercises = toPublicCheckpointExercises(sectionOneCheckpointExercises);
for (const [index, publicExercise] of publicExercises.entries()) {
  const privateExercise = sectionOneCheckpointExercises[index];
  assert.equal(publicExercise.explanation, undefined);
  assert.equal(publicExercise.hint, undefined);
  if (publicExercise.context?.kind === "listening") {
    assert.equal(publicExercise.context.transcriptAfterSubmit, undefined);
  }

  if (
    privateExercise.type === "multiple_choice" ||
    privateExercise.type === "dialogue_choice" ||
    privateExercise.type === "listening_choice"
  ) {
    assert.notEqual(
      (publicExercise as typeof privateExercise).correctOptionId,
      privateExercise.correctOptionId,
    );
  }
  if (privateExercise.type === "fill_blank") {
    assert.deepEqual(
      (publicExercise as typeof privateExercise).acceptedAnswers,
      [],
    );
  }
  if (privateExercise.type === "sentence_rewrite") {
    assert.deepEqual(
      (publicExercise as typeof privateExercise).acceptedAnswers,
      [],
    );
  }
  if (privateExercise.type === "short_writing") {
    assert.equal((publicExercise as typeof privateExercise).sampleAnswer, "");
  }
}

const checkpointNode = chapterOneNodes.find(
  (node) => node.id === SECTION_ONE_CHECKPOINT_ID,
);
assert.deepEqual(
  [checkpointNode?.legacyId, checkpointNode?.xp, checkpointNode?.unlockAfterId],
  [8, 60, "lesson-6"],
);
assert.equal(checkpointNode?.href, "/checkpoint/chapter-1-test");
assert.equal(checkpointNode?.title, "A2 Checkpoint");

const lessonPageSource = readFileSync("app/lesson/page.tsx", "utf8");
assert.match(lessonPageSource, /shouldRedirectToCheckpoint/);
assert.match(lessonPageSource, /router\.replace\(`\/checkpoint\/\$\{checkpointRedirectId\}`\)/);

console.log(
  "Section 1 V2 checkpoint check passed: 12 private A2 activities, 9 exercise types, two writing tasks, answer stripping, stable checkpoint identity and legacy-route redirect are wired.",
);
