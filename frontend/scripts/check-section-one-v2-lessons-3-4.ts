import assert from "node:assert/strict";

import { chapterOneNodes } from "@/constants/chapter-one";
import { englishSectionOneExerciseCatalog } from "@/data/exercises/english/section-1";
import { getEnglishLessonDetail } from "@/data/courses/english-lesson-details";
import { validateExerciseCatalog } from "@/lib/exercises/exercise-validator";

const assertMigratedLesson = (lessonId: "lesson-3" | "lesson-4") => {
  const exercises = englishSectionOneExerciseCatalog[lessonId];

  assert.equal(exercises.length, 9, `${lessonId} must contain nine exercises.`);
  assert.deepEqual(
    exercises.map((exercise) => exercise.id),
    Array.from({ length: 9 }, (_, index) => `${lessonId}-exercise-${index + 1}`),
    `${lessonId} exercise IDs must remain stable and sequential.`,
  );
  assert.ok(
    exercises.every(
      (exercise) =>
        exercise.lessonId === lessonId && exercise.contentVersion === 2,
    ),
    `${lessonId} must stay attached to its stable lesson ID and use V2 sessions.`,
  );
  assert.ok(
    new Set(exercises.map((exercise) => exercise.type)).size >= 6,
    `${lessonId} must use at least six exercise types.`,
  );
  assert.ok(
    exercises.some((exercise) => exercise.context?.kind === "reading"),
    `${lessonId} needs a reading context.`,
  );
  assert.ok(
    exercises.some((exercise) => exercise.context?.kind === "listening"),
    `${lessonId} needs a listening context.`,
  );
  assert.ok(
    exercises.some((exercise) => exercise.type === "short_writing"),
    `${lessonId} needs a short writing task.`,
  );
  assert.ok(
    exercises.some(
      (exercise) =>
        exercise.type === "arrange_dialogue" &&
        exercise.lines.length === exercise.correctOrder.length + 1,
    ),
    `${lessonId} needs exactly one dialogue distractor.`,
  );

  for (let index = 2; index < exercises.length; index += 1) {
    assert.ok(
      !(
        exercises[index].type === exercises[index - 1].type &&
        exercises[index].type === exercises[index - 2].type
      ),
      `${lessonId} cannot repeat one exercise type three times in a row.`,
    );
  }
};

assertMigratedLesson("lesson-3");
assertMigratedLesson("lesson-4");

const issues = validateExerciseCatalog(englishSectionOneExerciseCatalog);
assert.deepEqual(
  issues,
  [],
  issues.map((issue) => `${issue.exerciseId}: ${issue.message}`).join("\n"),
);

for (const lessonId of ["lesson-1", "lesson-2"] as const) {
  const exercises = englishSectionOneExerciseCatalog[lessonId];
  assert.equal(exercises.length, 9, `${lessonId} must remain migrated.`);
  assert.ok(
    exercises.every((exercise) => exercise.contentVersion === 2),
    `${lessonId} must preserve its Phase 4 V2 content.`,
  );
}

for (const lessonId of ["lesson-5", "lesson-6"] as const) {
  const exercises = englishSectionOneExerciseCatalog[lessonId];
  assert.ok(exercises.length === 5 || exercises.length === 9);
  if (exercises.length === 9) {
    assert.ok(exercises.every((exercise) => exercise.contentVersion === 2));
  }
}

const lessonThreeNode = chapterOneNodes.find((node) => node.id === "lesson-3");
const lessonFourNode = chapterOneNodes.find((node) => node.id === "lesson-4");
assert.equal(lessonThreeNode?.title, "Bài 3: Tại quán cà phê");
assert.equal(lessonThreeNode?.shortTitle, "Gọi món");
assert.equal(lessonThreeNode?.unlockAfterId, "lesson-2");
assert.equal(lessonThreeNode?.href, "/lesson?id=lesson-3");
assert.equal(lessonThreeNode?.xp, 30);
assert.equal(lessonFourNode?.title, "Bài 4: Đi quanh thành phố");
assert.equal(lessonFourNode?.shortTitle, "Chỉ đường");
assert.equal(lessonFourNode?.unlockAfterId, "lesson-3");
assert.equal(lessonFourNode?.href, "/lesson?id=lesson-4");
assert.equal(lessonFourNode?.xp, 35);
assert.equal(getEnglishLessonDetail("lesson-3")?.estimatedMinutes, 8);
assert.equal(getEnglishLessonDetail("lesson-4")?.estimatedMinutes, 9);

console.log(
  "Section 1 V2 Lesson 3-4 check passed: both A1+ production lessons have nine varied activities, stable IDs and rewards, one distractor, updated metadata, while earlier and later migrations remain compatible.",
);
