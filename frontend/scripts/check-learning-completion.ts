import { englishCourse } from "@/data/courses/english-course";
import { CHECKPOINT_COMPLETION_THRESHOLD, getLearningCompletionPolicy, LESSON_COMPLETION_THRESHOLD, normalizeCompletionAccuracy, } from "../lib/learning/completion-policy";
const assert: (condition: unknown, message: string) => asserts condition = (condition, message) => {
    if (!condition)
        throw new Error(message);
};
const lessonFail = getLearningCompletionPolicy("lesson-1", 59, englishCourse);
const lessonPass = getLearningCompletionPolicy("lesson-1", 60, englishCourse);
const sectionTwoPass = getLearningCompletionPolicy("en-s2-c1-lesson-1", 80, englishCourse);
const sectionThreePass = getLearningCompletionPolicy("en-s3-c1-lesson-1", 90, englishCourse);
const checkpointFail = getLearningCompletionPolicy("chapter-1-test", 69, englishCourse);
const checkpointPass = getLearningCompletionPolicy("chapter-1-test", 70, englishCourse);
assert(LESSON_COMPLETION_THRESHOLD === 60, "Lesson threshold must remain 60%.");
assert(CHECKPOINT_COMPLETION_THRESHOLD === 70, "Checkpoint threshold must remain 70%.");
assert(lessonFail?.passed === false, "Lesson at 59% must fail.");
assert(lessonPass?.passed === true, "Lesson at 60% must pass.");
assert(sectionTwoPass?.passed === true, "Section 2 lessons must use shared completion policy.");
assert(sectionThreePass?.passed === true, "Section 3 lessons must use shared completion policy.");
assert(checkpointFail?.passed === false, "Checkpoint at 69% must fail.");
assert(checkpointPass?.passed === true, "Checkpoint at 70% must pass.");
assert(getLearningCompletionPolicy("chest-1", 100, englishCourse) === null, "Chest must never be completed through the learning completion flow.");
assert(normalizeCompletionAccuracy("88") === 88, "Numeric string accuracy must normalize.");
assert(normalizeCompletionAccuracy(120) === 100, "Accuracy must clamp to 100.");
assert(normalizeCompletionAccuracy("invalid") === null, "Invalid accuracy must be rejected.");
console.log("Learning completion check passed: Section 1-3 lessons, 60/70 thresholds, chest exclusion, and accuracy normalization are valid.");
