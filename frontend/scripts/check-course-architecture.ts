import { chapterOneNodes } from "@/constants/chapter-one";
import { englishCourse } from "@/data/courses/english-course";
import {
  getCourseById,
  getLearningNodeById,
} from "@/lib/courses/course-catalog";
import { validateCourseDefinition } from "@/lib/courses/course-validator";

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

const result = validateCourseDefinition(englishCourse);

assert(result.valid, `Course validation failed:\n${result.errors.join("\n")}`);
assert(englishCourse.sections.length === 3, "English course must have exactly 3 sections.");
assert(
  englishCourse.sections.every((section) => section.chapter.order === 1),
  "Every MVP section must contain Chapter 1 only."
);

const sectionOne = englishCourse.sections[0];
const sectionTwo = englishCourse.sections[1];
const sectionThree = englishCourse.sections[2];

assert(sectionOne.id === "english-section-1", "Section 1 id changed unexpectedly.");
assert(sectionTwo.id === "english-section-2", "Section 2 id is invalid.");
assert(sectionThree.id === "english-section-3", "Section 3 id is invalid.");
assert(sectionOne.contentStatus === "ready", "Section 1 must stay ready.");
assert(sectionTwo.contentStatus === "ready", "Section 2 content must be ready.");
assert(sectionThree.contentStatus === "ready", "Section 3 content must be ready.");

const legacyNodeIds = chapterOneNodes.map((node) => node.id);
const adaptedNodeIds = sectionOne.chapter.nodes.map((node) => node.id);

assert(
  JSON.stringify(adaptedNodeIds) === JSON.stringify(legacyNodeIds),
  "Section 1 node ids or order changed during adaptation."
);
assert(
  sectionTwo.chapter.nodes.filter((node) => node.type === "lesson").length === 5,
  "Section 2 must contain 5 lessons."
);
assert(
  sectionThree.chapter.nodes.filter((node) => node.type === "lesson").length === 5,
  "Section 3 must contain 5 lessons."
);
assert(
  getCourseById("english-basic")?.id === "english",
  "Legacy english-basic course id must resolve to english."
);
assert(
  getLearningNodeById("lesson-1")?.legacyId === 1,
  "Legacy lesson-1 mapping is missing."
);
assert(
  getLearningNodeById("en-s3-c1-checkpoint")?.type === "checkpoint",
  "Section 3 checkpoint is missing."
);

if (result.warnings.length > 0) {
  console.warn(result.warnings.join("\n"));
}

console.log(
  "Course architecture check passed: 3 sections, legacy Section 1 preserved, Sections 2-3 content-ready."
);
