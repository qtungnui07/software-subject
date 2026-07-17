import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { englishLessonDetailCatalog } from "@/data/courses/english-lesson-details";
import { englishCourse } from "@/data/courses/english-course";
import { getExercisesForLesson } from "@/lib/exercises/exercise-catalog";
import {
  createDefaultCourseProgress,
  normalizeCourseProgressState,
} from "@/lib/courses/course-progress";
import { buildLessonDetailViewModel } from "@/lib/courses/lesson-detail-view-model";
import { CHECKPOINT_UNLOCK_THRESHOLD } from "@/lib/courses/course-unlock-policy";

const root = process.cwd();
const resolve = (path: string) => join(root, path);
const read = (path: string) => readFileSync(resolve(path), "utf8");

const requiredFiles = [
  "types/lesson-detail.ts",
  "data/courses/english-lesson-details.ts",
  "lib/courses/lesson-detail-view-model.ts",
  "components/lesson/course-lesson-detail.tsx",
  "app/(main)/lesson/[lessonId]/page.tsx",
] as const;

for (const path of requiredFiles) {
  assert.equal(existsSync(resolve(path)), true, `Missing Phase 3 file: ${path}`);
}

assert.equal(
  existsSync(resolve("components/chapter-one-lesson-detail-client.tsx")),
  false,
  "The legacy Section 1 detail component must be removed after the shared page is active.",
);
assert.equal(
  existsSync(resolve("components/course-lesson-detail-bridge.tsx")),
  false,
  "The temporary Section 2-3 bridge must be removed after the shared page is active.",
);

const learningNodes = englishCourse.sections.flatMap((section) =>
  section.chapter.nodes.filter((node) => node.type !== "chest"),
);
const detailIds = Object.keys(englishLessonDetailCatalog).sort();
const learningNodeIds = learningNodes.map((node) => node.id).sort();
assert.deepEqual(
  detailIds,
  learningNodeIds,
  "Every lesson/checkpoint, and only those nodes, must have authored detail content.",
);

const allSectionsProgress = normalizeCourseProgressState({
  ...createDefaultCourseProgress("english"),
  unlockedSectionIds: englishCourse.sections.map((section) => section.id),
  currentSectionId: "english-section-1",
  onboardingStatus: "completed",
  onboardingCompletedAt: new Date().toISOString(),
});

for (const node of learningNodes) {
  const detailContent = englishLessonDetailCatalog[node.id];
  const exercises = getExercisesForLesson(node.id);
  const view = buildLessonDetailViewModel(node.id, allSectionsProgress);

  assert(detailContent, `${node.id} is missing detail content.`);
  assert(view, `${node.id} must build a shared lesson-detail view model.`);
  assert.equal(view.nodeId, node.id);
  assert.equal(view.exerciseCount, exercises.length);
  assert(exercises.length > 0, `${node.id} must use a dedicated exercise set.`);
  assert.equal(view.xp, node.xp);
  assert.equal(view.playerHref?.startsWith("/lesson?id=") ?? false, view.status !== "locked");
  assert(detailContent.objectives.length >= 3, `${node.id} needs at least three objectives.`);
  assert(detailContent.focusSkills.length > 0, `${node.id} needs authored focus skills.`);

  const actualTypes = new Set(exercises.map((exercise) => exercise.type));
  assert.equal(view.exerciseTypes.length, actualTypes.size);

  if (node.type === "checkpoint") {
    assert(view.checkpoint, `${node.id} must include checkpoint detail.`);
    assert.equal(view.checkpoint.passingScore, CHECKPOINT_UNLOCK_THRESHOLD);
  } else {
    assert.equal(view.checkpoint, null);
  }
}

const firstLessonId = "lesson-1";
const completedProgress = normalizeCourseProgressState({
  ...allSectionsProgress,
  completedNodeIds: [firstLessonId],
});
const completedView = buildLessonDetailViewModel(
  firstLessonId,
  completedProgress,
);
assert.equal(completedView?.status, "completed");
assert.equal(completedView?.actionLabel, "Ôn tập lại");

const lockedView = buildLessonDetailViewModel(
  "en-s3-c1-lesson-1",
  createDefaultCourseProgress("english"),
);
assert.equal(lockedView?.status, "locked");
assert.equal(lockedView?.playerHref, null);
assert(lockedView?.lockedReason?.includes("Phần 2: Trung cấp"));

const checkpointProgress = normalizeCourseProgressState({
  ...allSectionsProgress,
  completedNodeIds: ["chapter-1-test"],
  checkpointScores: { "chapter-1-test": 82 },
});
const checkpointView = buildLessonDetailViewModel(
  "chapter-1-test",
  checkpointProgress,
);
assert.equal(checkpointView?.checkpoint?.bestScore, 82);
assert.equal(checkpointView?.checkpoint?.passed, true);
assert.equal(checkpointView?.actionLabel, "Làm lại checkpoint");

const pageSource = read("app/(main)/lesson/[lessonId]/page.tsx");
const componentSource = read("components/lesson/course-lesson-detail.tsx");
const viewModelSource = read("lib/courses/lesson-detail-view-model.ts");
const packageSource = read("package.json");

assert(
  pageSource.includes("buildLessonDetailViewModel") &&
    pageSource.includes("<CourseLessonDetail") &&
    !pageSource.includes("ChapterOneLessonDetailClient") &&
    !pageSource.includes("CourseLessonDetailBridge"),
  "All three sections must render through the same lesson-detail component.",
);
assert(
  pageSource.includes('node.type === "chest"') && pageSource.includes("notFound()"),
  "Unknown nodes and reward chests must not have lesson-detail pages.",
);
assert(
  viewModelSource.includes("getExercisesForLesson") &&
    viewModelSource.includes("exerciseTypes") &&
    viewModelSource.includes("exerciseCount"),
  "Exercise counts and types must come from the real exercise catalog.",
);
assert(
  componentSource.includes("Mục tiêu bài học") &&
    componentSource.includes("Kỹ năng trọng tâm") &&
    componentSource.includes("Dạng bài sẽ gặp") &&
    componentSource.includes("Thông tin checkpoint"),
  "The shared page must expose objectives, real lesson metadata, and checkpoint information.",
);
assert(
  componentSource.includes("detail.playerHref") &&
    componentSource.includes("<Button disabled") &&
    componentSource.includes("detail.lockedReason"),
  "Locked lessons must remain visible but must not start the player.",
);
assert(
  packageSource.includes(
    '"check:lesson-detail-integration": "tsx scripts/check-lesson-detail-integration.ts"',
  ),
  "package.json must expose check:lesson-detail-integration.",
);

console.log(
  "Lesson detail integration check passed: all 19 lessons/checkpoints share one detail page, authored objectives pair with real exercise metadata, locked content cannot start, and checkpoints show real score thresholds.",
);
