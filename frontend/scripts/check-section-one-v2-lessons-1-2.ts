import assert from "node:assert/strict";

import { chapterOneNodes } from "@/constants/chapter-one";
import { englishSectionOneExerciseCatalog } from "@/data/exercises/english/section-1";
import { getEnglishLessonDetail } from "@/data/courses/english-lesson-details";
import { validateExerciseCatalog } from "@/lib/exercises/exercise-validator";

const assertLessonStructure = (lessonId: "lesson-1" | "lesson-2") => {
  const exercises = englishSectionOneExerciseCatalog[lessonId];

  assert.equal(exercises.length, 9, `${lessonId} must contain nine exercises.`);
  assert.ok(
    exercises.every((exercise) => exercise.lessonId === lessonId),
    `${lessonId} exercise IDs must stay attached to the original lesson.`,
  );
  assert.ok(
    exercises.every((exercise) => exercise.contentVersion === 2),
    `${lessonId} must enable the V2 lesson session.`,
  );
  assert.ok(
    new Set(exercises.map((exercise) => exercise.type)).size >= 5,
    `${lessonId} must use at least five exercise types.`,
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
    exercises.some((exercise) => Boolean(exercise.hint)),
    `${lessonId} needs optional hints for retry support.`,
  );
};

assertLessonStructure("lesson-1");
assertLessonStructure("lesson-2");

const catalogIssues = validateExerciseCatalog(englishSectionOneExerciseCatalog);
assert.deepEqual(catalogIssues, [], "Section 1 exercise catalog must remain valid.");

const lessonOneNode = chapterOneNodes.find((node) => node.id === "lesson-1");
const lessonTwoNode = chapterOneNodes.find((node) => node.id === "lesson-2");
assert.equal(lessonOneNode?.title, "Bài 1: Gặp một người bạn mới");
assert.equal(lessonTwoNode?.title, "Bài 2: Một ngày của tôi");
assert.equal(lessonOneNode?.unlockAfterId, null);
assert.equal(lessonTwoNode?.unlockAfterId, "lesson-1");
assert.equal(lessonOneNode?.href, "/lesson?id=lesson-1");
assert.equal(lessonTwoNode?.href, "/lesson?id=lesson-2");

assert.equal(getEnglishLessonDetail("lesson-1")?.estimatedMinutes, 7);
assert.equal(getEnglishLessonDetail("lesson-2")?.estimatedMinutes, 8);

console.log(
  "Section 1 V2 Lesson 1-2 check passed: both production lessons have nine varied activities, V2 sessions, reading/listening/writing, stable IDs, updated metadata, while later lesson migrations remain compatible.",
);
