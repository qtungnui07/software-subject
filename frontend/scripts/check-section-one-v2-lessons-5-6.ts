import assert from "node:assert/strict";
import { chapterOneNodes } from "@/constants/chapter-one";
import { englishSectionOneExerciseCatalog } from "@/data/exercises/english/section-1";
import { getEnglishLessonDetail } from "@/data/courses/english-lesson-details";
import { validateExerciseCatalog } from "@/lib/exercises/exercise-validator";

for (const lessonId of ["lesson-5", "lesson-6"] as const) {
  const exercises = englishSectionOneExerciseCatalog[lessonId];
  assert.equal(exercises.length, 9);
  assert.deepEqual(
    exercises.map((exercise) => exercise.id),
    Array.from({ length: 9 }, (_, index) => `${lessonId}-exercise-${index + 1}`),
  );
  assert.ok(exercises.every((exercise) => exercise.contentVersion === 2));
  assert.ok(new Set(exercises.map((exercise) => exercise.type)).size >= 6);
  assert.ok(exercises.some((exercise) => exercise.context?.kind === "reading"));
  assert.ok(exercises.some((exercise) => exercise.context?.kind === "listening"));
  assert.ok(exercises.some((exercise) => exercise.type === "short_writing"));
  assert.ok(
    exercises.some(
      (exercise) =>
        exercise.type === "arrange_dialogue" &&
        exercise.lines.length === exercise.correctOrder.length + 1,
    ),
  );
  for (let index = 2; index < exercises.length; index += 1) {
    assert.ok(
      !(
        exercises[index].type === exercises[index - 1].type &&
        exercises[index].type === exercises[index - 2].type
      ),
    );
  }
}

assert.deepEqual(validateExerciseCatalog(englishSectionOneExerciseCatalog), []);
for (const lessonId of ["lesson-1", "lesson-2", "lesson-3", "lesson-4"] as const) {
  const exercises = englishSectionOneExerciseCatalog[lessonId];
  assert.equal(exercises.length, 9);
  assert.ok(exercises.every((exercise) => exercise.contentVersion === 2));
}
const checkpointExercises = englishSectionOneExerciseCatalog["chapter-1-test"];
assert.ok(
  checkpointExercises.length === 8 || checkpointExercises.length === 12,
  "Later checkpoint migrations must remain compatible with Phase 6.",
);
if (checkpointExercises.length === 12) {
  assert.ok(
    checkpointExercises.every((exercise) => exercise.contentVersion === 2),
  );
}

const lessonFiveNode = chapterOneNodes.find((node) => node.id === "lesson-5");
const lessonSixNode = chapterOneNodes.find((node) => node.id === "lesson-6");
assert.deepEqual(
  [lessonFiveNode?.legacyId, lessonFiveNode?.title, lessonFiveNode?.shortTitle, lessonFiveNode?.unlockAfterId, lessonFiveNode?.xp],
  [6, "Bài 5: Lên kế hoạch", "Hẹn gặp", "lesson-4", 35],
);
assert.deepEqual(
  [lessonSixNode?.legacyId, lessonSixNode?.title, lessonSixNode?.shortTitle, lessonSixNode?.unlockAfterId, lessonSixNode?.xp],
  [7, "Bài 6: Nhiệm vụ cuối tuần", "Cuối tuần", "lesson-5", 40],
);
assert.equal(getEnglishLessonDetail("lesson-5")?.estimatedMinutes, 9);
assert.equal(getEnglishLessonDetail("lesson-6")?.estimatedMinutes, 10);

console.log(
  "Section 1 V2 Lesson 5-6 check passed: both A2 production lessons have nine varied activities, stable IDs and rewards, one distractor, updated metadata, while Lessons 1-4 and the checkpoint remain safe.",
);
