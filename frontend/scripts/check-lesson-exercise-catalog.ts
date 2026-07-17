import assert from "node:assert/strict";

import { getCourseNodes } from "@/lib/courses/course-catalog";
import {
  dedicatedExerciseCatalog,
  getExercisesForLesson,
  hasDedicatedExerciseSet,
} from "@/lib/exercises/exercise-catalog";
import { validateExerciseCatalog } from "@/lib/exercises/exercise-validator";

const issues = validateExerciseCatalog(dedicatedExerciseCatalog);
assert.deepEqual(
  issues,
  [],
  issues.map((issue) => `${issue.exerciseId}: ${issue.message}`).join("\n")
);

const lessonOneExercises = getExercisesForLesson("lesson-1");
assert.equal(lessonOneExercises.length, 9);
assert.deepEqual(
  lessonOneExercises.map((exercise) => exercise.id),
  [
    "lesson-1-exercise-1",
    "lesson-1-exercise-2",
    "lesson-1-exercise-3",
    "lesson-1-exercise-4",
    "lesson-1-exercise-5",
    "lesson-1-exercise-6",
    "lesson-1-exercise-7",
    "lesson-1-exercise-8",
    "lesson-1-exercise-9",
  ],
  "Lesson 1 exercise IDs must remain stable."
);

const lessonTwoExercises = getExercisesForLesson("lesson-2");
assert.equal(lessonTwoExercises.length, 9);
assert.ok(
  new Set(lessonTwoExercises.map((exercise) => exercise.type)).size >= 5,
  "Lesson 2 V2 must use at least five exercise types."
);
assert.ok(
  lessonTwoExercises.every((exercise) => exercise.contentVersion === 2),
  "Lesson 2 must use the V2 lesson session."
);

for (const lessonId of ["lesson-3", "lesson-4", "lesson-5", "lesson-6"] as const) {
  const exercises = getExercisesForLesson(lessonId);
  assert.equal(exercises.length, 9, `${lessonId} must contain nine exercises.`);
  assert.ok(
    exercises.every((exercise) => exercise.contentVersion === 2),
    `${lessonId} must use the V2 lesson session.`,
  );
}

const playableNodes = getCourseNodes("english").filter(
  (node) => node.type !== "chest"
);

for (const node of playableNodes) {
  assert.equal(
    hasDedicatedExerciseSet(node.id),
    true,
    `${node.id} must have a dedicated exercise set.`
  );

  const exercises = getExercisesForLesson(node.id);
  assert.ok(exercises.length > 0, `${node.id} must be playable.`);
  assert.equal(
    exercises.every((exercise) => exercise.lessonId === node.id),
    true,
    `${node.id} exercises must map to the requested lesson.`
  );
}

assert.deepEqual(
  getExercisesForLesson("missing-lesson"),
  [],
  "Unknown lessons must not silently reuse another lesson's content."
);

console.log(
  "Lesson exercise catalog check passed: all 19 playable nodes have dedicated content, legacy IDs are preserved, and fallback content is disabled."
);
