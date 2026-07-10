import assert from "node:assert/strict";

import { getCourseNodeAccess } from "@/lib/courses/course-access";
import { createDefaultCourseProgress } from "@/lib/courses/course-progress";
import {
  applyPlacementUnlock,
  completeCourseNode,
} from "@/lib/courses/course-unlock-policy";

const initial = createDefaultCourseProgress("english");
assert.equal(getCourseNodeAccess(initial, "lesson-1").allowed, true);
assert.equal(getCourseNodeAccess(initial, "lesson-2").reason, "locked-node");
assert.equal(
  getCourseNodeAccess(initial, "en-s2-c1-lesson-1").reason,
  "locked-section"
);
assert.equal(getCourseNodeAccess(initial, "unknown-node").reason, "not-found");

const afterLessonOne = completeCourseNode(initial, "lesson-1").progress;
assert.equal(getCourseNodeAccess(afterLessonOne, "lesson-2").allowed, true);

const sectionTwo = applyPlacementUnlock(initial, "english-section-2");
assert.equal(
  getCourseNodeAccess(sectionTwo, "en-s2-c1-lesson-1").allowed,
  true
);
assert.equal(
  getCourseNodeAccess(sectionTwo, "en-s2-c1-lesson-2").reason,
  "locked-node"
);

console.log(
  "Course access check passed: section locks, node prerequisites, unknown ids, and first-node access are enforced."
);
