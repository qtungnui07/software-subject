import assert from "node:assert/strict";

import { createDefaultCourseProgress } from "@/lib/courses/course-progress";
import { getContinueLearningTarget } from "@/lib/courses/course-navigation";
import {
  applyPlacementUnlock,
  completeCourseNode,
  selectCourseSection,
} from "@/lib/courses/course-unlock-policy";

const initial = createDefaultCourseProgress("english");
assert.equal(getContinueLearningTarget(initial)?.nodeId, "lesson-1");

const afterLesson = completeCourseNode(initial, "lesson-1").progress;
assert.equal(getContinueLearningTarget(afterLesson)?.nodeId, "lesson-2");

let afterThirdLesson = initial;
for (const lessonId of ["lesson-1", "lesson-2", "lesson-3"]) {
  afterThirdLesson = completeCourseNode(afterThirdLesson, lessonId).progress;
}
assert.equal(
  getContinueLearningTarget(afterThirdLesson)?.nodeId,
  "lesson-4",
  "Optional reward chests must not block the next lesson target."
);

const sectionTwoUnlocked = applyPlacementUnlock(
  initial,
  "english-section-2"
);
const sectionTwoSelected = selectCourseSection(
  sectionTwoUnlocked,
  "english-section-2"
).progress;
const target = getContinueLearningTarget(sectionTwoSelected);
assert.equal(target?.sectionId, "english-section-2");
assert.equal(target?.nodeId, "en-s2-c1-lesson-1");
assert.equal(target?.href, "/lesson?id=en-s2-c1-lesson-1");

console.log(
  "Course navigation check passed: continue targets follow the selected section and first incomplete node."
);
